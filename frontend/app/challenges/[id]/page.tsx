'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  Trophy,
  Clock,
  Target,
  Award,
  CheckCircle,
  Lock,
  Play,
  BookOpen,
  Brain,
  Layers,
  Zap,
  Star,
  ArrowLeft,
  TrendingUp,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface Activity {
  _id?: string;
  type: 'quiz' | 'lesson' | 'flashcard';
  title: string;
  description?: string;
  points: number;
  targetQuiz?: any;
  targetLesson?: any;
  targetFlashcard?: any;
  requiredScore?: number;
  index: number;
  completed: boolean;
  pointsEarned: number;
  completedAt?: string;
}

interface ChallengeData {
  _id: string;
  title: string;
  description: string;
  type: string;
  difficulty: 'easy' | 'medium' | 'hard';
  xpReward: number;
  coinsReward?: number;
  startDate: string;
  endDate: string;
  activities: Activity[];
  totalPoints: number;
  completionThreshold: number;
}

interface ProgressData {
  progress: number;
  pointsEarned: number;
  status: 'not_started' | 'in_progress' | 'completed' | 'failed';
  activityCompletions: any[];
}

interface Stats {
  totalActivities: number;
  completedActivities: number;
  totalPoints: number;
  earnedPoints: number;
  completionPercentage: number;
}

