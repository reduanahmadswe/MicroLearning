import { Types } from 'mongoose';

/**
 * Speech-to-Text (ASR) Types
 */

export type ASRModel = 'whisper-1';
export type ASRLanguage =
  | 'en' | 'es' | 'fr' | 'de' | 'it' | 'pt' | 'ru' | 'ja' | 'ko' | 'zh'
  | 'ar' | 'hi' | 'bn' | 'pa' | 'te' | 'mr' | 'ta' | 'gu' | 'kn' | 'ml' | 'or';
export type ASRFormat = 'json' | 'text' | 'srt' | 'vtt' | 'verbose_json';

export interface ITranscribeAudioRequest {
  audioFile: Buffer | string; // Buffer or base64
  fileName: string;
  language?: ASRLanguage;
  model?: ASRModel;
  prompt?: string;
  format?: ASRFormat;
  temperature?: number;
  saveToHistory?: boolean;
  lessonId?: Types.ObjectId;
  title?: string;
}

export interface ITranscribedAudio {
  text: string;
  language?: string;
  duration?: number;
  segments?: ITranscriptionSegment[];
  words?: ITranscriptionWord[];
  metadata: {
    model: string;
    provider: string;
    confidence?: number;
    processingTime: number;
    cost: number;
  };
}

export interface ITranscriptionSegment {
  id: number;
  start: number;
  end: number;
  text: string;
  confidence?: number;
}

export interface ITranscriptionWord {
  word: string;
  start: number;
  end: number;
  confidence?: number;
}

export interface ITranscriptionHistory {
  _id?: Types.ObjectId;
  user: Types.ObjectId;
  title: string;
  originalFileName: string;
  transcription: string;
  language?: string;
  duration: number;
  model: ASRModel;
  format: ASRFormat;
  lessonId?: Types.ObjectId;
  segments?: ITranscriptionSegment[];
  cost: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IASRStats {
  totalTranscriptions: number;
  totalAudioDuration: number;
  totalCost: number;
  byLanguage: Record<string, number>;
  byModel: Record<ASRModel, number>;
  averageDuration: number;
  averageAccuracy: number;
}

export interface ITranslateAudioRequest {
  audioFile: Buffer | string;
  fileName: string;
  model?: ASRModel;
  prompt?: string;
  temperature?: number;
  saveToHistory?: boolean;
}

export interface ITranslatedAudio {
  text: string;
  detectedLanguage?: string;
  targetLanguage: 'en';
  duration?: number;
  metadata: {
    model: string;
    provider: string;
    processingTime: number;
    cost: number;
  };
}
