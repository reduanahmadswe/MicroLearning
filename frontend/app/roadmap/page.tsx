'use client';

import { useEffect, useState } from 'react';
import {
  Map,
  Target,
  CheckCircle,
  Lock,
  Star,
  Award,
  BookOpen,
  Flag,
  ChevronRight,
  Zap,
  Clock,
  Sparkles,
  ArrowLeft,
  Trophy,
  X,
  TrendingUp,
} from 'lucide-react';
import { roadmapAPI } from '@/services/api.service';
import { toast } from 'sonner';

interface RoadmapNode {
  _id: string;
  title: string;
  description: string;
  type: 'course' | 'lesson' | 'quiz' | 'project' | 'milestone';
  level: number;
  position: number;
  isCompleted: boolean;
  isLocked: boolean;
  prerequisites: string[];
  estimatedTime: number;
  xpReward: number;
  resources: any[];
}

interface Roadmap {
  _id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  totalNodes: number;
  completedNodes: number;
  estimatedDuration: string;
  nodes: RoadmapNode[];
}

export default function RoadmapPage() {
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>([]);
  const [selectedRoadmap, setSelectedRoadmap] = useState<Roadmap | null>(null);
  const [loading, setLoading] = useState(true);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [goal, setGoal] = useState('');
  const [currentLevel, setCurrentLevel] = useState('beginner');
  const [timeCommitment, setTimeCommitment] = useState(10); // number, not string

  useEffect(() => {
    loadRoadmaps();
  }, []);

  const loadRoadmaps = async () => {
    try {
      setLoading(true);
      const response = await roadmapAPI.getRoadmaps();
      setRoadmaps(response.data.data || []);
    } catch (error: any) {
      toast.error('Failed to load roadmaps');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateRoadmap = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goal.trim()) {
      toast.error('Please enter your learning goal');
      return;
    }


    try {
      setGenerating(true);
      await roadmapAPI.generateRoadmap({
        goal: goal.trim(),
        currentLevel,
        timeCommitment: timeCommitment, // hours per week (number)
      });
      toast.success('🎉 Roadmap generated successfully!');
      setShowGenerateModal(false);
      setGoal('');
      loadRoadmaps();
    } catch (error: any) {
      console.error('❌ Roadmap generation error:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        fullError: error,
      });
      toast.error(error?.response?.data?.message || 'Failed to generate roadmap');
    } finally {
      setGenerating(false);
    }
  };

  const loadRoadmapDetails = async (roadmapId: string) => {
    try {
      const response = await roadmapAPI.getRoadmap(roadmapId);
      setSelectedRoadmap(response.data.data);
    } catch (error: any) {
      toast.error('Failed to load roadmap details');
    }
  };

  const getNodeIcon = (type: string) => {
    const icons: any = {
      course: BookOpen,
      lesson: BookOpen,
      quiz: Target,
      project: Award,
      milestone: Flag,
    };
    return icons[type] || BookOpen;
  };

  const getNodeColor = (node: RoadmapNode) => {
    if (node.isCompleted) return 'from-green-500 to-emerald-600';
    if (node.isLocked) return 'from-gray-300 to-gray-400';
    return 'from-green-600 to-teal-600';
  };

  return (
    <div className="min-h-screen bg-page-gradient">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-green-600 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Map className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-green-600 to-teal-600 dark:from-green-500 dark:to-teal-500 bg-clip-text text-transparent">
                  Learning Roadmaps
                </h1>
                <p className="text-sm sm:text-base text-muted-foreground mt-1">
                  AI-powered structured learning paths
                </p>
              </div>
            </div>

            <div className="flex gap-2 sm:gap-3">
              {selectedRoadmap && (
                <button
                  onClick={() => setSelectedRoadmap(null)}
                  className="px-4 py-2 bg-card border-2 border-border rounded-xl hover:border-primary/50 hover:bg-accent transition-all flex items-center gap-2 text-sm font-medium text-foreground"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">Back</span>
                </button>
              )}
              <button
                onClick={() => setShowGenerateModal(true)}
                className="px-4 py-2 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-xl hover:shadow-lg hover:scale-105 transition-all flex items-center gap-2 text-sm font-medium"
              >
                <Sparkles className="w-4 h-4" />
                <span>AI Generate</span>
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="w-12 h-12 border-4 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
          </div>
        ) : !selectedRoadmap ? (
          /* Roadmaps List */
          roadmaps.length === 0 ? (
            <div className="bg-card rounded-2xl shadow-xl border-2 border-border p-12 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-teal-100 dark:from-green-900/30 dark:to-teal-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Map className="w-10 h-10 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">No roadmaps yet</h3>
              <p className="text-muted-foreground mb-6">Generate your first AI-powered learning roadmap!</p>
              <button
                onClick={() => setShowGenerateModal(true)}
                className="px-6 py-3 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-xl hover:shadow-lg transition-all inline-flex items-center gap-2 font-medium"
              >
                <Sparkles className="w-5 h-5" />
                Generate Roadmap
              </button>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {roadmaps.map((roadmap) => {
                const progress = roadmap.totalNodes > 0 ? (roadmap.completedNodes / roadmap.totalNodes) * 100 : 0;

                return (
                  <div
                    key={roadmap._id}
                    onClick={() => loadRoadmapDetails(roadmap._id)}
                    className="bg-card rounded-2xl shadow-xl border-2 border-border hover:border-primary/50 hover:shadow-2xl transition-all cursor-pointer group"
                  >
                    {/* Header */}
                    <div className="p-5 sm:p-6 border-b border-border/50">
                      <div className="flex items-start justify-between mb-3">
                        <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${roadmap.difficulty === 'beginner' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
                          roadmap.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' :
                            'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                          }`}>
                          {roadmap.difficulty}
                        </span>
                        <span className="px-3 py-1 bg-gradient-to-r from-green-100 to-teal-100 dark:from-green-900/30 dark:to-teal-900/30 text-green-700 dark:text-green-300 text-xs font-semibold rounded-lg">
                          {roadmap.category}
                        </span>
                      </div>
                      <h3 className="text-lg sm:text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                        {roadmap.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                        {roadmap.description}
                      </p>
                    </div>

                    {/* Progress & Stats */}
                    <div className="p-5 sm:p-6 space-y-4">
                      <div>
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span className="text-muted-foreground font-medium">Progress</span>
                          <span className="font-bold text-primary">
                            {roadmap.completedNodes} / {roadmap.totalNodes}
                          </span>
                        </div>
                        <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-green-600 to-teal-600 transition-all duration-500"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <p className="text-xs text-primary font-semibold mt-1.5">
                          {Math.round(progress)}% Complete
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                            <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          </div>
                          <span className="font-medium">{roadmap.estimatedDuration}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                            <Target className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                          </div>
                          <span className="font-medium">{roadmap.totalNodes} nodes</span>
                        </div>
                      </div>

                      <button className="w-full py-3 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-xl font-medium hover:shadow-lg hover:scale-105 transition-all flex items-center justify-center gap-2">
                        {progress > 0 ? (
                          <>
                            <TrendingUp className="w-4 h-4" />
                            Continue Journey
                          </>
                        ) : (
                          <>
                            <Map className="w-4 h-4" />
                            Start Journey
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        ) : (
          /* Roadmap Detail View */
          <div className="bg-card rounded-2xl shadow-xl border-2 border-border p-6 sm:p-8">
            <div className="mb-6">
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">{selectedRoadmap.title}</h2>
              <p className="text-muted-foreground">{selectedRoadmap.description}</p>

              {/* Progress Bar */}
              <div className="mt-4">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-muted-foreground font-medium">Overall Progress</span>
                  <span className="font-bold text-primary">
                    {Math.round((selectedRoadmap.completedNodes / selectedRoadmap.totalNodes) * 100)}%
                  </span>
                </div>
                <div className="h-3 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-green-600 to-teal-600"
                    style={{ width: `${(selectedRoadmap.completedNodes / selectedRoadmap.totalNodes) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Nodes Timeline */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-foreground mb-4">Learning Path</h3>

              <div className="relative pl-8">
                {/* Vertical line */}
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-green-200 via-teal-300 to-green-400"></div>

                {selectedRoadmap.nodes?.map((node, index) => {
                  const Icon = getNodeIcon(node.type);
                  const colorClass = getNodeColor(node);

                  return (
                    <div key={node._id || index} className="relative mb-6 last:mb-0">
                      {/* Node Icon */}
                      <div
                        className={`absolute -left-6 w-8 h-8 rounded-full bg-gradient-to-br ${colorClass} flex items-center justify-center shadow-lg`}
                      >
                        {node.isCompleted ? (
                          <CheckCircle className="w-4 h-4 text-white" />
                        ) : node.isLocked ? (
                          <Lock className="w-4 h-4 text-white" />
                        ) : (
                          <Icon className="w-4 h-4 text-white" />
                        )}
                      </div>

                      {/* Node Card */}
                      <div className={`ml-6 p-4 rounded-xl border-2 transition-all ${node.isLocked ? 'bg-muted border-border opacity-60' :
                        node.isCompleted ? 'bg-green-50 dark:bg-green-900/10 border-green-300 dark:border-green-800' :
                          'bg-card border-border hover:border-primary/50 hover:shadow-md cursor-pointer'
                        }`}>
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h4 className="font-bold text-foreground mb-1">{node.title}</h4>
                            <p className="text-xs text-muted-foreground mb-2">
                              {node.type.toUpperCase()} • Level {node.level}
                            </p>
                          </div>
                          {node.isCompleted && (
                            <span className="px-2 py-1 bg-green-600 text-white text-xs font-semibold rounded-lg">
                              ✓ Done
                            </span>
                          )}
                          {!node.isCompleted && !node.isLocked && (
                            <div className="flex items-center gap-1 text-orange-600 dark:text-orange-400">
                              <Zap className="w-4 h-4" />
                              <span className="text-sm font-bold">+{node.xpReward}</span>
                            </div>
                          )}
                        </div>

                        <p className="text-sm text-muted-foreground mb-3">{node.description}</p>

                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{node.estimatedTime} min</span>
                          </div>
                          {node.resources && node.resources.length > 0 && (
                            <div className="flex items-center gap-1">
                              <BookOpen className="w-3 h-3" />
                              <span>{node.resources.length} resources</span>
                            </div>
                          )}
                        </div>

                        {!node.isLocked && !node.isCompleted && (
                          <button className="mt-3 w-full py-2 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-lg text-sm font-medium hover:shadow-md transition-all">
                            Start Now
                          </button>
                        )}

                        {node.isLocked && (
                          <p className="mt-2 text-xs text-gray-500 italic">
                            🔒 Complete previous steps to unlock
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* Completion Badge */}
                <div className="relative mb-0">
                  <div className="absolute -left-6 w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-orange-600 flex items-center justify-center shadow-lg">
                    <Trophy className="w-4 h-4 text-white" />
                  </div>
                  <div className="ml-6 p-6 rounded-xl border-2 border-yellow-300 dark:border-yellow-700 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 text-center">
                    <Trophy className="w-12 h-12 text-yellow-600 dark:text-yellow-400 mx-auto mb-3" />
                    <h4 className="text-lg font-bold text-foreground mb-2">Roadmap Complete!</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Finish all steps to earn certificate & rewards
                    </p>
                    <div className="flex items-center justify-center gap-4 text-sm">
                      <span className="flex items-center gap-1 text-yellow-600">
                        <Star className="w-4 h-4" />
                        Certificate
                      </span>
                      <span className="flex items-center gap-1 text-orange-600">
                        <Zap className="w-4 h-4" />
                        Bonus XP
                      </span>
                      <span className="flex items-center gap-1 text-purple-600">
                        <Award className="w-4 h-4" />
                        Badge
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* AI Generate Modal */}
        {showGenerateModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-popover rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-border">
              {/* Modal Header */}
              <div className="sticky top-0 bg-gradient-to-r from-green-600 to-teal-600 p-6 text-white rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">AI Roadmap Generator</h3>
                      <p className="text-sm text-green-100">Personalized learning path in seconds</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowGenerateModal(false)}
                    className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <form onSubmit={handleGenerateRoadmap} className="p-6 space-y-6">
                {/* Goal Input */}
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    🎯 Your Learning Goal
                  </label>
                  <input
                    type="text"
                    value={goal}
                    onChange={(e) => setGoal(e.target.value)}
                    placeholder="e.g., Become a Full Stack Developer"
                    className="w-full px-4 py-3 border-2 border-input rounded-xl focus:border-primary focus:outline-none transition-colors bg-background text-foreground"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Be specific about what you want to achieve
                  </p>
                </div>

                {/* Current Level */}
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    📚 Current Level
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {['beginner', 'intermediate', 'advanced'].map((level) => (
                      <button
                        key={level}
                        type="button"
                        onClick={() => setCurrentLevel(level)}
                        className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${currentLevel === level
                          ? 'bg-gradient-to-r from-green-600 to-teal-600 text-white shadow-md'
                          : 'bg-muted text-foreground hover:bg-accent'
                          }`}
                      >
                        {level.charAt(0).toUpperCase() + level.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Time Commitment */}
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    ⏰ Weekly Time Commitment
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="5"
                      max="40"
                      step="5"
                      value={timeCommitment}
                      onChange={(e) => setTimeCommitment(Number(e.target.value))}
                      className="flex-1"
                    />
                    <span className="px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg font-bold min-w-[80px] text-center">
                      {timeCommitment}h/week
                    </span>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={generating}
                  className="w-full py-4 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-xl font-bold hover:shadow-lg hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                >
                  {generating ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      Generate My Roadmap
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
