import axiosInstance from "./axiosInstance";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8000/api";

const reportService = {
  // Test endpoint
  testConnection: async () => {
    const response = await axiosInstance.get(`/reports/test`);
    return response.data;
  },

  // Get module completion report
  getModuleCompletionReport: async (filters?: {
    grade?: string;
    subject?: string;
    section?: string;
    schoolId?: string;
  }) => {
    const params = new URLSearchParams();
    if (filters?.grade) params.append("grade", filters.grade);
    if (filters?.subject) params.append("subject", filters.subject);
    if (filters?.section) params.append("section", filters.section);
    if (filters?.schoolId) params.append("schoolId", filters.schoolId);

    const response = await axiosInstance.get(
      `/reports/module-completion?${params.toString()}`
    );
    return response.data;
  },

  // Get summary report
  getSummaryReport: async (filters?: { schoolId?: string }) => {
    const params = new URLSearchParams();
    if (filters?.schoolId) params.append("schoolId", filters.schoolId);

    const response = await axiosInstance.get(
      `/reports/summary?${params.toString()}`
    );
    return response.data;
  },

  // Get assessment completion report
  getAssessmentCompletionReport: async (filters?: {
    grade?: string;
    subject?: string;
    section?: string;
    schoolId?: string;
  }) => {
    const params = new URLSearchParams();
    if (filters?.grade) params.append("grade", filters.grade);
    if (filters?.subject) params.append("subject", filters.subject);
    if (filters?.section) params.append("section", filters.section);
    if (filters?.schoolId) params.append("schoolId", filters.schoolId);

    const response = await axiosInstance.get(
      `/reports/assessment-completion?${params.toString()}`
    );
    return response.data;
  },

  // Get student activity report
  getStudentActivityReport: async (filters?: {
    studentId?: string;
    grade?: string;
    section?: string;
    subject?: string;
    schoolId?: string;
    startDate?: string;
    endDate?: string;
  }) => {
    const params = new URLSearchParams();
    if (filters?.studentId) params.append("studentId", filters.studentId);
    if (filters?.grade) params.append("grade", filters.grade);
    if (filters?.section) params.append("section", filters.section);
    if (filters?.subject) params.append("subject", filters.subject);
    if (filters?.schoolId) params.append("schoolId", filters.schoolId);
    if (filters?.startDate) params.append("startDate", filters.startDate);
    if (filters?.endDate) params.append("endDate", filters.endDate);

    const response = await axiosInstance.get(
      `/reports/student-activity?${params.toString()}`
    );
    return response.data;
  },

  // Get graphical report data
  getGraphicalReportData: async (
    type: string,
    filters?: {
      grade?: string;
      subject?: string;
      section?: string;
      schoolId?: string;
      startDate?: string;
      endDate?: string;
    }
  ) => {
    const params = new URLSearchParams();
    if (filters?.grade) params.append("grade", filters.grade);
    if (filters?.subject) params.append("subject", filters.subject);
    if (filters?.section) params.append("section", filters.section);
    if (filters?.schoolId) params.append("schoolId", filters.schoolId);
    if (filters?.startDate) params.append("startDate", filters.startDate);
    if (filters?.endDate) params.append("endDate", filters.endDate);

    const response = await axiosInstance.get(
      `/reports/graphical/${type}?${params.toString()}`
    );
    return response.data;
  },
};

export default reportService;

// Type definitions for reports
export interface ModuleCompletionReportItem {
  studentId: string;
  studentName: string;
  studentEmail: string;
  grade: string;
  section: string;
  schoolName: string;
  subject: string;
  module: string;
  status: "completed" | "pending";
  completedAt: string | null;
}

export interface ModuleCompletionSummary {
  grade: string;
  subject: string;
  section: string;
  totalStudents: number;
  completedModules: number;
  pendingModules: number;
  completionRate: number;
}

export interface ModuleCompletionReport {
  detailed: ModuleCompletionReportItem[];
  summary: ModuleCompletionSummary[];
  filters: {
    grade?: string;
    subject?: string;
    section?: string;
    schoolId?: string;
  };
}

export interface SummaryReport {
  overview: {
    totalStudents: number;
    totalModules: number;
    totalAssessments: number;
    totalActivities: number;
  };
  byGrade: Record<
    string,
    {
      totalStudents: number;
      completedModules: number;
      completedAssessments: number;
      totalActivities: number;
    }
  >;
  bySubject: Record<
    string,
    {
      totalModules: number;
      totalStudents: number;
      completedModules: number;
    }
  >;
  bySection: Record<string, any>;
  moduleStatus: {
    completed: number;
    inProgress: number;
    pending: number;
  };
  assessmentStatus: {
    completed: number;
    inProgress: number;
    pending: number;
  };
}

export interface AssessmentCompletionReportItem {
  studentId: string;
  studentName: string;
  studentEmail: string;
  grade: string;
  section: string;
  schoolName: string;
  subject: string;
  modules: string[];
  assessmentTitle: string;
  status: string;
  score: number;
  percentage: number;
  assessmentGrade: string;
  timeSpent: number;
  submittedAt: string | null;
  startTime: string | null;
  endTime: string | null;
}

export interface AssessmentCompletionSummary {
  grade: string;
  subject: string;
  section: string;
  totalAssessments: number;
  completedAssessments: number;
  pendingAssessments: number;
  averageScore: number;
  completionRate: number;
}

export interface AssessmentCompletionReport {
  detailed: AssessmentCompletionReportItem[];
  summary: AssessmentCompletionSummary[];
  filters: {
    grade?: string;
    subject?: string;
    section?: string;
    schoolId?: string;
  };
}

export interface StudentActivityReportItem {
  studentId: string;
  studentName: string;
  studentEmail: string;
  grade: string;
  section: string;
  schoolName: string;
  videoViews: number;
  resourceDownloads: number;
  resourceViews: number;
  moduleAccesses: number;
  moduleCompletions: number;
  assessmentSubmissions: number;
  uniqueResourcesAccessed: number;
  totalTimeSpent: number;
  totalTimeSpentFormatted: string;
  videoTimeSpent: number;
  videoTimeSpentFormatted: string;
  assessmentScores: Array<{
    assessmentTitle: string;
    subject: string;
    modules: string[];
    score: number;
    percentage: number;
    grade: string;
    timeSpent: number;
    submittedAt: string | null;
    status: string;
  }>;
  recentActivities: Array<{
    type: string;
    resource: string;
    assessment: string;
    module: string;
    subject: string;
    timeSpent: number;
    createdAt: string;
  }>;
}

export interface StudentActivitySummary {
  totalStudents: number;
  totalActivities: number;
  totalVideoViews: number;
  totalResourceDownloads: number;
  totalModuleCompletions: number;
  totalAssessmentSubmissions: number;
  averageTimeSpent: number;
  averageVideoTimeSpent: number;
}

export interface StudentActivityReport {
  detailed: StudentActivityReportItem[];
  summary: StudentActivitySummary;
  filters: {
    studentId?: string;
    grade?: string;
    section?: string;
    subject?: string;
    schoolId?: string;
    startDate?: string;
    endDate?: string;
  };
}

export interface ChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string;
  }>;
}
