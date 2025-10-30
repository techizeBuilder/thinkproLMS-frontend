import { Sidebar, SidebarContent, SidebarHeader, SidebarTitle, SidebarToggle, SidebarFooter, useSidebar } from "@/components/ui/collapsible-sidebar";
import { LogoutButton } from "@/components/ui/logout-button";

export default function CRMSalesExecutiveLayout() {
  const { isCollapsed } = useSidebar();
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
        <SidebarContent />
        <SidebarFooter>
          <div className="p-3">
            <LogoutButton variant="ghost" size={isCollapsed ? "icon" : "default"} className="w-full justify-start" isCollapsed={isCollapsed} />
          </div>
        </SidebarFooter>
      </Sidebar>

      <main className="flex-1 overflow-auto bg-gray-50">
        <div className="p-6">
          <h1 className="text-2xl font-semibold">Sales Executive</h1>
          <p className="text-gray-600 mt-2">Welcome to your CRM area.</p>
        </div>
      </main>
    </div>
  );
}


