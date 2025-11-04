import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  BarChart3, 
  Filter, 
  Search, 
  Eye,
  Calendar,
  Clock,
  Users,
} from "lucide-react";
import { assessmentService, type AssessmentReportData, type AssessmentReportFilters } from "@/api/assessmentService";
import { schoolService } from "@/api/schoolService";
import { mentorService } from "@/api/mentorService";
import { toast } from "sonner";

export default function SuperAdminAssessmentReportsPage() {
  const navigate = useNavigate();
  
  const [assessments, setAssessments] = useState<AssessmentReportData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<AssessmentReportFilters>({});
  
  // Filter options
  const [schools, setSchools] = useState<any[]>([]);
  const [mentors, setMentors] = useState<any[]>([]);
  const [grades, setGrades] = useState<number[]>([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  const [sections] = useState(['A', 'B', 'C', 'D', 'E']);
  const [statuses] = useState([
    { value: 'draft', label: 'Draft' },
    { value: 'published', label: 'Published' },
    { value: 'cancelled', label: 'Cancelled' }
  ]);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    loadAssessments();
  }, [filters]);

  // Load grades based on selected school
  useEffect(() => {
    const loadGradesForSchool = async () => {
      if (filters.school) {
        try {
          const serviceDetailsResponse = await schoolService.getServiceDetails(filters.school);
          if (serviceDetailsResponse.success && serviceDetailsResponse.data.grades) {
            // Extract just the grade numbers from the service details
            const availableGrades = serviceDetailsResponse.data.grades.map((gradeData) => gradeData.grade);
            setGrades(availableGrades);
            // Clear grade filter if current grade is not in available grades
            if (filters.grade && !availableGrades.includes(Number(filters.grade))) {
              setFilters(prev => ({ ...prev, grade: undefined }));
            }
          } else {
            // Fallback to default grades if no service details
            setGrades([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
          }
        } catch (error) {
          console.error("Error loading school service details:", error);
          // Fallback to default grades if service details fetch fails
          setGrades([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
        }
      } else {
        // No school selected - show all grades
        setGrades([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
      }
    };

    loadGradesForSchool();
  }, [filters.school]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [schoolsResponse, mentorsResponse] = await Promise.all([
        schoolService.getAllSchools(),
        mentorService.getAll()
      ]);
      
      setSchools(schoolsResponse || []);
      setMentors(mentorsResponse.data || []);
    } catch (error) {
      console.error("Error loading filter data:", error);
      toast.error("Failed to load filter options");
    } finally {
      setLoading(false);
    }
  };

  const loadAssessments = async () => {
    try {
      setLoading(true);
      const response = await assessmentService.getAssessmentReportsForSuperAdmin(filters);
      setAssessments(response.data || []);
    } catch (error) {
      console.error("Error loading assessments:", error);
      toast.error("Failed to load assessment reports");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: keyof AssessmentReportFilters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value === "all" ? undefined : value
    }));
  };

  const clearFilters = () => {
    setFilters({});
    setSearchTerm("");
  };

  const filteredAssessments = assessments.filter(assessment => {
    const matchesSearch = assessment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         assessment.school.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { variant: "secondary" as const, label: "Draft" },
      published: { variant: "default" as const, label: "Published" },
      cancelled: { variant: "destructive" as const, label: "Cancelled" }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Assessment Reports</h1>
          <p className="text-muted-foreground">
            View and analyze assessment performance across all schools
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="text-sm font-medium">School</label>
              <Select 
                value={filters.school || ""} 
                onValueChange={(value) => handleFilterChange('school', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Schools" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Schools</SelectItem>
                  {schools.map(school => (
                    <SelectItem key={school._id} value={school._id}>
                      {school.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Created By</label>
              <Select 
                value={filters.createdBy || ""} 
                onValueChange={(value) => handleFilterChange('createdBy', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Mentors" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Mentors</SelectItem>
                  {mentors.map(mentor => (
                    <SelectItem key={mentor._id} value={mentor.user._id}>
                      {mentor.user.name} ({mentor.user.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Status</label>
              <Select 
                value={filters.status || ""} 
                onValueChange={(value) => handleFilterChange('status', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {statuses.map(status => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Grade</label>
              <Select 
                value={filters.grade?.toString() || ""} 
                onValueChange={(value) => handleFilterChange('grade', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Grades" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Grades</SelectItem>
                  {grades.map(grade => (
                    <SelectItem key={grade} value={grade.toString()}>
                      Grade {grade}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Section</label>
              <Select 
                value={filters.section || ""} 
                onValueChange={(value) => handleFilterChange('section', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Sections" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sections</SelectItem>
                  {sections.map(section => (
                    <SelectItem key={section} value={section}>
                      Section {section}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-4 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search assessments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" onClick={clearFilters}>
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Assessment Reports Table */}
      <div className="rounded-lg border border-[var(--border)] bg-card">
        <div className="p-4 border-b border-[var(--border)]">
          <div className="flex items-center gap-2 font-semibold">
            <BarChart3 className="h-5 w-5" />
            Assessment Reports ({filteredAssessments.length})
          </div>
        </div>
        <div className="p-4">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>School</TableHead>
                  <TableHead>Mentor</TableHead>
                  <TableHead>Grade & Sections</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Date Range</TableHead>
                  <TableHead>Attempts</TableHead>
                  <TableHead>Analytics</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAssessments.map((assessment) => (
                  <TableRow key={assessment._id}>
                    <TableCell className="font-medium">
                      {assessment.title}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{assessment.school.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {assessment.school.city}, {assessment.school.state}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{assessment.createdBy.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {assessment.createdBy.email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">Grade {assessment.grade}</div>
                        <div className="text-sm text-muted-foreground">
                          Sections: {assessment.sections.join(', ')}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(assessment.status)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {formatDuration(assessment.duration)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <div className="text-sm">
                          <div>{formatDate(assessment.startDate)}</div>
                          <div className="text-muted-foreground">to</div>
                          <div>{formatDate(assessment.endDate)}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>{assessment.totalAttempts}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/superadmin/assessments/${assessment._id}/analytics`)}
                        className="flex items-center gap-2"
                      >
                        <Eye className="h-4 w-4" />
                        View Analytics
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredAssessments.length === 0 && (
            <div className="text-center py-8">
              <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium">No assessments found</h3>
              <p className="text-muted-foreground">
                {searchTerm || Object.values(filters).some(f => f) 
                  ? "Try adjusting your search or filters" 
                  : "No assessments have been created yet"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
