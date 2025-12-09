'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { useAuthStore } from '@/store/authStore';
import { ArrowLeft, Plus, Edit, Trash2, FileQuestion, Lock, Unlock, Clock, Award, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Lesson {
  _id: string;
  title: string;
  description: string;
  estimatedTime: number;
  difficulty: string;
  order: number;
  hasQuiz?: boolean;
}

export default function CourseLessonsPage() {
  const { courseId } = useParams();
  const router = useRouter();
  const { token } = useAuthStore();

  const [course, setCourse] = useState<any>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6); // Show 6 lessons per page

  useEffect(() => {
    fetchCourseAndLessons();
  }, [courseId]);

  const fetchCourseAndLessons = async () => {
    try {
      setLoading(true);

      console.log('🔍 Fetching course:', courseId);
      console.log('🔑 Token:', token ? 'Present' : 'Missing');

      // Fetch course
      const courseRes = await axios.get(`http://localhost:5000/api/v1/courses/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('✅ Course response:', courseRes.data);
      setCourse(courseRes.data.data || courseRes.data);

      // Fetch lessons for this course
      console.log('🔍 Fetching lessons with URL:', `http://localhost:5000/api/v1/lessons?course=${courseId}`);
      const lessonsRes = await axios.get(`http://localhost:5000/api/v1/lessons?course=${courseId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log('✅ Lessons API full response:', lessonsRes);
      console.log('📦 Lessons data:', lessonsRes.data);
      console.log('📦 Lessons data.data:', lessonsRes.data?.data);
      console.log('📦 Type of data.data:', Array.isArray(lessonsRes.data?.data) ? 'Array' : typeof lessonsRes.data?.data);

      // Handle different response structures
      let lessonsList = [];
      if (lessonsRes.data?.data?.lessons) {
        console.log('📚 Using data.data.lessons path');
        lessonsList = lessonsRes.data.data.lessons;
      } else if (Array.isArray(lessonsRes.data?.data)) {
        console.log('📚 Using data.data array path');
        lessonsList = lessonsRes.data.data;
      } else if (Array.isArray(lessonsRes.data)) {
        console.log('📚 Using data array path');
        lessonsList = lessonsRes.data;
      }

      console.log('✅ Final parsed lessons list:', lessonsList);
      console.log('📊 Lessons count:', lessonsList.length);

      // Check if each lesson has a quiz
      const lessonsWithQuizStatus = await Promise.all(
        lessonsList.map(async (lesson: Lesson) => {
          try {
            console.log(`🔍 Checking quiz for lesson ${lesson._id}:`, lesson.title);
            const quizRes = await axios.get(
              `${process.env.NEXT_PUBLIC_API_URL}/quiz?lesson=${lesson._id}`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            console.log(`📊 Quiz response for ${lesson.title}:`, quizRes.data);

            // Check both data and data.data for quizzes array
            const quizzes = Array.isArray(quizRes.data.data)
              ? quizRes.data.data
              : (Array.isArray(quizRes.data) ? quizRes.data : []);

            const hasQuiz = quizzes.length > 0;
            console.log(`✅ Lesson "${lesson.title}" has quiz:`, hasQuiz, '| Quiz count:', quizzes.length);

            return {
              ...lesson,
              hasQuiz: hasQuiz,
            };
          } catch (error) {
            console.error(`❌ Error checking quiz for lesson ${lesson.title}:`, error);
            return { ...lesson, hasQuiz: false };
          }
        })
      );

      setLessons(lessonsWithQuizStatus.sort((a, b) => a.order - b.order));
    } catch (error: any) {
      console.error('Error fetching data:', error);
      console.error('Error response:', error.response?.data);
      console.error('Status:', error.response?.status);
      toast.error('Failed to load course lessons', {
        description: error.response?.data?.message || 'Please restart the backend server.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLesson = async (lessonId: string) => {
    toast.promise(
      axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/lessons/${lessonId}`, {
        headers: { Authorization: `Bearer ${token}` }
      }),
      {
        loading: 'Deleting lesson...',
        success: () => {
          fetchCourseAndLessons();
          return 'Lesson deleted successfully';
        },
        error: (error: any) => {
          console.error('Error deleting lesson:', error);
          return error.response?.data?.message || 'Failed to delete lesson';
        }
      }
    );
  };

  // Calculate pagination
  const totalPages = Math.ceil(lessons.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentLessons = lessons.slice(startIndex, endIndex);

  // Reset to page 1 if current page exceeds total pages
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [lessons.length, currentPage, totalPages]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-page-gradient flex justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-sm sm:text-base text-muted-foreground">Loading lessons...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-page-gradient py-4 sm:py-6 lg:py-8">
      <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 max-w-7xl">
        {/* Back Button */}
        <button
          onClick={() => router.push('/instructor/courses')}
          className="flex items-center gap-2 text-green-600 hover:text-green-700 mb-4 sm:mb-6 text-sm sm:text-base font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          Back to My Courses
        </button>

        {/* Course Header Card */}
        <Card className="bg-card border-border mb-4 sm:mb-6">
          <CardContent className="p-4 sm:p-5 lg:p-6">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
              {/* Course Info */}
              <div className="flex-1">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground mb-2">{course?.title}</h1>
                <p className="text-sm sm:text-base text-muted-foreground mb-4">{course?.description}</p>

                {/* Stats - Responsive Grid */}
                {/* Stats - Responsive Grid */}
                <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 sm:gap-3 text-xs sm:text-sm">
                  <span className="inline-flex items-center gap-1 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full font-medium">
                    📚 {lessons.length} {lessons.length === 1 ? 'Lesson' : 'Lessons'}
                  </span>
                  <span className="inline-flex items-center gap-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full font-medium">
                    ✅ {lessons.filter(l => l.hasQuiz).length} with Quiz
                  </span>
                  <span className={`inline-flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full font-medium border ${course?.isPremium
                    ? 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800'
                    : 'bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-400 border-teal-200 dark:border-teal-800'
                    }`}>
                    {course?.isPremium ? `💰 ৳${course.price}` : '🆓 Free'}
                  </span>
                  <span className="inline-flex items-center gap-1 bg-secondary text-foreground border border-border px-2 sm:px-3 py-1 sm:py-1.5 rounded-full font-medium capitalize">
                    📊 {course?.difficulty}
                  </span>
                </div>
              </div>

              {/* Add Lesson Button */}
              <Button
                onClick={() => router.push(`/instructor/courses/${courseId}/lessons/create`)}
                className="w-full lg:w-auto bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white text-sm sm:text-base"
              >
                <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Add Lesson
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Lessons List */}
        <Card className="bg-card border-border">
          <div className="p-4 sm:p-5 lg:p-6 border-b border-border">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-foreground">Course Lessons</h2>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                  Lessons are unlocked sequentially. Students must pass each quiz (80%+) to unlock the next lesson.
                </p>
              </div>
              {lessons.length > 0 && (
                <div className="text-xs sm:text-sm text-muted-foreground font-medium">
                  Showing {startIndex + 1}-{Math.min(endIndex, lessons.length)} of {lessons.length}
                </div>
              )}
            </div>
          </div>

          {lessons.length === 0 ? (
            <div className="p-8 sm:p-12 text-center">
              <div className="mb-4">
                <svg className="mx-auto h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2">No lessons yet</h3>
              <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6">Start building your course by adding your first lesson</p>
              <Button
                onClick={() => router.push(`/instructor/courses/${courseId}/lessons/create`)}
                className="w-full sm:w-auto bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white text-sm sm:text-base"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create First Lesson
              </Button>
            </div>
          ) : (
            <>
              <div className="divide-y divide-gray-100">
                {currentLessons.map((lesson, index) => {
                  const actualIndex = startIndex + index;
                  return (
                    <div key={lesson._id} className="p-4 sm:p-5 lg:p-6 hover:bg-secondary/30 transition-colors">
                      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                        {/* Order Number */}
                        <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-r from-green-600 to-teal-600 text-white flex items-center justify-center font-bold text-base sm:text-lg shadow-md">
                          {lesson.order || actualIndex + 1}
                        </div>

                        {/* Lesson Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <h3 className="text-base sm:text-lg font-semibold text-foreground mb-1 line-clamp-2">{lesson.title}</h3>
                              <p className="text-xs sm:text-sm text-muted-foreground mb-3 line-clamp-2">{lesson.description}</p>

                              {/* Tags - Responsive Wrap */}
                              <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm">
                                <span className="inline-flex items-center gap-1 bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-400 border border-teal-200 dark:border-teal-800 px-2 py-0.5 sm:py-1 rounded capitalize">
                                  <Award className="w-3 h-3" />
                                  {lesson.difficulty}
                                </span>
                                <span className="inline-flex items-center gap-1 bg-secondary text-foreground border border-border px-2 py-0.5 sm:py-1 rounded">
                                  <Clock className="w-3 h-3" />
                                  {lesson.estimatedTime} min
                                </span>
                                {lesson.order === 1 ? (
                                  <span className="inline-flex items-center gap-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 sm:py-1 rounded">
                                    <Unlock className="w-3 h-3" />
                                    <span className="hidden sm:inline">Always Unlocked</span>
                                    <span className="sm:hidden">Unlocked</span>
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800 px-2 py-0.5 sm:py-1 rounded">
                                    <Lock className="w-3 h-3" />
                                    <span className="hidden sm:inline">Requires Quiz</span>
                                    <span className="sm:hidden">Locked</span>
                                  </span>
                                )}
                                {lesson.hasQuiz ? (
                                  <span className="inline-flex items-center gap-1 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800 px-2 py-0.5 sm:py-1 rounded">
                                    <FileQuestion className="w-3 h-3" />
                                    Quiz Created
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800 px-2 py-0.5 sm:py-1 rounded">
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
                                  onClick={() => router.push(`/instructor/courses/${courseId}/lessons/${lesson._id}/quiz/create`)}
                                  className="flex-1 sm:flex-none bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white text-xs sm:text-sm"
                                  size="sm"
                                >
                                  <FileQuestion className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1" />
                                  Create Quiz
                                </Button>
                              )}
                              <Button
                                onClick={() => router.push(`/instructor/lessons/${lesson._id}/edit`)}
                                variant="ghost"
                                size="sm"
                                className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/20"
                                title="Edit Lesson"
                              >
                                <Edit className="w-4 h-4 sm:w-5 sm:h-5" />
                              </Button>
                              <Button
                                onClick={() => handleDeleteLesson(lesson._id)}
                                variant="ghost"
                                size="sm"
                                className="text-red-600 dark:text-red-500 hover:text-red-700 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                                title="Delete Lesson"
                              >
                                <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="p-4 sm:p-5 lg:p-6 border-t border-border bg-card">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                    {/* Page Info */}
                    <div className="text-xs sm:text-sm text-muted-foreground font-medium">
                      Page {currentPage} of {totalPages}
                    </div>

                    {/* Pagination Controls */}
                    <div className="flex items-center gap-1 sm:gap-2">
                      <Button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        variant="outline"
                        size="sm"
                        className="border-2 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
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
                              <span key={page} className="px-2 py-1 text-muted-foreground">
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
                              className={`w-8 h-8 sm:w-9 sm:h-9 p-0 text-xs sm:text-sm ${currentPage === page
                                ? 'bg-gradient-to-r from-green-600 to-teal-600 text-white border-0'
                                : 'border-2 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20'
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
                        className="border-2 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
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

        {/* Info Box */}
        <Card className="mt-4 sm:mt-6 bg-gradient-to-r from-green-50 to-teal-50 dark:from-green-900/10 dark:to-teal-900/10 border-green-200 dark:border-green-800">
          <CardContent className="p-4 sm:p-5">
            <h3 className="font-semibold text-green-900 dark:text-green-300 mb-2 sm:mb-3 text-sm sm:text-base flex items-center gap-2">
              📋 Lesson Workflow
            </h3>
            <ol className="text-xs sm:text-sm text-green-800 dark:text-green-400 space-y-1.5 sm:space-y-2 list-decimal list-inside leading-relaxed">
              <li>Create lessons in the order you want students to learn</li>
              <li>Create a quiz for each lesson (minimum 80% passing score required)</li>
              <li>First lesson is always unlocked for enrolled students</li>
              <li>Students must pass each quiz to unlock the next lesson</li>
              <li>After completing all lessons, students receive a certificate</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
