import { z } from 'zod';

export const generateSpeechSchema = z.object({
  body: z.object({
    text: z.string().min(1).max(4096, 'Text must be 4096 characters or less'),
    voice: z.enum(['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer']).optional(),
    model: z.enum(['tts-1', 'tts-1-hd']).optional(),
    speed: z.number().min(0.25).max(4.0).optional(),
    format: z.enum(['mp3', 'opus', 'aac', 'flac']).optional(),
    saveToLibrary: z.boolean().optional(),
    lessonId: z.string().optional(),
    title: z.string().optional(),
  }),
});

export const playAudioSchema = z.object({
  params: z.object({
    audioId: z.string(),
  }),
});

export const deleteAudioSchema = z.object({
  params: z.object({
    audioId: z.string(),
  }),
});

export const getLibrarySchema = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    voice: z.enum(['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer']).optional(),
    lessonId: z.string().optional(),
  }),
});

export const getVoicePreviewsSchema = z.object({
  query: z.object({
    voice: z.enum(['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer']).optional(),
  }),
});
