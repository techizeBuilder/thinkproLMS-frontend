import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarTitle,
  SidebarToggle,
  SidebarFooter,
  useSidebar,
  SidebarGroup,
  SidebarNav,
  SidebarNavItem,
} from "@/components/ui/collapsible-sidebar";
import { LogoutButton } from "@/components/ui/logout-button";
import { NotebookPen, Table, Bell } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useCRMNotifications } from "@/hooks/useCRMNotifications";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { CRMHeaderUserInfo } from "@/components/crm/CRMHeaderUserInfo";

interface CRMSalesExecutiveLayoutProps {
  children?: React.ReactNode;
}

export default function CRMSalesExecutiveLayout({
  children,
}: CRMSalesExecutiveLayoutProps) {
  const { isCollapsed } = useSidebar();
  const { unreadCount } = useCRMNotifications();
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
            <SidebarTitle>CRM Portal</SidebarTitle>
          </div>
          <SidebarToggle />
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup label="Management">
            <SidebarNav>
              <SidebarNavItem
                to="/crm/sales-executive/leads"
                icon={NotebookPen}
              >
                Leads
              </SidebarNavItem>
              <SidebarNavItem to="/crm/sales-executive/summary" icon={Table}>
                Summary
              </SidebarNavItem>
              <SidebarNavItem
                to="/crm/sales-executive/notifications"
                icon={Bell}
              >
                <div className="flex gap-2 items-center justify-between w-full">
                  <span>Notifications</span>
                  {unreadCount > 0 && !isCollapsed && (
                    <Badge
                      variant="destructive"
                      className="ml-auto text-xs px-1.5 py-0 h-5"
                    >
                      {unreadCount}
                    </Badge>
                  )}
                </div>
              </SidebarNavItem>
            </SidebarNav>
          </SidebarGroup>
        </SidebarContent>
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

      <div className="flex-1 flex flex-col overflow-hidden bg-background">
        <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Mobile menu toggle */}
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
