'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useAuthStore } from '@/store/authStore';
import { ArrowLeft, BookOpen, Edit, Trash2, FileQuestion, Search, Filter, Clock, Award, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

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
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5); // Show 5 lessons per page

  useEffect(() => {
    fetchLessons();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [lessons, searchTerm, difficultyFilter, quizFilter]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredLessons.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentLessons = filteredLessons.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, difficultyFilter, quizFilter]);

  // Reset to page 1 if current page exceeds total pages
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [filteredLessons.length, currentPage, totalPages]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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
              `${process.env.NEXT_PUBLIC_API_URL}/quiz?lesson=${lesson._id}`,
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
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-teal-50 to-emerald-50 flex justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-sm sm:text-base text-gray-600">Loading lessons...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-teal-50 to-emerald-50 py-4 sm:py-6 lg:py-8">
      <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 max-w-7xl">
        {/* Back Button */}
        <button
          onClick={() => router.push('/instructor')}
          className="flex items-center gap-2 text-green-600 hover:text-green-700 mb-4 sm:mb-6 text-sm sm:text-base font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          Back to Dashboard
        </button>

        {/* Header */}
        <div className="mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-green-600 to-teal-600 text-white p-2.5 sm:p-3 rounded-lg shadow-md">
                <BookOpen className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Manage Lessons</h1>
                <p className="text-xs sm:text-sm text-gray-600 mt-0.5">View and edit all your lessons across courses</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
          <Card className="bg-white border-green-100">
            <CardContent className="p-3 sm:p-4 lg:p-5">
              <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-green-600">{lessons.length}</div>
              <div className="text-xs sm:text-sm text-gray-600 mt-0.5 sm:mt-1">Total Lessons</div>
            </CardContent>
          </Card>
          <Card className="bg-white border-green-100">
            <CardContent className="p-3 sm:p-4 lg:p-5">
              <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-emerald-600">
                {lessons.filter(l => l.hasQuiz).length}
              </div>
              <div className="text-xs sm:text-sm text-gray-600 mt-0.5 sm:mt-1">With Quiz</div>
            </CardContent>
          </Card>
          <Card className="bg-white border-green-100">
            <CardContent className="p-3 sm:p-4 lg:p-5">
              <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-red-600">
                {lessons.filter(l => !l.hasQuiz).length}
              </div>
              <div className="text-xs sm:text-sm text-gray-600 mt-0.5 sm:mt-1">Without Quiz</div>
            </CardContent>
          </Card>
          <Card className="bg-white border-green-100">
            <CardContent className="p-3 sm:p-4 lg:p-5">
              <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-teal-600">
                {[...new Set(lessons.map(l => l.course._id))].length}
              </div>
              <div className="text-xs sm:text-sm text-gray-600 mt-0.5 sm:mt-1">Courses</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="bg-white border-green-100 mb-4 sm:mb-6">
          <CardContent className="p-4 sm:p-5 lg:p-6">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
              <h2 className="text-base sm:text-lg font-semibold text-gray-900">Filters</h2>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {/* Search */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by title, topic, or course..."
                    className="w-full pl-9 pr-3 py-2 text-sm border-2 border-gray-200 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
              </div>

              {/* Difficulty Filter */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">Difficulty</label>
                <select
                  value={difficultyFilter}
                  onChange={(e) => setDifficultyFilter(e.target.value)}
                  className="w-full px-3 py-2 text-sm border-2 border-gray-200 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="all">All Levels</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>

              {/* Quiz Filter */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">Quiz Status</label>
                <select
                  value={quizFilter}
                  onChange={(e) => setQuizFilter(e.target.value)}
                  className="w-full px-3 py-2 text-sm border-2 border-gray-200 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="all">All Lessons</option>
                  <option value="with-quiz">With Quiz</option>
                  <option value="no-quiz">Without Quiz</option>
                </select>
              </div>
            </div>

            {(searchTerm || difficultyFilter !== 'all' || quizFilter !== 'all') && (
              <div className="mt-3 sm:mt-4 flex flex-wrap items-center gap-2">
                <span className="text-xs sm:text-sm text-gray-600">
                  Showing {filteredLessons.length} of {lessons.length} lessons
                </span>
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setDifficultyFilter('all');
                    setQuizFilter('all');
                  }}
                  className="text-xs sm:text-sm text-green-600 hover:text-green-700 font-medium underline"
                >
                  Clear filters
                </button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Lessons List */}
        <Card className="bg-white border-green-100">
          {filteredLessons.length === 0 ? (
            <CardContent className="p-8 sm:p-12 text-center">
              <BookOpen className="w-12 h-12 sm:w-16 sm:h-16 text-green-600 mx-auto mb-4" />
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
                {lessons.length === 0 ? 'No lessons yet' : 'No lessons found'}
              </h3>
              <p className="text-sm sm:text-base text-gray-500 mb-4 sm:mb-6">
                {lessons.length === 0 
                  ? 'Create your first lesson from a course' 
                  : 'Try adjusting your filters'}
              </p>
              {lessons.length === 0 && (
                <Button
                  onClick={() => router.push('/instructor/courses')}
                  className="w-full sm:w-auto bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white text-sm sm:text-base"
                >
                  Go to My Courses
                </Button>
              )}
            </CardContent>
          ) : (
            <>
              <div className="divide-y divide-gray-100">
                {currentLessons.map((lesson) => (
                  <div key={lesson._id} className="p-4 sm:p-5 lg:p-6 hover:bg-green-50/30 transition-colors">
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                      {/* Order Badge */}
                      <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-r from-green-600 to-teal-600 text-white flex items-center justify-center font-bold text-base sm:text-lg shadow-md">
                        {lesson.order}
                      </div>

                      {/* Lesson Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 line-clamp-2">{lesson.title}</h3>
                            <p className="text-xs sm:text-sm text-gray-600 mb-2 line-clamp-2">{lesson.description}</p>
                            
                            {/* Course Badge */}
                            <div className="inline-flex items-center gap-1.5 bg-teal-50 text-teal-700 border border-teal-200 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium mb-3">
                              📚 {lesson.course.title}
                            </div>

                            {/* Tags - Responsive Wrap */}
                            <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm">
                              <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 sm:py-1 rounded capitalize">
                                <Award className="w-3 h-3" />
                                {lesson.difficulty}
                              </span>
                              <span className="inline-flex items-center gap-1 bg-gray-50 text-gray-700 border border-gray-200 px-2 py-0.5 sm:py-1 rounded">
                                <Clock className="w-3 h-3" />
                                {lesson.estimatedTime} min
                              </span>
                              <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 sm:py-1 rounded">
                                📖 {lesson.topic}
                              </span>
                              {lesson.hasQuiz ? (
                                <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 sm:py-1 rounded">
                                  <FileQuestion className="w-3 h-3" />
                                  Has Quiz
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 bg-red-50 text-red-700 border border-red-200 px-2 py-0.5 sm:py-1 rounded">
                                  <FileQuestion className="w-3 h-3" />
                                  No Quiz
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex flex-wrap sm:flex-nowrap gap-2">
                            {!lesson.hasQuiz && (
                              <Button
                                onClick={() => router.push(`/instructor/courses/${lesson.course._id}/lessons/${lesson._id}/quiz/create`)}
                                className="flex-1 sm:flex-none bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white text-xs sm:text-sm"
                                size="sm"
                              >
                                <FileQuestion className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1" />
                                Add Quiz
                              </Button>
                            )}
                            <Button
                              onClick={() => router.push(`/instructor/lessons/${lesson._id}/edit`)}
                              variant="ghost"
                              size="sm"
                              className="text-green-600 hover:text-green-700 hover:bg-green-50"
                              title="Edit Lesson"
                            >
                              <Edit className="w-4 h-4 sm:w-5 sm:h-5" />
                            </Button>
                            <Button
                              onClick={() => handleDeleteLesson(lesson._id, lesson.course._id)}
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              title="Delete Lesson"
                            >
                              <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="p-4 sm:p-5 lg:p-6 border-t border-green-100 bg-green-50/30">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                    {/* Page Info */}
                    <div className="text-xs sm:text-sm text-gray-600 font-medium">
                      Page {currentPage} of {totalPages} • Showing {startIndex + 1}-{Math.min(endIndex, filteredLessons.length)} of {filteredLessons.length}
                    </div>

                    {/* Pagination Controls */}
                    <div className="flex items-center gap-1 sm:gap-2">
                      <Button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        variant="outline"
                        size="sm"
                        className="border-2 border-green-200 text-green-700 hover:bg-green-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        <span className="hidden sm:inline ml-1">Previous</span>
                      </Button>

                      {/* Page Numbers */}
                      <div className="flex gap-1">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                          // Show first page, last page, current page, and pages around current
                          const showPage = 
                            page === 1 || 
                            page === totalPages || 
                            (page >= currentPage - 1 && page <= currentPage + 1);
                          
                          const showEllipsis = 
                            (page === currentPage - 2 && currentPage > 3) ||
                            (page === currentPage + 2 && currentPage < totalPages - 2);

                          if (showEllipsis) {
                            return (
                              <span key={page} className="px-2 py-1 text-gray-400">
                                ...
                              </span>
                            );
                          }

                          if (!showPage) return null;

                          return (
                            <Button
                              key={page}
                              onClick={() => handlePageChange(page)}
                              variant={currentPage === page ? "default" : "outline"}
                              size="sm"
                              className={`w-8 h-8 sm:w-9 sm:h-9 p-0 text-xs sm:text-sm ${
                                currentPage === page
                                  ? 'bg-gradient-to-r from-green-600 to-teal-600 text-white border-0'
                                  : 'border-2 border-green-200 text-green-700 hover:bg-green-50'
                              }`}
                            >
                              {page}
                            </Button>
                          );
                        })}
                      </div>

                      <Button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        variant="outline"
                        size="sm"
                        className="border-2 border-green-200 text-green-700 hover:bg-green-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span className="hidden sm:inline mr-1">Next</span>
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
