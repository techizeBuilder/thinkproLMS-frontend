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
  CalendarDays,
  ClipboardList,
  CheckCircle,
  Clock,
  Receipt,
  Plane,
  UserCog,
  Target,
  BarChart3,
  Star,
  TrendingUp,
  GitBranch,
  UserCheck,
  LayoutDashboard,
  Bell,
  Building2,
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

export default function HRMSManagerLayout({ children }: Props) {
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
            <SidebarTitle>HRMS Manager</SidebarTitle>
          </div>
          <SidebarToggle />
        </SidebarHeader>

        {/* 🔥 PROPER SPACING LIKE ADMIN */}
        <SidebarContent className="space-y-4">
          {/* 📊 Dashboard */}
          {/* <SidebarGroup label="Dashboard">
            <SidebarNav>
              <SidebarNavItem
                to="/hrms/manager/dashboard"
                icon={LayoutDashboard}
              >
                Overview
              </SidebarNavItem>
            </SidebarNav>
          </SidebarGroup> */}

          {/* 👥 Team */}
          <SidebarGroup label="Team">
            <SidebarNav>
              <SidebarNavItem to="/hrms/manager/team" icon={Users}>
                Team Members
              </SidebarNavItem>
              <SidebarNavItem
                to="/hrms/manager/team-attendance"
                icon={CalendarDays}
              >
                Team Attendance
              </SidebarNavItem>
              <SidebarNavItem
                to="/hrms/manager/leave-calendar"
                icon={ClipboardList}
              >
                Leave Calendar
              </SidebarNavItem>
              <SidebarNavItem to="/hrms/manager/tasks" icon={CheckCircle}>
                Task Status
              </SidebarNavItem>
            </SidebarNav>
          </SidebarGroup>

          {/* ✅ Approvals */}
          <SidebarGroup label="Approvals">
            <SidebarNav>
              <SidebarNavItem
                to="/hrms/manager/approvals/leaves"
                icon={ClipboardList}
              >
                Leave Requests
              </SidebarNavItem>
              <SidebarNavItem
                to="/hrms/manager/approvals/attendance"
                icon={Clock}
              >
                Attendance Corrections
              </SidebarNavItem>
              <SidebarNavItem
                to="/hrms/manager/approvals/overtime"
                icon={Clock}
              >
                Overtime Requests
              </SidebarNavItem>
              <SidebarNavItem
                to="/hrms/manager/approvals/expenses"
                icon={Receipt}
              >
                Expense / Reimbursement
              </SidebarNavItem>
              <SidebarNavItem to="/hrms/manager/approvals/travel" icon={Plane}>
                Travel Requests
              </SidebarNavItem>
              <SidebarNavItem
                to="/hrms/manager/approvals/profile-updates"
                icon={UserCog}
              >
                Profile Update Requests
              </SidebarNavItem>
            </SidebarNav>
          </SidebarGroup>

          {/* 📈 Performance */}
          <SidebarGroup label="Performance">
            <SidebarNav>
              <SidebarNavItem
                to="/hrms/manager/performance/goals"
                icon={Target}
              >
                Goals / OKRs
              </SidebarNavItem>
              <SidebarNavItem
                to="/hrms/manager/performance/appraisals"
                icon={BarChart3}
              >
                Appraisals
              </SidebarNavItem>
              <SidebarNavItem
                to="/hrms/manager/performance/feedback"
                icon={Star}
              >
                Feedback & Ratings
              </SidebarNavItem>
              <SidebarNavItem
                to="/hrms/manager/performance/recommendations"
                icon={TrendingUp}
              >
                Promotion Recommendations
              </SidebarNavItem>
            </SidebarNav>
          </SidebarGroup>

          {/* 🧑‍💼 Recruitment */}
          <SidebarGroup label="Recruitment">
            <SidebarNav>
              <SidebarNavItem to="/hrms/manager/interviews" icon={GitBranch}>
                Interview Feedback
              </SidebarNavItem>
              <SidebarNavItem
                to="/hrms/manager/recommended-candidates"
                icon={UserCheck}
              >
                Recommended Candidates
              </SidebarNavItem>
            </SidebarNav>
          </SidebarGroup>

          {/* 🔔 Notifications */}
          {/* <SidebarGroup label="System">
            <SidebarNav>
              <SidebarNavItem to="/hrms/manager/notifications" icon={Bell}>
                Notifications
              </SidebarNavItem>
            </SidebarNav>
          </SidebarGroup> */}
        </SidebarContent>

        {/* ❌ FOOTER KE NICHE KUCH CHANGE NAHI */}
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

      {/* ================= MAIN AREA (UNCHANGED) ================= */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center gap-3">
            <div className="lg:hidden">
              <SidebarToggle className="text-gray-700 hover:bg-gray-100" />
            </div>
            <CRMHeaderUserInfo name={user?.name} role="Manager" />
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4">{children}</main>
      </div>
    </div>
  );
}
