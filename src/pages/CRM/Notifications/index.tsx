import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  crmNotificationService,
  type CRMNotification,
} from "@/api/crmNotificationService";
import { useAuth } from "@/contexts/AuthContext";
import { useSocket } from "@/contexts/SocketContext";
import { useCRMNotifications } from "@/hooks/useCRMNotifications";
import { Bell, Check, CheckCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const NOTIFICATION_TYPE_LABELS: Record<string, string> = {
  "pending-lead-details": "Update Pending Lead Details",
  "actions-due": "Actions Due",
  "phase-change": "Phase Change",
  "sales-poc-change": "Sales POC Change",
  "action-on-change": "Action On Change",
  "action-due-date-change": "Action Due Date Change",
  "multiple-changes": "Lead Update",
  generic: "Lead Update",
};

const getNotificationTypeLabel = (type?: string): string | null => {
  if (!type) return null;
  return NOTIFICATION_TYPE_LABELS[type] || "Lead Update";
};

function NotificationMessage({
  typeLabel,
  message,
  isRead,
  isAuthorYou,
}: {
  typeLabel: string | null;
  message: string;
  isRead: boolean;
  isAuthorYou: boolean;
}) {
  const textRef = useRef<HTMLParagraphElement | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showToggle, setShowToggle] = useState(false);

  useEffect(() => {
    const el = textRef.current;
    if (!el) return;

    const checkOverflow = () => {
      if (!el) return;
      // When collapsed, detect if content exceeds the 3-line clamp
      if (!isExpanded) {
        setShowToggle(el.scrollHeight > el.clientHeight + 1);
      } else {
        // When expanded, always show the toggle to allow collapsing
        setShowToggle(true);
      }
    };

    // Use rAF to ensure styles are applied before measuring
    const id = requestAnimationFrame(checkOverflow);
    window.addEventListener("resize", checkOverflow);
    return () => {
      cancelAnimationFrame(id);
      window.removeEventListener("resize", checkOverflow);
    };
  }, [message, isExpanded]);

  return (
    <div>
      {typeLabel && (
        <Badge variant="secondary" className="mb-2 uppercase tracking-wide">
          {typeLabel}
        </Badge>
      )}
      <p
        ref={textRef}
        className={cn(
          "text-sm",
          !isRead && "font-medium text-gray-900",
          isRead && "text-gray-700",
          !isExpanded && "line-clamp-3"
        )}
      >
        {isAuthorYou ? (
          <>
            <b>You </b>
            {message}
          </>
        ) : (
          message
        )}
      </p>
      {showToggle && (
        <button
          type="button"
          onClick={() => setIsExpanded((v) => !v)}
          className="mt-1 text-xs text-blue-600 hover:underline"
        >
          {isExpanded ? "Show less" : "Read more"}
        </button>
      )}
    </div>
  );
}

