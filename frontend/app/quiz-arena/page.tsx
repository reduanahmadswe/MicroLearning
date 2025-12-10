'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  Trophy,
  Clock,
  Target,
  Award,
  BookOpen,
  Search,
  Play,
  CheckCircle,
  BarChart3,
  Filter
} from 'lucide-react';

interface Quiz {
  _id: string;
  title: string;
  description: string;
  course: {
    _id: string;
    title: string;
    thumbnail: string;
  };
  questions: any[];
  passingScore: number;
  timeLimit: number;
  attempts: number;
  averageScore: number;
  isPublished: boolean;
  difficulty: string;
  author: {
    _id: string;
    name: string;
  };
}

interface QuizAttempt {
  _id: string;
  quiz: string;
  score: number;
  passed: boolean;
  answers: any[];
  createdAt: string;
}

export default function QuizArenaPage() {
  const { user, token } = useAuthStore();
  const router = useRouter();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [myAttempts, setMyAttempts] = useState<QuizAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'available' | 'completed'>('all');
  const [difficultyFilter, setDifficultyFilter] = useState<'all' | 'beginner' | 'intermediate' | 'advanced'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!user || !token) {
      router.push('/auth/login');
      return;
    }
    fetchQuizzes();
    fetchMyAttempts();
  }, [user, token, router]);

  const fetchQuizzes = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/quiz?courseOnly=true`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setQuizzes(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch quizzes:', error);
      toast.error('Failed to load quizzes');
    } finally {
      setLoading(false);
    }
  };

  const fetchMyAttempts = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/quiz/attempts/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setMyAttempts(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch attempts:', error);
    }
  };

  const hasAttempted = (quizId: string) => {
    return myAttempts.some(attempt => attempt.quiz === quizId);
  };

  const getBestScore = (quizId: string) => {
    const attempts = myAttempts.filter(a => a.quiz === quizId);
    if (attempts.length === 0) return null;
    return Math.max(...attempts.map(a => a.score));
  };

  const filteredQuizzes = quizzes
    .filter(quiz => {
      if (filter === 'available') return !hasAttempted(quiz._id);
      if (filter === 'completed') return hasAttempted(quiz._id);
      return true;
    })
    .filter(quiz => {
      if (difficultyFilter === 'all') return true;
      return quiz.difficulty === difficultyFilter;
    })
    .filter(quiz =>
      quiz.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quiz.course?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quiz.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const handleStartQuiz = (quizId: string) => {
    router.push(`/quiz/${quizId}`);
  };

  const stats = {
    available: quizzes.filter(q => !hasAttempted(q._id)).length,
    completed: myAttempts.length,
    avgScore: myAttempts.length > 0
      ? Math.round(myAttempts.reduce((sum, a) => sum + a.score, 0) / myAttempts.length)
      : 0,
    passRate: myAttempts.length > 0
      ? Math.round((myAttempts.filter(a => a.passed).length / myAttempts.length) * 100)
      : 0,
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800';
      default: return 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-page-gradient flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading quizzes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-page-gradient">
      {/* Header Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Trophy className="w-6 h-6 text-white" />
                </div>
                Quiz Arena
              </h1>
              <p className="mt-2 text-muted-foreground">Test your knowledge with course-level quizzes</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-card rounded-2xl p-6 shadow-lg border border-border/50 hover:shadow-xl transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Available</p>
                <p className="text-3xl font-bold text-foreground">{stats.available}</p>
              </div>
              <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                <BookOpen className="w-7 h-7 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-card rounded-2xl p-6 shadow-lg border border-border/50 hover:shadow-xl transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Completed</p>
                <p className="text-3xl font-bold text-foreground">{stats.completed}</p>
              </div>
              <div className="w-14 h-14 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-7 h-7 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-card rounded-2xl p-6 shadow-lg border border-border/50 hover:shadow-xl transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Avg Score</p>
                <p className="text-3xl font-bold text-foreground">{stats.avgScore}%</p>
              </div>
              <div className="w-14 h-14 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                <Target className="w-7 h-7 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </div>

          <div className="bg-card rounded-2xl p-6 shadow-lg border border-border/50 hover:shadow-xl transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Pass Rate</p>
                <p className="text-3xl font-bold text-foreground">{stats.passRate}%</p>
              </div>
              <div className="w-14 h-14 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center">
                <Award className="w-7 h-7 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-card rounded-2xl shadow-lg border border-border/50 p-6 mb-8">
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search quizzes or courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-foreground placeholder:text-muted-foreground"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4">
              {/* Status Filter */}
              <div className="flex-1 min-w-[200px]">
                <label className="text-sm font-semibold text-foreground mb-2 block">Status</label>
                <div className="flex gap-2">
                  {(['all', 'available', 'completed'] as const).map((f) => (
                    <button
                      key={f}
                      onClick={() => setFilter(f)}
                      className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === f
                          ? 'bg-primary text-primary-foreground shadow-md'
                          : 'bg-muted text-muted-foreground hover:bg-muted/80'
                        }`}
                    >
                      {f.charAt(0).toUpperCase() + f.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Difficulty Filter */}
              <div className="flex-1 min-w-[200px]">
                <label className="text-sm font-semibold text-foreground mb-2 block">Difficulty</label>
                <div className="flex gap-2">
                  {(['all', 'beginner', 'intermediate', 'advanced'] as const).map((d) => (
                    <button
                      key={d}
                      onClick={() => setDifficultyFilter(d)}
                      className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${difficultyFilter === d
                          ? 'bg-primary text-primary-foreground shadow-md'
                          : 'bg-muted text-muted-foreground hover:bg-muted/80'
                        }`}
                    >
                      {d === 'all' ? 'All' : d.charAt(0).toUpperCase() + d.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quiz Grid */}
        <div>
          {filteredQuizzes.length === 0 ? (
            <div className="bg-card rounded-2xl shadow-lg border border-border/50 p-12 text-center">
              <Trophy className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
              <p className="text-foreground text-lg">No quizzes found</p>
              <p className="text-muted-foreground text-sm mt-2">Try adjusting your filters or search query</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredQuizzes.map((quiz) => {
                const attempted = hasAttempted(quiz._id);
                const bestScore = getBestScore(quiz._id);

                return (
                  <div
                    key={quiz._id}
                    className="bg-card rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-border/50 overflow-hidden group"
                  >
                    {/* Course Header */}
                    <div className="relative h-40 bg-gradient-to-br from-green-500 to-teal-600 overflow-hidden">
                      {quiz.course?.thumbnail ? (
                        <img
                          src={quiz.course.thumbnail}
                          alt={quiz.course.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <BookOpen className="w-16 h-16 text-white opacity-50" />
                        </div>
                      )}

                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

                      {/* Course Name */}
                      <div className="absolute bottom-3 left-3 right-3">
                        <p className="text-white text-sm font-medium flex items-center gap-2">
                          <BookOpen className="w-4 h-4" />
                          <span className="truncate">{quiz.course?.title || 'Course'}</span>
                        </p>
                      </div>

                      {/* Status Badge */}
                      {attempted && (
                        <div className="absolute top-3 right-3 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 shadow-sm">
                          <CheckCircle className="w-3 h-3" />
                          Completed
                        </div>
                      )}

                      {/* Difficulty Badge */}
                      <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold border shadow-sm ${getDifficultyColor(quiz.difficulty)}`}>
                        {quiz.difficulty || 'Medium'}
                      </div>
                    </div>

                    {/* Quiz Content */}
                    <div className="p-6">
                      <h3 className="text-lg font-bold text-foreground mb-2 line-clamp-2">
                        {quiz.title}
                      </h3>

                      {quiz.description && (
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                          {quiz.description}
                        </p>
                      )}

                      {/* Stats Grid */}
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="bg-secondary rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <Target className="w-4 h-4 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">Questions</span>
                          </div>
                          <p className="text-lg font-bold text-foreground">
                            {quiz.questions?.length || 0}
                          </p>
                        </div>

                        <div className="bg-secondary rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <Clock className="w-4 h-4 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">Duration</span>
                          </div>
                          <p className="text-lg font-bold text-foreground">
                            {quiz.timeLimit || 'N/A'} min
                          </p>
                        </div>
                      </div>

                      {/* Best Score */}
                      {attempted && bestScore !== null && (
                        <div className="bg-gradient-to-r from-green-50 to-teal-50 dark:from-green-900/10 dark:to-teal-900/10 rounded-lg p-3 mb-4 border border-green-100 dark:border-green-900/30">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-foreground font-medium">Best Score</span>
                            <span className="text-xl font-bold text-green-600 dark:text-green-400">
                              {bestScore}%
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Action Button */}
                      <button
                        onClick={() => handleStartQuiz(quiz._id)}
                        className="w-full bg-gradient-to-r from-green-600 to-teal-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg hover:from-green-700 hover:to-teal-700 transition-all duration-300 flex items-center justify-center gap-2"
                      >
                        {attempted ? (
                          <>
                            <BarChart3 className="w-5 h-5" />
                            Retake Quiz
                          </>
                        ) : (
                          <>
                            <Play className="w-5 h-5" />
                            Start Quiz
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

