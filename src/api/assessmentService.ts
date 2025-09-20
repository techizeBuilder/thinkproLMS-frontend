import axiosInstance from "./axiosInstance";

// Types
export interface AssessmentQuestion {
  questionId: string | {
    _id: string;
    questionText: string;
    answerType: string;
    answerChoices: Array<{
      text: string;
      isCorrect: boolean;
      order: number;
    }>;
    correctAnswers: number[];
    difficulty: string;
  };
  order: number;
  marks: number;
}

export interface TargetStudent {
  grade: string;
  sections: string[];
}

export interface Assessment {
  _id: string;
  title: string;
  instructions: string;
  grade: string;
  subject: string;
  modules: string[];
  startDate: string;
  endDate: string;
  duration: number; // in minutes
  questions: AssessmentQuestion[];
  totalMarks: number;
  targetStudents: TargetStudent[];
  school: {
    _id: string;
    name: string;
  };
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
  status: "draft" | "published" | "completed" | "cancelled";
  isActive: boolean;
  totalAttempts: number;
  averageScore: number;
  completionRate: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAssessmentData {
  title: string;
  instructions: string;
  grade: string;
  subject: string;
  modules: string[];
  startDate: string;
  endDate: string;
  duration: number;
  questions: AssessmentQuestion[];
  targetStudents: TargetStudent[];
  school?: string;
}

export interface AssessmentFilters {
  status?: string;
  page?: number;
  limit?: number;
}

export interface QuestionFilters {
  grade?: string;
  subject?: string;
  modules?: string[];
  difficulty?: string;
}

export interface AssessmentAnalytics {
  totalAttempts: number;
  completedAttempts: number;
  averageScore: number;
  averagePercentage: number;
  completionRate: number;
  gradeDistribution: Record<string, number>;
}

// Student Assessment Types
export interface StudentAnswer {
  questionId: string;
  selectedAnswers: number[];
  isCorrect: boolean;
  marksObtained: number;
  timeSpent: number;
}

export interface AssessmentResponse {
  _id: string;
  assessment: string | Assessment;
  student: string;
  answers: StudentAnswer[];
  totalMarksObtained: number;
  percentage: number;
  grade: string;
  status: "in_progress" | "completed" | "submitted" | "timeout";
  startTime: string;
  endTime: string;
  timeSpent: number;
  isSubmitted: boolean;
  submittedAt: string;
  autoSubmitted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AvailableAssessment extends Assessment {
  attemptStatus: string;
  hasAttempted: boolean;
  canRetake: boolean;
}

// Assessment API
export const assessmentService = {
  // Create assessment
  createAssessment: async (data: CreateAssessmentData) => {
    const response = await axiosInstance.post("/assessments", data);
    return response.data;
  },

  // Get assessments
  getAssessments: async (filters: AssessmentFilters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        params.append(key, value.toString());
      }
    });
    
    const response = await axiosInstance.get(`/assessments?${params.toString()}`);
    return response.data;
  },

  // Get single assessment
  getAssessmentById: async (id: string) => {
    const response = await axiosInstance.get(`/assessments/${id}`);
    return response.data;
  },

  // Update assessment
  updateAssessment: async (id: string, data: Partial<CreateAssessmentData>) => {
    const response = await axiosInstance.put(`/assessments/${id}`, data);
    return response.data;
  },

  // Publish assessment
  publishAssessment: async (id: string, notificationMessage?: string) => {
    const response = await axiosInstance.post(`/assessments/${id}/publish`, {
      notificationMessage,
    });
    return response.data;
  },

  // Get assessment analytics
  getAssessmentAnalytics: async (id: string) => {
    const response = await axiosInstance.get(`/assessments/${id}/analytics`);
    return response.data;
  },

  // Delete assessment
  deleteAssessment: async (id: string) => {
    const response = await axiosInstance.delete(`/assessments/${id}`);
    return response.data;
  },

  // Get questions for assessment creation
  getQuestionsForAssessment: async (filters: QuestionFilters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        if (Array.isArray(value)) {
          value.forEach(v => params.append(key, v));
        } else {
          params.append(key, value.toString());
        }
      }
    });
    
    const response = await axiosInstance.get(`/assessments/questions?${params.toString()}`);
    return response.data;
  },
};

// Student Assessment API
export const studentAssessmentService = {
  // Get available assessments for student
  getAvailableAssessments: async () => {
    const response = await axiosInstance.get("/student-assessments/available");
    return response.data;
  },

  // Start assessment
  startAssessment: async (id: string) => {
    const response = await axiosInstance.post(`/student-assessments/${id}/start`);
    return response.data;
  },

  // Submit answer
  submitAnswer: async (responseId: string, questionId: string, selectedAnswers: number[], timeSpent: number) => {
    const response = await axiosInstance.put(`/student-assessments/${responseId}/answer`, {
      questionId,
      selectedAnswers,
      timeSpent,
    });
    return response.data;
  },

  // Submit assessment
  submitAssessment: async (responseId: string) => {
    const response = await axiosInstance.post(`/student-assessments/${responseId}/submit`);
    return response.data;
  },

  // Get assessment results
  getMyAssessmentResults: async () => {
    const response = await axiosInstance.get("/student-assessments/results");
    return response.data;
  },
};
