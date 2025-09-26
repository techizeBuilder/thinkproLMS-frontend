import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Loader2, 
  CheckCircle, 
  Circle, 
  BookOpen, 
  GraduationCap, 
  School as SchoolIcon, 
  Users, 
  TrendingUp,
  FileText
} from "lucide-react";
import { 
  moduleCompletionService, 
  type ModuleCompletionReport, 
  type School 
} from "@/api/moduleCompletionService";
import { toast } from "sonner";

export default function ModuleCompletionReportsPage() {
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState<ModuleCompletionReport[]>([]);
  const [availableSchools, setAvailableSchools] = useState<School[]>([]);
  const [selectedSchoolId, setSelectedSchoolId] = useState<string>("all");
  const [selectedMentorId, setSelectedMentorId] = useState<string>("all");
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    loadAvailableSchools();
  }, []);

  useEffect(() => {
    loadReports();
  }, [selectedSchoolId, selectedMentorId]);

  const loadAvailableSchools = async () => {
    try {
      const schools = await moduleCompletionService.getAvailableSchools();
      setAvailableSchools(schools);
    } catch (error) {
      console.error("Error loading schools:", error);
      toast.error("Failed to load schools");
    }
  };

  const loadReports = async () => {
    try {
      setLoading(true);
      const schoolId = selectedSchoolId === "all" ? undefined : selectedSchoolId;
      const mentorId = selectedMentorId === "all" ? undefined : selectedMentorId;
      
      const data = await moduleCompletionService.getModuleCompletionReports(schoolId, mentorId);
      setReports(data);
    } catch (error) {
      console.error("Error loading reports:", error);
      toast.error("Failed to load completion reports");
    } finally {
      setLoading(false);
    }
  };

  const getOverallStats = () => {
    if (reports.length === 0) return { totalMentors: 0, totalSchools: 0, averageProgress: 0 };
    
    const totalMentors = new Set(reports.map(r => r.mentor._id)).size;
    const totalSchools = new Set(reports.map(r => r.school._id)).size;
    const averageProgress = reports.reduce((sum, report) => sum + report.overallProgress, 0) / reports.length;
    
    return { totalMentors, totalSchools, averageProgress: Math.round(averageProgress) };
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return "text-green-600";
    if (progress >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getProgressBadgeVariant = (progress: number) => {
    if (progress >= 80) return "default";
    if (progress >= 60) return "secondary";
    return "destructive";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const stats = getOverallStats();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Module Completion Reports</h1>
          <p className="text-gray-600">
            Monitor module completion progress across all mentors and schools
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="school-filter">Filter by School</Label>
              <Select value={selectedSchoolId} onValueChange={setSelectedSchoolId}>
                <SelectTrigger>
                  <SelectValue placeholder="All Schools" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Schools</SelectItem>
                  {availableSchools.map((school) => (
                    <SelectItem key={school._id} value={school._id}>
                      {school.name} - {school.city}, {school.state}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="mentor-filter">Filter by Mentor</Label>
              <Select value={selectedMentorId} onValueChange={setSelectedMentorId}>
                <SelectTrigger>
                  <SelectValue placeholder="All Mentors" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Mentors</SelectItem>
                  {Array.from(new Set(reports.map(r => r.mentor._id))).map((mentorId) => {
                    const mentor = reports.find(r => r.mentor._id === mentorId)?.mentor;
                    return (
                      <SelectItem key={mentorId} value={mentorId}>
                        {mentor?.name} ({mentor?.email})
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Mentors</p>
                <p className="text-2xl font-bold">{stats.totalMentors}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-full">
                <SchoolIcon className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Schools</p>
                <p className="text-2xl font-bold">{stats.totalSchools}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-full">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Average Progress</p>
                <p className="text-2xl font-bold">{stats.averageProgress}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reports */}
      {reports.length === 0 ? (
        <Alert>
          <AlertDescription>
            No completion reports found for the selected filters.
          </AlertDescription>
        </Alert>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => (
            <Card key={`${report.mentor._id}-${report.school._id}`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <GraduationCap className="h-5 w-5" />
                      {report.mentor.name}
                    </CardTitle>
                    <p className="text-sm text-gray-600">
                      {report.school.name} - {report.school.city}, {report.school.state}
                    </p>
                    <p className="text-sm text-gray-500">
                      {report.completedItems} of {report.totalItems} items completed
                    </p>
                  </div>
                  <div className="text-right">
                    <div className={`text-2xl font-bold ${getProgressColor(report.overallProgress)}`}>
                      {report.overallProgress}%
                    </div>
                    <Badge variant={getProgressBadgeVariant(report.overallProgress)}>
                      {report.overallProgress >= 80 ? "Excellent" : 
                       report.overallProgress >= 60 ? "Good" : "Needs Attention"}
                    </Badge>
                    <Progress value={report.overallProgress} className="w-32 mt-2" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="modules">Module Details</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="overview" className="mt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium mb-2">Mentor Information</h4>
                        <div className="space-y-1 text-sm">
                          <p><strong>Name:</strong> {report.mentor.name}</p>
                          <p><strong>Email:</strong> {report.mentor.email}</p>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">School Information</h4>
                        <div className="space-y-1 text-sm">
                          <p><strong>School:</strong> {report.school.name}</p>
                          <p><strong>Location:</strong> {report.school.city}, {report.school.state}</p>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="modules" className="mt-4">
                    <div className="space-y-4">
                      {report.modules.map((module) => (
                        <div key={module.moduleId} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <h4 className="font-medium flex items-center gap-2">
                                <BookOpen className="h-4 w-4" />
                                Grade {module.grade} - {module.subject.name}
                              </h4>
                              <p className="text-sm text-gray-600">
                                {module.completedItems} of {module.totalItems} items completed
                              </p>
                            </div>
                            <div className="text-right">
                              <div className={`text-lg font-bold ${getProgressColor(module.progress)}`}>
                                {module.progress}%
                              </div>
                              <Progress value={module.progress} className="w-24 mt-1" />
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            {module.items.map((item, index) => (
                              <div
                                key={index}
                                className="flex items-center gap-3 p-2 bg-gray-50 rounded"
                              >
                                {item.isCompleted ? (
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                ) : (
                                  <Circle className="h-4 w-4 text-gray-400" />
                                )}
                                <div className="flex-1">
                                  <p className="text-sm font-medium">Module Item {index + 1}</p>
                                  {item.notes && (
                                    <p className="text-xs text-gray-600 mt-1">
                                      Notes: {item.notes}
                                    </p>
                                  )}
                                  {item.completedAt && (
                                    <p className="text-xs text-gray-500 mt-1">
                                      Completed: {new Date(item.completedAt).toLocaleDateString()}
                                    </p>
                                  )}
                                </div>
                                {item.completionPercentage > 0 && (
                                  <Badge variant="outline">
                                    {item.completionPercentage}%
                                  </Badge>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
