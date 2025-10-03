import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare } from "lucide-react";
import ConversationList from "@/components/Messages/ConversationList";
import MessageList from "@/components/Messages/MessageList";
import MessageInput from "@/components/Messages/MessageInput";
import NewMessageDialog from "@/components/Messages/NewMessageDialog";
import {
  getConversations,
  getMessages,
  sendMessage,
  getOrCreateConversation,
  Conversation,
  Message,
} from "@/api/messageService";
import { toast } from "sonner";

const Messages: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoadingConversations, setIsLoadingConversations] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string>("");

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
    }
  }, [selectedConversationId]);

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
    } catch (error: any) {
      console.error("Error loading messages:", error);
      toast.error(error.response?.data?.message || "Failed to load messages");
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!selectedConversationId) return;

    const selectedConversation = conversations.find(
      (c) => c._id === selectedConversationId
    );

    if (!selectedConversation) return;

    try {
      const response = await sendMessage({
        receiverId: selectedConversation.participant._id,
        content,
      });

      // Add the new message to the list
      setMessages((prev) => [...prev, response.message]);

      // Refresh conversations to update last message
      loadConversations();

      toast.success("Message sent");
    } catch (error: any) {
      console.error("Error sending message:", error);
      toast.error(error.response?.data?.message || "Failed to send message");
    }
  };

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

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MessageSquare className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">Messages</h1>
              <p className="text-sm text-muted-foreground">
                Communicate with your colleagues and students
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {totalUnreadCount > 0 && (
              <Badge variant="default" className="text-sm">
                {totalUnreadCount} unread
              </Badge>
            )}
            <NewMessageDialog onSelectUser={handleSelectUser} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4 h-[calc(100vh-220px)]">
        {/* Conversations List */}
        <Card className="col-span-12 md:col-span-4 flex flex-col h-full">
          <CardHeader className="border-b">
            <CardTitle>Conversations</CardTitle>
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
              <CardHeader className="border-b">
                <div className="flex items-center gap-2">
                  <CardTitle>{selectedConversation.participant.name}</CardTitle>
                  <Badge variant="secondary" className="text-xs">
                    {selectedConversation.participant.role}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {selectedConversation.participant.email}
                </p>
              </CardHeader>
              <CardContent className="flex-1 p-0 overflow-hidden flex flex-col">
                <div className="flex-1 overflow-hidden">
                  <MessageList
                    messages={messages}
                    currentUserId={currentUserId}
                    isLoading={isLoadingMessages}
                  />
                </div>
                <MessageInput onSendMessage={handleSendMessage} />
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

