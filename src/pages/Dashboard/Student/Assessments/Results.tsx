import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  ArrowLeft, 
  Trophy, 
  Clock, 
  CheckCircle, 
  BookOpen,
  Calendar,
  Eye
} from "lucide-react";
import { studentAssessmentService, type AssessmentResponse } from "@/api/assessmentService";
import { toast } from "sonner";

export default function AssessmentResultsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const [results, setResults] = useState<AssessmentResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [recentResult, setRecentResult] = useState<any>(null);

  useEffect(() => {
    // Check if we have a recent result from navigation state
    if (location.state?.result) {
      setRecentResult(location.state.result);
    }
    loadResults();
  }, [location.state]);

  const loadResults = async () => {
    try {
      setLoading(true);
      const response = await studentAssessmentService.getMyAssessmentResults();
      setResults(response.data || []);
    } catch (error) {
      console.error("Error loading results:", error);
      toast.error("Failed to load assessment results");
    } finally {
      setLoading(false);
    }
  };

  const getGradeColor = (grade: string) => {
    const colors = {
      "A+": "text-green-600 bg-green-100",
      "A": "text-green-600 bg-green-100",
      "B+": "text-blue-600 bg-blue-100",
      "B": "text-blue-600 bg-blue-100",
      "C+": "text-yellow-600 bg-yellow-100",
      "C": "text-yellow-600 bg-yellow-100",
      "D": "text-orange-600 bg-orange-100",
      "F": "text-red-600 bg-red-100",
    };
    return colors[grade as keyof typeof colors] || "text-gray-600 bg-gray-100";
  };

  const getPerformanceMessage = (percentage: number) => {
    if (percentage >= 90) return "Excellent work! Outstanding performance!";
    if (percentage >= 80) return "Great job! Well done!";
    if (percentage >= 70) return "Good work! Keep it up!";
    if (percentage >= 60) return "Satisfactory performance. Room for improvement.";
    if (percentage >= 50) return "Below average. Consider reviewing the material.";
    return "Needs improvement. Please review the topics and try again.";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
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
      return `${hours}h ${minutes}m ${secs}s`;
    }
    return `${minutes}m ${secs}s`;
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Loading results...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={() => navigate("/student/assessments")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Assessments
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Assessment Results</h1>
          <p className="text-gray-600">View your assessment performance and progress</p>
        </div>
      </div>

      {/* Recent Result (if available) */}
      {recentResult && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center text-green-800">
              <Trophy className="h-5 w-5 mr-2" />
              Latest Assessment Result
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">
                  {recentResult.percentage.toFixed(1)}%
                </div>
                <p className="text-sm text-gray-600">Score</p>
              </div>
              <div className="text-center">
                <Badge className={`text-lg px-3 py-1 ${getGradeColor(recentResult.grade)}`}>
                  {recentResult.grade}
                </Badge>
                <p className="text-sm text-gray-600 mt-1">Grade</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">
                  {recentResult.obtainedMarks}/{recentResult.totalMarks}
                </div>
                <p className="text-sm text-gray-600">Marks</p>
              </div>
            </div>
            <div className="text-center">
              <p className="text-green-700 font-medium">
                {getPerformanceMessage(recentResult.percentage)}
              </p>
            </div>
            <div className="text-center mt-4">
              <Button 
                variant="outline"
                onClick={() => navigate(`/student/assessments/results/${recentResult._id}`)}
              >
                <Eye className="h-4 w-4 mr-2" />
                View Detailed Results
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Results */}
      {results.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No results found</h3>
            <p className="text-gray-600 mb-4">
              You haven't completed any assessments yet.
            </p>
            <Button onClick={() => navigate("/student/assessments")}>
              View Available Assessments
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">All Results</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.map((result) => {
              const assessment = result.assessment as any;
              return (
                <Card key={result._id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg line-clamp-2">
                        {assessment?.title || "Assessment"}
                      </CardTitle>
                      <Badge className={getGradeColor(result.grade)}>
                        {result.grade}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <BookOpen className="h-4 w-4" />
                      <span>{assessment?.grade} - {assessment?.subject}</span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Score Display */}
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {result.percentage.toFixed(1)}%
                      </div>
                      <div className="text-sm text-gray-600">
                        {result.totalMarksObtained}/{assessment?.totalMarks || 0} marks
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Performance</span>
                        <span>{result.percentage.toFixed(1)}%</span>
                      </div>
                      <Progress value={result.percentage} className="h-2" />
                    </div>

                    {/* Assessment Details */}
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span>Completed: {formatDate(result.submittedAt)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span>Time taken: {formatTime(result.timeSpent)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-gray-500" />
                        <span>Status: {result.status}</span>
                      </div>
                    </div>

                    {/* Performance Message */}
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm text-gray-700">
                        {getPerformanceMessage(result.percentage)}
                      </p>
                    </div>

                    {/* View Details Button */}
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => navigate(`/student/assessments/results/${result._id}`)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Detailed Results
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
