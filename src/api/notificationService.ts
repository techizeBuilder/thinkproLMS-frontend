import axiosInstance from "./axiosInstance";

export interface Notification {
  _id: string;
  title: string;
  message: string;
  type: "assessment" | "announcement" | "reminder" | "system";
  priority: "low" | "medium" | "high" | "urgent";
  createdAt: string;
  updatedAt: string;
  sentBy: {
    _id: string;
    name: string;
    email: string;
    role: string;
  };
  relatedAssessment?: {
    _id: string;
    title: string;
    startDate: string;
    endDate: string;
  };
  readBy: string[];
  readCount: number;
  isActive: boolean;
}

export interface NotificationFilters {
  page?: number;
  limit?: number;
  type?: string;
  priority?: string;
  isRead?: boolean;
}

export interface NotificationResponse {
  success: boolean;
  data: {
    notifications: Notification[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
    };
    unreadCount: number;
  };
}

export interface NotificationStats {
  success: boolean;
  data: {
    total: number;
    unread: number;
    byType: Array<{
      _id: string;
      count: number;
      unreadCount: number;
    }>;
  };
}

export const notificationService = {
  // Get student notifications
  getStudentNotifications: async (
    filters: NotificationFilters = {}
  ): Promise<NotificationResponse> => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== "") {
        params.append(key, value.toString());
      }
    });

    const response = await axiosInstance.get(
      `/notifications/student?${params.toString()}`
    );
    return response.data;
  },

  // Mark notification as read
  markAsRead: async (notificationId: string) => {
    const response = await axiosInstance.post(
      `/notifications/student/${notificationId}/read`
    );
    return response.data;
  },

  // Mark all notifications as read
  markAllAsRead: async () => {
    const response = await axiosInstance.post(
      "/notifications/student/mark-all-read"
    );
    return response.data;
  },

  // Get notification statistics
  getStats: async (): Promise<NotificationStats> => {
    const response = await axiosInstance.get("/notifications/student/stats");
    return response.data;
  },

  // Create notification (for mentors/admins)
  createNotification: async (data: {
    title: string;
    message: string;
    type: "assessment" | "announcement" | "reminder" | "system";
    priority?: "low" | "medium" | "high" | "urgent";
    targetAudience: Array<{
      grade: number;
      sections: string[];
      school: string;
    }>;
    scheduledFor?: string;
    expiresAt?: string;
  }) => {
    const response = await axiosInstance.post("/notifications/create", data);
    return response.data;
  },
};
