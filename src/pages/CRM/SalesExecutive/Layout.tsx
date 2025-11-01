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

interface CRMSalesExecutiveLayoutProps {
  children?: React.ReactNode;
}

export default function CRMSalesExecutiveLayout({
  children,
}: CRMSalesExecutiveLayoutProps) {
  const { isCollapsed } = useSidebar();
  const { unreadCount } = useCRMNotifications();
  return (
    <div className="flex h-screen">
      <Sidebar className="h-screen">
        <SidebarHeader>
          <div className="flex items-center gap-2">
            <img
              src="/fancy-logo.jpg"
              alt="ThinkPro Logo"
              className="h-8 w-8 object-contain"
            />
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
              <SidebarNavItem
                to="/crm/sales-executive/summary"
                icon={Table}
              >
                Summary
              </SidebarNavItem>
              <SidebarNavItem
                to="/crm/sales-executive/notifications"
                icon={Bell}
              >
                <div className="flex gap-2 items-center justify-between w-full">
                  <span>Notifications</span>
                  {unreadCount > 0 && !isCollapsed && (
                    <Badge variant="destructive" className="ml-auto text-xs px-1.5 py-0 h-5">
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
            className="w-full justify-start text-[var(--sidebar-text-muted)] hover:text-[var(--sidebar-foreground)] hover:bg-[var(--sidebar-hover-bg)]"
            isCollapsed={isCollapsed}
          />
        </SidebarFooter>
      </Sidebar>

      <main className="flex-1 overflow-auto bg-background">{children}</main>
    </div>
  );
}
