import api from "./axiosInstance";

export interface ClassReport {
  _id: string;
  schedule: {
    _id: string;
    grade: string;
    section: string;
  };
  session: string;
  mentor: {
    _id: string;
    user: {
      _id: string;
      name: string;
      email: string;
    };
  };
  school: {
    _id: string;
    name: string;
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
  date: string;
  startTime: string;
  endTime: string;
  actualStartTime?: string;
  actualEndTime?: string;
  status: "in_progress" | "completed" | "cancelled";
  attendance: {
    present: number;
    absent: number;
    total: number;
  };
  topicsCovered: string[];
  homework: string;
  notes: string;
  challenges: string;
  nextClassPreparation: string;
  studentEngagement: "excellent" | "good" | "average" | "poor";
  classEffectiveness: "excellent" | "good" | "average" | "poor";
  submittedAt: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateClassReportData {
  scheduleId: string;
  sessionId: string;
  actualStartTime?: string;
  actualEndTime?: string;
  status: "in_progress" | "completed" | "cancelled";
  attendance?: {
    present: number;
    absent: number;
    total: number;
  };
  topicsCovered?: string[];
  homework?: string;
  notes?: string;
  challenges?: string;
  nextClassPreparation?: string;
  studentEngagement?: "excellent" | "good" | "average" | "poor";
  classEffectiveness?: "excellent" | "good" | "average" | "poor";
}

export interface ClassReportAnalytics {
  totalReports: number;
  completedClasses: number;
  cancelledClasses: number;
  averageAttendance: number;
  totalStudents: number;
  gradeWiseStats: Record<string, {
    total: number;
    completed: number;
    averageAttendance: number;
  }>;
  subjectWiseStats: Record<string, {
    total: number;
    completed: number;
    averageAttendance: number;
  }>;
  engagementStats: {
    excellent: number;
    good: number;
    average: number;
    poor: number;
  };
  effectivenessStats: {
    excellent: number;
    good: number;
    average: number;
    poor: number;
  };
}

class ClassReportService {
  // Create class report
  async createClassReport(data: CreateClassReportData) {
    const response = await api.post("/class-reports", data);
    return response.data;
  }

  // Get class reports for a mentor
  async getMentorClassReports(mentorId: string, filters?: {
    startDate?: string;
    endDate?: string;
    status?: string;
    grade?: string;
    subject?: string;
  }) {
    const params = new URLSearchParams();
    if (filters?.startDate) params.append("startDate", filters.startDate);
    if (filters?.endDate) params.append("endDate", filters.endDate);
    if (filters?.status) params.append("status", filters.status);
    if (filters?.grade) params.append("grade", filters.grade);
    if (filters?.subject) params.append("subject", filters.subject);

    const response = await api.get(`/class-reports/mentor/${mentorId}?${params.toString()}`);
    return response.data;
  }

  // Get class report by ID
  async getClassReportById(id: string) {
    const response = await api.get(`/class-reports/${id}`);
    return response.data;
  }

  // Update class report
  async updateClassReport(id: string, data: Partial<CreateClassReportData>) {
    const response = await api.put(`/class-reports/${id}`, data);
    return response.data;
  }

  // Get class report analytics
  async getClassReportAnalytics(filters?: {
    mentorId?: string;
    schoolId?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const params = new URLSearchParams();
    if (filters?.mentorId) params.append("mentorId", filters.mentorId);
    if (filters?.schoolId) params.append("schoolId", filters.schoolId);
    if (filters?.startDate) params.append("startDate", filters.startDate);
    if (filters?.endDate) params.append("endDate", filters.endDate);

    const response = await api.get(`/class-reports/analytics?${params.toString()}`);
    return response.data;
  }

  // Delete class report
  async deleteClassReport(id: string) {
    const response = await api.delete(`/class-reports/${id}`);
    return response.data;
  }
}

export const classReportService = new ClassReportService();
