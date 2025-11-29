import { z } from 'zod';

const careerProfileSchema = z.object({
  currentRole: z.string().optional(),
  yearsOfExperience: z.number().optional(),
  experienceLevel: z.enum(['student', 'entry', 'mid', 'senior', 'lead', 'executive']).optional(),
  skills: z.array(z.string()),
  interests: z.array(z.string()),
  education: z.array(z.string()).optional(),
  certifications: z.array(z.string()).optional(),
  careerGoals: z.array(z.enum(['career_change', 'skill_upgrade', 'promotion', 'freelance', 'startup', 'exploring'])).optional(),
  targetRoles: z.array(z.string()).optional(),
  preferredIndustries: z.array(z.string()).optional(),
  location: z.string().optional(),
  remotePreference: z.enum(['onsite', 'remote', 'hybrid', 'flexible']).optional(),
});

export const careerAdviceSchema = z.object({
  body: z.object({
    sessionId: z.string().optional(),
    message: z.string().min(1).max(2000),
    sessionType: z.enum(['career_advice', 'skill_assessment', 'interview_prep', 'resume_review', 'salary_negotiation', 'general']).optional(),
    context: z.object({
      profile: careerProfileSchema.optional(),
      specificTopic: z.string().optional(),
    }).optional(),
  }),
});

export const skillAssessmentSchema = z.object({
  body: z.object({
    skills: z.array(z.string()).min(1),
    targetRole: z.string().optional(),
    includeGapAnalysis: z.boolean().optional(),
  }),
});

export const interviewPrepSchema = z.object({
  body: z.object({
    targetRole: z.string().min(1),
    company: z.string().optional(),
    interviewType: z.enum(['technical', 'behavioral', 'system_design', 'case_study', 'general']).optional(),
    focusAreas: z.array(z.string()).optional(),
  }),
});

export const resumeReviewSchema = z.object({
  body: z.object({
    resumeText: z.string().min(100),
    targetRole: z.string().optional(),
    targetIndustry: z.string().optional(),
  }),
});

export const salaryNegotiationSchema = z.object({
  body: z.object({
    currentSalary: z.number().optional(),
    offeredSalary: z.number().optional(),
    role: z.string().min(1),
    location: z.string().optional(),
    yearsOfExperience: z.number().optional(),
    skills: z.array(z.string()).optional(),
  }),
});

export const getSessionSchema = z.object({
  params: z.object({
    sessionId: z.string(),
  }),
});

export const deleteSessionSchema = z.object({
  params: z.object({
    sessionId: z.string(),
  }),
});

export const getSessionsSchema = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    sessionType: z.enum(['career_advice', 'skill_assessment', 'interview_prep', 'resume_review', 'salary_negotiation', 'general']).optional(),
    isActive: z.string().optional(),
  }),
});
