import { Types } from 'mongoose';
import {
  AIProvider,
  IGenerateLessonRequest,
  IGeneratedLesson,
  IGenerateQuizRequest,
  IGeneratedQuiz,
  IGenerateFlashcardRequest,
  IGeneratedFlashcardSet,
  IChatRequest,
  IChatResponse,
} from './ai.types';

/**
 * Mock AI Service - Works without API Key
 * Perfect for development and testing
 */

/**
 * Generate Mock Lesson
 */
export const generateMockLesson = async (
  _userId: Types.ObjectId,
  data: IGenerateLessonRequest
): Promise<IGeneratedLesson> => {
  // Mock generation disabled: enforce error to avoid auto content
  const ApiError = require('../../utils/ApiError').default;
  const httpStatus = require('http-status');
  throw new ApiError(
    httpStatus.NOT_IMPLEMENTED,
    'Mock AI lesson generation is disabled. Configure a real AI provider.'
  );
};

/**
 * Generate Mock Quiz
 */
export const generateMockQuiz = async (
  _userId: Types.ObjectId,
  data: IGenerateQuizRequest
): Promise<IGeneratedQuiz> => {
  const ApiError = require('../../utils/ApiError').default;
  const httpStatus = require('http-status');
  throw new ApiError(
    httpStatus.NOT_IMPLEMENTED,
    'Mock AI quiz generation is disabled. Configure a real AI provider.'
  );
};

/**
 * Generate Mock Flashcards
 */
export const generateMockFlashcards = async (
  _userId: Types.ObjectId,
  data: IGenerateFlashcardRequest
): Promise<IGeneratedFlashcardSet> => {
  const ApiError = require('../../utils/ApiError').default;
  const httpStatus = require('http-status');
  throw new ApiError(
    httpStatus.NOT_IMPLEMENTED,
    'Mock AI flashcard generation is disabled. Configure a real AI provider.'
  );
};

/**
 * Mock Chat Response
 */
export const generateMockChat = async (
  _userId: Types.ObjectId,
  data: IChatRequest
): Promise<IChatResponse> => {
  const ApiError = require('../../utils/ApiError').default;
  const httpStatus = require('http-status');
  throw new ApiError(
    httpStatus.NOT_IMPLEMENTED,
    'Mock AI chat is disabled. Configure a real AI provider.'
  );
};
