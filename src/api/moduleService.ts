import axiosInstance from './axiosInstance';

export interface SubTopic {
  _id?: string;
  name: string;
  description?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Topic {
  _id?: string;
  name: string;
  description?: string;
  subtopics: SubTopic[];
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ModuleItem {
  _id?: string;
  name: string;
  description?: string;
  topics: Topic[];
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Module {
  _id: string;
  grade: number;
  subject: {
    _id: string;
    name: string;
  };
  modules: ModuleItem[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateModuleRequest {
  grade: number;
  subjectId: string;
  modules: ModuleItem[];
}

export interface UpdateModuleRequest {
  modules: ModuleItem[];
}

export const moduleService = {
  // Get all modules
  getAllModules: async (): Promise<Module[]> => {
    const response = await axiosInstance.get('/modules');
    return response.data.data;
  },

  // Get modules by grade and subject
  getModulesByGradeAndSubject: async (grade: number, subjectId: string): Promise<Module> => {
    const response = await axiosInstance.get(`/modules/grade/${grade}/subject/${subjectId}`);
    return response.data.data;
  },

  // Get module by ID
  getModuleById: async (id: string): Promise<Module> => {
    const response = await axiosInstance.get(`/modules/${id}`);
    return response.data.data;
  },

  // Create new module
  createModule: async (data: CreateModuleRequest): Promise<Module> => {
    const response = await axiosInstance.post('/modules', data);
    return response.data.data;
  },

  // Update module
  updateModule: async (id: string, data: UpdateModuleRequest): Promise<Module> => {
    const response = await axiosInstance.put(`/modules/${id}`, data);
    return response.data.data;
  },

  // Delete module
  deleteModule: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/modules/${id}`);
  },
};
