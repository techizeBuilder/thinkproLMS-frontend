import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  BookOpen, 
  Users, 
  Save,
  ArrowLeft
} from "lucide-react";
import { assessmentService, type Assessment } from "@/api/assessmentService";
import { toast } from "sonner";

export default function EditAssessmentPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    instructions: "",
    startDate: "",
    endDate: "",
    duration: 60,
    targetStudents: [] as Array<{ grade: string; sections: string[] }>,
  });

  useEffect(() => {
    const loadAssessment = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const response = await assessmentService.getAssessmentById(id);
        const assessmentData = response.data;
        setAssessment(assessmentData);
        
        // Populate form with existing data
        setFormData({
          title: assessmentData.title,
          instructions: assessmentData.instructions,
          startDate: new Date(assessmentData.startDate).toISOString().slice(0, 16),
          endDate: new Date(assessmentData.endDate).toISOString().slice(0, 16),
          duration: assessmentData.duration,
          targetStudents: assessmentData.targetStudents,
        });
      } catch (error) {
        console.error("Error loading assessment:", error);
        toast.error("Failed to load assessment");
        navigate("/mentor/assessments");
      } finally {
        setLoading(false);
      }
    };

    loadAssessment();
  }, [id, navigate]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleTargetStudentChange = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      targetStudents: prev.targetStudents.map((target, i) => 
        i === index ? { ...target, [field]: value } : target
      ),
    }));
  };

  const addTargetStudent = () => {
    setFormData(prev => ({
      ...prev,
      targetStudents: [...prev.targetStudents, { grade: "", sections: [] }],
    }));
  };

  const removeTargetStudent = (index: number) => {
    setFormData(prev => ({
      ...prev,
      targetStudents: prev.targetStudents.filter((_, i) => i !== index),
    }));
  };

  const handleSave = async () => {
    if (!id) return;

    try {
      setSaving(true);
      await assessmentService.updateAssessment(id, formData);
      toast.success("Assessment updated successfully");
      navigate(`/mentor/assessments/${id}`);
    } catch (error) {
      console.error("Error updating assessment:", error);
      toast.error("Failed to update assessment");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading assessment...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!assessment) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Assessment Not Found</h1>
          <p className="text-gray-600 mb-4">The assessment you're looking for doesn't exist.</p>
          <Button onClick={() => navigate("/mentor/assessments")}>
            Back to Assessments
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate(`/mentor/assessments/${id}`)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Edit Assessment</h1>
            <p className="text-gray-600">{assessment.title}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline"
            onClick={() => navigate(`/mentor/assessments/${id}`)}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            disabled={saving}
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BookOpen className="h-5 w-5 mr-2" />
                Assessment Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Assessment Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  placeholder="Enter assessment title"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="instructions">Instructions *</Label>
                <Textarea
                  id="instructions"
                  value={formData.instructions}
                  onChange={(e) => handleInputChange("instructions", e.target.value)}
                  placeholder="Enter instructions for students"
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date *</Label>
                  <Input
                    id="startDate"
                    type="datetime-local"
                    value={formData.startDate}
                    onChange={(e) => handleInputChange("startDate", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date *</Label>
                  <Input
                    id="endDate"
                    type="datetime-local"
                    value={formData.endDate}
                    onChange={(e) => handleInputChange("endDate", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (minutes) *</Label>
                  <Input
                    id="duration"
                    type="number"
                    min="1"
                    value={formData.duration}
                    onChange={(e) => handleInputChange("duration", parseInt(e.target.value))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Target Students */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Target Students
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.targetStudents.map((target, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium">Target Group {index + 1}</h4>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeTargetStudent(index)}
                    >
                      Remove
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Grade</Label>
                      <Select 
                        value={target.grade} 
                        onValueChange={(value) => handleTargetStudentChange(index, "grade", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select grade" />
                        </SelectTrigger>
                        <SelectContent>
                          {["Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", 
                            "Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10"].map(grade => (
                            <SelectItem key={grade} value={grade}>{grade}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Sections (optional)</Label>
                      <Input
                        placeholder="e.g., A, B, C (comma separated)"
                        value={target.sections.join(", ")}
                        onChange={(e) => {
                          const sections = e.target.value.split(",").map(s => s.trim()).filter(s => s);
                          handleTargetStudentChange(index, "sections", sections);
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
              <Button variant="outline" onClick={addTargetStudent}>
                Add Target Group
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Assessment Info */}
          <Card>
            <CardHeader>
              <CardTitle>Assessment Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Grade:</span>
                <span className="font-medium">{assessment.grade}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Subject:</span>
                <span className="font-medium">{assessment.subject}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Questions:</span>
                <span className="font-medium">{assessment.questions.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Total Marks:</span>
                <span className="font-medium">
                  {assessment.questions.reduce((sum, q) => sum + q.marks, 0)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Status:</span>
                <Badge variant="outline">{assessment.status}</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Modules */}
          <Card>
            <CardHeader>
              <CardTitle>Modules</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-1">
                {assessment.modules.map((module, index) => (
                  <Badge key={index} variant="outline">{module}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
