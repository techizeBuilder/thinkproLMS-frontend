import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserCheck, Crown, Users } from "lucide-react";
import { schoolAdminService } from "@/api/schoolAdminService";
import { leadMentorService } from "@/api/leadMentorService";

interface DashboardStats {
  schoolAdmins: number;
  leadMentors: number;
  totalUsers: number;
}

export default function LeadMentorDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    schoolAdmins: 0,
    leadMentors: 0,
    totalUsers: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [schoolAdminsRes, leadMentorsRes] = await Promise.all([
        schoolAdminService.getAll(),
        leadMentorService.getAll(),
      ]);

      setStats({
        schoolAdmins: schoolAdminsRes.success ? schoolAdminsRes.data.length : 0,
        leadMentors: leadMentorsRes.success ? leadMentorsRes.data.length : 0,
        totalUsers: (schoolAdminsRes.success ? schoolAdminsRes.data.length : 0) + 
                   (leadMentorsRes.success ? leadMentorsRes.data.length : 0),
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: "School Admins",
      value: stats.schoolAdmins,
      icon: UserCheck,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Lead Mentors",
      value: stats.leadMentors,
      icon: Crown,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
    },
    {
      title: "Total Users",
      value: stats.totalUsers,
      icon: Users,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Lead Mentor Dashboard</h1>
        <p className="text-gray-600">Manage school administrators and lead mentors</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
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
                href="/leadmentor/school-admins/create" 
                className="flex items-center p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
              >
                <UserCheck className="h-5 w-5 text-green-600 mr-3" />
                <span className="font-medium">Invite School Admin</span>
              </a>
              <a 
                href="/leadmentor/lead-mentors/create" 
                className="flex items-center p-3 bg-yellow-50 hover:bg-yellow-100 rounded-lg transition-colors"
              >
                <Crown className="h-5 w-5 text-yellow-600 mr-3" />
                <span className="font-medium">Invite Lead Mentor</span>
              </a>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Management Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">School Administrators</span>
                <span className="font-medium">{stats.schoolAdmins}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Lead Mentors</span>
                <span className="font-medium">{stats.leadMentors}</span>
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between items-center font-semibold">
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
