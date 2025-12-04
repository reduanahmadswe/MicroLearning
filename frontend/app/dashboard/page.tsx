'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  BookOpen,
  Brain,
  Target,
  Trophy,
  Users,
  MessageSquare,
  ShoppingBag,
  BarChart3,
  Sparkles,
  Clock,
  Flame,
  Star,
  TrendingUp,
  Award,
  Bell,
  Settings,
  LogOut,
  Home,
  GraduationCap,
  Zap,
  Map,
  Video,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/authStore';
import { progressAPI, badgesAPI, leaderboardAPI, lessonsAPI, notificationsAPI } from '@/services/api.service';
import { toast } from 'sonner';

export default function DashboardPage() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [recentLessons, setRecentLessons] = useState<any[]>([]);
  const [badges, setBadges] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);

  useEffect(() => {
    const { token } = useAuthStore.getState();
    console.log('Dashboard useEffect - user:', user, 'token:', token ? 'exists' : 'missing');
    
    if (!user || !token) {
      console.log('No user or token, redirecting to login');
      setLoading(false);
      router.push('/auth/login');
      return;
    }
    
    loadDashboardData();
  }, [user, router]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      console.log('Loading dashboard data...');
      const [progressRes, badgesRes, leaderboardRes, lessonsRes] = await Promise.all([
        progressAPI.getProgress().catch((err) => { 
          console.error('Progress API error:', err.response?.status, err.response?.data); 
          return { data: { data: null } };
        }),
        badgesAPI.getUserBadges().catch((err) => { 
          console.error('Badges API error:', err.response?.status, err.response?.data); 
          return { data: { data: [] } };
        }),
        leaderboardAPI.getGlobalLeaderboard({ limit: 5 }).catch((err) => { 
          console.error('Leaderboard API error:', err.response?.status, err.response?.data); 
          return { data: { data: [] } };
        }),
        lessonsAPI.getLessons({ limit: 5, sort: 'createdAt', order: 'desc' }).catch((err) => { 
          console.error('Lessons API error:', err.response?.status, err.response?.data); 
          return { data: { data: [] } };
        }),
      ]);

      console.log('Dashboard data loaded:', { 
        progressRes: progressRes.data, 
        badgesRes: badgesRes.data,
        leaderboardRes: leaderboardRes.data,
        lessonsRes: lessonsRes.data
      });
      
      const statsData = progressRes.data.data || { totalXP: user?.xp || 0, level: user?.level || 1, currentStreak: user?.streak || 0 };
      console.log('Setting stats:', statsData);
      console.log('User object:', user);
      
      setStats(statsData);
      setBadges(badgesRes.data.data?.slice(0, 6) || []);
      setLeaderboard(leaderboardRes.data.data || []);
      setRecentLessons(lessonsRes.data.data || []);
    } catch (error: any) {
      console.error('Dashboard loading error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/home');
    toast.success('Logged out successfully');
  };

  const navigationItems = [
    { icon: BookOpen, label: 'Lessons', href: '/lessons', color: 'text-purple-600', bg: 'bg-purple-50' },
    { icon: Brain, label: 'Quiz', href: '/quiz', color: 'text-pink-600', bg: 'bg-pink-50' },
    { icon: Sparkles, label: 'Flashcards', href: '/flashcards', color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { icon: GraduationCap, label: 'Courses', href: '/courses', color: 'text-green-600', bg: 'bg-green-50' },
    { icon: ShoppingBag, label: 'Purchased', href: '/purchased-courses', color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { icon: Star, label: 'Bookmarks', href: '/bookmarks', color: 'text-amber-600', bg: 'bg-amber-50' },
    { icon: Zap, label: 'AI Tutor', href: '/ai-tutor', color: 'text-violet-600', bg: 'bg-violet-50' },
    { icon: Video, label: 'Videos', href: '/videos', color: 'text-rose-600', bg: 'bg-rose-50' },
    { icon: Trophy, label: 'Leaderboard', href: '/leaderboard', color: 'text-yellow-600', bg: 'bg-yellow-50' },
    { icon: Award, label: 'Badges', href: '/badges', color: 'text-orange-600', bg: 'bg-orange-50' },
    { icon: Users, label: 'Friends', href: '/friends', color: 'text-teal-600', bg: 'bg-teal-50' },
    { icon: Target, label: 'Challenges', href: '/challenges', color: 'text-red-600', bg: 'bg-red-50' },
    { icon: MessageSquare, label: 'Forum', href: '/forum', color: 'text-blue-600', bg: 'bg-blue-50' },
    { icon: BarChart3, label: 'Analytics', href: '/analytics', color: 'text-cyan-600', bg: 'bg-cyan-50' },
    { icon: Map, label: 'Roadmap', href: '/roadmap', color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  const statCards = [
    { icon: TrendingUp, label: 'Total XP', value: stats?.totalXP || user?.xp || 0, color: 'text-blue-600', bg: 'bg-blue-50' },
    { icon: Star, label: 'Level', value: stats?.level || user?.level || 1, color: 'text-yellow-600', bg: 'bg-yellow-50' },
    { icon: Flame, label: 'Streak', value: `${stats?.currentStreak || user?.streak || 0} days`, color: 'text-orange-600', bg: 'bg-orange-50' },
    { icon: BookOpen, label: 'Lessons', value: stats?.lessonsCompleted || user?.totalLessonsCompleted || 0, color: 'text-purple-600', bg: 'bg-purple-50' },
    { icon: Brain, label: 'Quizzes', value: stats?.quizzesCompleted || user?.totalQuizzesCompleted || 0, color: 'text-pink-600', bg: 'bg-pink-50' },
    { icon: Clock, label: 'Study Time', value: `${Math.floor((stats?.studyTimeMinutes || 0) / 60)}h`, color: 'text-green-600', bg: 'bg-green-50' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.name}! 👋
          </h2>
          <p className="text-gray-600">Continue your learning journey</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {statCards.map((stat, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className={`w-10 h-10 ${stat.bg} rounded-lg flex items-center justify-center mb-3`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Navigation Grid */}
          <div className="lg:col-span-2 space-y-8">
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Quick Access</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {navigationItems.map((item, index) => (
                  <Link key={index} href={item.href}>
                    <Card className="hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer">
                      <CardContent className="p-6">
                        <div className={`w-12 h-12 ${item.bg} rounded-lg flex items-center justify-center mb-3`}>
                          <item.icon className={`w-6 h-6 ${item.color}`} />
                        </div>
                        <p className="font-medium text-gray-900">{item.label}</p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>

            {/* Recent Lessons */}
            {recentLessons.length > 0 && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-gray-900">Recent Lessons</h3>
                  <Link href="/lessons">
                    <Button variant="ghost" size="sm">View All</Button>
                  </Link>
                </div>
                <div className="grid gap-4">
                  {recentLessons.map((lesson) => (
                    <Card key={lesson._id} className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 mb-1">{lesson.title}</h4>
                            <p className="text-sm text-gray-600 mb-2 line-clamp-2">{lesson.summary}</p>
                            <div className="flex items-center space-x-4 text-xs text-gray-500">
                              <span className="flex items-center">
                                <Clock className="w-3 h-3 mr-1" />
                                {lesson.estimatedTime}min
                              </span>
                              <span className={`px-2 py-1 rounded ${
                                lesson.difficulty === 'beginner' ? 'bg-green-100 text-green-700' :
                                lesson.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-red-100 text-red-700'
                              }`}>
                                {lesson.difficulty}
                              </span>
                            </div>
                          </div>
                          <Link href={`/lessons/${lesson._id}`}>
                            <Button size="sm">Start</Button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Badges */}
            {badges.length > 0 && (
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg">Recent Badges</CardTitle>
                    <Link href="/badges">
                      <Button variant="ghost" size="sm">View All</Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-3">
                    {badges.map((badge: any) => (
                      <div key={badge._id} className="text-center">
                        <div className="w-16 h-16 mx-auto mb-2 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-2xl">
                          {badge.badge?.icon || '🏆'}
                        </div>
                        <p className="text-xs text-gray-600 line-clamp-1">{badge.badge?.name}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Leaderboard Preview */}
            {leaderboard.length > 0 && (
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg">Top Learners</CardTitle>
                    <Link href="/leaderboard">
                      <Button variant="ghost" size="sm">View All</Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {leaderboard.slice(0, 5).map((entry: any, index: number) => (
                      <div key={entry._id || index} className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                          index === 0 ? 'bg-yellow-100 text-yellow-700' :
                          index === 1 ? 'bg-gray-100 text-gray-700' :
                          index === 2 ? 'bg-orange-100 text-orange-700' :
                          'bg-blue-50 text-blue-600'
                        }`}>
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {entry.user?.name || 'Anonymous'}
                          </p>
                          <p className="text-xs text-gray-500">{entry.xp} XP</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Daily Challenge */}
            <Card className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
              <CardHeader>
                <CardTitle className="text-white">Daily Challenge</CardTitle>
                <CardDescription className="text-white/90">
                  Complete today's challenge to earn bonus XP!
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/challenges">
                  <Button className="w-full bg-white text-blue-600 hover:bg-gray-100">
                    Start Challenge
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
