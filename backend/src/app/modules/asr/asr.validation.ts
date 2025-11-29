import { z } from 'zod';

export const transcribeAudioSchema = z.object({
  body: z.object({
    audioFile: z.string(), // base64 encoded
    fileName: z.string(),
    language: z.string().optional(),
    model: z.enum(['whisper-1']).optional(),
    prompt: z.string().optional(),
    format: z.enum(['json', 'text', 'srt', 'vtt', 'verbose_json']).optional(),
    temperature: z.number().min(0).max(1).optional(),
    saveToHistory: z.boolean().optional(),
    lessonId: z.string().optional(),
    title: z.string().optional(),
  }),
});

export const translateAudioSchema = z.object({
  body: z.object({
    audioFile: z.string(), // base64 encoded
    fileName: z.string(),
    model: z.enum(['whisper-1']).optional(),
    prompt: z.string().optional(),
    temperature: z.number().min(0).max(1).optional(),
    saveToHistory: z.boolean().optional(),
  }),
});

export const getHistorySchema = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    language: z.string().optional(),
    lessonId: z.string().optional(),
  }),
});

export const getTranscriptionSchema = z.object({
  params: z.object({
    transcriptionId: z.string(),
  }),
});

export const deleteTranscriptionSchema = z.object({
  params: z.object({
    transcriptionId: z.string(),
  }),
});
