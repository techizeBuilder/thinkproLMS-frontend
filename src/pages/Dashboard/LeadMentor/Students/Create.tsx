import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Plus } from "lucide-react";
import axiosInstance from "@/api/axiosInstance";
import { useStudentsPath } from "@/utils/navigation";

interface School {
  _id: string;
  name: string;
  city: string;
  state: string;
  board: string;
  branchName?: string;
}

export default function CreateStudentPage() {
  const navigate = useNavigate();
  const studentsPath = useStudentsPath();
  const [loading, setLoading] = useState(false);
  const [schools, setSchools] = useState<School[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    schoolId: "",
    grade: "",
    email: "",
    parentEmail: "",
    parentPhoneNumber: "",
  });

  const grades = ["Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", 
                  "Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10"];

  useEffect(() => {
    fetchSchools();
  }, []);

  const fetchSchools = async () => {
    try {
      const response = await axiosInstance.get("/schools");
      setSchools(response.data.data);
    } catch (error) {
      console.error("Error fetching schools:", error);
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
      await axiosInstance.post("/students", formData);
      navigate(studentsPath);
    } catch (error: any) {
      console.error("Error creating student:", error);
      alert(error.response?.data?.message || "Failed to create student");
    } finally {
      setLoading(false);
    }
  };

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
          <h1 className="text-3xl font-bold text-gray-900">Add Student</h1>
          <p className="text-gray-600">Create a new student account</p>
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
                <Label htmlFor="email">Student Email (Optional)</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="student@example.com"
                />
                <p className="text-xs text-gray-500">
                  If not provided, system will generate email and password
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="schoolId">School *</Label>
                <select
                  id="schoolId"
                  name="schoolId"
                  value={formData.schoolId}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select School</option>
                  {schools.map(school => (
                    <option key={school._id} value={school._id}>
                      {school.name} - {school.city}, {school.state}
                    </option>
                  ))}
                </select>
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Parent/Guardian Information</CardTitle>
            <p className="text-sm text-gray-600">
              Parent information is optional but recommended for better communication
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

        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Account Setup Information</h4>
          <div className="text-sm text-blue-800 space-y-1">
            <p>• If student/parent email is provided, a setup link will be sent to create the password.</p>
            <p>• If no email is provided, system will generate a student ID and common password.</p>
            <p>• Generated credentials can be downloaded later for sharing with the school.</p>
          </div>
        </div>

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
              "Creating..."
            ) : (
              <>
                <Plus className="h-4 w-4" />
                Create Student
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
