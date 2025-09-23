import api from "./axiosInstance";

export interface ClassSession {
  _id?: string;
  date: string;
  startTime: string;
  endTime: string;
  status: "scheduled" | "in_progress" | "completed" | "cancelled" | "rescheduled";
  notes?: string;
  completedAt?: string;
  rescheduledTo?: string;
  rescheduledFrom?: string;
  attendance?: {
    present: number;
    absent: number;
    total: number;
  };
}

export interface Schedule {
  _id: string;
  school: {
    _id: string;
    name: string;
    address: string;
  };
  mentor: {
    _id: string;
    user: {
      _id: string;
      name: string;
      email: string;
    };
  };
  grade: string;
  section: string;
  subject: {
    _id: string;
    name: string;
  };
  module: {
    _id: string;
    modules: Array<{
      _id: string;
      name: string;
      description?: string;
    }>;
  };
  academicYear: string;
  sessions: ClassSession[];
  totalSessions: number;
  completedSessions: number;
  pendingSessions: number;
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateScheduleData {
  school: string;
  mentor: string;
  grade: string;
  section: string;
  subject: string;
  module: string;
  academicYear: string;
  sessions?: ClassSession[];
}

export interface UpdateSessionStatusData {
  status: "scheduled" | "in_progress" | "completed" | "cancelled" | "rescheduled";
  notes?: string;
  attendance?: {
    present: number;
    absent: number;
    total: number;
  };
}

export interface RescheduleSessionData {
  newDate: string;
  newStartTime: string;
  newEndTime: string;
  reason?: string;
}

export interface CalendarViewData {
  calendar: Array<{
    date: string;
    day: number;
    sessions: Array<{
      id: string;
      scheduleId: string;
      grade: string;
      section: string;
      subject: string;
      module: string;
      startTime: string;
      endTime: string;
      status: string;
      school: string;
    }>;
    holidays: Array<{
      name: string;
      type: string;
    }>;
  }>;
  month: number;
  year: number;
}

export interface ScheduleAnalytics {
  totalSchedules: number;
  totalSessions: number;
  completedSessions: number;
  pendingSessions: number;
  cancelledSessions: number;
  gradeWiseStats: Record<string, {
    total: number;
    completed: number;
    pending: number;
  }>;
  subjectWiseStats: Record<string, {
    total: number;
    completed: number;
    pending: number;
  }>;
  monthlyStats: Record<string, {
    total: number;
    completed: number;
    pending: number;
  }>;
}

class ScheduleService {
  // Get all schedules for a mentor
  async getMentorSchedules(mentorId: string, filters?: {
    academicYear?: string;
    grade?: string;
    subject?: string;
    status?: string;
  }) {
    const params = new URLSearchParams();
    if (filters?.academicYear) params.append("academicYear", filters.academicYear);
    if (filters?.grade) params.append("grade", filters.grade);
    if (filters?.subject) params.append("subject", filters.subject);
    if (filters?.status) params.append("status", filters.status);

    const response = await api.get(`/schedules/mentor/${mentorId}?${params.toString()}`);
    return response.data;
  }

  // Get schedule by ID
  async getScheduleById(id: string) {
    const response = await api.get(`/schedules/${id}`);
    return response.data;
  }

  // Create new schedule
  async createSchedule(data: CreateScheduleData) {
    const response = await api.post("/schedules", data);
    return response.data;
  }

  // Update schedule
  async updateSchedule(id: string, data: Partial<CreateScheduleData>) {
    const response = await api.put(`/schedules/${id}`, data);
    return response.data;
  }

  // Update session status
  async updateSessionStatus(scheduleId: string, sessionId: string, data: UpdateSessionStatusData) {
    const response = await api.put(`/schedules/${scheduleId}/sessions/${sessionId}/status`, data);
    return response.data;
  }

  // Reschedule session
  async rescheduleSession(scheduleId: string, sessionId: string, data: RescheduleSessionData) {
    const response = await api.put(`/schedules/${scheduleId}/sessions/${sessionId}/reschedule`, data);
    return response.data;
  }

  // Get calendar view
  async getCalendarView(filters?: {
    mentorId?: string;
    schoolId?: string;
    month?: number;
    year?: number;
  }) {
    const params = new URLSearchParams();
    if (filters?.mentorId) params.append("mentorId", filters.mentorId);
    if (filters?.schoolId) params.append("schoolId", filters.schoolId);
    if (filters?.month) params.append("month", filters.month.toString());
    if (filters?.year) params.append("year", filters.year.toString());

    const response = await api.get(`/schedules/calendar?${params.toString()}`);
    return response.data;
  }

  // Get schedule analytics
  async getScheduleAnalytics(filters?: {
    mentorId?: string;
    schoolId?: string;
    academicYear?: string;
  }) {
    const params = new URLSearchParams();
    if (filters?.mentorId) params.append("mentorId", filters.mentorId);
    if (filters?.schoolId) params.append("schoolId", filters.schoolId);
    if (filters?.academicYear) params.append("academicYear", filters.academicYear);

    const response = await api.get(`/schedules/analytics?${params.toString()}`);
    return response.data;
  }

  // Delete schedule
  async deleteSchedule(id: string) {
    const response = await api.delete(`/schedules/${id}`);
    return response.data;
  }
}

export const scheduleService = new ScheduleService();
