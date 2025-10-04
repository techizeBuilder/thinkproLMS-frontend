import { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { notificationService } from "@/api/notificationService";

interface NotificationBellProps {
  className?: string;
}

export function NotificationBell({ className }: NotificationBellProps) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [, setLoading] = useState(false);

  useEffect(() => {
    loadUnreadCount();
  }, []);

  const loadUnreadCount = async () => {
    try {
      setLoading(true);
      const response = await notificationService.getStudentNotifications({ limit: 1 });
      setUnreadCount(response.data.unreadCount);
    } catch (error) {
      console.error("Error loading unread count:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <Bell className="h-5 w-5" />
      {unreadCount > 0 && (
        <Badge 
          variant="destructive" 
          className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
        >
          {unreadCount > 99 ? "99+" : unreadCount}
        </Badge>
      )}
    </div>
  );
}
