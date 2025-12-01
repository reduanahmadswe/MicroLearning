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
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { leaderboardAPI } from '@/services/api.service';
import { toast } from 'sonner';

interface LeaderboardEntry {
  rank: number;
  user: {
    _id: string;
    name: string;
    avatar?: string;
  };
  xp: number;
  level: number;
  streak: number;
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

  const topics = ['Programming', 'Mathematics', 'Science', 'Business', 'Language', 'Design'];

  useEffect(() => {
    loadLeaderboard();
  }, [activeTab, timeRange, selectedTopic]);

  const loadLeaderboard = async () => {
    try {
      setLoading(true);
      
      if (activeTab === 'global') {
        const response = await leaderboardAPI.getGlobalLeaderboard(timeRange);
        setGlobalLeaderboard(response.data.data?.leaderboard || []);
        setUserRank(response.data.data?.userRank);
      } else if (activeTab === 'friends') {
        const response = await leaderboardAPI.getFriendsLeaderboard(timeRange);
        setFriendsLeaderboard(response.data.data?.leaderboard || []);
        setUserRank(response.data.data?.userRank);
      } else if (activeTab === 'topic') {
        const response = await leaderboardAPI.getTopicLeaderboard(selectedTopic, timeRange);
        setTopicLeaderboard(response.data.data?.leaderboard || []);
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
    if (rank === 1) return <Crown className="w-6 h-6 text-yellow-500 fill-yellow-500" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-gray-400 fill-gray-400" />;
    if (rank === 3) return <Medal className="w-6 h-6 text-amber-700 fill-amber-700" />;
    return <span className="text-lg font-bold text-gray-600">#{rank}</span>;
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white';
    if (rank === 2) return 'bg-gradient-to-r from-gray-300 to-gray-500 text-white';
    if (rank === 3) return 'bg-gradient-to-r from-amber-600 to-amber-800 text-white';
    return 'bg-white border-2 border-gray-200';
  };

  const currentLeaderboard = 
    activeTab === 'global' ? globalLeaderboard :
    activeTab === 'friends' ? friendsLeaderboard :
    topicLeaderboard;

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <Link href="/dashboard">
                <Button variant="ghost" size="sm" className="mb-2">
                  ← Back to Dashboard
                </Button>
              </Link>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                <Trophy className="w-8 h-8 text-yellow-600" />
                Leaderboard
              </h1>
              <p className="text-gray-600 mt-1">Compete with learners worldwide</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex flex-wrap gap-4 mt-6">
            <button
              onClick={() => setActiveTab('global')}
              className={`px-6 py-2 font-medium rounded-lg transition-colors ${
                activeTab === 'global'
                  ? 'bg-yellow-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Trophy className="w-4 h-4 inline mr-2" />
              Global
            </button>
            <button
              onClick={() => setActiveTab('friends')}
              className={`px-6 py-2 font-medium rounded-lg transition-colors ${
                activeTab === 'friends'
                  ? 'bg-yellow-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Users className="w-4 h-4 inline mr-2" />
              Friends
            </button>
            <button
              onClick={() => setActiveTab('topic')}
              className={`px-6 py-2 font-medium rounded-lg transition-colors ${
                activeTab === 'topic'
                  ? 'bg-yellow-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Target className="w-4 h-4 inline mr-2" />
              By Topic
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="mb-6 flex flex-wrap gap-4 items-center">
          <div className="flex gap-2">
            <Button
              variant={timeRange === 'daily' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeRange('daily')}
            >
              Daily
            </Button>
            <Button
              variant={timeRange === 'weekly' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeRange('weekly')}
            >
              Weekly
            </Button>
            <Button
              variant={timeRange === 'monthly' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeRange('monthly')}
            >
              Monthly
            </Button>
            <Button
              variant={timeRange === 'allTime' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeRange('allTime')}
            >
              All Time
            </Button>
          </div>

          {activeTab === 'topic' && (
            <select
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium"
            >
              {topics.map((topic) => (
                <option key={topic} value={topic}>
                  {topic}
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Leaderboard */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Rankings</span>
                  <span className="text-sm font-normal text-gray-600">
                    {currentLeaderboard.length} participants
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600"></div>
                  </div>
                ) : currentLeaderboard.length === 0 ? (
                  <div className="text-center py-12">
                    <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No rankings yet</h3>
                    <p className="text-gray-600">Be the first to earn points!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {currentLeaderboard.map((entry: any, index: number) => {
                      const rank = entry.rank || index + 1;
                      const isTopThree = rank <= 3;
                      
                      return (
                        <div
                          key={entry.user?._id || index}
                          className={`flex items-center gap-4 p-4 rounded-xl transition-all ${
                            getRankBadge(rank)
                          } ${isTopThree ? 'shadow-lg' : 'hover:shadow-md'}`}
                        >
                          {/* Rank */}
                          <div className="flex items-center justify-center w-12">
                            {getRankIcon(rank)}
                          </div>

                          {/* Avatar */}
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${
                            isTopThree 
                              ? 'bg-gradient-to-br from-purple-600 to-blue-600' 
                              : 'bg-gradient-to-br from-gray-400 to-gray-600'
                          }`}>
                            {entry.user?.avatar ? (
                              <img
                                src={entry.user.avatar}
                                alt={entry.user?.name}
                                className="w-full h-full rounded-full object-cover"
                              />
                            ) : (
                              entry.user?.name?.charAt(0).toUpperCase() || '?'
                            )}
                          </div>

                          {/* User Info */}
                          <div className="flex-1">
                            <h3 className={`font-semibold ${isTopThree ? 'text-white' : 'text-gray-900'}`}>
                              {entry.user?.name || 'Anonymous'}
                            </h3>
                            <div className={`flex items-center gap-3 text-sm ${isTopThree ? 'text-white/90' : 'text-gray-600'}`}>
                              <span className="flex items-center gap-1">
                                <Zap className="w-3 h-3" />
                                Level {entry.level || 1}
                              </span>
                              {entry.streak > 0 && (
                                <span className="flex items-center gap-1">
                                  🔥 {entry.streak} day streak
                                </span>
                              )}
                            </div>
                          </div>

                          {/* XP */}
                          <div className="text-right">
                            <p className={`text-2xl font-bold ${isTopThree ? 'text-white' : 'text-gray-900'}`}>
                              {entry.xp?.toLocaleString() || 0}
                            </p>
                            <p className={`text-sm ${isTopThree ? 'text-white/80' : 'text-gray-600'}`}>
                              XP
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Your Rank */}
            {userRank && (
              <Card className="bg-gradient-to-br from-blue-600 to-purple-600 text-white">
                <CardHeader>
                  <CardTitle className="text-white">Your Ranking</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center mb-4">
                    <div className="text-5xl font-bold mb-2">
                      #{userRank.rank}
                    </div>
                    <p className="text-white/90">out of {userRank.totalUsers} users</p>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-white/80">Total XP</span>
                      <span className="font-semibold">{userRank.xp?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/80">Level</span>
                      <span className="font-semibold">{userRank.level}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/80">Streak</span>
                      <span className="font-semibold">{userRank.streak} days</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Leaderboard Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Crown className="w-5 h-5 text-yellow-600" />
                    <span className="text-sm font-medium text-gray-700">Top Rank</span>
                  </div>
                  <span className="text-lg font-bold text-yellow-600">
                    {currentLeaderboard[0]?.xp?.toLocaleString() || 0} XP
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                    <span className="text-sm font-medium text-gray-700">Your Progress</span>
                  </div>
                  <span className="text-lg font-bold text-blue-600">
                    {userRank ? `${((userRank.rank / userRank.totalUsers) * 100).toFixed(0)}%` : 'N/A'}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-purple-600" />
                    <span className="text-sm font-medium text-gray-700">Active Users</span>
                  </div>
                  <span className="text-lg font-bold text-purple-600">
                    {currentLeaderboard.length}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Compete Card */}
            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
              <CardContent className="p-6">
                <Award className="w-12 h-12 text-green-600 mb-3" />
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  Climb the Ranks!
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Complete lessons, quizzes, and challenges to earn XP and climb the leaderboard.
                </p>
                <Link href="/dashboard">
                  <Button className="w-full bg-green-600 hover:bg-green-700">
                    Start Learning
                    <ChevronRight className="w-4 h-4 ml-2" />
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
