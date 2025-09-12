import axiosInstance from "./axiosInstance";
import type { School } from "./schoolService";

export interface User {
  _id: string;
  name: string;
  email: string;
  isVerified: boolean;
  createdAt: string;
}

export interface SchoolAdmin {
  _id: string;
  user: User;
  assignedSchools: School[];
  phoneNumber: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSchoolAdminData {
  name: string;
  email: string;
  phoneNumber: string;
  assignedSchools: string[];
}

export interface UpdateSchoolAdminData {
  phoneNumber?: string;
  assignedSchools?: string[];
  isActive?: boolean;
}

// School Admin API functions
export const schoolAdminService = {
  // Get all school admins
  getAll: async (): Promise<{ success: boolean; data: SchoolAdmin[] }> => {
    const response = await axiosInstance.get("/school-admins");
    return response.data;
  },

  // Get school admins by school ID
  getBySchool: async (schoolId: string): Promise<{ success: boolean; data: SchoolAdmin[] }> => {
    const response = await axiosInstance.get(`/school-admins/school/${schoolId}`);
    return response.data;
  },

  // Create new school admin
  create: async (data: CreateSchoolAdminData): Promise<{ success: boolean; data: SchoolAdmin; message: string }> => {
    const response = await axiosInstance.post("/school-admins", data);
    return response.data;
  },

  // Update school admin
  update: async (id: string, data: UpdateSchoolAdminData): Promise<{ success: boolean; data: SchoolAdmin; message: string }> => {
    const response = await axiosInstance.put(`/school-admins/${id}`, data);
    return response.data;
  },

  // Delete school admin
  delete: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await axiosInstance.delete(`/school-admins/${id}`);
    return response.data;
  },
};
