import { Outlet } from "react-router-dom";
import { StudentSidebar } from "@/components/ui/student-sidebar"
import { SidebarProvider, useSidebar } from "@/components/ui/collapsible-sidebar"
import { useState, useEffect } from "react"
import { studentService } from "@/api/studentService"
import type { Student } from "@/api/studentService"

function StudentContent({ student }: { student: Student | null }) {
  const { toggle, isMobile } = useSidebar()

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <header className="h-16 border-b bg-background px-4 md:px-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
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
            <h1 className="text-xl md:text-2xl font-semibold truncate">
              Student Dashboard {student?.studentId && `(${student.studentId})`}
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">
              Track your learning progress and achievements
            </p>
          </div>
        </div>
      </header>
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
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
  )
}
