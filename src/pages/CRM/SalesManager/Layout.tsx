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
import { Users, NotebookPen, Table, Bell } from "lucide-react";
import { LogoutButton } from "@/components/ui/logout-button";
import { Badge } from "@/components/ui/badge";
import { useCRMNotifications } from "@/hooks/useCRMNotifications";

interface CRMSalesManagerLayoutProps {
  children: React.ReactNode;
}

export default function CRMSalesManagerLayout({
  children,
}: CRMSalesManagerLayoutProps) {
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

        <SidebarContent className="space-y-4">
          <SidebarGroup label="Management">
            <SidebarNav>
              <SidebarNavItem to="/crm/sales-manager/leads" icon={NotebookPen}>
                Leads
              </SidebarNavItem>
              <SidebarNavItem to="/crm/sales-manager/summary" icon={Table}>
                Summary
              </SidebarNavItem>

              <SidebarNavItem
                to="/crm/sales-manager/sales-executives"
                icon={Users}
              >
                Sales Executives
              </SidebarNavItem>
              <SidebarNavItem to="/crm/sales-manager/notifications" icon={Bell}>
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
            className="w-full justify-start"
            isCollapsed={isCollapsed}
          />
        </SidebarFooter>
      </Sidebar>

      <main className="flex-1 overflow-auto bg-gray-50">{children}</main>
    </div>
  );
}
