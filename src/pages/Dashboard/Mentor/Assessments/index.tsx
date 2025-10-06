import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  BarChart3, 
  BookOpen,
  Send,
  XCircle
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
      const filters: any = {};
      
      if (statusFilter === "expired") {
        filters.status = "expired";
      } else if (statusFilter !== "all") {
        filters.status = statusFilter;
      }
      
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

  const handlePublishAssessment = async (id: string) => {
    const notificationMessage = prompt("Enter notification message for students (optional):");
    
    try {
      if (notificationMessage) {
        await assessmentService.publishAssessment(id, notificationMessage);
      } else {
        await assessmentService.publishAssessment(id);
      }
      
      toast.success("Assessment published successfully");
      loadAssessments();
    } catch (error) {
      console.error("Error publishing assessment:", error);
      toast.error("Failed to publish assessment");
    }
  };

  const handleCancelAssessment = async (id: string) => {
    const reason = prompt("Enter reason for cancelling the assessment (optional):");
    
    if (!confirm("Are you sure you want to cancel this assessment? Students will be notified.")) {
      return;
    }

    try {
      await assessmentService.cancelAssessment(id, reason || undefined);
      toast.success("Assessment cancelled successfully");
      loadAssessments();
    } catch (error) {
      console.error("Error cancelling assessment:", error);
      toast.error("Failed to cancel assessment");
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      draft: "secondary",
      published: "default",
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
            <SelectItem value="cancelled">Cancelled</SelectItem>
            <SelectItem value="expired">Expired</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Assessments Table */}
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
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Grade & Sections</TableHead>
                    <TableHead>Session</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Date Range</TableHead>
                    <TableHead>Attempts</TableHead>
                    <TableHead>Avg Score</TableHead>
                    <TableHead>Created By</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assessments.map((assessment) => (
                    <TableRow key={assessment._id} className="hover:bg-gray-50">
                      <TableCell className="font-medium max-w-xs">
                        <div className="flex flex-col gap-1">
                          <span className="line-clamp-1">{assessment.title}</span>
                          <div className="flex gap-1 flex-wrap">
                            {isAssessmentActive(assessment) && (
                              <Badge variant="default" className="bg-green-100 text-green-800 text-xs">
                                Active
                              </Badge>
                            )}
                            {isAssessmentUpcoming(assessment) && (
                              <Badge variant="outline" className="border-blue-300 text-blue-700 text-xs">
                                Upcoming
                              </Badge>
                            )}
                            {isAssessmentExpired(assessment) && (
                              <Badge variant="outline" className="border-gray-300 text-gray-700 text-xs">
                                Expired
                              </Badge>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium">Grade {assessment.grade}</div>
                          <div className="text-gray-600">
                            {assessment.sections.length > 0 
                              ? `Sections: ${assessment.sections.join(", ")}`
                              : "No sections"
                            }
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium">
                            Grade {assessment.grade}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(assessment.status)}
                      </TableCell>
                      <TableCell className="text-sm">
                        {assessment.duration} min
                      </TableCell>
                      <TableCell className="text-sm">
                        <div className="flex flex-col gap-1">
                          <div>{formatDate(assessment.startDate)}</div>
                          <div className="text-gray-600">{formatDate(assessment.endDate)}</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        {assessment.totalAttempts}
                      </TableCell>
                      <TableCell className="text-center">
                        {assessment.totalAttempts > 0 
                          ? assessment.averageScore.toFixed(1) 
                          : "-"}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium">{assessment.createdBy.name}</div>
                          <div className="text-gray-600 capitalize">({assessment.createdBy.role})</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/mentor/assessments/${assessment._id}`)}
                            title="View"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          
                          {assessment.status === "draft" && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => navigate(`/mentor/assessments/${assessment._id}/edit`)}
                                title="Edit"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handlePublishAssessment(assessment._id)}
                                title="Publish"
                                className="text-blue-600 hover:text-blue-700"
                              >
                                <Send className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                          
                          {assessment.status === "published" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleCancelAssessment(assessment._id)}
                              title="Cancel Assessment"
                              className="text-orange-600 hover:text-orange-700"
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          )}
                          
                          {assessment.totalAttempts > 0 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => navigate(`/mentor/assessments/${assessment._id}/analytics`)}
                              title="Analytics"
                            >
                              <BarChart3 className="h-4 w-4" />
                            </Button>
                          )}
                          
                          {assessment.status === "draft" && assessment.totalAttempts === 0 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteAssessment(assessment._id)}
                              title="Delete"
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
