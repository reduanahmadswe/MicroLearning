import { Types } from 'mongoose';

/**
 * AI Career Mentor Types
 */

export type CareerGoal = 'career_change' | 'skill_upgrade' | 'promotion' | 'freelance' | 'startup' | 'exploring';
export type ExperienceLevel = 'student' | 'entry' | 'mid' | 'senior' | 'lead' | 'executive';
export type SessionType = 'career_advice' | 'skill_assessment' | 'interview_prep' | 'resume_review' | 'salary_negotiation' | 'general';

export interface ICareerProfile {
  currentRole?: string;
  yearsOfExperience?: number;
  experienceLevel?: ExperienceLevel;
  skills: string[];
  interests: string[];
  education?: string[];
  certifications?: string[];
  careerGoals?: CareerGoal[];
  targetRoles?: string[];
  preferredIndustries?: string[];
  location?: string;
  remotePreference?: 'onsite' | 'remote' | 'hybrid' | 'flexible';
}

export interface ICareerAdviceRequest {
  sessionId?: string;
  message: string;
  sessionType?: SessionType;
  context?: {
    profile?: ICareerProfile;
    specificTopic?: string;
  };
}

export interface ICareerAdviceResponse {
  message: string;
  sessionId: string;
  suggestions?: string[];
  actionItems?: IActionItem[];
  resources?: ICareerResource[];
  metadata: {
    tokens: number;
    provider: string;
    sessionType: SessionType;
  };
}

export interface IActionItem {
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  timeframe?: string;
  completed?: boolean;
}

export interface ICareerResource {
  type: 'article' | 'video' | 'course' | 'book' | 'tool' | 'community';
  title: string;
  description: string;
  url?: string;
  relevance: string;
}

export interface ISkillAssessmentRequest {
  skills: string[];
  targetRole?: string;
  includeGapAnalysis?: boolean;
}

export interface ISkillAssessment {
  assessedSkills: IAssessedSkill[];
  overallScore: number;
  strengths: string[];
  weaknesses: string[];
  gapAnalysis?: ISkillGap[];
  recommendations: string[];
  learningPath: string[];
}

export interface IAssessedSkill {
  skill: string;
  currentLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  marketDemand: 'low' | 'medium' | 'high' | 'very_high';
  importance: number; // 1-10
  recommendedActions: string[];
}

export interface ISkillGap {
  skill: string;
  requiredLevel: string;
  currentLevel: string;
  priority: 'high' | 'medium' | 'low';
  estimatedTimeToLearn: string;
}

export interface IInterviewPrepRequest {
  targetRole: string;
  company?: string;
  interviewType?: 'technical' | 'behavioral' | 'system_design' | 'case_study' | 'general';
  focusAreas?: string[];
}

export interface IInterviewPrepResponse {
  questions: IInterviewQuestion[];
  tips: string[];
  commonPitfalls: string[];
  preparationPlan: string[];
  resources: ICareerResource[];
}

export interface IInterviewQuestion {
  question: string;
  type: 'technical' | 'behavioral' | 'situational';
  difficulty: 'easy' | 'medium' | 'hard';
  sampleAnswer?: string;
  keyPoints: string[];
}

export interface IResumeReviewRequest {
  resumeText: string;
  targetRole?: string;
  targetIndustry?: string;
}

export interface IResumeReviewResponse {
  overallScore: number;
  strengths: string[];
  weaknesses: string[];
  suggestions: IResumeSuggestion[];
  keywords: {
    missing: string[];
    present: string[];
    recommended: string[];
  };
  formatting: {
    score: number;
    issues: string[];
    recommendations: string[];
  };
}

export interface IResumeSuggestion {
  section: 'summary' | 'experience' | 'skills' | 'education' | 'projects' | 'general';
  issue: string;
  suggestion: string;
  priority: 'high' | 'medium' | 'low';
}

export interface ISalaryNegotiationRequest {
  currentSalary?: number;
  offeredSalary?: number;
  role: string;
  location?: string;
  yearsOfExperience?: number;
  skills?: string[];
}

export interface ISalaryNegotiationResponse {
  marketRange: {
    min: number;
    max: number;
    median: number;
    percentile75: number;
  };
  negotiationStrategy: string[];
  scriptSuggestions: string[];
  considerations: string[];
  redFlags: string[];
}

export interface ICareerMentorSession {
  _id?: Types.ObjectId;
  user: Types.ObjectId;
  title: string;
  sessionType: SessionType;
  messages: Array<{
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: Date;
    actionItems?: IActionItem[];
  }>;
  profile?: ICareerProfile;
  isActive: boolean;
  summary?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ICareerMentorStats {
  totalSessions: number;
  activeSessions: number;
  totalMessages: number;
  bySessionType: Record<SessionType, number>;
  totalActionItems: number;
  completedActionItems: number;
  averageMessagesPerSession: number;
}
