import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BookOpen, 
  Save,
  ArrowLeft,
  FileText,
  Settings,
  Send
} from "lucide-react";
import { assessmentService, type Assessment, type AssessmentQuestion } from "@/api/assessmentService";
import { schoolService, type School } from "@/api/schoolService";
import { mentorService } from "@/api/mentorService";
import AssessmentQuestionManager from "@/components/AssessmentQuestionManager";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export default function EditAssessmentPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    instructions: "",
    school: "",
    startDate: "",
    endDate: "",
    duration: 60,
  });

  // Questions state
  const [questions, setQuestions] = useState<AssessmentQuestion[]>([]);
  
  // School state
  const [schools, setSchools] = useState<School[]>([]);

  // Load schools based on user role
  useEffect(() => {
    const loadSchools = async () => {
      if (user?.role === "superadmin" || user?.role === "leadmentor") {
        try {
          const response = await schoolService.getAll();
          if (response.success) {
            setSchools(response.data);
          }
        } catch (error) {
          console.error("Error loading schools:", error);
          toast.error("Failed to load schools");
        }
      } else if (user?.role === "mentor") {
        try {
          const response = await mentorService.getMyProfile();
          if (response.success) {
            // Convert assigned schools to the format expected by the form
            const assignedSchools: School[] = response.data.assignedSchools.map((school: any) => ({
              _id: school._id,
              name: school.name,
              address: school.address || "",
              city: school.city || "",
              state: school.state || "",
              district: school.district || "",
              pinCode: school.pinCode || "",
              schoolEmail: school.schoolEmail || "",
              schoolWebsite: school.schoolWebsite || "",
              principalName: school.principalName || "",
              principalContact: school.principalContact || "",
              principalEmail: school.principalEmail || "",
              boards: (school.boards || []) as ("CBSE" | "ICSE" | "State Board" | "IGCSE" | "IB" | "Other")[],
              branchName: school.branchName || "",
              affiliatedTo: school.affiliatedTo || undefined,
              image: school.image || undefined,
              logo: school.logo || undefined,
              stemCoordinatorName: school.stemCoordinatorName || undefined,
              stemCoordinatorContact: school.stemCoordinatorContact || undefined,
              stemCoordinatorEmail: school.stemCoordinatorEmail || undefined,
              projectStartDate: school.projectStartDate || undefined,
              projectEndDate: school.projectEndDate || undefined,
              serviceDetails: school.serviceDetails || undefined,
              students_strength: school.students_strength || 0,
              isActive: school.isActive !== undefined ? school.isActive : true,
              createdAt: school.createdAt || new Date().toISOString(),
              updatedAt: school.updatedAt || new Date().toISOString()
            }));
            setSchools(assignedSchools);
          }
        } catch (error) {
          console.error("Error loading mentor profile:", error);
          toast.error("Failed to load mentor profile");
        }
      }
    };

    if (user) {
      loadSchools();
    }
  }, [user?.role]);

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
          school: assessmentData.school._id,
          startDate: new Date(assessmentData.startDate).toISOString().slice(0, 16),
          endDate: new Date(assessmentData.endDate).toISOString().slice(0, 16),
          duration: assessmentData.duration,
        });

        // Set questions
        setQuestions(assessmentData.questions);
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

  const handleQuestionsUpdate = (updatedQuestions: AssessmentQuestion[]) => {
    setQuestions(updatedQuestions);
  };

  const handlePublish = async () => {
    if (!id) return;

    const notificationMessage = prompt("Enter notification message for students (optional):");
    
    setPublishing(true);
    try {
      // First save any changes
      await assessmentService.updateAssessment(id, formData);
      
      // Then publish
      if (notificationMessage) {
        await assessmentService.publishAssessment(id, notificationMessage);
      } else {
        await assessmentService.publishAssessment(id);
      }

      toast.success("Assessment published successfully");
      navigate(`/mentor/assessments/${id}`);
    } catch (error) {
      console.error("Error publishing assessment:", error);
      toast.error("Failed to publish assessment");
    } finally {
      setPublishing(false);
    }
  };

  // Check if assessment can be edited (only draft assessments)
  const canEdit = assessment && assessment.status === "draft";
  const canEditQuestions = canEdit;

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
          {canEdit ? (
            <>
              <Button 
                variant="outline"
                onClick={handleSave}
                disabled={saving || publishing}
              >
                <Save className="h-4 w-4 mr-2" />
                {saving ? "Saving..." : "Save Changes"}
              </Button>
              <Button 
                onClick={handlePublish}
                disabled={saving || publishing}
              >
                <Send className="h-4 w-4 mr-2" />
                {publishing ? "Publishing..." : "Save & Publish"}
              </Button>
            </>
          ) : (
            <Button 
              disabled
              variant="outline"
            >
              <Save className="h-4 w-4 mr-2" />
              Cannot Edit Published Assessment
            </Button>
          )}
        </div>
      </div>

      {/* Warning message for published assessments */}
      {!canEdit && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="text-red-800">
              <p className="font-medium">Assessment Cannot Be Edited</p>
              <p className="text-sm">
                This assessment has been published and cannot be modified. Once an assessment is published, 
                it becomes read-only to maintain data integrity and prevent changes that could affect students 
                who have already started or completed the assessment.
              </p>
            </div>
          </div>
        </div>
      )}

      <Tabs defaultValue="settings" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Assessment Settings
          </TabsTrigger>
          <TabsTrigger value="questions" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Questions ({questions.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="settings" className="space-y-6">
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
                      disabled={!canEdit}
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
                      disabled={!canEdit}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="school">School *</Label>
                    <Select 
                      value={formData.school} 
                      onValueChange={(value) => handleInputChange("school", value)}
                      disabled={!canEdit}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select school" />
                      </SelectTrigger>
                      <SelectContent>
                        {schools.map(school => (
                          <SelectItem key={school._id} value={school._id}>{school.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="startDate">Start Date *</Label>
                      <Input
                        id="startDate"
                        type="datetime-local"
                        value={formData.startDate}
                        onChange={(e) => handleInputChange("startDate", e.target.value)}
                        disabled={!canEdit}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="endDate">End Date *</Label>
                      <Input
                        id="endDate"
                        type="datetime-local"
                        value={formData.endDate}
                        onChange={(e) => handleInputChange("endDate", e.target.value)}
                        disabled={!canEdit}
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
                        disabled={!canEdit}
                      />
                    </div>
                  </div>
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
                    <span>Questions:</span>
                    <span className="font-medium">{questions.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Total Marks:</span>
                    <span className="font-medium">
                      {questions.reduce((sum, q) => sum + q.marks, 0)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Status:</span>
                    <Badge variant="outline">{assessment.status}</Badge>
                  </div>
                </CardContent>
              </Card>

            </div>
          </div>
        </TabsContent>

        <TabsContent value="questions" className="space-y-6">
          {!canEditQuestions && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <div className="text-red-800">
                  <p className="font-medium">Questions cannot be edited</p>
                  <p className="text-sm">
                    This assessment has been published and cannot be modified. Once an assessment is published, 
                    it becomes read-only to maintain data integrity and prevent changes that could affect students 
                    who have already started or completed the assessment.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          <AssessmentQuestionManager
            assessmentId={id!}
            currentQuestions={questions}
            onQuestionsUpdate={handleQuestionsUpdate}
            grade={assessment.grade}
            subject={assessment.session?.module?.name || ''}
            modules={[assessment.session?._id || '']}
            disabled={!canEditQuestions}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
