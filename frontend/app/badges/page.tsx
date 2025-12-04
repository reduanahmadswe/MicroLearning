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
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { badgesAPI } from '@/services/api.service';
import { toast } from 'sonner';
import { Badge } from '@/types';

export default function BadgesPage() {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [userBadges, setUserBadges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'earned' | 'locked'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = ['Learning', 'Social', 'Achievements', 'Milestones', 'Special'];

  useEffect(() => {
    loadBadges();
    loadUserBadges();
  }, []);

  const loadBadges = async () => {
    try {
      const response = await badgesAPI.getBadges();
      setBadges(response.data.data || []);
    } catch (error: any) {
      toast.error('Failed to load badges');
      console.error(error);
    }
  };

  const loadUserBadges = async () => {
    try {
      setLoading(true);
      const response = await badgesAPI.getUserBadges();
      setUserBadges(response.data.data || []);
    } catch (error: any) {
      toast.error('Failed to load your badges');
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

  const earnedBadgeIds = userBadges.map((ub) => ub.badge?._id || ub.badgeId);

  const filteredBadges = badges.filter((badge) => {
    if (selectedCategory !== 'all' && badge.category !== selectedCategory) return false;
    
    const isEarned = earnedBadgeIds.includes(badge._id);
    if (activeTab === 'earned' && !isEarned) return false;
    if (activeTab === 'locked' && isEarned) return false;
    
    return true;
  });

  const earnedCount = badges.filter((b) => earnedBadgeIds.includes(b._id)).length;
  const totalCount = badges.length;
  const completionPercentage = totalCount > 0 ? (earnedCount / totalCount) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Award className="w-8 h-8 text-purple-600" />
            Badges & Achievements
          </h1>
          <p className="text-gray-600 mt-1">Track your learning milestones</p>
        </div>
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Stats Sidebar */}
          <div className="space-y-6">
            {/* Progress Card */}
            <Card className="bg-gradient-to-br from-purple-600 to-pink-600 text-white">
              <CardHeader>
                <CardTitle className="text-white">Your Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-4">
                  <div className="text-5xl font-bold mb-2">
                    {earnedCount}
                  </div>
                  <p className="text-white/90">out of {totalCount} badges</p>
                </div>
                <div className="mb-2">
                  <div className="h-3 bg-white/20 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-white rounded-full transition-all"
                      style={{ width: `${completionPercentage}%` }}
                    />
                  </div>
                </div>
                <p className="text-center text-sm text-white/90">
                  {completionPercentage.toFixed(0)}% Complete
                </p>
              </CardContent>
            </Card>

            {/* Recent Achievements */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Achievements</CardTitle>
              </CardHeader>
              <CardContent>
                {userBadges.slice(0, 5).map((userBadge) => {
                  const badge = userBadge.badge;
                  if (!badge) return null;
                  
                  return (
                    <div key={userBadge._id} className="flex items-center gap-3 mb-3 last:mb-0">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center ${badge.color || 'bg-gradient-to-br from-purple-500 to-pink-500'} text-white`}
                      >
                        {getBadgeIcon(badge.icon || 'award')}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {badge.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(userBadge.earnedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Badge Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="text-sm font-medium text-gray-700">Earned</span>
                  </div>
                  <span className="text-lg font-bold text-green-600">{earnedCount}</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Lock className="w-5 h-5 text-orange-600" />
                    <span className="text-sm font-medium text-gray-700">Locked</span>
                  </div>
                  <span className="text-lg font-bold text-orange-600">
                    {totalCount - earnedCount}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-blue-600" />
                    <span className="text-sm font-medium text-gray-700">Rarity</span>
                  </div>
                  <span className="text-lg font-bold text-blue-600">
                    {userBadges.filter((b) => b.badge?.rarity === 'legendary').length}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Tabs & Filters */}
            <div className="mb-6 space-y-4">
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={activeTab === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setActiveTab('all')}
                >
                  All Badges
                </Button>
                <Button
                  variant={activeTab === 'earned' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setActiveTab('earned')}
                >
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Earned ({earnedCount})
                </Button>
                <Button
                  variant={activeTab === 'locked' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setActiveTab('locked')}
                >
                  <Lock className="w-4 h-4 mr-1" />
                  Locked ({totalCount - earnedCount})
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">Category:</span>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={selectedCategory === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCategory('all')}
                  >
                    All
                  </Button>
                  {categories.map((cat) => (
                    <Button
                      key={cat}
                      variant={selectedCategory === cat ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedCategory(cat)}
                    >
                      {cat}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            {/* Badges Grid */}
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
              </div>
            ) : filteredBadges.length === 0 ? (
              <Card className="p-12 text-center">
                <Award className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No badges found</h3>
                <p className="text-gray-600">Try changing your filters</p>
              </Card>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredBadges.map((badge) => {
                  const isEarned = earnedBadgeIds.includes(badge._id);
                  const userBadge = userBadges.find(
                    (ub) => (ub.badge?._id || ub.badgeId) === badge._id
                  );

                  return (
                    <Card
                      key={badge._id}
                      className={`relative overflow-hidden transition-all ${
                        isEarned
                          ? 'hover:shadow-2xl hover:-translate-y-1 bg-gradient-to-br from-white to-purple-50'
                          : 'opacity-70 hover:opacity-100'
                      }`}
                    >
                      {/* Rarity indicator */}
                      {badge.rarity && (
                        <div
                          className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-bold ${
                            badge.rarity === 'legendary'
                              ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white'
                              : badge.rarity === 'epic'
                              ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                              : badge.rarity === 'rare'
                              ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
                              : 'bg-gray-200 text-gray-700'
                          }`}
                        >
                          {badge.rarity}
                        </div>
                      )}

                      <CardContent className="p-6 text-center">
                        {/* Badge Icon */}
                        <div className="relative inline-block mb-4">
                          <div
                            className={`w-24 h-24 rounded-full flex items-center justify-center ${
                              badge.color || 'bg-gradient-to-br from-purple-500 to-pink-500'
                            } text-white p-5 ${isEarned ? '' : 'grayscale'}`}
                          >
                            {getBadgeIcon(badge.icon || 'award')}
                          </div>
                          {!isEarned && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <Lock className="w-8 h-8 text-gray-400" />
                            </div>
                          )}
                        </div>

                        {/* Badge Info */}
                        <h3 className="text-lg font-bold text-gray-900 mb-2">
                          {badge.name}
                        </h3>
                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                          {badge.description}
                        </p>

                        {/* Requirements */}
                        <div className="mb-4">
                          <div className="text-xs font-medium text-gray-500 mb-2">
                            Requirements:
                          </div>
                          <div className="space-y-1">
                            {badge.criteria?.xpRequired && (
                              <div className="text-sm text-gray-700">
                                <Zap className="w-3 h-3 inline mr-1 text-yellow-500" />
                                {badge.criteria.xpRequired} XP
                              </div>
                            )}
                            {badge.criteria?.lessonsCompleted && (
                              <div className="text-sm text-gray-700">
                                <BookOpen className="w-3 h-3 inline mr-1 text-blue-500" />
                                {badge.criteria.lessonsCompleted} Lessons
                              </div>
                            )}
                            {badge.criteria?.streakDays && (
                              <div className="text-sm text-gray-700">
                                <Flame className="w-3 h-3 inline mr-1 text-orange-500" />
                                {badge.criteria.streakDays} Day Streak
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Earned Status */}
                        {isEarned && userBadge && (
                          <div className="pt-4 border-t border-gray-200">
                            <p className="text-xs text-green-600 font-medium flex items-center justify-center gap-1">
                              <CheckCircle className="w-4 h-4" />
                              Earned on {new Date(userBadge.earnedAt).toLocaleDateString()}
                            </p>
                          </div>
                        )}

                        {!isEarned && (
                          <div className="pt-4 border-t border-gray-200">
                            <p className="text-xs text-gray-500 flex items-center justify-center gap-1">
                              <Lock className="w-4 h-4" />
                              Keep learning to unlock
                            </p>
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
    </div>
  );
}
