import { Types } from 'mongoose';

/**
 * Text-to-Speech Types
 */

export type TTSVoice = 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';
export type TTSModel = 'tts-1' | 'tts-1-hd';
export type TTSFormat = 'mp3' | 'opus' | 'aac' | 'flac';
export type TTSSpeed = 0.25 | 0.5 | 0.75 | 1.0 | 1.25 | 1.5 | 1.75 | 2.0 | 2.5 | 3.0 | 4.0;

export interface IGenerateSpeechRequest {
  text: string;
  voice?: TTSVoice;
  model?: TTSModel;
  speed?: TTSSpeed;
  format?: TTSFormat;
  saveToLibrary?: boolean;
  lessonId?: Types.ObjectId;
  title?: string;
}

export interface IGeneratedSpeech {
  audioUrl: string;
  audioBuffer?: Buffer;
  duration?: number;
  text: string;
  voice: TTSVoice;
  model: TTSModel;
  format: TTSFormat;
  fileSize?: number;
  metadata: {
    generatedAt: Date;
    provider: string;
    cost: number;
  };
}

export interface ITTSLibraryItem {
  _id?: Types.ObjectId;
  user: Types.ObjectId;
  title: string;
  text: string;
  audioUrl: string;
  duration: number;
  voice: TTSVoice;
  model: TTSModel;
  format: TTSFormat;
  fileSize: number;
  lessonId?: Types.ObjectId;
  plays: number;
  cost: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ITTSStats {
  totalGenerations: number;
  totalAudioDuration: number;
  totalCost: number;
  byVoice: Record<TTSVoice, number>;
  byModel: Record<TTSModel, number>;
  averageDuration: number;
  mostUsedVoice: TTSVoice;
}

export interface IVoicePreview {
  voice: TTSVoice;
  description: string;
  sampleText: string;
  audioUrl: string;
  characteristics: string[];
}
