import axiosInstance from "./axiosInstance";

export interface Student {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
    isVerified: boolean;
    createdAt: string;
  };
  studentId: string;
  rollNumber: string;
  grade: number;
  section: string;
  school: {
    _id: string;
    name: string;
    city: string;
    state: string;
    boards: string[];
    branchName: string;
  };
  addedBy: {
    _id: string;
    name: string;
    email: string;
    role: string;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateStudentData {
  name: string;
  email: string;
  rollNumber: string;
  grade: string;
  section: string;
  school: string;
}

export interface UpdateStudentData {
  name?: string;
  email?: string;
  rollNumber?: string;
  grade?: string;
  section?: string;
  school?: string;
  isActive?: boolean;
}

// Student API functions
export const studentService = {
  // Get all students
  getAll: async (filters?: {
    schoolId?: string;
    grade?: string;
  }): Promise<{ success: boolean; data: Student[] }> => {
    const params = new URLSearchParams();
    if (filters?.schoolId) params.append("schoolId", filters.schoolId);
    if (filters?.grade) params.append("grade", filters.grade);

    const response = await axiosInstance.get(`/students?${params.toString()}`);
    return response.data;
  },

  // Get student by ID
  getById: async (id: string): Promise<{ success: boolean; data: Student }> => {
    const response = await axiosInstance.get(`/students/${id}`);
    return response.data;
  },

  // Get my profile (for students)
  getMyProfile: async (): Promise<{ success: boolean; data: Student }> => {
    const response = await axiosInstance.get("/students/my-profile");
    return response.data;
  },

  // Create new student
  create: async (
    data: CreateStudentData
  ): Promise<{ success: boolean; data: Student; message: string }> => {
    const response = await axiosInstance.post("/students", data);
    return response.data;
  },

  // Create multiple students (bulk upload)
  createBulk: async (
    data: CreateStudentData[]
  ): Promise<{
    success: boolean;
    data: { created: Student[]; errors: any[] };
    message: string;
  }> => {
    const response = await axiosInstance.post("/students/bulk", data);
    return response.data;
  },

  // Update student
  update: async (
    id: string,
    data: UpdateStudentData
  ): Promise<{ success: boolean; data: Student; message: string }> => {
    const response = await axiosInstance.put(`/students/${id}`, data);
    return response.data;
  },

  // Deactivate student (soft delete)
  deactivate: async (
    id: string
  ): Promise<{ success: boolean; message: string }> => {
    const response = await axiosInstance.patch(`/students/${id}/deactivate`);
    return response.data;
  },

  // Delete student (hard delete - only superadmin)
  delete: async (
    id: string
  ): Promise<{ success: boolean; message: string }> => {
    const response = await axiosInstance.delete(`/students/${id}`);
    return response.data;
  },

  // Reset student password
  resetPassword: async (
    id: string
  ): Promise<{
    success: boolean;
    data: { password: string };
    message: string;
  }> => {
    const response = await axiosInstance.post(`/students/${id}/reset-password`);
    return response.data;
  },

  // Get students for certificate creation
  getForCertificate: async (
    queryParams: string
  ): Promise<{ success: boolean; data: any[] }> => {
    const response = await axiosInstance.get(`/certificates/students?${queryParams}`);
    return response.data;
  },
};
