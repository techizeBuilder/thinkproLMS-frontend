import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, User, GraduationCap, MapPin } from "lucide-react";
import { studentService } from "@/api/studentService";
import { mentorService } from "@/api/mentorService";
import ProfilePictureDisplay from "@/components/ProfilePictureDisplay";

interface School {
  _id: string;
  name: string;
  city: string;
  state: string;
  boards: string[];
  branchName?: string;
  serviceDetails?: {
    serviceType?: string;
    mentors?: string[];
    subjects?: string[];
    grades?: Array<{
      grade: number;
      sections: string[];
    }>;
  };
}

interface Student {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
    isVerified: boolean;
    createdAt: string;
    profilePicture?: string | null;
  };
  studentId: string;
  grade: number;
  section: string;
  school: School;
  addedBy: {
    _id: string;
    name: string;
    email: string;
    role: string;
  };
  isActive: boolean;
}

interface Mentor {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
    isVerified: boolean;
    createdAt: string;
  };
  assignedSchools: School[];
  isActive: boolean;
}

export default function MentorStudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [mentor, setMentor] = useState<Mentor | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSchool, setSelectedSchool] = useState<string>("all");
  const [selectedGrade, setSelectedGrade] = useState("all");
  const [selectedSection, setSelectedSection] = useState("all");
  const [availableGrades, setAvailableGrades] = useState<string[]>([]);
  const [availableSections, setAvailableSections] = useState<string[]>([]);

  useEffect(() => {
    fetchMentorProfile();
  }, []);

  useEffect(() => {
    if (mentor && mentor.assignedSchools && mentor.assignedSchools.length > 0) {
      fetchStudents();
    }
  }, [mentor]);

  useEffect(() => {
    filterStudents();
  }, [students, searchTerm, selectedSchool, selectedGrade, selectedSection]);

  useEffect(() => {
    // Extract grades and sections from school service details
    if (mentor?.assignedSchools && mentor.assignedSchools.length > 0) {
      // Use the first school for now (can be enhanced to handle multiple schools)
      const firstSchool = mentor.assignedSchools[0];
      if (firstSchool?.serviceDetails?.grades) {
        const gradesFromService = firstSchool.serviceDetails.grades;
        
        // Extract unique grades
        const grades = gradesFromService.map(g => `Grade ${g.grade}`).sort();
        setAvailableGrades(grades);
        
        // Extract all unique sections from all grades
        const allSections = new Set<string>();
        gradesFromService.forEach(g => {
          g.sections?.forEach(section => allSections.add(section));
        });
        setAvailableSections(Array.from(allSections).sort());
      }
    }
  }, [mentor]);

  const fetchMentorProfile = async () => {
    try {
      const response = await mentorService.getMyProfile();
      if (response.success) {
        setMentor(response.data);
      }
    } catch (error) {
      console.error("Error fetching mentor profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    if (!mentor || !mentor.assignedSchools || mentor.assignedSchools.length === 0) {
      setLoading(false);
      return;
    }

    try {
      // Fetch students - backend will automatically filter by mentor's assigned schools
      const response = await studentService.getAll();
      if (response.success) {
        setStudents(response.data);
      }
    } catch (error) {
      console.error("Error fetching students:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterStudents = () => {
    let filtered = students;

    // Filter by school
    if (selectedSchool !== "all") {
      filtered = filtered.filter((student) => student.school._id === selectedSchool);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (student) =>
          student.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.studentId.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by grade
    if (selectedGrade !== "all") {
      // Extract number from "Grade X" format
      const gradeNumber = parseInt(selectedGrade.replace("Grade ", ""));
      filtered = filtered.filter((student) => student.grade === gradeNumber);
    }

    // Filter by section
    if (selectedSection !== "all") {
      filtered = filtered.filter((student) => student.section === selectedSection);
    }

    setFilteredStudents(filtered);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading students...</p>
        </div>
      </div>
    );
  }

  if (!mentor) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-muted-foreground">Mentor profile not found</p>
        </div>
      </div>
    );
  }

  if (!mentor.assignedSchools || mentor.assignedSchools.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-muted-foreground">No school assigned to you</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">My Students</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            {selectedSchool === "all" 
              ? `View students from all your assigned schools (${mentor.assignedSchools.length} schools)`
              : `View students from ${mentor.assignedSchools.find(s => s._id === selectedSchool)?.name || 'selected school'}`
            }
          </p>
        </div>
      </div>

      {/* School Info - inline, no card */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm md:text-base text-muted-foreground">
          <MapPin className="h-4 w-4 md:h-5 md:w-5 text-primary shrink-0" />
          <span className="font-medium text-foreground">Assigned Schools ({mentor.assignedSchools.length})</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {mentor.assignedSchools.map((school, index) => (
            <div key={school._id} className="flex items-center gap-1 text-xs md:text-sm text-muted-foreground bg-muted/50 px-2 py-1 rounded">
              <span className="font-medium text-foreground">{school.name}</span>
              {school.branchName && (
                <span>• {school.branchName}</span>
              )}
              <span>• {school.city}, {school.state}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-row flex-wrap items-center gap-3 md:gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 text-sm"
            />
          </div>
        </div>

        <Select value={selectedSchool} onValueChange={setSelectedSchool}>
          <SelectTrigger className="w-[180px] text-sm">
            <SelectValue placeholder="School" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Schools</SelectItem>
            {mentor?.assignedSchools.map((school) => (
              <SelectItem key={school._id} value={school._id}>
                {school.name}
                {school.branchName && ` - ${school.branchName}`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedGrade} onValueChange={setSelectedGrade}>
          <SelectTrigger className="w-[130px] text-sm">
            <SelectValue placeholder="Grade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Grades</SelectItem>
            {availableGrades.map((grade) => (
              <SelectItem key={grade} value={grade}>
                {grade}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedSection} onValueChange={setSelectedSection}>
          <SelectTrigger className="w-[130px] text-sm">
            <SelectValue placeholder="Section" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sections</SelectItem>
            {availableSections.map((section) => (
              <SelectItem key={section} value={section}>
                {section}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <button
          onClick={() => {
            setSelectedSchool("all");
            setSelectedGrade("all");
            setSelectedSection("all");
            setSearchTerm("");
          }}
          className="px-3 py-2 text-sm border rounded-md hover:bg-muted/50 transition-colors"
        >
          Clear Filters
        </button>
      </div>

      {/* Selection Summary */}
      <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
        <div className="flex items-center gap-2">
          <div className="text-sm font-medium">
            {selectedSchool === "all" ? (
              <span>Showing students from all schools</span>
            ) : (
              <span>
                Showing students from{" "}
                <span className="font-semibold text-primary">
                  {mentor.assignedSchools.find(s => s._id === selectedSchool)?.name}
                </span>
              </span>
            )}
          </div>
        </div>
        <div className="text-sm text-muted-foreground">
          {filteredStudents.length} of {students.length} students
        </div>
      </div>

      {/* Students Table */}
      <Card>
        <CardContent className="p-0">
          {filteredStudents.length === 0 ? (
            <div className="p-6 md:p-8 text-center">
              <User className="h-10 w-10 md:h-12 md:w-12 text-muted-foreground mx-auto mb-3 md:mb-4" />
              <h3 className="text-base md:text-lg font-semibold mb-2">No students found</h3>
              <p className="text-sm text-muted-foreground">
                {students.length === 0
                  ? "No students are enrolled in your assigned schools yet."
                  : selectedSchool === "all"
                  ? "No students match your current filters. Try adjusting your search or filter criteria."
                  : "No students found in the selected school. Try selecting a different school or clear filters to see all students."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs md:text-sm">Student Name</TableHead>
                    <TableHead className="text-xs md:text-sm hidden md:table-cell">Student ID</TableHead>
                    <TableHead className="text-xs md:text-sm hidden lg:table-cell">Email</TableHead>
                    <TableHead className="text-xs md:text-sm">Grade - Section</TableHead>
                    <TableHead className="text-xs md:text-sm">Status</TableHead>
                    <TableHead className="text-xs md:text-sm hidden sm:table-cell">Added Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.map((student) => (
                    <TableRow key={student._id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 md:w-8 md:h-8 shrink-0">
                            <ProfilePictureDisplay
                              profilePicture={student.user.profilePicture}
                              name={student.user.name}
                              size="sm"
                            />
                          </div>
                          <span className="text-xs md:text-sm truncate max-w-[120px] md:max-w-none">
                            {student.user.name}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-xs md:text-sm hidden md:table-cell">
                        {student.studentId}
                      </TableCell>
                      <TableCell className="text-xs md:text-sm hidden lg:table-cell truncate max-w-[180px]">
                        {student.user.email}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <GraduationCap className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground shrink-0" />
                          <span className="text-xs md:text-sm font-medium whitespace-nowrap">
                            {student.grade}-{student.section || 'N/A'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            student.user.isVerified ? "default" : "secondary"
                          }
                          className="text-xs"
                        >
                          {student.user.isVerified ? "Verified" : "Pending"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs md:text-sm text-muted-foreground hidden sm:table-cell">
                        {new Date(student.user.createdAt).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric',
                          year: '2-digit'
                        })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
