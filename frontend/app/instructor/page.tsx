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
  Trash2
} from 'lucide-react';
import Link from 'next/link';
import { lessonsAPI, coursesAPI } from '@/services/api.service';
import { toast } from 'sonner';

export default function InstructorDashboard() {
  const [stats, setStats] = useState({
    totalLessons: 0,
    totalCourses: 0,
    totalStudents: 0,
    totalViews: 0,
  });
  const [lessons, setLessons] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

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
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Total Courses',
      value: stats.totalCourses,
      icon: Video,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Total Students',
      value: stats.totalStudents,
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Total Views',
      value: stats.totalViews,
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
       
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statsCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                      <p className="text-3xl font-bold">{stat.value}</p>
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
          <Link href="/instructor/lessons/create">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-dashed border-blue-300 hover:border-blue-500">
              <CardContent className="p-6 flex flex-col items-center justify-center text-center min-h-[150px]">
                <div className="bg-blue-50 p-4 rounded-full mb-3">
                  <Plus className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="font-semibold text-lg mb-1">Create Lesson</h3>
                <p className="text-sm text-gray-600">Create a new micro-lesson</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/instructor/courses/create">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-dashed border-green-300 hover:border-green-500">
              <CardContent className="p-6 flex flex-col items-center justify-center text-center min-h-[150px]">
                <div className="bg-green-50 p-4 rounded-full mb-3">
                  <Video className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="font-semibold text-lg mb-1">Create Course</h3>
                <p className="text-sm text-gray-600">Build a complete course</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/instructor/quizzes/create">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-dashed border-purple-300 hover:border-purple-500">
              <CardContent className="p-6 flex flex-col items-center justify-center text-center min-h-[150px]">
                <div className="bg-purple-50 p-4 rounded-full mb-3">
                  <FileQuestion className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="font-semibold text-lg mb-1">Create Quiz</h3>
                <p className="text-sm text-gray-600">Design interactive quizzes</p>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Recent Lessons */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">Recent Lessons</CardTitle>
              <Link href="/instructor/lessons">
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center text-gray-500 py-8">Loading lessons...</p>
            ) : lessons.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">No lessons created yet</p>
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
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1">
                      <h4 className="font-semibold text-lg mb-1">{lesson.title}</h4>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
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
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">Recent Courses</CardTitle>
              <Link href="/instructor/courses">
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {courses.length === 0 ? (
              <div className="text-center py-12">
                <Video className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">No courses created yet</p>
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
                  <Card key={course._id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-4">
                      <h4 className="font-semibold mb-2">{course.title}</h4>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {course.description}
                      </p>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">{course.enrolledCount || 0} students</span>
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
      </div>
    </div>
  );
}
