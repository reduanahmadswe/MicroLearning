'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2, Eye, Users, DollarSign, BookOpen, Lock } from 'lucide-react';
import Link from 'next/link';
import { coursesAPI } from '@/services/api.service';
import { toast } from 'sonner';

export default function InstructorCoursesPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await coursesAPI.getInstructorCourses();
      console.log('Instructor courses response:', response.data);
      // API returns { data: { success: true, message: '...', data: [...courses] } }
      const coursesData = response.data?.data || response.data || [];
      console.log('Courses data:', coursesData);
      setCourses(coursesData);
    } catch (error: any) {
      console.error('Error fetching courses:', error);
      toast.error(error.response?.data?.message || 'Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (courseId: string) => {
    if (!confirm('Are you sure you want to delete this course?')) return;

    try {
      await coursesAPI.deleteCourse(courseId);
      toast.success('Course deleted successfully');
      fetchCourses();
    } catch (error) {
      console.error('Error deleting course:', error);
      toast.error('Failed to delete course');
    }
  };

  const handleTogglePublish = async (courseId: string, currentStatus: boolean) => {
    try {
      await coursesAPI.togglePublish(courseId);
      toast.success(`Course ${!currentStatus ? 'published' : 'unpublished'} successfully`);
      fetchCourses();
    } catch (error) {
      console.error('Error toggling publish status:', error);
      toast.error('Failed to update course status');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-teal-50 to-emerald-50 py-4 sm:py-6 lg:py-8">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-1 sm:mb-2">
              My Courses
            </h1>
            <p className="text-sm sm:text-base text-gray-600">Manage your courses and lessons</p>
          </div>
          <Link href="/instructor/courses/create" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white text-sm sm:text-base">
              <Plus className="w-4 h-4 mr-2" />
              Create Course
            </Button>
          </Link>
        </div>

        {/* Courses Grid */}
        {loading ? (
          <div className="text-center py-8 sm:py-12 lg:py-16">
            <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="text-sm sm:text-base text-gray-600 mt-4">Loading courses...</p>
          </div>
        ) : courses.length === 0 ? (
          <Card className="bg-white border-green-100">
            <CardContent className="text-center py-8 sm:py-12">
              <BookOpen className="w-12 h-12 sm:w-16 sm:h-16 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">No courses yet</h3>
              <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">Create your first course to get started</p>
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
            {Array.isArray(courses) && courses.map((course: any) => (
              <Card key={course._id} className="bg-white border-green-100 hover:shadow-xl hover:border-green-200 transition-all">
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
                  <h3 className="font-semibold text-base sm:text-lg text-gray-900 mb-2 line-clamp-2">
                    {course.title}
                  </h3>

                  {/* Description */}
                  <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4 line-clamp-3">
                    {course.description}
                  </p>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-3 sm:mb-4">
                    <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
                      <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-600" />
                      <span className="text-gray-600">
                        {course.enrollmentCount || 0} students
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
                      <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-teal-600" />
                      <span className="text-gray-600">
                        {course.lessonCount || course.lessons?.length || 0} lessons
                      </span>
                    </div>
                  </div>

                  {/* Price & Publish Status */}
                  <div className="flex flex-wrap items-center gap-2 mb-3 sm:mb-4">
                    {course.isPremium ? (
                      <span className="inline-flex items-center gap-1 px-2 sm:px-3 py-0.5 sm:py-1 bg-green-50 text-green-700 border border-green-200 rounded-full text-xs sm:text-sm font-medium">
                        <DollarSign className="w-3 h-3" />
                        ৳{course.price}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 sm:px-3 py-0.5 sm:py-1 bg-green-50 text-green-700 border border-green-200 rounded-full text-xs sm:text-sm font-medium">
                        Free
                      </span>
                    )}
                    {course.isPublished ? (
                      <span className="inline-flex items-center gap-1 px-2 sm:px-3 py-0.5 sm:py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs sm:text-sm font-medium">
                        ✅ Published
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 sm:px-3 py-0.5 sm:py-1 bg-yellow-50 text-yellow-700 border border-yellow-200 rounded-full text-xs sm:text-sm font-medium">
                        <Lock className="w-3 h-3" />
                        Draft
                      </span>
                    )}
                  </div>

                  {/* Difficulty & Topic */}
                  <div className="flex flex-wrap items-center gap-2 mb-3 sm:mb-4">
                    <span className="px-2 py-0.5 sm:py-1 bg-teal-50 text-teal-700 border border-teal-200 rounded text-xs capitalize">
                      {course.difficulty}
                    </span>
                    <span className="px-2 py-0.5 sm:py-1 bg-green-50 text-green-700 border border-green-200 rounded text-xs">
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
                          className="w-full text-xs sm:text-sm border-2 border-green-200 text-green-700 hover:bg-green-50 hover:border-green-300"
                        >
                          <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1" />
                          Manage Lessons
                        </Button>
                      </Link>
                      <Link href={`/courses/${course._id}`}>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-green-600 hover:text-green-700 hover:bg-green-50"
                        >
                          <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(course._id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </Button>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleTogglePublish(course._id, course.isPublished)}
                      className={`w-full text-xs sm:text-sm ${course.isPublished ? 'border-2 border-yellow-200 text-yellow-700 hover:bg-yellow-50' : 'border-2 border-green-200 text-green-700 hover:bg-green-50'}`}
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
    </div>
  );
}
