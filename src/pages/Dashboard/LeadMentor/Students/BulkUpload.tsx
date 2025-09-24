import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Upload, Download, FileSpreadsheet, CheckCircle, XCircle } from "lucide-react";
import axiosInstance from "@/api/axiosInstance";
import { schoolService, type School } from "@/api/schoolService";
import { useStudentsPath } from "@/utils/navigation";

interface BulkUploadResult {
  successful: Array<{
    name: string;
    studentId: string;
    email: string;
    school: string;
    grade: string;
    hasCustomCredentials: boolean;
    generatedPassword?: string;
  }>;
  errors: string[];
  totalProcessed: number;
  successCount: number;
  errorCount: number;
}

export default function BulkUploadPage() {
  const navigate = useNavigate();
  const studentsPath = useStudentsPath();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [generateCredentials, setGenerateCredentials] = useState(false);
  const [uploadResult, setUploadResult] = useState<BulkUploadResult | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [schools, setSchools] = useState<School[]>([]);
  const [selectedSchool, setSelectedSchool] = useState<string>("");
  const [loadingSchools, setLoadingSchools] = useState(true);

  // Load schools on component mount
  useEffect(() => {
    const loadSchools = async () => {
      try {
        const response = await schoolService.getAll();
        if (response.success) {
          setSchools(response.data);
        }
      } catch (error) {
        console.error("Error loading schools:", error);
      } finally {
        setLoadingSchools(false);
      }
    };

    loadSchools();
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setUploadResult(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !selectedSchool) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("generateCredentials", generateCredentials.toString());
      formData.append("schoolId", selectedSchool);

      const response = await axiosInstance.post("/students/bulk-upload", formData);
      setUploadResult(response.data.data);
    } catch (error: any) {
      console.error("Error uploading students:", error);
      alert(error.response?.data?.message || "Failed to upload students");
    } finally {
      setLoading(false);
    }
  };

  const downloadTemplate = () => {
    // Create a sample Excel template
    const templateData = [
      {
        name: "John Doe",
        grade: "Grade 10",
        loginId: "john@example.com", // Optional
        parentEmail: "parent@example.com", // Optional
        parentPhoneNumber: "1234567890" // Optional
      },
      {
        name: "Jane Smith",
        grade: "Grade 5",
        loginId: "", // Leave empty for system-generated
        parentEmail: "",
        parentPhoneNumber: ""
      }
    ];

    // Convert to CSV for simplicity (in a real app, you'd use a library like xlsx)
    const csvContent = [
      "name,grade,loginId,parentEmail,parentPhoneNumber",
      ...templateData.map(row => 
        `${row.name},${row.grade},${row.loginId},${row.parentEmail},${row.parentPhoneNumber}`
      )
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.style.display = "none";
    a.href = url;
    a.download = "student_template.csv";
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const downloadResults = () => {
    if (!uploadResult) return;

    const csvContent = [
      "Name,Student ID,Login ID,School,Grade,Generated Password,Status",
      ...uploadResult.successful.map(student => 
        `${student.name},${student.studentId},${student.email},${student.school},${student.grade},${student.generatedPassword || "N/A"},Success`
      )
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.style.display = "none";
    a.href = url;
    a.download = "upload_results.csv";
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
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
          <h1 className="text-3xl font-bold text-gray-900">Bulk Upload Students</h1>
          <p className="text-gray-600">Upload multiple students using Excel file</p>
        </div>
      </div>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Upload Instructions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-2">Option 1: With Login ID & Phone</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Include student/parent login ID and phone number</li>
                <li>• Setup links will be sent to provided emails</li>
                <li>• Students can set their own passwords</li>
                <li>• Better for schools with digital communication</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Option 2: System Generated</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Leave login ID and phone fields empty</li>
                <li>• System generates unique student IDs</li>
                <li>• Common password for all students</li>
                <li>• Download credentials list for school distribution</li>
              </ul>
            </div>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Required Excel Columns:</h4>
            <div className="text-sm text-blue-800">
              <strong>Required:</strong> name, grade<br />
              <strong>Optional:</strong> loginId, parentEmail, parentPhoneNumber<br />
              <strong>Note:</strong> School will be selected from the dropdown below
            </div>
          </div>

          <Button
            variant="outline"
            onClick={downloadTemplate}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Download Template
          </Button>
        </CardContent>
      </Card>

      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle>Upload Students</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="school">Select School</Label>
            {loadingSchools ? (
              <div className="text-sm text-gray-500">Loading schools...</div>
            ) : (
              <Select value={selectedSchool} onValueChange={setSelectedSchool}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a school" />
                </SelectTrigger>
                <SelectContent>
                  {schools.map((school) => (
                    <SelectItem key={school._id} value={school._id}>
                      {school.name} - {school.city}, {school.state}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {selectedSchool && (
              <p className="text-sm text-green-600">
                School selected: {schools.find(s => s._id === selectedSchool)?.name}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="file">Select Excel File</Label>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileSelect}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {selectedFile && (
              <p className="text-sm text-green-600">
                Selected: {selectedFile.name}
              </p>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="generateCredentials"
              checked={generateCredentials}
              onCheckedChange={(checked) => setGenerateCredentials(checked as boolean)}
            />
            <Label htmlFor="generateCredentials" className="text-sm">
              Generate User IDs and passwords (use when school doesn't provide login ID/phone)
            </Label>
          </div>

          <Button
            onClick={handleUpload}
            disabled={!selectedFile || !selectedSchool || loading}
            className="flex items-center gap-2"
          >
            {loading ? (
              "Uploading..."
            ) : (
              <>
                <Upload className="h-4 w-4" />
                Upload Students
              </>
            )}
          </Button>
          
          {(!selectedSchool || !selectedFile) && (
            <p className="text-sm text-amber-600">
              Please select both a school and an Excel file to upload.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      {uploadResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Upload Results
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {uploadResult.totalProcessed}
                </div>
                <div className="text-sm text-blue-800">Total Processed</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {uploadResult.successCount}
                </div>
                <div className="text-sm text-green-800">Successful</div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">
                  {uploadResult.errorCount}
                </div>
                <div className="text-sm text-red-800">Errors</div>
              </div>
            </div>

            {uploadResult.errors.length > 0 && (
              <div className="bg-red-50 p-4 rounded-lg">
                <h4 className="font-medium text-red-900 mb-2 flex items-center gap-2">
                  <XCircle className="h-4 w-4" />
                  Errors
                </h4>
                <ul className="text-sm text-red-800 space-y-1">
                  {uploadResult.errors.map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              </div>
            )}

            {uploadResult.successCount > 0 && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={downloadResults}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download Results
                </Button>
                <Button
                  onClick={() => navigate(studentsPath)}
                  className="flex items-center gap-2"
                >
                  View Students
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
