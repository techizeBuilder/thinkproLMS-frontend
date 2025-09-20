import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  Clock, 
  Users, 
  BookOpen,
  Edit,
  BarChart3,
  ArrowLeft
} from "lucide-react";
import { assessmentService, type Assessment } from "@/api/assessmentService";
import { toast } from "sonner";

export default function ViewAssessmentPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAssessment = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        console.log("Loading assessment with ID:", id);
        const response = await assessmentService.getAssessmentById(id);
        console.log("Assessment response:", response);
        setAssessment(response.data);
      } catch (error) {
        console.error("Error loading assessment:", error);
        console.error("Error details:", error.response?.data || error.message);
        toast.error(`Failed to load assessment: ${error.response?.data?.message || error.message}`);
        navigate("/mentor/assessments");
      } finally {
        setLoading(false);
      }
    };

    loadAssessment();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading assessment...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!assessment) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Assessment Not Found</h1>
          <p className="text-gray-600 mb-4">The assessment you're looking for doesn't exist.</p>
          <Button onClick={() => navigate("/mentor/assessments")}>
            Back to Assessments
          </Button>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <Badge variant="secondary">Draft</Badge>;
      case 'published':
        return <Badge variant="default">Published</Badge>;
      case 'completed':
        return <Badge variant="outline">Completed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate("/mentor/assessments")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{assessment.title}</h1>
            <p className="text-gray-600">Assessment Details</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {getStatusBadge(assessment.status)}
          <Button 
            variant="outline"
            onClick={() => navigate(`/mentor/assessments/${assessment._id}/edit`)}
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button 
            onClick={() => navigate(`/mentor/assessments/${assessment._id}/analytics`)}
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BookOpen className="h-5 w-5 mr-2" />
                Assessment Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Instructions</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{assessment.instructions}</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-sm text-gray-500 mb-1">Grade</h4>
                  <p>{assessment.grade}</p>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-gray-500 mb-1">Subject</h4>
                  <p>{assessment.subject}</p>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-gray-500 mb-1">Modules</h4>
                  <div className="flex flex-wrap gap-1">
                    {assessment.modules.map((module, index) => (
                      <Badge key={index} variant="outline">{module}</Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-gray-500 mb-1">Duration</h4>
                  <p>{assessment.duration} minutes</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Questions */}
          <Card>
            <CardHeader>
              <CardTitle>Questions ({assessment.questions.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {assessment.questions.map((question, index) => {
                  const questionData = typeof question.questionId === 'object' ? question.questionId : null;
                  const questionId = typeof question.questionId === 'string' ? question.questionId : question.questionId?._id;
                  
                  return (
                    <div key={questionId} className="border rounded-lg p-3">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">Q{index + 1}</span>
                          {questionData && (
                            <Badge variant="outline">{questionData.difficulty}</Badge>
                          )}
                          <Badge variant="secondary">{question.marks} marks</Badge>
                        </div>
                      </div>
                      {questionData ? (
                        <p className="text-sm">{questionData.questionText}</p>
                      ) : (
                        <p className="text-sm text-gray-500">Question details not available</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Schedule */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Schedule
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <h4 className="font-medium text-sm text-gray-500 mb-1">Start Date</h4>
                <p className="text-sm">{formatDate(assessment.startDate)}</p>
              </div>
              <div>
                <h4 className="font-medium text-sm text-gray-500 mb-1">End Date</h4>
                <p className="text-sm">{formatDate(assessment.endDate)}</p>
              </div>
              <div>
                <h4 className="font-medium text-sm text-gray-500 mb-1">Duration</h4>
                <p className="text-sm flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  {assessment.duration} minutes
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Target Students */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Target Students
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {assessment.targetStudents.map((target, index) => (
                  <div key={index} className="text-sm">
                    <span className="font-medium">{target.grade}</span>
                    {target.sections.length > 0 && (
                      <span className="text-gray-500"> - Sections: {target.sections.join(", ")}</span>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Statistics */}
          <Card>
            <CardHeader>
              <CardTitle>Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Total Questions:</span>
                <span className="font-medium">{assessment.questions.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Total Marks:</span>
                <span className="font-medium">
                  {assessment.questions.reduce((sum, q) => sum + q.marks, 0)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Created:</span>
                <span className="font-medium">{formatDate(assessment.createdAt)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
