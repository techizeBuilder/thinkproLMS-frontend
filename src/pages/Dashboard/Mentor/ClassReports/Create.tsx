import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Save, 
  Clock, 
  Users, 
  BookOpen, 
  Calendar,
  CheckCircle,
  AlertCircle,
  XCircle
} from "lucide-react";
import { classReportService, type CreateClassReportData } from "@/api/classReportService";
import { scheduleService, type Schedule } from "@/api/scheduleService";
import { toast } from "sonner";

export default function CreateClassReportPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [loading, setLoading] = useState(false);
  const [schedule, setSchedule] = useState<Schedule | null>(null);
  const [selectedSession, setSelectedSession] = useState<any>(null);
  
  const [formData, setFormData] = useState<CreateClassReportData>({
    scheduleId: "",
    sessionId: "",
    actualStartTime: "",
    actualEndTime: "",
    status: "completed",
    attendance: {
      present: 0,
      absent: 0,
      total: 0,
    },
    topicsCovered: [],
    homework: "",
    notes: "",
    challenges: "",
    nextClassPreparation: "",
    studentEngagement: "good",
    classEffectiveness: "good",
  });

  const [topicsInput, setTopicsInput] = useState("");

  useEffect(() => {
    const scheduleId = searchParams.get("scheduleId");
    const sessionId = searchParams.get("sessionId");
    
    if (scheduleId && sessionId) {
      loadScheduleData(scheduleId, sessionId);
    }
  }, [searchParams]);

  const loadScheduleData = async (scheduleId: string, sessionId: string) => {
    try {
      setLoading(true);
      const response = await scheduleService.getScheduleById(scheduleId);
      const scheduleData = response.data;
      
      setSchedule(scheduleData);
      setFormData(prev => ({
        ...prev,
        scheduleId,
        sessionId,
      }));

      // Find the specific session
      const session = scheduleData.sessions.find((s: any) => s._id === sessionId);
      if (session) {
        setSelectedSession(session);
        setFormData(prev => ({
          ...prev,
          actualStartTime: session.startTime,
          actualEndTime: session.endTime,
        }));
      }
    } catch (error) {
      console.error("Error loading schedule data:", error);
      toast.error("Failed to load schedule data");
      navigate("/mentor/schedules");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAttendanceChange = (field: "present" | "absent" | "total", value: number) => {
    setFormData(prev => ({
      ...prev,
      attendance: {
        ...prev.attendance!,
        [field]: value,
      },
    }));
  };

  const addTopic = () => {
    if (topicsInput.trim()) {
      setFormData(prev => ({
        ...prev,
        topicsCovered: [...(prev.topicsCovered || []), topicsInput.trim()],
      }));
      setTopicsInput("");
    }
  };

  const removeTopic = (index: number) => {
    setFormData(prev => ({
      ...prev,
      topicsCovered: prev.topicsCovered?.filter((_, i) => i !== index) || [],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.scheduleId || !formData.sessionId) {
      toast.error("Missing schedule or session information");
      return;
    }

    try {
      setLoading(true);
      await classReportService.createClassReport(formData);
      toast.success("Class report submitted successfully");
      navigate("/mentor/schedules");
    } catch (error) {
      console.error("Error creating class report:", error);
      toast.error("Failed to submit class report");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      scheduled: { color: "bg-blue-100 text-blue-800", icon: Clock },
      in_progress: { color: "bg-yellow-100 text-yellow-800", icon: AlertCircle },
      completed: { color: "bg-green-100 text-green-800", icon: CheckCircle },
      cancelled: { color: "bg-red-100 text-red-800", icon: XCircle },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.scheduled;
    const Icon = config.icon;

    return (
      <Badge className={`${config.color} flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {status.replace("_", " ").toUpperCase()}
      </Badge>
    );
  };

  if (loading && !schedule) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading class information...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!schedule || !selectedSession) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Class not found</h3>
            <p className="text-gray-600 mb-4">The requested class session could not be found.</p>
            <Button onClick={() => navigate("/mentor/schedules")}>
              Back to Schedules
            </Button>
          </CardContent>
        </Card>
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
          <h1 className="text-3xl font-bold">Class Report</h1>
          <p className="text-gray-600">Submit report for completed class</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Class Information */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Class Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-gray-500" />
                <span className="font-medium">{schedule.grade} - {schedule.section}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-gray-500" />
                <span>{schedule.subject.name}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span>{new Date(selectedSession.date).toLocaleDateString()}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-500" />
                <span>{selectedSession.startTime} - {selectedSession.endTime}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="font-medium">Module:</span>
                <span>{schedule.module.modules[0]?.name || "N/A"}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="font-medium">School:</span>
                <span>{schedule.school.name}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="font-medium">Status:</span>
                {getStatusBadge(selectedSession.status)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Report Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Class Report Form</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Class Status */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="status">Class Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value: any) => handleInputChange("status", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Actual Timing */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="actualStartTime">Actual Start Time</Label>
                    <Input
                      id="actualStartTime"
                      type="time"
                      value={formData.actualStartTime}
                      onChange={(e) => handleInputChange("actualStartTime", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="actualEndTime">Actual End Time</Label>
                    <Input
                      id="actualEndTime"
                      type="time"
                      value={formData.actualEndTime}
                      onChange={(e) => handleInputChange("actualEndTime", e.target.value)}
                    />
                  </div>
                </div>

                {/* Attendance */}
                <div>
                  <Label>Attendance</Label>
                  <div className="grid grid-cols-3 gap-4 mt-2">
                    <div>
                      <Label htmlFor="present">Present</Label>
                      <Input
                        id="present"
                        type="number"
                        min="0"
                        value={formData.attendance?.present || 0}
                        onChange={(e) => handleAttendanceChange("present", parseInt(e.target.value) || 0)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="absent">Absent</Label>
                      <Input
                        id="absent"
                        type="number"
                        min="0"
                        value={formData.attendance?.absent || 0}
                        onChange={(e) => handleAttendanceChange("absent", parseInt(e.target.value) || 0)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="total">Total</Label>
                      <Input
                        id="total"
                        type="number"
                        min="0"
                        value={formData.attendance?.total || 0}
                        onChange={(e) => handleAttendanceChange("total", parseInt(e.target.value) || 0)}
                      />
                    </div>
                  </div>
                </div>

                {/* Topics Covered */}
                <div>
                  <Label>Topics Covered</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      value={topicsInput}
                      onChange={(e) => setTopicsInput(e.target.value)}
                      placeholder="Enter topic"
                      onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTopic())}
                    />
                    <Button type="button" onClick={addTopic} variant="outline">
                      Add
                    </Button>
                  </div>
                  {formData.topicsCovered && formData.topicsCovered.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.topicsCovered.map((topic, index) => (
                        <Badge key={index} variant="secondary" className="flex items-center gap-1">
                          {topic}
                          <button
                            type="button"
                            onClick={() => removeTopic(index)}
                            className="ml-1 hover:text-red-500"
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                {/* Homework */}
                <div>
                  <Label htmlFor="homework">Homework Assigned</Label>
                  <Textarea
                    id="homework"
                    value={formData.homework}
                    onChange={(e) => handleInputChange("homework", e.target.value)}
                    placeholder="Describe homework assigned to students"
                    rows={3}
                  />
                </div>

                {/* Notes */}
                <div>
                  <Label htmlFor="notes">Class Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => handleInputChange("notes", e.target.value)}
                    placeholder="Additional notes about the class"
                    rows={3}
                  />
                </div>

                {/* Challenges */}
                <div>
                  <Label htmlFor="challenges">Challenges Faced</Label>
                  <Textarea
                    id="challenges"
                    value={formData.challenges}
                    onChange={(e) => handleInputChange("challenges", e.target.value)}
                    placeholder="Any challenges or difficulties encountered"
                    rows={3}
                  />
                </div>

                {/* Next Class Preparation */}
                <div>
                  <Label htmlFor="nextClassPreparation">Next Class Preparation</Label>
                  <Textarea
                    id="nextClassPreparation"
                    value={formData.nextClassPreparation}
                    onChange={(e) => handleInputChange("nextClassPreparation", e.target.value)}
                    placeholder="Preparation needed for next class"
                    rows={3}
                  />
                </div>

                {/* Engagement and Effectiveness */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="studentEngagement">Student Engagement</Label>
                    <Select
                      value={formData.studentEngagement}
                      onValueChange={(value: any) => handleInputChange("studentEngagement", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select engagement level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="excellent">Excellent</SelectItem>
                        <SelectItem value="good">Good</SelectItem>
                        <SelectItem value="average">Average</SelectItem>
                        <SelectItem value="poor">Poor</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="classEffectiveness">Class Effectiveness</Label>
                    <Select
                      value={formData.classEffectiveness}
                      onValueChange={(value: any) => handleInputChange("classEffectiveness", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select effectiveness level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="excellent">Excellent</SelectItem>
                        <SelectItem value="good">Good</SelectItem>
                        <SelectItem value="average">Average</SelectItem>
                        <SelectItem value="poor">Poor</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex items-center gap-4 pt-4">
                  <Button type="submit" disabled={loading}>
                    <Save className="h-4 w-4 mr-2" />
                    {loading ? "Submitting..." : "Submit Report"}
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
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
