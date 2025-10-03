import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { 
  BookOpen, 
  Trash2, 
  Eye,
  Save,
  Send,
  Search
} from "lucide-react";
import { assessmentService } from "@/api/assessmentService";
import { schoolService, type School, type AvailableGrade } from "@/api/schoolService";
import { mentorService } from "@/api/mentorService";
import { sessionService, type Session } from "@/api/sessionService";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface Question {
  _id: string;
  questionText: string;
  session: {
    _id: string;
    name: string;
    displayName: string;
  };
  answerType: string;
  answerChoices: Array<{
    text: string;
    isCorrect: boolean;
    order: number;
  }>;
  correctAnswers: number[];
  difficulty: string;
  order: number;
  isActive: boolean;
}

interface SelectedQuestion extends Question {
  marks: number;
  order: number;
}

export default function CreateAssessmentPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Form state
  const [formData, setFormData] = useState({
    title: "",
    instructions: "",
    school: "",
    grade: "",
    sections: [] as string[],
    session: "",
    startDate: "",
    endDate: "",
    duration: 60,
  });

  // Question selection state
  const [availableQuestions, setAvailableQuestions] = useState<Question[]>([]);
  const [selectedQuestions, setSelectedQuestions] = useState<SelectedQuestion[]>([]);
  const [questionFilters, setQuestionFilters] = useState({
    grade: "",
    session: "",
    difficulty: "all",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([]);

  // UI state
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Basic Info, 2: Questions, 3: Preview
  const [sessions, setSessions] = useState<Session[]>([]);
  
  // School and section state
  const [schools, setSchools] = useState<School[]>([]);
  const [availableGrades, setAvailableGrades] = useState<AvailableGrade[]>([]);
  const [availableSections, setAvailableSections] = useState<string[]>([]);
  const [hasServiceDetails, setHasServiceDetails] = useState(false);

  // Load schools for SuperAdmin/LeadMentor and mentor profile for mentors
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
            const assignedSchools: School[] = response.data.assignedSchools.map(school => ({
              _id: school._id,
              name: school.name,
              address: "", // Not available in mentor profile
              city: school.city,
              state: school.state,
              board: school.board as "ICSE" | "CBSE" | "State" | "Other",
              branchName: school.branchName || "",
              isActive: true, // Assume active since they're assigned
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }));
            setSchools(assignedSchools);
          }
        } catch (error) {
          console.error("Error loading mentor profile:", error);
          toast.error("Failed to load mentor profile");
        }
      }
    };

    loadSchools();
  }, [user?.role]);

  // Load school service details when school changes
  useEffect(() => {
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

    if (formData.school) {
      fetchSchoolServiceDetails(formData.school);
    } else {
      setAvailableGrades([]);
      setHasServiceDetails(false);
      setAvailableSections([]);
    }
  }, [formData.school]);

  // Load sessions
  useEffect(() => {
    const loadSessions = async () => {
      try {
        // Extract numeric grade from "Grade X" format
        const gradeNumber = parseInt(formData.grade.replace(/\D/g, ''));
        if (isNaN(gradeNumber)) {
          console.error("Invalid grade format:", formData.grade);
          setSessions([]);
          return;
        }
        
        const response = await sessionService.getSessionsByGrade(gradeNumber);
        setSessions(response || []);
      } catch (error) {
        console.error("Error loading sessions:", error);
        toast.error("Failed to load sessions");
        setSessions([]);
      }
    };

    if (formData.grade) {
      loadSessions();
    }
  }, [formData.grade]);

  // Load questions when filters change
  useEffect(() => {
    const loadQuestions = async () => {
      if (!questionFilters.session) return;

      try {
        // Create filter object, excluding difficulty if it's "all"
        const filters: any = { ...questionFilters };
        if (filters.difficulty === "all") {
          delete filters.difficulty;
        }
        
        const response = await assessmentService.getQuestionsForAssessment(filters);
        setAvailableQuestions(response.data || []);
      } catch (error) {
        console.error("Error loading questions:", error);
        toast.error("Failed to load questions");
      }
    };

    loadQuestions();
  }, [questionFilters]);

  // Filter questions based on search term and difficulty
  useEffect(() => {
    let filtered = availableQuestions;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(q => 
        q.questionText.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by difficulty (if not already filtered by API)
    if (questionFilters.difficulty && questionFilters.difficulty !== "all") {
      filtered = filtered.filter(q => q.difficulty === questionFilters.difficulty);
    }

    setFilteredQuestions(filtered);
  }, [availableQuestions, searchTerm, questionFilters.difficulty]);

  const handleInputChange = (field: string, value: any) => {
    if (field === "school") {
      // Reset grade and sections when school changes
      setFormData(prev => ({ ...prev, [field]: value, grade: "", sections: [] }));
      setAvailableSections([]);
    } else if (field === "grade") {
      // Reset sections when grade changes and update available sections
      setFormData(prev => ({ ...prev, [field]: value, sections: [] }));
      
      if (value && hasServiceDetails) {
        // Find the selected grade in available grades and get its sections
        const selectedGradeData = availableGrades.find(gradeData => gradeData.grade === parseInt(value));
        setAvailableSections(selectedGradeData?.sections || []);
      } else {
        setAvailableSections([]);
      }
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }

    // Update question filters when grade/session changes
    if (field === "grade" || field === "session") {
      setQuestionFilters(prev => ({
        ...prev,
        [field]: value,
      }));
    }
  };


  const handleSectionToggle = (section: string) => {
    const newSections = formData.sections.includes(section)
      ? formData.sections.filter(s => s !== section)
      : [...formData.sections, section];

    setFormData(prev => ({ ...prev, sections: newSections }));
  };

  const handleQuestionSelect = (question: Question) => {
    const isSelected = selectedQuestions.some(q => q._id === question._id);
    
    if (isSelected) {
      setSelectedQuestions(prev => prev.filter(q => q._id !== question._id));
    } else {
      const newQuestion: SelectedQuestion = {
        ...question,
        marks: 1,
        order: selectedQuestions.length + 1,
      };
      setSelectedQuestions(prev => [...prev, newQuestion]);
    }
  };

  const handleQuestionMarksChange = (questionId: string, marks: number) => {
    setSelectedQuestions(prev =>
      prev.map(q => q._id === questionId ? { ...q, marks } : q)
    );
  };


  const removeQuestion = (questionId: string) => {
    setSelectedQuestions(prev => {
      const filtered = prev.filter(q => q._id !== questionId);
      return filtered.map((q, index) => ({ ...q, order: index + 1 }));
    });
  };

  const handleSaveDraft = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      // Extract numeric grade from "Grade X" format
      const gradeNumber = parseInt(formData.grade.replace(/\D/g, ''));
      
      const assessmentData = {
        ...formData,
        grade: gradeNumber, // Send numeric grade instead of string
        questions: selectedQuestions.map(q => ({
          questionId: q._id,
          order: q.order,
          marks: q.marks,
        })),
      };

      await assessmentService.createAssessment(assessmentData);
      toast.success("Assessment saved as draft");
      navigate("/mentor/assessments");
    } catch (error) {
      console.error("Error saving assessment:", error);
      toast.error("Failed to save assessment");
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async () => {
    if (!validateForm()) return;

    const notificationMessage = prompt("Enter notification message for students (optional):");
    
    setLoading(true);
    try {
      // Extract numeric grade from "Grade X" format
      const gradeNumber = parseInt(formData.grade.replace(/\D/g, ''));
      
      const assessmentData = {
        ...formData,
        grade: gradeNumber, // Send numeric grade instead of string
        questions: selectedQuestions.map(q => ({
          questionId: q._id,
          order: q.order,
          marks: q.marks,
        })),
      };

      const response = await assessmentService.createAssessment(assessmentData);
      
      if (notificationMessage) {
        await assessmentService.publishAssessment(response.data._id, notificationMessage);
      } else {
        await assessmentService.publishAssessment(response.data._id);
      }

      toast.success("Assessment published successfully");
      navigate("/mentor/assessments");
    } catch (error) {
      console.error("Error publishing assessment:", error);
      toast.error("Failed to publish assessment");
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    if (!formData.title || !formData.instructions || !formData.grade || !formData.sections || formData.sections.length === 0 || !formData.session) {
      toast.error("Please fill in all required fields");
      return false;
    }

    // For SuperAdmin/LeadMentor/Mentor, school is required
    if ((user?.role === "superadmin" || user?.role === "leadmentor" || user?.role === "mentor") && !formData.school) {
      toast.error("Please select a school");
      return false;
    }

    if (selectedQuestions.length === 0) {
      toast.error("Please select at least one question");
      return false;
    }

    if (!formData.startDate || !formData.endDate) {
      toast.error("Please set start and end dates");
      return false;
    }

    const startDate = new Date(formData.startDate);
    const endDate = new Date(formData.endDate);
    const now = new Date();

    if (startDate <= now) {
      toast.error("Start date must be in the future");
      return false;
    }

    if (endDate <= startDate) {
      toast.error("End date must be after start date");
      return false;
    }

    return true;
  };

  const totalMarks = selectedQuestions.reduce((sum, q) => sum + q.marks, 0);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Create Assessment</h1>
          <p className="text-gray-600">Create a new assessment for your students</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate("/mentor/assessments")}>
            Cancel
          </Button>
          <Button variant="outline" onClick={handleSaveDraft} disabled={loading}>
            <Save className="h-4 w-4 mr-2" />
            Save Draft
          </Button>
          <Button onClick={handlePublish} disabled={loading}>
            <Send className="h-4 w-4 mr-2" />
            Publish
          </Button>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center space-x-4">
        {[1, 2, 3].map((stepNumber) => (
          <div key={stepNumber} className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              step >= stepNumber ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"
            }`}>
              {stepNumber}
            </div>
            <span className={`ml-2 ${step >= stepNumber ? "text-blue-600" : "text-gray-600"}`}>
              {stepNumber === 1 ? "Basic Info" : stepNumber === 2 ? "Questions" : "Preview"}
            </span>
            {stepNumber < 3 && <div className="w-8 h-px bg-gray-300 ml-4" />}
          </div>
        ))}
      </div>

      {/* Step 1: Basic Information */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BookOpen className="h-5 w-5 mr-2" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="title">Assessment Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  placeholder="Enter assessment title"
                />
              </div>

              {/* School selection for SuperAdmin/LeadMentor/Mentor */}
              {(user?.role === "superadmin" || user?.role === "leadmentor" || user?.role === "mentor") && (
                <div className="space-y-2">
                  <Label htmlFor="school">School *</Label>
                  <Select value={formData.school} onValueChange={(value) => handleInputChange("school", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select school" />
                    </SelectTrigger>
                    <SelectContent>
                      {schools.map(school => (
                        <SelectItem key={school._id} value={school._id}>{school.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {user?.role === "mentor" && schools.length === 0 && (
                    <p className="text-sm text-gray-500">No schools assigned to you. Please contact your administrator.</p>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="grade">Grade *</Label>
                <Select value={formData.grade} onValueChange={(value) => handleInputChange("grade", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select grade" />
                  </SelectTrigger>
                  <SelectContent>
                    {hasServiceDetails ? (
                      availableGrades.map(gradeData => (
                        <SelectItem key={gradeData.grade} value={gradeData.grade.toString()}>{gradeData.grade}</SelectItem>
                      ))
                    ) : (
                      ["Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", 
                       "Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10"].map(grade => (
                        <SelectItem key={grade} value={grade}>{grade}</SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {hasServiceDetails && availableGrades.length === 0 && formData.school && (
                  <p className="text-sm text-gray-500">No grades available for this school. Please configure service details first.</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="sections">Sections *</Label>
                <div className="space-y-2">
                  {availableSections.map(section => (
                    <div key={section} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`section-${section}`}
                        checked={formData.sections.includes(section)}
                        onChange={() => handleSectionToggle(section)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor={`section-${section}`} className="text-sm font-medium text-gray-700">
                        {section}
                      </label>
                    </div>
                  ))}
                </div>
                {hasServiceDetails && availableSections.length === 0 && formData.grade && (
                  <p className="text-sm text-gray-500">No sections available for {formData.grade}. Please configure service details first.</p>
                )}
                {!hasServiceDetails && formData.school && (
                  <p className="text-sm text-gray-500">Service details not configured for this school. Please contact administrator.</p>
                )}
                {formData.sections.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-600">Selected sections: {formData.sections.join(", ")}</p>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="session">Session *</Label>
                <Select value={formData.session} onValueChange={(value) => handleInputChange("session", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select session" />
                  </SelectTrigger>
                  <SelectContent>
                    {sessions.length > 0 ? (
                      sessions.map(session => (
                        <SelectItem key={session._id} value={session._id!}>{session.displayName || `${session.grade}.${session.sessionNumber} ${session.name}`}</SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-sessions" disabled>No sessions available</SelectItem>
                    )}
                  </SelectContent>
                </Select>
                {sessions.length === 0 && formData.grade && (
                  <p className="text-sm text-gray-500">No sessions found for {formData.grade}. Please create sessions first.</p>
                )}
              </div>
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                  value={formData.duration}
                  onChange={(e) => handleInputChange("duration", parseInt(e.target.value))}
                  min="1"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={() => setStep(2)} disabled={!formData.grade || formData.sections.length === 0 || !formData.session || ((user?.role === "superadmin" || user?.role === "leadmentor" || user?.role === "mentor") && !formData.school)}>
                Next: Select Questions
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Question Selection */}
      {step === 2 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Available Questions */}
          <Card>
            <CardHeader>
              <CardTitle>Available Questions</CardTitle>
              <div className="flex gap-2">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search questions..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={questionFilters.difficulty} onValueChange={(value) => 
                  setQuestionFilters(prev => ({ ...prev, difficulty: value }))
                }>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="Easy">Easy</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Tough">Tough</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {filteredQuestions.map(question => (
                  <div key={question._id} className="border rounded-lg p-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Checkbox
                            checked={selectedQuestions.some(q => q._id === question._id)}
                            onCheckedChange={() => handleQuestionSelect(question)}
                          />
                          <Badge variant="outline">{question.difficulty}</Badge>
                          <span className="text-sm text-gray-500">{question.session?.displayName || question.session?.name}</span>
                        </div>
                        <p className="text-sm">{question.questionText}</p>
                      </div>
                    </div>
                  </div>
                ))}
                {filteredQuestions.length === 0 && availableQuestions.length > 0 && (
                  <p className="text-center text-gray-500 py-4">No questions match your search criteria</p>
                )}
                {availableQuestions.length === 0 && (
                  <p className="text-center text-gray-500 py-4">No questions available</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Selected Questions */}
          <Card>
            <CardHeader>
              <CardTitle>Selected Questions ({selectedQuestions.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {selectedQuestions.map((question) => (
                  <div key={question._id} className="border rounded-lg p-3">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Q{question.order}</span>
                        <Badge variant="outline">{question.difficulty}</Badge>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeQuestion(question._id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-sm mb-2">{question.questionText}</p>
                    <div className="flex items-center gap-2">
                      <Label htmlFor={`marks-${question._id}`} className="text-xs">Marks:</Label>
                      <Input
                        id={`marks-${question._id}`}
                        type="number"
                        value={question.marks}
                        onChange={(e) => handleQuestionMarksChange(question._id, parseInt(e.target.value))}
                        className="w-16 h-8"
                        min="1"
                      />
                    </div>
                  </div>
                ))}
                {selectedQuestions.length === 0 && (
                  <p className="text-center text-gray-500 py-4">No questions selected</p>
                )}
              </div>
              {selectedQuestions.length > 0 && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium">Total Marks: {totalMarks}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Step 3: Preview */}
      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Eye className="h-5 w-5 mr-2" />
              Assessment Preview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2">Basic Information</h3>
                <div className="space-y-2 text-sm">
                  <p><strong>Title:</strong> {formData.title}</p>
                  {(user?.role === "superadmin" || user?.role === "leadmentor" || user?.role === "mentor") && (
                    <p><strong>School:</strong> {schools.find(s => s._id === formData.school)?.name || "Not selected"}</p>
                  )}
                  <p><strong>Grade:</strong> {formData.grade}</p>
                  <p><strong>Sections:</strong> {formData.sections.join(", ")}</p>
                  <p><strong>Session:</strong> {sessions.find(s => s._id === formData.session)?.displayName || sessions.find(s => s._id === formData.session)?.name || "Not selected"}</p>
                  <p><strong>Duration:</strong> {formData.duration} minutes</p>
                  <p><strong>Total Questions:</strong> {selectedQuestions.length}</p>
                  <p><strong>Total Marks:</strong> {totalMarks}</p>
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Schedule</h3>
                <div className="space-y-2 text-sm">
                  <p><strong>Start Date:</strong> {new Date(formData.startDate).toLocaleString()}</p>
                  <p><strong>End Date:</strong> {new Date(formData.endDate).toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Instructions</h3>
              <p className="text-sm bg-gray-50 p-3 rounded-lg">{formData.instructions}</p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Questions ({selectedQuestions.length})</h3>
              <div className="space-y-3">
                {selectedQuestions.map((question, index) => (
                  <div key={question._id} className="border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">Question {index + 1}</span>
                      <Badge variant="outline">{question.marks} marks</Badge>
                    </div>
                    <p className="text-sm">{question.questionText}</p>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      {step > 1 && (
        <div className="flex justify-between">
          <Button variant="outline" onClick={() => setStep(step - 1)}>
            Previous
          </Button>
          {step < 3 && (
            <Button onClick={() => setStep(step + 1)} disabled={selectedQuestions.length === 0}>
              Next
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