export default function ChallengeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const challengeId = params.id as string;

  const [challenge, setChallenge] = useState<ChallengeData | null>(null);
  const [progress, setProgress] = useState<ProgressData | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState<number | null>(null);

  useEffect(() => {
    loadChallengeDetails();
  }, [challengeId]);

  const loadChallengeDetails = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/challenges/${challengeId}/details`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();

      if (data.success) {
        setChallenge(data.data.challenge);
        setProgress(data.data.progress);
        setStats(data.data.stats);
      } else {
        toast.error(data.message || 'Failed to load challenge');
      }
    } catch (error: any) {
      console.error('Load challenge error:', error);
      toast.error('Failed to load challenge details');
    } finally {
      setLoading(false);
    }
  };

  const handleStartActivity = async (activity: Activity) => {
    if (activity.completed) {
      toast.info('This activity is already completed');
      return;
    }

    // Redirect to appropriate activity page
    switch (activity.type) {
      case 'quiz':
        if (activity.targetQuiz?._id) {
          router.push(`/quiz/${activity.targetQuiz._id}?challengeId=${challengeId}&activityIndex=${activity.index}`);
        } else {
          toast.error('Quiz not found');
        }
        break;
      case 'lesson':
        if (activity.targetLesson?._id) {
          router.push(`/lessons/${activity.targetLesson._id}?challengeId=${challengeId}&activityIndex=${activity.index}`);
        } else {
          toast.error('Lesson not found');
        }
        break;
      case 'flashcard':
        if (activity.targetFlashcard?._id) {
          router.push(`/flashcards/${activity.targetFlashcard._id}?challengeId=${challengeId}&activityIndex=${activity.index}`);
        } else {
          toast.error('Flashcard set not found');
        }
        break;
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'quiz':
        return <Brain className="w-5 h-5" />;
      case 'lesson':
        return <BookOpen className="w-5 h-5" />;
      case 'flashcard':
        return <Layers className="w-5 h-5" />;
      default:
        return <Target className="w-5 h-5" />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'from-green-400 to-green-600';
      case 'medium':
        return 'from-yellow-400 to-yellow-600';
      case 'hard':
        return 'from-red-400 to-red-600';
      default:
        return 'from-gray-400 to-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-teal-50 to-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-200 border-t-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading challenge...</p>
        </div>
      </div>
    );
  }

  if (!challenge || !progress || !stats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-teal-50 to-emerald-50 flex items-center justify-center">
        <Card className="max-w-md mx-4">
          <CardContent className="p-8 text-center">
            <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Challenge Not Found</h3>
            <p className="text-gray-600 mb-4">This challenge doesn't exist or you don't have access to it.</p>
            <Button onClick={() => router.push('/challenges')}>
              Back to Challenges
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-teal-50 to-emerald-50">
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

        {/* Challenge Header */}
        <Card className="mb-6 border-0 shadow-xl bg-gradient-to-br from-green-500 to-teal-600 text-white overflow-hidden">
          <CardContent className="p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r ${getDifficultyColor(challenge.difficulty)} text-white`}>
                    {challenge.difficulty.toUpperCase()}
                  </div>
                  {progress.status === 'completed' && (
                    <div className="flex items-center gap-1 px-3 py-1 bg-white/20 rounded-full text-xs font-semibold">
                      <CheckCircle className="w-3 h-3" />
                      Completed
                    </div>
                  )}
                </div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3">{challenge.title}</h1>
                <p className="text-green-50 text-sm sm:text-base mb-4">{challenge.description}</p>
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-yellow-300" />
                    <span className="font-bold">+{challenge.xpReward} XP</span>
                  </div>
                  {challenge.coinsReward && challenge.coinsReward > 0 && (
                    <div className="flex items-center gap-2">
                      <Trophy className="w-5 h-5 text-yellow-300" />
                      <span className="font-bold">+{challenge.coinsReward} Coins</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    <span className="text-sm">Ends {new Date(challenge.endDate).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              <div className="flex-shrink-0">
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center min-w-[120px]">
                  <div className="text-4xl font-bold mb-1">{Math.round(progress.progress)}%</div>
                  <div className="text-xs text-green-50">Complete</div>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="bg-white/20 rounded-full h-3 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-yellow-400 to-yellow-300 transition-all duration-500 rounded-full"
                style={{ width: `${progress.progress}%` }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="border-0 shadow-lg bg-white hover:shadow-xl transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Activities</p>
                  <p className="text-xl font-bold text-gray-900">{stats.completedActivities}/{stats.totalActivities}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white hover:shadow-xl transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Star className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Points</p>
                  <p className="text-xl font-bold text-gray-900">{stats.earnedPoints}/{stats.totalPoints}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white hover:shadow-xl transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Progress</p>
                  <p className="text-xl font-bold text-gray-900">{Math.round(stats.completionPercentage)}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white hover:shadow-xl transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                  <Award className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <p className="text-lg font-bold text-gray-900 capitalize">{progress.status.replace('_', ' ')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Activities List */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Trophy className="w-6 h-6 text-green-600" />
            Challenge Activities
          </h2>

          {challenge.activities && challenge.activities.length > 0 ? (
            challenge.activities.map((activity) => (
              <Card
                key={activity.index}
                className={`border-0 shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl ${
                  activity.completed ? 'bg-gradient-to-r from-green-50 to-teal-50' : 'bg-white'
                }`}
              >
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    {/* Activity Icon */}
                    <div className={`w-16 h-16 flex-shrink-0 rounded-xl flex items-center justify-center ${
                      activity.completed
                        ? 'bg-gradient-to-br from-green-500 to-teal-600 text-white'
                        : 'bg-gradient-to-br from-gray-100 to-gray-200 text-gray-600'
                    }`}>
                      {activity.completed ? (
                        <CheckCircle className="w-8 h-8" />
                      ) : (
                        getActivityIcon(activity.type)
                      )}
                    </div>

                    {/* Activity Info */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div>
                          <h3 className="text-lg font-bold text-gray-900 mb-1">{activity.title}</h3>
                          {activity.description && (
                            <p className="text-sm text-gray-600">{activity.description}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-full text-sm font-semibold">
                          <Star className="w-4 h-4" />
                          {activity.points} pts
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-sm">
                        <span className={`px-3 py-1 rounded-full font-medium ${
                          activity.type === 'quiz' ? 'bg-blue-100 text-blue-700' :
                          activity.type === 'lesson' ? 'bg-green-100 text-green-700' :
                          'bg-purple-100 text-purple-700'
                        }`}>
                          {activity.type.charAt(0).toUpperCase() + activity.type.slice(1)}
                        </span>
                        {activity.requiredScore && activity.requiredScore > 0 && (
                          <span className="text-gray-600">
                            Required Score: {activity.requiredScore}%
                          </span>
                        )}
                        {activity.completed && activity.completedAt && (
                          <span className="text-green-600 flex items-center gap-1">
                            <CheckCircle className="w-4 h-4" />
                            Completed {new Date(activity.completedAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="flex-shrink-0">
                      {activity.completed ? (
                        <Button
                          disabled
                          className="bg-green-600 text-white"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Completed
                        </Button>
                      ) : (
                        <Button
                          onClick={() => handleStartActivity(activity)}
                          className="bg-gradient-to-r from-green-500 to-teal-600 text-white hover:from-green-600 hover:to-teal-700"
                        >
                          <Play className="w-4 h-4 mr-2" />
                          Start
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="border-0 shadow-lg">
              <CardContent className="p-12 text-center">
                <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">No Activities Yet</h3>
                <p className="text-gray-600">This challenge doesn't have any activities configured yet.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
