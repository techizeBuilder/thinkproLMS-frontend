import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Save } from "lucide-react";
import axiosInstance from "@/api/axiosInstance";
import { useStudentsPath } from "@/utils/navigation";

interface Student {
  _id: string;
  user: {
    name: string;
    email: string;
  };
  school: {
    _id: string;
    name: string;
  };
  studentId: string;
  grade: string;
  parentEmail?: string;
  parentPhoneNumber?: string;
  hasCustomCredentials: boolean;
}

export default function EditStudentPage() {
  const navigate = useNavigate();
  const studentsPath = useStudentsPath();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const [fetchingStudent, setFetchingStudent] = useState(true);
  const [student, setStudent] = useState<Student | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    grade: "",
    parentEmail: "",
    parentPhoneNumber: "",
  });

  const grades = ["Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", 
                  "Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10"];

  useEffect(() => {
    if (id) {
      fetchStudent();
    }
  }, [id]);

  const fetchStudent = async () => {
    try {
      const response = await axiosInstance.get(`/students/${id}`);
      const studentData = response.data.data;
      setStudent(studentData);
      setFormData({
        name: studentData.user.name,
        grade: studentData.grade,
        parentEmail: studentData.parentEmail || "",
        parentPhoneNumber: studentData.parentPhoneNumber || "",
      });
    } catch (error) {
      console.error("Error fetching student:", error);
      navigate(studentsPath);
    } finally {
      setFetchingStudent(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axiosInstance.put(`/students/${id}`, formData);
      navigate(studentsPath);
    } catch (error: any) {
      console.error("Error updating student:", error);
      alert(error.response?.data?.message || "Failed to update student");
    } finally {
      setLoading(false);
    }
  };

  if (fetchingStudent) {
    return <div className="p-6">Loading student...</div>;
  }

  if (!student) {
    return <div className="p-6">Student not found</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          onClick={() => navigate(studentsPath)}
          className="p-2"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Student</h1>
          <p className="text-gray-600">Update student information</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Student Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Student Name *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter student name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="grade">Grade *</Label>
                <select
                  id="grade"
                  name="grade"
                  value={formData.grade}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Grade</option>
                  {grades.map(grade => (
                    <option key={grade} value={grade}>
                      {grade}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Read-only fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Student ID</Label>
                <Input
                  value={student.studentId}
                  disabled
                  className="bg-gray-50"
                />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  value={student.user.email}
                  disabled
                  className="bg-gray-50"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>School</Label>
              <Input
                value={student.school.name}
                disabled
                className="bg-gray-50"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Parent/Guardian Information</CardTitle>
            <p className="text-sm text-gray-600">
              Update parent contact information
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="parentEmail">Parent Email</Label>
                <Input
                  id="parentEmail"
                  name="parentEmail"
                  type="email"
                  value={formData.parentEmail}
                  onChange={handleInputChange}
                  placeholder="parent@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="parentPhoneNumber">Parent Phone Number</Label>
                <Input
                  id="parentPhoneNumber"
                  name="parentPhoneNumber"
                  value={formData.parentPhoneNumber}
                  onChange={handleInputChange}
                  placeholder="Enter parent phone number"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(studentsPath)}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2"
          >
            {loading ? (
              "Updating..."
            ) : (
              <>
                <Save className="h-4 w-4" />
                Update Student
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
