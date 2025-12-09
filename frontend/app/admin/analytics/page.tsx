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
      <div className="min-h-screen bg-page-gradient flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const userStats = stats.users || {};
  const contentStats = stats.content || {};
  const engagementStats = stats.engagement || {};

  return (
    <div className="min-h-screen bg-page-gradient">
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
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Platform Analytics</h1>
                <p className="text-muted-foreground text-sm">Comprehensive system insights and metrics</p>
              </div>
            </div>

            {/* Time Range Filter */}
            <div className="flex gap-2">
              {(['7d', '30d', '90d'] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${timeRange === range
                      ? 'bg-gradient-to-r from-green-600 to-teal-600 text-white shadow-md'
                      : 'bg-card text-muted-foreground hover:bg-accent border border-border/50'
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
          <Card className="border-2 border-green-100 dark:border-green-900/30 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" />
                </div>
                {userStats.new > 0 && (
                  <div className="flex items-center gap-1 text-green-600 dark:text-green-400 text-sm">
                    <ArrowUp className="w-4 h-4" />
                    <span>+{userStats.new}</span>
                  </div>
                )}
              </div>
              <p className="text-2xl font-bold text-foreground">{userStats.total || 0}</p>
              <p className="text-sm text-muted-foreground">Total Users</p>
              <div className="flex gap-2 mt-2">
                <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded">
                  {userStats.byRole?.learner || 0} Learners
                </span>
                <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded">
                  {userStats.byRole?.instructor || 0} Instructors
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Total Content */}
          <Card className="border-2 border-green-100 dark:border-green-900/30 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
              </div>
              <p className="text-2xl font-bold text-foreground">
                {(contentStats.lessons || 0) + (contentStats.quizzes || 0) + (contentStats.courses || 0)}
              </p>
              <p className="text-sm text-muted-foreground">Total Content</p>
              <div className="flex gap-2 mt-2">
                <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded">
                  {contentStats.lessons || 0} Lessons
                </span>
                <span className="text-xs px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded">
                  {contentStats.courses || 0} Courses
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Engagement Rate */}
          <Card className="border-2 border-green-100 dark:border-green-900/30 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Activity className="w-5 h-5 text-white" />
                </div>
              </div>
              <p className="text-2xl font-bold text-foreground">
                {userStats.total > 0 ? Math.round((userStats.active / userStats.total) * 100) : 0}%
              </p>
              <p className="text-sm text-muted-foreground">Active Users</p>
              <div className="mt-2">
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-purple-600 transition-all"
                    style={{ width: `${userStats.total > 0 ? (userStats.active / userStats.total) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Completion Rate */}
          <Card className="border-2 border-green-100 dark:border-green-900/30 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
              </div>
              <p className="text-2xl font-bold text-foreground">
                {engagementStats.averageCompletionRate || 0}%
              </p>
              <p className="text-sm text-muted-foreground">Avg Completion</p>
              <div className="mt-2">
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
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
          <Card className="border-2 border-border/50 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                User Growth & Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">New Users (Last 30 Days)</span>
                    <span className="text-2xl font-bold text-green-600 dark:text-green-400">+{userStats.new || 0}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Growth rate: {userStats.total > 0 ? Math.round((userStats.new / userStats.total) * 100) : 0}%
                  </p>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Learners</span>
                      <span className="font-medium">{userStats.byRole?.learner || 0}</span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-600 transition-all"
                        style={{ width: `${userStats.total > 0 ? (userStats.byRole?.learner / userStats.total) * 100 : 0}%` }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Instructors</span>
                      <span className="font-medium">{userStats.byRole?.instructor || 0}</span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600 transition-all"
                        style={{ width: `${userStats.total > 0 ? (userStats.byRole?.instructor / userStats.total) * 100 : 0}%` }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Admins</span>
                      <span className="font-medium">{userStats.byRole?.admin || 0}</span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
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
          <Card className="border-2 border-border/50 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                Content Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400 mb-2" />
                  <p className="text-2xl font-bold text-foreground">{contentStats.lessons || 0}</p>
                  <p className="text-xs text-muted-foreground">Total Lessons</p>
                </div>
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <FileText className="w-6 h-6 text-green-600 dark:text-green-400 mb-2" />
                  <p className="text-2xl font-bold text-foreground">{contentStats.quizzes || 0}</p>
                  <p className="text-xs text-muted-foreground">Total Quizzes</p>
                </div>
                <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                  <GraduationCap className="w-6 h-6 text-purple-600 dark:text-purple-400 mb-2" />
                  <p className="text-2xl font-bold text-foreground">{contentStats.courses || 0}</p>
                  <p className="text-xs text-muted-foreground">Total Courses</p>
                </div>
                <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                  <Target className="w-6 h-6 text-orange-600 dark:text-orange-400 mb-2" />
                  <p className="text-2xl font-bold text-foreground">{contentStats.flashcards || 0}</p>
                  <p className="text-xs text-muted-foreground">Flashcards</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Engagement Metrics */}
        <Card className="border-2 border-border/50 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="w-5 h-5 text-green-600 dark:text-green-400" />
              Platform Engagement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl border border-blue-200 dark:border-blue-800">
                <CheckCircle className="w-8 h-8 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-foreground">{engagementStats.totalLessonCompletions || 0}</p>
                <p className="text-xs text-muted-foreground">Lesson Completions</p>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl border border-green-200 dark:border-green-800">
                <FileText className="w-8 h-8 text-green-600 dark:text-green-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-foreground">{engagementStats.totalQuizAttempts || 0}</p>
                <p className="text-xs text-muted-foreground">Quiz Attempts</p>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl border border-purple-200 dark:border-purple-800">
                <Award className="w-8 h-8 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-foreground">{engagementStats.totalCertificates || 0}</p>
                <p className="text-xs text-muted-foreground">Certificates</p>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-xl border border-orange-200 dark:border-orange-800">
                <Users className="w-8 h-8 text-orange-600 dark:text-orange-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-foreground">{userStats.active || 0}</p>
                <p className="text-xs text-muted-foreground">Active Users</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
