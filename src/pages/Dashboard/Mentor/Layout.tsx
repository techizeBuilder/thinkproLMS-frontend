import { Outlet } from "react-router-dom";
import { MentorSidebar } from "@/components/ui/mentor-sidebar";
import { SidebarProvider } from "@/components/ui/collapsible-sidebar";

export default function MentorLayout() {
  return (
    <SidebarProvider defaultCollapsed={false}>
      <div className="flex min-h-screen bg-background">
        <MentorSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="h-16 border-b bg-background px-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold">Mentor Portal</h1>
              <p className="text-sm text-muted-foreground">
                Guide and support your students' learning journey
              </p>
            </div>
          </header>
          <main className="flex-1 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