export default function CRMNotificationsPage() {
  const { user } = useAuth();
  const { socket } = useSocket();
  const {
    refresh: refreshUnreadCount,
    decreaseCount,
    resetCount,
  } = useCRMNotifications();
  const [notifications, setNotifications] = useState<CRMNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingRead, setMarkingRead] = useState<string | null>(null);
  const [markingAllRead, setMarkingAllRead] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await crmNotificationService.list({ page, limit: 30 });
      if (response.success) {
        setNotifications(response.data);
        setTotalPages(response.pages);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [page]);

  // Listen for real-time notifications
  useEffect(() => {
    if (socket) {
      const handleNotification = (data: any) => {
        // Add new notification to the top of the list
        setNotifications((prev) => [
          {
            _id: data.id,
            message: data.message,
            leadId: { _id: data.leadId, leadNo: data.leadNo, schoolName: "" },
            leadNo: data.leadNo,
            type: data.type,
            metadata: data.metadata,
            createdBy: { _id: "", name: "", email: "" },
            createdByName: "",
            createdByRole: "",
            readBy: [],
            isRead: false,
            createdAt: data.createdAt,
            updatedAt: data.createdAt,
          },
          ...prev,
        ]);
      };

      socket.on("crm:notification", handleNotification);

      return () => {
        socket.off("crm:notification", handleNotification);
      };
    }
  }, [socket]);

  const handleMarkAsRead = async (id: string) => {
    try {
      setMarkingRead(id);
      // Optimistically update UI
      const notification = notifications.find((n) => n._id === id);
      if (notification && !notification.isRead) {
        decreaseCount();
        setNotifications((prev) =>
          prev.map((n) =>
            n._id === id
              ? {
                  ...n,
                  isRead: true,
                  readBy: [...(n.readBy || []), user?.id || ""],
                }
              : n
          )
        );
      }
      await crmNotificationService.markAsRead(id);
      // Refresh to ensure sync (socket event will also update it)
      refreshUnreadCount();
    } catch (error) {
      console.error("Error marking notification as read:", error);
      // Revert optimistic update on error
      refreshUnreadCount();
    } finally {
      setMarkingRead(null);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      setMarkingAllRead(true);
      // Optimistically update UI
      resetCount();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      await crmNotificationService.markAllAsRead();
      // Refresh to ensure sync (socket event will also update it)
      refreshUnreadCount();
    } catch (error) {
      console.error("Error marking all as read:", error);
      // Revert optimistic update on error
      refreshUnreadCount();
    } finally {
      setMarkingAllRead(false);
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <Bell className="h-6 w-6 text-gray-700" />
          <h1 className="text-2xl font-semibold text-gray-900">
            Notifications
          </h1>
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
              {unreadCount} unread
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <Button
            onClick={handleMarkAllAsRead}
            disabled={markingAllRead}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            {markingAllRead ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCheck className="h-4 w-4" />
            )}
            Mark all as read
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-12">
          <Bell className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No notifications yet</p>
        </div>
      ) : (
        <div className="space-y-1">
          {notifications.map((notification) => {
            const missingFields = Array.isArray(
              ((notification.metadata as { missingFields?: unknown }) || {})
                .missingFields
            )
              ? (
                  notification.metadata as {
                    missingFields?: string[];
                  }
                ).missingFields ?? []
              : [];

            return (
              <div
                key={notification._id}
                className={cn(
                  "flex items-start gap-3 p-3 rounded-lg border transition-colors hover:bg-gray-50",
                  !notification.isRead && "bg-blue-50 border-blue-200"
                )}
              >
                <div className="flex-1 min-w-0">
                  <NotificationMessage
                    typeLabel={getNotificationTypeLabel(notification.type)}
                    message={notification.message}
                    isRead={!!notification.isRead}
                    isAuthorYou={notification.createdBy?._id === user?.id}
                  />
                  {notification.type === "pending-lead-details" &&
                    missingFields.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {missingFields.map((field) => (
                          <Badge
                            key={field}
                            variant="outline"
                            className="bg-white text-xs font-normal"
                          >
                            {field}
                          </Badge>
                        ))}
                      </div>
                    )}
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-500">
                      {new Date(notification.createdAt).toLocaleString(
                        "en-GB",
                        {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )}
                    </span>
                    {notification.leadId && (
                      <Link
                        to={
                          user?.role === "superadmin"
                            ? `/crm/superadmin`
                            : user?.role === "sales-manager"
                            ? `/crm/sales-manager/leads/${notification.leadId._id}/edit`
                            : `/crm/sales-executive/leads/${notification.leadId._id}/edit`
                        }
                        className="text-xs text-blue-600 hover:underline"
                      >
                        View Lead: {notification.leadNo}
                      </Link>
                    )}
                  </div>
                </div>
                {!notification.isRead && (
                  <Button
                    onClick={() => handleMarkAsRead(notification._id)}
                    disabled={markingRead === notification._id}
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    title="Mark as read"
                  >
                    {markingRead === notification._id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Check className="h-4 w-4" />
                    )}
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Previous
          </Button>
          <span className="text-sm text-gray-600">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
