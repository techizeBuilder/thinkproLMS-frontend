import axiosInstance from './axiosInstance';

export interface Subject {
  _id: string;
  name: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSubjectRequest {
  name: string;
}

export interface UpdateSubjectRequest {
  name: string;
}

export const subjectService = {
  // Get all subjects
  getAllSubjects: async (): Promise<Subject[]> => {
    const response = await axiosInstance.get('/subjects');
    return response.data.data;
  },

  // Get subject by ID
  getSubjectById: async (id: string): Promise<Subject> => {
    const response = await axiosInstance.get(`/subjects/${id}`);
    return response.data.data;
  },

  // Create new subject
  createSubject: async (data: CreateSubjectRequest): Promise<Subject> => {
    const response = await axiosInstance.post('/subjects', data);
    return response.data.data;
  },

  // Update subject
  updateSubject: async (id: string, data: UpdateSubjectRequest): Promise<Subject> => {
    const response = await axiosInstance.put(`/subjects/${id}`, data);
    return response.data.data;
  },

  // Delete subject
  deleteSubject: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/subjects/${id}`);
  },
};
