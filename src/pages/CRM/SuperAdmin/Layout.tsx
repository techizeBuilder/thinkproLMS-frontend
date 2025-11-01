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
import { Users, UserCheck, Building2, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { LogoutButton } from "@/components/ui/logout-button";
import { Badge } from "@/components/ui/badge";
import { useCRMNotifications } from "@/hooks/useCRMNotifications";

interface CRMSuperAdminLayoutProps {
  children: React.ReactNode;
}

export default function CRMSuperAdminLayout({
  children,
}: CRMSuperAdminLayoutProps) {
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
              <SidebarNavItem
                to="/crm/superadmin/sales-managers"
                icon={UserCheck}
              >
                Sales Managers
              </SidebarNavItem>
              <SidebarNavItem
                to="/crm/superadmin/sales-executives"
                icon={Users}
              >
                Sales Executives
              </SidebarNavItem>
              <SidebarNavItem to="/crm/superadmin/notifications" icon={Bell}>
                <div className="flex items-center justify-between w-full">
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
              className="w-full justify-start"
              isCollapsed={isCollapsed}
            />
          </div>
        </SidebarFooter>
      </Sidebar>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-gray-900">
              CRM Management
            </h1>
          </div>
        </header>

        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
