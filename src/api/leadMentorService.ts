import axiosInstance from "./axiosInstance";
import type { School } from "./schoolService";

export interface User {
  _id: string;
  name: string;
  email: string;
  isVerified: boolean;
  createdAt: string;
}

export interface LeadMentor {
  _id: string;
  user: User;
  phoneNumber: string;
  assignedSchools: School[];
  hasAccessToAllSchools: boolean;
  permissions: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLeadMentorData {
  name: string;
  email: string;
  phoneNumber: string;
  assignedSchools?: string[];
  hasAccessToAllSchools?: boolean;
  permissions?: string[];
}

export interface UpdateLeadMentorData {
  name?: string;
  phoneNumber?: string;
  assignedSchools?: string[];
  hasAccessToAllSchools?: boolean;
  permissions?: string[];
  isActive?: boolean;
}

// Lead Mentor API functions
export const leadMentorService = {
  // Get all lead mentors
  getAll: async (): Promise<{ success: boolean; data: LeadMentor[] }> => {
    const response = await axiosInstance.get("/lead-mentors");
    return response.data;
  },

  // Get lead mentor by ID
  getById: async (id: string): Promise<{ success: boolean; data: LeadMentor }> => {
    const response = await axiosInstance.get(`/lead-mentors/${id}`);
    return response.data;
  },

  // Create new lead mentor
  create: async (data: CreateLeadMentorData): Promise<{ success: boolean; data: LeadMentor; message: string }> => {
    const response = await axiosInstance.post("/lead-mentors", data);
    return response.data;
  },

  // Update lead mentor
  update: async (id: string, data: UpdateLeadMentorData): Promise<{ success: boolean; data: LeadMentor; message: string }> => {
    const response = await axiosInstance.put(`/lead-mentors/${id}`, data);
    return response.data;
  },

  // Delete lead mentor
  delete: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await axiosInstance.delete(`/lead-mentors/${id}`);
    return response.data;
  },
};
