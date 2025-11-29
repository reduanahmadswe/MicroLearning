import axios from 'axios';
import FormData from 'form-data';
import { Types } from 'mongoose';
import {
  ITranscribeAudioRequest,
  ITranscribedAudio,
  ITranslateAudioRequest,
  ITranslatedAudio,
  IASRStats,
} from './asr.types';
import { TranscriptionHistory } from './asr.model';
import ApiError from '../../../utils/ApiError';

/**
 * ASR Configuration
 */
const ASR_CONFIG = {
  openai: {
    apiKey: process.env.OPENAI_API_KEY || '',
    transcribeEndpoint: 'https://api.openai.com/v1/audio/transcriptions',
    translateEndpoint: 'https://api.openai.com/v1/audio/translations',
  },
  defaultModel: 'whisper-1',
  defaultFormat: 'json',
  defaultTemperature: 0,
  costPerMinute: 0.006, // $0.006 per minute
  maxFileSize: 25 * 1024 * 1024, // 25MB
  supportedFormats: ['mp3', 'mp4', 'mpeg', 'mpga', 'm4a', 'wav', 'webm'],
};

/**
 * Calculate ASR cost based on duration
 */
const calculateCost = (durationSeconds: number): number => {
  const durationMinutes = durationSeconds / 60;
  return durationMinutes * ASR_CONFIG.costPerMinute;
};

/**
 * Convert base64 to Buffer
 */
const base64ToBuffer = (base64: string): Buffer => {
  // Remove data URL prefix if present
  const base64Data = base64.replace(/^data:audio\/[a-z]+;base64,/, '');
  return Buffer.from(base64Data, 'base64');
};

/**
 * Transcribe Audio to Text
 */
export const transcribeAudio = async (
  userId: Types.ObjectId,
  data: ITranscribeAudioRequest
): Promise<ITranscribedAudio> => {
  if (!ASR_CONFIG.openai.apiKey) {
    throw new ApiError(500, 'OpenAI API key not configured');
  }

  const startTime = Date.now();
  const model = data.model || ASR_CONFIG.defaultModel;
  const format = data.format || ASR_CONFIG.defaultFormat;

  try {
    // Convert audio file to buffer if it's base64
    const audioBuffer = typeof data.audioFile === 'string' 
      ? base64ToBuffer(data.audioFile) 
      : data.audioFile;

    // Check file size
    if (audioBuffer.length > ASR_CONFIG.maxFileSize) {
      throw new ApiError(400, `File size exceeds maximum allowed size of 25MB`);
    }

    // Create form data
    const formData = new FormData();
    formData.append('file', audioBuffer, {
      filename: data.fileName,
      contentType: 'audio/mpeg',
    });
    formData.append('model', model);
    formData.append('response_format', format);
    
    if (data.language) {
      formData.append('language', data.language);
    }
    if (data.prompt) {
      formData.append('prompt', data.prompt);
    }
    if (data.temperature !== undefined) {
      formData.append('temperature', data.temperature.toString());
    }

    const response = await axios.post(
      ASR_CONFIG.openai.transcribeEndpoint,
      formData,
      {
        headers: {
          'Authorization': `Bearer ${ASR_CONFIG.openai.apiKey}`,
          ...formData.getHeaders(),
        },
        timeout: 120000, // 2 minutes
      }
    );

    const processingTime = Date.now() - startTime;
    
    // Parse response based on format
    let transcription: ITranscribedAudio;
    
    if (format === 'verbose_json') {
      const responseData = response.data;
      const duration = responseData.duration || 0;
      const cost = calculateCost(duration);

      transcription = {
        text: responseData.text,
        language: responseData.language,
        duration,
        segments: responseData.segments?.map((seg: any, idx: number) => ({
          id: idx,
          start: seg.start,
          end: seg.end,
          text: seg.text,
          confidence: seg.no_speech_prob ? 1 - seg.no_speech_prob : undefined,
        })),
        words: responseData.words,
        metadata: {
          model,
          provider: 'openai',
          confidence: responseData.confidence,
          processingTime,
          cost,
        },
      };

      // Save to history if requested
      if (data.saveToHistory) {
        await TranscriptionHistory.create({
          user: userId,
          title: data.title || `Transcription - ${data.fileName}`,
          originalFileName: data.fileName,
          transcription: responseData.text,
          language: responseData.language,
          duration,
          model,
          format,
          lessonId: data.lessonId,
          segments: transcription.segments,
          cost,
        });
      }
    } else if (format === 'json') {
      const text = response.data.text;
      // Estimate duration (rough: 150 words per minute)
      const wordCount = text.split(/\s+/).length;
      const estimatedDuration = (wordCount / 150) * 60;
      const cost = calculateCost(estimatedDuration);

      transcription = {
        text,
        language: data.language,
        duration: estimatedDuration,
        metadata: {
          model,
          provider: 'openai',
          processingTime,
          cost,
        },
      };

      // Save to history if requested
      if (data.saveToHistory) {
        await TranscriptionHistory.create({
          user: userId,
          title: data.title || `Transcription - ${data.fileName}`,
          originalFileName: data.fileName,
          transcription: text,
          language: data.language,
          duration: estimatedDuration,
          model,
          format,
          lessonId: data.lessonId,
          cost,
        });
      }
    } else {
      // For text, srt, vtt formats
      const text = response.data;
      const wordCount = text.split(/\s+/).length;
      const estimatedDuration = (wordCount / 150) * 60;
      const cost = calculateCost(estimatedDuration);

      transcription = {
        text,
        language: data.language,
        duration: estimatedDuration,
        metadata: {
          model,
          provider: 'openai',
          processingTime,
          cost,
        },
      };
    }

    return transcription;
  } catch (error: any) {
    if (error.response) {
      throw new ApiError(
        error.response.status,
        `OpenAI Whisper Error: ${error.response.data?.error?.message || 'Unknown error'}`
      );
    }
    throw new ApiError(500, `Failed to transcribe audio: ${error.message}`);
  }
};

