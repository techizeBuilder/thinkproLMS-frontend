import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Clock, 
  Users, 
  BookOpen,
  Plus,
  Eye,
  CheckCircle,
  AlertCircle,
  XCircle,
  Home
} from "lucide-react";
import { scheduleService, type CalendarViewData } from "@/api/scheduleService";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export default function ScheduleCalendarPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [calendarData, setCalendarData] = useState<CalendarViewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSessions, setSelectedSessions] = useState<any[]>([]);

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  useEffect(() => {
    loadCalendarData();
  }, [currentDate]);

  const loadCalendarData = async () => {
    try {
      setLoading(true);
      const mentorId = user?.mentorId || "current-mentor-id";
      const response = await scheduleService.getCalendarView({
        mentorId,
        month: currentDate.getMonth() + 1,
        year: currentDate.getFullYear(),
      });
      setCalendarData(response.data);
    } catch (error) {
      console.error("Error loading calendar data:", error);
      toast.error("Failed to load calendar data");
    } finally {
      setLoading(false);
    }
  };

  const navigateMonth = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate);
    if (direction === "prev") {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const handleDateClick = (date: Date, sessions: any[], holidays: any[]) => {
    setSelectedDate(date);
    setSelectedSessions(sessions);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      scheduled: { color: "bg-blue-100 text-blue-800", icon: Clock },
      in_progress: { color: "bg-yellow-100 text-yellow-800", icon: AlertCircle },
      completed: { color: "bg-green-100 text-green-800", icon: CheckCircle },
      cancelled: { color: "bg-red-100 text-red-800", icon: XCircle },
      rescheduled: { color: "bg-purple-100 text-purple-800", icon: CalendarIcon },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.scheduled;
    const Icon = config.icon;

    return (
      <Badge className={`${config.color} flex items-center gap-1 text-xs`}>
        <Icon className="h-3 w-3" />
        {status.replace("_", " ")}
      </Badge>
    );
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isPastDate = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const renderCalendarGrid = () => {
    if (!calendarData) return null;

    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const firstDayWeekday = firstDayOfMonth.getDay();
    const daysInMonth = lastDayOfMonth.getDate();

    const calendarDays = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayWeekday; i++) {
      calendarDays.push(
        <div key={`empty-${i}`} className="h-32 border border-gray-200 bg-gray-50"></div>
      );
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const dayData = calendarData.calendar.find(d => d.day === day);
      const sessions = dayData?.sessions || [];
      const holidays = dayData?.holidays || [];

      const isCurrentDay = isToday(date);
      const isPast = isPastDate(date);

      calendarDays.push(
        <div
          key={day}
          className={`h-32 border border-gray-200 p-2 cursor-pointer hover:bg-gray-50 ${
            isCurrentDay ? "bg-blue-50 border-blue-300" : ""
          } ${isPast ? "bg-gray-50" : ""}`}
          onClick={() => handleDateClick(date, sessions, holidays)}
        >
          <div className="flex items-center justify-between mb-1">
            <span className={`text-sm font-medium ${isCurrentDay ? "text-blue-600" : ""}`}>
              {day}
            </span>
            {holidays.length > 0 && (
              <Badge variant="outline" className="text-xs">
                Holiday
              </Badge>
            )}
          </div>
          
          <div className="space-y-1">
            {sessions.slice(0, 2).map((session, index) => (
              <div
                key={index}
                className="text-xs p-1 rounded bg-blue-100 text-blue-800 truncate"
                title={`${session.grade} ${session.section} - ${session.subject} at ${session.startTime}`}
              >
                {session.startTime} - {session.grade} {session.section}
              </div>
            ))}
            {sessions.length > 2 && (
              <div className="text-xs text-gray-500">
                +{sessions.length - 2} more
              </div>
            )}
          </div>
        </div>
      );
    }

    return calendarDays;
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading calendar...</p>
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
          <h1 className="text-3xl font-bold">Schedule Calendar</h1>
          <p className="text-gray-600">View and manage your class schedules</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => navigate("/mentor/schedules")}
          >
            <Home className="h-4 w-4 mr-2" />
            Back to Schedules
          </Button>
          <Button onClick={() => navigate("/mentor/schedules/create")}>
            <Plus className="h-4 w-4 mr-2" />
            Create Schedule
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5" />
                  {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigateMonth("prev")}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentDate(new Date())}
                  >
                    Today
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigateMonth("next")}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Day headers */}
              <div className="grid grid-cols-7 gap-0 mb-2">
                {dayNames.map((day) => (
                  <div key={day} className="p-2 text-center font-medium text-gray-600 text-sm">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar grid */}
              <div className="grid grid-cols-7 gap-0">
                {renderCalendarGrid()}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Selected Date Info */}
          {selectedDate && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {selectedDate.toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedSessions.length === 0 ? (
                  <p className="text-gray-500 text-sm">No classes scheduled for this day</p>
                ) : (
                  <div className="space-y-3">
                    {selectedSessions.map((session, index) => (
                      <div key={index} className="border rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-gray-500" />
                            <span className="font-medium">
                              {session.startTime} - {session.endTime}
                            </span>
                          </div>
                          {getStatusBadge(session.status)}
                        </div>
                        
                        <div className="space-y-1 text-sm">
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-gray-500" />
                            <span>{session.grade} - {session.section}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <BookOpen className="h-4 w-4 text-gray-500" />
                            <span>{session.subject} - {session.module}</span>
                          </div>
                          <div className="text-gray-500">
                            {session.school}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 mt-3">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/mentor/schedules/${session.scheduleId}`)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {session.status === "scheduled" && (
                            <Button
                              size="sm"
                              onClick={() => navigate(`/mentor/class-reports/create?scheduleId=${session.scheduleId}&sessionId=${session.id}`)}
                            >
                              Start Class
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Classes</span>
                  <span className="font-medium">
                    {calendarData?.calendar.reduce((total, day) => total + day.sessions.length, 0) || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Completed</span>
                  <span className="font-medium text-green-600">
                    {calendarData?.calendar.reduce((total, day) => 
                      total + day.sessions.filter(s => s.status === "completed").length, 0) || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Pending</span>
                  <span className="font-medium text-blue-600">
                    {calendarData?.calendar.reduce((total, day) => 
                      total + day.sessions.filter(s => s.status === "scheduled").length, 0) || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Holidays</span>
                  <span className="font-medium text-orange-600">
                    {calendarData?.calendar.reduce((total, day) => total + day.holidays.length, 0) || 0}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
