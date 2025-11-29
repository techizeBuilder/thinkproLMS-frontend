import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  School,
  UserCheck,
  Crown,
  Building2,
  Users,
  GraduationCap,
} from "lucide-react";
import { schoolService } from "@/api/schoolService";
import { schoolAdminService } from "@/api/schoolAdminService";
import { leadMentorService } from "@/api/leadMentorService";
import { mentorService } from "@/api/mentorService";
import { studentService } from "@/api/studentService";

interface DashboardStats {
  schools: number;
  activeSchools: number;
  inactiveSchools: number;
  schoolAdmins: number;
  leadMentors: number;
  schoolMentors: number;
  students: number;
  totalUsers: number;
}

export default function SuperAdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    schools: 0,
    activeSchools: 0,
    inactiveSchools: 0,
    schoolAdmins: 0,
    leadMentors: 0,
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
      const [
        schoolsCountRes,
        schoolAdminsCountRes,
        leadMentorsCountRes,
        mentorsCountRes,
        studentsCountRes,
      ] = await Promise.all([
        schoolService.getCount({ includeInactive: true }), // Get all counts (total, active, inactive)
        schoolAdminService.getCount(),
        leadMentorService.getCount(),
        mentorService.getCount(),
        studentService.getCount(),
      ]);

      const schoolCounts = schoolsCountRes.success
        ? schoolsCountRes.data
        : { total: 0, active: 0, inactive: 0 };
      const schoolAdminsCount = schoolAdminsCountRes.success
        ? schoolAdminsCountRes.data.count
        : 0;
      const leadMentorsCount = leadMentorsCountRes.success
        ? leadMentorsCountRes.data.count
        : 0;
      const mentorsCount = mentorsCountRes.success
        ? mentorsCountRes.data.count
        : 0;
      const studentsCount = studentsCountRes.success
        ? studentsCountRes.data.count
        : 0;

      setStats({
        schools: schoolCounts.total,
        activeSchools: schoolCounts.active,
        inactiveSchools: schoolCounts.inactive,
        schoolAdmins: schoolAdminsCount,
        leadMentors: leadMentorsCount,
        schoolMentors: mentorsCount,
        students: studentsCount,
        totalUsers:
          schoolAdminsCount + leadMentorsCount + mentorsCount + studentsCount,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: "Active Schools",
      value: stats.activeSchools,
      icon: School,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Lead Mentors",
      value: stats.leadMentors,
      icon: Crown,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
    },
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
    {
      title: "Total Users",
      value: stats.totalUsers,
      icon: Building2,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">
          SuperAdmin Dashboard
        </h1>
        <p className="text-gray-600 text-xs sm:text-sm md:text-base">
          Overview of your school management system
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
        {statCards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {card.title}
              </CardTitle>
              <div className={`p-2 rounded-full ${card.bgColor}`}>
                <card.icon className={`h-4 w-4 ${card.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? "..." : card.value}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 gap-2">
              <a
                href="/superadmin/schools/create"
                className="flex items-center p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                <School className="h-5 w-5 text-blue-600 mr-3" />
                <span className="font-medium">Add New School</span>
              </a>
              <a
                href="/superadmin/school-admins/create"
                className="flex items-center p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
                <UserCheck className="h-5 w-5 text-green-600 mr-3" />
                <span className="font-medium">Invite School Admin</span>
              </a>
              <a
                href="/superadmin/lead-mentors/create"
                className="flex items-center p-3 bg-yellow-50 hover:bg-yellow-100 rounded-lg transition-colors">
                <Crown className="h-5 w-5 text-yellow-600 mr-3" />
                <span className="font-medium">Invite Lead Mentor</span>
              </a>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Active Schools</span>
                <span className="font-medium">{stats.activeSchools}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Schools</span>
                <span className="font-medium">{stats.schools}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Inactive Schools</span>
                <span className="font-medium">{stats.inactiveSchools}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Lead Mentors</span>
                <span className="font-medium">{stats.leadMentors}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">School Mentors</span>
                <span className="font-medium">{stats.schoolMentors}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">
                  School Administrators
                </span>
                <span className="font-medium">{stats.schoolAdmins}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Students</span>
                <span className="font-medium">{stats.students}</span>
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between items-center font-semibold">
                  <span>Total System Users</span>
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
