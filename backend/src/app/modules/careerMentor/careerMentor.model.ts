import { Schema, model } from 'mongoose';
import { ICareerMentorSession } from './careerMentor.types';

const actionItemSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  priority: {
    type: String,
    enum: ['high', 'medium', 'low'],
    default: 'medium',
  },
  timeframe: String,
  completed: { type: Boolean, default: false },
}, { _id: false });

const messageSchema = new Schema({
  role: {
    type: String,
    enum: ['user', 'assistant', 'system'],
    required: true,
  },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  actionItems: [actionItemSchema],
}, { _id: false });

const careerProfileSchema = new Schema({
  currentRole: String,
  yearsOfExperience: Number,
  experienceLevel: {
    type: String,
    enum: ['student', 'entry', 'mid', 'senior', 'lead', 'executive'],
  },
  skills: [String],
  interests: [String],
  education: [String],
  certifications: [String],
  careerGoals: [{
    type: String,
    enum: ['career_change', 'skill_upgrade', 'promotion', 'freelance', 'startup', 'exploring'],
  }],
  targetRoles: [String],
  preferredIndustries: [String],
  location: String,
  remotePreference: {
    type: String,
    enum: ['onsite', 'remote', 'hybrid', 'flexible'],
  },
}, { _id: false });

const careerMentorSessionSchema = new Schema<ICareerMentorSession>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    sessionType: {
      type: String,
      enum: ['career_advice', 'skill_assessment', 'interview_prep', 'resume_review', 'salary_negotiation', 'general'],
      default: 'general',
      index: true,
    },
    messages: [messageSchema],
    profile: careerProfileSchema,
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    summary: String,
  },
  {
    timestamps: true,
  }
);

// Indexes
careerMentorSessionSchema.index({ user: 1, isActive: 1 });
careerMentorSessionSchema.index({ user: 1, sessionType: 1 });
careerMentorSessionSchema.index({ updatedAt: -1 });

export const CareerMentorSession = model<ICareerMentorSession>(
  'CareerMentorSession',
  careerMentorSessionSchema
);
