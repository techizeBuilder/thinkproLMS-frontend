import { axiosInstance } from './axiosInstance';

export const fileUploadService = {
  // Traditional upload through backend
  uploadVideo: async (file: File) => {
    const formData = new FormData();
    formData.append('video', file);
    
    const response = await axiosInstance.post('/files/video', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  uploadImage: async (file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    
    const response = await axiosInstance.post('/files/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  uploadDocument: async (file: File) => {
    const formData = new FormData();
    formData.append('document', file);
    
    const response = await axiosInstance.post('/files/document', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Direct upload to S3 (like in the image example)
  directUpload: async (file: File) => {
    // Step 1: Get presigned URL from backend
    const presignedResponse = await axiosInstance.post('/files/direct', {
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size
    });

    const { presignedUrl, key, fileUrl } = presignedResponse.data.data;

    // Step 2: Upload directly to S3
    const uploadResponse = await fetch(presignedUrl, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': file.type,
      },
    });

    if (!uploadResponse.ok) {
      throw new Error('Failed to upload file to S3');
    }

    return {
      success: true,
      data: {
        fileUrl,
        key,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type
      }
    };
  },

  // Multiple file upload
  uploadMultiple: async (files: File[]) => {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });
    
    const response = await axiosInstance.post('/files/multiple', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  deleteFile: async (s3Key: string) => {
    const response = await axiosInstance.delete(`/files/${s3Key}`);
    return response.data;
  },

  // Test routes (for testing purposes)
  testUploadVideo: async (file: File) => {
    const formData = new FormData();
    formData.append('video', file);
    
    const response = await axiosInstance.post('/test/upload/video', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  testUploadImage: async (file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    
    const response = await axiosInstance.post('/test/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  testUploadDocument: async (file: File) => {
    const formData = new FormData();
    formData.append('document', file);
    
    const response = await axiosInstance.post('/test/upload/document', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  testUploadMultiple: async (files: File[]) => {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });
    
    const response = await axiosInstance.post('/test/upload/multiple', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  testDirectUpload: async (file: File) => {
    const response = await axiosInstance.post('/test/upload/direct', {
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size
    });
    return response.data;
  }
};
