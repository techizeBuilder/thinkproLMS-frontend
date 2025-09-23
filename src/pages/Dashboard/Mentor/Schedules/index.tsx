import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { 
  Plus, 
  Calendar, 
  Clock, 
  Users, 
  BookOpen,
  BarChart3,
  Filter,
  Search,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  AlertCircle,
  XCircle
} from "lucide-react";
import { scheduleService, type Schedule } from "@/api/scheduleService";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export default function MentorSchedulesPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    academicYear: "",
    grade: "",
    subject: "",
    status: "all",
    search: "",
  });

  const grades = [
    "Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5",
    "Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10"
  ];

  const academicYears = [
    "2024-25", "2023-24", "2022-23"
  ];

  const subjects = [
    "Mathematics", "Science", "English", "Social Studies", "Hindi"
  ];

  useEffect(() => {
    loadSchedules();
  }, [filters]);

  const loadSchedules = async () => {
    try {
      setLoading(true);
      // Assuming we have mentorId from user context
      const mentorId = user?.mentorId || "current-mentor-id";
      const response = await scheduleService.getMentorSchedules(mentorId, {
        academicYear: filters.academicYear || undefined,
        grade: filters.grade || undefined,
        subject: filters.subject || undefined,
        status: filters.status !== "all" ? filters.status : undefined,
      });
      setSchedules(response.data || []);
    } catch (error) {
      console.error("Error loading schedules:", error);
      toast.error("Failed to load schedules");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSchedule = async (id: string) => {
    if (!confirm("Are you sure you want to delete this schedule?")) return;

    try {
      await scheduleService.deleteSchedule(id);
      toast.success("Schedule deleted successfully");
      loadSchedules();
    } catch (error) {
      console.error("Error deleting schedule:", error);
      toast.error("Failed to delete schedule");
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      scheduled: { color: "bg-blue-100 text-blue-800", icon: Clock },
      in_progress: { color: "bg-yellow-100 text-yellow-800", icon: AlertCircle },
      completed: { color: "bg-green-100 text-green-800", icon: CheckCircle },
      cancelled: { color: "bg-red-100 text-red-800", icon: XCircle },
      rescheduled: { color: "bg-purple-100 text-purple-800", icon: Calendar },
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

  const filteredSchedules = schedules.filter(schedule => {
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      return (
        schedule.grade.toLowerCase().includes(searchTerm) ||
        schedule.section.toLowerCase().includes(searchTerm) ||
        schedule.subject.name.toLowerCase().includes(searchTerm) ||
        schedule.school.name.toLowerCase().includes(searchTerm)
      );
    }
    return true;
  });

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading schedules...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Class Schedules</h1>
          <p className="text-gray-600">Manage your daily class schedules and sessions</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => navigate("/mentor/schedules/calendar")}
          >
            <Calendar className="h-4 w-4 mr-2" />
            Calendar View
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate("/mentor/schedules/analytics")}
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </Button>
          <Button onClick={() => navigate("/mentor/schedules/create")}>
            <Plus className="h-4 w-4 mr-2" />
            Create Schedule
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Academic Year</label>
              <Select
                value={filters.academicYear}
                onValueChange={(value) => setFilters({ ...filters, academicYear: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Years" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Years</SelectItem>
                  {academicYears.map((year) => (
                    <SelectItem key={year} value={year}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Grade</label>
              <Select
                value={filters.grade}
                onValueChange={(value) => setFilters({ ...filters, grade: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Grades" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Grades</SelectItem>
                  {grades.map((grade) => (
                    <SelectItem key={grade} value={grade}>
                      {grade}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Subject</label>
              <Select
                value={filters.subject}
                onValueChange={(value) => setFilters({ ...filters, subject: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Subjects" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Subjects</SelectItem>
                  {subjects.map((subject) => (
                    <SelectItem key={subject} value={subject}>
                      {subject}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Status</label>
              <Select
                value={filters.status}
                onValueChange={(value) => setFilters({ ...filters, status: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search schedules..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Schedules List */}
      {filteredSchedules.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No schedules found</h3>
            <p className="text-gray-600 mb-4">
              {filters.search || filters.academicYear || filters.grade || filters.subject || filters.status !== "all"
                ? "Try adjusting your filters to see more results."
                : "Create your first schedule to get started."}
            </p>
            {!filters.search && !filters.academicYear && !filters.grade && !filters.subject && filters.status === "all" && (
              <Button onClick={() => navigate("/mentor/schedules/create")}>
                <Plus className="h-4 w-4 mr-2" />
                Create Schedule
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredSchedules.map((schedule) => (
            <Card key={schedule._id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">
                      {schedule.grade} - {schedule.section}
                    </CardTitle>
                    <p className="text-sm text-gray-600">{schedule.subject.name}</p>
                    <p className="text-sm text-gray-500">{schedule.school.name}</p>
                  </div>
                  {getStatusBadge(schedule.sessions[0]?.status || "scheduled")}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {/* Module Info */}
                  <div className="flex items-center gap-2 text-sm">
                    <BookOpen className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">Module:</span>
                    <span>{schedule.module.modules[0]?.name || "N/A"}</span>
                  </div>

                  {/* Academic Year */}
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">Academic Year:</span>
                    <span>{schedule.academicYear}</span>
                  </div>

                  {/* Session Stats */}
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">Sessions:</span>
                    <span>{schedule.completedSessions}/{schedule.totalSessions} completed</span>
                  </div>

                  {/* Next Session */}
                  {schedule.sessions.length > 0 && (
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">Next:</span>
                      <span>
                        {new Date(schedule.sessions[0].date).toLocaleDateString()} at {schedule.sessions[0].startTime}
                      </span>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/mentor/schedules/${schedule._id}`)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/mentor/schedules/${schedule._id}/edit`)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteSchedule(schedule._id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
