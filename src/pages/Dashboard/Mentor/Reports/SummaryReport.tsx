import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Users, 
  BookOpen, 
  FileText, 
  Activity,
  TrendingUp,
  TrendingDown,
  Download,
  RefreshCw
} from "lucide-react";
import reportService, { type SummaryReport } from "@/api/reportService";
import { toast } from "sonner";

export default function SummaryReportComponent() {
  const [report, setReport] = useState<SummaryReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadSummaryReport();
  }, []);

  const loadSummaryReport = async () => {
    try {
      setLoading(true);
      console.log("Loading summary report...");
      const response = await reportService.getSummaryReport();
      console.log("Summary report response:", response);
      setReport(response.data);
    } catch (error: any) {
      console.error("Error loading summary report:", error);
      console.error("Error response:", error.response?.data);
      const errorMessage = error.response?.data?.message || error.message || "Failed to load summary report";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await loadSummaryReport();
      toast.success("Report refreshed successfully");
    } catch (error) {
      console.error("Error refreshing report:", error);
      toast.error("Failed to refresh report");
    } finally {
      setRefreshing(false);
    }
  };

  const handleExport = () => {
    // TODO: Implement export functionality
    toast.info("Export functionality will be implemented soon");
  };

  const handleTestConnection = async () => {
    try {
      console.log("Testing connection...");
      const response = await reportService.testConnection();
      console.log("Test response:", response);
      toast.success("Connection test successful!");
    } catch (error: any) {
      console.error("Connection test failed:", error);
      toast.error(`Connection test failed: ${error.message}`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading summary report...</span>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No data available</p>
      </div>
    );
  }

  const { overview, byGrade, bySubject, moduleStatus, assessmentStatus } = report;

  return (
    <div className="space-y-6">
      {/* Action Buttons */}
      <div className="flex justify-end gap-2">
        <Button variant="outline" size="sm" onClick={handleTestConnection}>
          Test Connection
        </Button>
        <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
        <Button variant="outline" size="sm" onClick={handleExport}>
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.totalStudents.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Active students across all grades
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Modules</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.totalModules.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Available learning modules
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Assessments</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.totalAssessments.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Published assessments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Activities</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.totalActivities.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Student interactions recorded
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Module Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Module Status Overview
            </CardTitle>
            <CardDescription>
              Progress of module completion across all students
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Completed</span>
                <Badge variant="default" className="bg-green-100 text-green-800">
                  {moduleStatus.completed.toLocaleString()}
                </Badge>
              </div>
              <Progress 
                value={(moduleStatus.completed / (moduleStatus.completed + moduleStatus.inProgress + moduleStatus.pending)) * 100} 
                className="h-2"
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">In Progress</span>
                <Badge variant="secondary">
                  {moduleStatus.inProgress.toLocaleString()}
                </Badge>
              </div>
              <Progress 
                value={(moduleStatus.inProgress / (moduleStatus.completed + moduleStatus.inProgress + moduleStatus.pending)) * 100} 
                className="h-2"
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Pending</span>
                <Badge variant="outline">
                  {moduleStatus.pending.toLocaleString()}
                </Badge>
              </div>
              <Progress 
                value={(moduleStatus.pending / (moduleStatus.completed + moduleStatus.inProgress + moduleStatus.pending)) * 100} 
                className="h-2"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Assessment Status Overview
            </CardTitle>
            <CardDescription>
              Progress of assessment completion across all students
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Completed</span>
                <Badge variant="default" className="bg-green-100 text-green-800">
                  {assessmentStatus.completed.toLocaleString()}
                </Badge>
              </div>
              <Progress 
                value={(assessmentStatus.completed / (assessmentStatus.completed + assessmentStatus.inProgress + assessmentStatus.pending)) * 100} 
                className="h-2"
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">In Progress</span>
                <Badge variant="secondary">
                  {assessmentStatus.inProgress.toLocaleString()}
                </Badge>
              </div>
              <Progress 
                value={(assessmentStatus.inProgress / (assessmentStatus.completed + assessmentStatus.inProgress + assessmentStatus.pending)) * 100} 
                className="h-2"
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Pending</span>
                <Badge variant="outline">
                  {assessmentStatus.pending.toLocaleString()}
                </Badge>
              </div>
              <Progress 
                value={(assessmentStatus.pending / (assessmentStatus.completed + assessmentStatus.inProgress + assessmentStatus.pending)) * 100} 
                className="h-2"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Grade-wise Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Performance by Grade
          </CardTitle>
          <CardDescription>
            Student engagement and completion rates across different grades
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(byGrade).map(([grade, data]) => (
              <div key={grade} className="border rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">{grade}</h4>
                  <Badge variant="outline">{data.totalStudents} students</Badge>
                </div>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Modules Completed:</span>
                    <span className="font-medium">{data.completedModules}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Assessments Completed:</span>
                    <span className="font-medium">{data.completedAssessments}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Activities:</span>
                    <span className="font-medium">{data.totalActivities}</span>
                  </div>
                </div>
                <div className="pt-2">
                  <Progress 
                    value={(data.completedModules / (data.totalStudents * 10)) * 100} 
                    className="h-2"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Module completion rate
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Subject-wise Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Performance by Subject
          </CardTitle>
          <CardDescription>
            Module distribution and completion across different subjects
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(bySubject).map(([subject, data]) => (
              <div key={subject} className="border rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">{subject}</h4>
                  <Badge variant="outline">{data.totalModules} modules</Badge>
                </div>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Students Enrolled:</span>
                    <span className="font-medium">{data.totalStudents}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Modules Completed:</span>
                    <span className="font-medium">{data.completedModules}</span>
                  </div>
                </div>
                <div className="pt-2">
                  <Progress 
                    value={(data.completedModules / (data.totalStudents * data.totalModules)) * 100} 
                    className="h-2"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Subject completion rate
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
