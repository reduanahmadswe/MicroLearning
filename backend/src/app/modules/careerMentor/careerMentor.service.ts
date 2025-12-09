import axios from 'axios';
import { Types } from 'mongoose';
import {
  ICareerAdviceRequest,
  ICareerAdviceResponse,
  ISkillAssessmentRequest,
  ISkillAssessment,
  IInterviewPrepRequest,
  IInterviewPrepResponse,
  IResumeReviewRequest,
  IResumeReviewResponse,
  ISalaryNegotiationRequest,
  ISalaryNegotiationResponse,
  ICareerMentorStats,
  SessionType,
} from './careerMentor.types';
import { CareerMentorSession } from './careerMentor.model';
import ApiError from '../../../utils/ApiError';

/**
 * AI Config
 */
const AI_CONFIG = {
  openai: {
    apiKey: process.env.OPENAI_API_KEY || '',
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
    endpoint: 'https://api.openai.com/v1/chat/completions',
  },
};

/**
 * Make OpenAI Request
 */
const makeOpenAIRequest = async (messages: any[], temperature: number = 0.7, maxTokens: number = 2000) => {
  if (!AI_CONFIG.openai.apiKey) {
    throw new ApiError(500, 'OpenAI API key not configured');
  }

  const response = await axios.post(
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
        'Authorization': `Bearer ${AI_CONFIG.openai.apiKey}`,
      },
      timeout: 90000,
    }
  );

  return response.data;
};

/**
 * Career Advice Chat
 */
export const getCareerAdvice = async (
  userId: Types.ObjectId,
  data: ICareerAdviceRequest
): Promise<ICareerAdviceResponse> => {
  let session;
  const sessionType = data.sessionType || 'general';

  // Get or create session
  if (data.sessionId) {
    session = await CareerMentorSession.findOne({
      _id: data.sessionId,
      user: userId,
    });
    if (!session) {
      throw new ApiError(404, 'Career mentor session not found');
    }
  } else {
    // const _user = await User.findById(userId).select('name');
    session = await CareerMentorSession.create({
      user: userId,
      title: data.message.substring(0, 60) + (data.message.length > 60 ? '...' : ''),
      sessionType,
      messages: [],
      profile: data.context?.profile,
      isActive: true,
    });
  }

  // Build system prompt
  const systemPrompt = `You are an expert AI Career Mentor and advisor with deep knowledge of:
- Career development and progression strategies
- Job market trends and industry insights
- Skill development and learning paths
- Interview preparation and techniques
- Resume optimization
- Salary negotiation strategies
- Work-life balance and professional growth

Your role is to provide personalized, actionable career advice that helps professionals:
- Make informed career decisions
- Develop in-demand skills
- Navigate career transitions
- Achieve their professional goals
- Negotiate better compensation
- Prepare for interviews effectively

Be empathetic, encouraging, and practical. Provide specific, actionable advice with clear next steps.

${session.profile ? `
User Profile:
- Current Role: ${session.profile.currentRole || 'Not specified'}
- Experience: ${session.profile.yearsOfExperience || 'Not specified'} years
- Experience Level: ${session.profile.experienceLevel || 'Not specified'}
- Skills: ${session.profile.skills?.join(', ') || 'Not specified'}
- Career Goals: ${session.profile.careerGoals?.join(', ') || 'Not specified'}
- Target Roles: ${session.profile.targetRoles?.join(', ') || 'Not specified'}
` : ''}

${data.context?.specificTopic ? `Focus Topic: ${data.context.specificTopic}` : ''}

Session Type: ${sessionType}`;

  // Build conversation history
  const messages: any[] = [{ role: 'system', content: systemPrompt }];

  // Add recent messages (last 10)
  const recentMessages = session.messages.slice(-10);
  recentMessages.forEach((msg) => {
    messages.push({
      role: msg.role,
      content: msg.content,
    });
  });

  // Add current message
  messages.push({
    role: 'user',
    content: data.message,
  });

  try {
    const response = await makeOpenAIRequest(messages, 0.8, 1500);
    const assistantMessage = response.choices[0].message.content;

    // Save messages
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

    return {
      message: assistantMessage,
      sessionId: session._id.toString(),
      suggestions: [],
      actionItems: [],
      resources: [],
      metadata: {
        tokens: response.usage.total_tokens,
        provider: 'openai',
        sessionType,
      },
    };
  } catch (error: any) {
    if (error.response) {
      throw new ApiError(
        error.response.status,
        `OpenAI Error: ${error.response.data?.error?.message || 'Unknown error'}`
      );
    }
    throw new ApiError(500, `Failed to get career advice: ${error.message}`);
  }
};

/**
 * Skill Assessment
 */
