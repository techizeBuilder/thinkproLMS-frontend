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
import { schoolService, type AvailableGrade } from "@/api/schoolService";
import { mentorService, type Mentor } from "@/api/mentorService";
import { toast } from "sonner";

interface SessionProgressViewerProps {
  title?: string;
  description?: string;
}

export default function SessionProgressViewer({
  title = "Session Progress Overview",
  description = "Monitor and manage session completion progress for mentors",
}: SessionProgressViewerProps) {
  const [loading, setLoading] = useState(false);
  const [sessions, setSessions] = useState<SessionProgress[]>([]);
  const [expandedNotes, setExpandedNotes] = useState<Record<string, boolean>>({});
  const [availableSchools, setAvailableSchools] = useState<School[]>([]);
  const [availableMentors, setAvailableMentors] = useState<Mentor[]>([]);
  const [selectedMentorId, setSelectedMentorId] = useState<string>("");
  const [selectedSchoolId, setSelectedSchoolId] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Loading states for filters
  const [loadingMentors, setLoadingMentors] = useState(false);
  const [loadingSchools, setLoadingSchools] = useState(false);
  const [loadingGrades, setLoadingGrades] = useState(false);

  // Filter states
  const [selectedGrade, setSelectedGrade] = useState<string>("");
  const [selectedSection, setSelectedSection] = useState<string>("");
  const [availableGrades, setAvailableGrades] = useState<AvailableGrade[]>([]);
  const [availableSections, setAvailableSections] = useState<string[]>([]);
  const [hasServiceDetails, setHasServiceDetails] = useState(false);


  // Auto-select first available options in sequence

  useEffect(() => {
    loadAvailableMentors();
  }, []);

  // Load schools when mentor changes
  useEffect(() => {
    if (selectedMentorId) {
      loadMentorSchools(selectedMentorId);
    } else {
      setAvailableSchools([]);
      setSelectedSchoolId("");
      setSelectedGrade("");
      setSelectedSection("");
      setAvailableGrades([]);
      setAvailableSections([]);
      setHasServiceDetails(false);
    }
  }, [selectedMentorId]);

  // Load school service details when school changes
  useEffect(() => {
    const fetchSchoolServiceDetails = async (schoolId: string) => {
      try {
        setLoadingGrades(true);
        const response = await schoolService.getServiceDetails(schoolId);
        if (response.success) {
          setAvailableGrades(response.data.grades);
          setHasServiceDetails(response.data.hasServiceDetails);
          // Auto-select first grade when school changes
          if (response.data.grades && response.data.grades.length > 0) {
            setSelectedGrade(response.data.grades[0].grade.toString());
          }
        }
      } catch (error) {
        console.error("Error fetching school service details:", error);
        setAvailableGrades([]);
        setHasServiceDetails(false);
      } finally {
        setLoadingGrades(false);
      }
    };

    if (selectedSchoolId) {
      fetchSchoolServiceDetails(selectedSchoolId);
      // Clear dependent filters when school changes
      setSelectedGrade("");
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

      // Auto-select first section when grade changes
      if (sections.length > 0) {
        setSelectedSection(sections[0]);
      }
    } else {
      setAvailableSections([]);
    }
  }, [selectedGrade, availableGrades, hasServiceDetails]);

  const loadAvailableMentors = async () => {
    try {
      setLoadingMentors(true);
      const response = await mentorService.getAll();
      if (response.success) {
        setAvailableMentors(response.data);
        // Auto-select first mentor on initial load
        if (response.data.length > 0) {
          setSelectedMentorId(response.data[0]._id);
        }
      }
    } catch (error) {
      console.error("Error loading mentors:", error);
      toast.error("Failed to load mentors");
    } finally {
      setLoadingMentors(false);
    }
  };

  const loadMentorSchools = async (mentorId: string) => {
    try {
      setLoadingSchools(true);
      const response = await mentorService.getById(mentorId);
      if (response.success) {
        const mentor: any = response.data;
        // Support both single assignedSchool and multiple assignedSchools
        const schools: School[] = Array.isArray(mentor.assignedSchools)
          ? mentor.assignedSchools
          : mentor.assignedSchool
          ? [mentor.assignedSchool]
          : [];

        setAvailableSchools(schools);
        setSelectedSchoolId(schools[0]?._id || "");
      }
    } catch (error) {
      console.error("Error loading mentor schools:", error);
      toast.error("Failed to load mentor schools");
    } finally {
      setLoadingSchools(false);
    }
  };

  const loadSessions = useCallback(
    async (
      mentorId: string,
      schoolId: string,
      grade: string,
      section: string
    ) => {
      try {
        setLoading(true);
        console.log("Loading sessions with filters:", {
          mentorId,
          schoolId,
          grade,
          section,
        });

        // Get session progress from the API for the specific mentor
        const progressData =
          await sessionProgressService.getLeadMentorSessionProgress(
            mentorId,
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
    if (
      selectedMentorId &&
      selectedSchoolId &&
      selectedGrade &&
      selectedSection
    ) {
      console.log("Triggering loadSessions with:", {
        selectedMentorId,
        selectedSchoolId,
        selectedGrade,
        selectedSection,
      });
      loadSessions(
        selectedMentorId,
        selectedSchoolId,
        selectedGrade,
        selectedSection
      );
    }
  }, [
    selectedMentorId,
    selectedSchoolId,
    selectedGrade,
    selectedSection,
    loadSessions,
  ]);

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

  // All users now see read-only status badges

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const filtersCompleted =
    selectedMentorId && selectedSchoolId && selectedGrade && selectedSection;

  return (
    <div className="p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">{title}</h1>
          <p className="text-gray-600 text-xs">{description}</p>
        </div>
      </div>

      {/* Mentor and School Selection and Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {/* Mentor Selection */}
        <div>
          <Label htmlFor="mentor-select" className="text-xs font-medium">
            School Mentor
          </Label>
          <Select
            value={selectedMentorId}
            onValueChange={(value) => {
              setSelectedMentorId(value);
            }}
            disabled={loadingMentors}
          >
            <SelectTrigger className="w-full h-8">
              <SelectValue
                placeholder={loadingMentors ? "Loading..." : "Select school mentor"}
              />
            </SelectTrigger>
            <SelectContent>
              {availableMentors.map((mentor) => (
                <SelectItem key={mentor._id} value={mentor._id}>
                  {mentor.user.name} - {mentor.user.email}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* School Selection */}
        <div>
          <Label htmlFor="school-select" className="text-xs font-medium">
            School
          </Label>
          <Select
            value={selectedSchoolId}
            onValueChange={(value) => {
              setSelectedSchoolId(value);
            }}
            disabled={loadingSchools || availableSchools.length === 0}
          >
            <SelectTrigger className="w-full h-8">
              <SelectValue placeholder={loadingSchools ? "Loading..." : "Select school"} />
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
          <Label htmlFor="grade-select" className="text-xs font-medium">
            Grade
          </Label>
          <Select
            value={selectedGrade}
            onValueChange={(value) => {
              setSelectedGrade(value);
            }}
            disabled={loadingGrades}
          >
            <SelectTrigger className="w-full h-8">
              <SelectValue
                placeholder={loadingGrades ? "Loading..." : "Select grade"}
              />
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
        <div>
          <Label htmlFor="section-select" className="text-xs font-medium">
            Section
          </Label>
          <Select
            value={selectedSection}
            onValueChange={(value) => {
              setSelectedSection(value);
            }}
          >
            <SelectTrigger className="w-full h-8">
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
      {!filtersCompleted && (
        <Alert>
          <AlertDescription>
            Please select Mentor, School, Grade, and Section to view session
            progress.
          </AlertDescription>
        </Alert>
      )}

      {/* Show loading state when sessions are being loaded */}
      {filtersCompleted && loading && (
        <Alert>
          <AlertDescription className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading sessions for the selected criteria...
          </AlertDescription>
        </Alert>
      )}

      {/* Show message when no data is available */}
      {filtersCompleted && sessions.length === 0 && !loading && (
        <Alert>
          <AlertDescription>
            No sessions found for the selected criteria. Please try selecting
            different criteria or contact your administrator if sessions should
            be available.
          </AlertDescription>
        </Alert>
      )}

      {/* Session Summary Report */}
      {filtersCompleted && sessions && sessions.length > 0 && (
        <Card>
          <CardContent className="p-3">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="text-center p-2 bg-gray-50 rounded">
                <div className="text-lg font-bold text-gray-700">
                  {totalSessions}
                </div>
                <div className="text-xs text-gray-600">Total</div>
              </div>
              <div className="text-center p-2 bg-gray-100 rounded">
                <div className="text-lg font-bold text-gray-600">
                  {pendingCount}
                </div>
                <div className="text-xs text-gray-600">Pending</div>
              </div>
              <div className="text-center p-2 bg-blue-50 rounded">
                <div className="text-lg font-bold text-blue-600">
                  {inProgressCount}
                </div>
                <div className="text-xs text-blue-600">In Progress</div>
              </div>
              <div className="text-center p-2 bg-green-50 rounded">
                <div className="text-lg font-bold text-green-600">
                  {completedCount}
                </div>
                <div className="text-xs text-green-600">Completed</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sessions Table */}
      {filtersCompleted && sessions && sessions.length > 0 && (
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
                  <TableHead className="w-[120px] text-xs">Status</TableHead>
                  <TableHead className="text-xs w-[260px]">Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSessions.map((session, index) => {
                  const currentStatus = session.status || "Pending";
                  const note = (session.notes || "").trim();
                  const isLongNote = note.length > 120 || note.split("\n").length > 2;
                  const isExpanded = !!expandedNotes[session.sessionId];

                  return (
                    <TableRow key={session.sessionId} className="h-10">
                      <TableCell className="font-medium text-xs">
                        {index + 1}
                      </TableCell>
                      <TableCell className="font-medium">
                        <div>
                          <div className="font-semibold text-sm">
                            {session.displayName}
                          </div>
                          <div className="text-xs text-gray-500">
                            {session.sessionName}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-600 text-xs">
                        {session.description || "No description"}
                      </TableCell>
                      <TableCell>
                        {/* Status badge for all users */}
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              currentStatus === "Completed"
                                ? "bg-green-100 text-green-800 border border-green-200"
                                : currentStatus === "In Progress"
                                ? "bg-blue-100 text-blue-800 border border-blue-200"
                                : "bg-gray-100 text-gray-800 border border-gray-200"
                            }`}
                          >
                            {currentStatus}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-700 text-xs">
                        {note.length > 0 ? (
                          <div className="max-w-xs whitespace-pre-wrap break-words">
                            <div className={!isExpanded ? "max-h-10 overflow-hidden" : undefined}>
                              {note}
                            </div>
                            {isLongNote && (
                              <button
                                type="button"
                                className="mt-1 text-blue-600 hover:underline text-[11px]"
                                onClick={() =>
                                  setExpandedNotes((prev) => ({
                                    ...prev,
                                    [session.sessionId]: !isExpanded,
                                  }))
                                }
                              >
                                {isExpanded ? "Show less" : "Show more"}
                              </button>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400 italic">No notes</span>
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
