import axios from 'axios';
import { Types } from 'mongoose';
import {
  IGenerateSpeechRequest,
  IGeneratedSpeech,
  ITTSStats,
  IVoicePreview,
  TTSVoice,
} from './tts.types';
import { TTSLibrary } from './tts.model';
import ApiError from '../../../utils/ApiError';

/**
 * TTS Configuration
 */
const TTS_CONFIG = {
  openai: {
    apiKey: process.env.OPENAI_API_KEY || '',
    endpoint: 'https://api.openai.com/v1/audio/speech',
  },
  defaultVoice: 'alloy' as TTSVoice,
  defaultModel: 'tts-1',
  defaultSpeed: 1.0,
  defaultFormat: 'mp3',
  costPer1kChars: {
    'tts-1': 0.015, // $15 per 1M characters
    'tts-1-hd': 0.03, // $30 per 1M characters
  },
};

/**
 * Voice Descriptions
 */
const VOICE_INFO: Record<TTSVoice, { description: string; characteristics: string[] }> = {
  alloy: {
    description: 'Balanced and neutral voice, suitable for most content',
    characteristics: ['Neutral', 'Clear', 'Professional', 'Versatile'],
  },
  echo: {
    description: 'Warm and friendly voice with good articulation',
    characteristics: ['Warm', 'Friendly', 'Engaging', 'Approachable'],
  },
  fable: {
    description: 'Expressive and storytelling voice',
    characteristics: ['Expressive', 'Dynamic', 'Storytelling', 'Captivating'],
  },
  onyx: {
    description: 'Deep and authoritative voice',
    characteristics: ['Deep', 'Authoritative', 'Confident', 'Strong'],
  },
  nova: {
    description: 'Energetic and youthful voice',
    characteristics: ['Energetic', 'Youthful', 'Bright', 'Enthusiastic'],
  },
  shimmer: {
    description: 'Soft and soothing voice',
    characteristics: ['Soft', 'Soothing', 'Calm', 'Gentle'],
  },
};

/**
 * Calculate TTS cost
 */
const calculateCost = (text: string, model: string): number => {
  const charCount = text.length;
  const costPer1k = TTS_CONFIG.costPer1kChars[model as keyof typeof TTS_CONFIG.costPer1kChars] || 0.015;
  return (charCount / 1000) * costPer1k;
};

/**
 * Generate Speech from Text
 */
export const generateSpeech = async (
  userId: Types.ObjectId,
  data: IGenerateSpeechRequest
): Promise<IGeneratedSpeech> => {
  if (!TTS_CONFIG.openai.apiKey) {
    throw new ApiError(500, 'OpenAI API key not configured');
  }

  const voice = data.voice || TTS_CONFIG.defaultVoice;
  const model = data.model || TTS_CONFIG.defaultModel;
  const speed = data.speed || TTS_CONFIG.defaultSpeed;
  const format = data.format || TTS_CONFIG.defaultFormat;

  try {
    const response = await axios.post(
      TTS_CONFIG.openai.endpoint,
      {
        model,
        input: data.text,
        voice,
        speed,
        response_format: format,
      },
      {
        headers: {
          'Authorization': `Bearer ${TTS_CONFIG.openai.apiKey}`,
          'Content-Type': 'application/json',
        },
        responseType: 'arraybuffer',
        timeout: 60000,
      }
    );

    const audioBuffer = Buffer.from(response.data);
    const fileSize = audioBuffer.length;
    const cost = calculateCost(data.text, model);

    // Estimate duration (rough approximation: 150 words per minute)
    const wordCount = data.text.split(/\s+/).length;
    const estimatedDuration = Math.ceil((wordCount / 150) * 60); // seconds

    // Convert buffer to base64 for storage/transmission
    const audioBase64 = audioBuffer.toString('base64');
    const audioUrl = `data:audio/${format};base64,${audioBase64}`;

    const generatedSpeech: IGeneratedSpeech = {
      audioUrl,
      audioBuffer,
      duration: estimatedDuration,
      text: data.text,
      voice,
      model: model as any,
      format: format as any,
      fileSize,
      metadata: {
        generatedAt: new Date(),
        provider: 'openai',
        cost,
      },
    };

    // Save to library if requested
    if (data.saveToLibrary) {
      await TTSLibrary.create({
        user: userId,
        title: data.title || `Speech - ${new Date().toISOString()}`,
        text: data.text,
        audioUrl,
        duration: estimatedDuration,
        voice,
        model,
        format,
        fileSize,
        lessonId: data.lessonId,
        plays: 0,
        cost,
      });
    }

    return generatedSpeech;
  } catch (error: any) {
    if (error.response) {
      throw new ApiError(
        error.response.status,
        `OpenAI TTS Error: ${error.response.data?.error?.message || 'Unknown error'}`
      );
    }
    throw new ApiError(500, `Failed to generate speech: ${error.message}`);
  }
};

