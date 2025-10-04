import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  Bell,
  AlertCircle,
  Info,
  Calendar,
  BookOpen,
  CheckCircle,
  Clock,
  Filter,
  Search,
  CheckCheck,
} from "lucide-react";
import {
  notificationService,
  type Notification,
  type NotificationFilters,
} from "@/api/notificationService";
import { useAuth } from "@/contexts/AuthContext";
// import { formatDistanceToNow } from "date-fns";

export default function StudentNotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filters, setFilters] = useState<NotificationFilters>({
    page: 1,
    limit: 10,
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  });

  useEffect(() => {
    loadNotifications();
  }, [filters]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const response = await notificationService.getStudentNotifications(
        filters
      );
      setNotifications(response.data.notifications);
      setUnreadCount(response.data.unreadCount);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error("Error loading notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await notificationService.markAsRead(notificationId);
      // Update local state
      setNotifications((prev) =>
        prev.map((notification) =>
          notification._id === notificationId
            ? {
                ...notification,
                readBy: [...notification.readBy, user?.id || ""],
              }
            : notification
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setUnreadCount(0);
      loadNotifications();
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  const getNotificationIcon = (type: string, priority: string) => {
    const iconClass =
      priority === "urgent"
        ? "text-red-500"
        : priority === "high"
        ? "text-orange-500"
        : priority === "medium"
        ? "text-blue-500"
        : "text-gray-500";

    switch (type) {
      case "assessment":
        return <BookOpen className={`h-5 w-5 ${iconClass}`} />;
      case "announcement":
        return <Bell className={`h-5 w-5 ${iconClass}`} />;
      case "reminder":
        return <Clock className={`h-5 w-5 ${iconClass}`} />;
      case "system":
        return <AlertCircle className={`h-5 w-5 ${iconClass}`} />;
      default:
        return <Info className={`h-5 w-5 ${iconClass}`} />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-800 border-red-200";
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "medium":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "low":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const isNotificationRead = (notification: Notification) => {
    return notification.readBy.includes(user?.id || "");
  };

  return (
    <div className="space-y-6 px-8 py-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Notifications</h1>
          <p className="text-muted-foreground">
            Stay updated with the latest announcements and assessments
          </p>
        </div>
        {unreadCount > 0 && (
          <Button onClick={markAllAsRead} variant="outline" className="gap-2">
            <CheckCheck className="h-4 w-4" />
            Mark All as Read ({unreadCount})
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Type</label>
              <Select
                value={filters.type || "all"}
                onValueChange={(value) =>
                  setFilters((prev) => ({
                    ...prev,
                    type: value === "all" ? undefined : value,
                    page: 1,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  <SelectItem value="assessment">Assessment</SelectItem>
                  <SelectItem value="announcement">Announcement</SelectItem>
                  <SelectItem value="reminder">Reminder</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Priority</label>
              <Select
                value={filters.priority || "all"}
                onValueChange={(value) =>
                  setFilters((prev) => ({
                    ...prev,
                    priority: value === "all" ? undefined : value,
                    page: 1,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All priorities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All priorities</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select
                value={
                  filters.isRead === undefined
                    ? "all"
                    : filters.isRead.toString()
                }
                onValueChange={(value) =>
                  setFilters((prev) => ({
                    ...prev,
                    isRead: value === "all" ? undefined : value === "true",
                    page: 1,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All status</SelectItem>
                  <SelectItem value="false">Unread</SelectItem>
                  <SelectItem value="true">Read</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search notifications..."
                  className="pl-10"
                  onChange={() => {
                    // Implement search functionality
                  }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notifications List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications ({pagination.totalItems})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-8">
              <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No notifications</h3>
              <p className="text-muted-foreground">
                You don't have any notifications yet.
              </p>
            </div>
          ) : (
            <ScrollArea className="h-[600px]">
              <div className="space-y-4">
                {notifications.map((notification) => (
                  <Card
                    key={notification._id}
                    className={`transition-all hover:shadow-md ${
                      !isNotificationRead(notification)
                        ? "border-l-4 border-l-blue-500 bg-blue-50/50"
                        : "opacity-75"
                    }`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 mt-1">
                          {getNotificationIcon(
                            notification.type,
                            notification.priority
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg mb-1">
                                {notification.title}
                              </h3>
                              <p className="text-muted-foreground mb-3">
                                {notification.message}
                              </p>

                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-4 w-4" />
                                  {new Date(
                                    notification.createdAt
                                  ).toLocaleDateString()}
                                </span>
                                <span>by {notification.sentBy.name}</span>
                                {notification.relatedAssessment && (
                                  <Badge variant="outline" className="text-xs">
                                    Assessment:{" "}
                                    {notification.relatedAssessment.title}
                                  </Badge>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <Badge
                                className={getPriorityColor(
                                  notification.priority
                                )}
                              >
                                {notification.priority}
                              </Badge>

                              {!isNotificationRead(notification) && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => markAsRead(notification._id)}
                                  className="gap-1"
                                >
                                  <CheckCircle className="h-4 w-4" />
                                  Mark as Read
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setFilters((prev) => ({ ...prev, page: prev.page! - 1 }))
            }
            disabled={pagination.currentPage === 1}
          >
            Previous
          </Button>

          <span className="text-sm text-muted-foreground">
            Page {pagination.currentPage} of {pagination.totalPages}
          </span>

          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setFilters((prev) => ({ ...prev, page: prev.page! + 1 }))
            }
            disabled={pagination.currentPage === pagination.totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
