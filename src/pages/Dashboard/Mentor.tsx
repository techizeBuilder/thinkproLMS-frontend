import { useState, useEffect } from "react";
import { MentorSidebar } from "@/components/ui/mentor-sidebar"
import { SidebarProvider } from "@/components/ui/collapsible-sidebar"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Users, BookOpen, MessageSquare, GraduationCap } from "lucide-react"
import { mentorService } from "@/api/mentorService"
import { studentService } from "@/api/studentService"

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

export default function Mentor() {
  const [mentor, setMentor] = useState<Mentor | null>(null);
  const [selectedSchool, setSelectedSchool] = useState("all");
  const [studentCount, setStudentCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMentorProfile();
  }, []);

  useEffect(() => {
    if (mentor && mentor.assignedSchools.length > 0) {
      fetchStudentCount();
    }
  }, [mentor, selectedSchool]);

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
    if (!mentor || mentor.assignedSchools.length === 0) {
      setStudentCount(0);
      return;
    }

    try {
      let totalStudents = 0;

      if (selectedSchool === "all") {
        // Count students from all assigned schools
        for (const school of mentor.assignedSchools) {
          const response = await studentService.getAll({ schoolId: school._id });
          if (response.success) {
            totalStudents += response.data.length;
          }
        }
      } else {
        // Count students from selected school
        const response = await studentService.getAll({ schoolId: selectedSchool });
        if (response.success) {
          totalStudents = response.data.length;
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
      <SidebarProvider defaultCollapsed={false}>
        <div className="flex h-screen bg-background">
          <MentorSidebar />
          <div className="flex-1 flex flex-col overflow-hidden">
            <header className="h-16 border-b bg-background px-6 flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-semibold">Mentor Dashboard</h1>
                <p className="text-sm text-muted-foreground">
                  Guide and support your students' learning journey
                </p>
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
        </div>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider defaultCollapsed={false}>
      <div className="flex h-screen bg-background">
        <MentorSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="h-16 border-b bg-background px-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold">Mentor Dashboard</h1>
              <p className="text-sm text-muted-foreground">
                Guide and support your students' learning journey
              </p>
            </div>
          </header>
          <main className="flex-1 overflow-auto">
            <div className="p-6 space-y-6">
              {/* School Selection */}
              {mentor && mentor.assignedSchools.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>School Selection</CardTitle>
                    <CardDescription>
                      Select a school to view specific statistics
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Select value={selectedSchool} onValueChange={setSelectedSchool}>
                      <SelectTrigger className="w-full max-w-md">
                        <SelectValue placeholder="Select School" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Assigned Schools</SelectItem>
                        {mentor.assignedSchools.map((school) => (
                          <SelectItem key={school._id} value={school._id}>
                            {school.name}
                            {school.branchName && ` - ${school.branchName}`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </CardContent>
                </Card>
              )}

              {/* Dashboard Stats */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      My Students
                    </CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{studentCount}</div>
                    <p className="text-xs text-muted-foreground">
                      {selectedSchool === "all" 
                        ? "Total students across all schools" 
                        : "Students in selected school"}
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Assigned Schools
                    </CardTitle>
                    <GraduationCap className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {mentor ? mentor.assignedSchools.length : 0}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Schools under your guidance
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
                    <div className="text-2xl font-bold">0</div>
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
                    <div className="text-2xl font-bold">0</div>
                    <p className="text-xs text-muted-foreground">
                      Unread messages
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activity */}
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Messages</CardTitle>
                    <CardDescription>
                      Latest student communications
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8 text-muted-foreground">
                      No recent messages
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Student Progress</CardTitle>
                    <CardDescription>
                      Overview of student performance
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8 text-muted-foreground">
                      No student data available
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
