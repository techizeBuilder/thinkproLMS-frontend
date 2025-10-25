import * as React from "react";
import { cn } from "@/lib/utils";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarNav,
  SidebarNavItem,
  SidebarTitle,
  SidebarToggle,
  SidebarGroup,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/collapsible-sidebar";
import {
  HomeIcon,
  User,
  Award,
  FolderOpen,
  ClipboardList,
  MessageSquare,
} from "lucide-react";
import { LogoutButton } from "@/components/ui/logout-button";
import { NotificationBell } from "@/components/ui/notification-bell";
import { Badge } from "@/components/ui/badge";
import { useUnreadMessageCount } from "@/hooks/useUnreadMessageCount";

interface StudentSidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function StudentSidebar({ className }: StudentSidebarProps) {
  const { isCollapsed } = useSidebar()
  const unreadCount = useUnreadMessageCount();

  return (
    <Sidebar className={cn("", className)}>
      <SidebarHeader>
        <div className="flex items-center gap-2">
          <img 
            src="/fancy-logo.jpg" 
            alt="ThinkPro Logo" 
            className="h-8 w-8 object-contain"
          />
          <SidebarTitle>Student Portal</SidebarTitle>
        </div>
        <SidebarToggle />
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup label="Dashboard">
          <SidebarNav>
            <SidebarNavItem to="/student" icon={HomeIcon}>
              Dashboard
            </SidebarNavItem>
          </SidebarNav>
        </SidebarGroup>

        <SidebarGroup label="Communication">
          <SidebarNav>
            <SidebarNavItem to="/student/messages" icon={MessageSquare}>
              <div className="flex items-center justify-between w-full">
                <span>Messages</span>
                {unreadCount > 0 && !isCollapsed && (
                  <Badge variant="default" className="ml-auto text-xs px-1.5 py-0 h-5">
                    {unreadCount}
                  </Badge>
                )}
              </div>
            </SidebarNavItem>
          </SidebarNav>
        </SidebarGroup>

        <SidebarGroup label="Learning">
          <SidebarNav>
            <SidebarNavItem to="/student/resources" icon={FolderOpen}>
              Resources
            </SidebarNavItem>
            <SidebarNavItem to="/student/assessments" icon={ClipboardList}>
              Assessments
            </SidebarNavItem>
            <SidebarNavItem to="/student/notifications" icon={NotificationBell}>
              Notifications
            </SidebarNavItem>
            <SidebarNavItem to="/student/certificates" icon={Award}>
              Certificates
            </SidebarNavItem>
          </SidebarNav>
        </SidebarGroup>

        <SidebarGroup label="Account">
          <SidebarNav>
            <SidebarNavItem to="/student/profile" icon={User}>
              Profile
            </SidebarNavItem>
          </SidebarNav>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <div className="space-y-1">
          {!isCollapsed ? (
            <LogoutButton
              variant="ghost"
              className="w-full justify-start text-sm"
              isCollapsed={false}
            />
          ) : (
            <LogoutButton
              variant="ghost"
              size="icon"
              className="w-full"
              isCollapsed={true}
            />
          )}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
