import { Outlet } from "react-router-dom";
import { useState, useEffect } from "react";
import { MentorSidebar } from "@/components/ui/mentor-sidebar";
import { SidebarProvider, useSidebar } from "@/components/ui/collapsible-sidebar";
import { mentorService } from "@/api/mentorService";

interface Mentor {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
    isVerified: boolean;
    createdAt: string;
  };
  assignedSchools: {
    _id: string;
    name: string;
    city: string;
    state: string;
    boards: string[];
    branchName: string;
  }[];
  isActive: boolean;
}

function MentorLayoutContent() {
  const { toggle, isMobile } = useSidebar();
  const [mentor, setMentor] = useState<Mentor | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMentorProfile = async () => {
      try {
        const response = await mentorService.getMyProfile();
        if (response.success) {
          setMentor(response.data);
        }
      } catch (error) {
        console.error("Error fetching mentor profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMentorProfile();
  }, []);

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
            {loading ? (
              <h1 className="text-base md:text-xl font-semibold truncate">Loading...</h1>
            ) : mentor && mentor.user && mentor.assignedSchools && mentor.assignedSchools.length > 0 ? (
              <h1 className="text-base md:text-xl font-semibold truncate">
                {mentor.user.name} - {mentor.assignedSchools.length > 1 
                  ? `${mentor.assignedSchools[0].name} (+${mentor.assignedSchools.length - 1} more)`
                  : mentor.assignedSchools[0].name}
              </h1>
            ) : (
              <h1 className="text-base md:text-xl font-semibold truncate">School Mentor Portal</h1>
            )}
            <p className="text-xs md:text-sm text-muted-foreground hidden sm:block">
              Guide and support your students' learning journey
            </p>
          </div>
        </div>
      </header>
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}

export default function MentorLayout() {
  return (
    <SidebarProvider defaultCollapsed={false}>
      <div className="flex h-screen bg-background">
        <MentorSidebar />
        <MentorLayoutContent />
      </div>
    </SidebarProvider>
  );
}
