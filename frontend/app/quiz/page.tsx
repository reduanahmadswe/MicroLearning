'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Brain,
  Clock,
  Target,
  Trophy,
  TrendingUp,
  Sparkles,
  Filter,
  Search,
  PlayCircle,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { quizAPI, aiAPI } from '@/services/api.service';
import { toast } from 'sonner';
import { Quiz } from '@/types';

export default function QuizListPage() {
  const router = useRouter();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [showAIModal, setShowAIModal] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiForm, setAiForm] = useState({
    topic: '',
    difficulty: 'beginner',
    questionCount: 10,
  });
  const [userStats, setUserStats] = useState<any>(null);

  const difficulties = ['beginner', 'intermediate', 'advanced'];

  useEffect(() => {
    loadQuizzes();
    loadUserStats();
  }, [selectedDifficulty]);

  const loadQuizzes = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (selectedDifficulty !== 'all') params.difficulty = selectedDifficulty;
      if (searchQuery) params.search = searchQuery;

      const response = await quizAPI.getQuizzes(params);
      setQuizzes(response.data.data || []);
    } catch (error: any) {
      toast.error('Failed to load quizzes');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserStats = async () => {
    try {
      const response = await quizAPI.getUserStats();
      setUserStats(response.data.data);
    } catch (error: any) {
      console.error('Failed to load stats:', error);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadQuizzes();
  };

  const handleGenerateAIQuiz = async () => {
    if (!aiForm.topic.trim()) {
      toast.error('Please enter a topic');
      return;
    }

    setAiGenerating(true);
    try {
      const response = await aiAPI.generateQuiz({
        topic: aiForm.topic,
        difficulty: aiForm.difficulty,
        questionCount: aiForm.questionCount,
      });

      toast.success('AI Quiz generated successfully!');
      setShowAIModal(false);
      setAiForm({ topic: '', difficulty: 'beginner', questionCount: 10 });
      loadQuizzes();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to generate quiz');
    } finally {
      setAiGenerating(false);
    }
  };

  const filteredQuizzes = quizzes.filter(quiz => {
    if (searchQuery && !quiz.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-slate-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
          <div className="w-full sm:w-auto">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 flex items-center gap-2 sm:gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-green-600 to-teal-600 rounded-xl flex items-center justify-center shadow-md">
                <Brain className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              Quiz Arena
            </h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">Test your knowledge and compete</p>
          </div>
          <Button
            onClick={() => setShowAIModal(true)}
            className="w-full sm:w-auto bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 shadow-md hover:shadow-lg transition-all h-10 sm:h-11 text-sm sm:text-base"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Generate Quiz with AI
          </Button>
        </div>
        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 lg:gap-4 mb-6 sm:mb-8">
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-3 sm:p-4 lg:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600 mb-0.5 sm:mb-1">Quizzes Taken</p>
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
                    {userStats?.totalQuizzes || 0}
                  </p>
                </div>
                <div className="w-9 h-9 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-teal-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Brain className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-teal-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-3 sm:p-4 lg:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600 mb-0.5 sm:mb-1">Average Score</p>
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
                    {userStats?.averageScore || 0}%
                  </p>
                </div>
                <div className="w-9 h-9 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Target className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-3 sm:p-4 lg:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600 mb-0.5 sm:mb-1">Pass Rate</p>
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
                    {userStats?.passRate || 0}%
                  </p>
                </div>
                <div className="w-9 h-9 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-yellow-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Trophy className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-3 sm:p-4 lg:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600 mb-0.5 sm:mb-1">Best Streak</p>
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
                    {userStats?.bestStreak || 0}
                  </p>
                </div>
                <div className="w-9 h-9 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-orange-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="mb-6 sm:mb-8 space-y-3 sm:space-y-4">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2.5 sm:gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search quizzes..."
                className="pl-9 sm:pl-10 h-10 sm:h-11 text-sm sm:text-base"
              />
            </div>
            <Button type="submit" className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white h-10 sm:h-11 text-sm sm:text-base">Search</Button>
          </form>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 bg-white p-3 sm:p-4 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-500" />
              <span className="text-xs sm:text-sm font-medium text-gray-700">Difficulty:</span>
            </div>
            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              <Button
                variant={selectedDifficulty === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedDifficulty('all')}
                className={`h-8 text-xs sm:text-sm ${
                  selectedDifficulty === 'all' ? 'bg-green-600 hover:bg-green-700' : ''
                }`}
              >
                All
              </Button>
              {difficulties.map((diff) => (
                <Button
                  key={diff}
                  variant={selectedDifficulty === diff ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedDifficulty(diff)}
                  className={`h-8 text-xs sm:text-sm ${
                    selectedDifficulty === diff ? 'bg-green-600 hover:bg-green-700' : ''
                  }`}
                >
                  {diff.charAt(0).toUpperCase() + diff.slice(1)}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Quizzes Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-12 sm:py-16 lg:py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-green-600 mx-auto"></div>
              <p className="mt-3 sm:mt-4 text-sm sm:text-base text-gray-600">Loading quizzes...</p>
            </div>
          </div>
        ) : filteredQuizzes.length === 0 ? (
          <Card className="p-8 sm:p-10 lg:p-12 text-center shadow-md">
            <Brain className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 text-gray-300 mx-auto mb-3 sm:mb-4" />
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">No quizzes found</h3>
            <p className="text-sm sm:text-base text-gray-600 mb-4">Try adjusting your filters or generate a new quiz with AI</p>
            <Button onClick={() => setShowAIModal(true)} className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700">
              <Sparkles className="w-4 h-4 mr-2" />
              Generate with AI
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
            {filteredQuizzes.map((quiz) => (
              <Card key={quiz._id} className="hover:shadow-xl transition-all hover:-translate-y-1 border-gray-200 shadow-sm">
                <CardHeader className="pb-3 sm:pb-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className={`px-2.5 sm:px-3 py-1 rounded-full text-xs font-semibold border ${
                      quiz.difficulty === 'beginner' ? 'bg-green-50 text-green-700 border-green-200' :
                      quiz.difficulty === 'intermediate' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                      'bg-red-50 text-red-700 border-red-200'
                    }`}>
                      {quiz.difficulty}
                    </div>
                    <div className="flex items-center gap-1 text-gray-500">
                      <Brain className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      <span className="text-xs">{quiz.questions?.length || 0} Q</span>
                    </div>
                  </div>
                  <CardTitle className="text-base sm:text-lg leading-snug line-clamp-2">{quiz.title}</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4 line-clamp-2 leading-relaxed">{quiz.description}</p>

                  <div className="flex items-center justify-between text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      <span>{quiz.timeLimit || 'No'} min</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Target className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      <span>{quiz.passingScore}% to pass</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <div className="text-xs text-gray-500">
                      {quiz.totalAttempts || 0} attempts
                    </div>
                  </div>

                  <Link href={`/quiz/${quiz._id}`}>
                    <Button className="w-full bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white shadow-md hover:shadow-lg transition-all h-9 sm:h-10 text-sm sm:text-base">
                      <PlayCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2" />
                      Start Quiz
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Recent Results */}
        <div className="mt-8 sm:mt-10 lg:mt-12">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Your Recent Results</h2>
            <Link href="/quiz/history">
              <Button variant="ghost" size="sm" className="h-8 sm:h-9 text-xs sm:text-sm">View All</Button>
            </Link>
          </div>
          <Card className="shadow-sm">
            <CardContent className="p-4 sm:p-6">
              <p className="text-sm sm:text-base text-gray-500 text-center py-6 sm:py-8">
                Take a quiz to see your results here
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* AI Generation Modal */}
      {showAIModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 sm:p-4">
          <Card className="w-full max-w-md shadow-2xl">
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-green-600 to-teal-600 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                Generate Quiz with AI
              </CardTitle>
              <p className="text-xs sm:text-sm text-gray-600 mt-1.5 sm:mt-2">Create a custom quiz on any topic using AI</p>
            </CardHeader>
            <CardContent className="space-y-3.5 sm:space-y-4">
              <div>
                <label className="text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2 block">
                  Quiz Topic
                </label>
                <Input
                  value={aiForm.topic}
                  onChange={(e) => setAiForm({ ...aiForm, topic: e.target.value })}
                  placeholder="e.g., React Hooks, World History, etc."
                  className="h-10 sm:h-11 text-sm sm:text-base"
                />
              </div>

              <div>
                <label className="text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2 block">
                  Difficulty Level
                </label>
                <select
                  value={aiForm.difficulty}
                  onChange={(e) => setAiForm({ ...aiForm, difficulty: e.target.value })}
                  className="w-full px-3 py-2 sm:py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm sm:text-base h-10 sm:h-11 bg-white text-gray-900"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>

              <div>
                <label className="text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2 block">
                  Number of Questions
                </label>
                <select
                  value={aiForm.questionCount}
                  onChange={(e) => setAiForm({ ...aiForm, questionCount: Number(e.target.value) })}
                  className="w-full px-3 py-2 sm:py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm sm:text-base h-10 sm:h-11 bg-white text-gray-900"
                >
                  <option value={5}>5 Questions</option>
                  <option value={10}>10 Questions</option>
                  <option value={15}>15 Questions</option>
                  <option value={20}>20 Questions</option>
                </select>
              </div>

              <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 pt-2 sm:pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowAIModal(false)}
                  disabled={aiGenerating}
                  className="flex-1 h-10 sm:h-11 text-sm sm:text-base"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleGenerateAIQuiz}
                  disabled={aiGenerating}
                  className="flex-1 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 shadow-md hover:shadow-lg transition-all h-10 sm:h-11 text-sm sm:text-base font-medium"
                >
                  {aiGenerating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generate
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
