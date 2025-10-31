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
import { NotebookPen, Table } from "lucide-react";
import { useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

interface CRMSalesExecutiveLayoutProps {
  children?: React.ReactNode;
}

export default function CRMSalesExecutiveLayout({
  children,
}: CRMSalesExecutiveLayoutProps) {
  const { isCollapsed } = useSidebar();
  const location = useLocation();
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
            </SidebarNav>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <div className="p-3">
            <LogoutButton
              variant="ghost"
              size={isCollapsed ? "icon" : "default"}
              className="w-full justify-start"
              isCollapsed={isCollapsed}
            />
          </div>
        </SidebarFooter>
      </Sidebar>

      <main className="flex-1 overflow-auto bg-gray-50">{children}</main>
    </div>
  );
}
