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
  User,
  FileUp,
  Building2,
  CalendarDays,
  Clock,
  ClipboardList,
  Wallet,
  Receipt,
  Target,
  FileText,
  LayoutDashboard
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { LogoutButton } from "@/components/ui/logout-button";
import { useAuth } from "@/contexts/AuthContext";
import { CRMHeaderUserInfo } from "@/components/crm/CRMHeaderUserInfo";
import { cn } from "@/lib/utils";

interface Props {
  children: React.ReactNode;
}

export default function HRMSEmployeeLayout({ children }: Props) {
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
            <SidebarTitle>HRMS Employee</SidebarTitle>
          </div>
          <SidebarToggle />
        </SidebarHeader>

        <SidebarContent className="space-y-4">
          <SidebarGroup label="Dashboard">
            <SidebarNav>
              <SidebarNavItem
                to="/hrms/employee/dashboard"
                icon={LayoutDashboard}
              >
                Overview
              </SidebarNavItem>
            </SidebarNav>
          </SidebarGroup>
          {/* 👤 My Profile */}
          <SidebarGroup label="My Profile">
            <SidebarNav>
              <SidebarNavItem to="/hrms/employee/profile/personal" icon={User}>
                Personal Information
              </SidebarNavItem>
              <SidebarNavItem
                to="/hrms/employee/profile/documents"
                icon={FileUp}
              >
                Document Upload
              </SidebarNavItem>
              <SidebarNavItem
                to="/hrms/employee/profile/organization"
                icon={Building2}
              >
                Organizational Info
              </SidebarNavItem>
            </SidebarNav>
          </SidebarGroup>

          {/* ⏰ Attendance */}
          <SidebarGroup label="Attendance">
            <SidebarNav>
              <SidebarNavItem to="/hrms/employee/attendance/mark" icon={Clock}>
                Mark Attendance
              </SidebarNavItem>
              <SidebarNavItem
                to="/hrms/employee/attendance/calendar"
                icon={CalendarDays}
              >
                Attendance Calendar
              </SidebarNavItem>
              <SidebarNavItem
                to="/hrms/employee/attendance/requests"
                icon={ClipboardList}
              >
                Attendance Requests
              </SidebarNavItem>
              <SidebarNavItem
                to="/hrms/employee/attendance/shift-schedule"
                icon={CalendarDays}
              >
                Shift and Schdule
              </SidebarNavItem>
            </SidebarNav>
          </SidebarGroup>

          {/* 🌴 Leave */}
          <SidebarGroup label="Leave">
            <SidebarNav>
              <SidebarNavItem to="/hrms/employee/leave/balance" icon={Wallet}>
                Leave Balance
              </SidebarNavItem>
              <SidebarNavItem
                to="/hrms/employee/leave/apply"
                icon={ClipboardList}
              >
                Apply Leave
              </SidebarNavItem>
            </SidebarNav>
          </SidebarGroup>

          {/* 💰 Payroll */}
          <SidebarGroup label="Payroll">
            <SidebarNav>
              <SidebarNavItem
                to="/hrms/employee/payroll/payslips"
                icon={FileText}
              >
                Payslips
              </SidebarNavItem>
              <SidebarNavItem
                to="/hrms/employee/payroll/salary-structure"
                icon={Wallet}
              >
                Salary Structure
              </SidebarNavItem>
            </SidebarNav>
          </SidebarGroup>

          {/* 🧾 Expenses */}
          <SidebarGroup label="Expenses">
            <SidebarNav>
              <SidebarNavItem
                to="/hrms/employee/expenses/submit"
                icon={Receipt}
              >
                Submit Expense
              </SidebarNavItem>
            </SidebarNav>
          </SidebarGroup>

          {/* ✈️ Travel */}
          <SidebarGroup label="Requests">
            <SidebarNav>
              <SidebarNavItem
                to="/hrms/employee/request/my-requests"
                icon={ClipboardList}
              >
                My Travel Requests
              </SidebarNavItem>
              <SidebarNavItem
                to="/hrms/employee/request/resign"
                icon={ClipboardList}
              >
                My Resign Request
              </SidebarNavItem>
            </SidebarNav>
          </SidebarGroup>

          {/* 🎯 Performance */}
          <SidebarGroup label="Performance">
            <SidebarNav>
              <SidebarNavItem
                to="/hrms/employee/performance/goals"
                icon={Target}
              >
                My Goals
              </SidebarNavItem>
              <SidebarNavItem
                to="/hrms/employee/performance/self-appraisal"
                icon={ClipboardList}
              >
                Self Appraisal
              </SidebarNavItem>
              <SidebarNavItem
                to="/hrms/employee/performance/history"
                icon={FileText}
              >
                Performance History
              </SidebarNavItem>
            </SidebarNav>
          </SidebarGroup>

          {/* 📄 Letters & Documents */}
          <SidebarGroup label="Letters & Documents">
            <SidebarNav>
              <SidebarNavItem to="/hrms/employee/letters" icon={FileText}>
                Download Letter
              </SidebarNavItem>
            </SidebarNav>
          </SidebarGroup>
        </SidebarContent>

        {/* ================= FOOTER (AS IT IS) ================= */}
        <SidebarFooter>
          <div className="space-y-2">
            {!isCollapsed ? (
              <Link to="/superadmin">
                <Button
                  variant="ghost"
                  className="w-full justify-start text-sm bg-[#333A47] hover:bg-[#20252d]"
                >
                  <Building2 className="mr-3 h-4 w-4 text-white" />
                  <span className="text-white">Back to LMS</span>
                </Button>
              </Link>
            ) : (
              <Link to="/superadmin">
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-full bg-[#333A47] hover:bg-[#20252d]"
                >
                  <Building2 className="h-4 w-4 text-white" />
                  <span className="sr-only">Back to LMS</span>
                </Button>
              </Link>
            )}

            <LogoutButton
              variant="ghost"
              size={isCollapsed ? "icon" : "default"}
              className={cn(
                "w-full justify-start text-[var(--sidebar-text-muted)] hover:text-[var(--sidebar-foreground)] hover:bg-[var(--sidebar-hover-bg)]",
                isCollapsed && "justify-center"
              )}
              isCollapsed={isCollapsed}
            />
          </div>
        </SidebarFooter>
      </Sidebar>

      {/* ================= MAIN AREA ================= */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center gap-3">
            <div className="lg:hidden">
              <SidebarToggle className="text-gray-700 hover:bg-gray-100" />
            </div>
            <CRMHeaderUserInfo name={user?.name} role="Employee" />
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4">{children}</main>
      </div>
    </div>
  );
}
