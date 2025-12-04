'use client';

import { useEffect, useState } from 'react';
import {
  BarChart3,
  Users,
  BookOpen,
  TrendingUp,
  DollarSign,
  Award,
  Target,
  Clock,
  CheckCircle,
  Star,
  Calendar,
  Eye,
  Download,
  ArrowUp,
  ArrowDown,
  Activity,
  Zap,
  Trophy,
  MessageSquare,
  PlayCircle,
  FileText,
} from 'lucide-react';
import { toast } from 'sonner';

interface CourseAnalytics {
  _id: string;
  title: string;
  enrolledCount: number;
  completionRate: number;
  avgProgress: number;
  avgRating: number;
  totalRevenue: number;
  activeStudents: number;
  totalLessons: number;
  totalQuizzes: number;
}

interface Analytics {
  overview: {
    totalCourses: number;
    totalStudents: number;
    totalEnrollments: number;
    totalRevenue: number;
    avgProgress: number;
    completionRate: number;
    activeStudents: number;
    recentEnrollments: number;
  };
  courses: CourseAnalytics[];
  enrollmentTrend: {
    month: string;
    enrollments: number;
  }[];
  topPerformingCourses: {
    _id: string;
    title: string;
    metric: number;
  }[];
  studentEngagement: {
    active: number;
    inactive: number;
    moderatelyActive: number;
  };
  revenueByMonth: {
    month: string;
    revenue: number;
  }[];
}

