import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, BookOpen, Search } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  sessionProgressService,
  type School,
  type SessionProgress,
} from "@/api/sessionProgressService";
// Removed unused sessionService import
import { schoolService, type AvailableGrade } from "@/api/schoolService";
import { toast } from "sonner";

// Remove the duplicate interface since we're importing it from the service

export default function SessionProgressPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [sessions, setSessions] = useState<SessionProgress[]>([]);
  const [availableSchools, setAvailableSchools] = useState<School[]>([]);
  const [selectedSchoolId, setSelectedSchoolId] = useState<string>("");
  const [updating, setUpdating] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Filter states
  const [selectedGrade, setSelectedGrade] = useState<string>("");
  const [selectedSection, setSelectedSection] = useState<string>("");
  const [availableGrades, setAvailableGrades] = useState<AvailableGrade[]>([]);
  const [availableSections, setAvailableSections] = useState<string[]>([]);
  const [hasServiceDetails, setHasServiceDetails] = useState(false);

  // Function to update URL parameters
  const updateUrlParams = (params: {
    grade?: string;
    section?: string;
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

    setSearchParams(newSearchParams, { replace: true });
  };

  // Initialize from URL parameters
  useEffect(() => {
    const gradeParam = searchParams.get("grade");
    const sectionParam = searchParams.get("section");

    if (gradeParam) {
      setSelectedGrade(gradeParam);
    }
    if (sectionParam) {
      setSelectedSection(sectionParam);
    }
  }, [searchParams]);

  useEffect(() => {
    loadAvailableSchools();
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
      const schools = await sessionProgressService.getAvailableSchools();
      setAvailableSchools(schools);
      if (schools.length > 0) {
        setSelectedSchoolId(schools[0]._id);
      }
    } catch (error) {
      console.error("Error loading schools:", error);
      toast.error("Failed to load schools");
    }
  };

  const loadSessions = useCallback(
    async (schoolId: string, grade: string, section: string) => {
      try {
        setLoading(true);
        console.log("Loading sessions with filters:", {
          schoolId,
          grade,
          section,
        });

        // Get session progress from the API
        const progressData = await sessionProgressService.getMentorSessionProgress(
          schoolId,
          section,
          grade
        );

        console.log("Session progress data:", progressData);

        // The API now returns sessions instead of modules
        const sessionProgress = progressData.sessions || [];
        setSessions(sessionProgress);

        console.log("Number of sessions found:", sessionProgress.length);

        // Show appropriate message based on results
        if (sessionProgress.length === 0) {
          console.log("No sessions found for the selected criteria");
        } else {
          console.log("Sessions loaded successfully");
        }
      } catch (error) {
        console.error("Error loading sessions:", error);

        // Reset sessions on error
        setSessions([]);

        // Show specific error message
        if (error instanceof Error) {
          toast.error(`Failed to load sessions: ${error.message}`);
        } else {
          toast.error("Failed to load sessions. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Load sessions when all filters are selected
  useEffect(() => {
    if (selectedSchoolId && selectedGrade && selectedSection) {
      console.log("Triggering loadSessions with:", {
        selectedSchoolId,
        selectedGrade,
        selectedSection,
      });
      loadSessions(selectedSchoolId, selectedGrade, selectedSection);
    }
  }, [selectedSchoolId, selectedGrade, selectedSection, loadSessions]);

  const handleSessionStatusChange = async (
    sessionId: string,
    newStatus: string
  ) => {
    if (!sessions || sessions.length === 0) return;

    setUpdating(sessionId);

    try {
      // Find the session to get its module ID
      const session = sessions.find(s => s.sessionId === sessionId);
      if (!session) {
        throw new Error("Session not found");
      }

      // Update local state immediately
      setSessions(prev => 
        prev.map(s => 
          s.sessionId === sessionId 
            ? { ...s, status: newStatus as "Pending" | "In Progress" | "Completed", isCompleted: newStatus === "Completed" }
            : s
        )
      );

      // Call API to update session completion
      console.log("Updating session completion with data:", {
        moduleId: session.module._id || session.module,
        moduleItemId: sessionId, // Use sessionId as moduleItemId
        schoolId: selectedSchoolId,
        section: selectedSection,
        grade: selectedGrade,
        isCompleted: newStatus === "Completed",
        status: newStatus,
      });

      const response = await sessionProgressService.markSessionCompleted({
        sessionId: sessionId,
        schoolId: selectedSchoolId,
        section: selectedSection,
        grade: selectedGrade,
        isCompleted: newStatus === "Completed",
        status: newStatus as "Pending" | "In Progress" | "Completed",
      });

      console.log("Session status update response:", response);
      toast.success(`Session status updated to ${newStatus}`);

    } catch (error: any) {
      console.error("Error updating session status:", error);

      // Show more specific error message
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to update session status";
      toast.error(errorMessage);

      // Revert the status change on error
      setSessions(prev => 
        prev.map(s => 
          s.sessionId === sessionId 
            ? { ...s, status: s.status, isCompleted: s.isCompleted }
            : s
        )
      );
    } finally {
      setUpdating(null);
    }
  };

  // Filter sessions based on search term
  const filteredSessions = sessions.filter(session =>
    session.sessionName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    session.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (session.description && session.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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
          <h1 className="text-2xl font-bold">Session Progress</h1>
          <p className="text-gray-600 text-sm">
            Track and manage session completion progress
          </p>
        </div>
      </div>

      {/* School Selection and Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* School Selection */}
        <div>
          <Label htmlFor="school-select" className="text-sm font-medium">
            School
          </Label>
          <Select value={selectedSchoolId} onValueChange={setSelectedSchoolId}>
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
      </div>

      {/* Show message when filters are not complete */}
      {(!selectedSchoolId || !selectedGrade || !selectedSection) && (
        <Alert>
          <AlertDescription>
            Please select School, Grade, and Section to view session progress.
          </AlertDescription>
        </Alert>
      )}

      {/* Show loading state when sessions are being loaded */}
      {selectedSchoolId &&
        selectedGrade &&
        selectedSection &&
        loading && (
          <Alert>
            <AlertDescription className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading sessions for the selected criteria...
            </AlertDescription>
          </Alert>
        )}

      {/* Show message when no data is available */}
      {selectedSchoolId &&
        selectedGrade &&
        selectedSection &&
        sessions.length === 0 &&
        !loading && (
          <Alert>
            <AlertDescription>
              No sessions found for the selected Grade ({selectedGrade}) and Section
              ({selectedSection}) combination. Please try selecting different criteria or contact your administrator if sessions should
              be available.
            </AlertDescription>
          </Alert>
        )}

      {/* Sessions Table */}
      {sessions && sessions.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Sessions ({filteredSessions.length})
              </CardTitle>
              
              {/* Search Input */}
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search sessions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">#</TableHead>
                  <TableHead>Session</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="w-[200px]">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSessions.map((session, index) => {
                  const isUpdating = updating === session.sessionId;
                  const currentStatus = session.status || "Pending";

                  return (
                    <TableRow key={session.sessionId}>
                      <TableCell className="font-medium">{index + 1}</TableCell>
                      <TableCell className="font-medium">
                        <div>
                          <div className="font-semibold">{session.displayName}</div>
                          <div className="text-sm text-gray-500">
                            {session.sessionName}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-600">
                        {session.description || "No description available"}
                      </TableCell>
                      <TableCell>
                        <Select
                          value={currentStatus}
                          onValueChange={(value) =>
                            handleSessionStatusChange(session.sessionId, value)
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
                        {isUpdating && (
                          <Loader2 className="h-4 w-4 animate-spin text-gray-500 mt-1" />
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
