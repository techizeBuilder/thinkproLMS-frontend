import { Outlet } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/collapsible-sidebar";
import { LeadMentorSidebar } from "@/components/ui/lead-mentor-sidebar";

export default function LeadMentor() {
  return (
    <SidebarProvider>
      <div className="flex h-screen bg-gray-50">
        <LeadMentorSidebar />
        <main className="flex-1 overflow-auto">
          <div className="p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
