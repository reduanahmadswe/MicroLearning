'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  BarChart3,
  Users,
  BookOpen,
  TrendingUp,
  Activity,
  Award,
  Clock,
  Target,
  Zap,
  ChevronLeft,
  FileText,
  Trophy,
  GraduationCap,
  CheckCircle,
  AlertCircle,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { adminAPI, analyticsAPI } from '@/services/api.service';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';

export default function AdminAnalyticsPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [stats, setStats] = useState<any>({});
  const [systemAnalytics, setSystemAnalytics] = useState<any>({});

  useEffect(() => {
    if (user?.role !== 'admin') {
      router.push('/dashboard');
      return;
    }
    loadAnalytics();
  }, [user, timeRange]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const [dashboardResponse, systemResponse] = await Promise.all([
        adminAPI.getStats(),
        analyticsAPI.getSystemAnalytics().catch(() => ({ data: { data: {} } })),
      ]);
      
      setStats(dashboardResponse.data.data || {});
      setSystemAnalytics(systemResponse.data.data || {});
    } catch (error: any) {
      toast.error('Failed to load analytics');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-teal-50 to-emerald-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  const userStats = stats.users || {};
  const contentStats = stats.content || {};
  const engagementStats = stats.engagement || {};

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-teal-50 to-emerald-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Header */}
        <div className="mb-6">
          <Link href="/admin" className="inline-flex items-center text-green-600 hover:text-green-700 mb-4">
            <ChevronLeft className="w-5 h-5 mr-1" />
            Back to Admin Dashboard
          </Link>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-green-600 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg">
                <BarChart3 className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Platform Analytics</h1>
                <p className="text-gray-600 text-sm">Comprehensive system insights and metrics</p>
              </div>
            </div>

            {/* Time Range Filter */}
            <div className="flex gap-2">
              {(['7d', '30d', '90d'] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                    timeRange === range
                      ? 'bg-gradient-to-r from-green-600 to-teal-600 text-white shadow-md'
                      : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                  }`}
                >
                  {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : '90 Days'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Total Users */}
          <Card className="border-2 border-green-100 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" />
                </div>
                {userStats.new > 0 && (
                  <div className="flex items-center gap-1 text-green-600 text-sm">
                    <ArrowUp className="w-4 h-4" />
                    <span>+{userStats.new}</span>
                  </div>
                )}
              </div>
              <p className="text-2xl font-bold text-gray-900">{userStats.total || 0}</p>
              <p className="text-sm text-gray-600">Total Users</p>
              <div className="flex gap-2 mt-2">
                <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">
                  {userStats.byRole?.learner || 0} Learners
                </span>
                <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                  {userStats.byRole?.instructor || 0} Instructors
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Total Content */}
          <Card className="border-2 border-green-100 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {(contentStats.lessons || 0) + (contentStats.quizzes || 0) + (contentStats.courses || 0)}
              </p>
              <p className="text-sm text-gray-600">Total Content</p>
              <div className="flex gap-2 mt-2">
                <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                  {contentStats.lessons || 0} Lessons
                </span>
                <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded">
                  {contentStats.courses || 0} Courses
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Engagement Rate */}
          <Card className="border-2 border-green-100 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Activity className="w-5 h-5 text-white" />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {userStats.total > 0 ? Math.round((userStats.active / userStats.total) * 100) : 0}%
              </p>
              <p className="text-sm text-gray-600">Active Users</p>
              <div className="mt-2">
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-500 to-purple-600 transition-all"
                    style={{ width: `${userStats.total > 0 ? (userStats.active / userStats.total) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Completion Rate */}
          <Card className="border-2 border-green-100 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {engagementStats.averageCompletionRate || 0}%
              </p>
              <p className="text-sm text-gray-600">Avg Completion</p>
              <div className="mt-2">
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-orange-500 to-orange-600 transition-all"
                    style={{ width: `${engagementStats.averageCompletionRate || 0}%` }}
                  ></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* User Growth */}
          <Card className="border-2 border-green-100 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                User Growth & Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">New Users (Last 30 Days)</span>
                    <span className="text-2xl font-bold text-green-600">+{userStats.new || 0}</span>
                  </div>
                  <p className="text-xs text-gray-500">
                    Growth rate: {userStats.total > 0 ? Math.round((userStats.new / userStats.total) * 100) : 0}%
                  </p>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Learners</span>
                      <span className="font-medium">{userStats.byRole?.learner || 0}</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-green-600 transition-all"
                        style={{ width: `${userStats.total > 0 ? (userStats.byRole?.learner / userStats.total) * 100 : 0}%` }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Instructors</span>
                      <span className="font-medium">{userStats.byRole?.instructor || 0}</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-600 transition-all"
                        style={{ width: `${userStats.total > 0 ? (userStats.byRole?.instructor / userStats.total) * 100 : 0}%` }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Admins</span>
                      <span className="font-medium">{userStats.byRole?.admin || 0}</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-purple-600 transition-all"
                        style={{ width: `${userStats.total > 0 ? (userStats.byRole?.admin / userStats.total) * 100 : 0}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Content Stats */}
          <Card className="border-2 border-green-100 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-600" />
                Content Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <BookOpen className="w-6 h-6 text-blue-600 mb-2" />
                  <p className="text-2xl font-bold text-gray-900">{contentStats.lessons || 0}</p>
                  <p className="text-xs text-gray-600">Total Lessons</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <FileText className="w-6 h-6 text-green-600 mb-2" />
                  <p className="text-2xl font-bold text-gray-900">{contentStats.quizzes || 0}</p>
                  <p className="text-xs text-gray-600">Total Quizzes</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <GraduationCap className="w-6 h-6 text-purple-600 mb-2" />
                  <p className="text-2xl font-bold text-gray-900">{contentStats.courses || 0}</p>
                  <p className="text-xs text-gray-600">Total Courses</p>
                </div>
                <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <Target className="w-6 h-6 text-orange-600 mb-2" />
                  <p className="text-2xl font-bold text-gray-900">{contentStats.flashcards || 0}</p>
                  <p className="text-xs text-gray-600">Flashcards</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Engagement Metrics */}
        <Card className="border-2 border-green-100 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="w-5 h-5 text-green-600" />
              Platform Engagement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                <CheckCircle className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">{engagementStats.totalLessonCompletions || 0}</p>
                <p className="text-xs text-gray-600">Lesson Completions</p>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200">
                <FileText className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">{engagementStats.totalQuizAttempts || 0}</p>
                <p className="text-xs text-gray-600">Quiz Attempts</p>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200">
                <Award className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">{engagementStats.totalCertificates || 0}</p>
                <p className="text-xs text-gray-600">Certificates</p>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl border border-orange-200">
                <Users className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">{userStats.active || 0}</p>
                <p className="text-xs text-gray-600">Active Users</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
