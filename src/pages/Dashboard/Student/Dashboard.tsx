import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BookOpen,
  FileText,
  Award,
  MessageSquare,
  Bell,
  Calendar,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { resourceService } from "@/api/resourceService";
import { studentAssessmentService } from "@/api/assessmentService";
import { certificateService } from "@/api/certificateService";
import { getConversations } from "@/api/messageService";

export default function StudentDashboard() {
  const [stats, setStats] = useState({
    resources: 0,
    assessments: 0,
    certificates: 0,
    messages: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [resourcesRes, assessmentsRes, certificatesRes, conversationsRes] =
        await Promise.allSettled([
          resourceService.getByCategory("student", { limit: 1 }),
          studentAssessmentService.getAvailableAssessments(),
          certificateService.getStudentCertificates(),
          getConversations(),
        ]);

      setStats({
        resources:
          resourcesRes.status === "fulfilled"
            ? resourcesRes.value.pagination?.total || 0
            : 0,
        assessments:
          assessmentsRes.status === "fulfilled"
            ? (
                assessmentsRes.value.data?.filter(
                  (assessment: any) =>
                    assessment.assessmentStatus === "available"
                ) || []
              ).length
            : 0,
        certificates:
          certificatesRes.status === "fulfilled"
            ? certificatesRes.value.data?.length || 0
            : 0,
        messages:
          conversationsRes.status === "fulfilled"
            ? conversationsRes.value.conversations?.reduce(
                (total, conv) => total + conv.unreadCount,
                0
              ) || 0
            : 0,
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-3 py-3 sm:p-4 lg:p-6 space-y-3 sm:space-y-6">
      {/* Dashboard Stats */}
      <div className="grid gap-3 sm:gap-4 grid-cols-1 xs:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
            <CardTitle className="text-xs sm:text-sm font-medium">
              Available Resources
            </CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
            <div className="text-lg sm:text-xl lg:text-2xl font-bold">
              {loading ? "..." : stats.resources}
            </div>
            <p className="text-[10px] sm:text-xs text-muted-foreground">
              Learning materials
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
            <CardTitle className="text-xs sm:text-sm font-medium">
              Available Assessments
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
            <div className="text-lg sm:text-xl lg:text-2xl font-bold">
              {loading ? "..." : stats.assessments}
            </div>
            <p className="text-[10px] sm:text-xs text-muted-foreground">
              Ready to start now
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
            <CardTitle className="text-xs sm:text-sm font-medium">
              Certificates
            </CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
            <div className="text-lg sm:text-xl lg:text-2xl font-bold">
              {loading ? "..." : stats.certificates}
            </div>
            <p className="text-[10px] sm:text-xs text-muted-foreground">
              Earned certificates
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
            <CardTitle className="text-xs sm:text-sm font-medium">
              Messages
            </CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
            <div className="text-lg sm:text-xl lg:text-2xl font-bold">
              {loading ? "..." : stats.messages}
            </div>
            <p className="text-[10px] sm:text-xs text-muted-foreground">
              Unread messages
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="px-3 sm:px-6 pt-3 sm:pt-6">
            <CardTitle className="flex items-center gap-2 text-sm sm:text-base lg:text-lg">
              <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
              Assessments
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Take your assigned assessments and view results
            </CardDescription>
          </CardHeader>
          <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6 space-y-2">
            <Button
              asChild
              className="w-full h-8 sm:h-9 lg:h-10 text-xs sm:text-sm lg:text-base touch-manipulation">
              <Link to="/student/assessments">View Available Assessments</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="w-full h-8 sm:h-9 lg:h-10 text-xs sm:text-sm lg:text-base touch-manipulation">
              <Link to="/student/assessments/results">View Results</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="px-3 sm:px-6 pt-3 sm:pt-6">
            <CardTitle className="flex items-center gap-2 text-sm sm:text-base lg:text-lg">
              <BookOpen className="h-4 w-4 sm:h-5 sm:w-5" />
              Resources
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Access your learning materials and resources
            </CardDescription>
          </CardHeader>
          <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
            <Button
              asChild
              className="w-full h-8 sm:h-9 lg:h-10 text-xs sm:text-sm lg:text-base touch-manipulation">
              <Link to="/student/resources">Browse Resources</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="px-3 sm:px-6 pt-3 sm:pt-6">
            <CardTitle className="flex items-center gap-2 text-sm sm:text-base lg:text-lg">
              <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
              Notifications
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Stay updated with your latest notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
            <Button
              asChild
              className="w-full h-8 sm:h-9 lg:h-10 text-xs sm:text-sm lg:text-base touch-manipulation">
              <Link to="/student/notifications">View Notifications</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity & Messages */}
      <div className="grid gap-3 sm:gap-4 grid-cols-1 lg:grid-cols-2">
        <Card>
          <CardHeader className="px-3 sm:px-6 pt-3 sm:pt-6">
            <CardTitle className="flex items-center gap-2 text-sm sm:text-base lg:text-lg">
              <Calendar className="h-4 w-4 sm:h-5 sm:w-5" />
              Recent Activity
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Your latest learning activities and progress
            </CardDescription>
          </CardHeader>
          <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
            <div className="text-center py-6 sm:py-8 text-muted-foreground text-xs sm:text-sm">
              No recent activity to display
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="px-3 sm:px-6 pt-3 sm:pt-6">
            <CardTitle className="flex items-center gap-2 text-sm sm:text-base lg:text-lg">
              <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5" />
              Messages
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Communicate with your mentor and peers
            </CardDescription>
          </CardHeader>
          <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
            <Button
              asChild
              className="w-full h-8 sm:h-9 lg:h-10 text-xs sm:text-sm lg:text-base touch-manipulation">
              <Link to="/student/messages">Open Messages</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
