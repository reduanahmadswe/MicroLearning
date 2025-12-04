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
      setChallenges(response.data.data || []);
      
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
      setDailyChallenge(response.data.data);
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
      setQuizBattles(response.data.data || []);
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
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Sword className="w-8 h-8 text-orange-600" />
            Challenges
          </h1>
          <p className="text-gray-600 mt-1">Test your skills and compete with others</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setActiveTab('challenges')}
            className={`px-6 py-2 font-medium rounded-lg transition-colors ${
              activeTab === 'challenges'
                ? 'bg-orange-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Target className="w-4 h-4 inline mr-2" />
            All Challenges
          </button>
          <button
            onClick={() => setActiveTab('daily')}
            className={`px-6 py-2 font-medium rounded-lg transition-colors ${
              activeTab === 'daily'
                ? 'bg-orange-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Calendar className="w-4 h-4 inline mr-2" />
            Daily Challenge
          </button>
          <button
            onClick={() => setActiveTab('battles')}
            className={`px-6 py-2 font-medium rounded-lg transition-colors ${
              activeTab === 'battles'
                ? 'bg-orange-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Sword className="w-4 h-4 inline mr-2" />
            Quiz Battles
          </button>
        </div>
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Stats Sidebar */}
          <div className="space-y-6">
            <Card className="bg-gradient-to-br from-orange-600 to-red-600 text-white">
              <CardHeader>
                <CardTitle className="text-white">Your Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-white/90">Completed</span>
                  <span className="text-2xl font-bold">{stats.completed}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/90">Streak</span>
                  <span className="text-2xl font-bold flex items-center gap-1">
                    <Flame className="w-5 h-5" />
                    {stats.streak}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/90">Total XP</span>
                  <span className="text-2xl font-bold">{stats.totalRewards}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/90">Battles Won</span>
                  <span className="text-2xl font-bold">{stats.battlesWon}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Leaderboard</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-3">Top challenge completers</p>
                <div className="space-y-2">
                  {[1, 2, 3].map((rank) => (
                    <div key={rank} className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 text-white text-xs font-bold flex items-center justify-center">
                        {rank}
                      </div>
                      <div className="flex-1 text-sm font-medium text-gray-700">
                        User {rank}
                      </div>
                      <span className="text-sm text-gray-600">
                        {100 - rank * 10} pts
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {activeTab === 'challenges' && (
              <>
                {loading ? (
                  <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
                  </div>
                ) : challenges.length === 0 ? (
                  <Card className="p-12 text-center">
                    <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No challenges available</h3>
                    <p className="text-gray-600">Check back later for new challenges!</p>
                  </Card>
                ) : (
                  <div className="grid md:grid-cols-2 gap-6">
                    {challenges.map((challenge) => (
                      <Card key={challenge._id} className="hover:shadow-xl transition-all">
                        <CardHeader>
                          <div className="flex items-start justify-between mb-2">
                            <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                              challenge.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                              challenge.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              {challenge.difficulty}
                            </div>
                            <div className="flex items-center gap-1 text-orange-600">
                              <Zap className="w-4 h-4" />
                              <span className="font-bold">+{challenge.rewards?.xp || 50} XP</span>
                            </div>
                          </div>
                          <CardTitle className="text-lg">{challenge.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-gray-600 mb-4">{challenge.description}</p>

                          <div className="space-y-2 mb-4 text-sm">
                            <div className="flex items-center gap-2 text-gray-600">
                              <Target className="w-4 h-4" />
                              <span>{challenge.type}</span>
                            </div>
                            {challenge.deadline && (
                              <div className="flex items-center gap-2 text-gray-600">
                                <Clock className="w-4 h-4" />
                                <span>Ends {new Date(challenge.deadline).toLocaleDateString()}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-2 text-gray-600">
                              <Users className="w-4 h-4" />
                              <span>{challenge.participants?.length || 0} participants</span>
                            </div>
                          </div>

                          {challenge.isCompleted ? (
                            <Button disabled className="w-full" variant="outline">
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Completed
                            </Button>
                          ) : challenge.isJoined ? (
                            <Button className="w-full">
                              <Play className="w-4 h-4 mr-2" />
                              Continue Challenge
                            </Button>
                          ) : (
                            <Button
                              onClick={() => handleJoinChallenge(challenge._id)}
                              className="w-full bg-orange-600 hover:bg-orange-700"
                            >
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
                  <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
                  </div>
                ) : !dailyChallenge ? (
                  <Card className="p-12 text-center">
                    <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No daily challenge yet</h3>
                    <p className="text-gray-600">Come back tomorrow for a new challenge!</p>
                  </Card>
                ) : (
                  <Card className="border-2 border-orange-200">
                    <CardHeader>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center">
                            <Calendar className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h2 className="text-2xl font-bold text-gray-900">Daily Challenge</h2>
                            <p className="text-sm text-gray-600">
                              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-1 text-orange-600 text-xl font-bold">
                            <Zap className="w-6 h-6" />
                            +{dailyChallenge.rewards?.xp || 100} XP
                          </div>
                          <p className="text-xs text-gray-500">Bonus reward</p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-lg p-6 mb-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-3">
                          {dailyChallenge.title}
                        </h3>
                        <p className="text-gray-700 mb-4">
                          {dailyChallenge.description}
                        </p>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div className="bg-white rounded-lg p-4">
                            <Target className="w-8 h-8 text-orange-600 mb-2" />
                            <p className="text-sm text-gray-600">Type</p>
                            <p className="font-semibold text-gray-900">{dailyChallenge.type}</p>
                          </div>
                          <div className="bg-white rounded-lg p-4">
                            <Clock className="w-8 h-8 text-blue-600 mb-2" />
                            <p className="text-sm text-gray-600">Time Limit</p>
                            <p className="font-semibold text-gray-900">24 hours</p>
                          </div>
                        </div>
                      </div>

                      {dailyChallenge.isCompleted ? (
                        <div className="text-center py-8">
                          <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                          <h3 className="text-xl font-bold text-gray-900 mb-2">Challenge Completed!</h3>
                          <p className="text-gray-600 mb-4">Come back tomorrow for a new challenge</p>
                          <div className="flex items-center justify-center gap-4 text-sm">
                            <span className="flex items-center gap-1 text-orange-600">
                              <Zap className="w-4 h-4" />
                              +{dailyChallenge.rewards?.xp} XP earned
                            </span>
                            <span className="flex items-center gap-1 text-yellow-600">
                              <Star className="w-4 h-4" />
                              Streak: {stats.streak} days
                            </span>
                          </div>
                        </div>
                      ) : (
                        <Button
                          onClick={handleCompleteDailyChallenge}
                          size="lg"
                          className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
                        >
                          <Play className="w-5 h-5 mr-2" />
                          Start Daily Challenge
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
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  >
                    <Sword className="w-5 h-5 mr-2" />
                    Create New Battle
                  </Button>
                </div>

                {loading ? (
                  <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
                  </div>
                ) : quizBattles.length === 0 ? (
                  <Card className="p-12 text-center">
                    <Sword className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No active battles</h3>
                    <p className="text-gray-600 mb-4">Create a battle and challenge your friends!</p>
                  </Card>
                ) : (
                  <div className="grid md:grid-cols-2 gap-6">
                    {quizBattles.map((battle) => (
                      <Card key={battle._id} className="hover:shadow-xl transition-all border-2 border-purple-200">
                        <CardHeader>
                          <div className="flex items-start justify-between mb-2">
                            <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                              battle.status === 'waiting' ? 'bg-yellow-100 text-yellow-700' :
                              battle.status === 'active' ? 'bg-green-100 text-green-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {battle.status}
                            </div>
                            <Crown className="w-5 h-5 text-yellow-600" />
                          </div>
                          <CardTitle className="text-lg">Quiz Battle</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3 mb-4">
                            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                              <span className="text-sm font-medium text-gray-700">Topic</span>
                              <span className="font-bold text-blue-600">{battle.topic || 'General'}</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                              <span className="text-sm font-medium text-gray-700">Difficulty</span>
                              <span className="font-bold text-purple-600">{battle.difficulty || 'Medium'}</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                              <span className="text-sm font-medium text-gray-700">Players</span>
                              <span className="font-bold text-green-600">
                                {battle.players?.length || 0} / 2
                              </span>
                            </div>
                          </div>

                          <Link href={`/battles/${battle._id}`}>
                            <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
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
    </div>
  );
}
