import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Save, 
  Plus, 
  Trash2, 
  Calendar,
  Clock,
  Users,
  BookOpen
} from "lucide-react";
import { scheduleService, type CreateScheduleData, type ClassSession } from "@/api/scheduleService";
import { mentorService } from "@/api/mentorService";
import { schoolService } from "@/api/schoolService";
import { subjectService } from "@/api/subjectService";
import { moduleService } from "@/api/moduleService";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface School {
  _id: string;
  name: string;
  address: string;
}

interface Subject {
  _id: string;
  name: string;
}

interface Module {
  _id: string;
  modules: Array<{
    _id: string;
    name: string;
    description?: string;
  }>;
}

export default function CreateSchedulePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [schools, setSchools] = useState<School[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  
  const [formData, setFormData] = useState<CreateScheduleData>({
    school: "",
    mentor: "",
    grade: "",
    section: "",
    subject: "",
    module: "",
    academicYear: "",
    sessions: [],
  });

  const [newSession, setNewSession] = useState<Partial<ClassSession>>({
    date: "",
    startTime: "",
    endTime: "",
    status: "scheduled",
  });

  const grades = [
    "Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5",
    "Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10"
  ];

  const academicYears = [
    "2024-25", "2023-24", "2022-23"
  ];

  const sections = ["A", "B", "C", "D", "E"];

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (formData.grade && formData.subject) {
      loadModules();
    }
  }, [formData.grade, formData.subject]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      
      // Load schools, subjects, and current mentor info
      const [schoolsResponse, subjectsResponse] = await Promise.all([
        schoolService.getSchools(),
        subjectService.getSubjects(),
      ]);

      setSchools(schoolsResponse.data || []);
      setSubjects(subjectsResponse.data || []);
      
      // Set current mentor
      if (user?.mentorId) {
        setFormData(prev => ({ ...prev, mentor: user.mentorId }));
      }
    } catch (error) {
      console.error("Error loading initial data:", error);
      toast.error("Failed to load required data");
    } finally {
      setLoading(false);
    }
  };

  const loadModules = async () => {
    try {
      if (!formData.grade || !formData.subject) return;
      
      const gradeNumber = parseInt(formData.grade.replace("Grade ", ""));
      const response = await moduleService.getModulesByGradeAndSubject(gradeNumber, formData.subject);
      setModules(response.data || []);
    } catch (error) {
      console.error("Error loading modules:", error);
      setModules([]);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const addSession = () => {
    if (!newSession.date || !newSession.startTime || !newSession.endTime) {
      toast.error("Please fill in all session details");
      return;
    }

    const session: ClassSession = {
      date: newSession.date!,
      startTime: newSession.startTime!,
      endTime: newSession.endTime!,
      status: "scheduled",
    };

    setFormData(prev => ({
      ...prev,
      sessions: [...prev.sessions!, session],
    }));

    setNewSession({
      date: "",
      startTime: "",
      endTime: "",
      status: "scheduled",
    });
  };

  const removeSession = (index: number) => {
    setFormData(prev => ({
      ...prev,
      sessions: prev.sessions!.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.school || !formData.mentor || !formData.grade || !formData.section || 
        !formData.subject || !formData.module || !formData.academicYear) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (formData.sessions!.length === 0) {
      toast.error("Please add at least one session");
      return;
    }

    try {
      setLoading(true);
      await scheduleService.createSchedule(formData);
      toast.success("Schedule created successfully");
      navigate("/mentor/schedules");
    } catch (error) {
      console.error("Error creating schedule:", error);
      toast.error("Failed to create schedule");
    } finally {
      setLoading(false);
    }
  };

  if (loading && schools.length === 0) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => navigate("/mentor/schedules")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Create Schedule</h1>
          <p className="text-gray-600">Create a new class schedule</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="school">School *</Label>
                <Select
                  value={formData.school}
                  onValueChange={(value) => handleInputChange("school", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select school" />
                  </SelectTrigger>
                  <SelectContent>
                    {schools.map((school) => (
                      <SelectItem key={school._id} value={school._id}>
                        {school.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="grade">Grade *</Label>
                <Select
                  value={formData.grade}
                  onValueChange={(value) => handleInputChange("grade", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select grade" />
                  </SelectTrigger>
                  <SelectContent>
                    {grades.map((grade) => (
                      <SelectItem key={grade} value={grade}>
                        {grade}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="section">Section *</Label>
                <Select
                  value={formData.section}
                  onValueChange={(value) => handleInputChange("section", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select section" />
                  </SelectTrigger>
                  <SelectContent>
                    {sections.map((section) => (
                      <SelectItem key={section} value={section}>
                        {section}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="subject">Subject *</Label>
                <Select
                  value={formData.subject}
                  onValueChange={(value) => handleInputChange("subject", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((subject) => (
                      <SelectItem key={subject._id} value={subject._id}>
                        {subject.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="module">Module *</Label>
                <Select
                  value={formData.module}
                  onValueChange={(value) => handleInputChange("module", value)}
                  disabled={!formData.grade || !formData.subject}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select module" />
                  </SelectTrigger>
                  <SelectContent>
                    {modules.map((module) => (
                      <SelectItem key={module._id} value={module._id}>
                        {module.modules[0]?.name || "Module"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="academicYear">Academic Year *</Label>
                <Select
                  value={formData.academicYear}
                  onValueChange={(value) => handleInputChange("academicYear", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select academic year" />
                  </SelectTrigger>
                  <SelectContent>
                    {academicYears.map((year) => (
                      <SelectItem key={year} value={year}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Sessions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Class Sessions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Add New Session */}
              <div className="border rounded-lg p-4 bg-gray-50">
                <h4 className="font-medium mb-3">Add New Session</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <Label htmlFor="sessionDate">Date</Label>
                    <Input
                      id="sessionDate"
                      type="date"
                      value={newSession.date}
                      onChange={(e) => setNewSession(prev => ({ ...prev, date: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="startTime">Start Time</Label>
                    <Input
                      id="startTime"
                      type="time"
                      value={newSession.startTime}
                      onChange={(e) => setNewSession(prev => ({ ...prev, startTime: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="endTime">End Time</Label>
                    <Input
                      id="endTime"
                      type="time"
                      value={newSession.endTime}
                      onChange={(e) => setNewSession(prev => ({ ...prev, endTime: e.target.value }))}
                    />
                  </div>
                </div>
                <Button
                  type="button"
                  onClick={addSession}
                  className="mt-3"
                  size="sm"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Session
                </Button>
              </div>

              {/* Sessions List */}
              {formData.sessions && formData.sessions.length > 0 && (
                <div>
                  <h4 className="font-medium mb-3">Scheduled Sessions ({formData.sessions.length})</h4>
                  <div className="space-y-2">
                    {formData.sessions.map((session, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          <div>
                            <div className="font-medium">
                              {new Date(session.date).toLocaleDateString()}
                            </div>
                            <div className="text-sm text-gray-600 flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {session.startTime} - {session.endTime}
                            </div>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeSession(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Submit Button */}
        <div className="flex items-center gap-4">
          <Button type="submit" disabled={loading}>
            <Save className="h-4 w-4 mr-2" />
            {loading ? "Creating..." : "Create Schedule"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/mentor/schedules")}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
