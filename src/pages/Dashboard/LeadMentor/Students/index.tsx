import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
import { useAuth } from "@/contexts/AuthContext";
import { studentService } from "@/api/studentService";

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
  grade: number;
  section: string;
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
  const [statusFilter, setStatusFilter] = useState<string>("active");
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
  const { user } = useAuth();
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);

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
  }, [statusFilter]);

  useEffect(() => {
    filterStudents();
  }, [students, searchTerm, selectedSchool, selectedGrade]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const includeInactive =
        statusFilter === "all" || statusFilter === "inactive";
      const response = await studentService.getAll({ includeInactive });
      if (response.success) {
        let filteredData = response.data;

        // Apply client-side filtering based on status
        if (statusFilter === "active") {
          filteredData = response.data.filter((student) => student.isActive);
        } else if (statusFilter === "inactive") {
          filteredData = response.data.filter((student) => !student.isActive);
        }
        // If statusFilter === "all", show all data

        setStudents(filteredData);
      }
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
      // Extract number from "Grade X" format
      const gradeNumber = parseInt(selectedGrade.replace("Grade ", ""));
      filtered = filtered.filter((student) => student.grade === gradeNumber);
    }

    setFilteredStudents(filtered);
  };

  const handleDelete = (id: string, name?: string) => {
    setConfirmDialog({
      isOpen: true,
      title: "Delete Student",
      message: `Are you sure you want to delete ${name ? name : "this student"}? This action cannot be undone.`,
      onConfirm: async () => {
        setConfirmDialog(null);
        try {
          await studentService.delete(id);
          setStudents((prev) => prev.filter((student) => student._id !== id));
        } catch (error) {
          console.error("Error deleting student:", error);
        }
      },
    });
  };

  const handleDeactivate = async (id: string) => {
    if (!confirm("Are you sure you want to deactivate this student?")) return;

    try {
      await studentService.deactivate(id);
      setStudents(students.filter((student) => student._id !== id));
    } catch (error) {
      console.error("Error deactivating student:", error);
    }
  };

  const handleActivate = async (id: string) => {
    if (!confirm("Are you sure you want to activate this student?")) return;

    try {
      await studentService.activate(id);
      setStudents(students.filter((student) => student._id !== id));
    } catch (error) {
      console.error("Error activating student:", error);
    }
  };

  const handleDownload = async (format: "excel" | "pdf" = "excel") => {
    try {
      const queryParams = new URLSearchParams();
      if (selectedSchool) queryParams.append("schoolId", selectedSchool);
      queryParams.append("format", format);

      const response = await axiosInstance.get(
        "/students/download?" + queryParams.toString(),
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
        "/students/" + studentId + "/password"
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
    <div className="space-y-3 sm:space-y-4 lg:space-y-6">
      {/* Header */}
      <div className="space-y-2 sm:space-y-3 lg:space-y-4">
        <div>
          <h1 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-gray-900">
            Students
          </h1>
          <p className="text-xs sm:text-sm lg:text-base text-gray-600">
            Manage student accounts and records
          </p>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 lg:flex lg:flex-wrap lg:gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(studentsPath + "/promote")}
            className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm touch-manipulation h-8 sm:h-9"
          >
            <ArrowUp className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden xs:inline">Promote Grade</span>
            <span className="xs:hidden">Promote</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(studentsPath + "/bulk-upload")}
            className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm touch-manipulation h-8 sm:h-9"
          >
            <Upload className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden xs:inline">Bulk Upload</span>
            <span className="xs:hidden">Upload</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleDownload("excel")}
            className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm touch-manipulation h-8 sm:h-9"
          >
            <Download className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden xs:inline">Download List</span>
            <span className="xs:hidden">Download</span>
          </Button>
          <Button
            size="sm"
            onClick={() => navigate(studentsPath + "/create")}
            className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm touch-manipulation h-8 sm:h-9"
          >
            <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden xs:inline">Add Student</span>
            <span className="xs:hidden">Add</span>
          </Button>
        </div>

        {/* Summary Stats */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4"></div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-3 sm:p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-4">
            <div className="relative w-full md:max-w-xs">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search students by name, email, student ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 text-sm sm:text-base h-9 sm:h-10 w-full"
              />
            </div>
            <div className="w-full md:max-w-xs">
              <Select
                value={selectedSchool || "all"}
                onValueChange={(value) =>
                  setSelectedSchool(value === "all" ? "" : value)
                }
              >
                <SelectTrigger className="w-full px-3 py-2 text-sm sm:text-base h-9 sm:h-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <SelectValue placeholder="All Schools" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Schools</SelectItem>
                  {schools.map((school) => (
                    <SelectItem key={school._id} value={school._id}>
                      {school.name} - {school.city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-full md:max-w-xs">
              <Select
                value={selectedGrade || "all"}
                onValueChange={(value) =>
                  setSelectedGrade(value === "all" ? "" : value)
                }
              >
                <SelectTrigger className="w-full px-3 py-2 text-sm sm:text-base h-9 sm:h-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <SelectValue placeholder="All Grades" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Grades</SelectItem>
                  {grades.map((grade) => (
                    <SelectItem key={grade} value={grade}>
                      {grade}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-full md:max-w-[128px]">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full px-3 py-2 text-sm sm:text-base h-9 sm:h-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Desktop Table View */}
      <div className="hidden xl:block">
        <div className="overflow-x-auto rounded-lg border border-[var(--border)] bg-card">
          <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="sticky left-0 bg-background z-10 min-w-[200px]">
                      Student
                    </TableHead>
                    <TableHead className="min-w-[120px]">Student ID</TableHead>
                    <TableHead className="min-w-[180px]">Email</TableHead>
                    <TableHead className="min-w-[140px]">
                      Grade - Section
                    </TableHead>
                    <TableHead className="min-w-[200px]">School</TableHead>
                    <TableHead className="min-w-[150px]">Parent Info</TableHead>
                    <TableHead className="min-w-[120px]">Password</TableHead>
                    <TableHead className="text-right min-w-[120px]">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.map((student) => (
                    <TableRow
                      key={student._id}
                      className={!student.isActive ? "opacity-60" : ""}
                    >
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
                            <div className="flex items-center gap-2">
                              <div className="font-medium truncate">
                                {student.user.name}
                              </div>
                              {!student.isActive && (
                                <Badge variant="outline" className="text-xs">
                                  Inactive
                                </Badge>
                              )}
                            </div>
                            <div className="flex gap-1 mt-1 flex-wrap">
                              <Badge
                                variant={
                                  student.user.isVerified
                                    ? "default"
                                    : "secondary"
                                }
                                className="text-xs truncate max-w-[80px]"
                              >
                                {student.user.isVerified
                                  ? "Verified"
                                  : "Pending"}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-sm">
                          {student.studentId}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{student.user.email}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <GraduationCap className="h-4 w-4" />
                          <span className="font-medium">
                            Grade {student.grade} -{" "}
                            {student.section || "No Section"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium">
                            {student.school.name}
                          </div>
                          <div className="text-gray-500">
                            {student.school.city}, {student.school.state}
                          </div>
                          <div className="text-xs text-gray-400">
                            {student.school.boards &&
                            student.school.boards.length > 0
                              ? student.school.boards.join(", ")
                              : "No boards"}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {student.parentEmail || student.parentPhoneNumber ? (
                          <div className="text-sm">
                            <div>{student.parentEmail}</div>
                            {student.parentPhoneNumber && (
                              <div className="text-gray-500">
                                {student.parentPhoneNumber}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">
                            No parent info
                          </span>
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
                          editUrl={studentsPath + "/" + student._id + "/edit"}
                          onResetPassword={() =>
                            setResetPasswordUser({
                              id: student.user._id,
                              name: student.user.name,
                              email: student.user.email,
                            })
                          }
                          onDelete={user?.role === "superadmin" ? () => handleDelete(student._id, student.user.name) : undefined}
                          onToggleStatus={student.isActive ? () => handleDeactivate(student._id) : () => handleActivate(student._id)}
                          isActive={student.isActive}
                          isSuperAdmin={user?.role === "superadmin"}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
          </Table>
        </div>
      </div>

      {/* Mobile/Tablet Card View */}
      <div className="xl:hidden">
        <div className="grid gap-3 sm:gap-4">
          {filteredStudents.map((student) => (
            <Card
              key={student._id}
              className={!student.isActive ? "opacity-60" : ""}
            >
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-start justify-between mb-2 sm:mb-3">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0">
                      <ProfilePictureDisplay
                        profilePicture={student.user.profilePicture}
                        name={student.user.name}
                        size="sm"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <div className="font-medium text-sm sm:text-base truncate">
                          {student.user.name}
                        </div>
                        {!student.isActive && (
                          <Badge variant="outline" className="text-xs">
                            Inactive
                          </Badge>
                        )}
                      </div>
                      <div className="flex gap-1 mt-1 flex-wrap">
                        <Badge
                          variant={
                            student.user.isVerified ? "default" : "secondary"
                          }
                          className="text-xs"
                        >
                          {student.user.isVerified ? "Verified" : "Pending"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <MobileActions
                    editUrl={studentsPath + "/" + student._id + "/edit"}
                    onResetPassword={() =>
                      setResetPasswordUser({
                        id: student.user._id,
                        name: student.user.name,
                        email: student.user.email,
                      })
                    }
                    onDelete={user?.role === "superadmin" ? () => handleDelete(student._id, student.user.name) : undefined}
                    onToggleStatus={student.isActive ? () => handleDeactivate(student._id) : () => handleActivate(student._id)}
                    isActive={student.isActive}
                    isSuperAdmin={user?.role === "superadmin"}
                  />
                </div>

                <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Student ID:</span>
                    <span className="font-mono text-xs sm:text-sm">
                      {student.studentId}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-gray-600 w-16 sm:w-20 flex-shrink-0">
                      Email:
                    </span>
                    <span className="truncate text-xs sm:text-sm">
                      {student.user.email}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <GraduationCap className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500 mr-1 sm:mr-2 flex-shrink-0" />
                    <span className="font-medium text-xs sm:text-sm">
                      Grade {student.grade} - {student.section || "No Section"}
                    </span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-gray-600 w-16 sm:w-20 flex-shrink-0">
                      School:
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="font-medium truncate text-xs sm:text-sm">
                        {student.school.name}
                      </div>
                      <div className="text-gray-500 text-[10px] sm:text-xs">
                        {student.school.city}, {student.school.state}
                      </div>
                    </div>
                  </div>
                  {(student.parentEmail || student.parentPhoneNumber) && (
                    <div className="flex items-start">
                      <span className="text-gray-600 w-16 sm:w-20 flex-shrink-0">
                        Parent:
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-xs sm:text-sm">
                          {student.parentEmail}
                        </div>
                        {student.parentPhoneNumber && (
                          <div className="text-gray-500 text-[10px] sm:text-xs">
                            {student.parentPhoneNumber}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Password:</span>
                    {showPassword[student._id] ? (
                      <div className="text-[10px] sm:text-xs text-green-600 font-mono bg-green-50 p-1 rounded border">
                        {showPassword[student._id]}
                      </div>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleShowPassword(student._id)}
                        disabled={loadingPassword[student._id]}
                        className="text-blue-600 hover:text-blue-700 h-5 sm:h-6 px-1 sm:px-2 touch-manipulation"
                        title="Show password"
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {filteredStudents.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-500 text-sm md:text-base">
              No students found
            </p>
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

      {/* Confirmation Dialog */}
      <AlertDialog open={confirmDialog?.isOpen || false} onOpenChange={(open) => !open && setConfirmDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{confirmDialog?.title}</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmDialog?.message}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDialog?.onConfirm} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
