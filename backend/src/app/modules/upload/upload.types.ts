export interface IUploadRequest {
  fileType: 'image' | 'video' | 'audio' | 'document';
  fileName: string;
  fileSize: number;
  mimeType: string;
}

export interface IUploadResponse {
  uploadUrl: string;
  fileUrl: string;
  fileId: string;
  expiresIn: number;
}

export interface IFileMetadata {
  _id: string;
  user: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  fileType: 'image' | 'video' | 'audio' | 'document';
  fileUrl: string;
  fileKey: string;
  isPublic: boolean;
  uploadedAt: Date;
}

export const ALLOWED_FILE_TYPES = {
  image: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
  video: ['video/mp4', 'video/webm', 'video/ogg'],
  audio: ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg'],
  document: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
};

export const MAX_FILE_SIZES = {
  image: 5 * 1024 * 1024, // 5MB
  video: 100 * 1024 * 1024, // 100MB
  audio: 10 * 1024 * 1024, // 10MB
  document: 10 * 1024 * 1024, // 10MB
};
