import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Play, 
  Clock, 
  Calendar, 
  BookOpen, 
  CheckCircle,
  AlertCircle,
  Eye
} from "lucide-react";
import { studentAssessmentService, AvailableAssessment } from "@/api/assessmentService";
import { toast } from "sonner";

export default function StudentAssessmentsPage() {
  const navigate = useNavigate();
  
  const [assessments, setAssessments] = useState<AvailableAssessment[]>([]);
  const [loading, setLoading] = useState(true);

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
    navigate(`/student/assessments/${assessment._id}/take`);
  };

  const getStatusBadge = (assessment: AvailableAssessment) => {
    const now = new Date();
    const startDate = new Date(assessment.startDate);
    const endDate = new Date(assessment.endDate);

    if (assessment.hasAttempted) {
      return (
        <Badge variant="outline" className="border-green-300 text-green-700">
          <CheckCircle className="h-3 w-3 mr-1" />
          Completed
        </Badge>
      );
    }

    if (now < startDate) {
      return (
        <Badge variant="outline" className="border-blue-300 text-blue-700">
          <Clock className="h-3 w-3 mr-1" />
          Upcoming
        </Badge>
      );
    }

    if (now > endDate) {
      return (
        <Badge variant="outline" className="border-red-300 text-red-700">
          <AlertCircle className="h-3 w-3 mr-1" />
          Expired
        </Badge>
      );
    }

    return (
      <Badge variant="default" className="bg-green-100 text-green-800">
        <Play className="h-3 w-3 mr-1" />
        Available
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

  const isAssessmentAvailable = (assessment: AvailableAssessment) => {
    const now = new Date();
    const startDate = new Date(assessment.startDate);
    const endDate = new Date(assessment.endDate);
    
    return !assessment.hasAttempted && now >= startDate && now <= endDate;
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
                  {isAssessmentAvailable(assessment) ? (
                    <Button 
                      className="w-full" 
                      onClick={() => handleStartAssessment(assessment)}
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Start Assessment
                    </Button>
                  ) : assessment.hasAttempted ? (
                    <Button 
                      variant="outline" 
                      className="w-full" 
                      disabled
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Completed
                    </Button>
                  ) : (
                    <Button 
                      variant="outline" 
                      className="w-full" 
                      disabled
                    >
                      <Clock className="h-4 w-4 mr-2" />
                      Not Available Yet
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
