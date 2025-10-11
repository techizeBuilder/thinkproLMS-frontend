import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  GraduationCap, 
  School as SchoolIcon,
  UserCheck
} from "lucide-react";
import { schoolAdminService } from "@/api/schoolAdminService";
import { toast } from "sonner";

interface DashboardStats {
  totalMentors: number;
  totalStudents: number;
}

export default function SchoolAdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalMentors: 0,
    totalStudents: 0
  });
  const [schoolAdmin, setSchoolAdmin] = useState<any>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load mentors and students data
      const [mentorsRes, studentsRes] = await Promise.all([
        schoolAdminService.getMentors(),
        schoolAdminService.getStudents()
      ]);

      if (mentorsRes.success) {
        setSchoolAdmin(mentorsRes.data.schoolAdmin);
      }

      // Calculate stats
      const totalMentors = mentorsRes.success ? mentorsRes.data.mentors.length : 0;
      const totalStudents = studentsRes.success ? studentsRes.data.students.length : 0;

      setStats({
        totalMentors,
        totalStudents
      });

    } catch (error) {
      console.error("Error loading dashboard data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">School Admin Dashboard</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Welcome back, {schoolAdmin?.name || "School Admin"}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <SchoolIcon className="h-4 w-4 md:h-5 md:w-5 text-primary" />
          <span className="text-xs md:text-sm text-muted-foreground">
            {schoolAdmin?.assignedSchool ? schoolAdmin.assignedSchool.name : "No School Assigned"}
          </span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">Total Mentors</CardTitle>
            <UserCheck className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold">{stats.totalMentors}</div>
            <p className="text-xs text-muted-foreground">
              School mentors in assigned school
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">Total Students</CardTitle>
            <GraduationCap className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold">{stats.totalStudents}</div>
            <p className="text-xs text-muted-foreground">
              Students in assigned school
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
