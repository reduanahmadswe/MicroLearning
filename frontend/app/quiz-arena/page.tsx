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
  Users, 
  BookOpen,
  TrendingUp,
  Filter,
  Search,
  Play,
  CheckCircle,
  XCircle,
  BarChart3
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
      console.log('Quiz Arena - Fetched course-level quizzes:', data);
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
    .filter(quiz => 
      quiz.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quiz.course.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const handleStartQuiz = (quizId: string) => {
    router.push(`/quiz/${quizId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-purple-100">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl">
              <Trophy className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Quiz Arena
              </h1>
              <p className="text-gray-600 mt-1">Test your knowledge with course-level quizzes</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="w-5 h-5 text-purple-600" />
                <span className="text-sm text-gray-600">Available</span>
              </div>
              <p className="text-2xl font-bold text-purple-600">
                {quizzes.filter(q => !hasAttempted(q._id)).length}
              </p>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-sm text-gray-600">Completed</span>
              </div>
              <p className="text-2xl font-bold text-green-600">
                {myAttempts.length}
              </p>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-5 h-5 text-blue-600" />
                <span className="text-sm text-gray-600">Avg Score</span>
              </div>
              <p className="text-2xl font-bold text-blue-600">
                {myAttempts.length > 0 
                  ? Math.round(myAttempts.reduce((sum, a) => sum + a.score, 0) / myAttempts.length)
                  : 0}%
              </p>
            </div>

            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Award className="w-5 h-5 text-yellow-600" />
                <span className="text-sm text-gray-600">Pass Rate</span>
              </div>
              <p className="text-2xl font-bold text-yellow-600">
                {myAttempts.length > 0
                  ? Math.round((myAttempts.filter(a => a.passed).length / myAttempts.length) * 100)
                  : 0}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="bg-white rounded-xl shadow-lg p-4 border border-gray-100">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search quizzes or courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Filter Buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  filter === 'all'
                    ? 'bg-purple-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('available')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  filter === 'available'
                    ? 'bg-purple-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Available
              </button>
              <button
                onClick={() => setFilter('completed')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  filter === 'completed'
                    ? 'bg-purple-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Completed
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quiz Cards */}
      <div className="max-w-7xl mx-auto">
        {filteredQuizzes.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center border border-gray-100">
            <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No quizzes found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredQuizzes.map((quiz) => {
              const attempted = hasAttempted(quiz._id);
              const bestScore = getBestScore(quiz._id);

              return (
                <div
                  key={quiz._id}
                  className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 overflow-hidden group"
                >
                  {/* Course Thumbnail */}
                  <div className="relative h-40 bg-gradient-to-br from-purple-500 to-blue-600 overflow-hidden">
                    {quiz.course.thumbnail ? (
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
                    {attempted && (
                      <div className="absolute top-3 right-3 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                        <CheckCircle className="w-4 h-4" />
                        Completed
                      </div>
                    )}
                  </div>

                  {/* Quiz Info */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-2">
                      {quiz.title}
                    </h3>
                    <p className="text-purple-600 text-sm mb-3 flex items-center gap-1">
                      <BookOpen className="w-4 h-4" />
                      {quiz.course.title}
                    </p>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {quiz.description}
                    </p>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="bg-purple-50 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <Target className="w-4 h-4 text-purple-600" />
                          <span className="text-xs text-gray-600">Questions</span>
                        </div>
                        <p className="text-lg font-bold text-purple-600">
                          {quiz.questions.length}
                        </p>
                      </div>

                      <div className="bg-blue-50 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <Clock className="w-4 h-4 text-blue-600" />
                          <span className="text-xs text-gray-600">Time Limit</span>
                        </div>
                        <p className="text-lg font-bold text-blue-600">
                          {quiz.timeLimit || 'N/A'} min
                        </p>
                      </div>
                    </div>

                    {attempted && bestScore !== null && (
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-3 mb-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Your Best Score</span>
                          <span className="text-xl font-bold text-green-600">
                            {bestScore}%
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Action Button */}
                    <button
                      onClick={() => handleStartQuiz(quiz._id)}
                      className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-lg font-medium hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 group"
                    >
                      {attempted ? (
                        <>
                          <BarChart3 className="w-5 h-5 group-hover:scale-110 transition-transform" />
                          Retake Quiz
                        </>
                      ) : (
                        <>
                          <Play className="w-5 h-5 group-hover:scale-110 transition-transform" />
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
  );
}
