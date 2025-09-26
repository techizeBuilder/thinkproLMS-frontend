import axiosInstance from "./axiosInstance";

export interface ModuleItemCompletion {
  moduleItemId: string;
  moduleItemName: string;
  moduleItemDescription: string;
  isCompleted: boolean;
  completedAt: string | null;
  notes: string;
  completionPercentage: number;
}

export interface ModuleProgress {
  moduleId: string;
  grade: number;
  subject: {
    _id: string;
    name: string;
  };
  totalItems: number;
  completedItems: number;
  overallProgress: number;
  moduleItems: ModuleItemCompletion[];
}

export interface MentorModuleProgress {
  school: {
    _id: string;
    name: string;
    city: string;
    state: string;
  };
  mentor: {
    _id: string;
    name: string;
  };
  moduleProgress: ModuleProgress[];
}

export interface MarkCompletionData {
  moduleId: string;
  moduleItemId: string;
  schoolId: string;
  isCompleted: boolean;
  notes?: string;
  completionPercentage?: number;
}

export interface School {
  _id: string;
  name: string;
  city: string;
  state: string;
}

export interface ModuleCompletionReport {
  mentor: {
    _id: string;
    name: string;
    email: string;
  };
  school: {
    _id: string;
    name: string;
    city: string;
    state: string;
  };
  modules: {
    moduleId: string;
    grade: number;
    subject: {
      _id: string;
      name: string;
    };
    totalItems: number;
    completedItems: number;
    progress: number;
    items: {
      moduleItemId: string;
      isCompleted: boolean;
      completedAt: string | null;
      notes: string;
      completionPercentage: number;
    }[];
  }[];
  totalItems: number;
  completedItems: number;
  overallProgress: number;
}

export const moduleCompletionService = {
  // Get module progress for mentor
  getMentorModuleProgress: async (schoolId?: string): Promise<MentorModuleProgress> => {
    const params = schoolId ? { schoolId } : {};
    const response = await axiosInstance.get("/module-completion/mentor/progress", { params });
    return response.data.data;
  },

  // Mark module item as completed/incomplete
  markModuleItemCompleted: async (data: MarkCompletionData) => {
    const response = await axiosInstance.post("/module-completion/mentor/mark-completed", data);
    return response.data;
  },

  // Get available schools
  getAvailableSchools: async (): Promise<School[]> => {
    const response = await axiosInstance.get("/module-completion/schools");
    return response.data.data;
  },

  // Get module completion reports (lead mentor only)
  getModuleCompletionReports: async (schoolId?: string, mentorId?: string): Promise<ModuleCompletionReport[]> => {
    const params: any = {};
    if (schoolId) params.schoolId = schoolId;
    if (mentorId) params.mentorId = mentorId;
    
    const response = await axiosInstance.get("/module-completion/reports", { params });
    return response.data.data;
  },
};
