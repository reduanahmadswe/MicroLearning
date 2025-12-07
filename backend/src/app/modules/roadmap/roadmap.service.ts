import axios from 'axios';
import { Types } from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
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

// Force reload environment variables
dotenv.config({ path: path.join(process.cwd(), '.env') });

console.log('🔍 [Roadmap Service] Environment check:', {
  cwd: process.cwd(),
  openrouterKey: process.env.OPENROUTER_API_KEY?.substring(0, 20),
  openaiKey: process.env.OPENAI_API_KEY?.substring(0, 20),
});

/**
 * AI Config for Roadmap (OpenRouter or OpenAI)
 */
const AI_CONFIG = {
  apiKey: process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY || '',
  baseURL: process.env.OPENAI_API_BASE_URL || 'https://openrouter.ai/api/v1',
  model: 'openai/gpt-4o-mini',
};

/**
 * Make AI API Request (OpenRouter or OpenAI)
 *//**
 * Make AI API Request (OpenRouter or OpenAI)
 */
const makeOpenAIRequest = async (messages: any[], temperature: number = 0.7) => {
  console.log('🔑 AI API Key check:', {
    openrouterExists: !!process.env.OPENROUTER_API_KEY,
    openaiExists: !!process.env.OPENAI_API_KEY,
    usingKey: AI_CONFIG.apiKey ? 'Found' : 'Missing',
    keyLength: AI_CONFIG.apiKey?.length || 0,
    baseURL: AI_CONFIG.baseURL,
    model: AI_CONFIG.model,
  });

  if (!AI_CONFIG.apiKey) {
    console.error('❌ AI API key not configured!');
    throw new ApiError(500, 'AI API key not configured. Please set OPENROUTER_API_KEY or OPENAI_API_KEY in .env');
  }

  try {
    console.log('🚀 Calling AI API...');
    const response = await axios.post(
      `${AI_CONFIG.baseURL}/chat/completions`,
      {
        model: AI_CONFIG.model,
        messages,
        temperature,
        max_tokens: 4000,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${AI_CONFIG.apiKey}`,
          'HTTP-Referer': process.env.FRONTEND_URL || 'http://localhost:3000',
          'X-Title': 'MicroLearning Roadmap Generator',
        },
        timeout: 90000,
      }
    );

    console.log('✅ AI API call successful!');
    return response.data;
  } catch (error: any) {
    console.error('❌ AI API call failed:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
    });
    throw new ApiError(
      error.response?.status || 500,
      `AI API error: ${error.response?.data?.error?.message || error.message}`
    );
  }
};

/**
 * Generate Learning Roadmap
 */
export const generateRoadmap = async (
  userId: Types.ObjectId,
  data: IGenerateRoadmapRequest
): Promise<IGeneratedRoadmap> => {
  console.log('🤖 [Roadmap] Starting generation:', {
    userId,
    goal: data.goal,
    currentLevel: data.currentLevel,
    timeCommitment: data.timeCommitment,
  });

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

IMPORTANT RULES:
- Assessment "type" MUST be one of: "quiz", "coding_challenge", "project", "certification"
- "passingScore" MUST be a number (0-100), NOT "N/A" or string
- If no passing score applicable, use 70 as default
- "difficulty" MUST be one of: "beginner", "intermediate", "advanced", "expert"
- "priority" MUST be one of: "required", "recommended", "optional"

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
    console.log('📝 [Roadmap] Raw AI response length:', content.length);
    
    // Extract JSON from markdown code blocks if present
    let jsonContent = content;
    const jsonMatch = content.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
    if (jsonMatch) {
      jsonContent = jsonMatch[1];
      console.log('✂️ [Roadmap] Extracted JSON from code block');
    }

    let parsedContent;
    try {
      parsedContent = JSON.parse(jsonContent);
      console.log('✅ [Roadmap] JSON parsed successfully');
      
      // Sanitize data to match schema
      if (parsedContent.milestones) {
        parsedContent.milestones.forEach((milestone: any) => {
          if (milestone.assessments) {
            milestone.assessments.forEach((assessment: any) => {
              // Fix invalid assessment types
              const validTypes = ['quiz', 'coding_challenge', 'project', 'certification'];
              if (!validTypes.includes(assessment.type)) {
                console.log(`⚠️ Fixing invalid assessment type: ${assessment.type} -> quiz`);
                assessment.type = 'quiz';
              }
              
              // Fix non-numeric passingScore
              if (typeof assessment.passingScore !== 'number' || isNaN(assessment.passingScore)) {
                console.log(`⚠️ Fixing invalid passingScore: ${assessment.passingScore} -> 70`);
                assessment.passingScore = 70;
              }
            });
          }
        });
      }
      
    } catch (parseError) {
      console.error('❌ [Roadmap] JSON parse failed:', parseError);
      console.log('📄 Content preview:', jsonContent.substring(0, 500));
      throw new ApiError(500, 'Failed to parse AI response as JSON');
    }

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
    const savedRoadmap = await UserRoadmap.create({
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

    console.log('💾 [Roadmap] Saved to database:', {
      id: savedRoadmap._id,
      title: generatedRoadmap.title,
      milestonesCount: generatedRoadmap.milestones.length,
    });

    return generatedRoadmap;
  } catch (error: any) {
    console.error('❌ [Roadmap Generation] Failed:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      openaiError: error.response?.data,
      stack: error.stack,
    });

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
  console.log('📋 [Roadmap] Getting user roadmaps:', { userId, page, limit, status });
  
  const filter: any = { user: userId };
  if (status) filter.status = status;

  const roadmaps = await UserRoadmap.find(filter)
    .sort({ lastAccessedAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();

  const total = await UserRoadmap.countDocuments(filter);

  console.log('📋 [Roadmap] Found roadmaps:', { count: roadmaps.length, total });

  // Transform roadmaps to flatten structure for frontend
  const transformedRoadmaps = roadmaps.map((rm: any) => ({
    _id: rm._id,
    title: rm.roadmap?.title || 'Untitled Roadmap',
    description: rm.roadmap?.description || '',
    difficulty: rm.roadmap?.difficulty || 'intermediate',
    category: rm.roadmap?.goal || 'General',
    totalNodes: rm.roadmap?.milestones?.length || 0,
    completedNodes: rm.progress?.completedMilestones || 0,
    progress: rm.progress?.percentageComplete || 0,
    status: rm.status,
    estimatedWeeks: rm.roadmap?.estimatedWeeks || 0,
    lastAccessedAt: rm.lastAccessedAt,
    createdAt: rm.createdAt,
  }));

  return {
    roadmaps: transformedRoadmaps,
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
  }).lean();

  if (!roadmap) {
    throw new ApiError(404, 'Roadmap not found');
  }

  // Update last accessed (need to fetch again without lean for save)
  await UserRoadmap.updateOne(
    { _id: roadmapId },
    { lastAccessedAt: new Date() }
  );

  // Transform to frontend format
  const transformed: any = {
    _id: roadmap._id,
    title: roadmap.roadmap?.title || 'Untitled Roadmap',
    description: roadmap.roadmap?.description || '',
    difficulty: roadmap.roadmap?.difficulty || 'intermediate',
    category: roadmap.roadmap?.goal || 'General',
    totalNodes: roadmap.roadmap?.milestones?.length || 0,
    completedNodes: roadmap.progress?.completedMilestones || 0,
    progress: roadmap.progress?.percentageComplete || 0,
    status: roadmap.status,
    estimatedWeeks: roadmap.roadmap?.estimatedWeeks || 0,
    
    // Transform milestones to nodes
    nodes: roadmap.roadmap?.milestones?.map((milestone: any, index: number) => ({
      id: milestone.id,
      title: milestone.title,
      description: milestone.description,
      type: 'lesson', // Default type
      level: index + 1,
      isCompleted: milestone.status === 'completed',
      isLocked: milestone.status === 'locked',
      estimatedTime: milestone.estimatedDuration || 0,
      xpReward: 50, // Default XP
      resources: milestone.resources || [],
      topics: milestone.topics || [],
      projects: milestone.projects || [],
      assessments: milestone.assessments || [],
    })) || [],
  };

  console.log('📖 [Roadmap] Returning roadmap detail:', {
    id: transformed._id,
    title: transformed.title,
    nodesCount: transformed.nodes.length,
  });

  return transformed;
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
