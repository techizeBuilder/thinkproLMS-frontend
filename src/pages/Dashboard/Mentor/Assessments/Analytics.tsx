import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  ArrowLeft, 
  Users, 
  TrendingUp, 
  CheckCircle,
  BarChart3,
  Download
} from "lucide-react";
import { assessmentService, type Assessment, type AssessmentAnalytics } from "@/api/assessmentService";
import { toast } from "sonner";

export default function AssessmentAnalyticsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [analytics, setAnalytics] = useState<AssessmentAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadAssessmentData();
    }
  }, [id]);

  const loadAssessmentData = async () => {
    try {
      setLoading(true);
      const [assessmentResponse, analyticsResponse] = await Promise.all([
        assessmentService.getAssessmentById(id!),
        assessmentService.getAssessmentAnalytics(id!)
      ]);
      
      setAssessment(assessmentResponse.data);
      setAnalytics(analyticsResponse.data);
    } catch (error) {
      console.error("Error loading assessment data:", error);
      toast.error("Failed to load assessment analytics");
    } finally {
      setLoading(false);
    }
  };

  const exportResults = async () => {
    try {
      // TODO: Implement export functionality
      toast.info("Export functionality will be implemented soon");
    } catch (error) {
      console.error("Error exporting results:", error);
      toast.error("Failed to export results");
    }
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

  const getGradeDistribution = () => {
    if (!analytics) return [];
    
    const total = analytics.totalAttempts;
    return Object.entries(analytics.gradeDistribution).map(([grade, count]) => ({
      grade,
      count: count as number,
      percentage: total > 0 ? ((count as number) / total) * 100 : 0
    }));
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Loading analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!assessment || !analytics) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Assessment not found</h1>
          <Button onClick={() => navigate("/mentor/assessments")}>
            Back to Assessments
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={() => navigate("/mentor/assessments")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Assessments
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{assessment.title}</h1>
          <p className="text-gray-600">Assessment Analytics & Results</p>
        </div>
        <Button variant="outline" onClick={exportResults}>
          <Download className="h-4 w-4 mr-2" />
          Export Results
        </Button>
      </div>

      {/* Assessment Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Assessment Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{assessment.questions.length}</div>
              <p className="text-sm text-gray-600">Total Questions</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{assessment.totalMarks}</div>
              <p className="text-sm text-gray-600">Total Marks</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">{assessment.duration}</div>
              <p className="text-sm text-gray-600">Duration (minutes)</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">
                {new Date(assessment.startDate).toLocaleDateString()}
              </div>
              <p className="text-sm text-gray-600">Start Date</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Attempts</p>
                <p className="text-2xl font-bold">{analytics.totalAttempts}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold">{analytics.completedAttempts}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Average Score</p>
                <p className="text-2xl font-bold">{analytics.averageScore.toFixed(1)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <BarChart3 className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completion Rate</p>
                <p className="text-2xl font-bold">{analytics.completionRate.toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Average Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Average Performance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Average Score</span>
                <span>{analytics.averageScore.toFixed(1)} / {assessment.totalMarks}</span>
              </div>
              <Progress 
                value={(analytics.averageScore / assessment.totalMarks) * 100} 
                className="h-2" 
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Average Percentage</span>
                <span>{analytics.averagePercentage.toFixed(1)}%</span>
              </div>
              <Progress value={analytics.averagePercentage} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Completion Rate</span>
                <span>{analytics.completionRate.toFixed(1)}%</span>
              </div>
              <Progress value={analytics.completionRate} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Grade Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Grade Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {getGradeDistribution().map(({ grade, count, percentage }) => (
                <div key={grade} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">Grade {grade}</span>
                    <span>{count} students ({percentage.toFixed(1)}%)</span>
                  </div>
                  <Progress value={percentage} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Assessment Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Assessment Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-lg font-semibold text-blue-600">
                {formatDate(assessment.startDate)}
              </div>
              <p className="text-sm text-gray-600">Start Date</p>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-green-600">
                {formatDate(assessment.endDate)}
              </div>
              <p className="text-sm text-gray-600">End Date</p>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-purple-600">
                {assessment.duration} minutes
              </div>
              <p className="text-sm text-gray-600">Duration</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Assessment Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-gray-700">{assessment.instructions}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
