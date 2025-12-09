'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  BookOpen,
  Users,
  Video,
  FileQuestion,
  TrendingUp,
  Award,
  Plus,
  Eye,
  Edit,
  Trash2,
  X,
  CheckCircle
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { lessonsAPI, coursesAPI } from '@/services/api.service';
import { toast } from 'sonner';

export default function InstructorDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState({
    totalLessons: 0,
    totalCourses: 0,
    totalStudents: 0,
    totalViews: 0,
  });
  const [lessons, setLessons] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch instructor's lessons
      const lessonsRes = await lessonsAPI.getInstructorLessons();
      console.log('Lessons response:', lessonsRes);
      const lessonsList = lessonsRes.data?.data || lessonsRes.data || [];
      setLessons(lessonsList);

      // Fetch instructor's courses
      const coursesRes = await coursesAPI.getInstructorCourses();
      console.log('Courses response:', coursesRes);
      const coursesList = coursesRes.data?.data || coursesRes.data || [];
      setCourses(coursesList);

      // Fetch instructor analytics
      let totalStudents = 0;
      let totalViews = 0;

      try {
        const lessonsAnalytics = await lessonsAPI.getInstructorAnalytics();
        totalViews = lessonsAnalytics.data?.data?.totalViews || lessonsAnalytics.data?.totalViews || 0;
      } catch (err) {
        console.log('Analytics not available yet');
      }

      try {
        const coursesAnalytics = await coursesAPI.getInstructorAnalytics();
        totalStudents = coursesAnalytics.data?.data?.totalStudents || coursesAnalytics.data?.totalStudents || 0;
      } catch (err) {
        console.log('Course analytics not available yet');
      }

      // Calculate stats
      setStats({
        totalLessons: Array.isArray(lessonsList) ? lessonsList.length : 0,
        totalCourses: Array.isArray(coursesList) ? coursesList.length : 0,
        totalStudents: totalStudents,
        totalViews: totalViews,
      });
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const statsCards = [
    {
      title: 'Total Lessons',
      value: stats.totalLessons,
      icon: BookOpen,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    },
    {
      title: 'Total Courses',
      value: stats.totalCourses,
      icon: Video,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
    },
    {
      title: 'Total Students',
      value: stats.totalStudents,
      icon: Users,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    },
    {
      title: 'Total Views',
      value: stats.totalViews,
      icon: TrendingUp,
      color: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
    },
  ];

  return (
    <div className="min-h-screen bg-page-gradient py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statsCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="hover:shadow-lg transition-shadow bg-card border border-border/50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">{stat.title}</p>
                      <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                    </div>
                    <div className={`${stat.bgColor} p-3 rounded-lg`}>
                      <Icon className={`w-6 h-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card
            onClick={() => setShowCourseModal(true)}
            className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-dashed border-blue-300 hover:border-blue-500 bg-card dark:border-blue-800 dark:hover:border-blue-600"
          >
            <CardContent className="p-6 flex flex-col items-center justify-center text-center min-h-[150px]">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-full mb-3">
                <Plus className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="font-semibold text-lg mb-1 text-foreground">Create Lesson</h3>
              <p className="text-sm text-muted-foreground">Create a new micro-lesson</p>
            </CardContent>
          </Card>

          <Link href="/instructor/courses/create">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-dashed border-green-300 hover:border-green-500 bg-card dark:border-green-800 dark:hover:border-green-600">
              <CardContent className="p-6 flex flex-col items-center justify-center text-center min-h-[150px]">
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-full mb-3">
                  <Video className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="font-semibold text-lg mb-1 text-foreground">Create Course</h3>
                <p className="text-sm text-muted-foreground">Build a complete course</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/instructor/quizzes/create">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-dashed border-purple-300 hover:border-purple-500 bg-card dark:border-purple-800 dark:hover:border-purple-600">
              <CardContent className="p-6 flex flex-col items-center justify-center text-center min-h-[150px]">
                <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-full mb-3">
                  <FileQuestion className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="font-semibold text-lg mb-1 text-foreground">Create Quiz</h3>
                <p className="text-sm text-muted-foreground">Design interactive quizzes</p>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Recent Lessons */}
        <Card className="mb-8 bg-card border border-border/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl text-foreground">Recent Lessons</CardTitle>
              <Link href="/instructor/lessons">
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground" size="sm">
                  View All
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center text-muted-foreground py-8">Loading lessons...</p>
            ) : lessons.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">No lessons created yet</p>
                <Link href="/instructor/lessons/create">
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Lesson
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {lessons.slice(0, 5).map((lesson: any) => (
                  <div
                    key={lesson._id}
                    className="flex items-center justify-between p-4 border border-border/50 rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex-1">
                      <h4 className="font-semibold text-lg mb-1 text-foreground">{lesson.title}</h4>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          {lesson.views || 0} views
                        </span>
                        <span className="capitalize">{lesson.difficulty}</span>
                        <span>{lesson.estimatedTime} min</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link href={`/lessons/${lesson._id}`}>
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Link href={`/instructor/lessons/${lesson._id}/edit`}>
                        <Button variant="ghost" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Courses */}
        <Card className="bg-card border border-border/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl text-foreground">Recent Courses</CardTitle>
              <Link href="/instructor/courses">
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground" size="sm">
                  View All
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {courses.length === 0 ? (
              <div className="text-center py-12">
                <Video className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">No courses created yet</p>
                <Link href="/instructor/courses/create">
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Course
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {courses.slice(0, 6).map((course: any) => (
                  <Card key={course._id} className="hover:shadow-lg transition-shadow bg-card border border-border/50">
                    <CardContent className="p-4">
                      <h4 className="font-semibold mb-2 text-foreground">{course.title}</h4>
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {course.description}
                      </p>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{course.enrolledCount || 0} students</span>
                        <Link href={`/instructor/courses/${course._id}/lessons`}>
                          <Button variant="ghost" size="sm">
                            Manage Lessons
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Course Selection Modal */}
        {showCourseModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-popover rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden shadow-2xl border border-border">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-green-600 to-teal-600 p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold mb-1">Create New Lesson</h2>
                    <p className="text-green-100 text-sm opacity-90">Select a course to add this lesson to</p>
                  </div>
                  <button
                    onClick={() => {
                      setShowCourseModal(false);
                      setSelectedCourse(null);
                    }}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(80vh-140px)]">
                {courses.length === 0 ? (
                  <div className="text-center py-12">
                    <Video className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">No Courses Available</h3>
                    <p className="text-muted-foreground mb-6">You need to create a course first before adding lessons</p>
                    <Button
                      onClick={() => {
                        setShowCourseModal(false);
                        router.push('/instructor/courses/create');
                      }}
                      className="bg-gradient-to-r from-green-600 to-teal-600 hover:shadow-lg"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create Your First Course
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="mb-4">
                      <p className="text-sm text-muted-foreground">
                        Choose which course this lesson will belong to. You can also create a standalone lesson.
                      </p>
                    </div>

                    {/* Course List */}
                    <div className="space-y-3 mb-6">
                      {courses.map((course: any) => (
                        <div
                          key={course._id}
                          onClick={() => setSelectedCourse(course)}
                          className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${selectedCourse?._id === course._id
                            ? 'border-primary bg-primary/10 shadow-md'
                            : 'border-border hover:border-primary/50 hover:shadow-sm'
                            }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-semibold text-foreground mb-1 flex items-center gap-2">
                                {course.title}
                                {selectedCourse?._id === course._id && (
                                  <CheckCircle className="w-5 h-5 text-primary" />
                                )}
                              </h4>
                              <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                                {course.description}
                              </p>
                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <BookOpen className="w-3 h-3" />
                                  {course.lessons?.length || 0} lessons
                                </span>
                                <span className="flex items-center gap-1">
                                  <Users className="w-3 h-3" />
                                  {course.enrolledCount || 0} students
                                </span>
                                <span className="capitalize px-2 py-0.5 bg-muted rounded-full">
                                  {course.difficulty}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Standalone Option */}
                    <div
                      onClick={() => setSelectedCourse({ _id: 'standalone', title: 'Standalone Lesson' })}
                      className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${selectedCourse?._id === 'standalone'
                        ? 'border-primary bg-primary/10 shadow-md'
                        : 'border-border hover:border-primary/50 hover:shadow-sm'
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          <BookOpen className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-foreground flex items-center gap-2">
                            Create Standalone Lesson
                            {selectedCourse?._id === 'standalone' && (
                              <CheckCircle className="w-5 h-5 text-primary" />
                            )}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            Create a lesson without attaching it to any course
                          </p>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Modal Footer */}
              {courses.length > 0 && (
                <div className="border-t border-border p-6 bg-muted/30">
                  <div className="flex items-center justify-between gap-4">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowCourseModal(false);
                        setSelectedCourse(null);
                      }}
                      className="flex-1 bg-background text-foreground border-primary hover:bg-destructive hover:text-destructive-foreground hover:border-destructive"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={() => {
                        if (!selectedCourse) {
                          toast.error('Please select a course or choose standalone option');
                          return;
                        }
                        setShowCourseModal(false);
                        if (selectedCourse._id === 'standalone') {
                          router.push('/instructor/lessons/create');
                        } else {
                          router.push(`/instructor/lessons/create?courseId=${selectedCourse._id}`);
                        }
                      }}
                      disabled={!selectedCourse}
                      className="flex-1 bg-gradient-to-r from-green-600 to-teal-600 hover:shadow-lg disabled:opacity-50"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Continue to Create Lesson
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
