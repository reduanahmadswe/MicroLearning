import { Types } from 'mongoose';
import axios from 'axios';
import { TutorSession } from './aiTutor.model';
import { IChatRequest, IChatResponse, ISessionListItem } from './aiTutor.types';
import ApiError from '../../../utils/ApiError';

/**
 * AI Tutor Service using OpenRouter API
 */

export class AITutorService {
  /**
   * Call OpenRouter API with fallback handling
   */
  private async callOpenRouterAPI(message: string, conversationHistory: any[] = []): Promise<string> {
    try {
      return await this.tryOpenRouter(message, conversationHistory);
    } catch (error: any) {
      // Only log once, not for every model
      if (error.message?.includes('insufficient credits')) {
        console.warn('⚠️  AI Tutor: OpenRouter account needs credits');
      } else if (error.message) {
        console.warn('⚠️  AI Tutor unavailable:', error.message);
      }
      return this.generateFallbackResponse(message);
    }
  }

  /**
   * Try OpenRouter API with multiple models
   */
  private async tryOpenRouter(message: string, conversationHistory: any[] = []): Promise<string> {
    const apiKey = process.env.OPENROUTER_API_KEY;
    const baseURL = process.env.OPENAI_API_BASE_URL;

    if (!apiKey || !baseURL) {
      throw new Error('OpenRouter API not configured');
    }

    // Try free models only (skip paid models to avoid credit errors)
    const models = [
      'google/gemma-2-9b-it:free',
      'microsoft/phi-3-mini-128k-instruct:free',
      'meta-llama/llama-3.2-3b-instruct:free',
    ];

    let lastError: any = null;
    let hasInsufficientCredits = false;

    for (let i = 0; i < models.length; i++) {
      const model = models[i];

      try {
        const systemPrompt = this.buildSystemPrompt();
        const messages = this.buildMessageHistory(systemPrompt, conversationHistory, message);

        const response = await axios.post(
          `${baseURL}/chat/completions`,
          {
            model: model,
            messages: messages,
            max_tokens: 800,
            temperature: 0.7,
            top_p: 0.95,
            frequency_penalty: 0.1,
            presence_penalty: 0.1,
          },
          {
            headers: {
              'Authorization': `Bearer ${apiKey}`,
              'Content-Type': 'application/json',
              'HTTP-Referer': process.env.FRONTEND_URL || 'https://microlearning-beta.vercel.app',
              'X-Title': 'MicroLearning AI Tutor',
            },
            timeout: 30000,
          }
        );

        const result = response.data.choices[0]?.message?.content || 'No response generated';
        return result;
      } catch (error: any) {
        lastError = error;
        const errorData = error.response?.data;
        
        // Detect insufficient credits
        if (errorData?.error?.code === 402 || errorData?.error?.message?.includes('Insufficient credits')) {
          hasInsufficientCredits = true;
        }
        
        // Only log detailed error on last attempt
        if (i === models.length - 1) {
          console.error(`❌ All AI models failed. Last error:`, errorData || error.message);
        }
        
        continue;
      }
    }

    // Throw descriptive error
    if (hasInsufficientCredits) {
      throw new Error('OpenRouter account has insufficient credits. Please add credits at https://openrouter.ai/settings/credits');
    }
    throw new Error(lastError?.response?.data?.error?.message || 'All AI models failed');
  }

