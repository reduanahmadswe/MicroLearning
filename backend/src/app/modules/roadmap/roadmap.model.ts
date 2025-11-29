import { Schema, model } from 'mongoose';
import { IUserRoadmap } from './roadmap.types';

const roadmapResourceSchema = new Schema({
  type: {
    type: String,
    enum: ['lesson', 'video', 'article', 'book', 'course', 'documentation'],
    required: true,
  },
  title: { type: String, required: true },
  description: String,
  url: String,
  lessonId: { type: Schema.Types.ObjectId, ref: 'Lesson' },
  estimatedTime: Number,
  priority: {
    type: String,
    enum: ['required', 'recommended', 'optional'],
    default: 'recommended',
  },
}, { _id: false });

const roadmapProjectSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced', 'expert'],
    required: true,
  },
  estimatedHours: { type: Number, required: true },
  skills: [String],
  deliverables: [String],
}, { _id: false });

const roadmapAssessmentSchema = new Schema({
  type: {
    type: String,
    enum: ['quiz', 'coding_challenge', 'project', 'certification'],
    required: true,
  },
  title: { type: String, required: true },
  description: { type: String, required: true },
  passingScore: Number,
  estimatedTime: Number,
}, { _id: false });

const roadmapMilestoneSchema = new Schema({
  id: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  order: { type: Number, required: true },
  estimatedDuration: { type: Number, required: true },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced', 'expert'],
    required: true,
  },
  status: {
    type: String,
    enum: ['locked', 'unlocked', 'in_progress', 'completed'],
    default: 'locked',
  },
  prerequisites: [String],
  topics: [String],
  resources: [roadmapResourceSchema],
  projects: [roadmapProjectSchema],
  assessments: [roadmapAssessmentSchema],
  completedAt: Date,
}, { _id: false });

const userRoadmapSchema = new Schema<IUserRoadmap>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    roadmap: {
      title: { type: String, required: true },
      description: { type: String, required: true },
      goal: { type: String, required: true, index: true },
      difficulty: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced', 'expert'],
        required: true,
      },
      totalDuration: { type: Number, required: true },
      estimatedWeeks: { type: Number, required: true },
      milestones: [roadmapMilestoneSchema],
      overview: {
        totalMilestones: Number,
        totalTopics: Number,
        totalProjects: Number,
        requiredSkills: [String],
        careerPaths: [String],
      },
      metadata: {
        generatedAt: Date,
        generatedBy: String,
        tokens: Number,
      },
    },
    status: {
      type: String,
      enum: ['not_started', 'in_progress', 'completed'],
      default: 'not_started',
      index: true,
    },
    progress: {
      completedMilestones: { type: Number, default: 0 },
      totalMilestones: { type: Number, required: true },
      percentageComplete: { type: Number, default: 0 },
      currentMilestoneId: String,
      hoursSpent: { type: Number, default: 0 },
    },
    startedAt: Date,
    completedAt: Date,
    lastAccessedAt: { type: Date, default: Date.now },
    notes: String,
    customizations: {
      skippedMilestones: [String],
      addedResources: [roadmapResourceSchema],
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
userRoadmapSchema.index({ user: 1, status: 1 });
userRoadmapSchema.index({ 'roadmap.goal': 1 });
userRoadmapSchema.index({ createdAt: -1 });

export const UserRoadmap = model<IUserRoadmap>('UserRoadmap', userRoadmapSchema);
