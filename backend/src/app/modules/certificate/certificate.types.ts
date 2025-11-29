import mongoose from 'mongoose';

export interface ICertificate {
  user: mongoose.Types.ObjectId;
  course: mongoose.Types.ObjectId;
  certificateId: string; // Unique certificate ID
  issuedDate: Date;
  verificationCode: string; // For verification
  metadata: {
    userName: string;
    courseName: string;
    completionDate: Date;
    totalLessons: number;
    score?: number;
    instructor: string;
  };
  isRevoked: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IGenerateCertificateRequest {
  courseId: string;
}

export interface ICertificateResponse {
  _id: string;
  certificateId: string;
  user: {
    _id: string;
    name: string;
    email: string;
  };
  course: {
    _id: string;
    title: string;
  };
  issuedDate: Date;
  verificationCode: string;
  pdfUrl?: string; // For future PDF generation
}
