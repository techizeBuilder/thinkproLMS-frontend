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
    <div className="container mx-auto p-3 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header - Responsive layout */}
      <div className="space-y-3 sm:space-y-0">
        <Button variant="outline" onClick={() => navigate("/mentor/assessments")} className="text-sm">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Assessments
        </Button>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex-1">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">{assessment.title}</h1>
            <p className="text-sm sm:text-base text-gray-600">Assessment Analytics & Results</p>
          </div>
          <Button variant="outline" onClick={exportResults} className="text-sm w-full sm:w-auto">
            <Download className="h-4 w-4 mr-2" />
            Export Results
          </Button>
        </div>
      </div>

      {/* Assessment Overview - All stats in single row on mobile */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Assessment Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            <div className="text-center">
              <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-blue-600">{assessment.questions.length}</div>
              <p className="text-xs sm:text-sm text-gray-600">Total Questions</p>
            </div>
            <div className="text-center">
              <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-green-600">{assessment.totalMarks}</div>
              <p className="text-xs sm:text-sm text-gray-600">Total Marks</p>
            </div>
            <div className="text-center">
              <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-purple-600">{assessment.duration}</div>
              <p className="text-xs sm:text-sm text-gray-600">Duration (min)</p>
            </div>
            <div className="text-center">
              <div className="text-sm sm:text-lg lg:text-xl font-bold text-orange-600">
                {new Date(assessment.startDate).toLocaleDateString()}
              </div>
              <p className="text-xs sm:text-sm text-gray-600">Start Date</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics - Compact layout outside cards */}
      <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">Key Metrics</h3>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6">
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Users className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 mr-2" />
              <span className="text-sm sm:text-base font-medium text-gray-600">Total Eligible</span>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-blue-600">{analytics.totalEligibleStudents}</p>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 mr-2" />
              <span className="text-sm sm:text-base font-medium text-gray-600">Completed</span>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-green-600">{analytics.completedAttempts}</p>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-600 mr-2" />
              <span className="text-sm sm:text-base font-medium text-gray-600">Pending</span>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-yellow-600">{analytics.pendingStudents}</p>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600 mr-2" />
              <span className="text-sm sm:text-base font-medium text-gray-600">Avg Score</span>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-purple-600">{analytics.averageScore.toFixed(1)}</p>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <BarChart3 className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600 mr-2" />
              <span className="text-sm sm:text-base font-medium text-gray-600">Completion</span>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-orange-600">{analytics.completionRate.toFixed(1)}%</p>
          </div>
        </div>
      </div>

      {/* Student Reports Table - Responsive */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <User className="h-5 w-5" />
            Student Reports
          </CardTitle>
        </CardHeader>
        <CardContent>
          {analytics.studentReports && analytics.studentReports.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2 sm:p-3 font-medium text-xs sm:text-sm">Student</th>
                    <th className="text-left p-2 sm:p-3 font-medium text-xs sm:text-sm hidden sm:table-cell">Grade/Section</th>
                    <th className="text-left p-2 sm:p-3 font-medium text-xs sm:text-sm">Marks</th>
                    <th className="text-left p-2 sm:p-3 font-medium text-xs sm:text-sm hidden md:table-cell">Percentage</th>
                    <th className="text-left p-2 sm:p-3 font-medium text-xs sm:text-sm">Grade</th>
                    <th className="text-left p-2 sm:p-3 font-medium text-xs sm:text-sm hidden lg:table-cell">Time</th>
                    <th className="text-left p-2 sm:p-3 font-medium text-xs sm:text-sm">Status</th>
                    <th className="text-left p-2 sm:p-3 font-medium text-xs sm:text-sm hidden md:table-cell">Submitted</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.studentReports.map((report: StudentReport, index: number) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="p-2 sm:p-3">
                        <div>
                          <div className="font-medium text-xs sm:text-sm">{report.studentName}</div>
                          <div className="text-xs text-gray-500">{report.studentId}</div>
                          <div className="text-xs text-gray-500 sm:hidden">{report.studentGrade} - {report.section}</div>
                        </div>
                      </td>
                      <td className="p-2 sm:p-3 hidden sm:table-cell">
                        <div className="text-xs sm:text-sm">
                          <div>{report.studentGrade}</div>
                          <div className="text-gray-500">{report.section}</div>
                        </div>
                      </td>
                      <td className="p-2 sm:p-3">
                        <div className="font-medium text-xs sm:text-sm">
                          {report.status === 'pending' ? (
                            <span className="text-gray-400">- / {assessment.totalMarks}</span>
                          ) : (
                            `${report.marksObtained} / ${assessment.totalMarks}`
                          )}
                        </div>
                        {report.status !== 'pending' && (
                          <div className="text-xs text-gray-500 md:hidden">
                            {report.percentage.toFixed(1)}%
                          </div>
                        )}
                      </td>
                      <td className="p-2 sm:p-3 hidden md:table-cell">
                        {report.status === 'pending' ? (
                          <span className="text-gray-400">-</span>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-xs sm:text-sm">{report.percentage.toFixed(1)}%</span>
                            <Progress value={report.percentage} className="w-12 h-2" />
                          </div>
                        )}
                      </td>
                      <td className="p-2 sm:p-3">
                        {report.status === 'pending' ? (
                          <span className="text-gray-400 text-xs">-</span>
                        ) : (
                          <Badge 
                            variant={getGradeBadgeVariant(report.grade)}
                            className="font-medium text-xs"
                          >
                            {report.grade}
                          </Badge>
                        )}
                      </td>
                      <td className="p-2 sm:p-3 hidden lg:table-cell">
                        <div className="flex items-center gap-1 text-xs">
                          <Clock className="h-3 w-3" />
                          {report.status === 'pending' ? (
                            <span className="text-gray-400">-</span>
                          ) : (
                            report.timeSpentFormatted
                          )}
                        </div>
                      </td>
                      <td className="p-2 sm:p-3">
                        <Badge 
                          variant={getStatusBadgeVariant(report.status)}
                          className="text-xs"
                        >
                          {report.status.replace('_', ' ')}
                        </Badge>
                        <div className="text-xs text-gray-500 lg:hidden mt-1">
                          {report.submittedAt ? formatDate(report.submittedAt) : 'Not submitted'}
                        </div>
                      </td>
                      <td className="p-2 sm:p-3 hidden md:table-cell">
                        <div className="text-xs sm:text-sm">
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
              <p className="text-sm sm:text-base">No student reports available yet</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Performance Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Average Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Average Performance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-xs sm:text-sm">
                <span>Average Score</span>
                <span>{analytics.averageScore.toFixed(1)} / {assessment.totalMarks}</span>
              </div>
              <Progress 
                value={(analytics.averageScore / assessment.totalMarks) * 100} 
                className="h-2" 
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-xs sm:text-sm">
                <span>Average Percentage</span>
                <span>{analytics.averagePercentage.toFixed(1)}%</span>
              </div>
              <Progress value={analytics.averagePercentage} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs sm:text-sm">
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
            <CardTitle className="text-lg sm:text-xl">Grade Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 sm:space-y-3">
              {getGradeDistribution().map(({ grade, count, percentage }) => (
                <div key={grade} className="space-y-1">
                  <div className="flex justify-between text-xs sm:text-sm">
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
          <CardTitle className="text-lg sm:text-xl">Assessment Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            <div className="text-center">
              <div className="text-sm sm:text-lg font-semibold text-blue-600">
                {formatDate(assessment.startDate)}
              </div>
              <p className="text-xs sm:text-sm text-gray-600">Start Date</p>
            </div>
            <div className="text-center">
              <div className="text-sm sm:text-lg font-semibold text-green-600">
                {formatDate(assessment.endDate)}
              </div>
              <p className="text-xs sm:text-sm text-gray-600">End Date</p>
            </div>
            <div className="text-center">
              <div className="text-sm sm:text-lg font-semibold text-purple-600">
                {assessment.duration} minutes
              </div>
              <p className="text-xs sm:text-sm text-gray-600">Duration</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Assessment Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
            <p className="text-sm sm:text-base text-gray-700">{assessment.instructions}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
