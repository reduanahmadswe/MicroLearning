import axios from 'axios';
import { Types } from 'mongoose';
import {
  IGenerateLessonRequest,
  IGeneratedLesson,
  IGenerateQuizRequest,
  IGeneratedQuiz,
  IGenerateFlashcardRequest,
  IGeneratedFlashcardSet,
  IChatRequest,
  IChatResponse,
  IAIStats,
  IImproveContentRequest,
  IImprovedContent,
  ITopicSuggestionRequest,
  ITopicSuggestion,
  IOpenAIRequest,
  IOpenAIResponse,
  AIProvider,
} from './ai.types';
import { ChatSession, AIGenerationHistory } from './ai.model';
import UserProgress from '../progressTracking/progress.model';
import ApiError from '../../../utils/ApiError';

/**
 * AI Service Configuration
 */
const AI_CONFIG = {
  provider: (process.env.AI_PROVIDER as AIProvider) || 'openai',
  openai: {
    apiKey: process.env.OPENAI_API_KEY || '',
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
    endpoint: 'https://api.openai.com/v1/chat/completions',
  },
  defaultTemperature: 0.7,
  defaultMaxTokens: 2000,
  costPer1kTokens: {
    'gpt-4o-mini': 0.00015, // $0.15 per 1M tokens (input)
    'gpt-4o': 0.005,
    'gpt-3.5-turbo': 0.0005,
  },
};

/**
 * Helper: Calculate cost based on tokens and model
 */
const calculateCost = (tokens: number, model: string): number => {
  const costPer1k = AI_CONFIG.costPer1kTokens[model as keyof typeof AI_CONFIG.costPer1kTokens] || 0.0005;
  return (tokens / 1000) * costPer1k;
};

/**
 * Helper: Make OpenAI API request
 */
