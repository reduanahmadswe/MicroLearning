'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Award,
  Trophy,
  Star,
  Target,
  Zap,
  BookOpen,
  CheckCircle,
  Lock,
  Flame,
  Crown,
  TrendingUp,
  Users,
  Medal,
  Sparkles,
  Gift,
  Filter,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { badgesAPI } from '@/services/api.service';
import { toast } from 'sonner';
import { Badge } from '@/types';

export default function BadgesPage() {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'earned' | 'locked'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = ['Learning', 'Social', 'Achievements', 'Milestones', 'Special'];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [badgesRes, achievementsRes, statsRes] = await Promise.all([
        badgesAPI.getBadges(),
        badgesAPI.getUserAchievements(),
        badgesAPI.getStats(),
      ]);
      setBadges(badgesRes.data.data || []);
      setAchievements(achievementsRes.data.data || []);
      setStats(statsRes.data.data || null);
    } catch (error: any) {
      toast.error('Failed to load badges');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getBadgeIcon = (iconName: string) => {
    const icons: any = {
      trophy: Trophy,
      star: Star,
      target: Target,
      zap: Zap,
      book: BookOpen,
      check: CheckCircle,
      flame: Flame,
      crown: Crown,
      trending: TrendingUp,
      users: Users,
      medal: Medal,
      award: Award,
    };
    const Icon = icons[iconName] || Award;
    return <Icon className="w-full h-full" />;
  };

  const getAchievement = (badgeId: string) => {
    return achievements.find((a) => a.badge?._id === badgeId);
  };

  const filteredBadges = badges.filter((badge) => {
    if (selectedCategory !== 'all' && badge.category !== selectedCategory) return false;
    
    const achievement = getAchievement(badge._id);
    const isEarned = achievement?.isCompleted;
    
    if (activeTab === 'earned' && !isEarned) return false;
    if (activeTab === 'locked' && isEarned) return false;
    
    return true;
  });

  const earnedCount = stats?.earnedBadges || 0;
  const totalCount = stats?.totalBadges || badges.length;
  const completionPercentage = stats?.completionPercentage || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-fuchsia-50">
      {/* Container with responsive padding */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
        
        {/* Hero Header Section */}
        <div className="mb-6 sm:mb-8 lg:mb-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 flex items-center gap-2 sm:gap-3 mb-2">
                <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 bg-gradient-to-br from-violet-500 to-fuchsia-600 rounded-2xl flex items-center justify-center shadow-xl">
                  <Trophy className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-white" />
                </div>
                Badges & Achievements
              </h1>
              <p className="text-sm sm:text-base text-gray-600">
                Collect badges and showcase your learning journey
              </p>
            </div>
            
            {/* Progress Ring - Mobile Optimized */}
            <div className="self-start sm:self-auto">
              <div className="relative w-24 h-24 sm:w-28 sm:h-28">
                <svg className="transform -rotate-90 w-full h-full">
                  <circle
                    cx="50%"
                    cy="50%"
                    r="40%"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    className="text-gray-200"
                  />
                  <circle
                    cx="50%"
                    cy="50%"
                    r="40%"
                    stroke="url(#gradient)"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${completionPercentage * 2.51} 251`}
                    className="transition-all duration-1000"
                  />
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#8b5cf6" />
                      <stop offset="100%" stopColor="#d946ef" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xl sm:text-2xl font-bold text-gray-900">{earnedCount}</span>
                  <span className="text-xs text-gray-500">of {totalCount}</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Stats Cards - Mobile Horizontal Scroll */}
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl sm:rounded-2xl p-4 text-white shadow-lg">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6" />
                <span className="text-xs sm:text-sm font-medium opacity-90">Earned</span>
              </div>
              <p className="text-2xl sm:text-3xl font-bold">{earnedCount}</p>
            </div>
            
            <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-xl sm:rounded-2xl p-4 text-white shadow-lg">
              <div className="flex items-center gap-2 mb-2">
                <Lock className="w-5 h-5 sm:w-6 sm:h-6" />
                <span className="text-xs sm:text-sm font-medium opacity-90">Locked</span>
              </div>
              <p className="text-2xl sm:text-3xl font-bold">{totalCount - earnedCount}</p>
            </div>
            
            <div className="bg-gradient-to-br from-yellow-500 to-amber-600 rounded-xl sm:rounded-2xl p-4 text-white shadow-lg">
              <div className="flex items-center gap-2 mb-2">
                <Crown className="w-5 h-5 sm:w-6 sm:h-6" />
                <span className="text-xs sm:text-sm font-medium opacity-90">Legendary</span>
              </div>
              <p className="text-2xl sm:text-3xl font-bold">
                {achievements.filter((a) => a.isCompleted && a.badge?.rarity === 'legendary').length}
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl sm:rounded-2xl p-4 text-white shadow-lg">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" />
                <span className="text-xs sm:text-sm font-medium opacity-90">Progress</span>
              </div>
              <p className="text-2xl sm:text-3xl font-bold">{completionPercentage.toFixed(0)}%</p>
            </div>
          </div>
        </div>

        {/* Responsive Grid Layout */}
        <div className="grid lg:grid-cols-12 gap-6 lg:gap-8">
          
          {/* Sidebar - Hidden on mobile */}
          <div className="hidden lg:block lg:col-span-3 space-y-6">
            
            {/* Recent Achievements */}
            <Card className="border-0 shadow-lg overflow-hidden bg-white">
              <CardHeader className="bg-gradient-to-r from-violet-500 to-fuchsia-600 text-white pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  Recent Unlocks
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                {achievements.filter((a) => a.isCompleted).slice(0, 5).length === 0 ? (
                  <div className="text-center py-8">
                    <Award className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm text-gray-500">
                      Start learning to earn your first badge!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {achievements
                      .filter((a) => a.isCompleted)
                      .sort((a, b) => new Date(b.earnedAt).getTime() - new Date(a.earnedAt).getTime())
                      .slice(0, 5)
                      .map((achievement) => {
                        const badge = achievement.badge;
                        if (!badge) return null;
                        
                        return (
                          <div key={achievement._id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-violet-50 transition-colors">
                            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br from-violet-500 to-fuchsia-600 text-white text-xl shadow-md flex-shrink-0">
                              {badge.icon || '🏆'}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-gray-900 truncate">
                                {badge.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {new Date(achievement.earnedAt).toLocaleDateString()}
                              </p>
                            </div>
                            <Sparkles className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                          </div>
                        );
                      })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Milestone Progress */}
            <Card className="border-0 shadow-lg bg-white">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Target className="w-5 h-5 text-violet-600" />
                  Next Milestones
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {filteredBadges
                  .filter((badge) => {
                    const achievement = getAchievement(badge._id);
                    return !achievement?.isCompleted && (achievement?.progress || 0) > 0;
                  })
                  .slice(0, 3)
                  .map((badge) => {
                    const achievement = getAchievement(badge._id);
                    const progress = achievement?.progress || 0;
                    const threshold = badge.criteria?.threshold || 100;
                    const progressPercentage = Math.min((progress / threshold) * 100, 100);
                    
                    return (
                      <div key={badge._id} className="space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="text-lg">{badge.icon || '🏆'}</div>
                          <p className="text-sm font-medium text-gray-900 flex-1 truncate">
                            {badge.name}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-600 transition-all duration-500"
                              style={{ width: `${progressPercentage}%` }}
                            />
                          </div>
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>{progress} / {threshold}</span>
                            <span>{progressPercentage.toFixed(0)}%</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  
                {filteredBadges.filter((badge) => {
                  const achievement = getAchievement(badge._id);
                  return !achievement?.isCompleted && (achievement?.progress || 0) > 0;
                }).length === 0 && (
                  <div className="text-center py-4">
                    <p className="text-sm text-gray-500">Complete challenges to unlock badges</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-9">
            
            {/* Filters - Mobile Optimized */}
            <div className="mb-6 space-y-4">
              {/* Tab Filters */}
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                <button
                  onClick={() => setActiveTab('all')}
                  className={`flex-shrink-0 px-4 sm:px-6 py-2.5 sm:py-3 font-medium rounded-xl transition-all duration-200 flex items-center gap-2 ${
                    activeTab === 'all'
                      ? 'bg-gradient-to-r from-violet-500 to-fuchsia-600 text-white shadow-lg'
                      : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200 shadow-sm'
                  }`}
                >
                  <Award className="w-4 h-4" />
                  <span className="text-sm sm:text-base">All Badges</span>
                </button>
                <button
                  onClick={() => setActiveTab('earned')}
                  className={`flex-shrink-0 px-4 sm:px-6 py-2.5 sm:py-3 font-medium rounded-xl transition-all duration-200 flex items-center gap-2 ${
                    activeTab === 'earned'
                      ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg'
                      : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200 shadow-sm'
                  }`}
                >
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm sm:text-base">Earned ({earnedCount})</span>
                </button>
                <button
                  onClick={() => setActiveTab('locked')}
                  className={`flex-shrink-0 px-4 sm:px-6 py-2.5 sm:py-3 font-medium rounded-xl transition-all duration-200 flex items-center gap-2 ${
                    activeTab === 'locked'
                      ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg'
                      : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200 shadow-sm'
                  }`}
                >
                  <Lock className="w-4 h-4" />
                  <span className="text-sm sm:text-base">Locked ({totalCount - earnedCount})</span>
                </button>
              </div>

              {/* Category Filters */}
              <div className="flex items-start gap-2 sm:gap-3">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-700 pt-2 flex-shrink-0">
                  <Filter className="w-4 h-4" />
                  <span className="hidden sm:inline">Category:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className={`px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-lg transition-all ${
                      selectedCategory === 'all'
                        ? 'bg-violet-600 text-white shadow-md'
                        : 'bg-white text-gray-600 border border-gray-200 hover:border-violet-300'
                    }`}
                  >
                    All
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-lg transition-all ${
                        selectedCategory === cat
                          ? 'bg-violet-600 text-white shadow-md'
                          : 'bg-white text-gray-600 border border-gray-200 hover:border-violet-300'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Badges Grid */}
            {loading ? (
              <div className="flex justify-center items-center py-16 sm:py-24">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-4 border-violet-200 border-t-violet-600 mx-auto mb-4"></div>
                  <p className="text-gray-600 text-sm">Loading badges...</p>
                </div>
              </div>
            ) : filteredBadges.length === 0 ? (
              <Card className="border-0 shadow-lg bg-white">
                <CardContent className="p-12 sm:p-16 text-center">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-violet-100 to-fuchsia-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Award className="w-10 h-10 sm:w-12 sm:h-12 text-violet-600" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">No Badges Found</h3>
                  <p className="text-gray-600 max-w-md mx-auto">
                    Try adjusting your filters or start learning to unlock new badges!
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">{filteredBadges.map((badge) => {
                  const achievement = getAchievement(badge._id);
                  const isEarned = achievement?.isCompleted;
                  const progress = achievement?.progress || 0;
                  const threshold = badge.criteria?.threshold || 100;
                  const progressPercentage = Math.min((progress / threshold) * 100, 100);

                  // Rarity colors
                  const rarityConfig = {
                    legendary: {
                      gradient: 'from-yellow-400 via-orange-500 to-red-600',
                      glow: 'shadow-yellow-500/50',
                      text: 'text-yellow-600',
                    },
                    epic: {
                      gradient: 'from-purple-500 via-pink-500 to-fuchsia-600',
                      glow: 'shadow-purple-500/50',
                      text: 'text-purple-600',
                    },
                    rare: {
                      gradient: 'from-blue-500 via-cyan-500 to-teal-600',
                      glow: 'shadow-blue-500/50',
                      text: 'text-blue-600',
                    },
                    common: {
                      gradient: 'from-gray-400 to-gray-600',
                      glow: 'shadow-gray-500/50',
                      text: 'text-gray-600',
                    },
                  };

                  const rarity = badge.rarity || 'common';
                  const config = rarityConfig[rarity as keyof typeof rarityConfig] || rarityConfig.common;

                  return (
                    <Card
                      key={badge._id}
                      className={`group relative overflow-hidden border-0 shadow-lg transition-all duration-300 ${
                        isEarned
                          ? 'hover:shadow-2xl hover:-translate-y-2 bg-gradient-to-br from-white to-violet-50'
                          : 'opacity-75 hover:opacity-100'
                      }`}
                    >
                      {/* Background decoration */}
                      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-violet-500/10 to-fuchsia-600/10 rounded-bl-full -z-10"></div>
                      
                      {/* Rarity Badge */}
                      {badge.rarity && (
                        <div
                          className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r ${config.gradient} text-white shadow-lg ${isEarned ? config.glow : ''}`}
                        >
                          {badge.rarity.toUpperCase()}
                        </div>
                      )}

                      <CardContent className="p-6 text-center">
                        {/* Badge Icon with Animation */}
                        <div className="relative inline-block mb-4">
                          <div
                            className={`w-24 h-24 sm:w-28 sm:h-28 rounded-2xl flex items-center justify-center bg-gradient-to-br ${
                              isEarned ? config.gradient : 'from-gray-300 to-gray-400'
                            } text-white text-4xl sm:text-5xl shadow-xl transition-all duration-300 ${
                              isEarned ? 'group-hover:scale-110 group-hover:rotate-12' : 'grayscale'
                            }`}
                          >
                            {badge.icon || '🏆'}
                          </div>
                          
                          {/* Lock Overlay */}
                          {!isEarned && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-2xl backdrop-blur-sm">
                              <Lock className="w-10 h-10 text-white drop-shadow-lg" />
                            </div>
                          )}
                          
                          {/* Sparkle Effect for Earned */}
                          {isEarned && (
                            <div className="absolute -top-2 -right-2">
                              <Sparkles className="w-6 h-6 text-yellow-500 animate-pulse" />
                            </div>
                          )}
                        </div>

                        {/* Badge Name & Description */}
                        <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 line-clamp-1">
                          {badge.name}
                        </h3>
                        <p className="text-sm text-gray-600 mb-4 line-clamp-2 min-h-[40px]">
                          {badge.description}
                        </p>

                        {/* Requirements Section */}
                        <div className="mb-4 p-3 bg-gradient-to-r from-violet-50 to-fuchsia-50 rounded-xl">
                          <div className="text-xs font-semibold text-violet-600 mb-1 uppercase tracking-wide">
                            {badge.criteria?.type === 'streak' && '🔥 Streak Challenge'}
                            {badge.criteria?.type === 'lessons_completed' && '📚 Lessons Goal'}
                            {badge.criteria?.type === 'quiz_perfect' && '✨ Perfect Scores'}
                            {badge.criteria?.type === 'xp_milestone' && '⚡ XP Milestone'}
                            {badge.criteria?.type === 'flashcard_mastered' && '🎯 Flashcard Master'}
                            {!badge.criteria?.type && '🎯 Challenge'}
                          </div>
                          <div className="text-base sm:text-lg font-bold text-gray-900">
                            {progress.toLocaleString()} / {threshold.toLocaleString()}
                          </div>
                          
                          {/* Progress Bar */}
                          {!isEarned && progress > 0 && (
                            <div className="mt-3">
                              <div className="h-2.5 bg-white rounded-full overflow-hidden shadow-inner">
                                <div
                                  className={`h-full bg-gradient-to-r ${config.gradient} transition-all duration-500`}
                                  style={{ width: `${progressPercentage}%` }}
                                />
                              </div>
                              <p className="text-xs text-gray-600 mt-2 font-medium">
                                {progressPercentage.toFixed(0)}% Complete • {threshold - progress} to go
                              </p>
                            </div>
                          )}
                        </div>

                        {/* XP Reward */}
                        {badge.xpReward > 0 && (
                          <div className="mb-4 p-3 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl border border-yellow-200">
                            <p className="text-sm text-yellow-700 font-bold flex items-center justify-center gap-2">
                              <Gift className="w-4 h-4" />
                              <span>+{badge.xpReward} XP Reward</span>
                            </p>
                          </div>
                        )}

                        {/* Status Footer */}
                        {isEarned && achievement ? (
                          <div className="pt-4 border-t border-violet-100">
                            <div className="flex items-center justify-center gap-2 text-sm text-green-600 font-semibold">
                              <CheckCircle className="w-5 h-5" />
                              <span>Earned {new Date(achievement.earnedAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        ) : (
                          <div className="pt-4 border-t border-gray-200">
                            <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                              <Lock className="w-4 h-4" />
                              <span className="font-medium">
                                {progress > 0 
                                  ? `${threshold - progress} more to unlock!` 
                                  : 'Start your journey to unlock'}
                              </span>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Custom Scrollbar Styles */}
      <style jsx global>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}