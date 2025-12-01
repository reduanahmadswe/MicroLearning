'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  GraduationCap,
  Clock,
  BookOpen,
  Users,
  Star,
  TrendingUp,
  Filter,
  Search,
  Play,
  CheckCircle,
  DollarSign,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { coursesAPI } from '@/services/api.service';
import { toast } from 'sonner';
import { Course } from '@/types';

export default function CoursesPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrolledCourses, setEnrolledCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [selectedTopic, setSelectedTopic] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'browse' | 'enrolled'>('browse');

  const topics = ['Programming', 'Mathematics', 'Science', 'Business', 'Language', 'Design'];
  const difficulties = ['beginner', 'intermediate', 'advanced'];

  useEffect(() => {
    if (activeTab === 'browse') {
      loadCourses();
    } else {
      loadEnrolledCourses();
    }
  }, [selectedDifficulty, selectedTopic, activeTab]);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (selectedDifficulty !== 'all') params.difficulty = selectedDifficulty;
      if (selectedTopic !== 'all') params.topic = selectedTopic;
      if (searchQuery) params.search = searchQuery;

      const response = await coursesAPI.getCourses(params);
      setCourses(response.data.data || []);
    } catch (error: any) {
      toast.error('Failed to load courses');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadEnrolledCourses = async () => {
    try {
      setLoading(true);
      const response = await coursesAPI.getEnrolledCourses();
      setEnrolledCourses(response.data.data || []);
    } catch (error: any) {
      toast.error('Failed to load enrolled courses');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadCourses();
  };

  const filteredCourses = courses.filter(course => {
    if (searchQuery && !course.title.toLowerCase().includes(searchQuery.toLowerCase())) {
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
              <h1 className="text-3xl font-bold text-gray-900">Courses</h1>
              <p className="text-gray-600 mt-1">Structured learning paths for mastery</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 mt-6">
            <button
              onClick={() => setActiveTab('browse')}
              className={`px-6 py-2 font-medium rounded-lg transition-colors ${
                activeTab === 'browse'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Browse Courses
            </button>
            <button
              onClick={() => setActiveTab('enrolled')}
              className={`px-6 py-2 font-medium rounded-lg transition-colors ${
                activeTab === 'enrolled'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              My Courses
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'browse' ? (
          <>
            {/* Filters */}
            <div className="mb-8 space-y-4">
              <form onSubmit={handleSearch} className="flex gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search courses..."
                    className="pl-10"
                  />
                </div>
                <Button type="submit">Search</Button>
              </form>

              <div className="flex flex-wrap gap-4">
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

                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">Topic:</span>
                  <select
                    value={selectedTopic}
                    onChange={(e) => setSelectedTopic(e.target.value)}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="all">All Topics</option>
                    {topics.map((topic) => (
                      <option key={topic} value={topic}>
                        {topic}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Courses Grid */}
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : filteredCourses.length === 0 ? (
              <Card className="p-12 text-center">
                <GraduationCap className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No courses found</h3>
                <p className="text-gray-600">Try adjusting your filters</p>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCourses.map((course) => (
                  <Card key={course._id} className="hover:shadow-xl transition-all hover:-translate-y-1">
                    {course.thumbnail && (
                      <div className="h-48 overflow-hidden rounded-t-lg">
                        <img
                          src={course.thumbnail}
                          alt={course.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <CardHeader>
                      <div className="flex items-start justify-between mb-2">
                        <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                          course.difficulty === 'beginner' ? 'bg-green-100 text-green-700' :
                          course.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {course.difficulty}
                        </div>
                        {course.isPremium && (
                          <span className="flex items-center gap-1 text-yellow-600 text-sm font-medium">
                            <DollarSign className="w-4 h-4" />
                            ${course.price}
                          </span>
                        )}
                      </div>
                      <CardTitle className="text-lg line-clamp-2">{course.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">{course.description}</p>

                      <div className="space-y-2 mb-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-4 h-4" />
                          <span>{course.lessons?.length || 0} lessons</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span>{course.estimatedDuration} hours</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          <span>{course.enrolledCount || 0} students</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                          <span>{course.rating?.toFixed(1) || 'N/A'}</span>
                        </div>
                      </div>

                      <Link href={`/courses/${course._id}`}>
                        <Button className="w-full">
                          View Course
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            {/* Enrolled Courses */}
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : enrolledCourses.length === 0 ? (
              <Card className="p-12 text-center">
                <GraduationCap className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No enrolled courses</h3>
                <p className="text-gray-600 mb-4">Start learning by enrolling in a course</p>
                <Button onClick={() => setActiveTab('browse')}>
                  Browse Courses
                </Button>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {enrolledCourses.map((enrollment) => {
                  const course = enrollment.course;
                  return (
                    <Card key={enrollment._id} className="hover:shadow-xl transition-all">
                      {course.thumbnail && (
                        <div className="h-48 overflow-hidden rounded-t-lg relative">
                          <img
                            src={course.thumbnail}
                            alt={course.title}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-2 right-2 bg-white px-3 py-1 rounded-full text-sm font-medium">
                            {enrollment.progress}%
                          </div>
                        </div>
                      )}
                      <CardHeader>
                        <CardTitle className="text-lg line-clamp-2">{course.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="mb-4">
                          <div className="flex justify-between text-sm text-gray-600 mb-2">
                            <span>Progress</span>
                            <span>{enrollment.progress}%</span>
                          </div>
                          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-blue-600 to-purple-600"
                              style={{ width: `${enrollment.progress}%` }}
                            />
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span>{enrollment.completedLessons?.length || 0} / {course.lessons?.length || 0} lessons</span>
                        </div>

                        <Link href={`/courses/${course._id}`}>
                          <Button className="w-full">
                            <Play className="w-4 h-4 mr-2" />
                            Continue Learning
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
