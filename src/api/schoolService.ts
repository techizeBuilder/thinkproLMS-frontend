import axiosInstance from "./axiosInstance";

export interface SchoolHead {
  name: string;
  designation: string;
  email: string;
  phoneNumber: string;
  profilePic?: string;
}

export interface GradeWithSections {
  grade: number;
  sections: string[];
}

export interface ServiceDetails {
  serviceType: string;
  mentors: ("School Mentor" | "Thinker Mentor")[];
  subjects: string[];
  grades: GradeWithSections[];
}

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
  contractStartDate?: string;
  contractEndDate?: string;
  projectStartDate?: string;
  projectEndDate?: string;
  contractDocument?: string;
  schoolHeads?: SchoolHead[];
  serviceDetails?: ServiceDetails;
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
  contractStartDate?: string;
  contractEndDate?: string;
  projectStartDate?: string;
  projectEndDate?: string;
  contractDocument?: File;
  schoolHeads?: SchoolHead[];
  serviceDetails?: ServiceDetails;
}

export interface UpdateSchoolData extends Partial<CreateSchoolData> {}

// School API functions
export const schoolService = {
  // Get all schools
  getAll: async (filters?: { state?: string; city?: string; includeInactive?: boolean }): Promise<{ success: boolean; data: School[] }> => {
    const params = new URLSearchParams();
    if (filters?.state && filters.state !== 'all') params.append('state', filters.state);
    if (filters?.city && filters.city !== 'all') params.append('city', filters.city);
    if (filters?.includeInactive) params.append('includeInactive', 'true');
    
    const response = await axiosInstance.get(`/schools?${params.toString()}`);
    return response.data;
  },

  // Get school by ID
  getById: async (id: string): Promise<{ success: boolean; data: School }> => {
    const response = await axiosInstance.get(`/schools/${id}`);
    return response.data;
  },

  // Create new school
  create: async (data: CreateSchoolData): Promise<{ success: boolean; data: School; message: string }> => {
    const formData = new FormData();
    
    // Add all fields to FormData
    formData.append('name', data.name);
    formData.append('address', data.address);
    formData.append('board', data.board);
    formData.append('state', data.state);
    formData.append('city', data.city);
    
    if (data.image) formData.append('image', data.image);
    if (data.logo) formData.append('logo', data.logo);
    if (data.affiliatedTo) formData.append('affiliatedTo', data.affiliatedTo);
    if (data.branchName) formData.append('branchName', data.branchName);
    if (data.contractStartDate) formData.append('contractStartDate', data.contractStartDate);
    if (data.contractEndDate) formData.append('contractEndDate', data.contractEndDate);
    if (data.projectStartDate) formData.append('projectStartDate', data.projectStartDate);
    if (data.projectEndDate) formData.append('projectEndDate', data.projectEndDate);
    if (data.contractDocument) formData.append('contractDocument', data.contractDocument);
    if (data.schoolHeads) formData.append('schoolHeads', JSON.stringify(data.schoolHeads));
    if (data.serviceDetails) formData.append('serviceDetails', JSON.stringify(data.serviceDetails));

    const response = await axiosInstance.post("/schools", formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Update school
  update: async (id: string, data: UpdateSchoolData): Promise<{ success: boolean; data: School; message: string }> => {
    const formData = new FormData();
    
    // Add all fields to FormData
    if (data.name !== undefined) formData.append('name', data.name);
    if (data.address !== undefined) formData.append('address', data.address);
    if (data.board !== undefined) formData.append('board', data.board);
    if (data.state !== undefined) formData.append('state', data.state);
    if (data.city !== undefined) formData.append('city', data.city);
    if (data.image !== undefined) formData.append('image', data.image);
    if (data.logo !== undefined) formData.append('logo', data.logo);
    if (data.affiliatedTo !== undefined) formData.append('affiliatedTo', data.affiliatedTo);
    if (data.branchName !== undefined) formData.append('branchName', data.branchName);
    if (data.contractStartDate !== undefined) formData.append('contractStartDate', data.contractStartDate);
    if (data.contractEndDate !== undefined) formData.append('contractEndDate', data.contractEndDate);
    if (data.projectStartDate !== undefined) formData.append('projectStartDate', data.projectStartDate);
    if (data.projectEndDate !== undefined) formData.append('projectEndDate', data.projectEndDate);
    if (data.contractDocument !== undefined) formData.append('contractDocument', data.contractDocument);
    if (data.schoolHeads !== undefined) formData.append('schoolHeads', JSON.stringify(data.schoolHeads));
    if (data.serviceDetails !== undefined) formData.append('serviceDetails', JSON.stringify(data.serviceDetails));

    const response = await axiosInstance.put(`/schools/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Delete school
  delete: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await axiosInstance.delete(`/schools/${id}`);
    return response.data;
  },

  // Toggle school activation status
  toggleStatus: async (id: string, isActive: boolean): Promise<{ success: boolean; data: School; message: string }> => {
    const response = await axiosInstance.patch(`/schools/${id}/toggle-status`, { isActive });
    return response.data;
  },
};
