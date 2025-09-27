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
} from "@/components/ui/collapsible-sidebar";
import {
  HomeIcon,
  Settings,
  User,
  UserCheck,
  GraduationCap,
  BookOpen,
  BarChart3,
  School,
} from "lucide-react";
import { LogoutButton } from "@/components/ui/logout-button";

interface SchoolAdminSidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function SchoolAdminSidebar({ className }: SchoolAdminSidebarProps) {

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

        <SidebarGroup label="Analytics">
          <SidebarNav>
            <SidebarNavItem to="/schooladmin/module-progress" icon={BookOpen}>
              Module Progress
            </SidebarNavItem>
            <SidebarNavItem to="/schooladmin/assessment-reports" icon={BarChart3}>
              Assessment Reports
            </SidebarNavItem>
          </SidebarNav>
        </SidebarGroup>

        <SidebarGroup label="Schools">
          <SidebarNav>
            <SidebarNavItem to="/schooladmin/schools" icon={School}>
              Assigned Schools
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