export const assessSkills = async (
  _userId: Types.ObjectId,
  data: ISkillAssessmentRequest
): Promise<ISkillAssessment> => {
  const systemPrompt = `You are an expert career counselor and technical skills assessor.
Provide detailed, realistic assessments of skills including market demand and development recommendations.`;

  const userPrompt = `Assess the following skills:

Skills: ${data.skills.join(', ')}
${data.targetRole ? `Target Role: ${data.targetRole}` : ''}
${data.includeGapAnalysis ? 'Include gap analysis for target role' : ''}

Provide a comprehensive assessment as JSON:
{
  "assessedSkills": [
    {
      "skill": "Skill name",
      "currentLevel": "intermediate",
      "marketDemand": "high",
      "importance": 8,
      "recommendedActions": ["Action 1", "Action 2"]
    }
  ],
  "overallScore": 75,
  "strengths": ["Strength 1", "Strength 2"],
  "weaknesses": ["Weakness 1", "Weakness 2"],
  ${data.includeGapAnalysis ? `"gapAnalysis": [
    {
      "skill": "Required skill",
      "requiredLevel": "advanced",
      "currentLevel": "intermediate",
      "priority": "high",
      "estimatedTimeToLearn": "3-6 months"
    }
  ],` : ''}
  "recommendations": ["Recommendation 1", "Recommendation 2"],
  "learningPath": ["Step 1", "Step 2", "Step 3"]
}`;

  try {
    const response = await makeOpenAIRequest(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      0.6,
      2000
    );

    const content = response.choices[0].message.content;
    const assessment: ISkillAssessment = JSON.parse(content);

    return assessment;
  } catch (error: any) {
    throw new ApiError(500, `Failed to assess skills: ${error.message}`);
  }
};

/**
 * Interview Preparation
 */
export const prepareInterview = async (
  _userId: Types.ObjectId,
  data: IInterviewPrepRequest
): Promise<IInterviewPrepResponse> => {
  const systemPrompt = `You are an expert interview coach with experience across technical and non-technical roles.
Provide realistic interview questions, effective answer strategies, and practical preparation guidance.`;

  const userPrompt = `Prepare interview materials for:

Role: ${data.targetRole}
${data.company ? `Company: ${data.company}` : ''}
Interview Type: ${data.interviewType || 'general'}
${data.focusAreas?.length ? `Focus Areas: ${data.focusAreas.join(', ')}` : ''}

Provide comprehensive interview preparation as JSON:
{
  "questions": [
    {
      "question": "Question text",
      "type": "technical",
      "difficulty": "medium",
      "sampleAnswer": "Sample answer",
      "keyPoints": ["Point 1", "Point 2"]
    }
  ],
  "tips": ["Tip 1", "Tip 2"],
  "commonPitfalls": ["Pitfall 1", "Pitfall 2"],
  "preparationPlan": ["Step 1", "Step 2"],
  "resources": [
    {
      "type": "article",
      "title": "Resource title",
      "description": "Brief description",
      "url": "https://example.com",
      "relevance": "Why this is relevant"
    }
  ]
}

Include 10-15 questions covering different aspects.`;

  try {
    const response = await makeOpenAIRequest(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      0.7,
      3000
    );

    const content = response.choices[0].message.content;
    const prepResponse: IInterviewPrepResponse = JSON.parse(content);

    return prepResponse;
  } catch (error: any) {
    throw new ApiError(500, `Failed to prepare interview materials: ${error.message}`);
  }
};

/**
 * Resume Review
 */
export const reviewResume = async (
  _userId: Types.ObjectId,
  data: IResumeReviewRequest
): Promise<IResumeReviewResponse> => {
  const systemPrompt = `You are an expert resume reviewer and career coach.
Provide detailed, actionable feedback on resumes including content, structure, and keyword optimization.`;

  const userPrompt = `Review this resume:

${data.resumeText.substring(0, 3000)}

${data.targetRole ? `Target Role: ${data.targetRole}` : ''}
${data.targetIndustry ? `Target Industry: ${data.targetIndustry}` : ''}

Provide comprehensive review as JSON:
{
  "overallScore": 75,
  "strengths": ["Strength 1", "Strength 2"],
  "weaknesses": ["Weakness 1", "Weakness 2"],
  "suggestions": [
    {
      "section": "experience",
      "issue": "Issue description",
      "suggestion": "Specific suggestion",
      "priority": "high"
    }
  ],
  "keywords": {
    "missing": ["Keyword 1", "Keyword 2"],
    "present": ["Keyword 1", "Keyword 2"],
    "recommended": ["Keyword 1", "Keyword 2"]
  },
  "formatting": {
    "score": 80,
    "issues": ["Issue 1", "Issue 2"],
    "recommendations": ["Recommendation 1", "Recommendation 2"]
  }
}`;

  try {
    const response = await makeOpenAIRequest(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      0.6,
      2500
    );

    const content = response.choices[0].message.content;
    const review: IResumeReviewResponse = JSON.parse(content);

    return review;
  } catch (error: any) {
    throw new ApiError(500, `Failed to review resume: ${error.message}`);
  }
};

