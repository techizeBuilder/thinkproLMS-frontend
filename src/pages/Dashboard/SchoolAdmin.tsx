import { Outlet } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/collapsible-sidebar";
import { SchoolAdminSidebar } from "@/components/ui/school-admin-sidebar";

export default function SchoolAdmin() {
  return (
    <SidebarProvider>
      <div className="flex h-screen bg-background">
        <SchoolAdminSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="h-16 border-b bg-background px-6 flex items-center">
            <h1 className="text-2xl font-semibold">School Admin Dashboard</h1>
          </header>
          <main className="flex-1 overflow-auto">
            <div className="p-6">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
