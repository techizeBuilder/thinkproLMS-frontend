import { Outlet } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/collapsible-sidebar";
import { SchoolAdminSidebar } from "@/components/ui/school-admin-sidebar";

export default function SchoolAdmin() {
  return (
    <SidebarProvider>
      <div className="flex h-screen bg-gray-50">
        <SchoolAdminSidebar />
        <main className="flex-1 overflow-auto">
          <div className="p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