/**
 * Salary Negotiation Advice
 */
export const getSalaryNegotiationAdvice = async (
  _userId: Types.ObjectId,
  data: ISalaryNegotiationRequest
): Promise<ISalaryNegotiationResponse> => {
  const systemPrompt = `You are an expert salary negotiation coach and compensation analyst.
Provide realistic market data and practical negotiation strategies.`;

  const userPrompt = `Provide salary negotiation guidance:

Role: ${data.role}
${data.currentSalary ? `Current Salary: $${data.currentSalary}` : ''}
${data.offeredSalary ? `Offered Salary: $${data.offeredSalary}` : ''}
${data.location ? `Location: ${data.location}` : ''}
${data.yearsOfExperience ? `Experience: ${data.yearsOfExperience} years` : ''}
${data.skills?.length ? `Skills: ${data.skills.join(', ')}` : ''}

Provide negotiation guidance as JSON:
{
  "marketRange": {
    "min": 80000,
    "max": 120000,
    "median": 95000,
    "percentile75": 105000
  },
  "negotiationStrategy": ["Strategy 1", "Strategy 2"],
  "scriptSuggestions": ["Script 1", "Script 2"],
  "considerations": ["Consider 1", "Consider 2"],
  "redFlags": ["Red flag 1", "Red flag 2"]
}`;

  try {
    const response = await makeOpenAIRequest(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      0.7,
      2000
    );

    const content = response.choices[0].message.content;
    const advice: ISalaryNegotiationResponse = JSON.parse(content);

    return advice;
  } catch (error: any) {
    throw new ApiError(500, `Failed to provide salary negotiation advice: ${error.message}`);
  }
};

/**
 * Get Career Mentor Sessions
 */
export const getSessions = async (
  userId: Types.ObjectId,
  page: number = 1,
  limit: number = 20,
  sessionType?: SessionType,
  isActive?: boolean
) => {
  const filter: any = { user: userId };
  if (sessionType) filter.sessionType = sessionType;
  if (isActive !== undefined) filter.isActive = isActive;

  const sessions = await CareerMentorSession.find(filter)
    .sort({ updatedAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .select('title sessionType messages isActive profile createdAt updatedAt')
    .lean();

  const total = await CareerMentorSession.countDocuments(filter);

  return {
    sessions: sessions.map((s) => ({
      id: s._id,
      title: s.title,
      sessionType: s.sessionType,
      messageCount: s.messages.length,
      lastMessage: s.messages[s.messages.length - 1]?.content.substring(0, 100),
      isActive: s.isActive,
      profile: s.profile,
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
 * Get Session by ID
 */
export const getSessionById = async (userId: Types.ObjectId, sessionId: string) => {
  const session = await CareerMentorSession.findOne({
    _id: sessionId,
    user: userId,
  });

  if (!session) {
    throw new ApiError(404, 'Career mentor session not found');
  }

  return session;
};

/**
 * Delete Session
 */
export const deleteSession = async (userId: Types.ObjectId, sessionId: string) => {
  const session = await CareerMentorSession.findOneAndDelete({
    _id: sessionId,
    user: userId,
  });

  if (!session) {
    throw new ApiError(404, 'Career mentor session not found');
  }

  return { message: 'Career mentor session deleted successfully' };
};

/**
 * Get Career Mentor Statistics
 */
export const getCareerMentorStats = async (userId: Types.ObjectId): Promise<ICareerMentorStats> => {
  const sessions = await CareerMentorSession.find({ user: userId }).lean();

  const bySessionType: Record<SessionType, number> = {
    career_advice: 0,
    skill_assessment: 0,
    interview_prep: 0,
    resume_review: 0,
    salary_negotiation: 0,
    general: 0,
  };

  let totalMessages = 0;
  let totalActionItems = 0;
  let completedActionItems = 0;
  let activeCount = 0;

  sessions.forEach((session) => {
    bySessionType[session.sessionType] = (bySessionType[session.sessionType] || 0) + 1;
    totalMessages += session.messages.length;

    session.messages.forEach((msg) => {
      if (msg.actionItems) {
        totalActionItems += msg.actionItems.length;
        completedActionItems += msg.actionItems.filter((item) => item.completed).length;
      }
    });

    if (session.isActive) activeCount++;
  });

  return {
    totalSessions: sessions.length,
    activeSessions: activeCount,
    totalMessages,
    bySessionType,
    totalActionItems,
    completedActionItems,
    averageMessagesPerSession: sessions.length > 0 ? totalMessages / sessions.length : 0,
  };
};
