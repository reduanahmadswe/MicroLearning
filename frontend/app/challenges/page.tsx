'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Sword,
  Trophy,
  Clock,
  Users,
  Target,
  Zap,
  Calendar,
  Play,
  CheckCircle,
  Star,
  Flame,
  Crown,
  Award,
  TrendingUp,
  Medal,
  Sparkles,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { challengesAPI as challengeAPI, dailyChallengeAPI, quizBattleAPI } from '@/services/api.service';
import { toast } from 'sonner';

export default function ChallengesPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'challenges' | 'daily' | 'battles'>('challenges');
  const [challenges, setChallenges] = useState<any[]>([]);
  const [dailyChallenge, setDailyChallenge] = useState<any>(null);
  const [quizBattles, setQuizBattles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    completed: 0,
    streak: 0,
    totalRewards: 0,
    battlesWon: 0,
  });

  useEffect(() => {
    if (activeTab === 'challenges') {
      loadChallenges();
    } else if (activeTab === 'daily') {
      loadDailyChallenge();
    } else if (activeTab === 'battles') {
      loadQuizBattles();
    }
  }, [activeTab]);

  const loadChallenges = async () => {
    try {
      setLoading(true);
      const response = await challengeAPI.getChallenges();
      
      // Handle both array and object response
      const challengesData = Array.isArray(response.data.data) 
        ? response.data.data 
        : response.data.data?.challenges || [];
      
      setChallenges(challengesData);
      
      // Load user stats
      const statsResponse = await challengeAPI.getUserStats();
      if (statsResponse.data.data) {
        setStats(statsResponse.data.data);
      }
    } catch (error: any) {
      toast.error('Failed to load challenges');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadDailyChallenge = async () => {
    try {
      setLoading(true);
      const response = await dailyChallengeAPI.getTodayChallenge();
      
      // Handle array or object response
      const challengeData = Array.isArray(response.data.data)
        ? response.data.data[0]
        : response.data.data?.challenges?.[0] || response.data.data;
      
      setDailyChallenge(challengeData);
    } catch (error: any) {
      toast.error('Failed to load daily challenge');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadQuizBattles = async () => {
    try {
      setLoading(true);
      const response = await quizBattleAPI.getBattles();
      
      // Handle both array and object response
      const battlesData = Array.isArray(response.data.data)
        ? response.data.data
        : response.data.data?.battles || response.data.data?.quizBattles || [];
      
      setQuizBattles(battlesData);
    } catch (error: any) {
      toast.error('Failed to load quiz battles');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinChallenge = async (challengeId: string) => {
    try {
      await challengeAPI.joinChallenge(challengeId);
      toast.success('Challenge joined!');
      loadChallenges();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to join challenge');
    }
  };

  const handleCompleteDailyChallenge = async () => {
    try {
      await dailyChallengeAPI.completeChallenge(dailyChallenge._id);
      toast.success('Daily challenge completed! 🎉');
      loadDailyChallenge();
    } catch (error: any) {
      toast.error('Failed to complete challenge');
    }
  };

  const handleCreateBattle = async () => {
    try {
      const response = await quizBattleAPI.createBattle({
        topic: 'General',
        difficulty: 'intermediate',
      });
      const battleId = response.data.data._id;
      router.push(`/battles/${battleId}`);
    } catch (error: any) {
      toast.error('Failed to create battle');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Container with responsive padding */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
        
        {/* Hero Header Section - Mobile Optimized */}
        <div className="mb-6 sm:mb-8 lg:mb-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 flex items-center gap-2 sm:gap-3 mb-2">
                <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-orange-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Trophy className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-white" />
                </div>
                Challenges Arena
              </h1>
              <p className="text-sm sm:text-base text-gray-600">
                Push your limits and compete with the best
              </p>
            </div>
            
            {/* Quick Stats - Mobile Horizontal Scroll */}
            <div className="flex gap-3 overflow-x-auto pb-2 sm:pb-0 scrollbar-hide">
              <div className="flex-shrink-0 bg-gradient-to-br from-orange-500 to-orange-600 text-white px-4 py-2 rounded-xl shadow-md">
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4" />
                  <div>
                    <p className="text-xs opacity-90">Streak</p>
                    <p className="text-lg font-bold">{stats.streak}</p>
                  </div>
                </div>
              </div>
              <div className="flex-shrink-0 bg-gradient-to-br from-purple-500 to-purple-600 text-white px-4 py-2 rounded-xl shadow-md">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4" />
                  <div>
                    <p className="text-xs opacity-90">Total XP</p>
                    <p className="text-lg font-bold">{stats.totalRewards}</p>
                  </div>
                </div>
              </div>
              <div className="flex-shrink-0 bg-gradient-to-br from-green-500 to-green-600 text-white px-4 py-2 rounded-xl shadow-md">
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4" />
                  <div>
                    <p className="text-xs opacity-90">Wins</p>
                    <p className="text-lg font-bold">{stats.battlesWon}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile-First Tab Navigation */}
        <div className="mb-6 sm:mb-8">
          <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-2 scrollbar-hide">
            <button
              onClick={() => setActiveTab('challenges')}
              className={`flex-shrink-0 px-4 sm:px-6 py-2.5 sm:py-3 font-medium rounded-xl transition-all duration-200 flex items-center gap-2 ${
                activeTab === 'challenges'
                  ? 'bg-gradient-to-r from-orange-500 to-pink-600 text-white shadow-lg scale-105'
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200 shadow-sm'
              }`}
            >
              <Target className="w-4 h-4" />
              <span className="text-sm sm:text-base">All Challenges</span>
            </button>
            <button
              onClick={() => setActiveTab('daily')}
              className={`flex-shrink-0 px-4 sm:px-6 py-2.5 sm:py-3 font-medium rounded-xl transition-all duration-200 flex items-center gap-2 ${
                activeTab === 'daily'
                  ? 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-lg scale-105'
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200 shadow-sm'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span className="text-sm sm:text-base">Daily</span>
            </button>
            <button
              onClick={() => setActiveTab('battles')}
              className={`flex-shrink-0 px-4 sm:px-6 py-2.5 sm:py-3 font-medium rounded-xl transition-all duration-200 flex items-center gap-2 ${
                activeTab === 'battles'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg scale-105'
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200 shadow-sm'
              }`}
            >
              <Sword className="w-4 h-4" />
              <span className="text-sm sm:text-base">Quiz Battles</span>
            </button>
          </div>
        </div>

        {/* Responsive Grid Layout */}
        <div className="grid lg:grid-cols-12 gap-6 lg:gap-8">
          
          {/* Sidebar - Hidden on mobile, visible on desktop */}
          <div className="hidden lg:block lg:col-span-3 space-y-6">
            
            {/* Progress Card */}
            <Card className="overflow-hidden border-0 shadow-xl bg-gradient-to-br from-orange-500 to-pink-600">
              <CardContent className="p-6 text-white">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Your Progress</h3>
                    <p className="text-xs text-white/80">Keep pushing forward</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-white/90">Completed</span>
                      <span className="text-xl font-bold">{stats.completed}</span>
                    </div>
                    <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                      <div className="h-full bg-white rounded-full" style={{ width: `${Math.min(stats.completed * 10, 100)}%` }}></div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-white/20">
                    <span className="text-sm text-white/90">Current Streak</span>
                    <span className="text-2xl font-bold flex items-center gap-1">
                      <Flame className="w-6 h-6" />
                      {stats.streak}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white/90">Total XP</span>
                    <span className="text-2xl font-bold">{stats.totalRewards}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white/90">Battles Won</span>
                    <span className="text-2xl font-bold">{stats.battlesWon}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Leaderboard Card */}
            <Card className="border-0 shadow-lg bg-white">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Medal className="w-5 h-5 text-yellow-600" />
                  Top Challengers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { rank: 1, name: 'Alex Chen', points: 2450, color: 'from-yellow-400 to-yellow-600' },
                    { rank: 2, name: 'Sarah Kim', points: 2180, color: 'from-gray-300 to-gray-400' },
                    { rank: 3, name: 'Mike Ross', points: 1920, color: 'from-orange-400 to-orange-600' },
                  ].map((user) => (
                    <div key={user.rank} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${user.color} text-white text-sm font-bold flex items-center justify-center shadow-md`}>
                        {user.rank}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.points} XP</p>
                      </div>
                      <Crown className="w-4 h-4 text-yellow-600" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-9">{activeTab === 'challenges' && (
              <>
                {loading ? (
                  <div className="flex justify-center items-center py-16 sm:py-24">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-4 border-orange-200 border-t-orange-600 mx-auto mb-4"></div>
                      <p className="text-gray-600 text-sm">Loading challenges...</p>
                    </div>
                  </div>
                ) : challenges.length === 0 ? (
                  <Card className="border-0 shadow-lg bg-white">
                    <CardContent className="p-12 sm:p-16 text-center">
                      <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-orange-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Target className="w-10 h-10 sm:w-12 sm:h-12 text-orange-600" />
                      </div>
                      <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">No Active Challenges</h3>
                      <p className="text-gray-600 max-w-md mx-auto">
                        Check back soon! New exciting challenges are coming your way.
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
                    {challenges.map((challenge) => (
                      <Card 
                        key={challenge._id} 
                        className="group hover:shadow-2xl transition-all duration-300 border-0 shadow-lg bg-white overflow-hidden hover:-translate-y-1"
                      >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-500/10 to-pink-600/10 rounded-bl-full -z-10"></div>
                        
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between mb-3">
                            <div className={`px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm ${
                              challenge.difficulty === 'easy' 
                                ? 'bg-gradient-to-r from-green-400 to-green-600 text-white' :
                              challenge.difficulty === 'medium' 
                                ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white' :
                                'bg-gradient-to-r from-red-400 to-red-600 text-white'
                            }`}>
                              {challenge.difficulty?.toUpperCase()}
                            </div>
                            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-orange-500 to-pink-600 text-white rounded-full shadow-md">
                              <Zap className="w-3.5 h-3.5" />
                              <span className="font-bold text-sm">+{challenge.rewards?.xp || 50}</span>
                            </div>
                          </div>
                          <CardTitle className="text-lg sm:text-xl font-bold text-gray-900 line-clamp-2">
                            {challenge.title}
                          </CardTitle>
                        </CardHeader>
                        
                        <CardContent className="space-y-4">
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {challenge.description}
                          </p>

                          <div className="grid grid-cols-2 gap-2">
                            <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg">
                              <Target className="w-4 h-4 text-blue-600 flex-shrink-0" />
                              <span className="text-xs font-medium text-gray-700 truncate">{challenge.type}</span>
                            </div>
                            <div className="flex items-center gap-2 p-2 bg-purple-50 rounded-lg">
                              <Users className="w-4 h-4 text-purple-600 flex-shrink-0" />
                              <span className="text-xs font-medium text-gray-700">{challenge.participants?.length || 0} joined</span>
                            </div>
                          </div>

                          {challenge.deadline && (
                            <div className="flex items-center gap-2 text-xs text-gray-600 bg-gray-50 p-2 rounded-lg">
                              <Clock className="w-4 h-4 flex-shrink-0" />
                              <span>Ends {new Date(challenge.deadline).toLocaleDateString()}</span>
                            </div>
                          )}

                          {challenge.isCompleted ? (
                            <Button 
                              disabled 
                              className="w-full bg-gray-100 text-gray-600 hover:bg-gray-100"
                              size="lg"
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Completed
                            </Button>
                          ) : challenge.isJoined ? (
                            <Button 
                              className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 shadow-md"
                              size="lg"
                            >
                              <Play className="w-4 h-4 mr-2" />
                              Continue
                            </Button>
                          ) : (
                            <Button
                              onClick={() => handleJoinChallenge(challenge._id)}
                              className="w-full bg-gradient-to-r from-orange-500 to-pink-600 hover:from-orange-600 hover:to-pink-700 shadow-md"
                              size="lg"
                            >
                              <Sparkles className="w-4 h-4 mr-2" />
                              Join Challenge
                            </Button>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </>
            )}

            {activeTab === 'daily' && (
              <>
                {loading ? (
                  <div className="flex justify-center items-center py-16 sm:py-24">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
                      <p className="text-gray-600 text-sm">Loading daily challenge...</p>
                    </div>
                  </div>
                ) : !dailyChallenge ? (
                  <Card className="border-0 shadow-lg">
                    <CardContent className="p-12 sm:p-16 text-center">
                      <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Calendar className="w-10 h-10 sm:w-12 sm:h-12 text-blue-600" />
                      </div>
                      <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">No Daily Challenge Yet</h3>
                      <p className="text-gray-600 max-w-md mx-auto">
                        New daily challenges drop at midnight. Come back tomorrow!
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="border-0 shadow-2xl overflow-hidden">
                    <div className="bg-gradient-to-br from-blue-500 via-cyan-500 to-teal-500 p-6 sm:p-8 text-white">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 sm:w-16 sm:h-16 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center shadow-lg">
                            <Calendar className="w-7 h-7 sm:w-8 sm:h-8" />
                          </div>
                          <div>
                            <h2 className="text-2xl sm:text-3xl font-bold mb-1">Daily Challenge</h2>
                            <p className="text-sm text-white/90">
                              {new Date().toLocaleDateString('en-US', { 
                                weekday: 'long', 
                                month: 'long', 
                                day: 'numeric' 
                              })}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 bg-white/20 backdrop-blur px-4 py-3 rounded-xl self-start sm:self-auto">
                          <Zap className="w-6 h-6" />
                          <div>
                            <p className="text-xs text-white/80">Bonus XP</p>
                            <p className="text-2xl font-bold">+{dailyChallenge.rewards?.xp || 100}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <CardContent className="p-6 sm:p-8">
                      <div className="bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 rounded-2xl p-6 sm:p-8 mb-6">
                        <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">
                          {dailyChallenge.title}
                        </h3>
                        <p className="text-gray-700 text-sm sm:text-base leading-relaxed mb-6">
                          {dailyChallenge.description}
                        </p>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-white rounded-xl p-4 shadow-sm">
                            <Target className="w-8 h-8 sm:w-10 sm:h-10 text-blue-600 mb-3" />
                            <p className="text-xs text-gray-600 mb-1">Challenge Type</p>
                            <p className="font-bold text-gray-900 text-sm sm:text-base">{dailyChallenge.type}</p>
                          </div>
                          <div className="bg-white rounded-xl p-4 shadow-sm">
                            <Clock className="w-8 h-8 sm:w-10 sm:h-10 text-orange-600 mb-3" />
                            <p className="text-xs text-gray-600 mb-1">Time Limit</p>
                            <p className="font-bold text-gray-900 text-sm sm:text-base">24 hours</p>
                          </div>
                        </div>
                      </div>

                      {dailyChallenge.isCompleted ? (
                        <div className="text-center py-8 sm:py-12">
                          <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                            <CheckCircle className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
                          </div>
                          <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Challenge Completed!</h3>
                          <p className="text-gray-600 mb-6">Amazing work! See you tomorrow for a new challenge</p>
                          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm">
                            <div className="flex items-center gap-2 px-4 py-2 bg-orange-100 text-orange-700 rounded-lg">
                              <Zap className="w-4 h-4" />
                              <span className="font-semibold">+{dailyChallenge.rewards?.xp} XP earned</span>
                            </div>
                            <div className="flex items-center gap-2 px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg">
                              <Flame className="w-4 h-4" />
                              <span className="font-semibold">{stats.streak} day streak</span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <Button
                          onClick={handleCompleteDailyChallenge}
                          size="lg"
                          className="w-full h-14 text-base sm:text-lg bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 hover:from-blue-700 hover:via-cyan-700 hover:to-teal-700 shadow-lg"
                        >
                          <Play className="w-5 h-5 mr-2" />
                          Start Challenge Now
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                )}
              </>
            )}

            {activeTab === 'battles' && (
              <>
                <div className="mb-6">
                  <Button
                    onClick={handleCreateBattle}
                    size="lg"
                    className="w-full sm:w-auto h-12 sm:h-14 text-base bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 hover:from-purple-700 hover:via-pink-700 hover:to-red-700 shadow-lg"
                  >
                    <Sword className="w-5 h-5 mr-2" />
                    Create New Battle
                  </Button>
                </div>

                {loading ? (
                  <div className="flex justify-center items-center py-16 sm:py-24">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-4 border-purple-200 border-t-purple-600 mx-auto mb-4"></div>
                      <p className="text-gray-600 text-sm">Loading battles...</p>
                    </div>
                  </div>
                ) : quizBattles.length === 0 ? (
                  <Card className="border-0 shadow-lg">
                    <CardContent className="p-12 sm:p-16 text-center">
                      <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Sword className="w-10 h-10 sm:w-12 sm:h-12 text-purple-600" />
                      </div>
                      <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">No Active Battles</h3>
                      <p className="text-gray-600 max-w-md mx-auto mb-6">
                        Challenge your friends to an epic quiz battle!
                      </p>
                      <Button
                        onClick={handleCreateBattle}
                        size="lg"
                        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                      >
                        <Sparkles className="w-5 h-5 mr-2" />
                        Start First Battle
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
                    {quizBattles.map((battle) => (
                      <Card 
                        key={battle._id} 
                        className="group hover:shadow-2xl transition-all duration-300 border-0 shadow-lg overflow-hidden hover:-translate-y-1"
                      >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/10 to-pink-600/10 rounded-bl-full -z-10"></div>
                        
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between mb-3">
                            <div className={`px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm ${
                              battle.status === 'waiting' 
                                ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white' :
                              battle.status === 'active' 
                                ? 'bg-gradient-to-r from-green-400 to-green-600 text-white' :
                                'bg-gradient-to-r from-gray-400 to-gray-600 text-white'
                            }`}>
                              {battle.status?.toUpperCase()}
                            </div>
                            <Crown className="w-6 h-6 text-yellow-500" />
                          </div>
                          <CardTitle className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
                            <Sword className="w-5 h-5 text-purple-600" />
                            Quiz Battle
                          </CardTitle>
                        </CardHeader>
                        
                        <CardContent className="space-y-3">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl">
                              <span className="text-sm font-medium text-gray-700">Topic</span>
                              <span className="font-bold text-blue-600">{battle.topic || 'General'}</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
                              <span className="text-sm font-medium text-gray-700">Difficulty</span>
                              <span className="font-bold text-purple-600 capitalize">{battle.difficulty || 'Medium'}</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-teal-50 rounded-xl">
                              <span className="text-sm font-medium text-gray-700">Players</span>
                              <span className="font-bold text-green-600">
                                {battle.players?.length || 0} / 2
                              </span>
                            </div>
                          </div>

                          <Link href={`/battles/${battle._id}`} className="block">
                            <Button 
                              className="w-full bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 hover:from-purple-700 hover:via-pink-700 hover:to-red-700 shadow-md"
                              size="lg"
                            >
                              <Sword className="w-4 h-4 mr-2" />
                              {battle.status === 'waiting' ? 'Join Battle' : 'View Battle'}
                            </Button>
                          </Link>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </>
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
