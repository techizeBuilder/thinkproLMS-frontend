import { Outlet } from "react-router-dom";
import { StudentSidebar } from "@/components/ui/student-sidebar";
import {
  SidebarProvider,
  useSidebar,
} from "@/components/ui/collapsible-sidebar";
import { useState, useEffect } from "react";
import { studentService } from "@/api/studentService";
import type { Student } from "@/api/studentService";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { User } from "lucide-react";

function StudentContent({ student }: { student: Student | null }) {
  const { toggle, isMobile } = useSidebar();
  const { user } = useAuth();

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <header className="h-14 sm:h-16 border-b bg-background px-3 sm:px-4 lg:px-6 flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-4">
          {isMobile && (
            <button
              onClick={toggle}
              className="p-2 rounded-md hover:bg-accent lg:hidden touch-manipulation"
              aria-label="Open menu">
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 sm:gap-3 truncate">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-indigo-500 flex-shrink-0" />
                <h1 className="text-base sm:text-lg md:text-xl font-semibold truncate">
                  {user?.name || student?.user?.name || "User"}
                </h1>
              </div>
              <Badge
                variant="secondary"
                className="text-[10px] sm:text-xs flex-shrink-0">
                Student
              </Badge>
            </div>
          </div>
        </div>
      </header>
      <main className="flex-1 overflow-auto">
        <div className="px-3 sm:px-0">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default function Student() {
  const [student, setStudent] = useState<Student | null>(null);

  useEffect(() => {
    fetchStudentProfile();
  }, []);

  const fetchStudentProfile = async () => {
    try {
      const response = await studentService.getMyProfile();
      if (response.success) {
        setStudent(response.data);
      }
    } catch (error) {
      console.error("Error fetching student profile:", error);
    }
  };

  return (
    <SidebarProvider defaultCollapsed={false}>
      <div className="flex h-screen bg-background">
        <StudentSidebar />
        <StudentContent student={student} />
      </div>
    </SidebarProvider>
  );
}
