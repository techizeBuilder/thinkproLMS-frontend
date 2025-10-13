import { Outlet } from "react-router-dom";
import { SidebarProvider, useSidebar } from "@/components/ui/collapsible-sidebar";
import { LeadMentorSidebar } from "@/components/ui/lead-mentor-sidebar";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";

function LeadMentorContent() {
  const { toggle, isMobile } = useSidebar();
  const { user } = useAuth();

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
            <div className="flex items-center gap-2 sm:gap-3 truncate">
              <h1 className="text-base sm:text-lg md:text-xl font-semibold truncate">{user?.name || "User"}</h1>
              <Badge variant="secondary" className="text-[10px] sm:text-xs flex-shrink-0">Lead Mentor</Badge>
            </div>
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

export default function LeadMentor() {
  return (
    <SidebarProvider defaultCollapsed={false}>
      <div className="flex h-screen bg-background">
        <LeadMentorSidebar />
        <LeadMentorContent />
      </div>
    </SidebarProvider>
  );
}
