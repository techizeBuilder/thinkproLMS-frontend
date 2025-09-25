import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  FileText, 
  Search, 
  Filter, 
  Download, 
  RefreshCw,
  CheckCircle,
  Clock,
  Users,
  TrendingUp,
  Award
} from "lucide-react";
import reportService, { type AssessmentCompletionReport } from "@/api/reportService";
import { toast } from "sonner";

export default function AssessmentCompletionReportComponent() {
  const [report, setReport] = useState<AssessmentCompletionReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filters, setFilters] = useState({
    grade: "",
    subject: "",
    section: "",
    schoolId: ""
  });
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadAssessmentCompletionReport();
  }, []);

  const loadAssessmentCompletionReport = async () => {
    try {
      setLoading(true);
      const response = await reportService.getAssessmentCompletionReport(filters);
      setReport(response.data);
    } catch (error) {
      console.error("Error loading assessment completion report:", error);
      toast.error("Failed to load assessment completion report");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await loadAssessmentCompletionReport();
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
    loadAssessmentCompletionReport();
  };

  const handleClearFilters = () => {
    setFilters({ grade: "", subject: "", section: "", schoolId: "" });
    setSearchTerm("");
  };

  const handleExport = () => {
    // TODO: Implement export functionality
    toast.info("Export functionality will be implemented soon");
  };

  const filteredData = report?.detailed.filter(item =>
    item.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.assessmentTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.subject.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
      case 'submitted':
        return <Badge variant="default" className="bg-green-100 text-green-800">
          <CheckCircle className="h-3 w-3 mr-1" /> Completed
        </Badge>;
      case 'in_progress':
        return <Badge variant="secondary">
          <Clock className="h-3 w-3 mr-1" /> In Progress
        </Badge>;
      case 'pending':
        return <Badge variant="outline">
          <Clock className="h-3 w-3 mr-1" /> Pending
        </Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getGradeBadge = (grade: string) => {
    const gradeColors: Record<string, string> = {
      'A+': 'bg-green-100 text-green-800',
      'A': 'bg-green-100 text-green-800',
      'B+': 'bg-blue-100 text-blue-800',
      'B': 'bg-blue-100 text-blue-800',
      'C+': 'bg-yellow-100 text-yellow-800',
      'C': 'bg-yellow-100 text-yellow-800',
      'D': 'bg-orange-100 text-orange-800',
      'F': 'bg-red-100 text-red-800'
    };

    return (
      <Badge variant="outline" className={gradeColors[grade] || 'bg-gray-100 text-gray-800'}>
        {grade}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading assessment completion report...</span>
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
            Filter the assessment completion report by grade, subject, section, or school
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                placeholder="Enter subject"
                value={filters.subject}
                onChange={(e) => handleFilterChange("subject", e.target.value)}
              />
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
              <Label htmlFor="schoolId">School ID</Label>
              <Input
                id="schoolId"
                placeholder="Enter school ID"
                value={filters.schoolId}
                onChange={(e) => handleFilterChange("schoolId", e.target.value)}
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
            <div className="text-2xl font-bold">{detailed.length > 0 ? new Set(detailed.map(d => d.studentId)).size : 0}</div>
            <p className="text-xs text-muted-foreground">
              Students in selected criteria
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Assessments</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {detailed.filter(d => d.status === 'completed' || d.status === 'submitted').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Assessments completed by students
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Assessments</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {detailed.filter(d => d.status === 'pending').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Assessments not yet taken
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            <Award className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {detailed.filter(d => d.status === 'completed' || d.status === 'submitted').length > 0 ? 
                Math.round(detailed.filter(d => d.status === 'completed' || d.status === 'submitted')
                  .reduce((sum, d) => sum + d.percentage, 0) / 
                  detailed.filter(d => d.status === 'completed' || d.status === 'submitted').length) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Average assessment score
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Summary by Grade/Subject/Section */}
      {summary.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Summary by Grade, Subject & Section
            </CardTitle>
            <CardDescription>
              Assessment completion statistics grouped by grade, subject, and section
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Grade</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Section</TableHead>
                    <TableHead>Total Assessments</TableHead>
                    <TableHead>Completed</TableHead>
                    <TableHead>Pending</TableHead>
                    <TableHead>Average Score</TableHead>
                    <TableHead>Completion Rate</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {summary.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{item.grade}</TableCell>
                      <TableCell>{item.subject}</TableCell>
                      <TableCell>{item.section}</TableCell>
                      <TableCell>{item.totalAssessments}</TableCell>
                      <TableCell>
                        <Badge variant="default" className="bg-green-100 text-green-800">
                          {item.completedAssessments}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {item.pendingAssessments}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-blue-100 text-blue-800">
                          {item.averageScore.toFixed(1)}%
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{item.completionRate.toFixed(1)}%</span>
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${item.completionRate}%` }}
                            ></div>
                          </div>
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

      {/* Detailed Report */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Detailed Assessment Completion Report
          </CardTitle>
          <CardDescription>
            Individual student assessment completion status and scores
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Search */}
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by student name, ID, assessment title, or subject..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student ID</TableHead>
                  <TableHead>Student Name</TableHead>
                  <TableHead>Grade</TableHead>
                  <TableHead>Section</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Assessment</TableHead>
                  <TableHead>Modules</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Grade</TableHead>
                  <TableHead>Time Spent</TableHead>
                  <TableHead>Submitted At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{item.studentId}</TableCell>
                    <TableCell>{item.studentName}</TableCell>
                    <TableCell>{item.grade}</TableCell>
                    <TableCell>{item.section}</TableCell>
                    <TableCell>{item.subject}</TableCell>
                    <TableCell className="max-w-xs truncate">{item.assessmentTitle}</TableCell>
                    <TableCell>
                      <div className="max-w-xs">
                        {item.modules.slice(0, 2).map((module, idx) => (
                          <Badge key={idx} variant="outline" className="mr-1 mb-1 text-xs">
                            {module}
                          </Badge>
                        ))}
                        {item.modules.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{item.modules.length - 2} more
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(item.status)}</TableCell>
                    <TableCell>
                      {item.status === 'completed' || item.status === 'submitted' ? (
                        <span className="font-medium">{item.score} / {item.score + (100 - item.percentage)}</span>
                      ) : '-'}
                    </TableCell>
                    <TableCell>
                      {item.status === 'completed' || item.status === 'submitted' ? 
                        getGradeBadge(item.grade) : '-'
                      }
                    </TableCell>
                    <TableCell>
                      {item.timeSpent > 0 ? 
                        `${Math.floor(item.timeSpent / 60)}m ${item.timeSpent % 60}s` : '-'
                      }
                    </TableCell>
                    <TableCell>
                      {item.submittedAt ? new Date(item.submittedAt).toLocaleDateString() : '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

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
