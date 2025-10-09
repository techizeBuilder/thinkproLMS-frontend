import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { BookOpen, User, MapPin, TrendingUp } from "lucide-react";
import { schoolAdminService, type ModuleProgressData } from "@/api/schoolAdminService";
import { toast } from "sonner";

export default function SchoolAdminModuleProgressPage() {
  const [loading, setLoading] = useState(true);
  const [moduleProgress, setModuleProgress] = useState<ModuleProgressData[]>([]);
  const [, setSchoolAdmin] = useState<any>(null);

  useEffect(() => {
    loadModuleProgress();
  }, []);

  const loadModuleProgress = async () => {
    try {
      setLoading(true);
      const response = await schoolAdminService.getModuleProgress();
      
      if (response.success) {
        setModuleProgress(response.data.moduleProgress);
        setSchoolAdmin(response.data.schoolAdmin);
      } else {
        toast.error("Failed to load module progress");
      }
    } catch (error) {
      console.error("Error loading module progress:", error);
      toast.error("Failed to load module progress");
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
          <h1 className="text-2xl md:text-3xl font-bold">Module Progress</h1>
          <p className="text-muted-foreground">
            Track module completion progress for your school mentors
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <BookOpen className="h-5 w-5 text-primary" />
          <span className="text-sm text-muted-foreground">
            {moduleProgress.length} Mentor(s)
          </span>
        </div>
      </div>

      {/* Module Progress */}
      <div className="space-y-6">
        {moduleProgress.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center">
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Progress Data</h3>
                <p className="text-muted-foreground">
                  No module progress data available for your school mentors.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          moduleProgress.map((mentorProgress) => (
            <Card key={mentorProgress.mentor._id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <User className="h-5 w-5 text-primary" />
                    <div>
                      <CardTitle className="text-lg">{mentorProgress.mentor.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{mentorProgress.mentor.email}</p>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {mentorProgress.schoolProgress.map((school) => (
                    <Card key={school.school._id} className="p-4 bg-muted/50">
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <h4 className="font-medium">{school.school.name}</h4>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Progress</span>
                            <span className="font-medium">{school.progressPercentage}%</span>
                          </div>
                          <Progress value={school.progressPercentage} className="h-2" />
                          <div className="text-xs text-muted-foreground">
                            {school.completedItems} of {school.totalItems} items completed
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <Badge 
                            variant={school.progressPercentage >= 80 ? "default" : school.progressPercentage >= 50 ? "secondary" : "destructive"}
                          >
                            {school.progressPercentage >= 80 ? "Excellent" : school.progressPercentage >= 50 ? "Good" : "Needs Attention"}
                          </Badge>
                          <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                            <TrendingUp className="h-3 w-3" />
                            <span>{school.progressPercentage}%</span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
