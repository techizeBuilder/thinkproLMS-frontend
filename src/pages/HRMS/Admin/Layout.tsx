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
  useSidebar,
  SidebarFooter,
} from "@/components/ui/collapsible-sidebar";
import {
  Users,
  UserCheck,
  Building2,
  Bell,
  Briefcase,
  CalendarDays,
  FileText,
  NotebookPen,
  ListChecks,

  // 🔽 missing icons added
  ShieldCheck,
  LogOut,
  Layers,
  Receipt,
  Clock,
  ClipboardCheck,
  Calendar,
  Settings,
  Wallet,
  IndianRupee,
  PlayCircle,
  FileBarChart,
  GitBranch,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { LogoutButton } from "@/components/ui/logout-button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { CRMHeaderUserInfo } from "@/components/crm/CRMHeaderUserInfo";

interface HRMSAdminLayoutProps {
  children: React.ReactNode;
}

export default function HRMSAdminLayout({ children }: HRMSAdminLayoutProps) {
  const { isCollapsed } = useSidebar();
  const { user } = useAuth();

  return (
    <div className="flex h-screen">
      <Sidebar className="h-screen">
        <SidebarHeader>
          <div className="flex items-center gap-2">
            {!isCollapsed && (
              <img
                src="/fancy-logo.jpg"
                alt="ThinkPro Logo"
                className="h-8 w-8 object-contain"
              />
            )}
            <SidebarTitle>HRMS Portal</SidebarTitle>
          </div>
          <SidebarToggle />
        </SidebarHeader>
        <SidebarContent className="space-y-4">
          {/* Employee Lifecycle */}
          <SidebarGroup label="User and Roles">
            <SidebarNav>
              <SidebarNavItem to="/hrms/admin/addUser" icon={Users}>
                Add Users
              </SidebarNavItem>
            </SidebarNav>
          </SidebarGroup>
          {/* Employee Lifecycle */}
          <SidebarGroup label="Employee Management">
            <SidebarNav>
              <SidebarNavItem to="/hrms/admin/employees" icon={Users}>
                Employees
              </SidebarNavItem>
              <SidebarNavItem to="/hrms/admin/documents" icon={FileText}>
                Documents
              </SidebarNavItem>
              <SidebarNavItem to="/hrms/admin/letters" icon={NotebookPen}>
                Letters
              </SidebarNavItem>
              <SidebarNavItem to="/hrms/admin/probation" icon={UserCheck}>
                Probation & Confirmation
              </SidebarNavItem>
            </SidebarNav>
          </SidebarGroup>

          {/* Onboarding */}
          <SidebarGroup label="Onboarding">
            <SidebarNav>
              <SidebarNavItem
                to="/hrms/admin/onboarding/checklist"
                icon={ListChecks}
              >
                Onboarding Checklist
              </SidebarNavItem>
              <SidebarNavItem
                to="/hrms/admin/onboarding/documents"
                icon={FileText}
              >
                Document Verification
              </SidebarNavItem>
              <SidebarNavItem
                to="/hrms/admin/onboarding/kyc"
                icon={ShieldCheck}
              >
                KYC Verification
              </SidebarNavItem>
            </SidebarNav>
          </SidebarGroup>

          {/* Offboarding */}
          <SidebarGroup label="Offboarding">
            <SidebarNav>
              <SidebarNavItem
                to="/hrms/admin/offboarding/resignations"
                icon={LogOut}
              >
                Resignations
              </SidebarNavItem>
              <SidebarNavItem
                to="/hrms/admin/offboarding/clearance"
                icon={Layers}
              >
                Clearance Workflow
              </SidebarNavItem>
              <SidebarNavItem
                to="/hrms/admin/offboarding/full-final"
                icon={Receipt}
              >
                Full & Final Settlement
              </SidebarNavItem>
            </SidebarNav>
          </SidebarGroup>

          {/* Attendance */}
          <SidebarGroup label="Attendance">
            <SidebarNav>
              <SidebarNavItem to="/hrms/admin/attendance" icon={CalendarDays}>
                Attendance Records
              </SidebarNavItem>
              <SidebarNavItem to="/hrms/admin/shifts" icon={Clock}>
                Shifts & Rosters
              </SidebarNavItem>
              <SidebarNavItem
                to="/hrms/admin/attendance/requests"
                icon={ClipboardCheck}
              >
                Attendance Requests
              </SidebarNavItem>
              <SidebarNavItem to="/hrms/admin/holidays" icon={Calendar}>
                Holidays
              </SidebarNavItem>
            </SidebarNav>
          </SidebarGroup>

          {/* Leave */}
          <SidebarGroup label="Leave Management">
            <SidebarNav>
              <SidebarNavItem to="/hrms/admin/leaves" icon={Briefcase}>
                Leave Requests
              </SidebarNavItem>
              <SidebarNavItem to="/hrms/admin/leave-types" icon={Settings}>
                Leave Types & Rules
              </SidebarNavItem>
              <SidebarNavItem to="/hrms/admin/leave-encashment" icon={Wallet}>
                Leave Encashment
              </SidebarNavItem>
            </SidebarNav>
          </SidebarGroup>

          {/* Payroll */}
          <SidebarGroup label="Payroll">
            <SidebarNav>
              <SidebarNavItem
                to="/hrms/admin/salary-structure"
                icon={IndianRupee}
              >
                Salary Structure
              </SidebarNavItem>
              <SidebarNavItem to="/hrms/admin/payroll/run" icon={PlayCircle}>
                Payroll Run
              </SidebarNavItem>
              <SidebarNavItem to="/hrms/admin/payslips" icon={FileText}>
                Payslips
              </SidebarNavItem>
              <SidebarNavItem
                to="/hrms/admin/statutory-reports"
                icon={FileBarChart}
              >
                Statutory Reports
              </SidebarNavItem>
            </SidebarNav>
          </SidebarGroup>

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

          {/* Notifications */}
          <SidebarGroup label="System">
            <SidebarNav>
              <SidebarNavItem to="/hrms/admin/notifications" icon={Bell}>
                Notifications
              </SidebarNavItem>
            </SidebarNav>
          </SidebarGroup>
        </SidebarContent>

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

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="lg:hidden">
                <SidebarToggle className="text-gray-700 hover:bg-gray-100" />
              </div>
              <CRMHeaderUserInfo name={user?.name} role={user?.role} />
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
