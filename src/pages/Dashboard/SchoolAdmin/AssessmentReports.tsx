import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3, MapPin, Users, BookOpen, TrendingUp, Award } from "lucide-react";
import { schoolAdminService, type AssessmentReportData } from "@/api/schoolAdminService";
import { toast } from "sonner";

export default function SchoolAdminAssessmentReportsPage() {
  const [loading, setLoading] = useState(true);
  const [assessmentReports, setAssessmentReports] = useState<AssessmentReportData[]>([]);
  const [, setSchoolAdmin] = useState<any>(null);

  useEffect(() => {
    loadAssessmentReports();
  }, []);

  const loadAssessmentReports = async () => {
    try {
      setLoading(true);
      const response = await schoolAdminService.getAssessmentReports();
      
      if (response.success) {
        setAssessmentReports(response.data.assessmentReports);
        setSchoolAdmin(response.data.schoolAdmin);
      } else {
        toast.error("Failed to load assessment reports");
      }
    } catch (error) {
      console.error("Error loading assessment reports:", error);
      toast.error("Failed to load assessment reports");
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
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Assessment Reports</h1>
          <p className="text-muted-foreground">
            View student performance and assessment analytics
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          <span className="text-sm text-muted-foreground">
            {assessmentReports.length} School(s)
          </span>
        </div>
      </div>

      {/* Assessment Reports */}
      <div className="space-y-6">
        {assessmentReports.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center">
                <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Assessment Data</h3>
                <p className="text-muted-foreground">
                  No assessment reports available for your assigned schools.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          assessmentReports.map((report) => (
            <Card key={report.school._id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <MapPin className="h-5 w-5 text-primary" />
                    <div>
                      <CardTitle className="text-lg">{report.school.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {report.school.city}, {report.school.state}
                      </p>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Statistics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <Users className="h-6 w-6 text-primary mx-auto mb-2" />
                    <div className="text-2xl font-bold">{report.statistics.totalStudents}</div>
                    <div className="text-xs text-muted-foreground">Students</div>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <BookOpen className="h-6 w-6 text-primary mx-auto mb-2" />
                    <div className="text-2xl font-bold">{report.statistics.totalAssessments}</div>
                    <div className="text-xs text-muted-foreground">Assessments</div>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-primary mx-auto mb-2" />
                    <div className="text-2xl font-bold">{report.statistics.completedResponses}</div>
                    <div className="text-xs text-muted-foreground">Completed</div>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <Award className="h-6 w-6 text-primary mx-auto mb-2" />
                    <div className="text-2xl font-bold">{report.statistics.averageScore}%</div>
                    <div className="text-xs text-muted-foreground">Avg Score</div>
                  </div>
                </div>

                {/* Student Performance */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-lg">Student Performance</h4>
                  <div className="max-h-96 overflow-y-auto space-y-2">
                    {report.studentReports.map((student) => (
                      <Card key={student.student._id} className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <div className="font-medium">{student.student.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {student.student.grade} - {student.student.section} | ID: {student.student.studentId}
                            </div>
                          </div>
                          <div className="text-right space-y-1">
                            <div className="flex items-center space-x-2">
                              <span className="font-medium text-lg">{student.averageScore}%</span>
                              <Badge 
                                variant={student.averageScore >= 80 ? "default" : student.averageScore >= 60 ? "secondary" : "destructive"}
                              >
                                {student.averageScore >= 80 ? "Excellent" : student.averageScore >= 60 ? "Good" : "Needs Improvement"}
                              </Badge>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {student.completedAttempts}/{student.totalAttempts} assessments
                            </div>
                          </div>
                        </div>
                        
                        {student.responses.length > 0 && (
                          <div className="mt-3 pt-3 border-t">
                            <div className="text-sm font-medium mb-2">Recent Assessments:</div>
                            <div className="space-y-1">
                              {student.responses.slice(0, 3).map((response, index) => (
                                <div key={index} className="flex items-center justify-between text-xs">
                                  <span className="truncate">{response.assessmentTitle}</span>
                                  <div className="flex items-center space-x-2">
                                    <span>{response.percentage}%</span>
                                    <Badge variant={response.status === 'completed' ? 'default' : 'secondary'} className="text-xs">
                                      {response.status}
                                    </Badge>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </Card>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
