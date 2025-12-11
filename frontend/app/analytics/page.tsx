'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
  Trophy,
  Flame,
  CheckCircle2,
  Brain,
  Star,
  Medal,
  TrendingDown,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useAnalyticsStore } from '@/store/analyticsStore';
import { toast } from 'sonner';

export default function AnalyticsPage() {
  const router = useRouter();
  const { token } = useAuthStore();

  // Use analytics store
  const {
    analytics,
    timeRange,
    loading,
    error,
    setTimeRange,
    fetchAnalytics,
  } = useAnalyticsStore();

  useEffect(() => {
    if (!token) {
      router.push('/auth/login');
      return;
    }
    // Fetch analytics on mount
    fetchAnalytics();
  }, [token]);

  // Show error toast when error occurs
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  // Safe defaults to prevent undefined errors
  const overview = analytics.overview || {
    currentLevel: 1,
    totalXP: 0,
    totalStudyHours: 0,
    lessonsCompleted: 0,
    lessonsGrowth: 0,
    quizzesTaken: 0,
    averageScore: 0,
    avgDailyHours: 0,
    currentXP: 0,
    nextLevelXP: 100,
  };

  const performance = analytics.performance || {
    quizAverage: 0,
    completionRate: 0,
    accuracy: 0,
    currentStreak: 0,
    longestStreak: 0,
  };

  const topTopics = analytics.topTopics || [];
  const studyTime = analytics.studyTime || [];
  const achievements = analytics.achievements || {
    badges: 0,
    challenges: 0,
    certificates: 0,
    recentMilestones: [],
  };

  const handleRefresh = () => {
    fetchAnalytics(true); // Force refresh
    toast.success('Analytics refreshed');
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-page-gradient flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground font-medium">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-page-gradient">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center justify-between gap-3 sm:gap-4 mb-3">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-green-600 to-teal-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg">
                <BarChart3 className="w-7 h-7 sm:w-9 sm:h-9 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-green-600 via-teal-600 to-emerald-600 bg-clip-text text-transparent">
                  Learning Analytics
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">Track your progress and insights</p>
              </div>
            </div>

            {/* Refresh Button */}
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-card border border-border rounded-xl hover:bg-accent hover:border-primary/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
              title="Refresh analytics"
            >
              <RefreshCw className={`w-4 h-4 text-green-600 ${loading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
              <span className="hidden sm:inline text-sm font-medium text-foreground">Refresh</span>
            </button>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mb-4 p-4 bg-destructive/10 border border-destructive/20 rounded-xl flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-destructive">{error}</p>
                <button
                  onClick={handleRefresh}
                  className="text-xs text-destructive hover:underline mt-1"
                >
                  Try again
                </button>
              </div>
            </div>
          )}

          {/* Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-4">
            <div className="bg-card rounded-xl p-3 sm:p-4 border border-border/50 shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <Trophy className="w-4 h-4 text-green-600 dark:text-green-500" />
                <span className="text-[10px] sm:text-xs text-muted-foreground font-medium">Level</span>
              </div>
              <p className="text-lg sm:text-xl font-bold text-foreground">{overview.currentLevel || 1}</p>
            </div>
            <div className="bg-card rounded-xl p-3 sm:p-4 border border-border/50 shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <Zap className="w-4 h-4 text-purple-600 dark:text-purple-500" />
                <span className="text-[10px] sm:text-xs text-muted-foreground font-medium">Total XP</span>
              </div>
              <p className="text-lg sm:text-xl font-bold text-foreground">{overview.totalXP || 0}</p>
            </div>
            <div className="bg-card rounded-xl p-3 sm:p-4 border border-border/50 shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <Flame className="w-4 h-4 text-orange-600 dark:text-orange-500" />
                <span className="text-[10px] sm:text-xs text-muted-foreground font-medium">Streak</span>
              </div>
              <p className="text-lg sm:text-xl font-bold text-foreground">{performance.currentStreak || 0}d</p>
            </div>
            <div className="bg-card rounded-xl p-3 sm:p-4 border border-border/50 shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="w-4 h-4 text-blue-600 dark:text-blue-500" />
                <span className="text-[10px] sm:text-xs text-muted-foreground font-medium">Study Time</span>
              </div>
              <p className="text-lg sm:text-xl font-bold text-foreground">{overview.totalStudyHours || 0}h</p>
            </div>
          </div>
        </div>

        {/* Time Range Selector */}
        <div className="mb-6 overflow-x-auto scrollbar-hide pb-2">
          <div className="flex gap-2 min-w-max">
            <button
              onClick={() => setTimeRange('7d')}
              className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl font-semibold whitespace-nowrap text-sm transition-all ${timeRange === '7d'
                ? 'bg-gradient-to-r from-green-600 to-teal-600 text-white shadow-lg'
                : 'bg-card text-muted-foreground hover:bg-muted border border-border/50'
                }`}
            >
              Last 7 Days
            </button>
            <button
              onClick={() => setTimeRange('30d')}
              className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl font-semibold whitespace-nowrap text-sm transition-all ${timeRange === '30d'
                ? 'bg-gradient-to-r from-green-600 to-teal-600 text-white shadow-lg'
                : 'bg-card text-muted-foreground hover:bg-muted border border-border/50'
                }`}
            >
              Last 30 Days
            </button>
            <button
              onClick={() => setTimeRange('90d')}
              className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl font-semibold whitespace-nowrap text-sm transition-all ${timeRange === '90d'
                ? 'bg-gradient-to-r from-green-600 to-teal-600 text-white shadow-lg'
                : 'bg-card text-muted-foreground hover:bg-muted border border-border/50'
                }`}
            >
              Last 90 Days
            </button>
            <button
              onClick={() => setTimeRange('all')}
              className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl font-semibold whitespace-nowrap text-sm transition-all ${timeRange === 'all'
                ? 'bg-gradient-to-r from-green-600 to-teal-600 text-white shadow-lg'
                : 'bg-card text-muted-foreground hover:bg-muted border border-border/50'
                }`}
            >
              All Time
            </button>
          </div>
        </div>
        {/* Content */}
        <div className="space-y-6">
          {/* Overview Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl shadow-xl p-5 sm:p-6 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-white bg-opacity-20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    <BookOpen className="w-7 h-7" />
                  </div>
                  <div className={`flex items-center gap-1 text-sm ${(overview.lessonsGrowth || 0) >= 0 ? 'text-green-200' : 'text-red-200'}`}>
                    {(overview.lessonsGrowth || 0) >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                    <span>{Math.abs(overview.lessonsGrowth || 0)}%</span>
                  </div>
                </div>
                <p className="text-3xl sm:text-4xl font-bold mb-1">{overview.lessonsCompleted || 0}</p>
                <p className="text-sm text-white text-opacity-90">Lessons Completed</p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-600 to-teal-600 rounded-2xl shadow-xl p-5 sm:p-6 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-white bg-opacity-20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    <Target className="w-7 h-7" />
                  </div>
                  <div className="flex items-center gap-1 text-sm text-green-200">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{overview.averageScore || 0}%</span>
                  </div>
                </div>
                <p className="text-3xl sm:text-4xl font-bold mb-1">{overview.quizzesTaken || 0}</p>
                <p className="text-sm text-white text-opacity-90">Quizzes Taken</p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl shadow-xl p-5 sm:p-6 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-white bg-opacity-20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    <Clock className="w-7 h-7" />
                  </div>
                  <div className="flex items-center gap-1 text-sm text-purple-200">
                    <Activity className="w-4 h-4" />
                    <span>{overview.avgDailyHours || 0}h/day</span>
                  </div>
                </div>
                <p className="text-3xl sm:text-4xl font-bold mb-1">{overview.totalStudyHours || 0}h</p>
                <p className="text-sm text-white text-opacity-90">Total Study Time</p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-amber-600 to-orange-600 rounded-2xl shadow-xl p-5 sm:p-6 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-white bg-opacity-20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    <Zap className="w-7 h-7" />
                  </div>
                  <div className="flex items-center gap-1 text-sm text-amber-200">
                    <Trophy className="w-4 h-4" />
                    <span>Lvl {overview.currentLevel || 1}</span>
                  </div>
                </div>
                <p className="text-3xl sm:text-4xl font-bold mb-1">{overview.totalXP || 0}</p>
                <p className="text-sm text-white text-opacity-90">Experience Points</p>
              </div>
            </div>
          </div>

          {/* Study Time & Top Topics */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Study Time Chart */}
            <div className="lg:col-span-2 bg-card rounded-2xl shadow-xl border border-border/50 p-5 sm:p-6">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                  <LineChart className="w-5 h-5 text-green-600 dark:text-green-500" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground">Study Time Trend</h3>
                  <p className="text-xs text-muted-foreground">Daily study hours over time</p>
                </div>
              </div>

              <div className="h-56 sm:h-64 flex items-end justify-between gap-1 sm:gap-2 overflow-x-auto scrollbar-hide">
                {studyTime.length > 0 ? (
                  studyTime.map((day: any, index: number) => {
                    const maxHours = Math.max(...studyTime.map((d: any) => d.hours || 0), 1);
                    const height = Math.max(((day.hours || 0) / maxHours) * 100, 2);
                    return (
                      <div key={index} className="flex-1 min-w-[20px] flex flex-col items-center gap-2 group">
                        <div
                          className="w-full bg-gradient-to-t from-green-600 via-teal-500 to-emerald-400 rounded-t-lg relative cursor-pointer hover:from-green-700 hover:via-teal-600 hover:to-emerald-500 transition-all"
                          style={{ height: `${height}%` }}
                        >
                          <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-popover text-popover-foreground px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none shadow-md">
                            {day.hours || 0}h
                          </div>
                        </div>
                        <span className="text-[8px] sm:text-[10px] text-muted-foreground writing-mode-vertical transform rotate-0 mt-1 truncate">
                          {day.date}
                        </span>
                      </div>
                    );
                  })
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground">
                    <LineChart className="w-12 h-12 text-muted-foreground/50 mb-2" />
                    <p className="text-sm">No study time data available</p>
                  </div>
                )}
              </div>
            </div>

            {/* Top Topics */}
            <div className="bg-card rounded-2xl shadow-xl border border-border/50 p-5 sm:p-6">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                  <PieChart className="w-5 h-5 text-purple-600 dark:text-purple-500" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground">Top Topics</h3>
                  <p className="text-xs text-muted-foreground">Most studied subjects</p>
                </div>
              </div>

              <div className="space-y-4">
                {topTopics.length > 0 ? (
                  topTopics.slice(0, 5).map((topic: any, index: number) => {
                    const colors = [
                      { gradient: 'from-blue-500 to-cyan-500', bg: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-700 dark:text-blue-400' },
                      { gradient: 'from-green-500 to-teal-500', bg: 'bg-green-50 dark:bg-green-900/20', text: 'text-green-700 dark:text-green-400' },
                      { gradient: 'from-purple-500 to-indigo-500', bg: 'bg-purple-50 dark:bg-purple-900/20', text: 'text-purple-700 dark:text-purple-400' },
                      { gradient: 'from-amber-500 to-orange-500', bg: 'bg-amber-50 dark:bg-amber-900/20', text: 'text-amber-700 dark:text-amber-400' },
                      { gradient: 'from-pink-500 to-rose-500', bg: 'bg-pink-50 dark:bg-pink-900/20', text: 'text-pink-700 dark:text-pink-400' },
                    ];
                    const color = colors[index % colors.length];
                    return (
                      <div key={index}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className={`w-8 h-8 ${color.bg} rounded-lg flex items-center justify-center`}>
                              <span className={`text-sm font-bold ${color.text}`}>{index + 1}</span>
                            </div>
                            <span className="text-sm font-semibold text-foreground truncate">{topic.name}</span>
                          </div>
                          <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">{topic.count} lessons</span>
                        </div>
                        <div className="h-2 bg-secondary rounded-full overflow-hidden">
                          <div
                            className={`h-full bg-gradient-to-r ${color.gradient} transition-all duration-500`}
                            style={{ width: `${topic.percentage || 0}%` }}
                          />
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <PieChart className="w-12 h-12 text-muted-foreground/50 mx-auto mb-2" />
                    <p className="text-sm">No topic data available</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Performance & Achievements */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Performance Metrics */}
            <div className="bg-card rounded-2xl shadow-xl border border-border/50 p-5 sm:p-6">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                  <Target className="w-5 h-5 text-green-600 dark:text-green-500" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground">Performance Metrics</h3>
                  <p className="text-xs text-muted-foreground">Your learning performance</p>
                </div>
              </div>

              <div className="space-y-4">
                {/* Quiz Average - Large Display */}
                <div className="bg-gradient-to-br from-green-50 to-teal-50 dark:from-green-900/10 dark:to-teal-900/10 rounded-xl p-5 border border-green-100 dark:border-green-900/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1 font-medium">Quiz Average</p>
                      <p className="text-4xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
                        {performance.quizAverage || 0}%
                      </p>
                    </div>
                    <div className="relative w-20 h-20">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle
                          cx="40"
                          cy="40"
                          r="32"
                          stroke="currentColor"
                          strokeWidth="8"
                          fill="none"
                          className="text-muted/20"
                        />
                        <circle
                          cx="40"
                          cy="40"
                          r="32"
                          stroke="url(#greenGradient)"
                          strokeWidth="8"
                          fill="none"
                          strokeDasharray={`${2 * Math.PI * 32}`}
                          strokeDashoffset={`${2 * Math.PI * 32 * (1 - (performance.quizAverage || 0) / 100)}`}
                          strokeLinecap="round"
                        />
                        <defs>
                          <linearGradient id="greenGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#059669" />
                            <stop offset="100%" stopColor="#14b8a6" />
                          </linearGradient>
                        </defs>
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Small Stats Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/10 dark:to-cyan-900/10 rounded-xl p-4 border border-blue-100 dark:border-blue-900/30">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-500" />
                      <p className="text-xs text-muted-foreground font-medium">Completion</p>
                    </div>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-500">{performance.completionRate || 0}%</p>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/10 dark:to-indigo-900/10 rounded-xl p-4 border border-purple-100 dark:border-purple-900/30">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="w-4 h-4 text-purple-600 dark:text-purple-500" />
                      <p className="text-xs text-muted-foreground font-medium">Accuracy</p>
                    </div>
                    <p className="text-2xl font-bold text-purple-600 dark:text-purple-500">{performance.accuracy || 0}%</p>
                  </div>
                </div>

                {/* Current Streak */}
                <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/10 dark:to-amber-900/10 rounded-xl p-5 border border-orange-100 dark:border-orange-900/30">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Flame className="w-5 h-5 text-orange-600 dark:text-orange-500" />
                      <p className="text-sm text-foreground font-semibold">Current Streak</p>
                    </div>
                    <span className="text-2xl">🔥</span>
                  </div>
                  <p className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent mb-2">
                    {performance.currentStreak || 0} days
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Personal Best: <span className="font-semibold text-foreground">{performance.longestStreak || 0} days</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Achievements & Progress */}
            <div className="bg-card rounded-2xl shadow-xl border border-border/50 p-5 sm:p-6">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center">
                  <Award className="w-5 h-5 text-amber-600 dark:text-amber-500" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground">Achievements</h3>
                  <p className="text-xs text-muted-foreground">Your accomplishments</p>
                </div>
              </div>

              <div className="space-y-4">
                {/* Achievement Cards Grid */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-900/10 dark:to-yellow-900/10 rounded-xl p-4 text-center border border-amber-100 dark:border-amber-900/30">
                    <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Award className="w-5 h-5 text-white" />
                    </div>
                    <p className="text-2xl font-bold text-foreground">{achievements.badges || 0}</p>
                    <p className="text-[10px] text-muted-foreground font-medium">Badges</p>
                  </div>
                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/10 dark:to-cyan-900/10 rounded-xl p-4 text-center border border-blue-100 dark:border-blue-900/30">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Trophy className="w-5 h-5 text-white" />
                    </div>
                    <p className="text-2xl font-bold text-foreground">{achievements.challenges || 0}</p>
                    <p className="text-[10px] text-muted-foreground font-medium">Challenges</p>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/10 dark:to-indigo-900/10 rounded-xl p-4 text-center border border-purple-100 dark:border-purple-900/30">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Star className="w-5 h-5 text-white" />
                    </div>
                    <p className="text-2xl font-bold text-foreground">{achievements.certificates || 0}</p>
                    <p className="text-[10px] text-muted-foreground font-medium">Certificates</p>
                  </div>
                </div>

                {/* Level Progress */}
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/10 dark:to-purple-900/10 rounded-xl p-5 border border-indigo-100 dark:border-indigo-900/30">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Medal className="w-5 h-5 text-indigo-600 dark:text-indigo-500" />
                      <h4 className="font-bold text-foreground text-sm">Level Progress</h4>
                    </div>
                    <div className="px-3 py-1 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full">
                      <span className="text-xs text-white font-bold">Level {overview.currentLevel || 1}</span>
                    </div>
                  </div>
                  <div className="mb-3">
                    <div className="h-3 bg-white dark:bg-white/10 rounded-full overflow-hidden shadow-inner">
                      <div
                        className="h-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 transition-all duration-500"
                        style={{
                          width: `${Math.min(((overview.currentXP || 0) / (overview.nextLevelXP || 100)) * 100, 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span className="font-semibold">{overview.currentXP || 0} XP</span>
                    <span>{overview.nextLevelXP || 0} XP</span>
                  </div>
                </div>

                {/* Recent Milestones */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10 rounded-xl p-5 border border-green-100 dark:border-green-900/30">
                  <div className="flex items-center gap-2 mb-4">
                    <Brain className="w-5 h-5 text-green-600 dark:text-green-500" />
                    <h4 className="font-bold text-foreground text-sm">Recent Milestones</h4>
                  </div>
                  <div className="space-y-3">
                    {achievements.recentMilestones?.slice(0, 3).map((milestone: any, index: number) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-green-600 to-emerald-600 rounded-full flex items-center justify-center text-white flex-shrink-0">
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-foreground truncate">{milestone.title}</p>
                          <p className="text-xs text-muted-foreground">{milestone.date}</p>
                        </div>
                      </div>
                    )) || (
                        <div className="text-center py-4">
                          <Trophy className="w-10 h-10 text-muted-foreground/50 mx-auto mb-2" />
                          <p className="text-sm text-muted-foreground">No recent milestones</p>
                        </div>
                      )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Learning Activity Heatmap */}
          <div className="bg-card rounded-2xl shadow-xl border border-border/50 p-5 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-green-600 dark:text-green-500" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground">Learning Activity</h3>
                  <p className="text-xs text-muted-foreground">
                    {analytics.learningActivity?.filter((day: any) => day.count > 0).length || 0} active days in the last year
                  </p>
                </div>
              </div>
            </div>

            {/* Month labels */}
            <div className="overflow-x-auto scrollbar-hide">
              <div className="min-w-max">
                {/* Month labels - calculated based on actual dates */}
                <div className="relative h-5 mb-1 ml-14">
                  {(() => {
                    const monthLabels: { month: string; offset: number }[] = [];
                    let currentMonth = '';

                    for (let weekIndex = 0; weekIndex < 53; weekIndex++) {
                      const daysFromToday = (52 - weekIndex) * 7;
                      const weekStartDate = new Date();
                      weekStartDate.setDate(weekStartDate.getDate() - daysFromToday);
                      const monthName = weekStartDate.toLocaleDateString('en-US', { month: 'short' });

                      if (monthName !== currentMonth && weekIndex > 0) {
                        monthLabels.push({ month: monthName, offset: weekIndex });
                        currentMonth = monthName;
                      }
                    }

                    return monthLabels.map((label, i) => (
                      <div
                        key={i}
                        className="absolute text-[10px] sm:text-xs text-muted-foreground font-medium"
                        style={{
                          left: `${label.offset * 14}px`,
                        }}
                      >
                        {label.month}
                      </div>
                    ));
                  })()}
                </div>

                {/* Heatmap grid */}
                <div className="flex gap-1">
                  {/* Day labels */}
                  <div className="flex flex-col gap-1 text-[10px] text-muted-foreground pr-2 justify-between" style={{ height: '98px' }}>
                    <div className="leading-none h-3">Mon</div>
                    <div className="leading-none h-3">Wed</div>
                    <div className="leading-none h-3">Fri</div>
                  </div>

                  {/* Activity grid - 53 weeks */}
                  <div className="flex gap-1">
                    {Array.from({ length: 53 }).map((_, weekIndex) => {
                      // Get the Sunday of this week (counting backwards from today)
                      const weeksAgo = 52 - weekIndex;
                      const sunday = new Date();
                      sunday.setDate(sunday.getDate() - (weeksAgo * 7) - sunday.getDay());

                      return (
                        <div key={weekIndex} className="flex flex-col gap-1">
                          {Array.from({ length: 7 }).map((_, dayIndex) => {
                            // Calculate date for this specific day
                            const cellDate = new Date(sunday);
                            cellDate.setDate(cellDate.getDate() + dayIndex);
                            const cellDateStr = cellDate.toISOString().split('T')[0];

                            // Don't show future dates
                            if (cellDate > new Date()) {
                              return <div key={dayIndex} className="w-2.5 h-2.5 sm:w-3 sm:h-3" />;
                            }

                            // Find matching activity data
                            const dayData = analytics.learningActivity?.find((d: any) => d.date === cellDateStr) || { count: 0, date: cellDateStr };
                            const count = dayData.count || 0;

                            // Determine intensity based on activity count
                            let intensity = 0;
                            if (count === 0) intensity = 0;
                            else if (count <= 2) intensity = 1;
                            else if (count <= 5) intensity = 2;
                            else if (count <= 8) intensity = 3;
                            else intensity = 4;

                            const colors = [
                              'bg-muted/30 hover:bg-muted border-border/50',
                              'bg-green-200 dark:bg-green-900/40 hover:bg-green-300 dark:hover:bg-green-900/50 border-green-300 dark:border-green-800',
                              'bg-green-400 dark:bg-green-700/60 hover:bg-green-500 dark:hover:bg-green-700/70 border-green-500 dark:border-green-600',
                              'bg-green-600 dark:bg-green-600/80 hover:bg-green-700 dark:hover:bg-green-600/90 border-green-700 dark:border-green-500',
                              'bg-green-800 dark:bg-green-500 hover:bg-green-900 dark:hover:bg-green-500/90 border-green-900 dark:border-green-400',
                            ];

                            const date = cellDate.toLocaleDateString('en-US', {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            });

                            return (
                              <div
                                key={dayIndex}
                                className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-sm border ${colors[intensity]} cursor-pointer transition-all hover:ring-2 hover:ring-green-500 hover:scale-110`}
                                title={count > 0 ? `${count} ${count === 1 ? 'activity' : 'activities'} on ${date}` : `No activity on ${date}`}
                              />
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Legend */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/50">
              <div className="text-xs text-muted-foreground">
                Learn how we count contributions
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="font-medium">Less</span>
                <div className="flex gap-1">
                  <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-muted/30 rounded-sm border border-border/50"></div>
                  <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-200 dark:bg-green-900/40 rounded-sm border border-green-300 dark:border-green-800"></div>
                  <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-400 dark:bg-green-700/60 rounded-sm border border-green-500 dark:border-green-600"></div>
                  <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-600 dark:bg-green-600/80 rounded-sm border border-green-700 dark:border-green-500"></div>
                  <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-800 dark:bg-green-500 rounded-sm border border-green-900 dark:border-green-400"></div>
                </div>
                <span className="font-medium">More</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
