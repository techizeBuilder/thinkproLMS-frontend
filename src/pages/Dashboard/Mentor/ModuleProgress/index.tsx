import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, BookOpen, GraduationCap, School as SchoolIcon, Check } from "lucide-react";
import { moduleCompletionService, type MentorModuleProgress, type MarkCompletionData, type MarkSubtopicCompletionData, type MarkAllSubtopicCompletionData, type School } from "@/api/moduleCompletionService";
import { toast } from "sonner";

export default function ModuleProgressPage() {
  const [loading, setLoading] = useState(true);
  const [progressData, setProgressData] = useState<MentorModuleProgress | null>(null);
  const [availableSchools, setAvailableSchools] = useState<School[]>([]);
  const [selectedSchoolId, setSelectedSchoolId] = useState<string>("");
  const [updating, setUpdating] = useState<string | null>(null);
  const [notes, setNotes] = useState<{ [key: string]: string }>({});
  const [subtopicCompletions, setSubtopicCompletions] = useState<{ [key: string]: boolean }>({});

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
      
      // Initialize notes and subtopic completions from existing data
      const initialNotes: { [key: string]: string } = {};
      const initialSubtopicCompletions: { [key: string]: boolean } = {};
      
      data.moduleProgress.forEach((module) => {
        module.moduleItems.forEach((item) => {
          const key = `${module.moduleId}-${item.moduleItemId}`;
          initialNotes[key] = item.notes;
          
          // Initialize subtopic completions
          if (item.topics) {
            item.topics.forEach((topic) => {
              topic.subtopics.forEach((subtopic) => {
                const subtopicKey = `${module.moduleId}-${item.moduleItemId}-${topic.topicId}-${subtopic.subtopicId}`;
                initialSubtopicCompletions[subtopicKey] = subtopic.isCompleted;
              });
            });
          }
        });
      });
      
      setNotes(initialNotes);
      setSubtopicCompletions(initialSubtopicCompletions);
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
    notes: string = ""
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
      };

      await moduleCompletionService.markModuleItemCompleted(data);
      
      // If marking as completed, also mark all subtopics as completed
      if (isCompleted) {
        try {
          const allSubtopicData: MarkAllSubtopicCompletionData = {
            moduleId,
            moduleItemId,
            schoolId: progressData.school._id,
          };
          await moduleCompletionService.markAllSubtopicCompleted(allSubtopicData);
          
          // Update local subtopic completion state
          const module = progressData.moduleProgress.find(m => m.moduleId === moduleId);
          if (module) {
            const moduleItem = module.moduleItems.find(item => item.moduleItemId === moduleItemId);
            if (moduleItem && moduleItem.topics) {
              moduleItem.topics.forEach(topic => {
                topic.subtopics.forEach(subtopic => {
                  const subtopicKey = `${moduleId}-${moduleItemId}-${topic.topicId}-${subtopic.subtopicId}`;
                  setSubtopicCompletions(prev => ({ ...prev, [subtopicKey]: true }));
                });
              });
            }
          }
        } catch (error) {
          console.error("Error marking all subtopics completed:", error);
          // Don't show error to user as the main completion was successful
        }
      }
      
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

  const handleSubtopicCompletion = async (
    moduleId: string,
    moduleItemId: string,
    topicId: string,
    subtopicId: string,
    isCompleted: boolean
  ) => {
    if (!progressData) return;

    const subtopicKey = `${moduleId}-${moduleItemId}-${topicId}-${subtopicId}`;
    setUpdating(subtopicKey);

    try {
      const data: MarkSubtopicCompletionData = {
        moduleId,
        moduleItemId,
        topicId,
        subtopicId,
        schoolId: progressData.school._id,
        isCompleted,
      };

      const response = await moduleCompletionService.markSubtopicCompleted(data);
      
      // Update local state
      setSubtopicCompletions((prev) => ({ ...prev, [subtopicKey]: isCompleted }));
      
      // If all subtopics are completed, update the module item completion
      if (response.data.moduleItemAutoCompleted) {
        // Reload the module progress to reflect the auto-completion
        await loadModuleProgress(progressData.school._id);
        toast.success("All subtopics completed! Module item marked as completed.");
      } else {
        toast.success(isCompleted ? "Subtopic marked as completed" : "Subtopic marked as incomplete");
      }
    } catch (error: any) {
      console.error("Error updating subtopic completion:", error);
      console.error("Error details:", error.response?.data || error.message);
      toast.error(`Failed to update subtopic completion: ${error.response?.data?.message || error.message}`);
    } finally {
      setUpdating(null);
    }
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
    <div className="p-6 space-y-6">
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
              <p className="font-medium">{progressData.mentor?.name || 'Not assigned'}</p>
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
                        <button
                          onClick={() => {
                            if (isUpdating) return;
                            const isCompleted = !item.isCompleted;
                            const currentNotes = notes[key] || item.notes;
                            handleMarkCompleted(
                              module.moduleId,
                              item.moduleItemId,
                              isCompleted,
                              currentNotes
                            );
                          }}
                          disabled={isUpdating}
                          className={`
                            w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200
                            ${item.isCompleted 
                              ? 'bg-green-500 border-green-500 text-white hover:bg-green-600' 
                              : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                            }
                            ${isUpdating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                          `}
                        >
                          {item.isCompleted && <Check className="h-4 w-4" />}
                        </button>
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
                        
                        {/* Topics and Subtopics */}
                        {item.topics && item.topics.length > 0 && (
                          <div className="space-y-3">
                            {item.topics.map((topic) => (
                              <div key={topic.topicId} className="ml-4 space-y-2">
                                <div className="flex items-center gap-2">
                                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                  <span className="font-medium text-sm text-gray-700">
                                    {topic.topicName}
                                  </span>
                                </div>
                                
                                {topic.subtopics && topic.subtopics.length > 0 && (
                                  <div className="ml-6 space-y-2">
                                    {topic.subtopics.map((subtopic) => {
                                      const subtopicKey = `${module.moduleId}-${item.moduleItemId}-${topic.topicId}-${subtopic.subtopicId}`;
                                      const isSubtopicCompleted = subtopic.isCompleted || subtopicCompletions[subtopicKey] || false;
                                      const isSubtopicUpdating = updating === subtopicKey;
                                      
                                      return (
                                        <div key={subtopic.subtopicId} className="flex items-start gap-3">
                                          <button
                                            onClick={() => {
                                              handleSubtopicCompletion(
                                                module.moduleId,
                                                item.moduleItemId,
                                                topic.topicId,
                                                subtopic.subtopicId,
                                                !isSubtopicCompleted
                                              );
                                            }}
                                            disabled={isSubtopicUpdating}
                                            className={`
                                              w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200
                                              ${isSubtopicCompleted 
                                                ? 'bg-green-500 border-green-500 text-white hover:bg-green-600' 
                                                : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                                              }
                                              ${isSubtopicUpdating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                                            `}
                                          >
                                            {isSubtopicUpdating ? (
                                              <Loader2 className="h-3 w-3 animate-spin" />
                                            ) : isSubtopicCompleted ? (
                                              <Check className="h-3 w-3" />
                                            ) : null}
                                          </button>
                                        <div className="flex-1">
                                          <span className="text-sm text-gray-600">
                                            {subtopic.subtopicName}
                                          </span>
                                          {subtopic.subtopicDescription && (
                                            <p className="text-xs text-gray-500 mt-1">
                                              {subtopic.subtopicDescription}
                                            </p>
                                          )}
                                        </div>
                                      </div>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                        
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
