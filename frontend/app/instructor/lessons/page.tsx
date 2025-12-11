'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useAppDispatch } from '@/store/hooks';
import {
  useInstructorLessons,
  useInstructorLessonsLoading,
  useInstructorLessonsError,
} from '@/store/hooks';
import { fetchInstructorLessons } from '@/store/globalSlice';
import { ArrowLeft, BookOpen, Edit, Trash2, FileQuestion, Award, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';

export default function ManageLessonsPage() {
  const router = useRouter();
  const { token } = useAuthStore();
  const dispatch = useAppDispatch();

  // Redux state
  const lessons = useInstructorLessons();
  const loading = useInstructorLessonsLoading();
  const error = useInstructorLessonsError();

  useEffect(() => {
    if (!token) {
      router.push('/auth/login');
      return;
    }

    // Fetch lessons (will use cache if available)
    dispatch(fetchInstructorLessons({}));
  }, [token, dispatch]);

  // Show error toast
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const handleDeleteLesson = async (lessonId: string) => {
    toast.promise(
      api.delete(`/lessons/${lessonId}`),
      {
        loading: 'Deleting lesson...',
        success: () => {
          // Force refresh after delete
          dispatch(fetchInstructorLessons({ force: true }));
          return 'Lesson deleted successfully';
        },
        error: (error: any) => {
          console.error('Error deleting lesson:', error);
          return error.response?.data?.message || 'Failed to delete lesson';
        }
      }
    );
  };

  const handleRefresh = () => {
    dispatch(fetchInstructorLessons({ force: true }));
    toast.success('Refreshing lessons...');
  };

  if (loading && lessons.length === 0) {
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
          onClick={() => router.push('/instructor')}
          className="flex items-center gap-2 text-green-600 hover:text-green-700 mb-4 sm:mb-6 text-sm sm:text-base font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          Back to Dashboard
        </button>

        {/* Header */}
        <div className="mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-green-600 to-teal-600 text-white p-2.5 sm:p-3 rounded-lg shadow-md">
                <BookOpen className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">Manage Lessons</h1>
                <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">View and edit all your lessons across courses</p>
              </div>
            </div>

            {/* Refresh Button */}
            <Button
              onClick={handleRefresh}
              variant="outline"
              size="sm"
              disabled={loading}
              className="border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20"
            >
              {loading ? 'Refreshing...' : 'Refresh'}
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
          <Card className="bg-card border-border">
            <CardContent className="p-3 sm:p-4 lg:p-5">
              <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-green-600 dark:text-green-400">{lessons.length}</div>
              <div className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1">Total Lessons</div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-3 sm:p-4 lg:p-5">
              <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                {lessons.filter(l => l.hasQuiz).length}
              </div>
              <div className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1">With Quiz</div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-3 sm:p-4 lg:p-5">
              <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-red-600 dark:text-red-400">
                {lessons.filter(l => !l.hasQuiz).length}
              </div>
              <div className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1">Without Quiz</div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-3 sm:p-4 lg:p-5">
              <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-teal-600 dark:text-teal-400">
                {[...new Set(lessons.map(l => typeof l.course === 'object' ? l.course._id : l.course).filter(Boolean))].length}
              </div>
              <div className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1">Courses</div>
            </CardContent>
          </Card>
        </div>

        {/* Lessons List */}
        <Card className="bg-card border-border">
          {lessons.length === 0 ? (
            <CardContent className="p-8 sm:p-12 text-center">
              <BookOpen className="w-12 h-12 sm:w-16 sm:h-16 text-muted-foreground/50 mx-auto mb-4" />
              <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2">
                No lessons yet
              </h3>
              <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6">
                Create your first lesson from a course
              </p>
              <Button
                onClick={() => router.push('/instructor/courses')}
                className="w-full sm:w-auto bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white text-sm sm:text-base"
              >
                Go to My Courses
              </Button>
            </CardContent>
          ) : (
            <div className="divide-y divide-border">
              {lessons.map((lesson) => (
                <div key={lesson._id} className="p-4 sm:p-5 lg:p-6 hover:bg-secondary/30 transition-colors">
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                    {/* Order Badge */}
                    <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-r from-green-600 to-teal-600 text-white flex items-center justify-center font-bold text-base sm:text-lg shadow-md">
                      {lesson.order || '?'}
                    </div>

                    {/* Lesson Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base sm:text-lg font-semibold text-foreground mb-1 line-clamp-2">{lesson.title}</h3>
                          <p className="text-xs sm:text-sm text-muted-foreground mb-2 line-clamp-2">{lesson.description || lesson.summary}</p>

                          {/* Course Badge */}
                          {typeof lesson.course === 'object' && lesson.course && (
                            <div className="inline-flex items-center gap-1.5 bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-400 border border-teal-200 dark:border-teal-800 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium mb-3">
                              📚 {lesson.course.title}
                            </div>
                          )}

                          {/* Tags - Responsive Wrap */}
                          <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm">
                            <span className="inline-flex items-center gap-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 sm:py-1 rounded capitalize">
                              <Award className="w-3 h-3" />
                              {lesson.difficulty}
                            </span>
                            <span className="inline-flex items-center gap-1 bg-secondary text-foreground border border-border px-2 py-0.5 sm:py-1 rounded">
                              <Clock className="w-3 h-3" />
                              {lesson.estimatedTime} min
                            </span>
                            <span className="inline-flex items-center gap-1 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800 px-2 py-0.5 sm:py-1 rounded">
                              📖 {lesson.topic}
                            </span>
                            {lesson.hasQuiz ? (
                              <span className="inline-flex items-center gap-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 sm:py-1 rounded">
                                <FileQuestion className="w-3 h-3" />
                                Has Quiz
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
                          {!lesson.hasQuiz && typeof lesson.course === 'object' && lesson.course && '_id' in lesson.course && (
                            <Button
                              onClick={() => {
                                const courseId = (lesson.course as { _id: string; title: string })._id;
                                router.push(`/instructor/courses/${courseId}/lessons/${lesson._id}/quiz/create`);
                              }}
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
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
