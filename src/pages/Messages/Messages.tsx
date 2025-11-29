import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageSquare, Wifi, WifiOff, Menu, ArrowLeft } from "lucide-react";
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
  const [selectedConversationId, setSelectedConversationId] = useState<
    string | null
  >(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoadingConversations, setIsLoadingConversations] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [isTyping, setIsTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(
    null
  );
  const [showConversationsList, setShowConversationsList] = useState(true);

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

  // Handle window resize to adjust mobile/tablet layout
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        // Desktop: always show conversations list
        setShowConversationsList(true);
      } else {
        // Mobile/Tablet: show conversations list only if no conversation is selected
        if (!selectedConversationId) {
          setShowConversationsList(true);
        }
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize(); // Call once on mount

    return () => window.removeEventListener("resize", handleResize);
  }, [selectedConversationId]);

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
    const handleNewMessage = (data: {
      message: Message;
      conversationId: string;
    }) => {
      // Add message to list if we're viewing this conversation
      if (data.conversationId === selectedConversationId) {
        setMessages((prev) => {
          // Avoid duplicates
          if (prev.some((m) => m._id === data.message._id)) {
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
    const handleTypingUpdate = (data: {
      conversationId: string;
      userId: string;
      isTyping: boolean;
    }) => {
      if (
        data.conversationId === selectedConversationId &&
        data.userId !== currentUserId
      ) {
        setIsTyping(data.isTyping);
      }
    };

    // Handle message read status
    const handleMessageRead = (data: {
      conversationId: string;
      messageIds: string[];
    }) => {
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
      toast.error(
        error.response?.data?.message || "Failed to load conversations"
      );
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

  const handleSendMessage = useCallback(
    (content: string) => {
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
    },
    [selectedConversationId, conversations, socketSendMessage, stopTyping]
  );

  const handleTyping = useCallback(
    (_content: string) => {
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
        stopTyping(
          selectedConversationId,
          selectedConversation.participant._id
        );
      }, 2000);

      setTypingTimeout(timeout);
    },
    [
      selectedConversationId,
      conversations,
      typingTimeout,
      startTyping,
      stopTyping,
    ]
  );

  const handleSelectUser = async (userId: string) => {
    try {
      const response = await getOrCreateConversation(userId);

      // Reload conversations
      await loadConversations();

      // Select the conversation
      setSelectedConversationId(response.conversation._id);

      // On mobile, hide conversations list when a conversation is selected
      if (window.innerWidth < 1024) {
        setShowConversationsList(false);
      }
    } catch (error: any) {
      console.error("Error creating conversation:", error);
      toast.error(
        error.response?.data?.message || "Failed to create conversation"
      );
    }
  };

  const handleSelectConversation = (conversationId: string) => {
    setSelectedConversationId(conversationId);

    // On mobile, hide conversations list when a conversation is selected
    if (window.innerWidth < 1024) {
      setShowConversationsList(false);
    }
  };

  const handleBackToConversations = () => {
    setShowConversationsList(true);
    setSelectedConversationId(null);
  };

  const toggleConversationsList = () => {
    setShowConversationsList(!showConversationsList);
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
    <div className="h-[calc(100vh-80px)] flex flex-col px-3 sm:px-4 max-w-7xl mx-auto overflow-hidden">
      {/* Header */}
      <div className="mb-2 sm:mb-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          {/* Mobile menu button - only visible on small screens */}
          <Button
            variant="outline"
            size="sm"
            className="lg:hidden h-8 w-8 p-0"
            onClick={toggleConversationsList}>
            <Menu className="h-3 w-3" />
          </Button>
          <h1 className="text-xl sm:text-2xl font-bold">Messages</h1>
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          {isConnected ? (
            <Badge variant="outline" className="gap-1 text-xs sm:text-sm">
              <Wifi className="h-3 w-3" />
              <span className="hidden sm:inline">Online</span>
            </Badge>
          ) : (
            <Badge variant="destructive" className="gap-1 text-xs sm:text-sm">
              <WifiOff className="h-3 w-3" />
              <span className="hidden sm:inline">Offline</span>
            </Badge>
          )}
          {totalUnreadCount > 0 && (
            <Badge variant="default" className="text-xs sm:text-sm">
              {totalUnreadCount} unread
            </Badge>
          )}
          <NewMessageDialog onSelectUser={handleSelectUser} />
        </div>
      </div>

      <div className="flex flex-1 gap-2 sm:gap-3 relative overflow-hidden min-h-0">
        {/* Mobile overlay backdrop */}
        {showConversationsList && (
          <div
            className="lg:hidden fixed inset-0 bg-black/50 z-40"
            onClick={() => setShowConversationsList(false)}
          />
        )}

        {/* Conversations List - Desktop: always visible, Mobile: conditional with overlay */}
        <div
          className={`${
            showConversationsList ? "block" : "hidden"
          } lg:block w-full lg:w-1/3 relative z-50 lg:z-auto h-full`}>
          <Card className="flex flex-col h-full overflow-hidden">
            <CardHeader className="border-b py-2 sm:py-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base sm:text-lg">
                  Conversations
                </CardTitle>
                {/* Mobile close button */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="lg:hidden h-8 w-8 p-0"
                  onClick={() => setShowConversationsList(false)}>
                  <ArrowLeft className="h-3 w-3" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="flex-1 p-0 overflow-hidden">
              <ConversationList
                conversations={conversations}
                selectedConversationId={selectedConversationId}
                onSelectConversation={handleSelectConversation}
                isLoading={isLoadingConversations}
              />
            </CardContent>
          </Card>
        </div>

        {/* Messages Area - Desktop: 2/3 width, Mobile: full width */}
        <div
          className={`${
            !showConversationsList ? "block" : "hidden"
          } lg:block w-full lg:w-2/3 h-full`}>
          <Card className="flex flex-col h-full overflow-hidden">
            {selectedConversation ? (
              <>
                <CardHeader className="border-b py-2 sm:py-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      {/* Mobile back button */}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="lg:hidden flex-shrink-0 h-8 w-8 p-0"
                        onClick={handleBackToConversations}>
                        <ArrowLeft className="h-3 w-3" />
                      </Button>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                          <CardTitle className="text-base sm:text-lg truncate">
                            {selectedConversation.participant.name}
                          </CardTitle>
                          <Badge
                            variant="secondary"
                            className="text-xs flex-shrink-0">
                            {selectedConversation.participant.role}
                          </Badge>
                          {selectedConversation.participant.role === "mentor" &&
                            selectedConversation.participant.school
                              ?.schoolCount &&
                            selectedConversation.participant.school
                              .schoolCount > 1 && (
                              <Badge
                                variant="outline"
                                className="text-xs flex-shrink-0 bg-blue-50 text-blue-700 border-blue-200">
                                {
                                  selectedConversation.participant.school
                                    .schoolCount
                                }{" "}
                                schools
                              </Badge>
                            )}
                          {isParticipantOnline && (
                            <Badge
                              variant="outline"
                              className="gap-1 text-xs flex-shrink-0">
                              <div className="h-2 w-2 rounded-full bg-green-500" />
                              <span className="hidden sm:inline">Online</span>
                            </Badge>
                          )}
                        </div>
                        <div className="flex flex-col gap-0.5 mt-1">
                          <p className="text-xs text-muted-foreground truncate">
                            {selectedConversation.participant.email}
                          </p>
                          {selectedConversation.participant.school && (
                            <p className="text-xs text-muted-foreground truncate">
                              🏫 {selectedConversation.participant.school.name}{" "}
                              - {selectedConversation.participant.school.city},{" "}
                              {selectedConversation.participant.school.state}
                            </p>
                          )}
                        </div>
                      </div>
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
                  </div>
                  {isTyping && (
                    <p className="px-2 sm:px-4 py-2 text-xs sm:text-sm text-muted-foreground italic bg-background border-t relative z-10">
                      {selectedConversation.participant.name} is typing...
                    </p>
                  )}
                  <MessageInput
                    onSendMessage={handleSendMessage}
                    onTyping={handleTyping}
                  />
                </CardContent>
              </>
            ) : (
              <CardContent className="flex-1 flex items-center justify-center p-4">
                <div className="text-center">
                  <MessageSquare className="h-8 w-8 sm:h-12 sm:w-12 text-muted-foreground mx-auto mb-3 sm:mb-4" />
                  <p className="text-base sm:text-lg font-medium mb-2">
                    Select a conversation
                  </p>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Choose a conversation from the list or start a new one
                  </p>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Messages;
