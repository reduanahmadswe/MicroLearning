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
  Newspaper,
  Play,
  Eye,
  Heart,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/authStore';
import { progressAPI, badgesAPI, leaderboardAPI, challengesAPI } from '@/services/api.service';
import { toast } from 'sonner';

export default function DashboardPage() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [challenges, setChallenges] = useState<any[]>([]);
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
      const [progressRes, badgesRes, leaderboardRes, challengesRes] = await Promise.all([
        progressAPI.getProgress().catch((err) => { 
          console.error('Progress API error:', err?.response?.status || 'No response', err?.response?.data || err?.message || 'Unknown error'); 
          return { data: { data: null } };
        }),
        badgesAPI.getUserBadges().catch((err) => { 
          console.error('Badges API error:', err?.response?.status || 'No response', err?.response?.data || err?.message || 'Unknown error'); 
          return { data: { data: [] } };
        }),
        leaderboardAPI.getGlobalLeaderboard({ limit: 5 }).catch((err) => { 
          console.error('Leaderboard API error:', err?.response?.status || 'No response', err?.response?.data || err?.message || 'Unknown error'); 
          return { data: { data: [] } };
        }),
        challengesAPI.getActiveChallenges().catch((err) => { 
          console.error('Challenges API error:', err?.response?.status || 'No response', err?.response?.data || err?.message || 'Unknown error'); 
          return { data: { data: [] } };
        }),
      ]);

      console.log('Dashboard data loaded:', { 
        progressRes: progressRes.data, 
        badgesRes: badgesRes.data,
        leaderboardRes: leaderboardRes.data,
        challengesRes: challengesRes.data
      });
      
      const statsData = progressRes.data.data || { totalXP: user?.xp || 0, level: user?.level || 1, currentStreak: user?.streak || 0 };
      console.log('Setting stats:', statsData);
      console.log('User object:', user);
      
      setStats(statsData);
      setBadges(badgesRes.data.data?.slice(0, 6) || []);
      setLeaderboard(leaderboardRes.data.data || []);
      
      // Handle challenges response - could be array or object
      const challengesData = challengesRes.data.data || challengesRes.data || [];
      setChallenges(Array.isArray(challengesData) ? challengesData.slice(0, 4) : []);
    } catch (error: any) {
      console.error('Dashboard loading error:', error?.message || error);
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
    { icon: Newspaper, label: 'Feed', href: '/feed', color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { icon: BookOpen, label: 'Lessons', href: '/lessons', color: 'text-teal-600', bg: 'bg-teal-50' },
    { icon: Brain, label: 'Quiz', href: '/quiz', color: 'text-cyan-600', bg: 'bg-cyan-50' },
    { icon: Sparkles, label: 'Flashcards', href: '/flashcards', color: 'text-green-600', bg: 'bg-green-50' },
    { icon: GraduationCap, label: 'Courses', href: '/courses', color: 'text-teal-700', bg: 'bg-teal-50' },
    { icon: ShoppingBag, label: 'Purchased', href: '/purchased-courses', color: 'text-emerald-700', bg: 'bg-emerald-50' },
    { icon: Star, label: 'Bookmarks', href: '/bookmarks', color: 'text-amber-600', bg: 'bg-amber-50' },
    { icon: Zap, label: 'AI Tutor', href: '/ai-tutor', color: 'text-violet-600', bg: 'bg-violet-50' },
    { icon: Video, label: 'Videos', href: '/videos', color: 'text-cyan-700', bg: 'bg-cyan-50' },
    { icon: Trophy, label: 'Leaderboard', href: '/leaderboard', color: 'text-yellow-600', bg: 'bg-yellow-50' },
    { icon: Award, label: 'Badges', href: '/badges', color: 'text-orange-600', bg: 'bg-orange-50' },
    { icon: Users, label: 'Friends', href: '/friends', color: 'text-teal-600', bg: 'bg-teal-50' },
    { icon: Target, label: 'Challenges', href: '/challenges', color: 'text-rose-600', bg: 'bg-rose-50' },
    { icon: MessageSquare, label: 'Forum', href: '/forum', color: 'text-green-600', bg: 'bg-green-50' },
    { icon: BarChart3, label: 'Analytics', href: '/analytics', color: 'text-teal-700', bg: 'bg-teal-50' },
    { icon: Map, label: 'Roadmap', href: '/roadmap', color: 'text-emerald-600', bg: 'bg-emerald-50' },
  ];

  const statCards = [
    { icon: TrendingUp, label: 'Total XP', value: stats?.totalXP || user?.xp || 0, color: 'text-green-600', bg: 'bg-gradient-to-br from-green-50 to-emerald-50', iconBg: 'bg-gradient-to-br from-green-500 to-emerald-600' },
    { icon: Star, label: 'Level', value: stats?.level || user?.level || 1, color: 'text-yellow-600', bg: 'bg-gradient-to-br from-yellow-50 to-amber-50', iconBg: 'bg-gradient-to-br from-yellow-500 to-amber-600' },
    { icon: Flame, label: 'Streak', value: `${stats?.currentStreak || user?.streak || 0} days`, color: 'text-orange-600', bg: 'bg-gradient-to-br from-orange-50 to-red-50', iconBg: 'bg-gradient-to-br from-orange-500 to-red-600' },
    { icon: BookOpen, label: 'Lessons', value: stats?.lessonsCompleted || user?.totalLessonsCompleted || 0, color: 'text-teal-600', bg: 'bg-gradient-to-br from-teal-50 to-cyan-50', iconBg: 'bg-gradient-to-br from-teal-500 to-cyan-600' },
    { icon: Brain, label: 'Quizzes', value: stats?.quizzesCompleted || user?.totalQuizzesCompleted || 0, color: 'text-purple-600', bg: 'bg-gradient-to-br from-purple-50 to-pink-50', iconBg: 'bg-gradient-to-br from-purple-500 to-pink-600' },
    { icon: Clock, label: 'Study Time', value: `${Math.floor((stats?.studyTimeMinutes || 0) / 60)}h`, color: 'text-emerald-600', bg: 'bg-gradient-to-br from-emerald-50 to-green-50', iconBg: 'bg-gradient-to-br from-emerald-500 to-green-600' },
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
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-teal-50 to-emerald-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8 relative overflow-hidden rounded-2xl bg-gradient-to-r from-green-600 to-teal-600 p-8 text-white shadow-xl">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 h-32 w-32 rounded-full bg-white/10 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 -mb-4 -ml-4 h-32 w-32 rounded-full bg-white/10 blur-3xl"></div>
          <div className="relative z-10">
            <h2 className="text-3xl sm:text-4xl font-bold mb-2">
              Welcome back, {user?.name}! 👋
            </h2>
            <p className="text-green-50 text-lg">Continue your learning journey and achieve greatness!</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {statCards.map((stat, index) => (
            <Card key={index} className={`${stat.bg} border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105`}>
              <CardContent className="p-5">
                <div className={`w-12 h-12 ${stat.iconBg} rounded-xl flex items-center justify-center mb-3 shadow-md`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <p className="text-xs font-medium text-gray-600 mb-1 uppercase tracking-wide">{stat.label}</p>
                <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Navigation Grid */}
          <div className="lg:col-span-2 space-y-8">
            <div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent mb-6">
                Quick Access
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {navigationItems.map((item, index) => (
                  <Link key={index} href={item.href}>
                    <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 cursor-pointer border-0 shadow-md bg-white/80 backdrop-blur-sm">
                      <CardContent className="p-6 flex flex-col items-center text-center">
                        <div className={`w-14 h-14 ${item.bg} rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300 shadow-md`}>
                          <item.icon className={`w-7 h-7 ${item.color}`} />
                        </div>
                        <p className="font-semibold text-gray-800 text-sm">{item.label}</p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>

            {/* Active Challenges */}
            {challenges.length > 0 && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
                    Active Challenges
                  </h3>
                  <Link href="/challenges">
                    <Button variant="ghost" size="sm" className="text-teal-600 hover:text-teal-700 hover:bg-teal-50">
                      View All →
                    </Button>
                  </Link>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  {challenges.map((challenge) => {
                    const progressPercentage = challenge.currentProgress && challenge.targetValue 
                      ? Math.min(100, (challenge.currentProgress / challenge.targetValue) * 100)
                      : 0;
                    
                    const isCompleted = progressPercentage >= 100;
                    
                    const challengeIcons: any = {
                      'daily': '📅',
                      'weekly': '📆', 
                      'streak': '🔥',
                      'xp': '⭐',
                      'lessons': '📚',
                      'quiz': '🧠',
                      'perfect_score': '💯',
                      'flashcards': '🎴',
                    };
                    
                    const icon = challengeIcons[challenge.type] || '🎯';
                    
                    return (
                      <Card key={challenge._id} className={`group hover:shadow-2xl transition-all duration-300 border-0 shadow-lg overflow-hidden ${
                        isCompleted ? 'bg-gradient-to-br from-green-50 to-emerald-50' : 'bg-white'
                      }`}>
                        {/* Header with Icon */}
                        <div className={`relative p-6 pb-4 ${
                          isCompleted 
                            ? 'bg-gradient-to-r from-green-600 to-teal-600' 
                            : 'bg-gradient-to-r from-teal-500 to-cyan-500'
                        }`}>
                          <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-white/10 blur-2xl"></div>
                          <div className="relative z-10 flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <div className="text-4xl">{icon}</div>
                                <div>
                                  <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                                    isCompleted 
                                      ? 'bg-white/30 text-white backdrop-blur-sm' 
                                      : 'bg-white/20 text-white backdrop-blur-sm'
                                  }`}>
                                    {challenge.type?.toUpperCase() || 'CHALLENGE'}
                                  </span>
                                </div>
                              </div>
                              <h4 className="font-bold text-white text-lg mb-1 line-clamp-1">
                                {challenge.title || challenge.name}
                              </h4>
                              <p className="text-white/90 text-sm line-clamp-2">
                                {challenge.description}
                              </p>
                            </div>
                            {isCompleted && (
                              <div className="ml-3">
                                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                                  <Trophy className="w-6 h-6 text-white" />
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {/* Progress Section */}
                        <CardContent className="p-6">
                          {/* Progress Bar */}
                          <div className="mb-4">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm font-medium text-gray-700">Progress</span>
                              <span className={`text-sm font-bold ${
                                isCompleted ? 'text-green-600' : 'text-teal-600'
                              }`}>
                                {challenge.currentProgress || 0} / {challenge.targetValue || 100}
                              </span>
                            </div>
                            <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                              <div 
                                className={`h-full transition-all duration-500 ${
                                  isCompleted
                                    ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                                    : 'bg-gradient-to-r from-teal-500 to-cyan-500'
                                }`}
                                style={{ width: `${progressPercentage}%` }}
                              />
                            </div>
                          </div>
                          
                          {/* Meta Info */}
                          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                            <div className="flex items-center space-x-4 text-xs text-gray-500">
                              <span className="flex items-center space-x-1">
                                <Star className="w-3.5 h-3.5 text-yellow-500" />
                                <span className="font-bold text-yellow-600">{challenge.xpReward || challenge.reward || 50} XP</span>
                              </span>
                              {challenge.deadline && (
                                <span className="flex items-center space-x-1">
                                  <Clock className="w-3.5 h-3.5" />
                                  <span className="font-medium">
                                    {new Date(challenge.deadline).toLocaleDateString()}
                                  </span>
                                </span>
                              )}
                            </div>
                            
                            <Link href={`/challenges`}>
                              <Button 
                                size="sm" 
                                className={`shadow-md transition-all ${
                                  isCompleted
                                    ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700'
                                    : 'bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700'
                                } text-white`}
                              >
                                {isCompleted ? 'Completed ✓' : 'Start →'}
                              </Button>
                            </Link>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Badges */}
            {badges.length > 0 && (
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
                      Recent Badges
                    </CardTitle>
                    <Link href="/badges">
                      <Button variant="ghost" size="sm" className="text-teal-600 hover:text-teal-700 hover:bg-teal-50">
                        View All →
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-3">
                    {badges.map((badge: any) => (
                      <div key={badge._id} className="text-center group cursor-pointer">
                        <div className="w-16 h-16 mx-auto mb-2 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                          {badge.badge?.icon || '🏆'}
                        </div>
                        <p className="text-xs text-gray-600 line-clamp-1 font-medium">{badge.badge?.name}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Leaderboard Preview */}
            {leaderboard.length > 0 && (
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
                      Top Learners
                    </CardTitle>
                    <Link href="/leaderboard">
                      <Button variant="ghost" size="sm" className="text-teal-600 hover:text-teal-700 hover:bg-teal-50">
                        View All →
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {leaderboard.slice(0, 5).map((entry: any, index: number) => (
                      <Link key={entry._id || index} href={`/profile/${entry.userId}`}>
                        <div className="flex items-center space-x-3 p-3 rounded-xl hover:bg-green-50 transition-colors cursor-pointer group">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-md ${
                            index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-white' :
                            index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-500 text-white' :
                            index === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-600 text-white' :
                            'bg-gradient-to-br from-green-100 to-teal-100 text-green-700'
                          }`}>
                            {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-green-600 transition-colors">
                              {entry.name || 'Anonymous'}
                            </p>
                            <p className="text-xs text-gray-500 font-medium">{entry.xp?.toLocaleString()} XP</p>
                          </div>
                          <TrendingUp className="w-4 h-4 text-green-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Daily Challenge */}
            <Card className="bg-gradient-to-br from-green-600 via-teal-600 to-emerald-600 text-white border-0 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-white/10 blur-2xl"></div>
              <div className="absolute bottom-0 left-0 -mb-4 -ml-4 h-24 w-24 rounded-full bg-white/10 blur-2xl"></div>
              <CardHeader className="relative z-10">
                <div className="flex items-center space-x-2 mb-2">
                  <Target className="w-6 h-6" />
                  <CardTitle className="text-white text-lg font-bold">Daily Challenge</CardTitle>
                </div>
                <CardDescription className="text-green-50">
                  Complete today's challenge to earn bonus XP and rewards!
                </CardDescription>
              </CardHeader>
              <CardContent className="relative z-10">
                <Link href="/challenges">
                  <Button className="w-full bg-white text-green-600 hover:bg-green-50 font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                    Start Challenge 🚀
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
