import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CheckCircle, Circle, BookOpen, GraduationCap, School as SchoolIcon } from "lucide-react";
import { moduleCompletionService, type MentorModuleProgress, type MarkCompletionData, type School } from "@/api/moduleCompletionService";
import { toast } from "sonner";

export default function ModuleProgressPage() {
  const [loading, setLoading] = useState(true);
  const [progressData, setProgressData] = useState<MentorModuleProgress | null>(null);
  const [availableSchools, setAvailableSchools] = useState<School[]>([]);
  const [selectedSchoolId, setSelectedSchoolId] = useState<string>("");
  const [updating, setUpdating] = useState<string | null>(null);
  const [notes, setNotes] = useState<{ [key: string]: string }>({});
  const [completionPercentage, setCompletionPercentage] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    loadAvailableSchools();
  }, []);

  useEffect(() => {
    if (selectedSchoolId) {
      loadModuleProgress(selectedSchoolId);
    }
  }, [selectedSchoolId]);

  const loadAvailableSchools = async () => {
    try {
      const schools = await moduleCompletionService.getAvailableSchools();
      setAvailableSchools(schools);
      if (schools.length > 0) {
        setSelectedSchoolId(schools[0]._id);
      }
    } catch (error) {
      console.error("Error loading schools:", error);
      toast.error("Failed to load schools");
    }
  };

  const loadModuleProgress = async (schoolId: string) => {
    try {
      setLoading(true);
      const data = await moduleCompletionService.getMentorModuleProgress(schoolId);
      setProgressData(data);
      
      // Initialize notes and completion percentage from existing data
      const initialNotes: { [key: string]: string } = {};
      const initialPercentage: { [key: string]: number } = {};
      
      data.moduleProgress.forEach((module) => {
        module.moduleItems.forEach((item) => {
          const key = `${module.moduleId}-${item.moduleItemId}`;
          initialNotes[key] = item.notes;
          initialPercentage[key] = item.completionPercentage;
        });
      });
      
      setNotes(initialNotes);
      setCompletionPercentage(initialPercentage);
    } catch (error) {
      console.error("Error loading module progress:", error);
      toast.error("Failed to load module progress");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkCompleted = async (
    moduleId: string,
    moduleItemId: string,
    isCompleted: boolean,
    notes: string = "",
    completionPercentage: number = 0
  ) => {
    if (!progressData) return;

    const key = `${moduleId}-${moduleItemId}`;
    setUpdating(key);

    try {
      const data: MarkCompletionData = {
        moduleId,
        moduleItemId,
        schoolId: progressData.school._id,
        isCompleted,
        notes,
        completionPercentage,
      };

      await moduleCompletionService.markModuleItemCompleted(data);
      
      // Update local state
      setProgressData((prev) => {
        if (!prev) return prev;
        
        return {
          ...prev,
          moduleProgress: prev.moduleProgress.map((module) => {
            if (module.moduleId === moduleId) {
              return {
                ...module,
                moduleItems: module.moduleItems.map((item) => {
                  if (item.moduleItemId === moduleItemId) {
                    return {
                      ...item,
                      isCompleted,
                      completedAt: isCompleted ? new Date().toISOString() : null,
                      notes,
                      completionPercentage,
                    };
                  }
                  return item;
                }),
                completedItems: module.moduleItems.reduce((count, item) => {
                  if (item.moduleItemId === moduleItemId) {
                    return count + (isCompleted ? 1 : 0);
                  }
                  return count + (item.isCompleted ? 1 : 0);
                }, 0),
                overallProgress: Math.round(
                  (module.moduleItems.reduce((count, item) => {
                    if (item.moduleItemId === moduleItemId) {
                      return count + (isCompleted ? 1 : 0);
                    }
                    return count + (item.isCompleted ? 1 : 0);
                  }, 0) / module.moduleItems.length) * 100
                ),
              };
            }
            return module;
          }),
        };
      });

      toast.success(isCompleted ? "Module item marked as completed" : "Module item marked as incomplete");
    } catch (error) {
      console.error("Error updating completion status:", error);
      toast.error("Failed to update completion status");
    } finally {
      setUpdating(null);
    }
  };

  const handleNotesChange = (key: string, value: string) => {
    setNotes((prev) => ({ ...prev, [key]: value }));
  };

  const handlePercentageChange = (key: string, value: number) => {
    setCompletionPercentage((prev) => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!progressData) {
    return (
      <Alert>
        <AlertDescription>
          No module progress data available. Please select a school to view progress.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Module Progress</h1>
          <p className="text-gray-600">
            Track and manage module completion progress for your assigned schools
          </p>
        </div>
      </div>

      {/* School Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SchoolIcon className="h-5 w-5" />
            School Selection
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Label htmlFor="school-select">Select School:</Label>
            <Select value={selectedSchoolId} onValueChange={setSelectedSchoolId}>
              <SelectTrigger className="w-80">
                <SelectValue placeholder="Select a school" />
              </SelectTrigger>
              <SelectContent>
                {availableSchools.map((school) => (
                  <SelectItem key={school._id} value={school._id}>
                    {school.name} - {school.city}, {school.state}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* School Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            {progressData.school.name}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600">Location</p>
              <p className="font-medium">{progressData.school.city}, {progressData.school.state}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Mentor</p>
              <p className="font-medium">{progressData.mentor.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Modules</p>
              <p className="font-medium">{progressData.moduleProgress.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Module Progress */}
      <div className="space-y-4">
        {progressData.moduleProgress.map((module) => (
          <Card key={module.moduleId}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Grade {module.grade} - {module.subject.name}
                  </CardTitle>
                  <p className="text-sm text-gray-600">
                    {module.completedItems} of {module.totalItems} items completed
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-600">
                    {module.overallProgress}%
                  </div>
                  <Progress value={module.overallProgress} className="w-32 mt-2" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {module.moduleItems.map((item) => {
                  const key = `${module.moduleId}-${item.moduleItemId}`;
                  const isUpdating = updating === key;
                  
                  return (
                    <div
                      key={item.moduleItemId}
                      className="flex items-start gap-4 p-4 border rounded-lg"
                    >
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id={item.moduleItemId}
                          checked={item.isCompleted}
                          disabled={isUpdating}
                          onCheckedChange={(checked) => {
                            const isCompleted = checked as boolean;
                            const currentNotes = notes[key] || item.notes;
                            const currentPercentage = completionPercentage[key] || item.completionPercentage;
                            handleMarkCompleted(
                              module.moduleId,
                              item.moduleItemId,
                              isCompleted,
                              currentNotes,
                              currentPercentage
                            );
                          }}
                        />
                        {item.isCompleted ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <Circle className="h-5 w-5 text-gray-400" />
                        )}
                      </div>
                      
                      <div className="flex-1 space-y-3">
                        <div>
                          <Label htmlFor={item.moduleItemId} className="text-base font-medium">
                            {item.moduleItemName}
                          </Label>
                          {item.moduleItemDescription && (
                            <p className="text-sm text-gray-600 mt-1">
                              {item.moduleItemDescription}
                            </p>
                          )}
                        </div>
                        
                        {item.isCompleted && (
                          <div className="space-y-2">
                            <div>
                              <Label htmlFor={`notes-${item.moduleItemId}`} className="text-sm">
                                Notes
                              </Label>
                              <Textarea
                                id={`notes-${item.moduleItemId}`}
                                placeholder="Add notes about completion..."
                                value={notes[key] || item.notes}
                                onChange={(e) => handleNotesChange(key, e.target.value)}
                                className="mt-1"
                                rows={2}
                              />
                            </div>
                            
                            <div>
                              <Label htmlFor={`percentage-${item.moduleItemId}`} className="text-sm">
                                Completion Percentage
                              </Label>
                              <div className="flex items-center gap-2 mt-1">
                                <input
                                  type="range"
                                  min="0"
                                  max="100"
                                  value={completionPercentage[key] || item.completionPercentage}
                                  onChange={(e) => handlePercentageChange(key, parseInt(e.target.value))}
                                  className="flex-1"
                                />
                                <span className="text-sm font-medium w-12">
                                  {completionPercentage[key] || item.completionPercentage}%
                                </span>
                              </div>
                            </div>
                            
                            {item.completedAt && (
                              <p className="text-xs text-gray-500">
                                Completed on: {new Date(item.completedAt).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                      
                      {isUpdating && (
                        <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
