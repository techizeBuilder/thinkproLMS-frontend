import axiosInstance from "./axiosInstance";

export interface School {
  _id: string;
  name: string;
  address: string;
  board: "ICSE" | "CBSE" | "State" | "Other";
  image?: string;
  logo?: string;
  affiliatedTo?: string;
  state: string;
  city: string;
  branchName?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSchoolData {
  name: string;
  address: string;
  board: "ICSE" | "CBSE" | "State" | "Other";
  image?: string;
  logo?: string;
  affiliatedTo?: string;
  state: string;
  city: string;
  branchName?: string;
}

export interface UpdateSchoolData extends Partial<CreateSchoolData> {}

// School API functions
export const schoolService = {
  // Get all schools
  getAll: async (): Promise<{ success: boolean; data: School[] }> => {
    const response = await axiosInstance.get("/schools");
    return response.data;
  },

  // Get school by ID
  getById: async (id: string): Promise<{ success: boolean; data: School }> => {
    const response = await axiosInstance.get(`/schools/${id}`);
    return response.data;
  },

  // Create new school
  create: async (data: CreateSchoolData): Promise<{ success: boolean; data: School; message: string }> => {
    const response = await axiosInstance.post("/schools", data);
    return response.data;
  },

  // Update school
  update: async (id: string, data: UpdateSchoolData): Promise<{ success: boolean; data: School; message: string }> => {
    const response = await axiosInstance.put(`/schools/${id}`, data);
    return response.data;
  },

  // Delete school
  delete: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await axiosInstance.delete(`/schools/${id}`);
    return response.data;
  },
};
