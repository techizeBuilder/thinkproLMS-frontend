export interface Resource {
  id: string;
  title: string;
  description?: string;
  type: ResourceType;
  userType: UserType;
  bucket: BucketType;
  url?: string;
  file?: File;
  uploadedAt: Date;
  updatedAt: Date;
  uploadedBy: string;
  tags?: string[];
  isActive: boolean;
}

export type ResourceType = 'document' | 'video';
export type UserType = 'mentor' | 'student';
export type BucketType = 'documents' | 'videos';

export interface DocumentResource extends Resource {
  type: 'document';
  bucket: 'documents';
  fileType: DocumentFileType;
  fileSize?: number;
  downloadCount?: number;
}

export interface VideoResource extends Resource {
  type: 'video';
  bucket: 'videos';
  videoType: VideoType;
  duration?: number;
  thumbnailUrl?: string;
  viewCount?: number;
}

export type DocumentFileType = 'pdf' | 'pptx' | 'xlsx' | 'docx' | 'link';
export type VideoType = 'mp4' | 'youtube' | 'vimeo' | 'external';

export interface ResourceBucket {
  type: BucketType;
  userType: UserType;
  resources: Resource[];
  totalCount: number;
}

export interface CreateResourceData {
  title: string;
  description?: string;
  type: ResourceType;
  userType: UserType;
  url?: string;
  file?: File;
  tags?: string[];
}

export interface UpdateResourceData extends Partial<CreateResourceData> {
  id: string;
}

export interface ResourceFilters {
  type?: ResourceType;
  userType?: UserType;
  bucket?: BucketType;
  tags?: string[];
  search?: string;
}
