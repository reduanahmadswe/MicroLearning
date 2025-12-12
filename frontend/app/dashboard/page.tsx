'use client';

import { useEffect } from 'react';
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
  GraduationCap,
  Zap,
  Map,
  Video,
  Newspaper,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';
// ============================================
// REDUX HOOKS - INSTANT DATA ACCESS!
// ============================================
import {
  useCurrentUser,
  useProgressStats,
  useUserBadges,
  useGlobalLeaderboard,
  useIsInitializing,
} from '@/store/hooks';

export default function DashboardPage() {
  const router = useRouter();
  const { logout } = useAuthStore();

  // ============================================
  // INSTANT DATA FROM REDUX - NO API CALLS!
  // ============================================
  const user = useCurrentUser();
  const stats = useProgressStats();
  const badges = useUserBadges();
  const leaderboard = useGlobalLeaderboard();
  const isInitializing = useIsInitializing();

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
    }
  }, [user, router]);

  const handleLogout = () => {
    logout();
    router.push('/home');
    toast.success('Logged out successfully');
  };

  const navigationItems = [
    { icon: Newspaper, label: 'Feed', href: '/feed', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
    { icon: BookOpen, label: 'Lessons', href: '/lessons', color: 'text-teal-600 dark:text-teal-400', bg: 'bg-teal-50 dark:bg-teal-500/10' },
    { icon: Brain, label: 'Quiz', href: '/quiz', color: 'text-cyan-600 dark:text-cyan-400', bg: 'bg-cyan-50 dark:bg-cyan-500/10' },
    { icon: GraduationCap, label: 'Courses', href: '/courses', color: 'text-teal-700 dark:text-teal-300', bg: 'bg-teal-50 dark:bg-teal-500/10' },
    { icon: ShoppingBag, label: 'Purchased', href: '/purchased-courses', color: 'text-emerald-700 dark:text-emerald-300', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
    { icon: Star, label: 'Bookmarks', href: '/bookmarks', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-500/10' },
    { icon: Zap, label: 'AI Tutor', href: '/ai-tutor', color: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-50 dark:bg-violet-500/10' },
    { icon: Video, label: 'Videos', href: '/videos', color: 'text-cyan-700 dark:text-cyan-300', bg: 'bg-cyan-50 dark:bg-cyan-500/10' },
    { icon: Trophy, label: 'Leaderboard', href: '/leaderboard', color: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-50 dark:bg-yellow-500/10' },
    { icon: Award, label: 'Badges', href: '/badges', color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-500/10' },
    { icon: Users, label: 'Friends', href: '/friends', color: 'text-teal-600 dark:text-teal-400', bg: 'bg-teal-50 dark:bg-teal-500/10' },
    { icon: MessageSquare, label: 'Forum', href: '/forum', color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-500/10' },
    { icon: BarChart3, label: 'Analytics', href: '/analytics', color: 'text-teal-700 dark:text-teal-300', bg: 'bg-teal-50 dark:bg-teal-500/10' },
    { icon: Map, label: 'Roadmap', href: '/roadmap', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
  ];

  const statCards = [
    { icon: TrendingUp, label: 'Total XP', value: stats?.totalXP || user?.xp || 0, color: 'text-green-600 dark:text-green-400', bg: 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20', iconBg: 'bg-gradient-to-br from-green-500 to-emerald-600' },
    { icon: Star, label: 'Level', value: stats?.currentLevel || user?.level || 1, color: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20', iconBg: 'bg-gradient-to-br from-yellow-500 to-amber-600' },
    { icon: Flame, label: 'Streak', value: `${stats?.currentStreak || user?.streak || 0} days`, color: 'text-orange-600 dark:text-orange-400', bg: 'bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20', iconBg: 'bg-gradient-to-br from-orange-500 to-red-600' },
    { icon: BookOpen, label: 'Lessons', value: stats?.completedLessons || user?.totalLessonsCompleted || 0, color: 'text-teal-600 dark:text-teal-400', bg: 'bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20', iconBg: 'bg-gradient-to-br from-teal-500 to-cyan-600' },
    { icon: Brain, label: 'Quizzes', value: stats?.completedQuizzes || user?.totalQuizzesCompleted || 0, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20', iconBg: 'bg-gradient-to-br from-purple-500 to-pink-600' },
    { icon: Clock, label: 'Study Time', value: `${Math.floor((stats?.totalStudyTime || 0) / 60)}h`, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20', iconBg: 'bg-gradient-to-br from-emerald-500 to-green-600' },
  ];

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-page-gradient">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8 relative overflow-hidden rounded-2xl bg-gradient-to-r from-green-600 to-teal-600 dark:from-green-700 dark:to-teal-700 p-8 text-white shadow-xl">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 h-32 w-32 rounded-full bg-white/10 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 -mb-4 -ml-4 h-32 w-32 rounded-full bg-white/10 blur-3xl"></div>
          <div className="relative z-10">
            <h2 className="text-3xl sm:text-4xl font-bold mb-2">
              Welcome back, {user?.name}! 👋
            </h2>
            <p className="text-green-50 text-lg opacity-90">Continue your learning journey and achieve greatness!</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {statCards.map((stat, index) => (
            <Card key={index} className={`${stat.bg} border-border/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105`}>
              <CardContent className="p-5">
                <div className={`w-12 h-12 ${stat.iconBg} rounded-xl flex items-center justify-center mb-3 shadow-md`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <p className="text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wide">{stat.label}</p>
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
                    <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 cursor-pointer border-border/50 shadow-md bg-card/80 backdrop-blur-sm">
                      <CardContent className="p-6 flex flex-col items-center text-center">
                        <div className={`w-14 h-14 ${item.bg} rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300 shadow-md`}>
                          <item.icon className={`w-7 h-7 ${item.color}`} />
                        </div>
                        <p className="font-semibold text-foreground text-sm">{item.label}</p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>


          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Badges */}
            {badges.length > 0 && (
              <Card className="border-border/50 shadow-lg bg-card/80 backdrop-blur-sm">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
                      Recent Badges
                    </CardTitle>
                    <Link href="/badges">
                      <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80 hover:bg-primary/10">
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
                        <p className="text-xs text-muted-foreground line-clamp-1 font-medium">{badge.badge?.name}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Leaderboard Preview */}
            {leaderboard.length > 0 && (
              <Card className="border-border/50 shadow-lg bg-card/80 backdrop-blur-sm">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
                      Top Learners
                    </CardTitle>
                    <Link href="/leaderboard">
                      <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80 hover:bg-primary/10">
                        View All →
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {leaderboard.slice(0, 5).map((entry: any, index: number) => (
                      <Link key={entry._id || index} href={`/profile/${entry.userId}`}>
                        <div className="flex items-center space-x-3 p-3 rounded-xl hover:bg-accent/50 transition-colors cursor-pointer group">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-md ${index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-white' :
                            index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-500 text-white' :
                              index === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-600 text-white' :
                                'bg-gradient-to-br from-green-100 to-teal-100 text-green-700 dark:from-green-900 dark:to-teal-900 dark:text-green-300'
                            }`}>
                            {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                              {entry.name || 'Anonymous'}
                            </p>
                            <p className="text-xs text-muted-foreground font-medium">{entry.xp?.toLocaleString()} XP</p>
                          </div>
                          <TrendingUp className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
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
