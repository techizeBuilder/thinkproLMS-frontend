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
import { useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useCRMNotifications } from "@/hooks/useCRMNotifications";

interface CRMSalesExecutiveLayoutProps {
  children?: React.ReactNode;
}

export default function CRMSalesExecutiveLayout({
  children,
}: CRMSalesExecutiveLayoutProps) {
  const { isCollapsed } = useSidebar();
  const location = useLocation();
  const { unreadCount } = useCRMNotifications();
  const isActive = (path: string) => location.pathname === path;
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
                className={cn(
                  isActive("/crm/sales-executive/leads") &&
                    "bg-green-100 text-green-700 border border-green-200"
                )}
              >
                Leads
              </SidebarNavItem>
              <SidebarNavItem
                to="/crm/sales-executive/summary"
                icon={Table}
                className={cn(
                  isActive("/crm/sales-executive/summary") &&
                    "bg-green-100 text-green-700 border border-green-200"
                )}
              >
                Summary
              </SidebarNavItem>
              <SidebarNavItem
                to="/crm/sales-executive/notifications"
                icon={Bell}
                className={cn(
                  isActive("/crm/sales-executive/notifications") &&
                    "bg-green-100 text-green-700 border border-green-200"
                )}
              >
                <div className="flex items-center justify-between w-full">
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
            className="w-full justify-start"
            isCollapsed={isCollapsed}
          />
        </SidebarFooter>
      </Sidebar>

      <main className="flex-1 overflow-auto bg-gray-50">{children}</main>
    </div>
  );
}
