import axiosInstance from './axiosInstance';

export interface CertificateTemplate {
  _id: string;
  name: string;
  description: string;
  templateHtml: string;
  templateCss: string;
  placeholders: string[];
  isDefault: boolean;
  isActive: boolean;
}

export interface CertificateRecipient {
  student: {
    _id: string;
    studentId: string;
    user: {
      name: string;
      email: string;
    };
  };
  status: 'pending' | 'generated' | 'sent' | 'downloaded';
  generatedAt?: string;
  sentAt?: string;
  downloadedAt?: string;
  pdfPath?: string;
  certificateNumber: string;
}

export interface Certificate {
  _id: string;
  title: string;
  description: string;
  template: CertificateTemplate;
  school: {
    _id: string;
    name: string;
    city: string;
    state: string;
    logo?: string;
  };
  grade: string;
  subject?: {
    _id: string;
    name: string;
  };
  accomplishment: string;
  issuedDate: string;
  validUntil?: string;
  signature: {
    name: string;
    designation: string;
    signatureImage?: string;
  };
  recipients: CertificateRecipient[];
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateCertificateData {
  title: string;
  description?: string;
  templateId: string;
  schoolId: string;
  grade: string;
  subjectId?: string;
  accomplishment: string;
  validUntil?: string;
  signatureName: string;
  signatureDesignation: string;
  signatureImage?: string;
  studentIds: string[];
}

export interface PreviewData {
  certificate: {
    title: string;
    accomplishment: string;
    grade: string;
    school: {
      name: string;
      city: string;
      state: string;
    };
  };
  students: Array<{
    studentId: string;
    studentName: string;
    certificateNumber: string;
    status: string;
  }>;
  totalStudents: number;
}

class CertificateService {
  // Template methods
  async getTemplates(): Promise<{ data: CertificateTemplate[] }> {
    const response = await axiosInstance.get('/certificates/templates');
    return response.data;
  }

  async getTemplateById(id: string): Promise<{ data: CertificateTemplate }> {
    const response = await axiosInstance.get(`/certificates/templates/${id}`);
    return response.data;
  }

  async initializeTemplates(): Promise<{ message: string }> {
    const response = await axiosInstance.post('/certificates/templates/initialize');
    return response.data;
  }

  // Certificate methods
  async getAll(queryParams?: string): Promise<{ data: Certificate[]; pagination?: any }> {
    const url = queryParams ? `/certificates?${queryParams}` : '/certificates';
    const response = await axiosInstance.get(url);
    return response.data;
  }

  async getById(id: string): Promise<{ data: Certificate }> {
    const response = await axiosInstance.get(`/certificates/${id}`);
    return response.data;
  }

  async create(data: CreateCertificateData): Promise<{ data: Certificate; message: string }> {
    const response = await axiosInstance.post('/certificates', data);
    return response.data;
  }

  async preview(certificateId: string, studentIds?: string[]): Promise<{ data: PreviewData }> {
    const response = await axiosInstance.post(`/certificates/${certificateId}/preview`, {
      studentIds: studentIds || [],
    });
    return response.data;
  }

  async generateAndSend(certificateId: string, studentIds?: string[]): Promise<{ 
    message: string; 
    data: { 
      generated: number; 
      failed: number; 
      errors: string[]; 
      results: Record<string, string> 
    } 
  }> {
    const response = await axiosInstance.post(`/certificates/${certificateId}/generate`, {
      studentIds: studentIds || [],
    });
    return response.data;
  }

  async resend(certificateId: string, studentIds: string[]): Promise<{ 
    message: string; 
    data: { 
      resentCount: number; 
      students: Array<{ 
        studentId: string; 
        studentName: string; 
        certificateNumber: string 
      }> 
    } 
  }> {
    const response = await axiosInstance.post(`/certificates/${certificateId}/resend`, {
      studentIds,
    });
    return response.data;
  }

  async download(certificateId: string, studentId: string): Promise<Blob> {
    const response = await axiosInstance.get(`/certificates/${certificateId}/download/${studentId}`, {
      responseType: 'blob',
    });
    return response.data;
  }

  // Student methods for certificate creation
  async getStudentsForCertificate(queryParams: string): Promise<{ data: any[] }> {
    const response = await axiosInstance.get(`/certificates/students?${queryParams}`);
    return response.data;
  }

  // Helper method to download certificate and trigger download
  async downloadCertificate(certificateId: string, studentId: string, fileName?: string): Promise<void> {
    try {
      const blob = await this.download(certificateId, studentId);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName || `certificate_${studentId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading certificate:', error);
      throw error;
    }
  }

  // Get certificates for the current student
  async getStudentCertificates(): Promise<{ data: any[] }> {
    const response = await axiosInstance.get('/certificates/my-certificates');
    return response.data;
  }

  // Download certificate for students (no studentId needed)
  async downloadStudentCertificate(certificateId: string, fileName?: string): Promise<void> {
    try {
      const response = await axiosInstance.get(`/certificates/${certificateId}/download`, {
        responseType: 'blob'
      });
      
      // Create download link
      const url = window.URL.createObjectURL(response.data);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName || `certificate_${certificateId}.pdf`;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading student certificate:', error);
      throw error;
    }
  }
}

export const certificateService = new CertificateService();
