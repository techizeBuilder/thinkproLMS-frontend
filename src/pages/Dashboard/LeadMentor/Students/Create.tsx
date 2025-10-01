import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ArrowLeft, Plus } from "lucide-react";
import axiosInstance from "@/api/axiosInstance";
import { useStudentsPath } from "@/utils/navigation";
import { schoolService, type AvailableGrade } from "@/api/schoolService";

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
  const [availableGrades, setAvailableGrades] = useState<AvailableGrade[]>([]);
  const [hasServiceDetails, setHasServiceDetails] = useState(false);
  const [availableSections, setAvailableSections] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    schoolId: "",
    grade: "",
    section: "",
    email: "",
    parentEmail: "",
    parentPhoneNumber: "",
  });
  const [creationMethod, setCreationMethod] = useState<"invite" | "credentials">("invite");
  const [password, setPassword] = useState("");

  const allGrades = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

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

  const fetchSchoolServiceDetails = async (schoolId: string) => {
    try {
      const response = await schoolService.getServiceDetails(schoolId);
      if (response.success) {
        setAvailableGrades(response.data.grades);
        setHasServiceDetails(response.data.hasServiceDetails);
      }
    } catch (error) {
      console.error("Error fetching school service details:", error);
      setAvailableGrades([]);
      setHasServiceDetails(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === "schoolId") {
      // Reset grade and section when school changes
      setFormData(prev => ({ ...prev, [name]: value, grade: "", section: "" }));
      setAvailableSections([]);
      // Fetch service details for the selected school
      if (value) {
        fetchSchoolServiceDetails(value);
      } else {
        setAvailableGrades([]);
        setHasServiceDetails(false);
      }
    } else if (name === "grade") {
      // Reset section when grade changes and update available sections
      setFormData(prev => ({ ...prev, [name]: value, section: "" }));
      
      if (value && hasServiceDetails) {
        // Find the selected grade in available grades and get its sections
        // Convert form value (string) to number for comparison
        const gradeNumber = parseInt(value, 10);
        const selectedGradeData = availableGrades.find(gradeData => gradeData.grade === gradeNumber);
        setAvailableSections(selectedGradeData?.sections || []);
      } else {
        setAvailableSections([]);
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Convert grade to number (form values are strings)
      const gradeNumber = parseInt(formData.grade, 10);
      
      if (!gradeNumber || gradeNumber < 1 || gradeNumber > 10) {
        alert("Please select a valid grade (1-10)");
        setLoading(false);
        return;
      }

      const submitData = {
        ...formData,
        grade: gradeNumber,
        createWithCredentials: creationMethod === "credentials",
        password: creationMethod === "credentials" ? password : undefined,
      };
      
      await axiosInstance.post("/students", submitData);
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
                <Label htmlFor="email">Student Email/Login ID (Optional)</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="student@example.com"
                />
                <p className="text-xs text-gray-500">
                  If not provided, system will generate student ID and password. If provided, this will be used as login ID with generated password.
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
                  disabled={!formData.schoolId}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">{formData.schoolId ? "Select Grade" : "Select School First"}</option>
                  {hasServiceDetails ? (
                    availableGrades.map(gradeData => (
                      <option key={gradeData.grade} value={gradeData.grade}>
                        Grade {gradeData.grade}
                      </option>
                    ))
                  ) : (
                    allGrades.map(grade => (
                      <option key={grade} value={grade}>
                        Grade {grade}
                      </option>
                    ))
                  )}
                </select>
                {hasServiceDetails && availableGrades.length === 0 && (
                  <p className="text-xs text-amber-600">
                    No grades configured for this school. Please contact the school administrator.
                  </p>
                )}
                {!hasServiceDetails && formData.schoolId && (
                  <p className="text-xs text-gray-500">
                    This school has no service details configured. All grades are available.
                  </p>
                )}
                {!formData.schoolId && (
                  <p className="text-xs text-gray-500">
                    Please select a school first to choose a grade.
                  </p>
                )}
              </div>
            </div>

            {/* Section Selection */}
            {formData.grade && (
              <div className="space-y-2">
                <Label htmlFor="section">Section *</Label>
                <select
                  id="section"
                  name="section"
                  value={formData.section}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Section</option>
                  {hasServiceDetails ? (
                    availableSections.map(section => (
                      <option key={section} value={section}>
                        Section {section}
                      </option>
                    ))
                  ) : (
                    <option value="A">Section A</option>
                  )}
                </select>
                {hasServiceDetails && availableSections.length === 0 && (
                  <p className="text-xs text-amber-600">
                    No sections configured for this grade. Please contact the school administrator.
                  </p>
                )}
                {!hasServiceDetails && (
                  <p className="text-xs text-gray-500">
                    Default section A will be assigned.
                  </p>
                )}
              </div>
            )}
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
                <Label htmlFor="parentEmail">Parent Email (Optional)</Label>
                <Input
                  id="parentEmail"
                  name="parentEmail"
                  type="email"
                  value={formData.parentEmail}
                  onChange={handleInputChange}
                  placeholder="parent@example.com"
                />
                <p className="text-xs text-gray-500">
                  If provided, parent will receive setup email to create password for student
                </p>
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

        <Card>
          <CardHeader>
            <CardTitle>Account Creation Method</CardTitle>
            <p className="text-sm text-gray-600">
              Choose how the student account will be created
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <RadioGroup
              value={creationMethod}
              onValueChange={(value) => setCreationMethod(value as "invite" | "credentials")}
              className="space-y-3"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="invite" id="invite" />
                <Label htmlFor="invite" className="cursor-pointer">
                  <div>
                    <div className="font-medium">Send Email Invitation</div>
                    <div className="text-sm text-gray-500">
                      Student/parent will receive an email to set up their password
                    </div>
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="credentials" id="credentials" />
                <Label htmlFor="credentials" className="cursor-pointer">
                  <div>
                    <div className="font-medium">Create with Manual Credentials</div>
                    <div className="text-sm text-gray-500">
                      Student will be created with provided password and auto-verified
                    </div>
                  </div>
                </Label>
              </div>
            </RadioGroup>

            {creationMethod === "credentials" && (
              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password for the student"
                  required={creationMethod === "credentials"}
                />
                <p className="text-xs text-gray-500">
                  The student will be able to log in immediately with this password
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">What happens next?</h4>
          {creationMethod === "invite" ? (
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• If student/parent email is provided, a setup link will be sent to create the password</li>
              <li>• If no student ID is provided, system will generate a student ID and common password</li>
              <li>• Generated credentials can be downloaded later for sharing with the school</li>
            </ul>
          ) : (
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• The student account will be created immediately with the provided password</li>
              <li>• The student will be auto-verified and can log in right away</li>
              <li>• They can access the student portal immediately</li>
            </ul>
          )}
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
            disabled={loading || (creationMethod === "credentials" && !password)}
            className="flex items-center gap-2"
          >
            {loading ? (
              creationMethod === "invite" ? "Creating Student..." : "Creating Student..."
            ) : (
              <>
                <Plus className="h-4 w-4" />
                {creationMethod === "invite" ? "Create Student" : "Create Student"}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
