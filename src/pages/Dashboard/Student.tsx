import { Outlet } from "react-router-dom";
import { StudentSidebar } from "@/components/ui/student-sidebar"
import { SidebarProvider } from "@/components/ui/collapsible-sidebar"
import { useState, useEffect } from "react"
import { studentService } from "@/api/studentService"
import type { Student } from "@/api/studentService"

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
        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="h-16 border-b bg-background px-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold">
                Student Dashboard {student?.studentId && `(${student.studentId})`}
              </h1>
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
