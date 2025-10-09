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
  assignedSchool: School;
  isActive: boolean;
}

export default function MentorStudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [mentor, setMentor] = useState<Mentor | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGrade, setSelectedGrade] = useState("all");
  const [selectedSection, setSelectedSection] = useState("all");
  const [availableGrades, setAvailableGrades] = useState<string[]>([]);
  const [availableSections, setAvailableSections] = useState<string[]>([]);

  useEffect(() => {
    fetchMentorProfile();
  }, []);

  useEffect(() => {
    if (mentor && mentor.assignedSchool) {
      fetchStudents();
    }
  }, [mentor]);

  useEffect(() => {
    filterStudents();
  }, [students, searchTerm, selectedGrade, selectedSection]);

  useEffect(() => {
    // Extract grades and sections from school service details
    if (mentor?.assignedSchool?.serviceDetails?.grades) {
      const gradesFromService = mentor.assignedSchool.serviceDetails.grades;
      
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
    if (!mentor || !mentor.assignedSchool) {
      setLoading(false);
      return;
    }

    try {
      // Fetch students from assigned school
      const schoolId = mentor.assignedSchool._id;
      const response = await studentService.getAll({ schoolId });
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

  if (!mentor.assignedSchool) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-muted-foreground">No school assigned to you</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Students</h1>
          <p className="text-muted-foreground">
            View students from your assigned school
          </p>
        </div>
      </div>

      {/* School Info Banner */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                <div>
                  <h3 className="font-semibold text-lg">{mentor.assignedSchool.name}</h3>
                  {mentor.assignedSchool.branchName && (
                    <p className="text-sm text-muted-foreground">
                      {mentor.assignedSchool.branchName}
                    </p>
                  )}
                  <p className="text-sm text-muted-foreground">
                    {mentor.assignedSchool.city}, {mentor.assignedSchool.state}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search students by name, email, or roll number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <Select value={selectedGrade} onValueChange={setSelectedGrade}>
          <SelectTrigger className="w-full sm:w-[150px]">
            <SelectValue placeholder="Select Grade" />
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
          <SelectTrigger className="w-full sm:w-[150px]">
            <SelectValue placeholder="Select Section" />
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
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Students
                </p>
                <p className="text-2xl font-bold">{students.length}</p>
              </div>
              <User className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Filtered Results
                </p>
                <p className="text-2xl font-bold">{filteredStudents.length}</p>
              </div>
              <GraduationCap className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Students Table */}
      <Card>
        <CardContent className="p-0">
          {filteredStudents.length === 0 ? (
            <div className="p-8 text-center">
              <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No students found</h3>
              <p className="text-muted-foreground">
                {students.length === 0
                  ? "No students are enrolled in your assigned schools yet."
                  : "No students match your current filters."}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student Name</TableHead>
                  <TableHead>Student ID</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Grade - Section</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Added Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.map((student) => (
                  <TableRow key={student._id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8">
                          <ProfilePictureDisplay
                            profilePicture={student.user.profilePicture}
                            name={student.user.name}
                            size="sm"
                          />
                        </div>
                        {student.user.name}
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {student.studentId}
                    </TableCell>
                    <TableCell className="text-sm">
                      {student.user.email}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <GraduationCap className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">
                          Grade {student.grade} - {student.section || 'No Section'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          student.user.isVerified ? "default" : "secondary"
                        }
                      >
                        {student.user.isVerified ? "Verified" : "Pending"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(student.user.createdAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
