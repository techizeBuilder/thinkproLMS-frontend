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
  LayoutDashboard,
  Users,
  IndianRupee,
  CalendarCheck,
  CalendarOff,
  FileCheck2,
} from "lucide-react";

import { LogoutButton } from "@/components/ui/logout-button";
import { useAuth } from "@/contexts/AuthContext";
import { CRMHeaderUserInfo } from "@/components/crm/CRMHeaderUserInfo";
import { cn } from "@/lib/utils";

interface Props {
  children: React.ReactNode;
}

export default function HRMSAuditorLayout({ children }: Props) {
  const { isCollapsed } = useSidebar();
  const { user } = useAuth();

  return (
    <div className="flex h-screen">
      {/* ================= SIDEBAR ================= */}
      <Sidebar className="h-screen">
        <SidebarHeader>
          <div className="flex items-center gap-2">
            {!isCollapsed && (
              <img
                src="/fancy-logo.jpg"
                alt="Logo"
                className="h-8 w-8 object-contain"
              />
            )}
            <SidebarTitle>Auditor</SidebarTitle>
          </div>
          <SidebarToggle />
        </SidebarHeader>

        {/* ================= CONTENT ================= */}
        <SidebarContent className="space-y-4">
          {/* 📊 Dashboard */}
          <SidebarGroup label="Dashboard">
            <SidebarNav>
              <SidebarNavItem
                to="/hrms/auditor/dashboard"
                icon={LayoutDashboard}
              >
                Overview
              </SidebarNavItem>
            </SidebarNav>
          </SidebarGroup>

          {/* 👥 Employees */}
          <SidebarGroup label="Employees">
            <SidebarNav>
              <SidebarNavItem to="/hrms/auditor/employees" icon={Users}>
                Employee Records
              </SidebarNavItem>
            </SidebarNav>
          </SidebarGroup>

          {/* 💰 Payroll */}
          <SidebarGroup label="Payroll">
            <SidebarNav>
              <SidebarNavItem to="/hrms/auditor/payroll" icon={IndianRupee}>
                Payroll Summary
              </SidebarNavItem>
            </SidebarNav>
          </SidebarGroup>

          {/* 🕒 Attendance */}
          <SidebarGroup label="Attendance">
            <SidebarNav>
              <SidebarNavItem
                to="/hrms/auditor/attendance"
                icon={CalendarCheck}
              >
                Attendance Logs
              </SidebarNavItem>
            </SidebarNav>
          </SidebarGroup>

          {/* 🌴 Leaves */}
          <SidebarGroup label="Leaves">
            <SidebarNav>
              <SidebarNavItem to="/hrms/auditor/leaves" icon={CalendarOff}>
                Leave Records
              </SidebarNavItem>
            </SidebarNav>
          </SidebarGroup>

          {/* 📑 Compliance Reports */}
          <SidebarGroup label="Compliance">
            <SidebarNav>
              <SidebarNavItem to="/hrms/auditor/compliance" icon={FileCheck2}>
                Compliance Reports
              </SidebarNavItem>
            </SidebarNav>
          </SidebarGroup>
        </SidebarContent>

        {/* ================= FOOTER ================= */}
        <SidebarFooter>
          <LogoutButton
            variant="ghost"
            size={isCollapsed ? "icon" : "default"}
            className={cn(
              "w-full justify-start text-[var(--sidebar-text-muted)] hover:text-[var(--sidebar-foreground)] hover:bg-[var(--sidebar-hover-bg)]",
              isCollapsed && "justify-center"
            )}
            isCollapsed={isCollapsed}
          />
        </SidebarFooter>
      </Sidebar>

      {/* ================= MAIN AREA ================= */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center gap-3">
            <div className="lg:hidden">
              <SidebarToggle className="text-gray-700 hover:bg-gray-100" />
            </div>
            <CRMHeaderUserInfo name={user?.name} role="Auditor" />
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4">{children}</main>
      </div>
    </div>
  );
}
