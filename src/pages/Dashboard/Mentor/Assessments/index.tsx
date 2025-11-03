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
  XCircle,
  Copy
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

  const handleCreateNewAssessment = () => {
    // Ensure no stale duplication payload affects a fresh create
    sessionStorage.removeItem('duplicateAssessmentData');
    navigate("/mentor/assessments/create");
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

  const handleDuplicateAssessment = async (assessment: Assessment) => {
    try {
      // Navigate to create page with pre-filled data
      const duplicateData = {
        title: `${assessment.title} (Copy)`,
        instructions: assessment.instructions,
        school: assessment.school._id,
        grade: assessment.grade.toString(),
        sections: assessment.sections,
        session: assessment.session?._id || "",
        duration: assessment.duration,
        questions: assessment.questions.map(q => ({
          questionId: typeof q.questionId === 'string' ? q.questionId : q.questionId._id,
          order: q.order,
          marks: q.marks,
        })),
      };
      
      // Store the duplicate data in sessionStorage to be picked up by create page
      sessionStorage.setItem('duplicateAssessmentData', JSON.stringify(duplicateData));
      navigate("/mentor/assessments/create");
      toast.success("Assessment data loaded for duplication");
    } catch (error) {
      console.error("Error duplicating assessment:", error);
      toast.error("Failed to duplicate assessment");
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
      <div className="container mx-auto p-4 md:p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-sm md:text-base">Loading assessments...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 md:gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Assessments</h1>
          <p className="text-sm md:text-base text-gray-600">Manage assessments and track student progress</p>
        </div>
        <Button onClick={handleCreateNewAssessment} className="text-xs md:text-sm">
          <Plus className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
          Create
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 md:gap-4">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48 text-sm">
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
          <CardContent className="text-center py-8 md:py-12">
            <BookOpen className="h-10 w-10 md:h-12 md:w-12 text-gray-400 mx-auto mb-3 md:mb-4" />
            <h3 className="text-base md:text-lg font-semibold mb-2">No assessments found</h3>
            <p className="text-sm md:text-base text-gray-600 mb-3 md:mb-4">
              {statusFilter === "all" 
                ? "Create your first assessment"
                : `No "${statusFilter}" assessments`
              }
            </p>
            <Button onClick={handleCreateNewAssessment} className="text-xs md:text-sm">
              <Plus className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
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
                    <TableHead className="text-xs md:text-sm">Title</TableHead>
                    <TableHead className="text-xs md:text-sm hidden md:table-cell">Grade & Sections</TableHead>
                    <TableHead className="text-xs md:text-sm hidden lg:table-cell">Status</TableHead>
                    <TableHead className="text-xs md:text-sm hidden lg:table-cell">Duration</TableHead>
                    <TableHead className="text-xs md:text-sm hidden xl:table-cell">Date Range</TableHead>
                    <TableHead className="text-xs md:text-sm hidden xl:table-cell">Attempts</TableHead>
                    <TableHead className="text-xs md:text-sm">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assessments.map((assessment) => (
                    <TableRow key={assessment._id} className="hover:bg-gray-50">
                      <TableCell className="font-medium max-w-[200px]">
                        <div className="flex flex-col gap-1">
                          <span className="text-xs md:text-sm line-clamp-1">{assessment.title}</span>
                          <div className="flex gap-1 flex-wrap">
                            {isAssessmentActive(assessment) && (
                              <Badge variant="default" className="bg-green-100 text-green-800 text-[10px]">
                                Active
                              </Badge>
                            )}
                            {isAssessmentUpcoming(assessment) && (
                              <Badge variant="outline" className="border-blue-300 text-blue-700 text-[10px]">
                                Upcoming
                              </Badge>
                            )}
                            {isAssessmentExpired(assessment) && (
                              <Badge variant="outline" className="border-gray-300 text-gray-700 text-[10px]">
                                Expired
                              </Badge>
                            )}
                          </div>
                          <div className="md:hidden text-[10px] text-gray-600">
                            Grade {assessment.grade} • {assessment.sections.join(", ") || "All"}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="text-xs md:text-sm">
                          <div className="font-medium">Grade {assessment.grade}</div>
                          <div className="text-gray-600">
                            {assessment.sections.length > 0 
                              ? `${assessment.sections.join(", ")}`
                              : "All sections"
                            }
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {getStatusBadge(assessment.status)}
                      </TableCell>
                      <TableCell className="text-xs md:text-sm hidden lg:table-cell">
                        {assessment.duration} min
                      </TableCell>
                      <TableCell className="text-xs md:text-sm hidden xl:table-cell">
                        <div className="flex flex-col gap-1">
                          <div>{formatDate(assessment.startDate)}</div>
                          <div className="text-gray-600">{formatDate(assessment.endDate)}</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-center text-xs md:text-sm hidden xl:table-cell">
                        {assessment.totalAttempts}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-0.5 md:gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/mentor/assessments/${assessment._id}`)}
                            title="View"
                            className="h-7 w-7 md:h-8 md:w-8 p-0"
                          >
                            <Eye className="h-3 w-3 md:h-4 md:w-4" />
                          </Button>
                          
                          {assessment.status === "draft" && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => navigate(`/mentor/assessments/${assessment._id}/edit`)}
                                title="Edit"
                                className="h-7 w-7 md:h-8 md:w-8 p-0"
                              >
                                <Edit className="h-3 w-3 md:h-4 md:w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handlePublishAssessment(assessment._id)}
                                title="Publish"
                                className="text-blue-600 hover:text-blue-700 h-7 w-7 md:h-8 md:w-8 p-0"
                              >
                                <Send className="h-3 w-3 md:h-4 md:w-4" />
                              </Button>
                            </>
                          )}
                          
                          {assessment.status === "published" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleCancelAssessment(assessment._id)}
                              title="Cancel"
                              className="text-orange-600 hover:text-orange-700 h-7 w-7 md:h-8 md:w-8 p-0"
                            >
                              <XCircle className="h-3 w-3 md:h-4 md:w-4" />
                            </Button>
                          )}
                          
                          {assessment.totalAttempts > 0 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => navigate(`/mentor/assessments/${assessment._id}/analytics`)}
                              title="Analytics"
                              className="h-7 w-7 md:h-8 md:w-8 p-0"
                            >
                              <BarChart3 className="h-3 w-3 md:h-4 md:w-4" />
                            </Button>
                          )}
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDuplicateAssessment(assessment)}
                            title="Duplicate"
                            className="text-green-600 hover:text-green-700 h-7 w-7 md:h-8 md:w-8 p-0"
                          >
                            <Copy className="h-3 w-3 md:h-4 md:w-4" />
                          </Button>
                          
                          {assessment.status === "draft" && assessment.totalAttempts === 0 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteAssessment(assessment._id)}
                              title="Delete"
                              className="text-red-600 hover:text-red-700 h-7 w-7 md:h-8 md:w-8 p-0"
                            >
                              <Trash2 className="h-3 w-3 md:h-4 md:w-4" />
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
