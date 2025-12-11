'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useAppDispatch } from '@/store/hooks';
import {
  useInstructorQuizzes,
  useInstructorQuizzesLoading,
  useInstructorQuizzesError,
} from '@/store/hooks';
import { fetchInstructorQuizzes } from '@/store/globalSlice';
import {
  Plus,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Copy,
  Eye,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  BarChart3,
  Calendar,
  BookOpen,
  Award,
  TrendingUp,
  Download,
  Share2,
  Settings,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';

interface Quiz {
  _id: string;
  title: string;
  description: string;
  course: {
    _id: string;
    title: string;
  };
  questions: any[];
  duration: number;
  passingScore: number;
  totalAttempts: number;
  averageScore: number;
  published: boolean;
  createdAt: string;
}

export default function InstructorQuizzesPage() {
  const router = useRouter();
  const { user, token } = useAuthStore();
  const dispatch = useAppDispatch();

  // Redux state
  const quizzes = useInstructorQuizzes() as Quiz[];
  const loading = useInstructorQuizzesLoading();
  const error = useInstructorQuizzesError();

  // Local UI state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'published' | 'draft'>('all');
  const [selectedQuiz, setSelectedQuiz] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    passingScore: 80,
    duration: 0,
    questions: [] as any[],
  });

  useEffect(() => {
    if (!user || user.role !== 'instructor') {
      router.push('/');
      return;
    }

    // Fetch quizzes (will use cache if available)
    dispatch(fetchInstructorQuizzes({}));
  }, [user, router, dispatch]);

  // Show error toast
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const handleRefresh = () => {
    dispatch(fetchInstructorQuizzes({ force: true }));
    toast.success('Refreshing quizzes...');
  };

  // Calculate stats from quizzes
  const stats = {
    totalQuizzes: quizzes.length,
    publishedQuizzes: quizzes.filter(q => q.published).length,
    totalAttempts: quizzes.reduce((sum, q) => sum + (q.totalAttempts || 0), 0),
    averageScore: quizzes.length > 0
      ? Math.round(quizzes.reduce((sum, q) => sum + (q.averageScore || 0) * (q.totalAttempts || 0), 0) /
        Math.max(quizzes.reduce((sum, q) => sum + (q.totalAttempts || 0), 0), 1))
      : 0
  };

  const filteredQuizzes = quizzes.filter(quiz => {
    const matchesSearch = quiz.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quiz.course?.title?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' ||
      (filterStatus === 'published' && quiz.published) ||
      (filterStatus === 'draft' && !quiz.published);
    return matchesSearch && matchesFilter;
  });

  const handleDeleteQuiz = async (quizId: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/quiz/${quizId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete quiz');
      }

      toast.success('Quiz deleted successfully');
      setShowDeleteModal(false);
      setSelectedQuiz(null);

      // Refresh quizzes
      dispatch(fetchInstructorQuizzes({ force: true }));
    } catch (error) {
      console.error('Error deleting quiz:', error);
      toast.error('Failed to delete quiz');
    }
  };

  const handleDuplicateQuiz = async (quizId: string) => {
    try {
      setSelectedQuiz(null);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/quiz/${quizId}/duplicate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to duplicate quiz');
      }

      toast.success('Quiz duplicated successfully');

      // Refresh quizzes
      dispatch(fetchInstructorQuizzes({ force: true }));
    } catch (error) {
      console.error('Error duplicating quiz:', error);
      toast.error('Failed to duplicate quiz');
    }
  };

  const handleTogglePublish = async (quizId: string) => {
    try {
      setSelectedQuiz(null);
      const quiz = quizzes.find(q => q._id === quizId);
      if (!quiz) return;

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/quiz/${quizId}/publish`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to update quiz status');
      }

      const data = await response.json();
      toast.success(`Quiz ${data.data.published ? 'published' : 'unpublished'} successfully`);

      // Refresh quizzes
      dispatch(fetchInstructorQuizzes({ force: true }));
    } catch (error) {
      console.error('Error updating quiz status:', error);
      toast.error('Failed to update quiz status');
    }
  };

  const handleEditQuiz = (quiz: Quiz) => {
    setEditingQuiz(quiz);
    setEditForm({
      title: quiz.title,
      description: quiz.description,
      passingScore: quiz.passingScore,
      duration: quiz.duration,
      questions: quiz.questions || [],
    });
    setShowEditModal(true);
    setSelectedQuiz(null);
  };

  const handleQuestionChange = (index: number, field: string, value: any) => {
    const updatedQuestions = [...editForm.questions];
    updatedQuestions[index] = {
      ...updatedQuestions[index],
      [field]: value,
    };
    setEditForm({ ...editForm, questions: updatedQuestions });
  };

  const handleOptionChange = (questionIndex: number, optionIndex: number, value: string) => {
    const updatedQuestions = [...editForm.questions];
    const options = [...(updatedQuestions[questionIndex].options || [])];
    options[optionIndex] = value;
    updatedQuestions[questionIndex] = {
      ...updatedQuestions[questionIndex],
      options,
    };
    setEditForm({ ...editForm, questions: updatedQuestions });
  };

  const handleUpdateQuiz = async () => {
    if (!editingQuiz) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/quiz/${editingQuiz._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editForm)
      });

      if (!response.ok) {
        throw new Error('Failed to update quiz');
      }

      toast.success('Quiz updated successfully');
      setShowEditModal(false);
      setEditingQuiz(null);

      // Refresh quizzes
      dispatch(fetchInstructorQuizzes({ force: true }));
    } catch (error) {
      console.error('Error updating quiz:', error);
      toast.error('Failed to update quiz');
    }
  };

  if (loading && quizzes.length === 0) {
    return (
      <div className="min-h-screen bg-page-gradient flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading quizzes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-page-gradient">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-600 rounded-xl flex items-center justify-center">
                  <Award className="w-6 h-6 text-white" />
                </div>
                My Quizzes
              </h1>
              <p className="mt-2 text-muted-foreground">Create and manage quizzes for your courses</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-3 bg-secondary text-foreground rounded-xl hover:bg-secondary/80 transition-all font-medium disabled:opacity-50"
              >
                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">{loading ? 'Refreshing...' : 'Refresh'}</span>
              </button>
              <button
                onClick={() => router.push('/instructor/quizzes/create')}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-xl hover:shadow-lg transition-all font-semibold"
              >
                <Plus className="w-5 h-5" />
                <span>Create Quiz</span>
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-card rounded-2xl p-6 shadow-sm border border-border hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Quizzes</p>
                <p className="text-3xl font-bold text-foreground">{stats.totalQuizzes}</p>
              </div>
              <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/20 rounded-xl flex items-center justify-center">
                <BookOpen className="w-7 h-7 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-card rounded-2xl p-6 shadow-sm border border-border hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Published</p>
                <p className="text-3xl font-bold text-foreground">{stats.publishedQuizzes}</p>
              </div>
              <div className="w-14 h-14 bg-green-100 dark:bg-green-900/20 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-7 h-7 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-card rounded-2xl p-6 shadow-sm border border-border hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Attempts</p>
                <p className="text-3xl font-bold text-foreground">{stats.totalAttempts}</p>
              </div>
              <div className="w-14 h-14 bg-purple-100 dark:bg-purple-900/20 rounded-xl flex items-center justify-center">
                <Users className="w-7 h-7 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </div>

          <div className="bg-card rounded-2xl p-6 shadow-sm border border-border hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Avg. Score</p>
                <p className="text-3xl font-bold text-foreground">{stats.averageScore}%</p>
              </div>
              <div className="w-14 h-14 bg-orange-100 dark:bg-orange-900/20 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-7 h-7 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-card rounded-2xl shadow-sm border border-border p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search quizzes by title or course..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-border rounded-xl bg-background text-foreground focus:ring-2 focus:ring-green-500 focus:border-transparent placeholder:text-muted-foreground"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-6 py-3 rounded-xl font-medium transition-all ${filterStatus === 'all'
                  ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-2 border-green-300 dark:border-green-800'
                  : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
                  }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterStatus('published')}
                className={`px-6 py-3 rounded-xl font-medium transition-all ${filterStatus === 'published'
                  ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-2 border-green-300 dark:border-green-800'
                  : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
                  }`}
              >
                Published
              </button>
              <button
                onClick={() => setFilterStatus('draft')}
                className={`px-6 py-3 rounded-xl font-medium transition-all ${filterStatus === 'draft'
                  ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-2 border-green-300 dark:border-green-800'
                  : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
                  }`}
              >
                Draft
              </button>
            </div>
          </div>
        </div>

        {/* Quizzes Grid */}
        {filteredQuizzes.length === 0 ? (
          <div className="bg-card rounded-2xl shadow-sm border border-border p-12 text-center">
            <AlertCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">No quizzes found</h3>
            <p className="text-muted-foreground mb-6">
              {searchQuery ? 'Try adjusting your search or filter' : 'Create your first quiz to get started'}
            </p>
            {!searchQuery && (
              <button
                onClick={() => router.push('/instructor/quizzes/create')}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-xl hover:shadow-lg transition-all font-semibold"
              >
                <Plus className="w-5 h-5" />
                Create Your First Quiz
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredQuizzes.map((quiz) => (
              <div
                key={quiz._id}
                className="bg-card rounded-2xl shadow-sm border border-border hover:shadow-xl hover:border-green-200 dark:hover:border-green-800 transition-all overflow-hidden group"
              >
                {/* Card Header */}
                <div className={`h-2 ${quiz.published ? 'bg-gradient-to-r from-green-500 to-teal-500' : 'bg-gray-300 dark:bg-gray-700'}`}></div>

                <div className="p-6">
                  {/* Status Badge */}
                  <div className="flex items-center justify-between mb-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${quiz.published
                      ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                      : 'bg-secondary text-muted-foreground'
                      }`}>
                      {quiz.published ? 'Published' : 'Draft'}
                    </span>
                    <div className="relative">
                      <button
                        onClick={() => setSelectedQuiz(selectedQuiz === quiz._id ? null : quiz._id)}
                        className="p-2 hover:bg-secondary rounded-lg transition-colors"
                      >
                        <MoreVertical className="w-5 h-5 text-muted-foreground" />
                      </button>

                      {/* Dropdown Menu */}
                      {selectedQuiz === quiz._id && (
                        <div className="absolute right-0 mt-2 w-48 bg-card rounded-xl shadow-xl border border-border py-2 z-10">
                          <button
                            onClick={() => handleEditQuiz(quiz)}
                            className="w-full px-4 py-2 text-left hover:bg-secondary flex items-center gap-2 text-foreground"
                          >
                            <Edit className="w-4 h-4" />
                            Edit Quiz
                          </button>
                          <button
                            onClick={() => {
                              setSelectedQuiz(null);
                              router.push(`/instructor/quizzes/${quiz._id}/results`);
                            }}
                            className="w-full px-4 py-2 text-left hover:bg-secondary flex items-center gap-2 text-foreground"
                          >
                            <BarChart3 className="w-4 h-4" />
                            View Results
                          </button>
                          <button
                            onClick={() => handleDuplicateQuiz(quiz._id)}
                            className="w-full px-4 py-2 text-left hover:bg-secondary flex items-center gap-2 text-foreground"
                          >
                            <Copy className="w-4 h-4" />
                            Duplicate
                          </button>
                          <button
                            onClick={() => handleTogglePublish(quiz._id)}
                            className="w-full px-4 py-2 text-left hover:bg-secondary flex items-center gap-2 text-foreground"
                          >
                            {quiz.published ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                            {quiz.published ? 'Unpublish' : 'Publish'}
                          </button>
                          <hr className="my-2" />
                          <button
                            onClick={() => {
                              setSelectedQuiz(quiz._id);
                              setShowDeleteModal(true);
                            }}
                            className="w-full px-4 py-2 text-left hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2 text-red-600 dark:text-red-400"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Quiz Title & Course */}
                  <h3 className="text-lg font-bold text-foreground mb-2 line-clamp-2 group-hover:text-green-600 transition-colors">
                    {quiz.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4 flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    {quiz.course?.title || 'No Course'}
                  </p>

                  {/* Quiz Info */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground flex items-center gap-2">
                        <Award className="w-4 h-4" />
                        Questions
                      </span>
                      <span className="font-semibold text-foreground">{quiz.questions?.length || 0}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Duration
                      </span>
                      <span className="font-semibold text-foreground">{quiz.duration} min</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        Attempts
                      </span>
                      <span className="font-semibold text-foreground">{quiz.totalAttempts || 0}</span>
                    </div>
                  </div>

                  {/* Stats Bar */}
                  {(quiz.totalAttempts || 0) > 0 && (
                    <div className="mb-4">
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-muted-foreground">Average Score</span>
                        <span className="font-bold text-green-600 dark:text-green-400">{quiz.averageScore || 0}%</span>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-green-500 to-teal-500 transition-all duration-500"
                          style={{ width: `${quiz.averageScore || 0}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-4 border-t border-border">
                    <button
                      onClick={() => handleEditQuiz(quiz)}
                      className="flex-1 px-4 py-2 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors font-medium text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => router.push(`/instructor/quizzes/${quiz._id}/results`)}
                      className="flex-1 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors font-medium text-sm"
                    >
                      Results
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-2xl max-w-md w-full p-6 border border-border">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-xl font-bold text-foreground text-center mb-2">Delete Quiz?</h3>
            <p className="text-muted-foreground text-center mb-6">
              This action cannot be undone. All quiz data and student results will be permanently deleted.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedQuiz(null);
                }}
                className="flex-1 px-4 py-3 bg-secondary text-foreground rounded-xl hover:bg-secondary/80 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => selectedQuiz && handleDeleteQuiz(selectedQuiz)}
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Quiz Modal - Simplified version */}
      {showEditModal && editingQuiz && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto border border-border">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                  <Edit className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground">Edit Quiz</h3>
                  <p className="text-sm text-muted-foreground">Update quiz details</p>
                </div>
              </div>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-2 hover:bg-secondary rounded-lg transition-colors"
              >
                <XCircle className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Quiz Title *
                </label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter quiz title"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Description *
                </label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                  placeholder="Enter quiz description"
                />
              </div>

              {/* Duration & Passing Score */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Duration (minutes)
                  </label>
                  <input
                    type="number"
                    value={editForm.duration}
                    onChange={(e) => setEditForm({ ...editForm, duration: Number(e.target.value) })}
                    min="0"
                    className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="0 for unlimited"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Passing Score (%)
                  </label>
                  <input
                    type="number"
                    value={editForm.passingScore}
                    onChange={(e) => setEditForm({ ...editForm, passingScore: Number(e.target.value) })}
                    min="0"
                    max="100"
                    className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="80"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-border">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-4 py-3 bg-secondary text-foreground rounded-xl hover:bg-secondary/80 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateQuiz}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-xl hover:shadow-lg transition-all font-medium"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
