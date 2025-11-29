import axios from 'axios';
import { Types } from 'mongoose';
import {
  IGenerateRoadmapRequest,
  IGeneratedRoadmap,
  IUpdateRoadmapProgressRequest,
  IRoadmapStats,
  RoadmapStatus,
} from './roadmap.types';
import { UserRoadmap } from './roadmap.model';
import User from '../auth/auth.model';
import ApiError from '../../../utils/ApiError';

/**
 * AI Config for Roadmap
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
const makeOpenAIRequest = async (messages: any[], temperature: number = 0.7) => {
  if (!AI_CONFIG.openai.apiKey) {
    throw new ApiError(500, 'OpenAI API key not configured');
  }

  const response = await axios.post(
    AI_CONFIG.openai.endpoint,
    {
      model: AI_CONFIG.openai.model,
      messages,
      temperature,
      max_tokens: 4000,
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
 * Generate Learning Roadmap
 */
export const generateRoadmap = async (
  userId: Types.ObjectId,
  data: IGenerateRoadmapRequest
): Promise<IGeneratedRoadmap> => {
  await User.findById(userId).select('name interests');

  const systemPrompt = `You are an expert learning advisor and curriculum designer.
Create comprehensive, personalized learning roadmaps that guide students from their current level to their goal.
Focus on practical, achievable milestones with clear progression paths.
Include diverse resources, hands-on projects, and regular assessments.`;

  const userPrompt = `Create a detailed learning roadmap for:

Goal: ${data.goal}
Current Level: ${data.currentLevel || 'intermediate'}
Time Commitment: ${data.timeCommitment || 10} hours/week
Target Duration: ${data.targetDuration || 12} weeks
${data.existingSkills?.length ? `Existing Skills: ${data.existingSkills.join(', ')}` : ''}
${data.learningStyle ? `Learning Style: ${data.learningStyle}` : ''}
${data.preferences?.includeProjects ? 'Include hands-on projects' : ''}
${data.preferences?.includeCertifications ? 'Include certification recommendations' : ''}
${data.preferences?.focusAreas?.length ? `Focus Areas: ${data.preferences.focusAreas.join(', ')}` : ''}

Structure the roadmap as follows:

1. **Overview**: Brief description of the learning path, total duration, and career opportunities
2. **Milestones**: 5-10 progressive milestones, each containing:
   - Title and detailed description
   - Estimated duration (hours)
   - Difficulty level
   - Prerequisites (milestone IDs)
   - Topics to cover
   - Resources (lessons, videos, articles, books, courses)
   - Projects (if applicable)
   - Assessments (quizzes, challenges, certifications)

3. **Required Skills**: List skills needed throughout the journey
4. **Career Paths**: Potential career opportunities after completion

Format your response as JSON:
{
  "title": "Complete roadmap title",
  "description": "Engaging overview of the learning journey",
  "goal": "${data.goal}",
  "difficulty": "${data.currentLevel || 'intermediate'}",
  "totalDuration": 120,
  "estimatedWeeks": ${data.targetDuration || 12},
  "milestones": [
    {
      "id": "m1",
      "title": "Milestone title",
      "description": "Detailed description",
      "order": 1,
      "estimatedDuration": 15,
      "difficulty": "beginner",
      "status": "unlocked",
      "prerequisites": [],
      "topics": ["Topic 1", "Topic 2"],
      "resources": [
        {
          "type": "lesson",
          "title": "Resource title",
          "description": "Brief description",
          "url": "https://example.com",
          "estimatedTime": 30,
          "priority": "required"
        }
      ],
      "projects": [
        {
          "title": "Project title",
          "description": "Project description",
          "difficulty": "beginner",
          "estimatedHours": 5,
          "skills": ["Skill 1", "Skill 2"],
          "deliverables": ["Deliverable 1", "Deliverable 2"]
        }
      ],
      "assessments": [
        {
          "type": "quiz",
          "title": "Assessment title",
          "description": "Assessment description",
          "passingScore": 80,
          "estimatedTime": 20
        }
      ]
    }
  ],
  "overview": {
    "totalMilestones": 8,
    "totalTopics": 40,
    "totalProjects": 5,
    "requiredSkills": ["Skill 1", "Skill 2"],
    "careerPaths": ["Career 1", "Career 2"]
  }
}

Make it comprehensive, practical, and achievable!`;

  try {
    const response = await makeOpenAIRequest(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      0.7
    );

    const content = response.choices[0].message.content;
    const parsedContent = JSON.parse(content);

    // Unlock first milestone
    if (parsedContent.milestones?.[0]) {
      parsedContent.milestones[0].status = 'unlocked';
    }

    const generatedRoadmap: IGeneratedRoadmap = {
      ...parsedContent,
      metadata: {
        generatedAt: new Date(),
        generatedBy: 'openai',
        tokens: response.usage.total_tokens,
      },
    };

    // Save roadmap for user
    await UserRoadmap.create({
      user: userId,
      roadmap: generatedRoadmap,
      status: 'not_started',
      progress: {
        completedMilestones: 0,
        totalMilestones: generatedRoadmap.milestones.length,
        percentageComplete: 0,
        currentMilestoneId: generatedRoadmap.milestones[0]?.id,
        hoursSpent: 0,
      },
      lastAccessedAt: new Date(),
    });

    return generatedRoadmap;
  } catch (error: any) {
    if (error.response) {
      throw new ApiError(
        error.response.status,
        `OpenAI Error: ${error.response.data?.error?.message || 'Unknown error'}`
      );
    }
    throw new ApiError(500, `Failed to generate roadmap: ${error.message}`);
  }
};

