'use client';

import { useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2, Eye, Users, DollarSign, BookOpen, Lock } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useAppDispatch } from '@/store/hooks';
import {
  useInstructorCourses,
  useInstructorCoursesLoading,
  useInstructorCoursesError,
} from '@/store/hooks';
import { fetchInstructorCourses } from '@/store/globalSlice';
import { api } from '@/lib/api';
import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';

export default function InstructorCoursesPage() {
  const router = useRouter();
  const { token } = useAuthStore();
  const dispatch = useAppDispatch();
  const [deleteCourseId, setDeleteCourseId] = useState<string | null>(null);

  // Redux state
  const courses = useInstructorCourses();
  const loading = useInstructorCoursesLoading();
  const error = useInstructorCoursesError();

  useEffect(() => {
    if (!token) {
      router.push('/auth/login');
      return;
    }

    // Fetch courses (will use cache if available)
    dispatch(fetchInstructorCourses({}));
  }, [token, dispatch]);

  // Show error toast
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const confirmDelete = async () => {
    if (!deleteCourseId) return;

    try {
      await api.delete(`/courses/${deleteCourseId}`);
      toast.success('Course deleted successfully');
      // Force refresh after delete
      dispatch(fetchInstructorCourses({ force: true }));
    } catch (error) {
      console.error('Error deleting course:', error);
      toast.error('Failed to delete course');
    } finally {
      setDeleteCourseId(null);
    }
  };

  const handleTogglePublish = async (courseId: string, currentStatus: boolean) => {
    try {
      await api.patch(`/courses/${courseId}/publish`);
      toast.success(`Course ${!currentStatus ? 'published' : 'unpublished'} successfully`);
      // Force refresh after toggle
      dispatch(fetchInstructorCourses({ force: true }));
    } catch (error) {
      console.error('Error toggling publish status:', error);
      toast.error('Failed to update course status');
    }
  };

  const handleRefresh = () => {
    dispatch(fetchInstructorCourses({ force: true }));
    toast.success('Refreshing courses...');
  };

  return (
    <div className="min-h-screen bg-page-gradient py-4 sm:py-6 lg:py-8">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-1 sm:mb-2">
              My Courses
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">Manage your courses and lessons</p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleRefresh}
              variant="outline"
              size="sm"
              disabled={loading}
              className="border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20"
            >
              {loading ? 'Refreshing...' : 'Refresh'}
            </Button>
            <Link href="/instructor/courses/create" className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white text-sm sm:text-base">
                <Plus className="w-4 h-4 mr-2" />
                Create Course
              </Button>
            </Link>
          </div>
        </div>

        {/* Courses Grid */}
        {loading && courses.length === 0 ? (
          <div className="text-center py-8 sm:py-12 lg:py-16">
            <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:h-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="text-sm sm:text-base text-gray-600 mt-4">Loading courses...</p>
          </div>
        ) : courses.length === 0 ? (
          <Card className="bg-card border-border">
            <CardContent className="text-center py-8 sm:py-12">
              <BookOpen className="w-12 h-12 sm:w-16 sm:h-16 text-muted-foreground/50 mx-auto mb-4" />
              <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2">No courses yet</h3>
              <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6">Create your first course to get started</p>
              <Link href="/instructor/courses/create" className="inline-block w-full sm:w-auto">
                <Button className="w-full sm:w-auto bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white text-sm sm:text-base">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Course
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
            {courses.map((course: any) => (
              <Card key={course._id} className="bg-card border-border hover:shadow-xl hover:border-green-200 dark:hover:border-green-800 transition-all">
                <CardContent className="p-4 sm:p-5 lg:p-6">
                  {/* Thumbnail */}
                  {course.thumbnailUrl && (
                    <div className="mb-3 sm:mb-4 rounded-lg overflow-hidden">
                      <img
                        src={course.thumbnailUrl}
                        alt={course.title}
                        className="w-full h-32 sm:h-40 object-cover"
                      />
                    </div>
                  )}

                  {/* Title */}
                  <h3 className="font-semibold text-base sm:text-lg text-foreground mb-2 line-clamp-2">
                    {course.title}
                  </h3>

                  {/* Description */}
                  <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4 line-clamp-3">
                    {course.description}
                  </p>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-3 sm:mb-4">
                    <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
                      <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-600" />
                      <span className="text-muted-foreground">
                        {course.enrollmentCount || 0} students
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
                      <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-teal-600" />
                      <span className="text-muted-foreground">
                        {course.lessonCount || course.lessons?.length || 0} lessons
                      </span>
                    </div>
                  </div>

                  {/* Price & Publish Status */}
                  <div className="flex flex-wrap items-center gap-2 mb-3 sm:mb-4">
                    {course.isPremium ? (
                      <span className="inline-flex items-center gap-1 px-2 sm:px-3 py-0.5 sm:py-1 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800 rounded-full text-xs sm:text-sm font-medium">
                        <DollarSign className="w-3 h-3" />
                        ৳{course.price}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 sm:px-3 py-0.5 sm:py-1 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800 rounded-full text-xs sm:text-sm font-medium">
                        Free
                      </span>
                    )}
                    {course.isPublished ? (
                      <span className="inline-flex items-center gap-1 px-2 sm:px-3 py-0.5 sm:py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 rounded-full text-xs sm:text-sm font-medium">
                        ✅ Published
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 sm:px-3 py-0.5 sm:py-1 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800 rounded-full text-xs sm:text-sm font-medium">
                        <Lock className="w-3 h-3" />
                        Draft
                      </span>
                    )}
                  </div>

                  {/* Difficulty & Topic */}
                  <div className="flex flex-wrap items-center gap-2 mb-3 sm:mb-4">
                    <span className="px-2 py-0.5 sm:py-1 bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-400 border border-teal-200 dark:border-teal-800 rounded text-xs capitalize">
                      {course.difficulty}
                    </span>
                    <span className="px-2 py-0.5 sm:py-1 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800 rounded text-xs">
                      {course.topic}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Link href={`/instructor/courses/${course._id}/lessons`} className="flex-1">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full text-xs sm:text-sm border-2 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 hover:border-green-300 dark:hover:border-green-700"
                        >
                          <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1" />
                          Manage Lessons
                        </Button>
                      </Link>
                      <Link href={`/courses/${course._id}`}>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/20"
                        >
                          <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteCourseId(course._id)}
                        className="text-red-600 dark:text-red-500 hover:text-red-700 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </Button>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleTogglePublish(course._id, course.isPublished)}
                      className={`w-full text-xs sm:text-sm ${course.isPublished ? 'border-2 border-yellow-200 dark:border-yellow-800 text-yellow-700 dark:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-900/20' : 'border-2 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20'}`}
                    >
                      {course.isPublished ? (
                        <>
                          <Lock className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1" />
                          Unpublish
                        </>
                      ) : (
                        <>
                          ✅ Publish
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
      <AlertDialog open={!!deleteCourseId} onOpenChange={(open) => !open && setDeleteCourseId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Course</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this course? This action cannot be undone and will remove all lessons and student enrollments associated with this course.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700 text-white focus:ring-red-600"
            >
              Delete Course
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
