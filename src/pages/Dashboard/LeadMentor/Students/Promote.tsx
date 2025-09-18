import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ArrowLeft,
  ArrowUp,
  User,
  GraduationCap,
  School,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "@/api/axiosInstance";
import { toast } from "sonner";

interface School {
  _id: string;
  name: string;
  city: string;
  state: string;
  board: string;
  branchName?: string;
}

interface Student {
  _id: string;
  user: {
    name: string;
    email: string;
    isVerified: boolean;
    createdAt: string;
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

export default function PromoteGradePage() {
  const [schools, setSchools] = useState<School[]>([]);
  const [selectedSchool, setSelectedSchool] = useState("");
  const [selectedGrade, setSelectedGrade] = useState("");
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [promoting, setPromoting] = useState(false);
  const navigate = useNavigate();

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

  // Calculate next grade
  const getNextGrade = (currentGrade: string): string => {
    const gradeMap: { [key: string]: string } = {
      "Grade 1": "Grade 2",
      "Grade 2": "Grade 3",
      "Grade 3": "Grade 4",
      "Grade 4": "Grade 5",
      "Grade 5": "Grade 6",
      "Grade 6": "Grade 7",
      "Grade 7": "Grade 8",
      "Grade 8": "Grade 9",
      "Grade 9": "Grade 10",
      "Grade 10": "Grade 10", // Stay in Grade 10 if already at max
    };
    return gradeMap[currentGrade] || currentGrade;
  };

  useEffect(() => {
    fetchSchools();
  }, []);

  useEffect(() => {
    if (selectedSchool && selectedGrade) {
      fetchStudentsForPromotion();
    } else {
      setStudents([]);
      setSelectedStudents(new Set());
    }
  }, [selectedSchool, selectedGrade]);

  useEffect(() => {
    // Select all students by default when students list changes
    if (students.length > 0) {
      setSelectedStudents(new Set(students.map(student => student._id)));
    }
  }, [students]);

  const fetchSchools = async () => {
    try {
      const response = await axiosInstance.get("/schools");
      setSchools(response.data.data);
    } catch (error) {
      console.error("Error fetching schools:", error);
      toast.error("Failed to fetch schools");
    }
  };

  const fetchStudentsForPromotion = async () => {
    if (!selectedSchool || !selectedGrade) return;

    setLoading(true);
    try {
      const response = await axiosInstance.get(
        `/students/promotion?schoolId=${selectedSchool}&grade=${selectedGrade}`
      );
      setStudents(response.data.data);
    } catch (error) {
      console.error("Error fetching students for promotion:", error);
      toast.error("Failed to fetch students");
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedStudents(new Set(students.map(student => student._id)));
    } else {
      setSelectedStudents(new Set());
    }
  };

  const handleSelectStudent = (studentId: string, checked: boolean) => {
    const newSelected = new Set(selectedStudents);
    if (checked) {
      newSelected.add(studentId);
    } else {
      newSelected.delete(studentId);
    }
    setSelectedStudents(newSelected);
  };

  const handlePromote = async () => {
    if (selectedStudents.size === 0) {
      toast.error("Please select at least one student to promote");
      return;
    }

    if (selectedGrade === "Grade 10") {
      toast.error("Students are already at the highest grade (Grade 10)");
      return;
    }

    const confirmed = confirm(
      `Are you sure you want to promote ${selectedStudents.size} students from ${selectedGrade} to ${getNextGrade(selectedGrade)}?`
    );

    if (!confirmed) return;

    setPromoting(true);
    try {
      const response = await axiosInstance.post("/students/promote", {
        studentIds: Array.from(selectedStudents),
        schoolId: selectedSchool,
        currentGrade: selectedGrade,
      });

      toast.success(response.data.message);
      
      // Refresh the students list
      await fetchStudentsForPromotion();
      
      // Clear selection
      setSelectedStudents(new Set());
    } catch (error: any) {
      console.error("Error promoting students:", error);
      toast.error(error.response?.data?.message || "Failed to promote students");
    } finally {
      setPromoting(false);
    }
  };

  const isAllSelected = students.length > 0 && selectedStudents.size === students.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          onClick={() => navigate("/leadmentor/students")}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Students
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Promote Students</h1>
          <p className="text-gray-600">Promote students to the next grade level</p>
        </div>
      </div>

      {/* School and Grade Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <School className="h-5 w-5" />
            Select School and Grade
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                School
              </label>
              <select
                value={selectedSchool}
                onChange={(e) => setSelectedSchool(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a school</option>
                {schools.map((school) => (
                  <option key={school._id} value={school._id}>
                    {school.name} - {school.city}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Grade
              </label>
              <select
                value={selectedGrade}
                onChange={(e) => setSelectedGrade(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={!selectedSchool}
              >
                <option value="">Select a grade</option>
                {grades.slice(0, -1).map((grade) => ( // Exclude Grade 10 since it's the highest
                  <option key={grade} value={grade}>
                    {grade}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Students List */}
      {selectedSchool && selectedGrade && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Students in {selectedGrade}
                {students.length > 0 && (
                  <Badge variant="secondary">{students.length} students</Badge>
                )}
              </CardTitle>
              {students.length > 0 && (
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={isAllSelected}
                    onCheckedChange={handleSelectAll}
                  />
                  <span className="text-sm text-gray-600">Select All</span>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-600 mt-2">Loading students...</p>
              </div>
            ) : students.length === 0 ? (
              <div className="text-center py-8">
                <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No students found in {selectedGrade}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {students.map((student) => (
                  <div
                    key={student._id}
                    className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <Checkbox
                      checked={selectedStudents.has(student._id)}
                      onCheckedChange={(checked) =>
                        handleSelectStudent(student._id, checked as boolean)
                      }
                    />
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{student.user.name}</h3>
                        <Badge
                          variant={student.user.isVerified ? "default" : "secondary"}
                        >
                          {student.user.isVerified ? "Verified" : "Pending"}
                        </Badge>
                        {!student.hasCustomCredentials && (
                          <Badge variant="outline">System Generated</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                        <span className="font-mono">{student.studentId}</span>
                        <span>{student.user.email}</span>
                        <div className="flex items-center gap-1">
                          <GraduationCap className="h-4 w-4" />
                          {student.grade}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Promotion Action */}
      {selectedSchool && selectedGrade && students.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Promotion Summary
                </h3>
                <p className="text-gray-600">
                  {selectedStudents.size} of {students.length} students selected for promotion
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  From {selectedGrade} to {getNextGrade(selectedGrade)}
                </p>
              </div>
              <Button
                onClick={handlePromote}
                disabled={selectedStudents.size === 0 || promoting || selectedGrade === "Grade 10"}
                className="flex items-center gap-2"
              >
                {promoting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Promoting...
                  </>
                ) : (
                  <>
                    <ArrowUp className="h-4 w-4" />
                    Promote to {getNextGrade(selectedGrade)}
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Info Card */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900">Grade Promotion Information</h4>
              <ul className="text-sm text-blue-800 mt-2 space-y-1">
                <li>• All students are selected by default for promotion</li>
                <li>• You can uncheck individual students if needed</li>
                <li>• Students will be promoted from their current grade to the next grade</li>
                <li>• Grade 10 students cannot be promoted further</li>
                <li>• This action cannot be undone</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
