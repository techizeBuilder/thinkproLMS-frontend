import { useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
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
import { Users, NotebookPen } from "lucide-react";
import { LogoutButton } from "@/components/ui/logout-button";

interface CRMSalesManagerLayoutProps {
  children: React.ReactNode;
}

export default function CRMSalesManagerLayout({ children }: CRMSalesManagerLayoutProps) {
  const { isCollapsed } = useSidebar();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="flex h-screen">
      <Sidebar className="h-screen">
        <SidebarHeader>
          <div className="flex items-center gap-2">
            <img src="/fancy-logo.jpg" alt="ThinkPro Logo" className="h-8 w-8 object-contain" />
            <SidebarTitle>CRM Portal</SidebarTitle>
          </div>
          <SidebarToggle />
        </SidebarHeader>

        <SidebarContent className="space-y-4">
          <SidebarGroup label="Management">
            <SidebarNav>
              <SidebarNavItem
                to="/crm/sales-manager/sales-executives"
                icon={Users}
                className={cn(
                  isActive("/crm/sales-manager/sales-executives") &&
                    "bg-green-100 text-green-700 border border-green-200"
                )}
              >
                Sales Executives
              </SidebarNavItem>
              <SidebarNavItem
                to="/crm/sales-manager/leads"
                icon={NotebookPen}
                className={cn(
                  isActive("/crm/sales-manager/leads") &&
                    "bg-green-100 text-green-700 border border-green-200"
                )}
              >
                Leads
              </SidebarNavItem>
            </SidebarNav>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <div className="p-3">
            <LogoutButton variant="ghost" size={isCollapsed ? "icon" : "default"} className="w-full justify-start" isCollapsed={isCollapsed} />
          </div>
        </SidebarFooter>
      </Sidebar>

      <main className="flex-1 overflow-auto bg-gray-50">{children}</main>
    </div>
  );
}


