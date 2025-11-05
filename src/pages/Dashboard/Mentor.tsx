import { useState, useEffect } from "react";
import { MentorSidebar } from "@/components/ui/mentor-sidebar"
import { SidebarProvider, useSidebar } from "@/components/ui/collapsible-sidebar"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { Users, BookOpen, MessageSquare } from "lucide-react"
import { mentorService } from "@/api/mentorService"
import { studentService } from "@/api/studentService"
import { useAuth } from "@/contexts/AuthContext"
import { Badge } from "@/components/ui/badge"

interface School {
  _id: string;
  name: string;
  city: string;
  state: string;
  boards: string[];
  branchName?: string;
}

interface Mentor {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
    isVerified: boolean;
    createdAt: string;
  };
  assignedSchools: School[];
  isActive: boolean;
}

function MentorContent() {
  const { toggle, isMobile } = useSidebar();
  const { user } = useAuth();
  const [mentor, setMentor] = useState<Mentor | null>(null);
  const [studentCount, setStudentCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMentorProfile();
  }, []);

  useEffect(() => {
    if (mentor && mentor.assignedSchools && mentor.assignedSchools.length > 0) {
      fetchStudentCount();
    }
  }, [mentor]);

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

  const fetchStudentCount = async () => {
    if (!mentor || !mentor.assignedSchools || mentor.assignedSchools.length === 0) {
      setStudentCount(0);
      return;
    }

    try {
      // Count students from all assigned schools
      let totalStudents = 0;
      for (const school of mentor.assignedSchools) {
        const response = await studentService.getAll({ schoolId: school._id });
        if (response.success) {
          totalStudents += response.data.length;
        }
      }
      setStudentCount(totalStudents);
    } catch (error) {
      console.error("Error fetching student count:", error);
      setStudentCount(0);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 border-b bg-background px-4 md:px-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Mobile menu button */}
            {isMobile && (
              <button
                onClick={toggle}
                className="p-2 rounded-md hover:bg-accent"
                aria-label="Open menu"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 sm:gap-3 truncate">
                <h1 className="text-base sm:text-lg md:text-xl font-semibold truncate">
                  {user?.name || "User"}
                </h1>
                <Badge variant="secondary" className="text-[10px] sm:text-xs flex-shrink-0">Mentor</Badge>
              </div>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-auto">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-muted-foreground">Loading dashboard...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <header className="h-16 border-b bg-background px-4 md:px-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Mobile menu button */}
          {isMobile && (
            <button
              onClick={toggle}
              className="p-2 rounded-md hover:bg-accent"
              aria-label="Open menu"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 sm:gap-3 truncate">
              <h1 className="text-base sm:text-lg md:text-xl font-semibold truncate">
                {user?.name || (mentor?.user?.name ?? "User")}
              </h1>
              <Badge variant="secondary" className="text-[10px] sm:text-xs flex-shrink-0">Mentor</Badge>
            </div>
          </div>
        </div>
      </header>
      <main className="flex-1 overflow-auto">
        <div className="p-4 md:p-6 space-y-4 md:space-y-6">
          {/* Dashboard Stats */}
          <div className="grid gap-3 md:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  My Students
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-xl md:text-2xl font-bold">{studentCount}</div>
                <p className="text-xs text-muted-foreground">
                  Students in assigned school
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Courses Taught
                </CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-xl md:text-2xl font-bold">0</div>
                <p className="text-xs text-muted-foreground">
                  Active courses
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Messages
                </CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-xl md:text-2xl font-bold">0</div>
                <p className="text-xs text-muted-foreground">
                  Unread messages
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <div className="grid gap-3 md:gap-4 grid-cols-1 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg md:text-xl">Recent Messages</CardTitle>
                <CardDescription className="text-xs md:text-sm">
                  Latest student communications
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-6 md:py-8 text-muted-foreground text-sm">
                  No recent messages
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg md:text-xl">Student Progress</CardTitle>
                <CardDescription className="text-xs md:text-sm">
                  Overview of student performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-6 md:py-8 text-muted-foreground text-sm">
                  No student data available
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function Mentor() {
  return (
    <SidebarProvider defaultCollapsed={false}>
      <div className="flex h-screen bg-background">
        <MentorSidebar />
        <MentorContent />
      </div>
    </SidebarProvider>
  );
}
