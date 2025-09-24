import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Play, 
  Clock, 
  Calendar, 
  BookOpen, 
  CheckCircle,
  AlertCircle,
  Eye,
  FileText,
  Timer,
  AlertTriangle,
  ArrowLeft
} from "lucide-react";
import { studentAssessmentService, type AvailableAssessment } from "@/api/assessmentService";
import { toast } from "sonner";

export default function StudentAssessmentsPage() {
  const navigate = useNavigate();
  
  const [assessments, setAssessments] = useState<AvailableAssessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showStartModal, setShowStartModal] = useState(false);
  const [selectedAssessment, setSelectedAssessment] = useState<AvailableAssessment | null>(null);

  useEffect(() => {
    loadAssessments();
  }, []);

  const loadAssessments = async () => {
    try {
      setLoading(true);
      const response = await studentAssessmentService.getAvailableAssessments();
      setAssessments(response.data || []);
    } catch (error) {
      console.error("Error loading assessments:", error);
      toast.error("Failed to load assessments");
    } finally {
      setLoading(false);
    }
  };

  const handleStartAssessment = (assessment: AvailableAssessment) => {
    if (assessment.hasAttempted && !assessment.canRetake) {
      toast.error("You have already completed this assessment");
      return;
    }
    setSelectedAssessment(assessment);
    setShowStartModal(true);
  };

  const confirmStartAssessment = () => {
    if (selectedAssessment) {
      setShowStartModal(false);
      navigate(`/student/assessments/${selectedAssessment._id}/take`);
    }
  };

  const getStatusBadge = (assessment: AvailableAssessment) => {
    switch (assessment.assessmentStatus) {
      case "completed":
        return (
          <Badge variant="outline" className="border-green-300 text-green-700">
            <CheckCircle className="h-3 w-3 mr-1" />
            Completed
          </Badge>
        );
      case "upcoming":
        return (
          <Badge variant="outline" className="border-blue-300 text-blue-700">
            <Clock className="h-3 w-3 mr-1" />
            Upcoming
          </Badge>
        );
      case "expired":
        return (
          <Badge variant="outline" className="border-red-300 text-red-700">
            <AlertCircle className="h-3 w-3 mr-1" />
            Expired
          </Badge>
        );
      case "in_progress":
        return (
          <Badge variant="outline" className="border-yellow-300 text-yellow-700">
            <Clock className="h-3 w-3 mr-1" />
            In Progress
          </Badge>
        );
      case "available":
        return (
          <Badge variant="default" className="bg-green-100 text-green-800">
            <Play className="h-3 w-3 mr-1" />
            Available
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="border-gray-300 text-gray-700">
            <AlertCircle className="h-3 w-3 mr-1" />
            Not Available
          </Badge>
        );
    }
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

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
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
          <h1 className="text-3xl font-bold">My Assessments</h1>
          <p className="text-gray-600">Take your assigned assessments</p>
        </div>
        <Button 
          variant="outline" 
          onClick={() => navigate("/student/assessments/results")}
        >
          <Eye className="h-4 w-4 mr-2" />
          View Results
        </Button>
      </div>

      {assessments.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No assessments available</h3>
            <p className="text-gray-600">
              You don't have any assessments assigned at the moment. Check back later!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {assessments.map((assessment) => (
            <Card key={assessment._id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg line-clamp-2">{assessment.title}</CardTitle>
                  {getStatusBadge(assessment)}
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
                    <BookOpen className="h-4 w-4 text-gray-500" />
                    <span>{assessment.questions.length} questions</span>
                  </div>
                </div>

                {/* Instructions Preview */}
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-700 line-clamp-3">
                    {assessment.instructions}
                  </p>
                </div>

                {/* Action Button */}
                <div className="pt-2">
                  {assessment.assessmentStatus === "available" ? (
                    <Button 
                      className="w-full" 
                      onClick={() => handleStartAssessment(assessment)}
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Start Assessment
                    </Button>
                  ) : assessment.assessmentStatus === "completed" ? (
                    <Button 
                      variant="outline" 
                      className="w-full" 
                      disabled
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Completed
                    </Button>
                  ) : assessment.assessmentStatus === "in_progress" ? (
                    <Button 
                      className="w-full" 
                      onClick={() => handleStartAssessment(assessment)}
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Continue Assessment
                    </Button>
                  ) : assessment.assessmentStatus === "upcoming" ? (
                    <Button 
                      variant="outline" 
                      className="w-full" 
                      disabled
                    >
                      <Clock className="h-4 w-4 mr-2" />
                      Not Available Yet
                    </Button>
                  ) : assessment.assessmentStatus === "expired" ? (
                    <Button 
                      variant="outline" 
                      className="w-full" 
                      disabled
                    >
                      <AlertCircle className="h-4 w-4 mr-2" />
                      Expired
                    </Button>
                  ) : (
                    <Button 
                      variant="outline" 
                      className="w-full" 
                      disabled
                    >
                      <AlertCircle className="h-4 w-4 mr-2" />
                      Not Available
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Start Assessment Confirmation Modal */}
      {selectedAssessment && (
        <Dialog open={showStartModal} onOpenChange={setShowStartModal}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-2xl">
                <FileText className="h-6 w-6 text-blue-600" />
                Ready to Start Assessment?
              </DialogTitle>
              <DialogDescription className="text-base">
                Please review the assessment details below before starting. Once you begin, the timer will start and cannot be paused.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* Assessment Details */}
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h3 className="font-semibold text-lg text-blue-900 mb-3">
                  {selectedAssessment.title}
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-blue-600" />
                    <span className="text-sm">
                      <strong>Subject:</strong> {selectedAssessment.subject}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-sm">
                      <strong>Grade:</strong> {selectedAssessment.grade}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Timer className="h-4 w-4 text-blue-600" />
                    <span className="text-sm">
                      <strong>Duration:</strong> {selectedAssessment.duration} minutes
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-sm">
                      <strong>Questions:</strong> {selectedAssessment.questions.length}
                    </span>
                  </div>
                </div>

                {selectedAssessment.modules && selectedAssessment.modules.length > 0 && (
                  <div className="mt-3">
                    <span className="text-sm font-medium">Modules:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedAssessment.modules.map((module: string, index: number) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {module}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Instructions */}
              {selectedAssessment.instructions && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Instructions:</h4>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                    {selectedAssessment.instructions}
                  </p>
                </div>
              )}

              {/* Important Notes */}
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <h4 className="font-semibold text-yellow-800 mb-2 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Important Notes:
                </h4>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• The timer will start immediately when you click "Start Test"</li>
                  <li>• You cannot pause or stop the timer once started</li>
                  <li>• The assessment will auto-submit when time expires</li>
                  <li>• Make sure you have a stable internet connection</li>
                  <li>• Do not refresh the page during the test</li>
                </ul>
              </div>

              {/* Time Remaining Info */}
              {selectedAssessment.attemptStatus === "in_progress" && (
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2 text-green-800">
                    <Clock className="h-4 w-4" />
                    <span className="font-medium">
                      Assessment in Progress
                    </span>
                  </div>
                  <p className="text-sm text-green-700 mt-1">
                    You have an ongoing attempt for this assessment. Starting will resume your previous session.
                  </p>
                </div>
              )}
            </div>

            <DialogFooter className="gap-2">
              <Button 
                variant="outline" 
                onClick={() => setShowStartModal(false)}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button 
                onClick={confirmStartAssessment}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Play className="h-4 w-4 mr-2" />
                Start Test
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
