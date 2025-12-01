'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
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
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-indigo-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <Link href="/dashboard">
                <Button variant="ghost" size="sm" className="mb-2">
                  ← Back to Dashboard
                </Button>
              </Link>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                <Map className="w-8 h-8 text-cyan-600" />
                Learning Roadmaps
              </h1>
              <p className="text-gray-600 mt-1">Follow structured paths to achieve your goals</p>
            </div>
            {activeView === 'detail' && (
              <Button variant="outline" onClick={() => setActiveView('list')}>
                View All Roadmaps
              </Button>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
          </div>
        ) : activeView === 'list' ? (
          <>
            {/* Roadmaps List */}
            {roadmaps.length === 0 ? (
              <Card className="p-12 text-center">
                <Map className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No roadmaps available</h3>
                <p className="text-gray-600">Check back later for new learning paths!</p>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {roadmaps.map((roadmap) => {
                  const progress = roadmap.totalNodes > 0
                    ? (roadmap.completedNodes / roadmap.totalNodes) * 100
                    : 0;

                  return (
                    <Card
                      key={roadmap._id}
                      className="hover:shadow-xl transition-all hover:-translate-y-1 cursor-pointer"
                      onClick={() => loadRoadmapDetails(roadmap._id)}
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between mb-2">
                          <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                            roadmap.difficulty === 'beginner' ? 'bg-green-100 text-green-700' :
                            roadmap.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {roadmap.difficulty}
                          </div>
                          <span className="px-2 py-1 bg-cyan-100 text-cyan-700 text-xs font-medium rounded">
                            {roadmap.category}
                          </span>
                        </div>
                        <CardTitle className="text-xl">{roadmap.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                          {roadmap.description}
                        </p>

                        <div className="space-y-3 mb-4">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Progress</span>
                            <span className="font-semibold text-cyan-600">
                              {roadmap.completedNodes} / {roadmap.totalNodes}
                            </span>
                          </div>
                          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-cyan-600 to-blue-600"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>{roadmap.estimatedDuration}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Target className="w-4 h-4" />
                            <span>{roadmap.totalNodes} nodes</span>
                          </div>
                        </div>

                        <Button className="w-full" variant={progress > 0 ? 'default' : 'outline'}>
                          {progress > 0 ? (
                            <>
                              <ChevronRight className="w-4 h-4 mr-2" />
                              Continue
                            </>
                          ) : (
                            <>
                              <Map className="w-4 h-4 mr-2" />
                              Start Journey
                            </>
                          )}
                        </Button>
                      </CardContent>
                    </Card>
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
