'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Trophy,
  Medal,
  Award,
  TrendingUp,
  Users,
  Target,
  Crown,
  Zap,
  Star,
  ChevronRight,
  Flame,
  BookOpen,
  Brain,
  Calendar,
  Filter,
  Sparkles,
  ArrowUp,
  ArrowDown,
  Minus,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { leaderboardAPI } from '@/services/api.service';
import { toast } from 'sonner';

interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  profilePicture?: string;
  xp: number;
  level: number;
  streak: number;
  lessonsCompleted?: number;
}

export default function LeaderboardPage() {
  const [activeTab, setActiveTab] = useState<'global' | 'friends' | 'topic'>('global');
  const [globalLeaderboard, setGlobalLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [friendsLeaderboard, setFriendsLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [topicLeaderboard, setTopicLeaderboard] = useState<any[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<string>('Programming');
  const [timeRange, setTimeRange] = useState<'daily' | 'weekly' | 'monthly' | 'allTime'>('weekly');
  const [userRank, setUserRank] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const topics = ['Programming', 'Mathematics', 'Science', 'Business', 'Language', 'Design'];

  useEffect(() => {
    setCurrentPage(1);
    loadLeaderboard();
  }, [activeTab, timeRange, selectedTopic]);

  const loadLeaderboard = async () => {
    try {
      setLoading(true);

      if (activeTab === 'global') {
        const [leaderboardRes, rankRes] = await Promise.all([
          leaderboardAPI.getGlobalLeaderboard({
            timeframe: timeRange,
            limit: 100
          }),
          leaderboardAPI.getMyRank().catch(() => null)
        ]);

        setGlobalLeaderboard(leaderboardRes.data.data || []);
        if (rankRes?.data.data) {
          setUserRank(rankRes.data.data);
        }
      } else if (activeTab === 'friends') {
        const response = await leaderboardAPI.getFriendsLeaderboard(timeRange);
        setFriendsLeaderboard(response.data.data || []);
        setUserRank(response.data.data?.userRank);
      } else if (activeTab === 'topic') {
        const response = await leaderboardAPI.getTopicLeaderboard(selectedTopic, timeRange);
        setTopicLeaderboard(response.data.data || []);
        setUserRank(response.data.data?.userRank);
      }
    } catch (error: any) {
      toast.error('Failed to load leaderboard');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-500 fill-yellow-500" />;
    if (rank === 2) return <Medal className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400 fill-gray-400" />;
    if (rank === 3) return <Medal className="w-5 h-5 sm:w-6 sm:h-6 text-amber-700 fill-amber-700" />;
    return <span className="text-sm sm:text-base font-bold text-gray-600">#{rank}</span>;
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white shadow-xl';
    if (rank === 2) return 'bg-gradient-to-r from-gray-300 to-gray-500 text-white shadow-lg';
    if (rank === 3) return 'bg-gradient-to-r from-amber-600 to-amber-800 text-white shadow-lg';
    return 'bg-card border border-border hover:shadow-md hover:border-green-200 dark:hover:border-green-800';
  };

  const getTrendIcon = () => {
    // Mock trend data - in real app, this would come from API
    const trend = Math.random();
    if (trend > 0.6) return <ArrowUp className="w-4 h-4 text-green-600" />;
    if (trend < 0.4) return <ArrowDown className="w-4 h-4 text-red-600" />;
    return <Minus className="w-4 h-4 text-gray-400" />;
  };

  const allLeaderboard =
    activeTab === 'global' ? globalLeaderboard :
      activeTab === 'friends' ? friendsLeaderboard :
        topicLeaderboard;

  // Pagination
  const totalPages = Math.ceil(allLeaderboard.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentLeaderboard = allLeaderboard.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-page-gradient">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-4 sm:py-6 lg:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-green-700 via-teal-600 to-emerald-600 bg-clip-text text-transparent flex items-center gap-2 sm:gap-3">
                <Trophy className="w-7 h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-green-600" />
                Leaderboard
              </h1>
              <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">
                Compete with learners worldwide and climb the ranks
              </p>
            </div>

            {/* Quick Stats - Mobile */}
            <div className="flex gap-2 sm:hidden">
              <div className="flex-1 bg-card rounded-lg p-3 shadow-sm border border-green-100 dark:border-green-900/30">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-green-600" />
                  <div>
                    <p className="text-xs text-muted-foreground">Total</p>
                    <p className="text-lg font-bold text-foreground">{allLeaderboard.length}</p>
                  </div>
                </div>
              </div>
              {userRank && (
                <div className="flex-1 bg-gradient-to-br from-green-600 to-teal-600 rounded-lg p-3 shadow-md">
                  <div className="flex items-center gap-2">
                    <Crown className="w-4 h-4 text-white" />
                    <div>
                      <p className="text-xs text-white/80">Your Rank</p>
                      <p className="text-lg font-bold text-white">#{userRank.rank}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <button
              onClick={() => setActiveTab('global')}
              className={`flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-2.5 font-medium rounded-lg transition-all whitespace-nowrap flex-shrink-0 ${activeTab === 'global'
                ? 'bg-gradient-to-r from-green-600 to-teal-600 text-white shadow-md'
                : 'bg-card text-muted-foreground hover:bg-secondary border border-border'
                }`}
            >
              <Trophy className="w-4 h-4" />
              <span className="text-sm sm:text-base">Global</span>
            </button>
            <button
              onClick={() => setActiveTab('friends')}
              className={`flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-2.5 font-medium rounded-lg transition-all whitespace-nowrap flex-shrink-0 ${activeTab === 'friends'
                ? 'bg-gradient-to-r from-green-600 to-teal-600 text-white shadow-md'
                : 'bg-card text-muted-foreground hover:bg-secondary border border-border'
                }`}
            >
              <Users className="w-4 h-4" />
              <span className="text-sm sm:text-base">Friends</span>
            </button>
            <button
              onClick={() => setActiveTab('topic')}
              className={`flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-2.5 font-medium rounded-lg transition-all whitespace-nowrap flex-shrink-0 ${activeTab === 'topic'
                ? 'bg-gradient-to-r from-green-600 to-teal-600 text-white shadow-md'
                : 'bg-card text-muted-foreground hover:bg-secondary border border-border'
                }`}
            >
              <Target className="w-4 h-4" />
              <span className="text-sm sm:text-base">By Topic</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            {/* Time Range Filter */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">Time Period</span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {(['daily', 'weekly', 'monthly', 'allTime'] as const).map((range) => (
                  <button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={`px-3 py-2 text-xs sm:text-sm font-medium rounded-lg transition-all ${timeRange === range
                      ? 'bg-gradient-to-r from-green-600 to-teal-600 text-white shadow-sm'
                      : 'bg-card text-muted-foreground hover:bg-secondary border border-border'
                      }`}
                  >
                    {range === 'daily' && 'Daily'}
                    {range === 'weekly' && 'Weekly'}
                    {range === 'monthly' && 'Monthly'}
                    {range === 'allTime' && 'All Time'}
                  </button>
                ))}
              </div>
            </div>

            {/* Topic Filter */}
            {activeTab === 'topic' && (
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Filter className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-muted-foreground">Topic</span>
                </div>
                <select
                  value={selectedTopic}
                  onChange={(e) => setSelectedTopic(e.target.value)}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg text-sm font-medium text-foreground hover:border-green-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 dark:focus:ring-green-900/30 transition-all"
                >
                  {topics.map((topic) => (
                    <option key={topic} value={topic}>
                      {topic}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Main Leaderboard */}
          <div className="lg:col-span-2">
            <Card className="shadow-lg border-0 bg-card">
              <CardHeader className="bg-gradient-to-r from-green-50 to-teal-50 dark:from-green-900/10 dark:to-teal-900/10 border-b border-border">
                <CardTitle className="flex items-center justify-between text-base sm:text-lg">
                  <span className="flex items-center gap-2 text-foreground">
                    <Sparkles className="w-5 h-5 text-green-600" />
                    Top Rankings
                  </span>
                  <span className="text-xs sm:text-sm font-normal text-muted-foreground bg-background px-3 py-1 rounded-full">
                    {allLeaderboard.length} participants
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 sm:p-6">
                {loading ? (
                  <div className="flex flex-col justify-center items-center py-16 sm:py-20">
                    <div className="relative">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 border-4 border-green-100 dark:border-green-900/30 border-t-green-600 rounded-full animate-spin"></div>
                      <Trophy className="w-6 h-6 sm:w-8 sm:h-8 text-green-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                    </div>
                    <p className="text-sm text-muted-foreground mt-4">Loading rankings...</p>
                  </div>
                ) : currentLeaderboard.length === 0 ? (
                  <div className="text-center py-12 sm:py-16">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-green-100 to-teal-100 dark:from-green-900/30 dark:to-teal-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Trophy className="w-10 h-10 sm:w-12 sm:h-12 text-green-600" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-foreground mb-2">
                      No rankings yet
                    </h3>
                    <p className="text-sm sm:text-base text-muted-foreground mb-6">
                      Be the first to earn points and claim your spot!
                    </p>
                    <Link href="/dashboard">
                      <Button className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700">
                        Start Learning
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-2 sm:space-y-3">
                    {currentLeaderboard.map((entry: any, index: number) => {
                      const actualRank = entry.rank || (startIndex + index + 1);
                      const isTopThree = actualRank <= 3;

                      return (
                        <div
                          key={entry.userId || index}
                          className={`flex items-center gap-2 sm:gap-4 p-3 sm:p-4 rounded-xl transition-all ${getRankBadge(actualRank)
                            }`}
                        >
                          {/* Rank */}
                          <div className="flex items-center justify-center w-8 sm:w-12 flex-shrink-0">
                            {getRankIcon(actualRank)}
                          </div>

                          {/* Avatar */}
                          <Link
                            href={`/profile/${entry.userId}`}
                            className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-white font-bold hover:ring-4 transition-all cursor-pointer flex-shrink-0 ${isTopThree
                              ? 'bg-gradient-to-br from-green-600 to-teal-600 hover:ring-green-300'
                              : 'bg-gradient-to-br from-gray-400 to-gray-600 hover:ring-gray-300'
                              }`}
                          >
                            {entry.profilePicture ? (
                              <img
                                src={entry.profilePicture}
                                alt={entry.name}
                                className="w-full h-full rounded-full object-cover"
                              />
                            ) : (
                              <span className="text-sm sm:text-base">
                                {entry.name?.charAt(0).toUpperCase() || '?'}
                              </span>
                            )}
                          </Link>

                          {/* User Info */}
                          <div className="flex-1 min-w-0">
                            <Link
                              href={`/profile/${entry.userId}`}
                              className={`font-semibold hover:underline cursor-pointer text-sm sm:text-base truncate block ${isTopThree ? 'text-white' : 'text-foreground'
                                }`}
                            >
                              {entry.name || 'Anonymous'}
                            </Link>
                            <div className={`flex items-center gap-2 sm:gap-3 text-xs sm:text-sm flex-wrap ${isTopThree ? 'text-white/90' : 'text-muted-foreground'
                              }`}>
                              <span className="flex items-center gap-1">
                                <Zap className="w-3 h-3" />
                                Lvl {entry.level || 1}
                              </span>
                              {entry.streak > 0 && (
                                <span className="flex items-center gap-1">
                                  <Flame className="w-3 h-3" />
                                  {entry.streak}d
                                </span>
                              )}
                              {entry.lessonsCompleted > 0 && (
                                <span className="hidden sm:flex items-center gap-1">
                                  <BookOpen className="w-3 h-3" />
                                  {entry.lessonsCompleted}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* XP & Trend */}
                          <div className="text-right flex-shrink-0">
                            <div className="flex items-center gap-1 justify-end">
                              <p className={`text-lg sm:text-2xl font-bold ${isTopThree ? 'text-white' : 'text-foreground'
                                }`}>
                                {entry.xp?.toLocaleString() || 0}
                              </p>
                              {!isTopThree && getTrendIcon()}
                            </div>
                            <p className={`text-xs sm:text-sm ${isTopThree ? 'text-white/80' : 'text-muted-foreground'
                              }`}>
                              XP
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Pagination */}
                {!loading && allLeaderboard.length > 0 && totalPages > 1 && (
                  <div className="mt-6 sm:mt-8 flex flex-col items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="px-3 sm:px-4 text-xs sm:text-sm"
                      >
                        Previous
                      </Button>

                      <div className="flex gap-1 sm:gap-2 overflow-x-auto max-w-[200px] sm:max-w-none scrollbar-hide">
                        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                          let page;
                          if (totalPages <= 5) {
                            page = i + 1;
                          } else if (currentPage <= 3) {
                            page = i + 1;
                          } else if (currentPage >= totalPages - 2) {
                            page = totalPages - 4 + i;
                          } else {
                            page = currentPage - 2 + i;
                          }

                          return (
                            <Button
                              key={page}
                              variant={currentPage === page ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => handlePageChange(page)}
                              className={`w-8 sm:w-10 flex-shrink-0 text-xs sm:text-sm ${currentPage === page
                                ? 'bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white'
                                : 'hover:bg-gray-50'
                                }`}
                            >
                              {page}
                            </Button>
                          );
                        })}
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="px-3 sm:px-4 text-xs sm:text-sm"
                      >
                        Next
                      </Button>
                    </div>

                    <p className="text-xs sm:text-sm text-muted-foreground text-center">
                      Page {currentPage} of {totalPages} • {startIndex + 1}-{Math.min(endIndex, allLeaderboard.length)} of {allLeaderboard.length}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4 sm:space-y-6">
            {/* Your Rank Card - Desktop */}
            {userRank && (
              <Card className="hidden sm:block bg-gradient-to-br from-green-600 to-teal-600 text-white border-0 shadow-xl">
                <CardHeader className="pb-3">
                  <CardTitle className="text-white flex items-center gap-2 text-lg">
                    <Crown className="w-5 h-5" />
                    Your Ranking
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center mb-6">
                    <div className="relative inline-block">
                      <div className="absolute inset-0 bg-white/20 rounded-full blur-xl"></div>
                      <div className="relative text-5xl sm:text-6xl font-bold mb-2">
                        #{userRank.rank}
                      </div>
                    </div>
                    <p className="text-white/90 text-sm">
                      out of {userRank.totalUsers?.toLocaleString() || 0} users
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-white/10 rounded-lg backdrop-blur-sm">
                      <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-yellow-300" />
                        <span className="text-sm text-white/90">Total XP</span>
                      </div>
                      <span className="font-bold text-white">
                        {userRank.xp?.toLocaleString() || 0}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-white/10 rounded-lg backdrop-blur-sm">
                      <div className="flex items-center gap-2">
                        <Star className="w-4 h-4 text-yellow-300" />
                        <span className="text-sm text-white/90">Level</span>
                      </div>
                      <span className="font-bold text-white">{userRank.level || 1}</span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-white/10 rounded-lg backdrop-blur-sm">
                      <div className="flex items-center gap-2">
                        <Flame className="w-4 h-4 text-orange-300" />
                        <span className="text-sm text-white/90">Streak</span>
                      </div>
                      <span className="font-bold text-white">{userRank.streak || 0} days</span>
                    </div>

                    {userRank.lessonsCompleted > 0 && (
                      <div className="flex items-center justify-between p-3 bg-white/10 rounded-lg backdrop-blur-sm">
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-blue-300" />
                          <span className="text-sm text-white/90">Lessons</span>
                        </div>
                        <span className="font-bold text-white">{userRank.lessonsCompleted}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Achievement Highlights */}
            <Card className="shadow-lg border-0 bg-card">
              <CardHeader className="bg-gradient-to-r from-green-50 to-teal-50 dark:from-green-900/10 dark:to-teal-900/10 border-b border-border">
                <CardTitle className="text-base sm:text-lg flex items-center gap-2 text-foreground">
                  <Award className="w-5 h-5 text-green-600" />
                  Top Achievements
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 space-y-3">
                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/10 dark:to-amber-900/10 rounded-lg border border-yellow-200 dark:border-yellow-900/30">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full flex items-center justify-center shadow-md">
                      <Crown className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Top Rank XP</p>
                      <p className="text-sm font-bold text-foreground">
                        {currentLeaderboard[0]?.xp?.toLocaleString() || 0}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10 rounded-lg border border-green-200 dark:border-green-900/30">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-md">
                      <TrendingUp className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Your Progress</p>
                      <p className="text-sm font-bold text-foreground">
                        {userRank && userRank.totalUsers ?
                          `Top ${(100 - (userRank.rank / userRank.totalUsers) * 100).toFixed(0)}%` :
                          'N/A'
                        }
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/10 dark:to-cyan-900/10 rounded-lg border border-blue-200 dark:border-blue-900/30">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full flex items-center justify-center shadow-md">
                      <Users className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Active Users</p>
                      <p className="text-sm font-bold text-foreground">
                        {allLeaderboard.length.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Motivational CTA */}
            <Card className="bg-gradient-to-br from-green-600 via-teal-600 to-emerald-600 border-0 shadow-xl overflow-hidden">
              <CardContent className="p-6 relative">
                {/* Decorative elements */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>

                <div className="relative z-10">
                  <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mb-4 backdrop-blur-sm">
                    <Trophy className="w-8 h-8 text-white" />
                  </div>

                  <h3 className="text-xl font-bold text-white mb-2">
                    Climb the Ranks!
                  </h3>

                  <p className="text-sm text-white/90 mb-6 leading-relaxed">
                    Complete lessons, ace quizzes, and maintain your streak to earn XP and dominate the leaderboard.
                  </p>

                  <Link href="/dashboard">
                    <Button className="w-full bg-white text-green-700 hover:bg-gray-100 shadow-lg font-semibold">
                      Start Learning
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Quick Tips */}
            <Card className="shadow-lg border-0 bg-card hidden lg:block">
              <CardHeader className="bg-gradient-to-r from-green-50 to-teal-50 dark:from-green-900/10 dark:to-teal-900/10 border-b border-border">
                <CardTitle className="text-base flex items-center gap-2 text-foreground">
                  <Brain className="w-5 h-5 text-green-600" />
                  Earning Tips
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                      <BookOpen className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">Complete Lessons</p>
                      <p className="text-xs text-muted-foreground">Earn 50-100 XP per lesson</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="w-8 h-8 bg-teal-100 dark:bg-teal-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Target className="w-4 h-4 text-teal-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">Ace Quizzes</p>
                      <p className="text-xs text-muted-foreground">Bonus XP for perfect scores</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Flame className="w-4 h-4 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">Daily Streak</p>
                      <p className="text-xs text-muted-foreground">2x XP multiplier after 7 days</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Star className="w-4 h-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">Level Up</p>
                      <p className="text-xs text-muted-foreground">Unlock achievements & badges</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
