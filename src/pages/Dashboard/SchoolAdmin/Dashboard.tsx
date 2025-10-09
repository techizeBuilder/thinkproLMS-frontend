import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Users, 
  GraduationCap, 
  BookOpen, 
  BarChart3,
  School as SchoolIcon,
  UserCheck,
  TrendingUp
} from "lucide-react";
import { schoolAdminService, type Mentor, type Student, type ModuleProgressData, type AssessmentReportData } from "@/api/schoolAdminService";
import { toast } from "sonner";

interface DashboardStats {
  totalMentors: number;
  totalStudents: number;
  totalSchools: number;
  averageProgress: number;
}

export default function SchoolAdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalMentors: 0,
    totalStudents: 0,
    totalSchools: 0,
    averageProgress: 0
  });
  const [schoolAdmin, setSchoolAdmin] = useState<any>(null);
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [moduleProgress, setModuleProgress] = useState<ModuleProgressData[]>([]);
  const [assessmentReports, setAssessmentReports] = useState<AssessmentReportData[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load all data in parallel
      const [mentorsRes, studentsRes, progressRes, reportsRes] = await Promise.all([
        schoolAdminService.getMentors(),
        schoolAdminService.getStudents(),
        schoolAdminService.getModuleProgress(),
        schoolAdminService.getAssessmentReports()
      ]);

      if (mentorsRes.success) {
        setMentors(mentorsRes.data.mentors);
        setSchoolAdmin(mentorsRes.data.schoolAdmin);
      }

      if (studentsRes.success) {
        setStudents(studentsRes.data.students);
      }

      if (progressRes.success) {
        setModuleProgress(progressRes.data.moduleProgress);
      }

      if (reportsRes.success) {
        setAssessmentReports(reportsRes.data.assessmentReports);
      }

      // Calculate stats
      const totalMentors = mentorsRes.success ? mentorsRes.data.mentors.length : 0;
      const totalStudents = studentsRes.success ? studentsRes.data.students.length : 0;
      const totalSchools = schoolAdmin?.assignedSchool ? 1 : 0;
      
      // Calculate average progress
      let totalProgress = 0;
      let progressCount = 0;
      if (progressRes.success) {
        progressRes.data.moduleProgress.forEach(mentor => {
          mentor.schoolProgress.forEach(school => {
            totalProgress += school.progressPercentage;
            progressCount++;
          });
        });
      }
      const averageProgress = progressCount > 0 ? totalProgress / progressCount : 0;

      setStats({
        totalMentors,
        totalStudents,
        totalSchools,
        averageProgress: Math.round(averageProgress)
      });

    } catch (error) {
      console.error("Error loading dashboard data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">School Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {schoolAdmin?.name || "School Admin"}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <SchoolIcon className="h-5 w-5 text-primary" />
          <span className="text-sm text-muted-foreground">
            {schoolAdmin?.assignedSchool ? schoolAdmin.assignedSchool.name : "No School Assigned"}
          </span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Mentors</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalMentors}</div>
            <p className="text-xs text-muted-foreground">
              Across all assigned schools
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStudents}</div>
            <p className="text-xs text-muted-foreground">
              Enrolled in assigned schools
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assigned School</CardTitle>
            <SchoolIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSchools}</div>
            <p className="text-xs text-muted-foreground">
              Under your management
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Progress</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageProgress}%</div>
            <p className="text-xs text-muted-foreground">
              Module completion rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="mentors" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="mentors">School Mentors</TabsTrigger>
          <TabsTrigger value="students">Students</TabsTrigger>
          <TabsTrigger value="progress">Module Progress</TabsTrigger>
          <TabsTrigger value="reports">Assessment Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="mentors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <UserCheck className="h-5 w-5" />
                <span>School Mentors</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mentors.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No mentors found in your assigned schools.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {mentors.map((mentor) => (
                      <Card key={mentor._id} className="p-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold">{mentor.user.name}</h3>
                            <Badge variant={mentor.isActive ? "default" : "secondary"}>
                              {mentor.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{mentor.user.email}</p>
                          <div className="text-sm">
                            <span className="font-medium">Assigned School:</span>
                            <div className="mt-1">
                              <div className="text-xs bg-muted px-2 py-1 rounded">
                                {mentor.assignedSchool.name} - {mentor.assignedSchool.city}
                              </div>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="students" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <GraduationCap className="h-5 w-5" />
                <span>Students</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {students.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No students found in your assigned schools.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {students.map((student) => (
                      <Card key={student._id} className="p-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold">{student.user.name}</h3>
                            <Badge variant={student.isActive ? "default" : "secondary"}>
                              {student.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{student.user.email}</p>
                          <div className="text-sm space-y-1">
                            <div><span className="font-medium">Student ID:</span> {student.studentId}</div>
                            <div><span className="font-medium">Grade:</span> {student.grade}</div>
                            <div><span className="font-medium">Section:</span> {student.section}</div>
                            <div><span className="font-medium">School:</span> {student.school.name}</div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="progress" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BookOpen className="h-5 w-5" />
                <span>Module Progress</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {moduleProgress.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No module progress data available.
                  </p>
                ) : (
                  moduleProgress.map((mentorProgress) => (
                    <Card key={mentorProgress.mentor._id} className="p-4">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold">{mentorProgress.mentor.name}</h3>
                          <span className="text-sm text-muted-foreground">{mentorProgress.mentor.email}</span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {mentorProgress.schoolProgress.map((school) => (
                            <Card key={school.school._id} className="p-3 bg-muted/50">
                              <div className="space-y-2">
                                <h4 className="font-medium">{school.school.name}</h4>
                                <div className="space-y-1">
                                  <div className="flex justify-between text-sm">
                                    <span>Progress</span>
                                    <span>{school.progressPercentage}%</span>
                                  </div>
                                  <Progress value={school.progressPercentage} className="h-2" />
                                  <div className="text-xs text-muted-foreground">
                                    {school.completedItems} of {school.totalItems} items completed
                                  </div>
                                </div>
                              </div>
                            </Card>
                          ))}
                        </div>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5" />
                <span>Assessment Reports</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {assessmentReports.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No assessment reports available.
                  </p>
                ) : (
                  assessmentReports.map((report) => (
                    <Card key={report.school._id} className="p-4">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold">{report.school.name}</h3>
                          <span className="text-sm text-muted-foreground">
                            {report.school.city}, {report.school.state}
                          </span>
                        </div>
                        
                        {/* Statistics */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold">{report.statistics.totalStudents}</div>
                            <div className="text-xs text-muted-foreground">Students</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold">{report.statistics.totalAssessments}</div>
                            <div className="text-xs text-muted-foreground">Assessments</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold">{report.statistics.completedResponses}</div>
                            <div className="text-xs text-muted-foreground">Completed</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold">{report.statistics.averageScore}%</div>
                            <div className="text-xs text-muted-foreground">Avg Score</div>
                          </div>
                        </div>

                        {/* Student Reports */}
                        <div className="space-y-2">
                          <h4 className="font-medium">Student Performance</h4>
                          <div className="max-h-60 overflow-y-auto">
                            {report.studentReports.map((student) => (
                              <div key={student.student._id} className="flex items-center justify-between p-2 border rounded">
                                <div>
                                  <div className="font-medium">{student.student.name}</div>
                                  <div className="text-sm text-muted-foreground">
                                    {student.student.grade} - {student.student.section}
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="font-medium">{student.averageScore}%</div>
                                  <div className="text-sm text-muted-foreground">
                                    {student.completedAttempts}/{student.totalAttempts} attempts
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
