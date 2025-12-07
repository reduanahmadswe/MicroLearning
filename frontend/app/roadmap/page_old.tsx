'use client';

import { useEffect, useState } from 'react';
import {
  Map,
  Target,
  CheckCircle,
  Lock,
  Star,
  TrendingUp,
  Award,
  BookOpen,
  Flag,
  ChevronRight,
  Zap,
  Clock,
  Sparkles,
  Plus,
  ArrowLeft,
  Trophy,
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
  const [activeView, setActiveView] = useState<'list' | 'detail'>('list');
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [goal, setGoal] = useState('');
  const [currentLevel, setCurrentLevel] = useState('beginner');
  const [timeCommitment, setTimeCommitment] = useState('10');

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
        timeframe: `${timeCommitment} hours/week`,
      });
      toast.success('🎉 Roadmap generated successfully!');
      setShowGenerateModal(false);
      setGoal('');
      loadRoadmaps();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to generate roadmap');
    } finally {
      setGenerating(false);
    }
  };

  const loadRoadmapDetails = async (roadmapId: string) => {
    try {
      const response = await roadmapAPI.getRoadmap(roadmapId);
      setSelectedRoadmap(response.data.data);
      setActiveView('detail');
    } catch (error: any) {
      toast.error('Failed to load roadmap details');
    }
  };

  const handleEnrollRoadmap = async (roadmapId: string) => {
    try {
      await roadmapAPI.enrollRoadmap(roadmapId);
      toast.success('Enrolled in roadmap!');
      loadRoadmaps();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to enroll');
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
    if (node.isCompleted) return 'from-green-500 to-green-600';
    if (node.isLocked) return 'from-gray-300 to-gray-400';
    return 'from-blue-500 to-purple-600';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-green-50/30 to-teal-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-green-600 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Map className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
                  Learning Roadmaps
                </h1>
                <p className="text-sm sm:text-base text-gray-600 mt-1">
                  Follow structured paths to achieve your goals
                </p>
              </div>
            </div>
            
            <div className="flex gap-2 sm:gap-3">
              {activeView === 'detail' && (
                <button
                  onClick={() => setActiveView('list')}
                  className="px-4 py-2 bg-white border-2 border-gray-200 rounded-xl hover:border-green-300 hover:bg-green-50 transition-all flex items-center gap-2 text-sm font-medium"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">All Roadmaps</span>
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
            <div className="relative">
              <div className="w-12 h-12 border-4 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
            </div>
          </div>
        ) : activeView === 'list' ? (
          <>
            {/* Roadmaps List */}
            {roadmaps.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-100 p-12 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-teal-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Map className="w-10 h-10 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No roadmaps yet</h3>
                <p className="text-gray-600 mb-6">Generate your first AI-powered learning roadmap!</p>
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
                  const progress = roadmap.totalNodes > 0
                    ? (roadmap.completedNodes / roadmap.totalNodes) * 100
                    : 0;

                  return (
                    <div
                      key={roadmap._id}
                      onClick={() => loadRoadmapDetails(roadmap._id)}
                      className="bg-white rounded-2xl shadow-xl border-2 border-gray-100 hover:border-green-300 hover:shadow-2xl transition-all cursor-pointer group"
                    >
                      {/* Header */}
                      <div className="p-5 sm:p-6 border-b border-gray-100">
                        <div className="flex items-start justify-between mb-3">
                          <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                            roadmap.difficulty === 'beginner' ? 'bg-green-100 text-green-700' :
                            roadmap.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {roadmap.difficulty}
                          </span>
                          <span className="px-3 py-1 bg-gradient-to-r from-green-100 to-teal-100 text-green-700 text-xs font-semibold rounded-lg">
                            {roadmap.category}
                          </span>
                        </div>
                        <h3 className="text-lg sm:text-xl font-bold text-gray-900 group-hover:text-green-600 transition-colors">
                          {roadmap.title}
                        </h3>
                        <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                          {roadmap.description}
                        </p>
                      </div>

                      {/* Progress */}
                      <div className="p-5 sm:p-6 space-y-4">
                        <div>
                          <div className="flex items-center justify-between text-sm mb-2">
                            <span className="text-gray-600 font-medium">Progress</span>
                            <span className="font-bold text-green-600">
                              {roadmap.completedNodes} / {roadmap.totalNodes}
                            </span>
                          </div>
                          <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-green-600 to-teal-600 transition-all duration-500"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                          <p className="text-xs text-green-600 font-semibold mt-1.5">
                            {Math.round(progress)}% Complete
                          </p>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-2 gap-3">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                              <Clock className="w-4 h-4 text-blue-600" />
                            </div>
                            <span className="font-medium">{roadmap.estimatedDuration}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                              <Target className="w-4 h-4 text-purple-600" />
                            </div>
                            <span className="font-medium">{roadmap.totalNodes} nodes</span>
                          </div>
                        </div>

                        {/* Action Button */}
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
            )}
          </>
        ) : selectedRoadmap ? (
          <>
            {/* Roadmap Detail View */}
            <div className="grid lg:grid-cols-4 gap-6">
              {/* Sidebar */}
              <div className="space-y-6">
                <Card className="bg-gradient-to-br from-cyan-600 to-blue-600 text-white">
                  <CardContent className="p-6">
                    <h3 className="text-white/90 text-sm font-medium mb-2">Progress</h3>
                    <p className="text-4xl font-bold mb-4">
                      {selectedRoadmap.totalNodes > 0
                        ? Math.round((selectedRoadmap.completedNodes / selectedRoadmap.totalNodes) * 100)
                        : 0}%
                    </p>
                    <div className="h-2 bg-white/20 rounded-full overflow-hidden mb-3">
                      <div
                        className="h-full bg-white"
                        style={{
                          width: `${
                            selectedRoadmap.totalNodes > 0
                              ? (selectedRoadmap.completedNodes / selectedRoadmap.totalNodes) * 100
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                    <p className="text-white/80 text-sm">
                      {selectedRoadmap.completedNodes} of {selectedRoadmap.totalNodes} completed
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Roadmap Info</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-blue-600" />
                        <span className="text-sm font-medium text-gray-700">Duration</span>
                      </div>
                      <span className="text-sm font-bold text-blue-600">
                        {selectedRoadmap.estimatedDuration}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Target className="w-5 h-5 text-green-600" />
                        <span className="text-sm font-medium text-gray-700">Nodes</span>
                      </div>
                      <span className="text-sm font-bold text-green-600">
                        {selectedRoadmap.totalNodes}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Award className="w-5 h-5 text-purple-600" />
                        <span className="text-sm font-medium text-gray-700">Level</span>
                      </div>
                      <span className="text-sm font-bold text-purple-600">
                        {selectedRoadmap.difficulty}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Roadmap Path */}
              <div className="lg:col-span-3">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-2xl">{selectedRoadmap.title}</CardTitle>
                    <p className="text-gray-600 mt-2">{selectedRoadmap.description}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="relative">
                      {/* Vertical line */}
                      <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-cyan-200 via-blue-300 to-indigo-300"></div>

                      {/* Nodes */}
                      <div className="space-y-6">
                        {selectedRoadmap.nodes?.map((node, index) => {
                          const Icon = getNodeIcon(node.type);
                          const colorClass = getNodeColor(node);

                          return (
                            <div key={node._id} className="relative flex gap-6 items-start">
                              {/* Node icon */}
                              <div
                                className={`relative z-10 w-12 h-12 rounded-full bg-gradient-to-br ${colorClass} flex items-center justify-center text-white shadow-lg`}
                              >
                                {node.isCompleted ? (
                                  <CheckCircle className="w-6 h-6" />
                                ) : node.isLocked ? (
                                  <Lock className="w-6 h-6" />
                                ) : (
                                  <Icon className="w-6 h-6" />
                                )}
                              </div>

                              {/* Node content */}
                              <div className="flex-1 pb-6">
                                <Card
                                  className={`transition-all ${
                                    node.isLocked
                                      ? 'opacity-60'
                                      : 'hover:shadow-lg hover:-translate-y-1 cursor-pointer'
                                  } ${node.isCompleted ? 'border-green-300 bg-green-50' : ''}`}
                                >
                                  <CardContent className="p-4">
                                    <div className="flex items-start justify-between mb-2">
                                      <div>
                                        <div className="flex items-center gap-2 mb-1">
                                          <h3 className="font-bold text-gray-900">{node.title}</h3>
                                          {node.isCompleted && (
                                            <span className="px-2 py-0.5 bg-green-600 text-white text-xs rounded">
                                              ✓ Completed
                                            </span>
                                          )}
                                        </div>
                                        <p className="text-xs text-gray-500 mb-2">
                                          {node.type.toUpperCase()} • Level {node.level}
                                        </p>
                                      </div>
                                      <div className="flex items-center gap-1 text-orange-600">
                                        <Zap className="w-4 h-4" />
                                        <span className="text-sm font-bold">+{node.xpReward}</span>
                                      </div>
                                    </div>

                                    <p className="text-sm text-gray-600 mb-3">{node.description}</p>

                                    <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
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
                                      <Button size="sm" className="w-full">
                                        <ChevronRight className="w-4 h-4 mr-1" />
                                        Start
                                      </Button>
                                    )}

                                    {node.isLocked && (
                                      <p className="text-xs text-gray-500 italic">
                                        Complete previous steps to unlock
                                      </p>
                                    )}
                                  </CardContent>
                                </Card>
                              </div>
                            </div>
                          );
                        })}

                        {/* Completion milestone */}
                        <div className="relative flex gap-6 items-start">
                          <div className="relative z-10 w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-orange-600 flex items-center justify-center text-white shadow-lg">
                            <Award className="w-6 h-6" />
                          </div>
                          <div className="flex-1">
                            <Card className="border-2 border-yellow-300 bg-gradient-to-br from-yellow-50 to-orange-50">
                              <CardContent className="p-6 text-center">
                                <Award className="w-12 h-12 text-yellow-600 mx-auto mb-3" />
                                <h3 className="text-xl font-bold text-gray-900 mb-2">
                                  Roadmap Complete!
                                </h3>
                                <p className="text-gray-600 mb-4">
                                  Finish all steps to earn your certificate and rewards
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
                              </CardContent>
                            </Card>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
