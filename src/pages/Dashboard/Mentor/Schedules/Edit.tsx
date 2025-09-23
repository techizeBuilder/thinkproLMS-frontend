import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
import { scheduleService, type Schedule, type ClassSession } from "@/api/scheduleService";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface School {
  _id: string;
  name: string;
  address: string;
  serviceDetails?: {
    grades: Array<{
      grade: number;
      sections: string[];
    }>;
  };
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

export default function EditSchedulePage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [schools, setSchools] = useState<School[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [availableSections, setAvailableSections] = useState<string[]>([]);
  const [availableGrades, setAvailableGrades] = useState<string[]>([]);
  
  const [formData, setFormData] = useState<Partial<Schedule>>({
    school: "",
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

  const academicYears = [
    "2024-25", "2023-24", "2022-23"
  ];

  useEffect(() => {
    if (id) {
      loadSchedule();
    }
    loadInitialData();
  }, [id]);

  useEffect(() => {
    updateAvailableGrades();
  }, [formData.school]);

  useEffect(() => {
    updateAvailableSections();
  }, [formData.school, formData.grade]);

  useEffect(() => {
    if (formData.grade && formData.subject) {
      loadModules();
    }
  }, [formData.grade, formData.subject]);

  const loadSchedule = async () => {
    try {
      setLoading(true);
      const response = await scheduleService.getScheduleById(id!);
      const schedule = response.data;
      
      setFormData({
        school: schedule.school._id,
        grade: schedule.grade,
        section: schedule.section,
        subject: schedule.subject._id,
        module: schedule.module._id,
        academicYear: schedule.academicYear,
        sessions: schedule.sessions,
      });
    } catch (error) {
      console.error("Error loading schedule:", error);
      toast.error("Failed to load schedule");
      navigate("/mentor/schedules");
    } finally {
      setLoading(false);
    }
  };

  const loadInitialData = async () => {
    try {
      // Load schools and subjects (you might need to implement these services)
      // For now, we'll use empty arrays
      setSchools([]);
      setSubjects([]);
    } catch (error) {
      console.error("Error loading initial data:", error);
      toast.error("Failed to load required data");
    }
  };

  const updateAvailableGrades = () => {
    if (!formData.school) {
      setAvailableGrades([]);
      return;
    }

    const selectedSchool = schools.find(school => school._id === formData.school);
    if (!selectedSchool?.serviceDetails?.grades) {
      setAvailableGrades([]);
      return;
    }

    const grades = selectedSchool.serviceDetails.grades.map(g => `Grade ${g.grade}`);
    setAvailableGrades(grades);
  };

  const updateAvailableSections = () => {
    if (!formData.school || !formData.grade) {
      setAvailableSections([]);
      return;
    }

    const selectedSchool = schools.find(school => school._id === formData.school);
    if (!selectedSchool?.serviceDetails?.grades) {
      setAvailableSections([]);
      return;
    }

    const gradeNumber = parseInt(formData.grade.replace("Grade ", ""));
    const gradeData = selectedSchool.serviceDetails.grades.find(g => g.grade === gradeNumber);
    
    if (gradeData) {
      setAvailableSections(gradeData.sections);
    } else {
      setAvailableSections([]);
    }
  };

  const loadModules = async () => {
    try {
      if (!formData.grade || !formData.subject) return;
      
      const gradeNumber = parseInt(formData.grade.replace("Grade ", ""));
      // You might need to implement this service method
      // const response = await moduleService.getModulesByGradeAndSubject(gradeNumber, formData.subject);
      // setModules([response] || []);
      setModules([]);
    } catch (error) {
      console.error("Error loading modules:", error);
      setModules([]);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => {
      const newData = {
        ...prev,
        [field]: value,
      };
      
      // Clear dependent fields when school changes
      if (field === 'school') {
        newData.grade = '';
        newData.section = '';
        newData.subject = '';
        newData.module = '';
      }
      // Clear section if grade changes
      else if (field === 'grade') {
        newData.section = '';
        newData.subject = '';
        newData.module = '';
      }
      // Clear module if subject changes
      else if (field === 'subject') {
        newData.module = '';
      }
      
      return newData;
    });
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
      sessions: [...(prev.sessions || []), session],
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
    
    if (!formData.school || !formData.grade || !formData.section || 
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
      await scheduleService.updateSchedule(id!, formData);
      toast.success("Schedule updated successfully");
      navigate("/mentor/schedules");
    } catch (error) {
      console.error("Error updating schedule:", error);
      toast.error("Failed to update schedule");
    } finally {
      setLoading(false);
    }
  };

  if (loading && !formData.school) {
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
          onClick={() => navigate(`/mentor/schedules/${id}`)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Edit Schedule</h1>
          <p className="text-gray-600">Update schedule details</p>
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
                  disabled={!formData.school || availableGrades.length === 0}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={
                      !formData.school 
                        ? "Select school first" 
                        : availableGrades.length === 0 
                          ? "No grades available" 
                          : "Select grade"
                    } />
                  </SelectTrigger>
                  <SelectContent>
                    {availableGrades.map((grade) => (
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
                  disabled={!formData.school || !formData.grade || availableSections.length === 0}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={
                      !formData.school || !formData.grade 
                        ? "Select school and grade first" 
                        : availableSections.length === 0 
                          ? "No sections available" 
                          : "Select section"
                    } />
                  </SelectTrigger>
                  <SelectContent>
                    {availableSections.map((section) => (
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
            {loading ? "Updating..." : "Update Schedule"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(`/mentor/schedules/${id}`)}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
