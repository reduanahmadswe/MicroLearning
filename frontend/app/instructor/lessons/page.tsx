'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useAuthStore } from '@/store/authStore';
import { ArrowLeft, BookOpen, Edit, Trash2, FileQuestion, Search, Filter } from 'lucide-react';
import { toast } from 'sonner';

interface Lesson {
  _id: string;
  title: string;
  description: string;
  topic: string;
  difficulty: string;
  estimatedTime: number;
  order: number;
  course: {
    _id: string;
    title: string;
  };
  hasQuiz?: boolean;
  createdAt: string;
}

export default function ManageLessonsPage() {
  const router = useRouter();
  const { token } = useAuthStore();

  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [filteredLessons, setFilteredLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [quizFilter, setQuizFilter] = useState('all');

  useEffect(() => {
    fetchLessons();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [lessons, searchTerm, difficultyFilter, quizFilter]);

  const fetchLessons = async () => {
    try {
      setLoading(true);
      
      // Fetch all lessons by instructor
      const res = await axios.get('http://localhost:5000/api/v1/lessons/instructor/my-lessons', {
        headers: { Authorization: `Bearer ${token}` },
      });

      const lessonsData = res.data.data || [];
      
      // Check quiz status for each lesson
      const lessonsWithQuizStatus = await Promise.all(
        lessonsData.map(async (lesson: Lesson) => {
          try {
            const quizRes = await axios.get(
              `http://localhost:5000/api/v1/quizzes?lesson=${lesson._id}`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            return {
              ...lesson,
              hasQuiz: quizRes.data.data?.length > 0,
            };
          } catch (error) {
            return { ...lesson, hasQuiz: false };
          }
        })
      );

      setLessons(lessonsWithQuizStatus);
      setFilteredLessons(lessonsWithQuizStatus);
    } catch (error: any) {
      console.error('Error fetching lessons:', error);
      toast.error('Failed to load lessons', {
        description: error.response?.data?.message
      });
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...lessons];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(lesson =>
        lesson.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lesson.topic.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lesson.course.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Difficulty filter
    if (difficultyFilter !== 'all') {
      filtered = filtered.filter(lesson => lesson.difficulty === difficultyFilter);
    }

    // Quiz filter
    if (quizFilter === 'with-quiz') {
      filtered = filtered.filter(lesson => lesson.hasQuiz);
    } else if (quizFilter === 'no-quiz') {
      filtered = filtered.filter(lesson => !lesson.hasQuiz);
    }

    setFilteredLessons(filtered);
  };

  const handleDeleteLesson = async (lessonId: string, courseId: string) => {
    toast.promise(
      axios.delete(`http://localhost:5000/api/v1/lessons/${lessonId}`, {
        headers: { Authorization: `Bearer ${token}` }
      }),
      {
        loading: 'Deleting lesson...',
        success: () => {
          fetchLessons();
          return 'Lesson deleted successfully';
        },
        error: (error: any) => {
          console.error('Error deleting lesson:', error);
          return error.response?.data?.message || 'Failed to delete lesson';
        }
      }
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl">Loading lessons...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.push('/instructor')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft size={20} />
            Back to Dashboard
          </button>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-blue-500 text-white p-3 rounded-lg">
                <BookOpen size={28} />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Manage Lessons</h1>
                <p className="text-gray-600">View and edit all your lessons across courses</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-blue-600">{lessons.length}</div>
            <div className="text-sm text-gray-600">Total Lessons</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-green-600">
              {lessons.filter(l => l.hasQuiz).length}
            </div>
            <div className="text-sm text-gray-600">With Quiz</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-red-600">
              {lessons.filter(l => !l.hasQuiz).length}
            </div>
            <div className="text-sm text-gray-600">Without Quiz</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-purple-600">
              {[...new Set(lessons.map(l => l.course._id))].length}
            </div>
            <div className="text-sm text-gray-600">Courses</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter size={20} className="text-gray-600" />
            <h2 className="text-lg font-semibold">Filters</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium mb-2">Search</label>
              <div className="relative">
                <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by title, topic, or course..."
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Difficulty Filter */}
            <div>
              <label className="block text-sm font-medium mb-2">Difficulty</label>
              <select
                value={difficultyFilter}
                onChange={(e) => setDifficultyFilter(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Levels</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            {/* Quiz Filter */}
            <div>
              <label className="block text-sm font-medium mb-2">Quiz Status</label>
              <select
                value={quizFilter}
                onChange={(e) => setQuizFilter(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Lessons</option>
                <option value="with-quiz">With Quiz</option>
                <option value="no-quiz">Without Quiz</option>
              </select>
            </div>
          </div>

          {(searchTerm || difficultyFilter !== 'all' || quizFilter !== 'all') && (
            <div className="mt-4 flex items-center gap-2">
              <span className="text-sm text-gray-600">
                Showing {filteredLessons.length} of {lessons.length} lessons
              </span>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setDifficultyFilter('all');
                  setQuizFilter('all');
                }}
                className="text-sm text-blue-600 hover:text-blue-700 underline"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>

        {/* Lessons List */}
        <div className="bg-white rounded-lg shadow">
          {filteredLessons.length === 0 ? (
            <div className="p-12 text-center">
              <BookOpen size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {lessons.length === 0 ? 'No lessons yet' : 'No lessons found'}
              </h3>
              <p className="text-gray-500 mb-6">
                {lessons.length === 0 
                  ? 'Create your first lesson from a course' 
                  : 'Try adjusting your filters'}
              </p>
              {lessons.length === 0 && (
                <button
                  onClick={() => router.push('/instructor/courses')}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium"
                >
                  Go to My Courses
                </button>
              )}
            </div>
          ) : (
            <div className="divide-y">
              {filteredLessons.map((lesson) => (
                <div key={lesson._id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start gap-4">
                    {/* Order Badge */}
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold">
                      {lesson.order}
                    </div>

                    {/* Lesson Info */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-semibold mb-1">{lesson.title}</h3>
                          <p className="text-gray-600 text-sm mb-2">{lesson.description}</p>
                          
                          {/* Course Badge */}
                          <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-medium mb-3">
                            📚 {lesson.course.title}
                          </div>

                          <div className="flex items-center gap-3 text-sm">
                            <span className="bg-gray-100 px-2 py-1 rounded capitalize">
                              {lesson.difficulty}
                            </span>
                            <span className="bg-gray-100 px-2 py-1 rounded">
                              ⏱️ {lesson.estimatedTime} min
                            </span>
                            <span className="bg-gray-100 px-2 py-1 rounded">
                              📖 {lesson.topic}
                            </span>
                            {lesson.hasQuiz ? (
                              <span className="bg-green-100 text-green-700 px-2 py-1 rounded flex items-center gap-1">
                                <FileQuestion size={14} />
                                Has Quiz
                              </span>
                            ) : (
                              <span className="bg-red-100 text-red-700 px-2 py-1 rounded flex items-center gap-1">
                                <FileQuestion size={14} />
                                No Quiz
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                          {!lesson.hasQuiz && (
                            <button
                              onClick={() => router.push(`/instructor/courses/${lesson.course._id}/lessons/${lesson._id}/quiz/create`)}
                              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 text-sm flex items-center gap-2"
                              title="Create Quiz"
                            >
                              <FileQuestion size={16} />
                              Add Quiz
                            </button>
                          )}
                          <button
                            onClick={() => router.push(`/instructor/lessons/${lesson._id}/edit`)}
                            className="text-gray-600 hover:text-blue-600 p-2"
                            title="Edit Lesson"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => handleDeleteLesson(lesson._id, lesson.course._id)}
                            className="text-gray-600 hover:text-red-600 p-2"
                            title="Delete Lesson"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