/**
 * Get User Roadmaps
 */
export const getUserRoadmaps = async (
  userId: Types.ObjectId,
  page: number = 1,
  limit: number = 20,
  status?: RoadmapStatus
) => {
  const filter: any = { user: userId };
  if (status) filter.status = status;

  const roadmaps = await UserRoadmap.find(filter)
    .sort({ lastAccessedAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();

  const total = await UserRoadmap.countDocuments(filter);

  return {
    roadmaps,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      itemsPerPage: limit,
    },
  };
};

/**
 * Get Roadmap by ID
 */
export const getRoadmapById = async (userId: Types.ObjectId, roadmapId: string) => {
  const roadmap = await UserRoadmap.findOne({
    _id: roadmapId,
    user: userId,
  });

  if (!roadmap) {
    throw new ApiError(404, 'Roadmap not found');
  }

  // Update last accessed
  roadmap.lastAccessedAt = new Date();
  await roadmap.save();

  return roadmap;
};

/**
 * Update Roadmap Progress
 */
export const updateRoadmapProgress = async (
  userId: Types.ObjectId,
  roadmapId: string,
  data: IUpdateRoadmapProgressRequest
) => {
  const roadmap = await UserRoadmap.findOne({
    _id: roadmapId,
    user: userId,
  });

  if (!roadmap) {
    throw new ApiError(404, 'Roadmap not found');
  }

  // Find and update milestone
  const milestone = roadmap.roadmap.milestones.find((m) => m.id === data.milestoneId);
  if (!milestone) {
    throw new ApiError(404, 'Milestone not found');
  }

  milestone.status = data.status;
  if (data.status === 'completed') {
    milestone.completedAt = new Date();
    roadmap.progress.completedMilestones += 1;

    // Unlock next milestone
    const nextMilestone = roadmap.roadmap.milestones.find(
      (m) => m.prerequisites.includes(data.milestoneId) && m.status === 'locked'
    );
    if (nextMilestone) {
      nextMilestone.status = 'unlocked';
      roadmap.progress.currentMilestoneId = nextMilestone.id;
    }
  } else if (data.status === 'in_progress') {
    roadmap.progress.currentMilestoneId = data.milestoneId;
    if (roadmap.status === 'not_started') {
      roadmap.status = 'in_progress';
      roadmap.startedAt = new Date();
    }
  }

  if (data.hoursSpent) {
    roadmap.progress.hoursSpent += data.hoursSpent;
  }

  if (data.notes) {
    roadmap.notes = roadmap.notes ? `${roadmap.notes}\n\n${data.notes}` : data.notes;
  }

  // Update progress percentage
  roadmap.progress.percentageComplete = Math.round(
    (roadmap.progress.completedMilestones / roadmap.progress.totalMilestones) * 100
  );

  // Check if roadmap is completed
  if (roadmap.progress.completedMilestones === roadmap.progress.totalMilestones) {
    roadmap.status = 'completed';
    roadmap.completedAt = new Date();
  }

  roadmap.lastAccessedAt = new Date();
  await roadmap.save();

  return roadmap;
};

/**
 * Delete Roadmap
 */
export const deleteRoadmap = async (userId: Types.ObjectId, roadmapId: string) => {
  const roadmap = await UserRoadmap.findOneAndDelete({
    _id: roadmapId,
    user: userId,
  });

  if (!roadmap) {
    throw new ApiError(404, 'Roadmap not found');
  }

  return { message: 'Roadmap deleted successfully' };
};

/**
 * Get Roadmap Statistics
 */
export const getRoadmapStats = async (userId: Types.ObjectId): Promise<IRoadmapStats> => {
  const roadmaps = await UserRoadmap.find({ user: userId }).lean();

  const byDifficulty: Record<string, number> = {
    beginner: 0,
    intermediate: 0,
    advanced: 0,
    expert: 0,
  };

  const goalCounts: Record<string, number> = {};
  let totalHours = 0;
  let totalCompletionRate = 0;
  let activeCount = 0;
  let completedCount = 0;

  roadmaps.forEach((rm) => {
    byDifficulty[rm.roadmap.difficulty] = (byDifficulty[rm.roadmap.difficulty] || 0) + 1;
    goalCounts[rm.roadmap.goal] = (goalCounts[rm.roadmap.goal] || 0) + 1;
    totalHours += rm.progress.hoursSpent;
    totalCompletionRate += rm.progress.percentageComplete;
    if (rm.status === 'in_progress') activeCount++;
    if (rm.status === 'completed') completedCount++;
  });

  const mostPopularGoals = Object.entries(goalCounts)
    .map(([goal, count]) => ({ goal, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return {
    totalRoadmaps: roadmaps.length,
    activeRoadmaps: activeCount,
    completedRoadmaps: completedCount,
    totalHoursSpent: totalHours,
    averageCompletionRate: roadmaps.length > 0 ? totalCompletionRate / roadmaps.length : 0,
    byDifficulty: byDifficulty as any,
    mostPopularGoals,
  };
};
