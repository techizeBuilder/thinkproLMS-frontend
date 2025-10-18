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
import { Button } from "@/components/ui/button";
import { Loader2, BookOpen, Search, Download } from "lucide-react";
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

// New interface for the comprehensive session data
interface SessionProgressData {
  grade: number;
  section: string;
  sessionId: string;
  sessionName: string;
  displayName: string;
  description?: string;
  status: string;
  notes?: string;
}

interface GradeSectionData {
  grade: number;
  sections: string[];
  sessions: SessionProgressData[];
}

export default function SessionProgressViewer({
  title = "Session Progress Overview",
  description = "Monitor and manage session completion progress for all grades and sections",
}: SessionProgressViewerProps) {
  const [loading, setLoading] = useState(false);
  const [gradeSectionData, setGradeSectionData] = useState<GradeSectionData[]>([]);
  const [expandedNotes, setExpandedNotes] = useState<Record<string, boolean>>({});
  const [availableSchools, setAvailableSchools] = useState<School[]>([]);
  const [availableMentors, setAvailableMentors] = useState<Mentor[]>([]);
  const [selectedMentorId, setSelectedMentorId] = useState<string>("");
  const [selectedSchoolId, setSelectedSchoolId] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Loading states for filters
  const [loadingMentors, setLoadingMentors] = useState(false);
  const [loadingSchools, setLoadingSchools] = useState(false);
  const [loadingSessions, setLoadingSessions] = useState(false);

  // School service details
  const [availableGrades, setAvailableGrades] = useState<AvailableGrade[]>([]);
  const [hasServiceDetails, setHasServiceDetails] = useState(false);

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
      setAvailableGrades([]);
      setHasServiceDetails(false);
      setGradeSectionData([]);
    }
  }, [selectedMentorId]);

  // Load school service details and all session data when school changes
  useEffect(() => {
    const fetchSchoolServiceDetails = async (schoolId: string) => {
      try {
        setLoadingSessions(true);
        const response = await schoolService.getServiceDetails(schoolId);
        if (response.success) {
          setAvailableGrades(response.data.grades);
          setHasServiceDetails(response.data.hasServiceDetails);
          
          // Load all session data for all grades and sections
          if (response.data.grades && response.data.grades.length > 0) {
            await loadAllSessionData(selectedMentorId, schoolId, response.data.grades);
          }
        }
      } catch (error) {
        console.error("Error fetching school service details:", error);
        setAvailableGrades([]);
        setHasServiceDetails(false);
        setGradeSectionData([]);
      } finally {
        setLoadingSessions(false);
      }
    };

    if (selectedSchoolId && selectedMentorId) {
      fetchSchoolServiceDetails(selectedSchoolId);
    } else {
      setAvailableGrades([]);
      setHasServiceDetails(false);
      setGradeSectionData([]);
    }
  }, [selectedSchoolId, selectedMentorId]);

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

  const loadAllSessionData = async (
    mentorId: string,
    schoolId: string,
    grades: AvailableGrade[]
  ) => {
    try {
      setLoading(true);
      const allGradeSectionData: GradeSectionData[] = [];

      // Sort grades in ascending order
      const sortedGrades = [...grades].sort((a, b) => a.grade - b.grade);

      for (const gradeData of sortedGrades) {
        const gradeSections: string[] = gradeData.sections || [];
        const gradeSessions: SessionProgressData[] = [];

        // Load session data for each section in this grade
        for (const section of gradeSections) {
          try {
            const progressData = await sessionProgressService.getLeadMentorSessionProgress(
              mentorId,
              schoolId,
              section,
              gradeData.grade.toString()
            );

            const sessions = progressData.sessions || [];
            
            // Transform session data to include grade and section info
            const transformedSessions = sessions.map((session: any) => ({
              grade: gradeData.grade,
              section: section,
              sessionId: session.sessionId,
              sessionName: session.sessionName,
              displayName: session.displayName,
              description: session.description,
              status: session.status || "Pending",
              notes: session.notes || ""
            }));

            gradeSessions.push(...transformedSessions);
          } catch (error) {
            console.error(`Error loading sessions for grade ${gradeData.grade}, section ${section}:`, error);
          }
        }

        // Group sessions by session name and create session numbers
        const sessionGroups = gradeSessions.reduce((groups, session) => {
          const key = session.sessionName;
          if (!groups[key]) {
            groups[key] = [];
          }
          groups[key].push(session);
          return groups;
        }, {} as Record<string, SessionProgressData[]>);

        // Create session entries with proper numbering
        const sessionEntries: SessionProgressData[] = [];
        let sessionNumber = 1;
        
        for (const [sessionName, sectionSessions] of Object.entries(sessionGroups)) {
          const firstSession = sectionSessions[0];
          const sessionEntry: SessionProgressData = {
            grade: gradeData.grade,
            section: "ALL", // This represents the session across all sections
            sessionId: firstSession.sessionId,
            sessionName: firstSession.sessionName,
            displayName: `${gradeData.grade}.${sessionNumber.toString().padStart(2, '0')} ${firstSession.displayName}`,
            description: firstSession.description,
            status: "Mixed", // Will be determined by section statuses
            notes: ""
          };
          
          // Add section-specific data
          for (const sectionSession of sectionSessions) {
            sessionEntry[`${sectionSession.section}_status`] = sectionSession.status;
            sessionEntry[`${sectionSession.section}_notes`] = sectionSession.notes;
          }
          
          sessionEntries.push(sessionEntry);
          sessionNumber++;
        }

        allGradeSectionData.push({
          grade: gradeData.grade,
          sections: gradeSections,
          sessions: sessionEntries
        });
      }

      setGradeSectionData(allGradeSectionData);
    } catch (error) {
      console.error("Error loading all session data:", error);
      toast.error("Failed to load session data");
      setGradeSectionData([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter sessions based on search term
  const filteredGradeSectionData = gradeSectionData.map(gradeData => ({
    ...gradeData,
    sessions: gradeData.sessions.filter(session =>
      session.sessionName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (session.description &&
        session.description.toLowerCase().includes(searchTerm.toLowerCase()))
    )
  })).filter(gradeData => gradeData.sessions.length > 0);

  // Calculate session status counts across all grades
  const allSessions = gradeSectionData.flatMap(gradeData => gradeData.sessions);
  const sessionCounts = allSessions.reduce((counts, session) => {
    const status = session.status || "Pending";
    counts[status] = (counts[status] || 0) + 1;
    return counts;
  }, {} as Record<string, number>);

  const totalSessions = allSessions.length;
  const pendingCount = sessionCounts["Pending"] || 0;
  const inProgressCount = sessionCounts["In Progress"] || 0;
  const completedCount = sessionCounts["Completed"] || 0;

  // Export to Excel functionality
  const exportToExcel = () => {
    try {
      // Create workbook data
      const workbookData: any[] = [];
      
      // Add header information
      const selectedSchool = availableSchools.find(s => s._id === selectedSchoolId);
      const selectedMentor = availableMentors.find(m => m._id === selectedMentorId);
      
      workbookData.push(
        ["School", selectedSchool?.name || ""],
        ["Mentor", selectedMentor?.user.name || ""],
        ["Grade", "Filter"],
        [""], // Empty row
      );

      // Add data for each grade
      gradeSectionData.forEach(gradeData => {
        // Add grade header
        workbookData.push([`Grade ${gradeData.grade}`, ""]);
        
        // Add section headers
        const headers = ["Session", ...gradeData.sections.map(section => `${section} Status`), ...gradeData.sections.map(section => `${section} Notes`)];
        workbookData.push(headers);
        
        // Add session data
        gradeData.sessions.forEach(session => {
          const row = [session.displayName];
          
          // Add status for each section
          gradeData.sections.forEach(section => {
            const status = session[`${section}_status`] || "Pending";
            row.push(status);
          });
          
          // Add notes for each section
          gradeData.sections.forEach(section => {
            const notes = session[`${section}_notes`] || "";
            row.push(notes);
          });
          
          workbookData.push(row);
        });
        
        workbookData.push([""]); // Empty row between grades
      });

      // Convert to CSV format
      const csvContent = workbookData.map(row => 
        row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(",")
      ).join("\n");

      // Create and download file
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `session-progress-${selectedSchool?.name?.replace(/\s+/g, '-') || 'school'}-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success("Session progress exported successfully");
    } catch (error) {
      console.error("Error exporting to Excel:", error);
      toast.error("Failed to export session progress");
    }
  };

  if (loadingSessions) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const filtersCompleted = selectedMentorId && selectedSchoolId;

  return (
    <div className="p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">{title}</h1>
          <p className="text-gray-600 text-xs">{description}</p>
        </div>
      </div>

      {/* Mentor and School Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
                placeholder={
                  loadingMentors ? "Loading..." : "Select school mentor"
                }
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
              <SelectValue
                placeholder={loadingSchools ? "Loading..." : "Select school"}
              />
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
      </div>

      {/* Show message when filters are not complete */}
      {!filtersCompleted && (
        <Alert>
          <AlertDescription>
            Please select Mentor and School to view session progress for all grades and sections.
          </AlertDescription>
        </Alert>
      )}

      {/* Show loading state when sessions are being loaded */}
      {filtersCompleted && loadingSessions && (
        <Alert>
          <AlertDescription className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading session data for all grades and sections...
          </AlertDescription>
        </Alert>
      )}

      {/* Show message when no data is available */}
      {filtersCompleted && gradeSectionData.length === 0 && !loadingSessions && (
        <Alert>
          <AlertDescription>
            No session data found for the selected school. Please try selecting
            a different school or contact your administrator if sessions should
            be available.
          </AlertDescription>
        </Alert>
      )}

      {/* Session Summary Report */}
      {filtersCompleted && allSessions.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="text-center p-2 bg-gray-50 rounded">
            <div className="text-lg font-bold text-gray-700">
              {totalSessions}
            </div>
            <div className="text-xs text-gray-600">Total Sessions</div>
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
      )}

      {/* Comprehensive Sessions Table */}
      {filtersCompleted && gradeSectionData.length > 0 && (
        <Card>
          <CardHeader className="p-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-sm">
                <BookOpen className="h-4 w-4" />
                Session Progress by Grade and Section
              </CardTitle>

              <div className="flex items-center gap-2">
                {/* Search Input */}
                <div className="relative w-48">
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-3 w-3" />
                  <Input
                    placeholder="Search sessions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-7 h-7 text-xs"
                  />
                </div>

                {/* Export Button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => exportToExcel()}
                  className="h-7 text-xs"
                >
                  <Download className="h-3 w-3 mr-1" />
                  Export Excel
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-3">
            <div className="space-y-6">
              {filteredGradeSectionData.map((gradeData) => (
                <div key={gradeData.grade} className="space-y-2">
                  <h3 className="text-sm font-semibold text-gray-700">
                    Grade {gradeData.grade}
                  </h3>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="h-8">
                          <TableHead className="w-[80px] text-xs font-medium">Session</TableHead>
                          {gradeData.sections.map((section) => (
                            <TableHead key={section} className="text-xs font-medium text-center min-w-[120px]">
                              {section}
                            </TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {gradeData.sessions.map((session, index) => (
                          <TableRow key={`${session.grade}-${session.sessionId}`} className="h-10">
                            <TableCell className="font-medium text-xs">
                              <div className="font-semibold">
                                {session.displayName}
                              </div>
                              {session.description && (
                                <div className="text-gray-500 text-[10px] mt-1">
                                  {session.description}
                                </div>
                              )}
                            </TableCell>
                            {gradeData.sections.map((section) => {
                              const sectionStatus = session[`${section}_status`] || "Pending";
                              const sectionNotes = session[`${section}_notes`] || "";
                              const isExpanded = !!expandedNotes[`${session.sessionId}-${section}`];
                              const isLongNote = sectionNotes.length > 50;

                              return (
                                <TableCell key={section} className="text-center">
                                  <div className="space-y-1">
                                    {/* Status Badge */}
                                    <div className="flex justify-center">
                                      <span
                                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                                          sectionStatus === "Completed"
                                            ? "bg-green-100 text-green-800 border border-green-200"
                                            : sectionStatus === "In Progress"
                                            ? "bg-blue-100 text-blue-800 border border-blue-200"
                                            : "bg-gray-100 text-gray-800 border border-gray-200"
                                        }`}
                                      >
                                        {sectionStatus}
                                      </span>
                                    </div>
                                    
                                    {/* Notes */}
                                    {sectionNotes && (
                                      <div className="text-[10px] text-gray-600 max-w-[100px] mx-auto">
                                        <div
                                          className={
                                            !isExpanded
                                              ? "max-h-6 overflow-hidden"
                                              : undefined
                                          }
                                        >
                                          {sectionNotes}
                                        </div>
                                        {isLongNote && (
                                          <button
                                            type="button"
                                            className="text-blue-600 hover:underline text-[9px]"
                                            onClick={() =>
                                              setExpandedNotes((prev) => ({
                                                ...prev,
                                                [`${session.sessionId}-${section}`]: !isExpanded,
                                              }))
                                            }
                                          >
                                            {isExpanded ? "Less" : "More"}
                                          </button>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </TableCell>
                              );
                            })}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
