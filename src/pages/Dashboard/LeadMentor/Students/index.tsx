import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Plus,
  Search,
  Download,
  Upload,
  GraduationCap,
  Eye,
  ArrowUp,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "@/api/axiosInstance";
import { useStudentsPath } from "@/utils/navigation";
import { ResetPasswordDialog } from "@/components/ResetPasswordDialog";
import ProfilePictureDisplay from "@/components/ProfilePictureDisplay";
import { MobileActions } from "@/components/ui/mobile-actions";

interface School {
  _id: string;
  name: string;
  city: string;
  state: string;
  boards: string[];
  branchName?: string;
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
  school: School;
  studentId: string;
  grade: string;
  parentEmail?: string;
  parentPhoneNumber?: string;
  hasCustomCredentials: boolean;
  generatedPassword?: string;
  isActive: boolean;
}

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSchool, setSelectedSchool] = useState("");
  const [selectedGrade, setSelectedGrade] = useState("");
  const [schools, setSchools] = useState<School[]>([]);
  const [showPassword, setShowPassword] = useState<{ [key: string]: string }>(
    {}
  );
  const [loadingPassword, setLoadingPassword] = useState<{
    [key: string]: boolean;
  }>({});
  const [resetPasswordUser, setResetPasswordUser] = useState<{
    id: string;
    name: string;
    email: string;
  } | null>(null);
  const navigate = useNavigate();
  const studentsPath = useStudentsPath();

  const grades = [
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
  ];

  useEffect(() => {
    fetchStudents();
    fetchSchools();
  }, []);

  useEffect(() => {
    filterStudents();
  }, [students, searchTerm, selectedSchool, selectedGrade]);

  const fetchStudents = async () => {
    try {
      const response = await axiosInstance.get("/students");
      setStudents(response.data.data);
    } catch (error) {
      console.error("Error fetching students:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSchools = async () => {
    try {
      const response = await axiosInstance.get("/schools");
      console.log("School result in students page: ", response.data);
      setSchools(response.data.data);
    } catch (error) {
      console.error("Error fetching schools:", error);
    }
  };

  const filterStudents = () => {
    let filtered = students;

    if (searchTerm) {
      filtered = filtered.filter(
        (student) =>
          student.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (student.parentEmail &&
            student.parentEmail
              .toLowerCase()
              .includes(searchTerm.toLowerCase()))
      );
    }

    if (selectedSchool) {
      filtered = filtered.filter(
        (student) => student.school._id === selectedSchool
      );
    }

    if (selectedGrade) {
      filtered = filtered.filter((student) => student.grade === selectedGrade);
    }

    setFilteredStudents(filtered);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this student?")) return;

    try {
      await axiosInstance.delete(`/students/${id}`);
      setStudents(students.filter((student) => student._id !== id));
    } catch (error) {
      console.error("Error deleting student:", error);
    }
  };

  const handleDownload = async (format: "excel" | "pdf" = "excel") => {
    try {
      const queryParams = new URLSearchParams();
      if (selectedSchool) queryParams.append("schoolId", selectedSchool);
      queryParams.append("format", format);

      const response = await axiosInstance.get(
        `/students/download?${queryParams}`,
        {
          responseType: format === "excel" ? "blob" : "json",
        }
      );

      if (format === "excel") {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const a = document.createElement("a");
        a.style.display = "none";
        a.href = url;
        a.download = "students.xlsx";
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      } else {
        // Handle PDF generation on frontend
        console.log("PDF data:", response.data);
      }
    } catch (error) {
      console.error("Error downloading student list:", error);
    }
  };

  const handleShowPassword = async (studentId: string) => {
    setLoadingPassword((prev) => ({ ...prev, [studentId]: true }));
    try {
      const response = await axiosInstance.get(
        `/students/${studentId}/password`
      );
      console.log(response.data);
      const passwordData = response.data.data;
      setShowPassword((prev) => ({
        ...prev,
        [studentId]: passwordData.generatedPassword || "No password available",
      }));
    } catch (error: any) {
      console.error("Error fetching student password:", error);
      setShowPassword((prev) => ({
        ...prev,
        [studentId]: "Error loading password",
      }));
    } finally {
      setLoadingPassword((prev) => ({ ...prev, [studentId]: false }));
    }
  };

  if (loading) {
    return <div className="p-6">Loading students...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Students</h1>
          <p className="text-gray-600 text-sm md:text-base">Manage student accounts and records</p>
        </div>
        
        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`${studentsPath}/promote`)}
            className="flex items-center gap-2"
          >
            <ArrowUp className="h-4 w-4" />
            Promote Grade
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`${studentsPath}/bulk-upload`)}
            className="flex items-center gap-2"
          >
            <Upload className="h-4 w-4" />
            Bulk Upload
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleDownload("excel")}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Download List
          </Button>
          <Button
            size="sm"
            onClick={() => navigate(`${studentsPath}/create`)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Student
          </Button>
        </div>

        {/* Summary Stats - moved below buttons */}
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-gray-600">Total:</span>
            <span className="font-semibold text-blue-600">{students.length}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-600">Verified:</span>
            <span className="font-semibold text-green-600">{students.filter((s) => s.user.isVerified).length}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-600">Pending:</span>
            <span className="font-semibold text-orange-600">{students.filter((s) => !s.user.isVerified).length}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-600">Schools:</span>
            <span className="font-semibold text-purple-600">{new Set(students.map((s) => s.school._id)).size}</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search students by name, email, student ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={selectedSchool}
              onChange={(e) => setSelectedSchool(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Schools</option>
              {schools.map((school) => (
                <option key={school._id} value={school._id}>
                  {school.name} - {school.city}
                </option>
              ))}
            </select>
            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Grades</option>
              {grades.map((grade) => (
                <option key={grade} value={grade}>
                  {grade}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Students Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="sticky left-0 bg-background z-10 min-w-[200px]">Student</TableHead>
                  <TableHead className="min-w-[120px]">Student ID</TableHead>
                  <TableHead className="min-w-[180px]">Email</TableHead>
                  <TableHead className="min-w-[100px]">Grade</TableHead>
                  <TableHead className="min-w-[200px]">School</TableHead>
                  <TableHead className="min-w-[150px]">Parent Info</TableHead>
                  <TableHead className="min-w-[120px]">Password</TableHead>
                  <TableHead className="text-right min-w-[120px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
            {filteredStudents.map((student) => (
              <TableRow key={student._id}>
                <TableCell className="font-medium sticky left-0 bg-background z-10 min-w-[200px]">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 flex-shrink-0">
                      <ProfilePictureDisplay
                        profilePicture={student.user.profilePicture}
                        name={student.user.name}
                        size="sm"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-medium truncate">{student.user.name}</div>
                      <div className="flex gap-1 mt-1 flex-wrap">
                        <Badge
                          variant={
                            student.user.isVerified ? "default" : "secondary"
                          }
                          className="text-xs truncate max-w-[80px]"
                        >
                          {student.user.isVerified ? "Verified" : "Pending"}
                        </Badge>
                        {!student.hasCustomCredentials && (
                          <Badge variant="outline" className="text-xs truncate max-w-[100px]">System Generated</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="font-mono text-sm">{student.studentId}</span>
                </TableCell>
                <TableCell>
                  <span className="text-sm">{student.user.email}</span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-sm">
                    <GraduationCap className="h-4 w-4" />
                    {student.grade}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    <div className="font-medium">{student.school.name}</div>
                    <div className="text-gray-500">
                      {student.school.city}, {student.school.state}
                    </div>
                    <div className="text-xs text-gray-400">
                      {student.school.boards && student.school.boards.length > 0 
                        ? student.school.boards.join(", ") 
                        : "No boards"}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  {(student.parentEmail || student.parentPhoneNumber) ? (
                    <div className="text-sm">
                      <div>{student.parentEmail}</div>
                      {student.parentPhoneNumber && (
                        <div className="text-gray-500">{student.parentPhoneNumber}</div>
                      )}
                    </div>
                  ) : (
                    <span className="text-gray-400 text-sm">No parent info</span>
                  )}
                </TableCell>
                <TableCell>
                  {showPassword[student._id] ? (
                    <div className="text-sm text-green-600 font-mono bg-green-50 p-2 rounded border">
                      {showPassword[student._id]}
                    </div>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleShowPassword(student._id)}
                      disabled={loadingPassword[student._id]}
                      className="text-blue-600 hover:text-blue-700"
                      title="Show password"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <MobileActions
                    editUrl={`${studentsPath}/${student._id}/edit`}
                    onResetPassword={() =>
                      setResetPasswordUser({
                        id: student.user._id,
                        name: student.user.name,
                        email: student.user.email,
                      })
                    }
                    onDelete={() => handleDelete(student._id)}
                  />
                </TableCell>
              </TableRow>
            ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {filteredStudents.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-500">No students found</p>
          </CardContent>
        </Card>
      )}

      {/* Reset Password Dialog */}
      {resetPasswordUser && (
        <ResetPasswordDialog
          open={!!resetPasswordUser}
          onOpenChange={(open) => !open && setResetPasswordUser(null)}
          userId={resetPasswordUser.id}
          userName={resetPasswordUser.name}
          userEmail={resetPasswordUser.email}
        />
      )}
    </div>
  );
}
