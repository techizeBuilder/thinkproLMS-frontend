import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Wifi, WifiOff } from "lucide-react";
import ConversationList from "@/components/Messages/ConversationList";
import MessageList from "@/components/Messages/MessageList";
import MessageInput from "@/components/Messages/MessageInput";
import NewMessageDialog from "@/components/Messages/NewMessageDialog";
import {
  getConversations,
  getMessages,
  getOrCreateConversation,
  type Conversation,
  type Message,
} from "@/api/messageService";
import { useSocket } from "@/contexts/SocketContext";
import { toast } from "sonner";

const Messages: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoadingConversations, setIsLoadingConversations] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [isTyping, setIsTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);

  const { 
    socket, 
    isConnected, 
    onlineUsers,
    sendMessage: socketSendMessage,
    joinConversation,
    leaveConversation,
    startTyping,
    stopTyping,
    markMessagesAsRead,
  } = useSocket();

  useEffect(() => {
    // Get current user ID from localStorage
    const user = localStorage.getItem("user");
    if (user) {
      const userData = JSON.parse(user);
      setCurrentUserId(userData.id);
    }

    loadConversations();
  }, []);

  useEffect(() => {
    if (selectedConversationId) {
      loadMessages(selectedConversationId);
      joinConversation(selectedConversationId);

      return () => {
        leaveConversation(selectedConversationId);
      };
    }
  }, [selectedConversationId, joinConversation, leaveConversation]);

  // Socket event listeners
  useEffect(() => {
    if (!socket) return;

    // Handle new messages
    const handleNewMessage = (data: { message: Message; conversationId: string }) => {
      // Add message to list if we're viewing this conversation
      if (data.conversationId === selectedConversationId) {
        setMessages((prev) => {
          // Avoid duplicates
          if (prev.some(m => m._id === data.message._id)) {
            return prev;
          }
          return [...prev, data.message];
        });

        // Mark as read if we're the receiver
        if (data.message.receiver._id === currentUserId) {
          markMessagesAsRead(data.conversationId, [data.message._id]);
        }
      }

      // Refresh conversations list
      loadConversations();
    };

    // Handle message notifications
    const handleMessageNotification = () => {
      // Don't show toast if user is already viewing this conversation
      // Toast should only show when user is on other pages
      loadConversations();
    };

    // Handle conversation updates
    const handleConversationUpdate = () => {
      loadConversations();
    };

    // Handle typing updates
    const handleTypingUpdate = (data: { conversationId: string; userId: string; isTyping: boolean }) => {
      if (data.conversationId === selectedConversationId && data.userId !== currentUserId) {
        setIsTyping(data.isTyping);
      }
    };

    // Handle message read status
    const handleMessageRead = (data: { conversationId: string; messageIds: string[] }) => {
      if (data.conversationId === selectedConversationId) {
        setMessages((prev) =>
          prev.map((msg) =>
            data.messageIds.includes(msg._id)
              ? { ...msg, isRead: true, readAt: new Date().toISOString() }
              : msg
          )
        );
      }
    };

    socket.on("message:new", handleNewMessage);
    socket.on("message:notification", handleMessageNotification);
    socket.on("conversation:updated", handleConversationUpdate);
    socket.on("typing:update", handleTypingUpdate);
    socket.on("message:read", handleMessageRead);

    return () => {
      socket.off("message:new", handleNewMessage);
      socket.off("message:notification", handleMessageNotification);
      socket.off("conversation:updated", handleConversationUpdate);
      socket.off("typing:update", handleTypingUpdate);
      socket.off("message:read", handleMessageRead);
    };
  }, [socket, selectedConversationId, currentUserId, markMessagesAsRead]);

  const loadConversations = async () => {
    try {
      setIsLoadingConversations(true);
      const response = await getConversations();
      setConversations(response.conversations);
    } catch (error: any) {
      console.error("Error loading conversations:", error);
      toast.error(error.response?.data?.message || "Failed to load conversations");
    } finally {
      setIsLoadingConversations(false);
    }
  };

  const loadMessages = async (conversationId: string) => {
    try {
      setIsLoadingMessages(true);
      const response = await getMessages(conversationId);
      setMessages(response.messages);

      // Mark unread messages as read
      const unreadMessages = response.messages.filter(
        (msg: Message) => msg.receiver._id === currentUserId && !msg.isRead
      );
      if (unreadMessages.length > 0) {
        markMessagesAsRead(
          conversationId,
          unreadMessages.map((msg: Message) => msg._id)
        );
      }
    } catch (error: any) {
      console.error("Error loading messages:", error);
      toast.error(error.response?.data?.message || "Failed to load messages");
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const handleSendMessage = useCallback((content: string) => {
    if (!selectedConversationId) return;

    const selectedConversation = conversations.find(
      (c) => c._id === selectedConversationId
    );

    if (!selectedConversation) return;

    // Send via socket for real-time delivery
    socketSendMessage({
      conversationId: selectedConversationId,
      receiverId: selectedConversation.participant._id,
      content,
    });

    // Stop typing indicator
    stopTyping(selectedConversationId, selectedConversation.participant._id);
  }, [selectedConversationId, conversations, socketSendMessage, stopTyping]);

  const handleTyping = useCallback((_content: string) => {
    if (!selectedConversationId) return;

    const selectedConversation = conversations.find(
      (c) => c._id === selectedConversationId
    );

    if (!selectedConversation) return;

    // Clear existing timeout
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }

    // Start typing
    startTyping(selectedConversationId, selectedConversation.participant._id);

    // Set timeout to stop typing after 2 seconds of inactivity
    const timeout = setTimeout(() => {
      stopTyping(selectedConversationId, selectedConversation.participant._id);
    }, 2000);

    setTypingTimeout(timeout);
  }, [selectedConversationId, conversations, typingTimeout, startTyping, stopTyping]);

  const handleSelectUser = async (userId: string) => {
    try {
      const response = await getOrCreateConversation(userId);
      
      // Reload conversations
      await loadConversations();
      
      // Select the conversation
      setSelectedConversationId(response.conversation._id);
    } catch (error: any) {
      console.error("Error creating conversation:", error);
      toast.error(error.response?.data?.message || "Failed to create conversation");
    }
  };

  const selectedConversation = conversations.find(
    (c) => c._id === selectedConversationId
  );

  const totalUnreadCount = conversations.reduce(
    (sum, conv) => sum + conv.unreadCount,
    0
  );

  // Check if selected participant is online
  const isParticipantOnline = selectedConversation
    ? onlineUsers.includes(selectedConversation.participant._id)
    : false;

  return (
    <div className="container mx-auto p-3 max-w-7xl">
      <div className="mb-3 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Messages</h1>
        <div className="flex items-center gap-2">
          {isConnected ? (
            <Badge variant="outline" className="gap-1">
              <Wifi className="h-3 w-3" />
              Online
            </Badge>
          ) : (
            <Badge variant="destructive" className="gap-1">
              <WifiOff className="h-3 w-3" />
              Offline
            </Badge>
          )}
          {totalUnreadCount > 0 && (
            <Badge variant="default" className="text-sm">
              {totalUnreadCount} unread
            </Badge>
          )}
          <NewMessageDialog onSelectUser={handleSelectUser} />
        </div>
      </div>

      <div className="grid grid-cols-12 gap-3 h-[calc(100vh-140px)]">
        {/* Conversations List */}
        <Card className="col-span-12 md:col-span-4 flex flex-col h-full">
          <CardHeader className="border-b py-3">
            <CardTitle className="text-lg">Conversations</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 p-0 overflow-hidden">
            <ConversationList
              conversations={conversations}
              selectedConversationId={selectedConversationId}
              onSelectConversation={setSelectedConversationId}
              isLoading={isLoadingConversations}
            />
          </CardContent>
        </Card>

        {/* Messages Area */}
        <Card className="col-span-12 md:col-span-8 flex flex-col h-full">
          {selectedConversation ? (
            <>
              <CardHeader className="border-b py-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg">{selectedConversation.participant.name}</CardTitle>
                      <Badge variant="secondary" className="text-xs">
                        {selectedConversation.participant.role}
                      </Badge>
                      {isParticipantOnline && (
                        <Badge variant="outline" className="gap-1 text-xs">
                          <div className="h-2 w-2 rounded-full bg-green-500" />
                          Online
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {selectedConversation.participant.email}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1 p-0 overflow-hidden flex flex-col">
                <div className="flex-1 overflow-hidden">
                  <MessageList
                    messages={messages}
                    currentUserId={currentUserId}
                    isLoading={isLoadingMessages}
                  />
                  {isTyping && (
                    <div className="px-4 py-2 text-sm text-muted-foreground italic">
                      {selectedConversation.participant.name} is typing...
                    </div>
                  )}
                </div>
                <MessageInput 
                  onSendMessage={handleSendMessage}
                  onTyping={handleTyping}
                />
              </CardContent>
            </>
          ) : (
            <CardContent className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-medium mb-2">Select a conversation</p>
                <p className="text-sm text-muted-foreground">
                  Choose a conversation from the list or start a new one
                </p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Messages;
