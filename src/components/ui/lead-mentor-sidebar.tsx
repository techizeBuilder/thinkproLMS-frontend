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
  UserCheck,
  Users,
  GraduationCap,
  BookOpen,
  Layers,
  FileText,
  Award,
  Calendar,
  BarChart3,
  MessageSquare,
  Bell,
  Building2,
} from "lucide-react";
import { LogoutButton } from "@/components/ui/logout-button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useUnreadMessageCount } from "@/hooks/useUnreadMessageCount";
import { useNotifications } from "@/contexts/NotificationContext";

interface LeadMentorSidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function LeadMentorSidebar({ className }: LeadMentorSidebarProps) {
  const { isCollapsed } = useSidebar();
  const { user } = useAuth();
  const unreadCount = useUnreadMessageCount();
  const { counts } = useNotifications();

  // Check if user has permission to manage modules and resources
  // const hasModulePermission =
  //   user?.role === "superadmin" || user?.permissions?.includes("add_modules");
  // const hasResourcePermission =
  //   user?.role === "superadmin" || user?.permissions?.includes("add_resources");

  return (
    <Sidebar className={cn("h-screen", className)}>
      <SidebarHeader>
        <div className="flex items-center gap-2">
          <img
            src="/fancy-logo.jpg"
            alt="ThinkPro Logo"
            className="h-8 w-8 object-contain"
          />
          <SidebarTitle>ThinkPro LMS</SidebarTitle>
        </div>
        <SidebarToggle />
      </SidebarHeader>

      <SidebarContent className="space-y-4">
        <SidebarGroup label="Dashboard">
          <SidebarNav>
            <SidebarNavItem to="/leadmentor" icon={HomeIcon}>
              Dashboard
            </SidebarNavItem>
          </SidebarNav>
        </SidebarGroup>

        <SidebarGroup label="Communication">
          <SidebarNav>
            <SidebarNavItem to="/leadmentor/messages" icon={MessageSquare}>
              <div className="flex items-center justify-between w-full">
                <span>Messages</span>
                {unreadCount > 0 && !isCollapsed && (
                  <Badge
                    variant="default"
                    className="ml-auto text-xs px-1.5 py-0 h-5"
                  >
                    {unreadCount}
                  </Badge>
                )}
              </div>
            </SidebarNavItem>
            <SidebarNavItem to="/leadmentor/notifications" icon={Bell}>
              <div className="flex items-center justify-between w-full">
                <span>Notifications</span>
                {counts.unreadNotifications > 0 && !isCollapsed && (
                  <Badge
                    variant="default"
                    className="ml-auto text-xs px-1.5 py-0 h-5"
                  >
                    {counts.unreadNotifications}
                  </Badge>
                )}
              </div>
            </SidebarNavItem>
          </SidebarNav>
        </SidebarGroup>

        <SidebarGroup label="School Management">
          <SidebarNav>
            <SidebarNavItem to="/leadmentor/schools" icon={Building2}>
              Schools
            </SidebarNavItem>
            <SidebarNavItem to="/leadmentor/school-admins" icon={UserCheck}>
              School Admins
            </SidebarNavItem>
          </SidebarNav>
          <SidebarNav>
            <SidebarNavItem to="/leadmentor/mentors" icon={Users}>
              School Mentors
            </SidebarNavItem>
            <SidebarNavItem to="/leadmentor/students" icon={GraduationCap}>
              Students
            </SidebarNavItem>
          </SidebarNav>
        </SidebarGroup>

        <SidebarGroup label="Assessment">
          <SidebarNav>
            <SidebarNavItem to="/leadmentor/question-bank" icon={BookOpen}>
              <div className="flex items-center justify-between w-full">
                <span>Question Bank</span>
                {counts.pendingRecommendations > 0 && !isCollapsed && (
                  <div className="flex items-center space-x-1">
                    <Badge
                      variant="default"
                      className="ml-auto text-xs px-1.5 py-0 h-5"
                    >
                      {counts.pendingRecommendations}
                    </Badge>
                  </div>
                )}
              </div>
            </SidebarNavItem>
            <SidebarNavItem
              to="/leadmentor/assessment-reports"
              icon={BarChart3}
            >
              Assessment Reports
            </SidebarNavItem>
            <SidebarNavItem to="/leadmentor/certificates" icon={Award}>
              Certificates
            </SidebarNavItem>
          </SidebarNav>
        </SidebarGroup>

        <SidebarGroup label="Curriculum">
          <SidebarNav>
            <SidebarNavItem to="/leadmentor/modules" icon={Layers}>
              Modules
            </SidebarNavItem>
            <SidebarNavItem to="/leadmentor/sessions" icon={Calendar}>
              Sessions
            </SidebarNavItem>
            <SidebarNavItem to="/leadmentor/session-progress" icon={BarChart3}>
              Session Progress
            </SidebarNavItem>
          </SidebarNav>
        </SidebarGroup>

        <SidebarGroup label="Resources">
          <SidebarNav>
            <SidebarNavItem to="/leadmentor/resources" icon={FileText}>
              Resources
            </SidebarNavItem>
          </SidebarNav>
        </SidebarGroup>

        <SidebarGroup label="Account">
          <SidebarNav>
            <SidebarNavItem to="/leadmentor/profile" icon={User}>
              Profile
            </SidebarNavItem>
          </SidebarNav>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <div className="space-y-1">
          {!isCollapsed ? (
            <>
              <LogoutButton
                variant="ghost"
                className="w-full justify-start text-sm"
                isCollapsed={false}
              />
            </>
          ) : (
            <>
              <LogoutButton
                variant="ghost"
                size="icon"
                className="w-full"
                isCollapsed={true}
              />
            </>
          )}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
