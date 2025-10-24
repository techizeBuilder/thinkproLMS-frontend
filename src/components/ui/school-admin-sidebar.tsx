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
  Settings,
  User,
  UserCheck,
  GraduationCap,
  BookOpen,
  MessageSquare,
  BarChart3,
} from "lucide-react";
import { LogoutButton } from "@/components/ui/logout-button";
import { Badge } from "@/components/ui/badge";
import { useUnreadMessageCount } from "@/hooks/useUnreadMessageCount";

interface SchoolAdminSidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function SchoolAdminSidebar({ className }: SchoolAdminSidebarProps) {
  const { isCollapsed } = useSidebar();
  const unreadCount = useUnreadMessageCount();

  return (
    <Sidebar className={cn("h-screen", className)}>
      <SidebarHeader>
        <SidebarTitle>School Admin Portal</SidebarTitle>
        <SidebarToggle />
      </SidebarHeader>

      <SidebarContent className="space-y-4">
        <SidebarGroup label="Dashboard">
          <SidebarNav>
            <SidebarNavItem to="/schooladmin" icon={HomeIcon}>
              Dashboard
            </SidebarNavItem>
          </SidebarNav>
        </SidebarGroup>

        <SidebarGroup label="Communication">
          <SidebarNav>
            <SidebarNavItem to="/schooladmin/messages" icon={MessageSquare}>
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

        <SidebarGroup label="Management">
          <SidebarNav>
            <SidebarNavItem to="/schooladmin/mentors" icon={UserCheck}>
              School Mentors
            </SidebarNavItem>
            <SidebarNavItem to="/schooladmin/students" icon={GraduationCap}>
              Students
            </SidebarNavItem>
          </SidebarNav>
        </SidebarGroup>

        <SidebarGroup label="Assessment">
          <SidebarNav>
            <SidebarNavItem to="/schooladmin/assessment-reports" icon={BarChart3}>
              Assessment Reports
            </SidebarNavItem>
          </SidebarNav>
        </SidebarGroup>

        <SidebarGroup label="Curriculum">
          <SidebarNav>
            <SidebarNavItem to="/schooladmin/session-progress" icon={BookOpen}>
              Session Progress
            </SidebarNavItem>
          </SidebarNav>
        </SidebarGroup>


        <SidebarGroup label="Account">
          <SidebarNav>
            <SidebarNavItem to="/schooladmin/profile" icon={User}>
              Profile
            </SidebarNavItem>
            <SidebarNavItem to="/schooladmin/settings" icon={Settings}>
              Settings
            </SidebarNavItem>
          </SidebarNav>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <div className="p-2">
          <LogoutButton />
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