const makeOpenAIRequest = async (
  messages: IOpenAIRequest['messages'],
  temperature: number = AI_CONFIG.defaultTemperature,
  maxTokens: number = AI_CONFIG.defaultMaxTokens
): Promise<IOpenAIResponse> => {
  if (!AI_CONFIG.openai.apiKey || AI_CONFIG.openai.apiKey === 'your_openai_api_key_here') {
    throw new ApiError(500, 'OpenAI API key not configured. Please set OPENAI_API_KEY in .env file or use AI_PROVIDER=mock for testing.');
  }

  try {
    const response = await axios.post<IOpenAIResponse>(
      AI_CONFIG.openai.endpoint,
      {
        model: AI_CONFIG.openai.model,
        messages,
        temperature,
        max_tokens: maxTokens,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${AI_CONFIG.openai.apiKey}`,
        },
        timeout: 60000, // 60 seconds
      }
    );

    return response.data;
  } catch (error: any) {
    console.error('OpenAI API Error:', error.response?.data || error.message);
    
    if (error.response) {
      const status = error.response.status;
      const errorMessage = error.response.data?.error?.message || 'Unknown error';
      
      // Handle specific error codes
      if (status === 401) {
        throw new ApiError(
          401,
          'Invalid OpenAI API key. Please check your OPENAI_API_KEY in .env file. Get a new key from https://platform.openai.com/api-keys'
        );
      } else if (status === 429) {
        throw new ApiError(
          429,
          'OpenAI API rate limit exceeded or quota exhausted. Please check your usage at https://platform.openai.com/usage'
        );
      } else if (status === 400) {
        throw new ApiError(
          400,
          `Invalid request to OpenAI: ${errorMessage}`
        );
      }
      
      throw new ApiError(
        status,
        `OpenAI API Error: ${errorMessage}`
      );
    }
    throw new ApiError(500, `Failed to connect to OpenAI: ${error.message}`);
  }
};

/**
 * Helper: Save generation history
 */
const saveGenerationHistory = async (
  userId: Types.ObjectId,
  type: 'lesson' | 'quiz' | 'flashcard' | 'chat',
  request: any,
  response: any,
  tokensUsed: number,
  status: 'success' | 'failed' = 'success',
  error?: string
) => {
  const cost = calculateCost(tokensUsed, AI_CONFIG.openai.model);

  await AIGenerationHistory.create({
    user: userId,
    type,
    request,
    response,
    provider: AI_CONFIG.provider,
    aiModel: AI_CONFIG.openai.model,
    tokensUsed,
    cost,
    status,
    error,
  });
};

/**
 * Generate AI Lesson
 */
export const generateLesson = async (
  userId: Types.ObjectId,
  data: IGenerateLessonRequest
): Promise<IGeneratedLesson> => {

  const systemPrompt = `You are an expert educational content creator specializing in micro-learning. 
Create concise, engaging, and well-structured lessons that are easy to understand and remember.
Focus on clarity, practical examples, and actionable insights.`;

  const userPrompt = `Create a micro-learning lesson on the following topic:

Topic: ${data.topic}
Difficulty Level: ${data.difficulty}
Target Duration: ${data.duration || 10} minutes
${data.targetAudience ? `Target Audience: ${data.targetAudience}` : ''}

Please structure the lesson as follows:
1. Title: An engaging title for the lesson
2. Content: Well-structured content with clear sections (use markdown formatting)
3. ${data.includeSummary ? 'Summary: A concise summary of key takeaways' : ''}
4. ${data.includeExamples ? 'Examples: 2-3 practical examples' : ''}
5. Key Points: 5-7 bullet points of the most important concepts

Format your response as a JSON object with the following structure:
{
  "title": "Lesson title",
  "content": "Detailed lesson content with markdown",
  ${data.includeSummary ? '"summary": "Brief summary",' : ''}
  ${data.includeExamples ? '"examples": ["Example 1", "Example 2"],' : ''}
  "keyPoints": ["Point 1", "Point 2", "..."]
}`;

  try {
    const response = await makeOpenAIRequest(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      0.7,
      2500
    );

    const content = response.choices[0].message.content;
    const parsedContent = JSON.parse(content);

    const generatedLesson: IGeneratedLesson = {
      title: parsedContent.title,
      content: parsedContent.content,
      summary: parsedContent.summary,
      examples: parsedContent.examples,
      keyPoints: parsedContent.keyPoints,
      estimatedDuration: data.duration || 10,
      difficulty: data.difficulty,
      metadata: {
        topic: data.topic,
        generatedBy: AI_CONFIG.provider,
        generatedAt: new Date(),
        tokens: response.usage.total_tokens,
      },
    };

    // Save history
    await saveGenerationHistory(userId, 'lesson', data, generatedLesson, response.usage.total_tokens);

    return generatedLesson;
  } catch (error: any) {
    await saveGenerationHistory(userId, 'lesson', data, null, 0, 'failed', error.message);
    throw error;
  }
};

/**
 * Generate AI Quiz
 */
export const generateQuiz = async (
  userId: Types.ObjectId,
  data: IGenerateQuizRequest
): Promise<IGeneratedQuiz> => {

  const systemPrompt = `You are an expert quiz creator.
Create challenging yet fair questions that test understanding, not just memorization.
Include clear explanations for each answer to promote learning.`;

  const userPrompt = `Create a quiz with the following specifications:

Topic: ${data.topic}
${data.lessonContent ? `Lesson Content:\n${data.lessonContent.substring(0, 1500)}` : ''}
Number of Questions: ${data.numberOfQuestions}
Difficulty Level: ${data.difficulty}
Question Types: ${data.questionTypes?.join(', ') || 'multiple-choice'}

For each question:
- Write clear, unambiguous questions
- Provide 4 options for multiple-choice questions
- Include detailed explanations for the correct answer
- Assign points based on difficulty (easy: 5, medium: 10, hard: 15)

Format your response as a JSON object:
{
  "title": "Quiz title",
  "description": "Brief description",
  "questions": [
    {
      "question": "Question text",
      "type": "multiple-choice",
      "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
      "correctAnswer": "Option 1",
      "explanation": "Why this is correct",
      "difficulty": "beginner",
      "points": 5
    }
  ]
}`;

  try {
    const response = await makeOpenAIRequest(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      0.6,
      3000
    );

    const content = response.choices[0].message.content;
    const parsedContent = JSON.parse(content);

    const totalPoints = parsedContent.questions.reduce(
      (sum: number, q: any) => sum + (q.points || 10),
      0
    );

    const generatedQuiz: IGeneratedQuiz = {
      title: parsedContent.title,
      description: parsedContent.description,
      questions: parsedContent.questions,
      totalPoints,
      estimatedDuration: data.numberOfQuestions * 2, // 2 minutes per question
      metadata: {
        topic: data.topic,
        generatedBy: AI_CONFIG.provider,
        generatedAt: new Date(),
        tokens: response.usage.total_tokens,
      },
    };

    await saveGenerationHistory(userId, 'quiz', data, generatedQuiz, response.usage.total_tokens);

    return generatedQuiz;
  } catch (error: any) {
    await saveGenerationHistory(userId, 'quiz', data, null, 0, 'failed', error.message);
    throw error;
  }
};

/**
 * Generate AI Flashcards
 */
export const generateFlashcards = async (
  userId: Types.ObjectId,
  data: IGenerateFlashcardRequest
): Promise<IGeneratedFlashcardSet> => {
  // Log configuration for debugging


  const systemPrompt = `You are an expert at creating effective flashcards for spaced repetition learning.
Create concise cards with clear questions and comprehensive answers.
Focus on one concept per card for optimal memorization.`;

  const userPrompt = `Create flashcards with the following specifications:

Topic: ${data.topic}
${data.lessonContent ? `Lesson Content:\n${data.lessonContent.substring(0, 1500)}` : ''}
Number of Cards: ${data.numberOfCards}
Difficulty Level: ${data.difficulty}
${data.includeExamples ? 'Include practical examples where applicable' : ''}

For each flashcard:
- Front: A clear, concise question or prompt
- Back: A comprehensive but concise answer
- ${data.includeExamples ? 'Example: A practical example if applicable' : ''}
- Tags: 2-4 relevant tags for categorization
- Difficulty: Match the requested difficulty level

Format your response as a JSON object:
{
  "title": "Flashcard set title",
  "description": "Brief description",
  "cards": [
    {
      "front": "Question or prompt",
      "back": "Answer or explanation",
      ${data.includeExamples ? '"example": "Practical example",' : ''}
      "tags": ["tag1", "tag2"],
      "difficulty": "beginner"
    }
  ]
}`;

  try {
    const response = await makeOpenAIRequest(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      0.7,
      2500
    );

    const content = response.choices[0].message.content;
    const parsedContent = JSON.parse(content);

    const generatedFlashcardSet: IGeneratedFlashcardSet = {
      title: parsedContent.title,
      description: parsedContent.description,
      cards: parsedContent.cards,
      metadata: {
        topic: data.topic,
        generatedBy: AI_CONFIG.provider,
        generatedAt: new Date(),
        tokens: response.usage.total_tokens,
      },
    };

    await saveGenerationHistory(
      userId,
      'flashcard',
      data,
      generatedFlashcardSet,
      response.usage.total_tokens
    );

    return generatedFlashcardSet;
  } catch (error: any) {
    // If quota exceeded or API error, fallback to mock service
    
    if (error.response?.data?.error?.code === 'insufficient_quota') {
    }
    
    const mockService = await import('./ai.mock.service');
    return mockService.generateMockFlashcards(userId, data);
  }
};

/**
 * AI Chat Tutor
 */
export const chat = async (userId: Types.ObjectId, data: IChatRequest): Promise<IChatResponse> => {
  // Use mock service if no API key configured
  if (!AI_CONFIG.openai.apiKey || AI_CONFIG.openai.apiKey === 'your_openai_api_key_here') {
    const mockService = await import('./ai.mock.service');
    return mockService.generateMockChat(userId, data);
  }

  let session;

  // Get or create chat session
  if (data.sessionId) {
    session = await ChatSession.findOne({ _id: data.sessionId, user: userId });
    if (!session) {
      throw new ApiError(404, 'Chat session not found');
    }
  } else {
    // Create new session
    session = await ChatSession.create({
      user: userId,
      title: data.message.substring(0, 50) + (data.message.length > 50 ? '...' : ''),
      messages: [],
      context: data.context,
      isActive: true,
    });
  }

  // Build conversation history
  const messages: IOpenAIRequest['messages'] = [
    {
      role: 'system',
      content: `You are an intelligent AI tutor for a micro-learning platform. 
Your role is to help students learn effectively by:
- Answering questions clearly and concisely
- Providing examples and analogies
- Breaking down complex topics into simple explanations
- Encouraging critical thinking
- Being patient and supportive

${data.context?.topic ? `Current topic: ${data.context.topic}` : ''}
${data.context?.lessonId ? `Currently in a lesson context` : ''}
${data.context?.quizId ? `Currently helping with a quiz` : ''}

Keep responses concise (2-3 paragraphs max) unless more detail is specifically requested.`,
    },
  ];

  // Add previous messages (last 10 for context)
  const recentMessages = session.messages.slice(-10);
  recentMessages.forEach((msg) => {
    messages.push({
      role: msg.role as 'user' | 'assistant' | 'system',
      content: msg.content,
    });
  });

  // Add current message
  messages.push({
    role: 'user',
    content: data.message,
  });

  try {
    const response = await makeOpenAIRequest(messages, 0.8, 1000);

    const assistantMessage = response.choices[0].message.content;

    // Save messages to session
    session.messages.push({
      role: 'user',
      content: data.message,
      timestamp: new Date(),
    });

    session.messages.push({
      role: 'assistant',
      content: assistantMessage,
      timestamp: new Date(),
    });

    await session.save();

    // Save history
    await saveGenerationHistory(userId, 'chat', data, { message: assistantMessage }, response.usage.total_tokens);

    return {
      message: assistantMessage,
      sessionId: session._id.toString(),
      suggestions: [], // TODO: Generate follow-up suggestions
      relatedTopics: [], // TODO: Generate related topics
      metadata: {
        tokens: response.usage.total_tokens,
        provider: AI_CONFIG.provider,
      },
    };
  } catch (error: any) {
    await saveGenerationHistory(userId, 'chat', data, null, 0, 'failed', error.message);
    throw error;
  }
};

/**
 * Get Chat Sessions
 */
export const getChatSessions = async (
  userId: Types.ObjectId,
  page: number = 1,
  limit: number = 20
) => {
  const sessions = await ChatSession.find({ user: userId })
    .sort({ updatedAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .select('title messages isActive context createdAt updatedAt');

  const total = await ChatSession.countDocuments({ user: userId });

  return {
    sessions: sessions.map((s) => ({
      id: s._id,
      title: s.title,
      messageCount: s.messages.length,
      lastMessage: s.messages[s.messages.length - 1]?.content.substring(0, 100),
      isActive: s.isActive,
      context: s.context,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
    })),
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      itemsPerPage: limit,
    },
  };
};

/**
 * Get Chat Session Details
 */
export const getChatSessionDetails = async (userId: Types.ObjectId, sessionId: string) => {
  const session = await ChatSession.findOne({ _id: sessionId, user: userId })
    .populate('context.lesson', 'title')
    .populate('context.quiz', 'title');

  if (!session) {
    throw new ApiError(404, 'Chat session not found');
  }

  return session;
};

/**
 * Delete Chat Session
 */
export const deleteChatSession = async (userId: Types.ObjectId, sessionId: string) => {
  const session = await ChatSession.findOneAndDelete({ _id: sessionId, user: userId });

  if (!session) {
    throw new ApiError(404, 'Chat session not found');
  }

  return { message: 'Chat session deleted successfully' };
};

/**
 * Improve Content
 */
export const improveContent = async (
  _userId: Types.ObjectId,
  data: IImproveContentRequest
): Promise<IImprovedContent> => {
  const improvementPrompts = {
    clarity: 'Make this content clearer and easier to understand',
    grammar: 'Fix grammar, spelling, and punctuation errors',
    structure: 'Improve the structure and organization',
    simplify: 'Simplify the language for easier comprehension',
    expand: 'Expand with more details and examples',
  };

  const systemPrompt = `You are an expert editor specializing in educational content.
Improve the given content while maintaining its core message and educational value.`;

  const userPrompt = `${improvementPrompts[data.improvementType]}:

Original Content:
${data.content}

${data.targetAudience ? `Target Audience: ${data.targetAudience}` : ''}

Provide your response as a JSON object:
{
  "improvedContent": "The improved version",
  "changes": ["Change 1", "Change 2", "..."],
  "suggestions": ["Additional suggestion 1", "Additional suggestion 2"]
}`;

  try {
    const response = await makeOpenAIRequest(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      0.5,
      2000
    );

    const content = response.choices[0].message.content;
    const parsedContent = JSON.parse(content);

    return {
      originalContent: data.content,
      improvedContent: parsedContent.improvedContent,
      changes: parsedContent.changes,
      suggestions: parsedContent.suggestions,
      metadata: {
        improvementType: data.improvementType,
        generatedBy: AI_CONFIG.provider,
        tokens: response.usage.total_tokens,
      },
    };
  } catch (error: any) {
    throw new ApiError(500, `Content improvement failed: ${error.message}`);
  }
};

/**
 * Get Topic Suggestions
 */
export const getTopicSuggestions = async (
  userId: Types.ObjectId,
  data: ITopicSuggestionRequest
): Promise<ITopicSuggestion[]> => {
  // Get user's completed lessons and interests
  const progress = await UserProgress.find({ user: userId, completed: true })
    .populate('lesson', 'title category')
    .limit(20);

  const completedTopics = progress.map((p: any) => p.lesson?.title || '').filter(Boolean);
  const userInterests = data.userInterests || [];

  const systemPrompt = `You are an AI learning advisor specializing in personalized education.
Suggest relevant topics that build on the user's current knowledge and interests.`;

  const userPrompt = `Suggest ${data.limit || 10} learning topics for a student with:

Skill Level: ${data.skillLevel || 'intermediate'}
Interests: ${userInterests.join(', ') || 'Not specified'}
Recently Completed: ${completedTopics.slice(0, 10).join(', ') || 'None'}

Provide diverse suggestions that:
- Build on their current knowledge
- Align with their interests
- Introduce new relevant concepts
- Have clear learning paths

Format as JSON:
{
  "topics": [
    {
      "topic": "Topic name",
      "description": "Brief description",
      "difficulty": "beginner|intermediate|advanced",
      "estimatedDuration": 15,
      "prerequisites": ["Prerequisite 1"],
      "relevanceScore": 85,
      "reason": "Why this topic is recommended"
    }
  ]
}`;

  try {
    const response = await makeOpenAIRequest(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      0.7,
      1500
    );

    const content = response.choices[0].message.content;
    const parsedContent = JSON.parse(content);

    return parsedContent.topics;
  } catch (error: any) {
    throw new ApiError(500, `Failed to get topic suggestions: ${error.message}`);
  }
};

/**
 * Get AI Statistics
 */
export const getAIStats = async (userId: Types.ObjectId): Promise<IAIStats> => {
  const history = await AIGenerationHistory.find({ user: userId, status: 'success' });

  const stats: IAIStats = {
    totalGenerations: history.length,
    byType: {
      lesson: history.filter((h) => h.type === 'lesson').length,
      quiz: history.filter((h) => h.type === 'quiz').length,
      flashcard: history.filter((h) => h.type === 'flashcard').length,
      chat: history.filter((h) => h.type === 'chat').length,
    },
    totalTokensUsed: history.reduce((sum, h) => sum + h.tokensUsed, 0),
    totalCost: history.reduce((sum, h) => sum + h.cost, 0),
    averageResponseTime: 0, // TODO: Track response times
    successRate:
      (history.length / (await AIGenerationHistory.countDocuments({ user: userId }))) * 100 || 0,
  };

  return stats;
};

/**
 * Get Generation History
 */
export const getGenerationHistory = async (
  userId: Types.ObjectId,
  page: number = 1,
  limit: number = 20,
  type?: 'lesson' | 'quiz' | 'flashcard' | 'chat',
  status?: 'success' | 'failed' | 'pending'
) => {
  const filter: any = { user: userId };
  if (type) filter.type = type;
  if (status) filter.status = status;

  const history = await AIGenerationHistory.find(filter)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .select('-response'); // Exclude large response data

  const total = await AIGenerationHistory.countDocuments(filter);

  return {
    history,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      itemsPerPage: limit,
    },
  };
};
