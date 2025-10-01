import axiosInstance from "./axiosInstance";

export interface SessionProgress {
  sessionId: string;
  sessionNumber: number;
  sessionName: string;
  displayName: string;
  description: string;
  module: {
    _id: string;
    name: string;
    description?: string;
  };
  isCompleted: boolean;
  completedAt: string | null;
  notes: string;
  grade: number;
  status: "Pending" | "In Progress" | "Completed";
}

export interface MentorSessionProgress {
  sessions: SessionProgress[];
  mentor: {
    _id: string;
    name: string;
    email: string;
  };
  school: string;
  section: string;
  grade: number;
}

export interface MarkSessionCompletionData {
  sessionId: string;
  schoolId: string;
  section: string;
  grade: string;
  isCompleted: boolean;
  status?: "Pending" | "In Progress" | "Completed";
  notes?: string;
}

export interface UpdateSessionStatusData {
  sessionId: string;
  schoolId: string;
  section: string;
  grade: string;
  status: "Pending" | "In Progress" | "Completed";
  notes?: string;
}

export interface School {
  _id: string;
  name: string;
  city: string;
  state: string;
}

export const sessionProgressService = {
  // Get session progress for mentor
  getMentorSessionProgress: async (schoolId?: string, section?: string, grade?: string): Promise<MentorSessionProgress> => {
    const params: any = {};
    if (schoolId) params.schoolId = schoolId;
    if (section) params.section = section;
    if (grade) params.grade = grade;
    
    const response = await axiosInstance.get("/session-progress/mentor/progress", { params });
    return response.data.data;
  },

  // Mark session as completed/incomplete
  markSessionCompleted: async (data: MarkSessionCompletionData) => {
    const response = await axiosInstance.post("/session-progress/mentor/mark-completed", data);
    return response.data;
  },

  // Update session status
  updateSessionStatus: async (data: UpdateSessionStatusData) => {
    const response = await axiosInstance.post("/session-progress/mentor/update-status", data);
    return response.data;
  },

  // Get available schools
  getAvailableSchools: async (): Promise<School[]> => {
    const response = await axiosInstance.get("/session-progress/schools");
    return response.data.data;
  },
};
