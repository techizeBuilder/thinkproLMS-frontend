import React from "react";
import { Outlet, useLocation } from "react-router-dom";
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
  SidebarFooter
} from "@/components/ui/collapsible-sidebar";
import { Users, UserCheck, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function CRMSuperAdminLayout() {
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
        
        <SidebarContent className="space-y-4">
          <SidebarGroup label="Management">
            <SidebarNav>
              <SidebarNavItem 
                to="/crm/superadmin/sales-managers" 
                icon={UserCheck}
                className={cn(
                  isActive("/crm/superadmin/sales-managers") && "bg-green-100 text-green-700 border border-green-200"
                )}
              >
                Sales Managers
              </SidebarNavItem>
              <SidebarNavItem 
                to="/crm/superadmin/sales-executives" 
                icon={Users}
                className={cn(
                  isActive("/crm/superadmin/sales-executives") && "bg-green-100 text-green-700 border border-green-200"
                )}
              >
                Sales Executives
              </SidebarNavItem>
            </SidebarNav>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <div className="space-y-1">
            {!isCollapsed ? (
              <Link to="/superadmin">
                <Button
                  variant="ghost"
                  className="w-full justify-start text-sm"
                >
                  <Building2 className="mr-3 h-4 w-4" />
                  <span>Back to LMS</span>
                </Button>
              </Link>
            ) : (
              <Link to="/superadmin">
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-full"
                >
                  <Building2 className="h-4 w-4" />
                  <span className="sr-only">Back to LMS</span>
                </Button>
              </Link>
            )}
          </div>
        </SidebarFooter>
      </Sidebar>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-gray-900">CRM Management</h1>
          </div>
        </header>
        
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
