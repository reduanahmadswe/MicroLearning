'use client';

import { useEffect, useState } from 'react';
import { Award, Trophy, Lock, TrendingUp, Sparkles, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { badgesAPI } from '@/services/api.service';
import { toast } from 'sonner';

interface Badge {
  _id: string;
  name: string;
  description: string;
  icon: string;
  criteria: { type: string; threshold: number; topic?: string };
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  xpReward: number;
}

export default function BadgesPage() {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'earned' | 'locked'>('all');
  const [selectedRarity, setSelectedRarity] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [badgesRes, achievementsRes] = await Promise.all([badgesAPI.getBadges(), badgesAPI.getUserAchievements()]);
      setBadges(badgesRes.data.data || []);
      setAchievements(achievementsRes.data.data || []);
    } catch (error: any) {
      toast.error('Failed to load badges');
    } finally {
      setLoading(false);
    }
  };

  const getAchievement = (badgeId: string) => achievements.find((a) => a.badge?._id === badgeId);

  const getRarityColor = (rarity: string) => ({
    common: 'from-gray-400 to-gray-600',
    rare: 'from-blue-400 to-blue-600',
    epic: 'from-purple-400 to-purple-600',
    legendary: 'from-yellow-400 to-orange-600',
  }[rarity] || 'from-gray-400 to-gray-600');

  const getRarityBadge = (rarity: string) => ({
    common: 'bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-800/50 dark:text-gray-300 dark:border-gray-700',
    rare: 'bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700',
    epic: 'bg-purple-100 text-purple-700 border-purple-300 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-700',
    legendary: 'bg-gradient-to-r from-yellow-100 to-orange-100 text-orange-700 border-orange-300 dark:from-yellow-900/30 dark:to-orange-900/30 dark:text-orange-300 dark:border-orange-700',
  }[rarity] || 'bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-800/50 dark:text-gray-300 dark:border-gray-700');

  const filteredBadges = badges.filter((badge) => {
    if (selectedRarity !== 'all' && badge.rarity !== selectedRarity) return false;
    const achievement = getAchievement(badge._id);
    const isEarned = achievement?.isCompleted;
    if (activeTab === 'earned' && !isEarned) return false;
    if (activeTab === 'locked' && isEarned) return false;
    return true;
  });

  // Calculate pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredBadges.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredBadges.length / itemsPerPage);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, selectedRarity]);

  const earnedCount = achievements.filter(a => a.isCompleted).length;
  const totalCount = badges.length;
  const completionPercentage = totalCount > 0 ? Math.round((earnedCount / totalCount) * 100) : 0;

  const statsCards = [
    { title: 'Total Badges', value: totalCount, icon: Trophy, color: 'text-green-600 dark:text-green-400', bgColor: 'bg-green-50 dark:bg-green-900/20' },
    { title: 'Earned', value: earnedCount, icon: Award, color: 'text-teal-600 dark:text-teal-400', bgColor: 'bg-teal-50 dark:bg-teal-900/20' },
    { title: 'In Progress', value: achievements.filter(a => !a.isCompleted && a.progress > 0).length, icon: TrendingUp, color: 'text-emerald-600 dark:text-emerald-400', bgColor: 'bg-emerald-50 dark:bg-emerald-900/20' },
    { title: 'Locked', value: totalCount - earnedCount, icon: Lock, color: 'text-gray-600 dark:text-gray-400', bgColor: 'bg-gray-50 dark:bg-gray-800/50' },
  ];

  return (
    <div className="min-h-screen bg-page-gradient py-6 sm:py-8 scroll-smooth">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-2 flex items-center gap-2 sm:gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-green-500 to-teal-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow">
              <Trophy className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
            </div>
            Badges & Achievements
          </h1>
          <p className="text-muted-foreground text-xs sm:text-sm lg:text-base ml-12 sm:ml-14 lg:ml-16">Collect badges, earn rewards, and showcase your learning journey</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
          {statsCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="hover:shadow-xl hover:scale-105 transition-all duration-300 bg-card border-border">
                <CardContent className="p-3 sm:p-4 lg:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div className="flex-1">
                      <p className="text-[10px] sm:text-xs lg:text-sm text-muted-foreground mb-1">{stat.title}</p>
                      <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">{stat.value}</p>
                    </div>
                    <div className={`${stat.bgColor} p-2 sm:p-2.5 lg:p-3 rounded-lg self-end sm:self-auto`}>
                      <Icon className={`w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card className="mb-6 sm:mb-8 bg-gradient-to-br from-green-50 to-teal-50 dark:from-green-900/10 dark:to-teal-900/10 border-2 border-green-200 dark:border-green-800 shadow-lg hover:shadow-xl transition-shadow">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex-1">
                <h3 className="text-base sm:text-lg font-bold text-foreground mb-2 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-500" />
                  Overall Progress
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">You&apos;ve earned {earnedCount} out of {totalCount} badges</p>
                <div className="w-full bg-background/50 rounded-full h-2.5 sm:h-3 overflow-hidden shadow-inner">
                  <div className="h-full bg-gradient-to-r from-green-400 to-teal-500 transition-all duration-1000 rounded-full shadow-sm" style={{ width: `${completionPercentage}%` }} />
                </div>
                <p className="text-[10px] sm:text-xs text-muted-foreground mt-2">{completionPercentage}% Complete</p>
              </div>
              <div className="text-center sm:ml-4">
                <div className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-teal-600">{completionPercentage}%</div>
                <p className="text-[10px] sm:text-xs text-gray-600 mt-1">Completion</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-thin scrollbar-thumb-green-300 scrollbar-track-transparent">
              {[{ key: 'all', label: 'All Badges', icon: Trophy }, { key: 'earned', label: 'Earned', icon: Award }, { key: 'locked', label: 'Locked', icon: Lock }].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button key={tab.key} onClick={() => setActiveTab(tab.key as any)}
                    className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg font-medium text-xs sm:text-sm transition-all duration-300 whitespace-nowrap ${activeTab === tab.key ? 'bg-gradient-to-r from-green-500 to-teal-500 text-white shadow-lg scale-105' : 'bg-card text-muted-foreground hover:bg-accent hover:scale-105 border border-border'}`}>
                    <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">{tab.label}</span>
                    <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
                  </button>
                );
              })}
            </div>
            <select value={selectedRarity} onChange={(e) => setSelectedRarity(e.target.value)}
              className="px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg border-2 border-border bg-card text-xs sm:text-sm font-medium text-foreground hover:bg-accent hover:border-green-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300">
              <option value="all">All Rarities</option>
              <option value="common">Common</option>
              <option value="rare">Rare</option>
              <option value="epic">Epic</option>
              <option value="legendary">Legendary</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12 sm:py-16">
            <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-b-4 border-green-500 mx-auto mb-3 sm:mb-4"></div>
            <p className="text-sm sm:text-base text-muted-foreground">Loading badges...</p>
          </div>
        ) : filteredBadges.length === 0 ? (
          <Card className="text-center py-12 sm:py-16 bg-card border-border shadow-lg">
            <CardContent>
              <Lock className="w-12 h-12 sm:w-16 sm:h-16 text-muted-foreground mx-auto mb-3 sm:mb-4" />
              <h3 className="text-lg sm:text-xl font-bold text-foreground mb-2">No Badges Found</h3>
              <p className="text-xs sm:text-base text-muted-foreground px-4">{activeTab === 'earned' ? "You haven't earned any badges yet. Keep learning!" : activeTab === 'locked' ? 'All badges are unlocked! Great job!' : 'No badges available at the moment.'}</p>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
              {currentItems.map((badge) => {
                const achievement = getAchievement(badge._id);
                const isEarned = achievement?.isCompleted;
                const progress = achievement?.progress || 0;
                const threshold = badge.criteria.threshold;
                const progressPercentage = threshold > 0 ? Math.min((progress / threshold) * 100, 100) : 0;

                return (
                  <Card key={badge._id} className={`group hover:shadow-xl hover:scale-105 transition-all duration-300 bg-card border-2 ${isEarned ? 'border-green-300 dark:border-green-800 hover:border-green-400' : 'border-border hover:border-accent opacity-75'}`}>
                    <CardContent className="p-4 sm:p-5 lg:p-6">
                      <div className={`relative mb-3 sm:mb-4 ${!isEarned && 'grayscale'}`}>
                        <div className={`w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-xl sm:rounded-2xl bg-gradient-to-br ${getRarityColor(badge.rarity)} p-3 sm:p-4 shadow-lg ${isEarned ? 'group-hover:scale-110 group-hover:rotate-6' : ''} transition-all duration-300`}>
                          {badge.icon && badge.icon.startsWith('http') ? (<img src={badge.icon} alt={badge.name} className="w-full h-full object-contain" />) : (<Award className="w-full h-full text-white" />)}
                        </div>
                        {!isEarned && (<div className="absolute inset-0 flex items-center justify-center"><div className="w-7 h-7 sm:w-8 sm:h-8 bg-gray-900/80 rounded-full flex items-center justify-center"><Lock className="w-4 h-4 sm:w-5 sm:h-5 text-white" /></div></div>)}
                        {isEarned && (<div className="absolute -top-2 -right-2"><div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-lg animate-pulse"><Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-white" /></div></div>)}
                      </div>
                      <div className="text-center mb-3 sm:mb-4">
                        <h3 className="font-bold text-base sm:text-lg text-foreground mb-1 line-clamp-1">{badge.name}</h3>
                        <p className="text-[10px] sm:text-xs text-muted-foreground line-clamp-2 mb-2 sm:mb-3">{badge.description}</p>
                        <div className="flex items-center justify-center gap-1.5 sm:gap-2 mb-2 sm:mb-3 flex-wrap">
                          <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-semibold border ${getRarityBadge(badge.rarity)}`}>{badge.rarity.charAt(0).toUpperCase() + badge.rarity.slice(1)}</span>
                          {badge.xpReward > 0 && (<span className="px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-semibold bg-purple-100 text-purple-700 border border-purple-300 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-700">+{badge.xpReward} XP</span>)}
                        </div>
                      </div>
                      {!isEarned && achievement && progress > 0 && (
                        <div className="mb-2 sm:mb-3">
                          <div className="flex items-center justify-between text-[10px] sm:text-xs text-muted-foreground mb-1">
                            <span>Progress</span>
                            <span className="font-semibold">{progress}/{threshold}</span>
                          </div>
                          <div className="w-full bg-secondary rounded-full h-1.5 sm:h-2 overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-green-400 to-teal-500 transition-all duration-500" style={{ width: `${progressPercentage}%` }} />
                          </div>
                        </div>
                      )}
                      {isEarned && achievement?.earnedAt && (<div className="text-center"><p className="text-[10px] sm:text-xs text-muted-foreground">Earned on {new Date(achievement.earnedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p></div>)}
                      {!isEarned && (!achievement || progress === 0) && (<div className="text-center"><p className="text-[10px] sm:text-xs text-muted-foreground">Complete {threshold} {badge.criteria.type.replace(/_/g, ' ')}</p></div>)}
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-8">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-border bg-card text-foreground hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  aria-label="Previous page"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <span className="text-sm font-medium text-muted-foreground">
                  Page <span className="text-foreground">{currentPage}</span> of {totalPages}
                </span>

                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border border-border bg-card text-foreground hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  aria-label="Next page"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