  /**
   * Build system prompt for AI Tutor
   */
  private buildSystemPrompt(): string {
    const today = new Date();
    const dateStr = today.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    const timeStr = today.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Dhaka',
    });

    return `You are an intelligent AI Learning Tutor for MicroLearning platform - a comprehensive online education system.

🎯 YOUR ROLE:
You help students learn effectively by providing detailed, comprehensive, and educational responses.

📚 RESPONSE QUALITY RULES (CRITICAL):
✅ ALWAYS provide COMPREHENSIVE, DETAILED, and IN-DEPTH explanations
✅ Never give brief or incomplete answers - students want FULL understanding
✅ Break down complex topics step-by-step with clear examples
✅ Provide multiple approaches/solutions when applicable
✅ Include practical examples with detailed code/implementations
✅ Add analysis, comparisons, and real-world applications
✅ Structure responses with clear headings and formatting
✅ Be thorough but engaging - depth with clarity
✅ Explain concepts as if teaching someone who wants to master the topic
✅ Include technical details and comprehensive analysis

🎓 TEACHING APPROACH:
- Answer questions clearly with detailed explanations
- Provide multiple examples and analogies
- Break down complex topics into digestible parts
- Encourage critical thinking with follow-up questions
- Be patient, supportive, and encouraging
- Use markdown formatting for better readability
- Include code snippets with comments when relevant
- Provide step-by-step solutions to problems

📊 CONTEXT AWARENESS:
- Current Date: ${dateStr}
- Current Time: ${timeStr} (Bangladesh Time)
- Current Year: ${today.getFullYear()}
- Platform: MicroLearning - Online Education Platform
- Features: Courses, Lessons, Quizzes, Flashcards, AI Tutor, Certificates

💬 COMMUNICATION STYLE:
- Be friendly and approachable
- Support both Bengali and English languages
- Adapt explanation depth based on student's questions
- Provide actionable insights and next steps
- End with encouragement or relevant tips

🚫 RESTRICTIONS:
- Never mention underlying AI technology (GPT, OpenAI, Claude, etc.)
- Stay focused on educational content
- Maintain professional and supportive tone
- If unsure, acknowledge limitations honestly

Remember: Your goal is to help students truly understand and master topics, not just answer questions superficially.`;
  }

  /**
   * Build message history for API
   */
  private buildMessageHistory(
    systemPrompt: string,
    conversationHistory: any[],
    currentMessage: string
  ) {
    const messages: any[] = [
      {
        role: 'system',
        content: systemPrompt,
      },
    ];

    // Add last 10 messages for context
    const recentHistory = conversationHistory.slice(-10);
    messages.push(...recentHistory);

    // Add current message
    messages.push({
      role: 'user',
      content: currentMessage,
    });

    return messages;
  }

  /**
   * Generate fallback response when AI is unavailable
   */
  private generateFallbackResponse(message: string): string {
    const lowerMessage = message.toLowerCase();

    // Handle common questions with fallback
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('হাই')) {
      return `Hello! I'm your AI Learning Tutor! 👋

I'm currently experiencing high demand, but I'm here to help you learn. I can assist with:
- Understanding course concepts
- Solving programming problems
- Explaining complex topics
- Study tips and guidance

Please try your question again in a moment for a detailed response!`;
    }

    if (lowerMessage.includes('help') || lowerMessage.includes('সাহায্য')) {
      return `I'm here to help you learn! 📚

I can assist with:
✅ Explaining course topics
✅ Solving homework and assignments
✅ Programming tutorials
✅ Exam preparation
✅ Study strategies

My AI service is temporarily overloaded. Please try again shortly for a comprehensive answer!`;
    }

    return `I received your question: "${message.length > 50 ? message.substring(0, 50) + '...' : message}"

**AI Tutor is temporarily unavailable** due to API configuration. Our team is working on restoring the service.

In the meantime:
✅ Browse our lessons and courses
✅ Practice with quizzes
✅ Review flashcards

Thank you for your patience! 🙏`;
  }

  /**
   * Create or continue chat session
   */
  async chat(userId: Types.ObjectId, data: IChatRequest): Promise<IChatResponse> {
    try {

      let session;

      if (data.sessionId) {
        // Continue existing session
        session = await TutorSession.findOne({
          _id: data.sessionId,
          userId,
        });

        if (!session) {
          throw new ApiError(404, 'Chat session not found');
        }
      } else {
        // Create new session
        session = new TutorSession({
          userId,
          title: data.message.substring(0, 50) + (data.message.length > 50 ? '...' : ''),
          messages: [],
          topic: data.topic,
          lessonId: data.lessonId,
          courseId: data.courseId,
          isActive: true,
        });
      }

      // Add user message
      session.messages.push({
        role: 'user',
        content: data.message,
        timestamp: new Date(),
      });

      // Build conversation history
      const conversationHistory = data.conversationHistory || 
        session.messages.slice(-10).map(m => ({
          role: m.role,
          content: m.content,
        }));

      // Get AI response
      const aiResponse = await this.callOpenRouterAPI(data.message, conversationHistory);

      // Add AI response
      session.messages.push({
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date(),
      });

      await session.save();

      return {
        sessionId: session._id!.toString(),
        response: aiResponse,
        title: session.title,
      };
    } catch (error: any) {
      console.error('❌ AI Tutor error:', error);
      throw new ApiError(500, error.message || 'Failed to process chat');
    }
  }

  /**
   * Get user's chat sessions
   */
  async getUserSessions(userId: Types.ObjectId, page: number = 1, limit: number = 20): Promise<{
    sessions: ISessionListItem[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;

    const sessions = await TutorSession.find({ userId })
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('title topic messages createdAt updatedAt')
      .lean();

    const total = await TutorSession.countDocuments({ userId });

    const sessionList: ISessionListItem[] = sessions.map(s => ({
      _id: s._id!,
      title: s.title,
      topic: s.topic,
      lastMessage: s.messages[s.messages.length - 1]?.content.substring(0, 100) || '',
      messageCount: s.messages.length,
      createdAt: s.createdAt!,
      updatedAt: s.updatedAt!,
    }));

    return {
      sessions: sessionList,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get session by ID
   */
  async getSession(userId: Types.ObjectId, sessionId: string) {
    const session = await TutorSession.findOne({
      _id: sessionId,
      userId,
    }).lean();

    if (!session) {
      throw new ApiError(404, 'Session not found');
    }

    return session;
  }

  /**
   * Delete session
   */
  async deleteSession(userId: Types.ObjectId, sessionId: string) {
    const session = await TutorSession.findOneAndDelete({
      _id: sessionId,
      userId,
    });

    if (!session) {
      throw new ApiError(404, 'Session not found');
    }

    return { message: 'Session deleted successfully' };
  }

  /**
   * Update session title
   */
  async updateSessionTitle(userId: Types.ObjectId, sessionId: string, title: string) {
    const session = await TutorSession.findOneAndUpdate(
      { _id: sessionId, userId },
      { title },
      { new: true }
    );

    if (!session) {
      throw new ApiError(404, 'Session not found');
    }

    return session;
  }

  /**
   * Clear session messages (keep session but remove messages)
   */
  async clearSession(userId: Types.ObjectId, sessionId: string) {
    const session = await TutorSession.findOneAndUpdate(
      { _id: sessionId, userId },
      { messages: [] },
      { new: true }
    );

    if (!session) {
      throw new ApiError(404, 'Session not found');
    }

    return { message: 'Session cleared successfully' };
  }
}

export const aiTutorService = new AITutorService();
