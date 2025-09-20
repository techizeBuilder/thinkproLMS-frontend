import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  BarChart3, 
  Calendar,
  Clock,
  Users,
  BookOpen
} from "lucide-react";
import { assessmentService, type Assessment } from "@/api/assessmentService";
import { toast } from "sonner";

export default function MentorAssessmentsPage() {
  const navigate = useNavigate();
  
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    loadAssessments();
  }, [statusFilter]);

  const loadAssessments = async () => {
    try {
      setLoading(true);
      const filters = statusFilter !== "all" ? { status: statusFilter } : {};
      const response = await assessmentService.getAssessments(filters);
      setAssessments(response.data || []);
    } catch (error) {
      console.error("Error loading assessments:", error);
      toast.error("Failed to load assessments");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAssessment = async (id: string) => {
    if (!confirm("Are you sure you want to delete this assessment?")) return;

    try {
      await assessmentService.deleteAssessment(id);
      toast.success("Assessment deleted successfully");
      loadAssessments();
    } catch (error) {
      console.error("Error deleting assessment:", error);
      toast.error("Failed to delete assessment");
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      draft: "secondary",
      published: "default",
      completed: "outline",
      cancelled: "destructive",
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || "secondary"}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isAssessmentActive = (assessment: Assessment) => {
    const now = new Date();
    const startDate = new Date(assessment.startDate);
    const endDate = new Date(assessment.endDate);
    return assessment.status === "published" && now >= startDate && now <= endDate;
  };

  const isAssessmentUpcoming = (assessment: Assessment) => {
    const now = new Date();
    const startDate = new Date(assessment.startDate);
    return assessment.status === "published" && now < startDate;
  };

  const isAssessmentExpired = (assessment: Assessment) => {
    const now = new Date();
    const endDate = new Date(assessment.endDate);
    return assessment.status === "published" && now > endDate;
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Loading assessments...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Assessments</h1>
          <p className="text-gray-600">Manage your assessments and track student progress</p>
        </div>
        <Button onClick={() => navigate("/mentor/assessments/create")}>
          <Plus className="h-4 w-4 mr-2" />
          Create Assessment
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Assessments Grid */}
      {assessments.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No assessments found</h3>
            <p className="text-gray-600 mb-4">
              {statusFilter === "all" 
                ? "Create your first assessment to get started"
                : `No assessments with status "${statusFilter}" found`
              }
            </p>
            <Button onClick={() => navigate("/mentor/assessments/create")}>
              <Plus className="h-4 w-4 mr-2" />
              Create Assessment
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {assessments.map((assessment) => (
            <Card key={assessment._id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg line-clamp-2">{assessment.title}</CardTitle>
                  {getStatusBadge(assessment.status)}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <BookOpen className="h-4 w-4" />
                  <span>{assessment.grade} - {assessment.subject}</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Assessment Details */}
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span>Start: {formatDate(assessment.startDate)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span>End: {formatDate(assessment.endDate)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span>{assessment.duration} minutes</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-gray-500" />
                    <span>{assessment.totalAttempts} attempts</span>
                  </div>
                </div>

                {/* Assessment Status Indicators */}
                <div className="flex flex-wrap gap-2">
                  {isAssessmentActive(assessment) && (
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      Active
                    </Badge>
                  )}
                  {isAssessmentUpcoming(assessment) && (
                    <Badge variant="outline" className="border-blue-300 text-blue-700">
                      Upcoming
                    </Badge>
                  )}
                  {isAssessmentExpired(assessment) && (
                    <Badge variant="outline" className="border-gray-300 text-gray-700">
                      Expired
                    </Badge>
                  )}
                </div>

                {/* Statistics */}
                {assessment.totalAttempts > 0 && (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-600">Avg Score:</span>
                        <span className="ml-1 font-medium">{assessment.averageScore.toFixed(1)}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Completion:</span>
                        <span className="ml-1 font-medium">{assessment.completionRate.toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/mentor/assessments/${assessment._id}`)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  
                  {assessment.status === "draft" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/mentor/assessments/${assessment._id}/edit`)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}
                  
                  {assessment.totalAttempts > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/mentor/assessments/${assessment._id}/analytics`)}
                    >
                      <BarChart3 className="h-4 w-4" />
                    </Button>
                  )}
                  
                  {assessment.status === "draft" && assessment.totalAttempts === 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteAssessment(assessment._id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
