import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserCheck, Users, GraduationCap } from "lucide-react";
import { schoolAdminService } from "@/api/schoolAdminService";
// leadMentorService intentionally not used for lead mentor dashboard per requirements
import { mentorService } from "@/api/mentorService";
import { studentService } from "@/api/studentService";
import { useAuth } from "@/contexts/AuthContext";

interface DashboardStats {
  schoolAdmins: number;
  // leadMentors intentionally not displayed for lead mentor role
  schoolMentors: number;
  students: number;
  totalUsers: number;
}


export default function LeadMentorDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    schoolAdmins: 0,
    schoolMentors: 0,
    students: 0,
    totalUsers: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [schoolAdminsRes, mentorsRes, studentsRes] = await Promise.all([
        schoolAdminService.getAll(),
        mentorService.getAll(),
        studentService.getAll(),
      ]);

      const schoolAdminsCount = schoolAdminsRes.success ? schoolAdminsRes.data.length : 0;
      const mentorsCount = mentorsRes.success ? mentorsRes.data.length : 0;
      const studentsCount = studentsRes.success ? studentsRes.data.length : 0;

      setStats({
        schoolAdmins: schoolAdminsCount,
        schoolMentors: mentorsCount,
        students: studentsCount,
        totalUsers: schoolAdminsCount + mentorsCount + studentsCount,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };


  const statCards = [
    {
      title: "School Mentors",
      value: stats.schoolMentors,
      icon: Users,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
    {
      title: "School Admins",
      value: stats.schoolAdmins,
      icon: UserCheck,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Students",
      value: stats.students,
      icon: GraduationCap,
      color: "text-indigo-600",
      bgColor: "bg-indigo-100",
    },
    // {
    //   title: "Total Users",
    //   value: stats.totalUsers,
    //   icon: Users,
    //   color: "text-purple-600",
    //   bgColor: "bg-purple-100",
    // },
  ];

  return (
    <div className="space-y-3 sm:space-y-4 lg:space-y-6">
      <div>
        <h1 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold">Lead Mentor Dashboard</h1>
        <p className="text-xs sm:text-sm lg:text-base text-gray-600">Manage school administrators and lead mentors</p>
      </div>

      <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-6">
        {statCards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
              <CardTitle className="text-xs sm:text-sm font-medium">{card.title}</CardTitle>
              <div className={`p-1.5 sm:p-2 rounded-full ${card.bgColor}`}>
                <card.icon className={`h-3 w-3 sm:h-4 sm:w-4 ${card.color}`} />
              </div>
            </CardHeader>
            <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
              <div className="text-base sm:text-lg lg:text-xl xl:text-2xl font-bold">
                {loading ? "..." : card.value}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
        <Card>
          <CardHeader className="px-3 sm:px-6 pt-3 sm:pt-6">
            <CardTitle className="text-sm sm:text-base lg:text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6 space-y-2 sm:space-y-3">
            <div className="grid grid-cols-1 gap-2">
              <a 
                href="/leadmentor/school-admins/create" 
                className="flex items-center p-2 sm:p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors touch-manipulation"
              >
                <UserCheck className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 mr-2 sm:mr-3 flex-shrink-0" />
                <span className="text-xs sm:text-sm lg:text-base font-medium">Invite School Admin</span>
              </a>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="px-3 sm:px-6 pt-3 sm:pt-6">
            <CardTitle className="text-sm sm:text-base lg:text-lg">Management Overview</CardTitle>
          </CardHeader>
          <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
            <div className="space-y-2 sm:space-y-3 lg:space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs sm:text-sm text-gray-600">School Mentors</span>
                <span className="text-sm sm:text-base font-medium">{stats.schoolMentors}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs sm:text-sm text-gray-600">School Administrators</span>
                <span className="text-sm sm:text-base font-medium">{stats.schoolAdmins}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs sm:text-sm text-gray-600">Students</span>
                <span className="text-sm sm:text-base font-medium">{stats.students}</span>
              </div>
              <div className="border-t pt-2 sm:pt-3 lg:pt-4">
                <div className="flex justify-between items-center font-semibold text-xs sm:text-sm lg:text-base">
                  <span>Total Managed Users</span>
                  <span>{stats.totalUsers}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}
