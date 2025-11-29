import { Types } from 'mongoose';

/**
 * AI Roadmap Generator Types
 */

export type RoadmapDifficulty = 'beginner' | 'intermediate' | 'advanced' | 'expert';
export type RoadmapStatus = 'not_started' | 'in_progress' | 'completed';
export type MilestoneStatus = 'locked' | 'unlocked' | 'in_progress' | 'completed';

export interface IGenerateRoadmapRequest {
  goal: string;
  currentLevel?: RoadmapDifficulty;
  timeCommitment?: number; // hours per week
  targetDuration?: number; // weeks
  existingSkills?: string[];
  learningStyle?: 'visual' | 'auditory' | 'reading' | 'kinesthetic' | 'mixed';
  preferences?: {
    includeProjects?: boolean;
    includeCertifications?: boolean;
    focusAreas?: string[];
  };
}

export interface IRoadmapMilestone {
  id: string;
  title: string;
  description: string;
  order: number;
  estimatedDuration: number; // hours
  difficulty: RoadmapDifficulty;
  status: MilestoneStatus;
  prerequisites: string[]; // milestone IDs
  topics: string[];
  resources: IRoadmapResource[];
  projects?: IRoadmapProject[];
  assessments?: IRoadmapAssessment[];
  completedAt?: Date;
}

export interface IRoadmapResource {
  type: 'lesson' | 'video' | 'article' | 'book' | 'course' | 'documentation';
  title: string;
  description?: string;
  url?: string;
  lessonId?: Types.ObjectId;
  estimatedTime?: number; // minutes
  priority: 'required' | 'recommended' | 'optional';
}

export interface IRoadmapProject {
  title: string;
  description: string;
  difficulty: RoadmapDifficulty;
  estimatedHours: number;
  skills: string[];
  deliverables: string[];
}

export interface IRoadmapAssessment {
  type: 'quiz' | 'coding_challenge' | 'project' | 'certification';
  title: string;
  description: string;
  passingScore?: number;
  estimatedTime?: number;
}

export interface IGeneratedRoadmap {
  title: string;
  description: string;
  goal: string;
  difficulty: RoadmapDifficulty;
  totalDuration: number; // hours
  estimatedWeeks: number;
  milestones: IRoadmapMilestone[];
  overview: {
    totalMilestones: number;
    totalTopics: number;
    totalProjects: number;
    requiredSkills: string[];
    careerPaths: string[];
  };
  metadata: {
    generatedAt: Date;
    generatedBy: string;
    tokens: number;
  };
}

export interface IUserRoadmap {
  _id?: Types.ObjectId;
  user: Types.ObjectId;
  roadmap: IGeneratedRoadmap;
  status: RoadmapStatus;
  progress: {
    completedMilestones: number;
    totalMilestones: number;
    percentageComplete: number;
    currentMilestoneId?: string;
    hoursSpent: number;
  };
  startedAt?: Date;
  completedAt?: Date;
  lastAccessedAt: Date;
  notes?: string;
  customizations?: {
    skippedMilestones?: string[];
    addedResources?: IRoadmapResource[];
  };
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IUpdateRoadmapProgressRequest {
  milestoneId: string;
  status: MilestoneStatus;
  hoursSpent?: number;
  notes?: string;
}

export interface IRoadmapStats {
  totalRoadmaps: number;
  activeRoadmaps: number;
  completedRoadmaps: number;
  totalHoursSpent: number;
  averageCompletionRate: number;
  byDifficulty: Record<RoadmapDifficulty, number>;
  mostPopularGoals: Array<{ goal: string; count: number }>;
}
