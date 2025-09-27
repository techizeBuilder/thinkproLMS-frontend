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
  Crown,
  Users,
  GraduationCap,
  BookOpen,
  FolderOpen,
  Layers,
  FileText,
  Award,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { LogoutButton } from "@/components/ui/logout-button";
import { useAuth } from "@/contexts/AuthContext";

interface LeadMentorSidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function LeadMentorSidebar({ className }: LeadMentorSidebarProps) {
  const { isCollapsed } = useSidebar();
  const { user } = useAuth();

  // Check if user has permission to manage modules and resources
  const hasModulePermission = user?.permissions?.includes("add_modules");
  const hasResourcePermission = user?.permissions?.includes("add_resources");

  return (
    <Sidebar className={cn("h-screen", className)}>
      <SidebarHeader>
        <SidebarTitle>ThinkPro LMS</SidebarTitle>
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

        <SidebarGroup label="School Management">
          <SidebarNav>
            <SidebarNavItem to="/leadmentor/school-admins" icon={UserCheck}>
              School Admins
            </SidebarNavItem>
            <SidebarNavItem to="/leadmentor/lead-mentors" icon={Crown}>
              Lead Mentors
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
              Question Bank
            </SidebarNavItem>
            <SidebarNavItem to="/leadmentor/certificates" icon={Award}>
              Certificates
            </SidebarNavItem>
            <SidebarNavItem
              to="/leadmentor/module-completion-reports"
              icon={FileText}
            >
              Module Progress Reports
            </SidebarNavItem>
          </SidebarNav>
        </SidebarGroup>

        {hasResourcePermission && (
          <SidebarGroup label="Resources">
            <SidebarNav>
              <SidebarNavItem to="/leadmentor/resources" icon={FileText}>
                Resources
              </SidebarNavItem>
            </SidebarNav>
            {hasModulePermission && (
              <>
                <SidebarNav>
                  <SidebarNavItem to="/leadmentor/subjects" icon={FolderOpen}>
                    Subjects
                  </SidebarNavItem>
                  <SidebarNavItem to="/leadmentor/modules" icon={Layers}>
                    Modules
                  </SidebarNavItem>
                </SidebarNav>
              </>
            )}
          </SidebarGroup>
        )}

        <SidebarGroup label="Account">
          <SidebarNav>
            <SidebarNavItem to="/leadmentor/profile" icon={User}>
              Profile
            </SidebarNavItem>
            <SidebarNavItem to="/leadmentor/settings" icon={Settings}>
              Settings
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