export default function InstructorAnalyticsPage() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');
  const [selectedMetric, setSelectedMetric] = useState<'enrollments' | 'revenue' | 'completion'>('enrollments');

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/courses/instructor/analytics?range=${timeRange}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }

      const data = await response.json();
      setAnalytics(data.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('Failed to load analytics');
      setAnalytics(null);
    } finally {
      setLoading(false);
    }
  };

  const generateMockAnalytics_unused = (): Analytics => {
    return {
      overview: {
        totalCourses: 12,
        totalStudents: 245,
        totalEnrollments: 487,
        totalRevenue: 24500,
        avgProgress: 68,
        completionRate: 42,
        activeStudents: 156,
        recentEnrollments: 28,
      },
      courses: [
        {
          _id: '1',
          title: 'React Fundamentals',
          enrolledCount: 85,
          completionRate: 65,
          avgProgress: 72,
          avgRating: 4.5,
          totalRevenue: 4250,
          activeStudents: 52,
          totalLessons: 20,
          totalQuizzes: 10,
        },
        {
          _id: '2',
          title: 'JavaScript Advanced',
          enrolledCount: 72,
          completionRate: 58,
          avgProgress: 65,
          avgRating: 4.3,
          totalRevenue: 3600,
          activeStudents: 45,
          totalLessons: 18,
          totalQuizzes: 9,
        },
        {
          _id: '3',
          title: 'Node.js Backend Development',
          enrolledCount: 68,
          completionRate: 48,
          avgProgress: 60,
          avgRating: 4.7,
          totalRevenue: 3400,
          activeStudents: 38,
          totalLessons: 25,
          totalQuizzes: 12,
        },
      ],
      enrollmentTrend: [
        { month: 'Jan', enrollments: 45 },
        { month: 'Feb', enrollments: 52 },
        { month: 'Mar', enrollments: 48 },
        { month: 'Apr', enrollments: 65 },
        { month: 'May', enrollments: 72 },
        { month: 'Jun', enrollments: 68 },
      ],
      topPerformingCourses: [
        { _id: '1', title: 'React Fundamentals', metric: 85 },
        { _id: '2', title: 'JavaScript Advanced', metric: 72 },
        { _id: '3', title: 'Node.js Backend', metric: 68 },
      ],
      studentEngagement: {
        active: 156,
        moderatelyActive: 64,
        inactive: 25,
      },
      revenueByMonth: [
        { month: 'Jan', revenue: 3200 },
        { month: 'Feb', revenue: 3800 },
        { month: 'Mar', revenue: 3500 },
        { month: 'Apr', revenue: 4200 },
        { month: 'May', revenue: 4800 },
        { month: 'Jun', revenue: 4500 },
      ],
    };
  };

  const exportAnalyticsToExcel = () => {
    if (!analytics) return;

    try {
      const XLSX = require('xlsx');

      // Overview Sheet
      const overviewData = [
        ['Instructor Analytics Report'],
        ['Generated on', new Date().toLocaleString()],
        [],
        ['Metric', 'Value'],
        ['Total Courses', analytics.overview.totalCourses],
        ['Total Students', analytics.overview.totalStudents],
        ['Total Enrollments', analytics.overview.totalEnrollments],
        ['Total Revenue', formatCurrency(analytics.overview.totalRevenue)],
        ['Average Progress', `${analytics.overview.avgProgress}%`],
        ['Completion Rate', `${analytics.overview.completionRate}%`],
        ['Active Students', analytics.overview.activeStudents],
        ['Recent Enrollments', analytics.overview.recentEnrollments],
      ];

      // Course Performance Sheet
      const courseData = [
        ['Course Performance'],
        [],
        ['Course Name', 'Students', 'Completion Rate', 'Avg Progress', 'Rating', 'Revenue', 'Active Students', 'Lessons', 'Quizzes'],
        ...analytics.courses.map((course) => [
          course.title,
          course.enrolledCount,
          `${course.completionRate}%`,
          `${course.avgProgress}%`,
          course.avgRating,
          formatCurrency(course.totalRevenue),
          course.activeStudents,
          course.totalLessons,
          course.totalQuizzes,
        ]),
      ];

      // Enrollment Trend Sheet
      const trendData = [
        ['Enrollment Trend'],
        [],
        ['Month', 'Enrollments'],
        ...analytics.enrollmentTrend.map((item) => [item.month, item.enrollments]),
      ];

      // Student Engagement Sheet
      const engagementData = [
        ['Student Engagement'],
        [],
        ['Category', 'Count'],
        ['Active', analytics.studentEngagement.active],
        ['Moderately Active', analytics.studentEngagement.moderatelyActive],
        ['Inactive', analytics.studentEngagement.inactive],
      ];

      // Create workbook and add sheets
      const wb = XLSX.utils.book_new();
      const wsOverview = XLSX.utils.aoa_to_sheet(overviewData);
      const wsCourses = XLSX.utils.aoa_to_sheet(courseData);
      const wsTrend = XLSX.utils.aoa_to_sheet(trendData);
      const wsEngagement = XLSX.utils.aoa_to_sheet(engagementData);

      XLSX.utils.book_append_sheet(wb, wsOverview, 'Overview');
      XLSX.utils.book_append_sheet(wb, wsCourses, 'Course Performance');
      XLSX.utils.book_append_sheet(wb, wsTrend, 'Enrollment Trend');
      XLSX.utils.book_append_sheet(wb, wsEngagement, 'Student Engagement');

      // Generate file name with timestamp
      const fileName = `Analytics_Report_${new Date().toISOString().split('T')[0]}.xlsx`;

      // Download file
      XLSX.writeFile(wb, fileName);
      toast.success('Analytics exported successfully!');
    } catch (error) {
      console.error('Error exporting analytics:', error);
      toast.error('Failed to export analytics. Please try again.');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getChangeIndicator = (value: number) => {
    if (value > 0) {
      return (
        <span className="flex items-center gap-1 text-green-600 text-sm font-semibold">
          <ArrowUp className="w-4 h-4" />
          +{value}%
        </span>
      );
    } else if (value < 0) {
      return (
        <span className="flex items-center gap-1 text-red-600 text-sm font-semibold">
          <ArrowDown className="w-4 h-4" />
          {value}%
        </span>
      );
    }
    return <span className="text-gray-500 text-sm">No change</span>;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!analytics || !analytics.overview) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-slate-50 flex items-center justify-center">
        <div className="text-center">
          <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No analytics data available</h3>
          <p className="text-gray-600">Start creating courses to see your analytics</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-teal-600 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                Instructor Analytics
              </h1>
              <p className="text-gray-600 mt-2">Track your teaching performance and student engagement</p>
            </div>
            <div className="flex items-center gap-3">
              {/* Time Range Filter */}
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="all">All time</option>
              </select>
              <button
                onClick={exportAnalyticsToExcel}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-lg hover:shadow-lg transition-all"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              {getChangeIndicator(12)}
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">{analytics.overview.totalStudents}</h3>
            <p className="text-sm text-gray-600">Total Students</p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-purple-600" />
              </div>
              {getChangeIndicator(8)}
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">{analytics.overview.totalCourses}</h3>
            <p className="text-sm text-gray-600">Total Courses</p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              {getChangeIndicator(15)}
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">
              {formatCurrency(analytics.overview.totalRevenue)}
            </h3>
            <p className="text-sm text-gray-600">Total Revenue</p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-orange-600" />
              </div>
              {getChangeIndicator(5)}
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">{analytics.overview.avgProgress}%</h3>
            <p className="text-sm text-gray-600">Avg Progress</p>
          </div>
        </div>

        {/* Key Metrics Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-green-50 to-teal-50 rounded-xl p-6 border border-green-200">
            <div className="flex items-center gap-3 mb-3">
              <Activity className="w-5 h-5 text-green-600" />
              <p className="text-sm font-semibold text-gray-700">Active Students</p>
            </div>
            <p className="text-3xl font-bold text-green-600">{analytics.overview.activeStudents}</p>
            <p className="text-xs text-gray-600 mt-2">
              {Math.round((analytics.overview.activeStudents / analytics.overview.totalStudents) * 100)}% of total
            </p>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
            <div className="flex items-center gap-3 mb-3">
              <Target className="w-5 h-5 text-blue-600" />
              <p className="text-sm font-semibold text-gray-700">Completion Rate</p>
            </div>
            <p className="text-3xl font-bold text-blue-600">{analytics.overview.completionRate}%</p>
            <p className="text-xs text-gray-600 mt-2">Students completing courses</p>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
            <div className="flex items-center gap-3 mb-3">
              <Zap className="w-5 h-5 text-purple-600" />
              <p className="text-sm font-semibold text-gray-700">Total Enrollments</p>
            </div>
            <p className="text-3xl font-bold text-purple-600">{analytics.overview.totalEnrollments}</p>
            <p className="text-xs text-gray-600 mt-2">Across all courses</p>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-6 border border-orange-200">
            <div className="flex items-center gap-3 mb-3">
              <Calendar className="w-5 h-5 text-orange-600" />
              <p className="text-sm font-semibold text-gray-700">Recent Enrollments</p>
            </div>
            <p className="text-3xl font-bold text-orange-600">{analytics.overview.recentEnrollments}</p>
            <p className="text-xs text-gray-600 mt-2">In last {timeRange === '7d' ? '7 days' : timeRange === '30d' ? '30 days' : '90 days'}</p>
          </div>
        </div>

        {/* Student Engagement Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              Student Engagement
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Active</span>
                  <span className="text-sm font-bold text-green-600">{analytics.studentEngagement.active}</span>
                </div>
                <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 rounded-full transition-all"
                    style={{
                      width: `${
                        (analytics.studentEngagement.active /
                          (analytics.studentEngagement.active +
                            analytics.studentEngagement.moderatelyActive +
                            analytics.studentEngagement.inactive)) *
                        100
                      }%`,
                    }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Moderately Active</span>
                  <span className="text-sm font-bold text-yellow-600">{analytics.studentEngagement.moderatelyActive}</span>
                </div>
                <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-yellow-500 rounded-full transition-all"
                    style={{
                      width: `${
                        (analytics.studentEngagement.moderatelyActive /
                          (analytics.studentEngagement.active +
                            analytics.studentEngagement.moderatelyActive +
                            analytics.studentEngagement.inactive)) *
                        100
                      }%`,
                    }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Inactive</span>
                  <span className="text-sm font-bold text-red-600">{analytics.studentEngagement.inactive}</span>
                </div>
                <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-red-500 rounded-full transition-all"
                    style={{
                      width: `${
                        (analytics.studentEngagement.inactive /
                          (analytics.studentEngagement.active +
                            analytics.studentEngagement.moderatelyActive +
                            analytics.studentEngagement.inactive)) *
                        100
                      }%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Top Performing Courses */}
          <div className="lg:col-span-2 bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-600" />
              Top Performing Courses
            </h3>
            <div className="space-y-3">
              {analytics.topPerformingCourses.map((course, index) => (
                <div key={course._id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                    index === 0 ? 'bg-yellow-100 text-yellow-700' :
                    index === 1 ? 'bg-gray-200 text-gray-700' :
                    'bg-orange-100 text-orange-700'
                  }`}>
                    #{index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{course.title}</p>
                    <p className="text-sm text-gray-600">{course.metric} enrollments</p>
                  </div>
                  <div className="flex-shrink-0">
                    <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Course Performance Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-8">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-purple-600" />
              Course Performance
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Course
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Students
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Completion
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Avg Progress
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Rating
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Revenue
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Active
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {analytics.courses.map((course) => (
                  <tr key={course._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-gray-900">{course.title}</p>
                        <p className="text-sm text-gray-600">
                          {course.totalLessons} lessons · {course.totalQuizzes} quizzes
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                        <Users className="w-4 h-4" />
                        {course.enrolledCount}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex flex-col items-center">
                        <span className={`text-sm font-bold ${
                          course.completionRate >= 70 ? 'text-green-600' :
                          course.completionRate >= 50 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {course.completionRate}%
                        </span>
                        <div className="w-20 h-2 bg-gray-200 rounded-full mt-1 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              course.completionRate >= 70 ? 'bg-green-500' :
                              course.completionRate >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${course.completionRate}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-sm font-semibold text-gray-900">{course.avgProgress}%</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        <span className="text-sm font-semibold text-gray-900">{course.avgRating}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-sm font-bold text-green-600">
                        {formatCurrency(course.totalRevenue)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                        <Activity className="w-4 h-4" />
                        {course.activeStudents}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Enrollment Trend Chart */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            Enrollment Trend
          </h3>
          <div className="flex items-end justify-between gap-2 h-64">
            {analytics.enrollmentTrend.map((item, index) => {
              const maxEnrollment = Math.max(...analytics.enrollmentTrend.map((i) => i.enrollments));
              const height = (item.enrollments / maxEnrollment) * 100;
              return (
                <div key={index} className="flex-1 flex flex-col items-center gap-2">
                  <span className="text-xs font-semibold text-gray-700">{item.enrollments}</span>
                  <div
                    className="w-full bg-gradient-to-t from-green-500 to-teal-400 rounded-t-lg hover:opacity-80 transition-opacity cursor-pointer"
                    style={{ height: `${height}%` }}
                    title={`${item.month}: ${item.enrollments} enrollments`}
                  ></div>
                  <span className="text-sm font-medium text-gray-600">{item.month}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
