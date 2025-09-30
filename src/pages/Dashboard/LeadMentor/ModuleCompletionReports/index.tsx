import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, BookOpen } from "lucide-react";
import {
  moduleCompletionService,
  type School,
  type MentorModuleProgress,
} from "@/api/moduleCompletionService";
import { mentorService, type Mentor } from "@/api/mentorService";
import { schoolService, type AvailableGrade } from "@/api/schoolService";
import { toast } from "sonner";

export default function ModuleCompletionReportsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [availableSchools, setAvailableSchools] = useState<School[]>([]);
  const [availableMentors, setAvailableMentors] = useState<Mentor[]>([]);
  const [availableGrades, setAvailableGrades] = useState<AvailableGrade[]>([]);
  const [availableSections, setAvailableSections] = useState<string[]>([]);
  const [hasServiceDetails, setHasServiceDetails] = useState(false);

  // Filter states
  const [selectedSchoolId, setSelectedSchoolId] = useState<string>("");
  const [selectedMentorId, setSelectedMentorId] = useState<string>("");
  const [selectedGrade, setSelectedGrade] = useState<string>("");
  const [selectedSection, setSelectedSection] = useState<string>("");

  // Module progress data
  const [moduleProgress, setModuleProgress] =
    useState<MentorModuleProgress | null>(null);

  // Function to update URL parameters
  const updateUrlParams = (params: {
    school?: string;
    mentor?: string;
    grade?: string;
    section?: string;
  }) => {
    const newSearchParams = new URLSearchParams(searchParams);

    if (params.school !== undefined) {
      if (params.school) {
        newSearchParams.set("school", params.school);
      } else {
        newSearchParams.delete("school");
      }
    }

    if (params.mentor !== undefined) {
      if (params.mentor) {
        newSearchParams.set("mentor", params.mentor);
      } else {
        newSearchParams.delete("mentor");
      }
    }

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

    setSearchParams(newSearchParams, { replace: true });
  };

  // Initialize from URL parameters
  useEffect(() => {
    const schoolParam = searchParams.get("school");
    const mentorParam = searchParams.get("mentor");
    const gradeParam = searchParams.get("grade");
    const sectionParam = searchParams.get("section");

    if (schoolParam) {
      setSelectedSchoolId(schoolParam);
    }
    if (mentorParam) {
      setSelectedMentorId(mentorParam);
    }
    if (gradeParam) {
      setSelectedGrade(gradeParam);
    }
    if (sectionParam) {
      setSelectedSection(sectionParam);
    }
  }, [searchParams]);

  useEffect(() => {
    loadAvailableSchools();
    loadAvailableMentors();
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
              setSelectedGrade(firstGrade);
              updateUrlParams({ grade: firstGrade });
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

      if (!gradeParam) {
        setSelectedGrade("");
        updateUrlParams({ grade: "" });
      }
      if (!sectionParam) {
        setSelectedSection("");
        updateUrlParams({ section: "" });
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
        (gradeData) => gradeData.grade === selectedGrade
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

  const loadAvailableMentors = async () => {
    try {
      const response = await mentorService.getAll();
      if (response.success) {
        setAvailableMentors(response.data);
        if (response.data.length > 0) {
          setSelectedMentorId(response.data[0]._id);
        }
      }
    } catch (error) {
      console.error("Error loading mentors:", error);
      toast.error("Failed to load mentors");
    }
  };

  const loadModuleProgress = useCallback(
    async (
      schoolId: string,
      mentorId: string,
      grade: string,
      section: string
    ) => {
      try {
        setLoading(true);
        console.log("Loading module progress with filters:", {
          schoolId,
          mentorId,
          grade,
          section,
        });

        // Get module completion reports for the specific mentor and school
        const reportsData =
          await moduleCompletionService.getModuleCompletionReports(
            schoolId,
            mentorId,
            section,
            grade
          );
        console.log("Module completion reports data:", reportsData);

        // Find the report for the specific mentor and school
        const mentorReport = reportsData.find(
          (report) =>
            report.mentor._id === mentorId && report.school._id === schoolId
        );
        console.log({ mentorReport });

        if (mentorReport) {
          // Convert the report format to the expected MentorModuleProgress format
          const progressData = {
            school: mentorReport.school,
            mentor: mentorReport.mentor,
            moduleProgress: mentorReport.modules.map((module) => ({
              moduleId: module.moduleId,
              grade: module.grade,
              subject: module.subject,
              totalItems: module.totalItems,
              completedItems: module.completedItems,
              overallProgress: module.progress,
              moduleItems: module.items.map((item) => ({
                moduleItemId: item.moduleItemId,
                moduleItemName: item.moduleItemName,
                moduleItemDescription: item.moduleItemDescription,
                isCompleted: item.isCompleted,
                completedAt: item.completedAt,
                notes: item.notes || "",
                status: (() => {
                  return item.status;
                  // if (item.isCompleted) return "Completed";
                  // // For now, if not completed, show as Pending
                  // // TODO: Add logic to detect "In Progress" status based on completion percentage or other criteria
                  // return "Pending";
                })() as "Completed" | "Pending" | "In Progress",
                topics: (item.topics || []).map((topic) => ({
                  topicId: topic.topicId,
                  topicName: topic.topicName,
                  topicDescription: topic.topicDescription,
                  isCompleted: topic.isCompleted,
                  completedAt: topic.completedAt,
                  notes: topic.notes || "",
                  subtopics: (topic.subtopics || []).map((subtopic) => ({
                    subtopicId: subtopic.subtopicId,
                    subtopicName: subtopic.subtopicName,
                    subtopicDescription: subtopic.subtopicDescription,
                    isCompleted: subtopic.isCompleted,
                    completedAt: subtopic.completedAt,
                    notes: subtopic.notes || "",
                    isActive: true,
                  })),
                  isActive: true,
                })),
              })),
            })),
          };
          setModuleProgress(progressData as MentorModuleProgress);
        } else {
          setModuleProgress(null);
        }
      } catch (error) {
        console.error("Error loading module progress:", error);
        setModuleProgress(null);

        if (error instanceof Error) {
          toast.error(`Failed to load module progress: ${error.message}`);
        } else {
          toast.error("Failed to load module progress. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Load module progress when all filters are selected
  useEffect(() => {
    if (
      selectedSchoolId &&
      selectedMentorId &&
      selectedGrade &&
      selectedSection
    ) {
      console.log("Triggering loadModuleProgress with:", {
        selectedSchoolId,
        selectedMentorId,
        selectedGrade,
        selectedSection,
      });
      loadModuleProgress(
        selectedSchoolId,
        selectedMentorId,
        selectedGrade,
        selectedSection
      );
    }
  }, [
    selectedSchoolId,
    selectedMentorId,
    selectedGrade,
    selectedSection,
    loadModuleProgress,
  ]);

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return "text-green-600";
    if (progress >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  console.log({ moduleProgress });

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
          <h1 className="text-2xl font-bold">Module Completion Reports</h1>
          <p className="text-gray-600 text-sm">
            Monitor module completion progress for specific mentors and schools
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* School Selection */}
        <div>
          <Label htmlFor="school-select" className="text-sm font-medium">
            School
          </Label>
          <Select
            value={selectedSchoolId}
            onValueChange={(value) => {
              setSelectedSchoolId(value);
              updateUrlParams({ school: value });
            }}
          >
            <SelectTrigger className="w-full">
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

        {/* Mentor Selection */}
        <div>
          <Label htmlFor="mentor-select" className="text-sm font-medium">
            Mentor
          </Label>
          <Select
            value={selectedMentorId}
            onValueChange={(value) => {
              setSelectedMentorId(value);
              updateUrlParams({ mentor: value });
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a mentor" />
            </SelectTrigger>
            <SelectContent>
              {availableMentors.map((mentor) => (
                <SelectItem key={mentor._id} value={mentor._id}>
                  {mentor.user.name} ({mentor.user.email})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
                    <SelectItem key={gradeData.grade} value={gradeData.grade}>
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
      </div>

      {/* Show message when filters are not complete */}
      {(!selectedSchoolId ||
        !selectedMentorId ||
        !selectedGrade ||
        !selectedSection) && (
        <Alert>
          <AlertDescription>
            Please select School, Mentor, Grade, and Section to view module
            progress.
          </AlertDescription>
        </Alert>
      )}

      {/* Show loading state when modules are being loaded */}
      {selectedSchoolId &&
        selectedMentorId &&
        selectedGrade &&
        selectedSection &&
        loading && (
          <Alert>
            <AlertDescription className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading module progress for the selected criteria...
            </AlertDescription>
          </Alert>
        )}

      {/* Show message when no data is available */}
      {selectedSchoolId &&
        selectedMentorId &&
        selectedGrade &&
        selectedSection &&
        !moduleProgress &&
        !loading && (
          <Alert>
            <AlertDescription>
              No module progress found for the selected criteria. Please try
              selecting different criteria or contact your administrator if
              modules should be available.
            </AlertDescription>
          </Alert>
        )}

      {/* Module Progress Table */}
      {moduleProgress &&
        moduleProgress.moduleProgress &&
        moduleProgress.moduleProgress.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Module Progress for {moduleProgress.mentor.name}
              </CardTitle>
              <p className="text-sm text-gray-600">
                {moduleProgress.school.name} - {moduleProgress.school.city},{" "}
                {moduleProgress.school.state}
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {moduleProgress.moduleProgress.map((module) => (
                  <div key={module.moduleId} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="font-medium flex items-center gap-2">
                          <BookOpen className="h-4 w-4" />
                          Grade {module.grade} - {module.subject.name}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {
                            module.moduleItems.filter(
                              (item) => item.isCompleted
                            ).length
                          }{" "}
                          of {module.moduleItems.length} items completed
                        </p>
                      </div>
                      <div className="text-right">
                        <div
                          className={`text-lg font-bold ${getProgressColor(
                            module.overallProgress
                          )}`}
                        >
                          {module.overallProgress}%
                        </div>
                        <Progress
                          value={module.overallProgress}
                          className="w-24 mt-1"
                        />
                      </div>
                    </div>

                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[50px]">#</TableHead>
                          <TableHead>Module Item</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead className="w-[120px]">Status</TableHead>
                          <TableHead className="w-[150px]">
                            Completed At
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {module.moduleItems.map((item, index) => (
                          <TableRow key={item.moduleItemId}>
                            <TableCell className="font-medium">
                              {index + 1}
                            </TableCell>
                            <TableCell className="font-medium">
                              {item.moduleItemName}
                            </TableCell>
                            <TableCell className="text-gray-600">
                              {item.moduleItemDescription ||
                                "No description available"}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  item.status === "Completed"
                                    ? "default"
                                    : item.status === "In Progress"
                                    ? "secondary"
                                    : "outline"
                                }
                                className={
                                  item.status === "Completed"
                                    ? "bg-green-100 text-green-800"
                                    : item.status === "In Progress"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-gray-100 text-gray-800"
                                }
                              >
                                {item.status}
                              </Badge>
                            </TableCell>

                            <TableCell className="text-sm text-gray-600">
                              {item.completedAt
                                ? new Date(
                                    item.completedAt
                                  ).toLocaleDateString()
                                : "-"}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
    </div>
  );
}
