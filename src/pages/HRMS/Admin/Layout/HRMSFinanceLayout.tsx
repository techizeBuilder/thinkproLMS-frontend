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
  Wallet,
  FileCheck,
  IndianRupee,
  Receipt,
  Plane,
  FileText,
  ShieldCheck,
} from "lucide-react";

import { LogoutButton } from "@/components/ui/logout-button";
import { useAuth } from "@/contexts/AuthContext";
import { CRMHeaderUserInfo } from "@/components/crm/CRMHeaderUserInfo";
import { cn } from "@/lib/utils";

interface Props {
  children: React.ReactNode;
}

export default function HRMSFinanceManagerLayout({ children }: Props) {
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
            <SidebarTitle>HRMS Finance</SidebarTitle>
          </div>
          <SidebarToggle />
        </SidebarHeader>

        {/* 🔥 CONTENT */}
        <SidebarContent className="space-y-4">
          {/* 📊 Dashboard */}
          <SidebarGroup label="Dashboard">
            <SidebarNav>
              <SidebarNavItem
                to="/hrms/finance/dashboard"
                icon={LayoutDashboard}
              >
                Overview
              </SidebarNavItem>
            </SidebarNav>
          </SidebarGroup>

          {/* 💰 Payroll Management */}
          <SidebarGroup label="Payroll Management">
            <SidebarNav>
              <SidebarNavItem
                to="/hrms/finance/payroll/review"
                icon={FileCheck}
              >
                Payroll Review
              </SidebarNavItem>
              <SidebarNavItem
                to="/hrms/finance/payroll/disbursement"
                icon={IndianRupee}
              >
                Salary Disbursement
              </SidebarNavItem>
            </SidebarNav>
          </SidebarGroup>

          {/* 🧾 Reimbursements & Expenses */}
          <SidebarGroup label="Reimbursements & Expenses">
            <SidebarNav>
              <SidebarNavItem to="/hrms/finance/reimbursements" icon={Receipt}>
                Reimbursement Requests
              </SidebarNavItem>
              <SidebarNavItem to="/hrms/finance/expenses" icon={Wallet}>
                Expense Claims
              </SidebarNavItem>
            </SidebarNav>
          </SidebarGroup>

          {/* ✈️ Travel & Advance */}
          <SidebarGroup label="Travel & Advance">
            <SidebarNav>
              <SidebarNavItem to="/hrms/finance/travel/advances" icon={Plane}>
                Travel Advances
              </SidebarNavItem>
              <SidebarNavItem
                to="/hrms/finance/travel/reconciliation"
                icon={FileText}
              >
                Travel Reconciliation
              </SidebarNavItem>
            </SidebarNav>
          </SidebarGroup>

          {/* 🛡️ Statutory Compliance */}
          <SidebarGroup label="Statutory Compliance">
            <SidebarNav>
              <SidebarNavItem
                to="/hrms/finance/statutory/reports"
                icon={FileText}
              >
                Statutory Reports
              </SidebarNavItem>
              <SidebarNavItem
                to="/hrms/finance/statutory/returns"
                icon={ShieldCheck}
              >
                Statutory Returns
              </SidebarNavItem>
            </SidebarNav>
          </SidebarGroup>
        </SidebarContent>

        {/* ================= FOOTER ================= */}
        <SidebarFooter>
          <div className="space-y-2">
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
            <CRMHeaderUserInfo name={user?.name} role="Finance Manager" />
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4">{children}</main>
      </div>
    </div>
  );
}
