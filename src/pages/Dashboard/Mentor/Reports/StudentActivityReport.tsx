import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  Search, 
  Filter, 
  Download, 
  RefreshCw,
  Video,
  Download as DownloadIcon,
  Eye,
  BookOpen,
  FileText,
  Clock,
  Calendar,
  Activity
} from "lucide-react";
import reportService, { type StudentActivityReport } from "@/api/reportService";
import { toast } from "sonner";

export default function StudentActivityReportComponent() {
  const [report, setReport] = useState<StudentActivityReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filters, setFilters] = useState({
    studentId: "",
    grade: "",
    section: "",
    subject: "",
    schoolId: "",
    startDate: "",
    endDate: ""
  });
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadStudentActivityReport();
  }, []);

  const loadStudentActivityReport = async () => {
    try {
      setLoading(true);
      const response = await reportService.getStudentActivityReport(filters);
      setReport(response.data);
    } catch (error) {
      console.error("Error loading student activity report:", error);
      toast.error("Failed to load student activity report");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await loadStudentActivityReport();
      toast.success("Report refreshed successfully");
    } catch (error) {
      console.error("Error refreshing report:", error);
      toast.error("Failed to refresh report");
    } finally {
      setRefreshing(false);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
  };

  const handleApplyFilters = () => {
    loadStudentActivityReport();
  };

  const handleClearFilters = () => {
    setFilters({ 
      studentId: "", 
      grade: "", 
      section: "", 
      subject: "", 
      schoolId: "", 
      startDate: "", 
      endDate: "" 
    });
    setSearchTerm("");
  };

  const handleExport = () => {
    // TODO: Implement export functionality
    toast.info("Export functionality will be implemented soon");
  };

  const filteredData = report?.detailed.filter(item =>
    item.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.grade.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.section.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading student activity report...</span>
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

  const { detailed, summary } = report;

  return (
    <div className="space-y-6">
      {/* Action Buttons */}
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
          <CardDescription>
            Filter the student activity report by various criteria
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="studentId">Student ID</Label>
              <Input
                id="studentId"
                placeholder="Enter student ID"
                value={filters.studentId}
                onChange={(e) => handleFilterChange("studentId", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="grade">Grade</Label>
              <Select value={filters.grade} onValueChange={(value) => handleFilterChange("grade", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select grade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Grades</SelectItem>
                  {Array.from({ length: 10 }, (_, i) => (
                    <SelectItem key={i + 1} value={`Grade ${i + 1}`}>
                      Grade {i + 1}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="section">Section</Label>
              <Input
                id="section"
                placeholder="Enter section"
                value={filters.section}
                onChange={(e) => handleFilterChange("section", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                placeholder="Enter subject"
                value={filters.subject}
                onChange={(e) => handleFilterChange("subject", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="schoolId">School ID</Label>
              <Input
                id="schoolId"
                placeholder="Enter school ID"
                value={filters.schoolId}
                onChange={(e) => handleFilterChange("schoolId", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange("startDate", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange("endDate", e.target.value)}
              />
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <Button onClick={handleApplyFilters}>
              Apply Filters
            </Button>
            <Button variant="outline" onClick={handleClearFilters}>
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalStudents.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Students in selected criteria
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Activities</CardTitle>
            <Activity className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {summary.totalActivities.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              All student interactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Video Views</CardTitle>
            <Video className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {summary.totalVideoViews.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Video content accessed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Time Spent</CardTitle>
            <Clock className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {Math.round(summary.averageTimeSpent / 60)}m
            </div>
            <p className="text-xs text-muted-foreground">
              Average engagement time
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Activity Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Activity Summary
          </CardTitle>
          <CardDescription>
            Overview of student engagement across different activity types
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <Video className="h-8 w-8 mx-auto mb-2 text-purple-600" />
              <div className="text-2xl font-bold">{summary.totalVideoViews}</div>
              <p className="text-sm text-muted-foreground">Video Views</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <DownloadIcon className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <div className="text-2xl font-bold">{summary.totalResourceDownloads}</div>
              <p className="text-sm text-muted-foreground">Resource Downloads</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <BookOpen className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <div className="text-2xl font-bold">{summary.totalModuleCompletions}</div>
              <p className="text-sm text-muted-foreground">Module Completions</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <FileText className="h-8 w-8 mx-auto mb-2 text-orange-600" />
              <div className="text-2xl font-bold">{summary.totalAssessmentSubmissions}</div>
              <p className="text-sm text-muted-foreground">Assessment Submissions</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Report */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Student Activity Details
          </CardTitle>
          <CardDescription>
            Individual student activity breakdown and engagement metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Search */}
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by student name, ID, grade, or section..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="assessments">Assessments</TabsTrigger>
              <TabsTrigger value="activities">Recent Activities</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Grade</TableHead>
                      <TableHead>Section</TableHead>
                      <TableHead>Video Views</TableHead>
                      <TableHead>Downloads</TableHead>
                      <TableHead>Module Completions</TableHead>
                      <TableHead>Assessments</TableHead>
                      <TableHead>Total Time</TableHead>
                      <TableHead>Resources Accessed</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredData.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{item.studentName}</div>
                            <div className="text-sm text-muted-foreground">{item.studentId}</div>
                          </div>
                        </TableCell>
                        <TableCell>{item.grade}</TableCell>
                        <TableCell>{item.section}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Video className="h-4 w-4 text-purple-600" />
                            <span className="font-medium">{item.videoViews}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <DownloadIcon className="h-4 w-4 text-blue-600" />
                            <span className="font-medium">{item.resourceDownloads}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <BookOpen className="h-4 w-4 text-green-600" />
                            <span className="font-medium">{item.moduleCompletions}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <FileText className="h-4 w-4 text-orange-600" />
                            <span className="font-medium">{item.assessmentSubmissions}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4 text-gray-600" />
                            <span className="font-medium">{item.totalTimeSpentFormatted}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{item.uniqueResourcesAccessed}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="assessments" className="space-y-4">
              <div className="space-y-4">
                {filteredData.map((student, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <CardTitle className="text-lg">
                        {student.studentName} - Assessment Scores
                      </CardTitle>
                      <CardDescription>
                        {student.grade} - {student.section}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {student.assessmentScores.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {student.assessmentScores.map((assessment, idx) => (
                            <div key={idx} className="border rounded-lg p-4 space-y-2">
                              <div className="font-medium">{assessment.assessmentTitle}</div>
                              <div className="text-sm text-muted-foreground">{assessment.subject}</div>
                              <div className="flex items-center justify-between">
                                <span className="text-sm">Score:</span>
                                <Badge variant="outline" className="bg-blue-100 text-blue-800">
                                  {assessment.percentage}%
                                </Badge>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-sm">Grade:</span>
                                <Badge variant="outline">{assessment.grade}</Badge>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-sm">Time:</span>
                                <span className="text-sm">{Math.floor(assessment.timeSpent / 60)}m {assessment.timeSpent % 60}s</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-sm">Status:</span>
                                <Badge variant={assessment.status === 'completed' ? 'default' : 'secondary'}>
                                  {assessment.status}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted-foreground">No assessment data available</p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="activities" className="space-y-4">
              <div className="space-y-4">
                {filteredData.map((student, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <CardTitle className="text-lg">
                        {student.studentName} - Recent Activities
                      </CardTitle>
                      <CardDescription>
                        {student.grade} - {student.section}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {student.recentActivities.length > 0 ? (
                        <div className="space-y-2">
                          {student.recentActivities.map((activity, idx) => (
                            <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                              <div className="flex items-center gap-3">
                                {activity.type === 'video_view' && <Video className="h-4 w-4 text-purple-600" />}
                                {activity.type === 'resource_download' && <DownloadIcon className="h-4 w-4 text-blue-600" />}
                                {activity.type === 'module_complete' && <BookOpen className="h-4 w-4 text-green-600" />}
                                {activity.type === 'assessment_submit' && <FileText className="h-4 w-4 text-orange-600" />}
                                {activity.type === 'resource_view' && <Eye className="h-4 w-4 text-gray-600" />}
                                <div>
                                  <div className="font-medium capitalize">
                                    {activity.type.replace('_', ' ')}
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    {activity.resource !== 'N/A' && `Resource: ${activity.resource}`}
                                    {activity.assessment !== 'N/A' && `Assessment: ${activity.assessment}`}
                                    {activity.module !== 'N/A' && `Module: ${activity.module}`}
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-sm font-medium">
                                  {activity.timeSpent > 0 ? `${Math.floor(activity.timeSpent / 60)}m ${activity.timeSpent % 60}s` : 'N/A'}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {new Date(activity.createdAt).toLocaleDateString()}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted-foreground">No recent activities available</p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>

          {filteredData.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No data found matching your search criteria</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
