import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Users, MessageSquare } from "lucide-react";
import { mentorService } from "@/api/mentorService";
import { studentService } from "@/api/studentService";

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

export default function MentorDashboard() {
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
      // Get student count - backend will handle filtering based on mentor's assigned schools
      const response = await studentService.getCount();
      if (response.success) {
        setStudentCount(response.data.count);
      } else {
        setStudentCount(0);
      }
    } catch (error) {
      console.error("Error fetching student count:", error);
      setStudentCount(0);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6">
      {/* School Selection */}
      {mentor && mentor.assignedSchools && mentor.assignedSchools.length > 0 && (
        <Card>
          <CardHeader className="px-3 sm:px-6 pt-3 sm:pt-6">
            <CardTitle className="text-sm sm:text-base lg:text-lg">Assigned Schools ({mentor.assignedSchools.length})</CardTitle>
            <CardDescription className="text-xs sm:text-sm">Your assigned school details</CardDescription>
          </CardHeader>
          <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
            <div className="space-y-3">
              {mentor.assignedSchools.map((school) => (
                <div key={school._id} className="border rounded-lg p-3 bg-muted/30">
                  <div className="text-base sm:text-lg font-semibold">
                    {school.name}
                    {school.branchName && ` - ${school.branchName}`}
                  </div>
                  <div className="text-xs sm:text-sm text-muted-foreground">
                    {school.city}, {school.state}
                  </div>
                  {school.boards && school.boards.length > 0 && (
                    <div className="text-xs sm:text-sm text-muted-foreground">
                      Boards: {school.boards.join(", ")}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dashboard Stats */}
      <div className="grid gap-3 sm:gap-4 grid-cols-1 xs:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
            <CardTitle className="text-xs sm:text-sm font-medium">My Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
            <div className="text-lg sm:text-xl lg:text-2xl font-bold">{studentCount}</div>
            <p className="text-[10px] sm:text-xs text-muted-foreground">
              Students in your assigned schools
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
            <CardTitle className="text-xs sm:text-sm font-medium">Messages</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
            <div className="text-lg sm:text-xl lg:text-2xl font-bold">0</div>
            <p className="text-[10px] sm:text-xs text-muted-foreground">Unread messages</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid gap-3 sm:gap-4 grid-cols-1 lg:grid-cols-2">
        <Card>
          <CardHeader className="px-3 sm:px-6 pt-3 sm:pt-6">
            <CardTitle className="text-sm sm:text-base lg:text-lg">Recent Messages</CardTitle>
            <CardDescription className="text-xs sm:text-sm">Latest student communications</CardDescription>
          </CardHeader>
          <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
            <div className="text-center py-6 sm:py-8 text-muted-foreground text-xs sm:text-sm">
              No recent messages
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="px-3 sm:px-6 pt-3 sm:pt-6">
            <CardTitle className="text-sm sm:text-base lg:text-lg">Student Progress</CardTitle>
            <CardDescription className="text-xs sm:text-sm">Overview of student performance</CardDescription>
          </CardHeader>
          <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
            <div className="text-center py-6 sm:py-8 text-muted-foreground text-xs sm:text-sm">
              No student data available
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
