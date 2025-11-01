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
      <Sidebar className="h-screen bg-[#333A47] text-white border-r-0">
        <SidebarHeader className="bg-[#333A47] border-[#7F91AA]/20">
          <div className="flex items-center gap-2">
            <img
              src="/fancy-logo.jpg"
              alt="ThinkPro Logo"
              className="h-8 w-8 object-contain"
            />
            <SidebarTitle className="text-[#FF944E]">CRM Portal</SidebarTitle>
          </div>
          <SidebarToggle />
        </SidebarHeader>
        <SidebarContent className="bg-[#333A47]">
          <SidebarGroup label="Management" className="[&>h3]:text-[#C9C9C9]">
            <SidebarNav>
              <SidebarNavItem
                to="/crm/sales-executive/leads"
                icon={NotebookPen}
                className={cn(
                  "text-[#C9C9C9] hover:bg-white/5 hover:text-white",
                  isActive("/crm/sales-executive/leads") &&
                    "bg-[#FF944E] text-[#0C0C0C] border border-[#FF944E] hover:text-[#0C0C0C]"
                )}
              >
                Leads
              </SidebarNavItem>
              <SidebarNavItem
                to="/crm/sales-executive/summary"
                icon={Table}
                className={cn(
                  "text-[#C9C9C9] hover:bg-white/5 hover:text-white",
                  isActive("/crm/sales-executive/summary") &&
                    "bg-[#FF944E] text-[#0C0C0C] border border-[#FF944E] hover:text-[#0C0C0C]"
                )}
              >
                Summary
              </SidebarNavItem>
            </SidebarNav>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter className="bg-[#333A47] border-[#7F91AA]/20">
          <div className="p-3">
            <LogoutButton
              variant="ghost"
              size={isCollapsed ? "icon" : "default"}
              className="w-full justify-start text-[#C9C9C9] hover:text-white hover:bg-white/5"
              isCollapsed={isCollapsed}
            />
          </div>
        </SidebarFooter>
      </Sidebar>

      <main className="flex-1 overflow-auto bg-gray-50">{children}</main>
    </div>
  );
}
