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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
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
              <h1 className="text-3xl font-bold text-gray-900">Quiz Arena</h1>
              <p className="text-gray-600 mt-1">Test your knowledge and compete</p>
            </div>
            <Button
              onClick={() => setShowAIModal(true)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Generate Quiz with AI
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Quizzes Taken</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {userStats?.totalQuizzes || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                  <Brain className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Average Score</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {userStats?.averageScore || 0}%
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                  <Target className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Pass Rate</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {userStats?.passRate || 0}%
                  </p>
                </div>
                <div className="w-12 h-12 bg-yellow-50 rounded-lg flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Best Streak</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {userStats?.bestStreak || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="mb-8 space-y-4">
          <form onSubmit={handleSearch} className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search quizzes..."
                className="pl-10"
              />
            </div>
            <Button type="submit">Search</Button>
          </form>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Difficulty:</span>
            <div className="flex gap-2">
              <Button
                variant={selectedDifficulty === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedDifficulty('all')}
              >
                All
              </Button>
              {difficulties.map((diff) => (
                <Button
                  key={diff}
                  variant={selectedDifficulty === diff ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedDifficulty(diff)}
                >
                  {diff.charAt(0).toUpperCase() + diff.slice(1)}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Quizzes Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredQuizzes.length === 0 ? (
          <Card className="p-12 text-center">
            <Brain className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No quizzes found</h3>
            <p className="text-gray-600 mb-4">Try adjusting your filters or generate a new quiz with AI</p>
            <Button onClick={() => setShowAIModal(true)}>
              <Sparkles className="w-4 h-4 mr-2" />
              Generate with AI
            </Button>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredQuizzes.map((quiz) => (
              <Card key={quiz._id} className="hover:shadow-xl transition-all hover:-translate-y-1">
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                      quiz.difficulty === 'beginner' ? 'bg-green-100 text-green-700' :
                      quiz.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {quiz.difficulty}
                    </div>
                    <div className="flex items-center gap-1 text-gray-500">
                      <Brain className="w-4 h-4" />
                      <span className="text-xs">{quiz.questions?.length || 0} Q</span>
                    </div>
                  </div>
                  <CardTitle className="text-lg line-clamp-2">{quiz.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{quiz.description}</p>

                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{quiz.timeLimit || 'No'} min</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Target className="w-4 h-4" />
                      <span>{quiz.passingScore}% to pass</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <div className="text-xs text-gray-500">
                      {quiz.totalAttempts || 0} attempts
                    </div>
                  </div>

                  <Link href={`/quiz/${quiz._id}`}>
                    <Button className="w-full">
                      <PlayCircle className="w-4 h-4 mr-2" />
                      Start Quiz
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Recent Results */}
        <div className="mt-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Your Recent Results</h2>
            <Link href="/quiz/history">
              <Button variant="ghost" size="sm">View All</Button>
            </Link>
          </div>
          <Card>
            <CardContent className="p-6">
              <p className="text-gray-500 text-center py-8">
                Take a quiz to see your results here
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* AI Generation Modal */}
      {showAIModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                Generate Quiz with AI
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Quiz Topic
                </label>
                <Input
                  value={aiForm.topic}
                  onChange={(e) => setAiForm({ ...aiForm, topic: e.target.value })}
                  placeholder="e.g., React Hooks, World History, etc."
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Difficulty Level
                </label>
                <select
                  value={aiForm.difficulty}
                  onChange={(e) => setAiForm({ ...aiForm, difficulty: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Number of Questions
                </label>
                <select
                  value={aiForm.questionCount}
                  onChange={(e) => setAiForm({ ...aiForm, questionCount: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value={5}>5 Questions</option>
                  <option value={10}>10 Questions</option>
                  <option value={15}>15 Questions</option>
                  <option value={20}>20 Questions</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowAIModal(false)}
                  disabled={aiGenerating}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleGenerateAIQuiz}
                  disabled={aiGenerating}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600"
                >
                  {aiGenerating ? 'Generating...' : 'Generate'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
