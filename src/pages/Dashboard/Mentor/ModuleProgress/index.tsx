import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, BookOpen } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  moduleCompletionService,
  type School,
} from "@/api/moduleCompletionService";
import { moduleService, type ModuleItem, type Module } from "@/api/moduleService";
import { schoolService, type AvailableGrade } from "@/api/schoolService";
import { toast } from "sonner";

export default function ModuleProgressPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [modules, setModules] = useState<ModuleItem[]>([]);
  const [availableSchools, setAvailableSchools] = useState<School[]>([]);
  const [selectedSchoolId, setSelectedSchoolId] = useState<string>("");
  const [updating, setUpdating] = useState<string | null>(null);

  // New filter states
  const [selectedGrade, setSelectedGrade] = useState<string>("");
  const [selectedSection, setSelectedSection] = useState<string>("");
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("");
  const [availableSubjects, setAvailableSubjects] = useState<Module[]>([]);
  const [availableGrades, setAvailableGrades] = useState<AvailableGrade[]>([]);
  const [availableSections, setAvailableSections] = useState<string[]>([]);
  const [hasServiceDetails, setHasServiceDetails] = useState(false);

  // Module status states
  const [moduleStatuses, setModuleStatuses] = useState<{
    [key: string]: string;
  }>({});
  const [parentModuleId, setParentModuleId] = useState<string>("");

  // Function to update URL parameters
  const updateUrlParams = (params: {
    grade?: string;
    section?: string;
    subject?: string;
  }) => {
    const newSearchParams = new URLSearchParams(searchParams);

    if (params.grade !== undefined) {
      if (params.grade) {
        newSearchParams.set("grade", params.grade);
      } else {
        newSearchParams.delete("grade");
      }
    }

    if (params.section !== undefined) {
      if (params.section) {
        newSearchParams.set("section", params.section);
      } else {
        newSearchParams.delete("section");
      }
    }

    if (params.subject !== undefined) {
      if (params.subject) {
        newSearchParams.set("subject", params.subject);
      } else {
        newSearchParams.delete("subject");
      }
    }

    setSearchParams(newSearchParams, { replace: true });
  };

  // Initialize from URL parameters
  useEffect(() => {
    const gradeParam = searchParams.get("grade");
    const sectionParam = searchParams.get("section");
    const subjectParam = searchParams.get("subject");

    if (gradeParam) {
      setSelectedGrade(gradeParam);
    }
    if (sectionParam) {
      setSelectedSection(sectionParam);
    }
    if (subjectParam) {
      setSelectedSubjectId(subjectParam);
    }
  }, [searchParams]);

  useEffect(() => {
    loadAvailableSchools();
    loadAvailableSubjects();
  }, []);

  // Load school service details when school changes
  useEffect(() => {
    const fetchSchoolServiceDetails = async (schoolId: string) => {
      try {
        const response = await schoolService.getServiceDetails(schoolId);
        if (response.success) {
          setAvailableGrades(response.data.grades);
          setHasServiceDetails(response.data.hasServiceDetails);

          // Auto-select first grade if available and no grade in URL params
          if (response.data.grades && response.data.grades.length > 0) {
            const gradeParam = searchParams.get("grade");
            if (!gradeParam) {
              const firstGrade = response.data.grades[0].grade;
              setSelectedGrade(firstGrade.toString());
              updateUrlParams({ grade: firstGrade.toString() });
            }
          }
        }
      } catch (error) {
        console.error("Error fetching school service details:", error);
        setAvailableGrades([]);
        setHasServiceDetails(false);
      }
    };

    if (selectedSchoolId) {
      fetchSchoolServiceDetails(selectedSchoolId);
      // Reset other filters when school changes (but preserve URL params if they exist)
      const gradeParam = searchParams.get("grade");
      const sectionParam = searchParams.get("section");
      const subjectParam = searchParams.get("subject");

      if (!gradeParam) {
        setSelectedGrade("");
        updateUrlParams({ grade: "" });
      }
      if (!sectionParam) {
        setSelectedSection("");
        updateUrlParams({ section: "" });
      }
      if (!subjectParam) {
        setSelectedSubjectId("");
        updateUrlParams({ subject: "" });
      }
      setAvailableSections([]);
    } else {
      setAvailableGrades([]);
      setHasServiceDetails(false);
      setAvailableSections([]);
    }
  }, [selectedSchoolId, searchParams]);

  // Update available sections when grade changes
  useEffect(() => {
    if (selectedGrade && hasServiceDetails) {
      const selectedGradeData = availableGrades.find(
        (gradeData) => gradeData.grade.toString() === selectedGrade
      );
      const sections = selectedGradeData?.sections || [];
      setAvailableSections(sections);

      // Auto-select first section if available and no section in URL params
      if (sections.length > 0) {
        const sectionParam = searchParams.get("section");
        if (!sectionParam) {
          const firstSection = sections[0];
          setSelectedSection(firstSection);
          updateUrlParams({ section: firstSection });
        }
      } else {
        setSelectedSection("");
        updateUrlParams({ section: "" });
      }
    } else {
      setAvailableSections([]);
    }
  }, [selectedGrade, availableGrades, hasServiceDetails, searchParams]);

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

  const loadAvailableSubjects = async () => {
    try {
      const subjects = await moduleService.getAllModules();
      const activeSubjects = subjects.filter((s) => s.isActive);
      setAvailableSubjects(activeSubjects);

      // Auto-select first subject if available and no subject in URL params
      if (activeSubjects.length > 0) {
        const subjectParam = searchParams.get("subject");
        if (!subjectParam) {
          const firstSubject = activeSubjects[0]._id;
          if (firstSubject) {
            setSelectedSubjectId(firstSubject);
            updateUrlParams({ subject: firstSubject });
          }
        }
      }
    } catch (error) {
      console.error("Error loading subjects:", error);
      toast.error("Failed to load subjects");
    }
  };

  const loadModules = useCallback(
    async (
      schoolId: string,
      grade: string,
      _section: string,
      subjectId: string
    ) => {
      try {
        setLoading(true);
        console.log("Loading modules with filters:", {
          schoolId,
          grade,
          _section,
          subjectId,
        });

        // Convert grade string to number
        const gradeNumber = parseInt(grade.replace("Grade ", ""));

        // Get modules for the specific grade and subject
        const moduleData = await moduleService.getModulesByGradeAndSubject(
          gradeNumber,
          subjectId
        );
        console.log("Raw module data:", moduleData);

        // Set the module items from the API response
        const moduleItems = moduleData || [];
        setModules(moduleItems);
        console.log("Number of module items found:", moduleItems.length);

        // Store the parent module ID for status updates (use first module's ID or empty string)
        setParentModuleId(moduleItems.length > 0 ? moduleItems[0]._id : '');

        // Module statuses will be initialized by useEffect when modules are set

        // Load actual completion statuses from database
        try {
          const progressData =
            await moduleCompletionService.getMentorModuleProgress(
              schoolId,
              _section,
              grade
            );
          console.log("Progress data from database:", progressData);

          // Initialize module statuses with actual data from database
          const initialModuleStatuses: { [key: string]: string } = {};

          moduleItems.forEach((moduleItem: any) => {
            const moduleKey = moduleItem._id || moduleItem.name;

            // Find the corresponding module in progress data
            const moduleProgress = progressData.moduleProgress?.find(
              (m: any) => m.moduleId === parentModuleId
            );
            const moduleItemProgress = moduleProgress?.moduleItems?.find(
              (item: any) => item.moduleItemId === moduleItem._id
            );

            if (moduleItemProgress) {
              // Use actual status from database, with mapping for old values
              let status: string = moduleItemProgress.status || "Pending";

              // Map old status values to new ones
              if (status === "not_started") status = "Pending";
              if (status === "in_progress") status = "In Progress";
              if (status === "completed") status = "Completed";
              if (status === "on_hold") status = "Pending";

              initialModuleStatuses[moduleKey] = status;
            } else {
              // Default to Pending if no progress data found
              initialModuleStatuses[moduleKey] = "Pending";
            }
          });

          setModuleStatuses(initialModuleStatuses);
          console.log(
            "Module statuses loaded from database:",
            initialModuleStatuses
          );
        } catch (progressError) {
          console.error("Error loading progress data:", progressError);

          // Fallback to default statuses if progress data fails to load
          const initialModuleStatuses: { [key: string]: string } = {};
          moduleItems.forEach((moduleItem: any) => {
            const moduleKey = moduleItem._id || moduleItem.name;
            initialModuleStatuses[moduleKey] = "Pending";
          });
          setModuleStatuses(initialModuleStatuses);
        }

        // Show appropriate message based on results
        if (moduleItems.length === 0) {
          console.log("No module items found for the selected criteria");
          // Don't show error toast for empty results, let the UI handle it
        } else {
          console.log("Module items loaded successfully");
        }
      } catch (error) {
        console.error("Error loading modules:", error);

        // Reset modules and statuses on error
        setModules([]);
        setModuleStatuses({});

        // Show specific error message
        if (error instanceof Error) {
          toast.error(`Failed to load modules: ${error.message}`);
        } else {
          toast.error("Failed to load modules. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Load modules when all filters are selected
  useEffect(() => {
    if (
      selectedSchoolId &&
      selectedGrade &&
      selectedSection &&
      selectedSubjectId
    ) {
      console.log("Triggering loadModules with:", {
        selectedSchoolId,
        selectedGrade,
        selectedSection,
        selectedSubjectId,
      });
      loadModules(
        selectedSchoolId,
        selectedGrade,
        selectedSection,
        selectedSubjectId
      );
    }
  }, [
    selectedSchoolId,
    selectedGrade,
    selectedSection,
    selectedSubjectId,
    loadModules,
  ]);

  // Initialize module statuses when modules change
  useEffect(() => {
    if (modules && modules.length > 0) {
      console.log("Modules changed, initializing statuses...");
      console.log("Current moduleStatuses:", moduleStatuses);

      const initialStatuses: { [key: string]: string } = {};
      modules.forEach((module) => {
        const moduleKey = module._id || module.name;
        // Always set to Pending for now to ensure it's not blank
        initialStatuses[moduleKey] = "Pending";
      });

      console.log("Setting initial statuses:", initialStatuses);
      setModuleStatuses(initialStatuses);
    }
  }, [modules]);

  const handleModuleStatusChange = async (
    moduleId: string,
    newStatus: string
  ) => {
    if (!modules || modules.length === 0) return;

    setUpdating(moduleId);

    try {
      // Update local state immediately
      setModuleStatuses((prev) => ({ ...prev, [moduleId]: newStatus }));

      // Call API to update module item completion
      console.log("Updating module item completion with data:", {
        moduleId: parentModuleId,
        moduleItemId: moduleId,
        schoolId: selectedSchoolId,
        section: selectedSection,
        grade: selectedGrade,
        isCompleted: newStatus === "Completed",
        status: newStatus,
      });

      const response = await moduleCompletionService.markModuleItemCompleted({
        moduleId: parentModuleId,
        moduleItemId: moduleId,
        schoolId: selectedSchoolId,
        section: selectedSection,
        grade: selectedGrade,
        isCompleted: newStatus === "Completed",
        status: newStatus as "Pending" | "In Progress" | "Completed",
      });

      console.log("Module status update response:", response);
      toast.success(`Module status updated to ${newStatus.replace("_", " ")}`);

      // No need to reload modules since we already updated the local state
      // The API call ensures the backend is updated
    } catch (error: any) {
      console.error("Error updating module status:", error);

      // Show more specific error message
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to update module status";
      toast.error(errorMessage);

      // Revert the status change on error
      setModuleStatuses((prev) => ({ ...prev, [moduleId]: prev[moduleId] }));
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

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Module Progress</h1>
          <p className="text-gray-600 text-sm">
            Track and manage module completion progress
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* School Display */}
        <div>
          <Label className="text-sm font-medium">
            School
          </Label>
          <div className="w-full h-10 px-3 py-2 border rounded-md bg-muted/50 flex items-center text-sm">
            {availableSchools.length > 0 ? (
              <span>{availableSchools[0].name} - {availableSchools[0].city}, {availableSchools[0].state}</span>
            ) : (
              <span className="text-muted-foreground">No school assigned</span>
            )}
          </div>
        </div>

        {/* Grade Selection */}
        <div>
          <Label htmlFor="grade-select" className="text-sm font-medium">
            Grade
          </Label>
          <Select
            value={selectedGrade}
            onValueChange={(value) => {
              setSelectedGrade(value);
              updateUrlParams({ grade: value });
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select grade" />
            </SelectTrigger>
            <SelectContent>
              {hasServiceDetails
                ? availableGrades.map((gradeData) => (
                    <SelectItem key={gradeData.grade} value={gradeData.grade.toString()}>
                      {gradeData.grade}
                    </SelectItem>
                  ))
                : [
                    "Grade 1",
                    "Grade 2",
                    "Grade 3",
                    "Grade 4",
                    "Grade 5",
                    "Grade 6",
                    "Grade 7",
                    "Grade 8",
                    "Grade 9",
                    "Grade 10",
                  ].map((grade) => (
                    <SelectItem key={grade} value={grade}>
                      {grade}
                    </SelectItem>
                  ))}
            </SelectContent>
          </Select>
        </div>

        {/* Section Selection */}
        <div>
          <Label htmlFor="section-select" className="text-sm font-medium">
            Section
          </Label>
          <Select
            value={selectedSection}
            onValueChange={(value) => {
              setSelectedSection(value);
              updateUrlParams({ section: value });
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select section" />
            </SelectTrigger>
            <SelectContent>
              {availableSections.map((section) => (
                <SelectItem key={section} value={section}>
                  {section}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Subject Selection */}
        <div>
          <Label htmlFor="subject-select" className="text-sm font-medium">
            Subject
          </Label>
          <Select
            value={selectedSubjectId}
            onValueChange={(value) => {
              setSelectedSubjectId(value);
              updateUrlParams({ subject: value });
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select subject" />
            </SelectTrigger>
            <SelectContent>
              {availableSubjects.map((subject) => (
                <SelectItem key={subject._id} value={subject._id || ''}>
                  {subject.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Show message when filters are not complete */}
      {(!selectedSchoolId ||
        !selectedGrade ||
        !selectedSection ||
        !selectedSubjectId) && (
        <Alert>
          <AlertDescription>
            Please select Grade, Section, and Subject to view module progress.
          </AlertDescription>
        </Alert>
      )}

      {/* Show loading state when modules are being loaded */}
      {selectedSchoolId &&
        selectedGrade &&
        selectedSection &&
        selectedSubjectId &&
        loading && (
          <Alert>
            <AlertDescription className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading modules for the selected criteria...
            </AlertDescription>
          </Alert>
        )}

      {/* Show message when no data is available */}
      {selectedSchoolId &&
        selectedGrade &&
        selectedSection &&
        selectedSubjectId &&
        modules.length === 0 &&
        !loading && (
          <Alert>
            <AlertDescription>
              No modules found for the selected Grade ({selectedGrade}), Section
              ({selectedSection}), and Subject combination. Please try selecting
              different criteria or contact your administrator if modules should
              be available.
            </AlertDescription>
          </Alert>
        )}

      {/* Modules Table */}
      {modules && modules.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Modules ({modules.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">#</TableHead>
                  <TableHead>Module Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="w-[200px]">Status</TableHead>
                  {/* <TableHead className="w-[50px]">Actions</TableHead> */}
                </TableRow>
              </TableHeader>
              <TableBody>
                {modules.map((module, index) => {
                  const moduleKey = module._id || module.name;
                  const isUpdating = updating === moduleKey;
                  const currentStatus = moduleStatuses[moduleKey] || "Pending";
                  console.log(
                    `Module ${moduleKey}: currentStatus = "${currentStatus}", moduleStatuses =`,
                    moduleStatuses
                  );

                  return (
                    <TableRow key={moduleKey}>
                      <TableCell className="font-medium">{index + 1}</TableCell>
                      <TableCell className="font-medium">
                        {module.name}
                      </TableCell>
                      <TableCell className="text-gray-600">
                        {module.description || "No description available"}
                      </TableCell>
                      <TableCell>
                        <Select
                          value={currentStatus || "Pending"}
                          onValueChange={(value) =>
                            handleModuleStatusChange(moduleKey, value)
                          }
                          disabled={isUpdating}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Pending" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Pending">Pending</SelectItem>
                            <SelectItem value="In Progress">
                              In Progress
                            </SelectItem>
                            <SelectItem value="Completed">Completed</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        {isUpdating && (
                          <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
