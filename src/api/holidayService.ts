import api from "./axiosInstance";

export interface Holiday {
  _id: string;
  name: string;
  date: string;
  type: "national" | "regional" | "school" | "religious" | "academic";
  description: string;
  school?: {
    _id: string;
    name: string;
  };
  academicYear: string;
  isRecurring: boolean;
  recurringType?: "yearly" | "monthly" | "weekly";
  isActive: boolean;
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateHolidayData {
  name: string;
  date: string;
  type: "national" | "regional" | "school" | "religious" | "academic";
  description?: string;
  school?: string;
  academicYear: string;
  isRecurring?: boolean;
  recurringType?: "yearly" | "monthly" | "weekly";
}

export interface BulkCreateHolidayData {
  holidays: CreateHolidayData[];
}

class HolidayService {
  // Get all holidays
  async getHolidays(filters?: {
    schoolId?: string;
    academicYear?: string;
    type?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const params = new URLSearchParams();
    if (filters?.schoolId) params.append("schoolId", filters.schoolId);
    if (filters?.academicYear) params.append("academicYear", filters.academicYear);
    if (filters?.type) params.append("type", filters.type);
    if (filters?.startDate) params.append("startDate", filters.startDate);
    if (filters?.endDate) params.append("endDate", filters.endDate);

    const response = await api.get(`/holidays?${params.toString()}`);
    return response.data;
  }

  // Get holiday by ID
  async getHolidayById(id: string) {
    const response = await api.get(`/holidays/${id}`);
    return response.data;
  }

  // Create holiday
  async createHoliday(data: CreateHolidayData) {
    const response = await api.post("/holidays", data);
    return response.data;
  }

  // Bulk create holidays
  async bulkCreateHolidays(data: BulkCreateHolidayData) {
    const response = await api.post("/holidays/bulk", data);
    return response.data;
  }

  // Update holiday
  async updateHoliday(id: string, data: Partial<CreateHolidayData>) {
    const response = await api.put(`/holidays/${id}`, data);
    return response.data;
  }

  // Delete holiday
  async deleteHoliday(id: string) {
    const response = await api.delete(`/holidays/${id}`);
    return response.data;
  }
}

export const holidayService = new HolidayService();
