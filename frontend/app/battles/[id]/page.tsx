'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  Trophy,
  Clock,
  Users,
  Sword,
  Play,
  Crown,
  Target,
  Zap,
  ArrowLeft,
  CheckCircle,
  XCircle,
  Award,
  Star,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { quizBattleAPI } from '@/services/api.service';

interface Battle {
  _id: string;
  title: string;
  description: string;
  type: string;
  difficulty: string;
  xpReward: number;
  coinsReward: number;
  startDate: string;
  endDate: string;
  status: string;
  players?: any[];
  maxPlayers?: number;
  topic?: string;
  isActive: boolean;
}

export default function BattleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const battleId = params.id as string;

  const [battle, setBattle] = useState<Battle | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    loadBattleDetails();
  }, [battleId]);

  const loadBattleDetails = async () => {
    try {
      setLoading(true);
      const response = await quizBattleAPI.getBattleById(battleId);
      console.log('Battle details:', response.data);
      
      if (response.data.success) {
        setBattle(response.data.data);
      } else {
        toast.error('Battle not found');
      }
    } catch (error: any) {
      console.error('Load battle error:', error);
      toast.error(error?.response?.data?.message || 'Failed to load battle details');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinBattle = async () => {
    try {
      setJoining(true);
      await quizBattleAPI.joinBattle(battleId);
      toast.success('Joined battle successfully!');
      loadBattleDetails();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to join battle');
    } finally {
      setJoining(false);
    }
  };

  const handleStartBattle = () => {
    // Redirect to quiz page or battle arena
    router.push(`/quiz-arena?battleId=${battleId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200 border-t-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading battle...</p>
        </div>
      </div>
    );
  }

  if (!battle) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-red-50 flex items-center justify-center">
        <Card className="max-w-md mx-4">
          <CardContent className="p-8 text-center">
            <Sword className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Battle Not Found</h3>
            <p className="text-gray-600 mb-4">This battle doesn't exist or has been removed.</p>
            <Button onClick={() => router.push('/challenges')}>
              Back to Challenges
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const playerCount = battle.players?.length || 0;
  const maxPlayers = battle.maxPlayers || 2;
  const isFull = playerCount >= maxPlayers;
  const canStart = playerCount >= 2;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-red-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => router.push('/challenges')}
          className="mb-4 hover:bg-white/50"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Challenges
        </Button>

        {/* Battle Header */}
        <Card className="mb-6 border-0 shadow-xl bg-gradient-to-br from-purple-600 via-pink-600 to-red-600 text-white overflow-hidden">
          <CardContent className="p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    <Sword className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className={`px-3 py-1 rounded-full text-xs font-semibold mb-1 inline-block ${
                      battle.difficulty === 'easy' ? 'bg-green-500' :
                      battle.difficulty === 'medium' ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`}>
                      {battle.difficulty?.toUpperCase()}
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-semibold ml-2 inline-block ${
                      battle.status === 'waiting' ? 'bg-blue-500' :
                      battle.status === 'active' ? 'bg-green-500' :
                      'bg-gray-500'
                    }`}>
                      {battle.status?.toUpperCase()}
                    </div>
                  </div>
                </div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3">
                  {battle.title || 'Quiz Battle'}
                </h1>
                <p className="text-purple-50 text-sm sm:text-base mb-4">
                  {battle.description || 'Compete with other players in this exciting quiz battle!'}
                </p>
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-yellow-300" />
                    <span className="font-bold">+{battle.xpReward || 100} XP</span>
                  </div>
                  {battle.coinsReward && battle.coinsReward > 0 && (
                    <div className="flex items-center gap-2">
                      <Trophy className="w-5 h-5 text-yellow-300" />
                      <span className="font-bold">+{battle.coinsReward} Coins</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    <span className="text-sm">{battle.topic || 'General'}</span>
                  </div>
                </div>
              </div>
              <div className="flex-shrink-0">
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center min-w-[120px]">
                  <Users className="w-8 h-8 mx-auto mb-2" />
                  <div className="text-3xl font-bold mb-1">{playerCount}/{maxPlayers}</div>
                  <div className="text-xs text-purple-100">Players</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Battle Info */}
            <Card className="border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-purple-600" />
                  Battle Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
                    <p className="text-xs text-gray-600 mb-1">Start Date</p>
                    <p className="font-bold text-gray-900">
                      {new Date(battle.startDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-pink-50 to-pink-100 rounded-xl">
                    <p className="text-xs text-gray-600 mb-1">End Date</p>
                    <p className="font-bold text-gray-900">
                      {new Date(battle.endDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Battle Status</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      battle.status === 'waiting' ? 'bg-blue-500 text-white' :
                      battle.status === 'active' ? 'bg-green-500 text-white' :
                      'bg-gray-500 text-white'
                    }`}>
                      {battle.status === 'waiting' ? '🕐 Waiting for Players' :
                       battle.status === 'active' ? '⚔️ In Progress' :
                       '✅ Completed'}
                    </span>
                  </div>
                  {battle.status === 'waiting' && (
                    <p className="text-xs text-gray-600">
                      Waiting for {maxPlayers - playerCount} more player{maxPlayers - playerCount > 1 ? 's' : ''} to join
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <Card className="border-0 shadow-xl">
              <CardContent className="p-6">
                {battle.status === 'waiting' && !isFull && (
                  <Button
                    onClick={handleJoinBattle}
                    disabled={joining}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-6 text-lg font-bold shadow-lg"
                  >
                    <Sword className="w-5 h-5 mr-2" />
                    {joining ? 'Joining...' : 'Join Battle'}
                  </Button>
                )}
                {canStart && battle.status !== 'completed' && (
                  <Button
                    onClick={handleStartBattle}
                    className="w-full bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white py-6 text-lg font-bold shadow-lg"
                  >
                    <Play className="w-5 h-5 mr-2" />
                    Start Battle
                  </Button>
                )}
                {isFull && battle.status === 'waiting' && (
                  <div className="text-center py-4">
                    <p className="text-gray-600 mb-2">Battle is full! Waiting for host to start...</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Players List */}
            <Card className="border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  Players ({playerCount}/{maxPlayers})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {playerCount === 0 ? (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">No players yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {battle.players?.map((player: any, index: number) => (
                      <div
                        key={player._id || index}
                        className="flex items-center gap-3 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg"
                      >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                          index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600' :
                          'bg-gradient-to-br from-gray-400 to-gray-600'
                        }`}>
                          {index === 0 && <Crown className="w-5 h-5" />}
                          {index > 0 && (index + 1)}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">
                            {player.name || player.email || 'Player'}
                          </p>
                          <p className="text-xs text-gray-500">Ready</p>
                        </div>
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      </div>
                    ))}
                    {[...Array(maxPlayers - playerCount)].map((_, index) => (
                      <div
                        key={`empty-${index}`}
                        className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300"
                      >
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <Users className="w-5 h-5 text-gray-400" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-400">Waiting...</p>
                          <p className="text-xs text-gray-400">Empty slot</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Rewards */}
            <Card className="border-0 shadow-xl bg-gradient-to-br from-yellow-50 to-orange-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-orange-600" />
                  Rewards
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                  <span className="text-sm font-medium text-gray-700">Winner XP</span>
                  <span className="font-bold text-purple-600 flex items-center gap-1">
                    <Zap className="w-4 h-4" />
                    {battle.xpReward || 100}
                  </span>
                </div>
                {battle.coinsReward && battle.coinsReward > 0 && (
                  <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                    <span className="text-sm font-medium text-gray-700">Winner Coins</span>
                    <span className="font-bold text-yellow-600 flex items-center gap-1">
                      <Trophy className="w-4 h-4" />
                      {battle.coinsReward}
                    </span>
                  </div>
                )}
                <div className="p-3 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg">
                  <p className="text-xs text-gray-700">
                    🏆 The winner takes all! Compete and claim your rewards.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
