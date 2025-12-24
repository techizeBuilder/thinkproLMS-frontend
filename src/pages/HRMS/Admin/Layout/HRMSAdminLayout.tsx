/** @format */

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
  Users,
  Briefcase,
  FileText,
  GitBranch,
  IndianRupee,
  Calendar,
} from "lucide-react";

import { LogoutButton } from "@/components/ui/logout-button";
import { useAuth } from "@/contexts/AuthContext";
import { CRMHeaderUserInfo } from "@/components/crm/CRMHeaderUserInfo";
import { cn } from "@/lib/utils";

interface Props {
  children: React.ReactNode;
}

export default function HRMSAdminLayout({ children }: Props) {
  const { isCollapsed } = useSidebar();
  const { user } = useAuth();

  return (
    <div className="flex h-screen">
      {/* SIDEBAR */}
      <Sidebar className="h-screen">
        <SidebarHeader>
          <div className="flex items-center gap-2">
            {!isCollapsed && <img src="/fancy-logo.jpg" className="h-8 w-8" />}
            <SidebarTitle>HRMS Admin</SidebarTitle>
          </div>
          <SidebarToggle />
        </SidebarHeader>

        <SidebarContent>
          {/* Recruitment */}
          <SidebarGroup label="Recruitment (ATS)">
            <SidebarNav>
              <SidebarNavItem to="/hrms/admin/jobs" icon={Briefcase}>
                Job Openings
              </SidebarNavItem>
              <SidebarNavItem to="/hrms/admin/candidates" icon={Users}>
                Candidates
              </SidebarNavItem>
              <SidebarNavItem to="/hrms/admin/interviews" icon={GitBranch}>
                Interview Pipeline
              </SidebarNavItem>
            </SidebarNav>
          </SidebarGroup>

          {/* HR */}
          <SidebarGroup label="HR Management">
            <SidebarNav>
              <SidebarNavItem to="/hrms/admin/documents" icon={FileText}>
                Documents
              </SidebarNavItem>
              <SidebarNavItem to="/hrms/admin/holidays" icon={Calendar}>
                Holidays
              </SidebarNavItem>
              <SidebarNavItem
                to="/hrms/admin/salary-structure"
                icon={IndianRupee}
              >
                Salary Structure
              </SidebarNavItem>
            </SidebarNav>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter>
          <LogoutButton
            variant="ghost"
            size={isCollapsed ? "icon" : "default"}
            className={cn("w-full justify-start")}
            isCollapsed={isCollapsed}
          />
        </SidebarFooter>
      </Sidebar>

      {/* MAIN AREA */}
      <div className="flex-1 flex flex-col">
        <header className="bg-white border-b px-4 py-3">
          <CRMHeaderUserInfo name={user?.name} role={user?.role} />
        </header>

        <main className="flex-1 overflow-auto p-4">{children}</main>
      </div>
    </div>
  );
}
