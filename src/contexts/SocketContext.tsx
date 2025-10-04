import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import { API_URL } from "@/api/axiosInstance";

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  onlineUsers: string[];
  sendMessage: (data: {
    conversationId: string;
    receiverId: string;
    content: string;
  }) => void;
  joinConversation: (conversationId: string) => void;
  leaveConversation: (conversationId: string) => void;
  startTyping: (conversationId: string, receiverId: string) => void;
  stopTyping: (conversationId: string, receiverId: string) => void;
  markMessagesAsRead: (conversationId: string, messageIds: string[]) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};

interface SocketProviderProps {
  children: React.ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    
    if (!token) {
      return;
    }

    // Extract base URL (remove /api if present)
    const baseUrl = API_URL.replace("/api", "");

    // Connect to socket server
    const newSocket = io(baseUrl, {
      auth: {
        token,
      },
      transports: ["websocket", "polling"],
    });

    newSocket.on("connect", () => {
      console.log("✅ Connected to socket server");
      setIsConnected(true);
    });

    newSocket.on("disconnect", () => {
      console.log("❌ Disconnected from socket server");
      setIsConnected(false);
    });

    newSocket.on("users:online", (data: { userIds: string[] }) => {
      setOnlineUsers(data.userIds);
    });

    newSocket.on("user:online", (data: { userId: string }) => {
      setOnlineUsers((prev) => {
        if (!prev.includes(data.userId)) {
          return [...prev, data.userId];
        }
        return prev;
      });
    });

    newSocket.on("user:offline", (data: { userId: string }) => {
      setOnlineUsers((prev) => prev.filter((id) => id !== data.userId));
    });

    newSocket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  const sendMessage = useCallback((data: {
    conversationId: string;
    receiverId: string;
    content: string;
  }) => {
    if (socket && isConnected) {
      socket.emit("message:send", data);
    }
  }, [socket, isConnected]);

  const joinConversation = useCallback((conversationId: string) => {
    if (socket && isConnected) {
      socket.emit("conversation:join", { conversationId });
    }
  }, [socket, isConnected]);

  const leaveConversation = useCallback((conversationId: string) => {
    if (socket && isConnected) {
      socket.emit("conversation:leave", { conversationId });
    }
  }, [socket, isConnected]);

  const startTyping = useCallback((conversationId: string, receiverId: string) => {
    if (socket && isConnected) {
      socket.emit("typing:start", { conversationId, receiverId });
    }
  }, [socket, isConnected]);

  const stopTyping = useCallback((conversationId: string, receiverId: string) => {
    if (socket && isConnected) {
      socket.emit("typing:stop", { conversationId, receiverId });
    }
  }, [socket, isConnected]);

  const markMessagesAsRead = useCallback((conversationId: string, messageIds: string[]) => {
    if (socket && isConnected) {
      socket.emit("message:read", { conversationId, messageIds });
    }
  }, [socket, isConnected]);

  const value: SocketContextType = {
    socket,
    isConnected,
    onlineUsers,
    sendMessage,
    joinConversation,
    leaveConversation,
    startTyping,
    stopTyping,
    markMessagesAsRead,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

