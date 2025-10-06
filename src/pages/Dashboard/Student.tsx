import { Outlet } from "react-router-dom";
import { StudentSidebar } from "@/components/ui/student-sidebar"
import { SidebarProvider } from "@/components/ui/collapsible-sidebar"

export default function Student() {
  return (
    <SidebarProvider defaultCollapsed={false}>
      <div className="flex h-screen bg-background">
        <StudentSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="h-16 border-b bg-background px-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold">Student Dashboard</h1>
              <p className="text-sm text-muted-foreground">
                Track your learning progress and achievements
              </p>
            </div>
          </header>
          <main className="flex-1 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
