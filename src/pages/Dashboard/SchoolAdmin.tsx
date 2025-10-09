import { Outlet } from "react-router-dom";
import { SidebarProvider, useSidebar } from "@/components/ui/collapsible-sidebar";
import { SchoolAdminSidebar } from "@/components/ui/school-admin-sidebar";

function SchoolAdminContent() {
  const { toggle, isMobile } = useSidebar();

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <header className="h-16 border-b bg-background px-4 md:px-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Mobile menu button */}
          {isMobile && (
            <button
              onClick={toggle}
              className="p-2 rounded-md hover:bg-accent md:hidden"
              aria-label="Open menu"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          )}
          <div className="flex-1 min-w-0">
            <h1 className="text-xl md:text-2xl font-semibold truncate">School Admin Dashboard</h1>
            <p className="text-sm text-muted-foreground hidden sm:block">
              Manage your school and students
            </p>
          </div>
        </div>
      </header>
      <main className="flex-1 overflow-auto">
        <div className="p-4 md:p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default function SchoolAdmin() {
  return (
    <SidebarProvider defaultCollapsed={false}>
      <div className="flex h-screen bg-background">
        <SchoolAdminSidebar />
        <SchoolAdminContent />
      </div>
    </SidebarProvider>
  );
}
