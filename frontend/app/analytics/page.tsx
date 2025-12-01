'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  BarChart3,
  TrendingUp,
  Clock,
  Target,
  Award,
  BookOpen,
  Zap,
  Calendar,
  Activity,
  PieChart,
  LineChart,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { analyticsAPI } from '@/services/api.service';
import { toast } from 'sonner';

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');
  const [analytics, setAnalytics] = useState<any>({
    overview: {},
    learningActivity: [],
    performance: {},
    topTopics: [],
    studyTime: [],
    achievements: {},
  });

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const response = await analyticsAPI.getAnalytics({ timeRange });
      setAnalytics(response.data.data || {});
    } catch (error: any) {
      toast.error('Failed to load analytics');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const overview = analytics.overview || {};
  const performance = analytics.performance || {};
  const topTopics = analytics.topTopics || [];
  const studyTime = analytics.studyTime || [];
  const achievements = analytics.achievements || {};

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
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
                <BarChart3 className="w-8 h-8 text-purple-600" />
                Learning Analytics
              </h1>
              <p className="text-gray-600 mt-1">Track your progress and insights</p>
            </div>
          </div>

          {/* Time Range Selector */}
          <div className="flex gap-2 mt-6">
            <Button
              variant={timeRange === '7d' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeRange('7d')}
            >
              Last 7 Days
            </Button>
            <Button
              variant={timeRange === '30d' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeRange('30d')}
            >
              Last 30 Days
            </Button>
            <Button
              variant={timeRange === '90d' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeRange('90d')}
            >
              Last 90 Days
            </Button>
            <Button
              variant={timeRange === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeRange('all')}
            >
              All Time
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Overview Cards */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-gradient-to-br from-blue-600 to-blue-700 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <BookOpen className="w-8 h-8 opacity-80" />
                    <TrendingUp className="w-5 h-5 opacity-60" />
                  </div>
                  <h3 className="text-white/80 text-sm font-medium mb-2">Lessons Completed</h3>
                  <p className="text-4xl font-bold">{overview.lessonsCompleted || 0}</p>
                  <p className="text-white/70 text-sm mt-2">
                    +{overview.lessonsGrowth || 0}% from last period
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-600 to-green-700 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Target className="w-8 h-8 opacity-80" />
                    <TrendingUp className="w-5 h-5 opacity-60" />
                  </div>
                  <h3 className="text-white/80 text-sm font-medium mb-2">Quizzes Taken</h3>
                  <p className="text-4xl font-bold">{overview.quizzesTaken || 0}</p>
                  <p className="text-white/70 text-sm mt-2">
                    {overview.averageScore || 0}% avg score
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-600 to-purple-700 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Clock className="w-8 h-8 opacity-80" />
                    <Activity className="w-5 h-5 opacity-60" />
                  </div>
                  <h3 className="text-white/80 text-sm font-medium mb-2">Study Time</h3>
                  <p className="text-4xl font-bold">{overview.totalStudyHours || 0}h</p>
                  <p className="text-white/70 text-sm mt-2">
                    {overview.avgDailyHours || 0}h daily average
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-600 to-orange-700 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Award className="w-8 h-8 opacity-80" />
                    <Zap className="w-5 h-5 opacity-60" />
                  </div>
                  <h3 className="text-white/80 text-sm font-medium mb-2">Total XP</h3>
                  <p className="text-4xl font-bold">{overview.totalXP || 0}</p>
                  <p className="text-white/70 text-sm mt-2">
                    Level {overview.currentLevel || 1}
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              {/* Study Time Chart */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <LineChart className="w-5 h-5 text-purple-600" />
                    Study Time Trend
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-end justify-between gap-2">
                    {studyTime.length > 0 ? (
                      studyTime.map((day: any, index: number) => {
                        const maxHours = Math.max(...studyTime.map((d: any) => d.hours));
                        const height = (day.hours / maxHours) * 100;
                        return (
                          <div key={index} className="flex-1 flex flex-col items-center gap-2">
                            <div
                              className="w-full bg-gradient-to-t from-purple-600 to-purple-400 rounded-t-lg relative group cursor-pointer hover:from-purple-700 hover:to-purple-500 transition-colors"
                              style={{ height: `${height}%`, minHeight: '4px' }}
                            >
                              <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                {day.hours}h
                              </div>
                            </div>
                            <span className="text-xs text-gray-600 transform rotate-45 origin-top-left mt-2">
                              {day.date}
                            </span>
                          </div>
                        );
                      })
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        No study time data available
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Top Topics */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="w-5 h-5 text-blue-600" />
                    Top Topics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {topTopics.length > 0 ? (
                      topTopics.map((topic: any, index: number) => {
                        const colors = [
                          'from-blue-500 to-blue-600',
                          'from-green-500 to-green-600',
                          'from-purple-500 to-purple-600',
                          'from-orange-500 to-orange-600',
                          'from-pink-500 to-pink-600',
                        ];
                        const color = colors[index % colors.length];
                        return (
                          <div key={index}>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-gray-700">{topic.name}</span>
                              <span className="text-sm text-gray-600">{topic.count} lessons</span>
                            </div>
                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className={`h-full bg-gradient-to-r ${color}`}
                                style={{ width: `${topic.percentage}%` }}
                              />
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-center py-8 text-gray-400">
                        No topic data available
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Performance Metrics */}
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-green-600" />
                    Performance Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Quiz Average</p>
                        <p className="text-2xl font-bold text-green-600">
                          {performance.quizAverage || 0}%
                        </p>
                      </div>
                      <div className="w-16 h-16 relative">
                        <svg className="w-full h-full transform -rotate-90">
                          <circle
                            cx="32"
                            cy="32"
                            r="28"
                            stroke="#e5e7eb"
                            strokeWidth="6"
                            fill="none"
                          />
                          <circle
                            cx="32"
                            cy="32"
                            r="28"
                            stroke="#10b981"
                            strokeWidth="6"
                            fill="none"
                            strokeDasharray={`${2 * Math.PI * 28}`}
                            strokeDashoffset={`${
                              2 * Math.PI * 28 * (1 - (performance.quizAverage || 0) / 100)
                            }`}
                            strokeLinecap="round"
                          />
                        </svg>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <p className="text-sm text-gray-600 mb-1">Completion Rate</p>
                        <p className="text-xl font-bold text-blue-600">
                          {performance.completionRate || 0}%
                        </p>
                      </div>
                      <div className="p-4 bg-purple-50 rounded-lg">
                        <p className="text-sm text-gray-600 mb-1">Accuracy</p>
                        <p className="text-xl font-bold text-purple-600">
                          {performance.accuracy || 0}%
                        </p>
                      </div>
                    </div>

                    <div className="p-4 bg-orange-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-gray-600">Current Streak</p>
                        <span className="text-2xl">🔥</span>
                      </div>
                      <p className="text-3xl font-bold text-orange-600">
                        {performance.currentStreak || 0} days
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Best: {performance.longestStreak || 0} days
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-yellow-600" />
                    Achievements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg">
                        <Award className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-gray-900">
                          {achievements.badges || 0}
                        </p>
                        <p className="text-xs text-gray-600">Badges</p>
                      </div>
                      <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg">
                        <Target className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-gray-900">
                          {achievements.challenges || 0}
                        </p>
                        <p className="text-xs text-gray-600">Challenges</p>
                      </div>
                      <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg">
                        <Zap className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-gray-900">
                          {achievements.certificates || 0}
                        </p>
                        <p className="text-xs text-gray-600">Certificates</p>
                      </div>
                    </div>

                    <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-gray-900">Level Progress</h4>
                        <span className="text-sm text-indigo-600 font-medium">
                          Level {overview.currentLevel || 1}
                        </span>
                      </div>
                      <div className="mb-2">
                        <div className="h-3 bg-white rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-indigo-600 to-purple-600"
                            style={{
                              width: `${
                                ((overview.currentXP || 0) / (overview.nextLevelXP || 100)) * 100
                              }%`,
                            }}
                          />
                        </div>
                      </div>
                      <div className="flex justify-between text-xs text-gray-600">
                        <span>{overview.currentXP || 0} XP</span>
                        <span>{overview.nextLevelXP || 0} XP to next level</span>
                      </div>
                    </div>

                    <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-3">Recent Milestones</h4>
                      <div className="space-y-2">
                        {achievements.recentMilestones?.slice(0, 3).map((milestone: any, index: number) => (
                          <div key={index} className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white">
                              ✓
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">{milestone.title}</p>
                              <p className="text-xs text-gray-600">{milestone.date}</p>
                            </div>
                          </div>
                        )) || (
                          <p className="text-sm text-gray-500 text-center py-4">
                            No recent milestones
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Learning Activity Heatmap */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-green-600" />
                  Learning Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-2">
                  {Array.from({ length: 91 }).map((_, index) => {
                    const intensity = Math.floor(Math.random() * 5);
                    const colors = [
                      'bg-gray-100',
                      'bg-green-100',
                      'bg-green-300',
                      'bg-green-500',
                      'bg-green-700',
                    ];
                    return (
                      <div
                        key={index}
                        className={`aspect-square rounded ${colors[intensity]} hover:ring-2 hover:ring-green-500 cursor-pointer transition-all`}
                        title={`Day ${index + 1}`}
                      />
                    );
                  })}
                </div>
                <div className="flex items-center justify-end gap-2 mt-4 text-xs text-gray-600">
                  <span>Less</span>
                  <div className="flex gap-1">
                    <div className="w-3 h-3 bg-gray-100 rounded"></div>
                    <div className="w-3 h-3 bg-green-100 rounded"></div>
                    <div className="w-3 h-3 bg-green-300 rounded"></div>
                    <div className="w-3 h-3 bg-green-500 rounded"></div>
                    <div className="w-3 h-3 bg-green-700 rounded"></div>
                  </div>
                  <span>More</span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
