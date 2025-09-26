import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Users, 
  TrendingUp, 
  CheckCircle,
  BarChart3,
  Download,
  Clock,
  User
} from "lucide-react";
import { assessmentService, type Assessment, type AssessmentAnalytics, type StudentReport } from "@/api/assessmentService";
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
      if (!id) return;
      
      const response = await assessmentService.exportAssessmentResults(id);
      
      // Create blob from response data
      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Get filename from response headers or use default
      const contentDisposition = response.headers['content-disposition'];
      let filename = 'assessment_results.xlsx';
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }
      
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success("Assessment results exported successfully");
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

  const getGradeBadgeVariant = (grade: string) => {
    switch (grade) {
      case 'A+':
      case 'A':
        return 'default';
      case 'B+':
      case 'B':
        return 'secondary';
      case 'C+':
      case 'C':
        return 'outline';
      case 'D':
        return 'destructive';
      case 'F':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'completed':
      case 'submitted':
        return 'default';
      case 'in_progress':
        return 'secondary';
      case 'timeout':
        return 'destructive';
      case 'pending':
        return 'outline';
      default:
        return 'outline';
    }
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Eligible</p>
                <p className="text-2xl font-bold">{analytics.totalEligibleStudents}</p>
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
              <Clock className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold">{analytics.pendingStudents}</p>
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

      {/* Student Reports Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Student Reports
          </CardTitle>
        </CardHeader>
        <CardContent>
          {analytics.studentReports && analytics.studentReports.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-medium">Student</th>
                    <th className="text-left p-3 font-medium">Grade/Section</th>
                    <th className="text-left p-3 font-medium">Marks</th>
                    <th className="text-left p-3 font-medium">Percentage</th>
                    <th className="text-left p-3 font-medium">Grade</th>
                    <th className="text-left p-3 font-medium">Time Taken</th>
                    <th className="text-left p-3 font-medium">Status</th>
                    <th className="text-left p-3 font-medium">Submitted</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.studentReports.map((report: StudentReport, index: number) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="p-3">
                        <div>
                          <div className="font-medium">{report.studentName}</div>
                          <div className="text-sm text-gray-500">{report.studentId}</div>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="text-sm">
                          <div>{report.studentGrade}</div>
                          <div className="text-gray-500">{report.section}</div>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="font-medium">
                          {report.status === 'pending' ? (
                            <span className="text-gray-400">- / {assessment.totalMarks}</span>
                          ) : (
                            `${report.marksObtained} / ${assessment.totalMarks}`
                          )}
                        </div>
                      </td>
                      <td className="p-3">
                        {report.status === 'pending' ? (
                          <span className="text-gray-400">-</span>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{report.percentage.toFixed(1)}%</span>
                            <Progress value={report.percentage} className="w-16 h-2" />
                          </div>
                        )}
                      </td>
                      <td className="p-3">
                        {report.status === 'pending' ? (
                          <span className="text-gray-400">-</span>
                        ) : (
                          <Badge 
                            variant={getGradeBadgeVariant(report.grade)}
                            className="font-medium"
                          >
                            {report.grade}
                          </Badge>
                        )}
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-1 text-sm">
                          <Clock className="h-4 w-4" />
                          {report.status === 'pending' ? (
                            <span className="text-gray-400">-</span>
                          ) : (
                            report.timeSpentFormatted
                          )}
                        </div>
                      </td>
                      <td className="p-3">
                        <Badge 
                          variant={getStatusBadgeVariant(report.status)}
                          className="text-xs"
                        >
                          {report.status.replace('_', ' ')}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <div className="text-sm">
                          {report.submittedAt ? formatDate(report.submittedAt) : 'Not submitted'}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No student reports available yet</p>
            </div>
          )}
        </CardContent>
      </Card>

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
