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
  Laptop,
  KeyRound,
  Boxes,
  RefreshCcw,
  Fingerprint,
  Power,
  ShieldCheck,
} from "lucide-react";

import { LogoutButton } from "@/components/ui/logout-button";
import { useAuth } from "@/contexts/AuthContext";
import { CRMHeaderUserInfo } from "@/components/crm/CRMHeaderUserInfo";
import { cn } from "@/lib/utils";

interface Props {
  children: React.ReactNode;
}

export default function HRMSITAdminLayout({ children }: Props) {
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
            <SidebarTitle>HRMS IT Admin</SidebarTitle>
          </div>
          <SidebarToggle />
        </SidebarHeader>

        {/* ================= CONTENT ================= */}
        <SidebarContent className="space-y-4">
          {/* 📊 Dashboard */}
          <SidebarGroup label="Dashboard">
            <SidebarNav>
              <SidebarNavItem to="/hrms/it/dashboard" icon={LayoutDashboard}>
                Overview
              </SidebarNavItem>
            </SidebarNav>
          </SidebarGroup>

          {/* 🔐 System Access & Accounts */}
          <SidebarGroup label="System Access & Accounts">
            <SidebarNav>
              <SidebarNavItem to="/hrms/it/onboarding" icon={Laptop}>
                Employee IT Onboarding
              </SidebarNavItem>

              <SidebarNavItem to="/hrms/it/accounts" icon={KeyRound}>
                Email & Account Management
              </SidebarNavItem>

              <SidebarNavItem to="/hrms/it/software" icon={ShieldCheck}>
                Software & License Assignment
              </SidebarNavItem>
            </SidebarNav>
          </SidebarGroup>

          {/* 💻 Asset Management */}
          <SidebarGroup label="Asset Management">
            <SidebarNav>
              <SidebarNavItem to="/hrms/it/assets" icon={Boxes}>
                Asset Inventory
              </SidebarNavItem>

              <SidebarNavItem to="/hrms/it/assets/assign" icon={RefreshCcw}>
                Assign / Re-Assign Assets
              </SidebarNavItem>

              <SidebarNavItem to="/hrms/it/assets/return" icon={Power}>
                Asset Return & Exit Clearance
              </SidebarNavItem>
            </SidebarNav>
          </SidebarGroup>

          {/* 🧬 Attendance Device Management */}
          <SidebarGroup label="Attendance Device Management">
            <SidebarNav>
              <SidebarNavItem
                to="/hrms/it/biometric/devices"
                icon={Fingerprint}
              >
                Biometric Device List
              </SidebarNavItem>

              <SidebarNavItem to="/hrms/it/biometric/logs" icon={RefreshCcw}>
                Device Sync Logs
              </SidebarNavItem>

              <SidebarNavItem to="/hrms/it/biometric/issues" icon={ShieldCheck}>
                Device Troubleshooting
              </SidebarNavItem>
            </SidebarNav>
          </SidebarGroup>

          {/* 🚪 Offboarding & IT Clearance */}
          <SidebarGroup label="Offboarding & IT Clearance">
            <SidebarNav>
              <SidebarNavItem to="/hrms/it/offboarding/access" icon={Power}>
                Access Deactivation
              </SidebarNavItem>

              <SidebarNavItem to="/hrms/it/offboarding/assets" icon={Boxes}>
                Asset Collection Status
              </SidebarNavItem>

              <SidebarNavItem
                to="/hrms/it/offboarding/licenses"
                icon={ShieldCheck}
              >
                License Closure
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
            <CRMHeaderUserInfo name={user?.name} role="IT Admin" />
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4">{children}</main>
      </div>
    </div>
  );
}