/**
 * Get TTS Library
 */
export const getTTSLibrary = async (
  userId: Types.ObjectId,
  page: number = 1,
  limit: number = 20,
  voice?: TTSVoice,
  lessonId?: string
) => {
  const filter: any = { user: userId };
  if (voice) filter.voice = voice;
  if (lessonId) filter.lessonId = new Types.ObjectId(lessonId);

  const items = await TTSLibrary.find(filter)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .populate('lessonId', 'title')
    .lean();

  const total = await TTSLibrary.countDocuments(filter);

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
 * Get Audio by ID
 */
export const getAudioById = async (userId: Types.ObjectId, audioId: string) => {
  const audio = await TTSLibrary.findOne({
    _id: audioId,
    user: userId,
  }).populate('lessonId', 'title');

  if (!audio) {
    throw new ApiError(404, 'Audio not found');
  }

  // Increment play count
  audio.plays += 1;
  await audio.save();

  return audio;
};

/**
 * Delete Audio
 */
export const deleteAudio = async (userId: Types.ObjectId, audioId: string) => {
  const audio = await TTSLibrary.findOneAndDelete({
    _id: audioId,
    user: userId,
  });

  if (!audio) {
    throw new ApiError(404, 'Audio not found');
  }

  return { message: 'Audio deleted successfully' };
};

/**
 * Get TTS Statistics
 */
export const getTTSStats = async (userId: Types.ObjectId): Promise<ITTSStats> => {
  const items = await TTSLibrary.find({ user: userId }).lean();

  const byVoice: Record<TTSVoice, number> = {
    alloy: 0,
    echo: 0,
    fable: 0,
    onyx: 0,
    nova: 0,
    shimmer: 0,
  };

  const byModel: Record<string, number> = {
    'tts-1': 0,
    'tts-1-hd': 0,
  };

  let totalDuration = 0;
  let totalCost = 0;

  items.forEach((item) => {
    byVoice[item.voice] = (byVoice[item.voice] || 0) + 1;
    byModel[item.model] = (byModel[item.model] || 0) + 1;
    totalDuration += item.duration;
    totalCost += item.cost;
  });

  // Find most used voice
  let mostUsedVoice: TTSVoice = 'alloy';
  let maxCount = 0;
  Object.entries(byVoice).forEach(([voice, count]) => {
    if (count > maxCount) {
      maxCount = count;
      mostUsedVoice = voice as TTSVoice;
    }
  });

  return {
    totalGenerations: items.length,
    totalAudioDuration: totalDuration,
    totalCost,
    byVoice,
    byModel: byModel as Record<'tts-1' | 'tts-1-hd', number>,
    averageDuration: items.length > 0 ? totalDuration / items.length : 0,
    mostUsedVoice,
  };
};

/**
 * Get Voice Previews
 */
export const getVoicePreviews = async (voice?: TTSVoice): Promise<IVoicePreview[]> => {
  const sampleText = 'Hello! This is a sample of my voice. I can help bring your learning content to life with natural sounding speech.';

  const voices: TTSVoice[] = voice ? [voice] : ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'];

  const previews: IVoicePreview[] = voices.map((v) => ({
    voice: v,
    description: VOICE_INFO[v].description,
    sampleText,
    audioUrl: `https://api.openai.com/v1/audio/speech?voice=${v}&text=${encodeURIComponent(sampleText)}`,
    characteristics: VOICE_INFO[v].characteristics,
  }));

  return previews;
};

/**
 * Batch Generate Speech (for lessons)
 */
export const batchGenerateSpeech = async (
  userId: Types.ObjectId,
  texts: Array<{ text: string; title: string; lessonId?: Types.ObjectId }>,
  voice?: TTSVoice,
  model?: string
) => {
  const results = [];
  const errors = [];

  for (const item of texts) {
    try {
      const speech = await generateSpeech(userId, {
        text: item.text,
        voice,
        model: model as any,
        saveToLibrary: true,
        title: item.title,
        lessonId: item.lessonId,
      });
      results.push({ title: item.title, success: true, audioUrl: speech.audioUrl });
    } catch (error: any) {
      errors.push({ title: item.title, success: false, error: error.message });
    }
  }

  return {
    totalProcessed: texts.length,
    successful: results.length,
    failed: errors.length,
    results,
    errors,
  };
};
