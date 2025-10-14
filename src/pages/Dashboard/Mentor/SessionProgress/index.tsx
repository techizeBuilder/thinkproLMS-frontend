import { useState, useEffect, useCallback } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
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
  const [notesDrafts, setNotesDrafts] = useState<Record<string, string>>({});
  const [savingNotesFor, setSavingNotesFor] = useState<string | null>(null);

  // Removed URL parameter syncing; default to first available options

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

          // Auto-select first grade if available
          if (response.data.grades && response.data.grades.length > 0) {
            const firstGrade = response.data.grades[0].grade;
            setSelectedGrade(firstGrade.toString());
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
      // Reset sections when school changes; grade will be set after fetch
      setSelectedSection("");
      setAvailableSections([]);
    } else {
      setAvailableGrades([]);
      setHasServiceDetails(false);
      setAvailableSections([]);
    }
  }, [selectedSchoolId]);

  // Update available sections when grade changes
  useEffect(() => {
    if (selectedGrade && hasServiceDetails) {
      const selectedGradeData = availableGrades.find(
        (gradeData) => gradeData.grade.toString() === selectedGrade
      );
      const sections = selectedGradeData?.sections || [];
      setAvailableSections(sections);

      // Auto-select first section if available
      if (sections.length > 0) {
        const firstSection = sections[0];
        setSelectedSection(firstSection);
      } else {
        setSelectedSection("");
      }
    } else {
      setAvailableSections([]);
    }
  }, [selectedGrade, availableGrades, hasServiceDetails]);

  const loadAvailableSchools = async () => {
    try {
      const { schools } = await sessionProgressService.getMentorSchools();
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
        const progressData =
          await sessionProgressService.getMentorSessionProgress(
            schoolId,
            section,
            grade
          );

        console.log("Session progress data:", progressData);

        // The API now returns sessions instead of modules
        const sessionProgress = progressData.sessions || [];
        setSessions(sessionProgress);
        // Initialize notes drafts from loaded sessions
        const nextDrafts: Record<string, string> = {};
        for (const s of sessionProgress) {
          nextDrafts[s.sessionId] = s.notes || "";
        }
        setNotesDrafts(nextDrafts);

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

  const handleSaveNotes = async (sessionId: string) => {
    const session = sessions.find((s) => s.sessionId === sessionId);
    if (!session) return;
    const notes = notesDrafts[sessionId] ?? "";
    try {
      setSavingNotesFor(sessionId);
      await sessionProgressService.updateSessionStatus({
        sessionId,
        schoolId: selectedSchoolId,
        section: selectedSection,
        grade: selectedGrade,
        status: session.status || "Pending",
        notes,
      });
      setSessions((prev) =>
        prev.map((s) => (s.sessionId === sessionId ? { ...s, notes } : s))
      );
      toast.success("Notes saved");
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to save notes";
      toast.error(errorMessage);
    } finally {
      setSavingNotesFor(null);
    }
  };

  const isNotesDirty = (sessionId: string) => {
    const saved = sessions.find((s) => s.sessionId === sessionId)?.notes || "";
    const draft = notesDrafts[sessionId] ?? "";
    return draft !== saved;
  };

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
      const session = sessions.find((s) => s.sessionId === sessionId);
      if (!session) {
        throw new Error("Session not found");
      }

      // Update local state immediately
      setSessions((prev) =>
        prev.map((s) =>
          s.sessionId === sessionId
            ? {
                ...s,
                status: newStatus as "Pending" | "In Progress" | "Completed",
                isCompleted: newStatus === "Completed",
              }
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
      setSessions((prev) =>
        prev.map((s) =>
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
  const filteredSessions = sessions.filter(
    (session) =>
      session.sessionName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (session.description &&
        session.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Calculate session status counts
  const sessionCounts = filteredSessions.reduce((counts, session) => {
    const status = session.status || "Pending";
    counts[status] = (counts[status] || 0) + 1;
    return counts;
  }, {} as Record<string, number>);

  const totalSessions = filteredSessions.length;
  const pendingCount = sessionCounts["Pending"] || 0;
  const inProgressCount = sessionCounts["In Progress"] || 0;
  const completedCount = sessionCounts["Completed"] || 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Session Progress</h1>
          <p className="text-gray-600 text-xs">
            Track and manage session completion progress
          </p>
        </div>
      </div>

      {/* School + Filters in one row - Compact layout */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Filters on the left */}
        <div className="flex gap-2 items-center justify-between w-full">
          {/* School selection */}
          <div className="min-w-[180px] sm:min-w-[220px]">
            <Label htmlFor="school-select" className="text-xs font-medium">
              School
            </Label>
            <Select
              value={selectedSchoolId}
              onValueChange={(value) => setSelectedSchoolId(value)}
              disabled={availableSchools.length === 0}
            >
              <SelectTrigger className="w-full h-7 sm:h-8">
                <SelectValue placeholder="Select school" />
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

          <div className="flex gap-2 items-center">
            {/* Grade Selection */}
            <div className="min-w-[120px] sm:min-w-[140px]">
              <Label htmlFor="grade-select" className="text-xs font-medium">
                Grade
              </Label>
              <Select
                value={selectedGrade}
                onValueChange={(value) => {
                  setSelectedGrade(value);
                }}
              >
                <SelectTrigger className="w-full h-7 sm:h-8">
                  <SelectValue placeholder="Select grade" />
                </SelectTrigger>
                <SelectContent>
                  {hasServiceDetails
                    ? availableGrades.map((gradeData) => (
                        <SelectItem
                          key={gradeData.grade}
                          value={gradeData.grade.toString()}
                        >
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
            <div className="min-w-[120px] sm:min-w-[140px]">
              <Label htmlFor="section-select" className="text-xs font-medium">
                Section
              </Label>
              <Select
                value={selectedSection}
                onValueChange={(value) => {
                  setSelectedSection(value);
                }}
              >
                <SelectTrigger className="w-full h-7 sm:h-8">
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
        </div>
      </div>

      {/* Show message when filters are not complete */}
      {(!selectedSchoolId || !selectedGrade || !selectedSection) && (
        <Alert>
          <AlertDescription>
            Please select Grade and Section to view session progress.
          </AlertDescription>
        </Alert>
      )}

      {/* Show loading state when sessions are being loaded */}
      {selectedSchoolId && selectedGrade && selectedSection && loading && (
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
              No sessions found for the selected Grade ({selectedGrade}) and
              Section ({selectedSection}) combination. Please try selecting
              different criteria or contact your administrator if sessions
              should be available.
            </AlertDescription>
          </Alert>
        )}

      {/* Session Summary Report - Single row with horizontal scroll */}
      {selectedSchoolId &&
        selectedGrade &&
        selectedSection &&
        sessions &&
        sessions.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-700">
              Session Summary
            </h3>
            <div className="overflow-x-auto">
              <div className="flex gap-3 min-w-max items-center justify-center">
                <div className="flex-shrink-0 text-center p-3 bg-gray-50 rounded min-w-[100px]">
                  <div className="text-lg font-bold text-gray-700">
                    {totalSessions}
                  </div>
                  <div className="text-xs text-gray-600">Total</div>
                </div>
                <div className="flex-shrink-0 text-center p-3 bg-gray-100 rounded min-w-[100px]">
                  <div className="text-lg font-bold text-gray-600">
                    {pendingCount}
                  </div>
                  <div className="text-xs text-gray-600">Pending</div>
                </div>
                <div className="flex-shrink-0 text-center p-3 bg-blue-50 rounded min-w-[100px]">
                  <div className="text-lg font-bold text-blue-600">
                    {inProgressCount}
                  </div>
                  <div className="text-xs text-blue-600">In Progress</div>
                </div>
                <div className="flex-shrink-0 text-center p-3 bg-green-50 rounded min-w-[100px]">
                  <div className="text-lg font-bold text-green-600">
                    {completedCount}
                  </div>
                  <div className="text-xs text-green-600">Completed</div>
                </div>
              </div>
            </div>
          </div>
        )}

      {/* Sessions Table */}
      {sessions && sessions.length > 0 && (
        <Card>
          <CardHeader className="p-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-sm">
                <BookOpen className="h-4 w-4" />
                Sessions ({filteredSessions.length})
              </CardTitle>

              {/* Search Input */}
              <div className="relative w-48">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-3 w-3" />
                <Input
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-7 h-7 text-xs"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-3">
            <Table>
              <TableHeader>
                <TableRow className="h-8">
                  <TableHead className="w-[30px] text-xs">#</TableHead>
                  <TableHead className="text-xs">Session</TableHead>
                  <TableHead className="text-xs">Description</TableHead>
                  <TableHead className="min-w-[160px] text-xs">
                    Status
                  </TableHead>
                  <TableHead className="text-xs min-w-[320px]">Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSessions.map((session, index) => {
                  const isUpdating = updating === session.sessionId;
                  const currentStatus = session.status || "Pending";
                  const draft = notesDrafts[session.sessionId] ?? "";
                  const isSavingNotes = savingNotesFor === session.sessionId;
                  const notesDirty = isNotesDirty(session.sessionId);

                  return (
                    <TableRow key={session.sessionId} className="h-10">
                      <TableCell className="font-medium text-xs">
                        {index + 1}
                      </TableCell>
                      <TableCell className="font-medium">
                        <div>
                          <div className="font-semibold text-xs sm:text-sm">
                            {session.displayName}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-600 text-xs">
                        <div className="line-clamp-2">
                          {session.description || "No description available"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={currentStatus}
                          onValueChange={(value) =>
                            handleSessionStatusChange(session.sessionId, value)
                          }
                          disabled={isUpdating}
                        >
                          <SelectTrigger className="w-full h-7 sm:h-8">
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
                          <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin text-gray-500 mt-1" />
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-2">
                          <Textarea
                            value={draft}
                            onChange={(e) =>
                              setNotesDrafts((prev) => ({
                                ...prev,
                                [session.sessionId]: e.target.value,
                              }))
                            }
                            placeholder="Add notes for this session..."
                            className="min-h-[40px] sm:min-h-[48px] text-xs"
                          />
                          {notesDirty && (
                            <div className="flex justify-end">
                              <Button
                                size="sm"
                                variant="secondary"
                                onClick={() =>
                                  handleSaveNotes(session.sessionId)
                                }
                                disabled={
                                  isSavingNotes ||
                                  !selectedSchoolId ||
                                  !selectedGrade ||
                                  !selectedSection
                                }
                                className="h-6 sm:h-7 py-0 text-xs"
                              >
                                {isSavingNotes ? (
                                  <span className="inline-flex items-center gap-1 sm:gap-2">
                                    <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                                    <span className="hidden sm:inline">
                                      Saving
                                    </span>
                                  </span>
                                ) : (
                                  "Save Notes"
                                )}
                              </Button>
                            </div>
                          )}
                        </div>
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