/**
 * Translate Audio to English
 */
export const translateAudio = async (
  _userId: Types.ObjectId,
  data: ITranslateAudioRequest
): Promise<ITranslatedAudio> => {
  if (!ASR_CONFIG.openai.apiKey) {
    throw new ApiError(500, 'OpenAI API key not configured');
  }

  const startTime = Date.now();
  const model = data.model || ASR_CONFIG.defaultModel;

  try {
    const audioBuffer = typeof data.audioFile === 'string' 
      ? base64ToBuffer(data.audioFile) 
      : data.audioFile;

    if (audioBuffer.length > ASR_CONFIG.maxFileSize) {
      throw new ApiError(400, `File size exceeds maximum allowed size of 25MB`);
    }

    const formData = new FormData();
    formData.append('file', audioBuffer, {
      filename: data.fileName,
      contentType: 'audio/mpeg',
    });
    formData.append('model', model);
    
    if (data.prompt) {
      formData.append('prompt', data.prompt);
    }
    if (data.temperature !== undefined) {
      formData.append('temperature', data.temperature.toString());
    }

    const response = await axios.post(
      ASR_CONFIG.openai.translateEndpoint,
      formData,
      {
        headers: {
          'Authorization': `Bearer ${ASR_CONFIG.openai.apiKey}`,
          ...formData.getHeaders(),
        },
        timeout: 120000,
      }
    );

    const processingTime = Date.now() - startTime;
    const text = response.data.text;
    const wordCount = text.split(/\s+/).length;
    const estimatedDuration = (wordCount / 150) * 60;
    const cost = calculateCost(estimatedDuration);

    const translation: ITranslatedAudio = {
      text,
      targetLanguage: 'en',
      duration: estimatedDuration,
      metadata: {
        model,
        provider: 'openai',
        processingTime,
        cost,
      },
    };

    return translation;
  } catch (error: any) {
    if (error.response) {
      throw new ApiError(
        error.response.status,
        `OpenAI Translation Error: ${error.response.data?.error?.message || 'Unknown error'}`
      );
    }
    throw new ApiError(500, `Failed to translate audio: ${error.message}`);
  }
};

/**
 * Get Transcription History
 */
export const getTranscriptionHistory = async (
  userId: Types.ObjectId,
  page: number = 1,
  limit: number = 20,
  language?: string,
  lessonId?: string
) => {
  const filter: any = { user: userId };
  if (language) filter.language = language;
  if (lessonId) filter.lessonId = new Types.ObjectId(lessonId);

  const items = await TranscriptionHistory.find(filter)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .populate('lessonId', 'title')
    .lean();

  const total = await TranscriptionHistory.countDocuments(filter);

  return {
    items,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      itemsPerPage: limit,
    },
  };
};

/**
 * Get Transcription by ID
 */
export const getTranscriptionById = async (userId: Types.ObjectId, transcriptionId: string) => {
  const transcription = await TranscriptionHistory.findOne({
    _id: transcriptionId,
    user: userId,
  }).populate('lessonId', 'title');

  if (!transcription) {
    throw new ApiError(404, 'Transcription not found');
  }

  return transcription;
};

/**
 * Delete Transcription
 */
export const deleteTranscription = async (userId: Types.ObjectId, transcriptionId: string) => {
  const transcription = await TranscriptionHistory.findOneAndDelete({
    _id: transcriptionId,
    user: userId,
  });

  if (!transcription) {
    throw new ApiError(404, 'Transcription not found');
  }

  return { message: 'Transcription deleted successfully' };
};

/**
 * Get ASR Statistics
 */
export const getASRStats = async (userId: Types.ObjectId): Promise<IASRStats> => {
  const items = await TranscriptionHistory.find({ user: userId }).lean();

  const byLanguage: Record<string, number> = {};
  const byModel: Record<string, number> = { 'whisper-1': 0 };

  let totalDuration = 0;
  let totalCost = 0;

  items.forEach((item) => {
    if (item.language) {
      byLanguage[item.language] = (byLanguage[item.language] || 0) + 1;
    }
    byModel[item.model] = (byModel[item.model] || 0) + 1;
    totalDuration += item.duration;
    totalCost += item.cost;
  });

  return {
    totalTranscriptions: items.length,
    totalAudioDuration: totalDuration,
    totalCost,
    byLanguage,
    byModel: byModel as Record<'whisper-1', number>,
    averageDuration: items.length > 0 ? totalDuration / items.length : 0,
    averageAccuracy: 0.95, // Whisper typically has ~95% accuracy
  };
};
