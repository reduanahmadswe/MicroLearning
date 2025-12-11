'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
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
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAppDispatch } from '@/store/hooks';
import {
  useInstructorAnalytics,
  useInstructorAnalyticsLoading,
  useInstructorAnalyticsError,
  useInstructorAnalyticsTimeRange,
} from '@/store/hooks';
import { fetchInstructorAnalytics } from '@/store/globalSlice';
import { useAuthStore } from '@/store/authStore';

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
  const router = useRouter();
  const { token } = useAuthStore();
  const dispatch = useAppDispatch();

  // Redux state
  const analytics = useInstructorAnalytics() as Analytics | null;
  const loading = useInstructorAnalyticsLoading();
  const error = useInstructorAnalyticsError();
  const currentTimeRange = useInstructorAnalyticsTimeRange();

  // Local UI state
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | 'all'>(currentTimeRange);
  const [selectedMetric, setSelectedMetric] = useState<'enrollments' | 'revenue' | 'completion'>('enrollments');
  const [currentPage, setCurrentPage] = useState(1);
  const coursesPerPage = 5;

  useEffect(() => {
    if (!token) {
      router.push('/auth/login');
      return;
    }

    // Fetch analytics (will use cache if available)
    dispatch(fetchInstructorAnalytics({ timeRange }));
  }, [token, timeRange, dispatch]);

  // Show error toast
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const handleRefresh = () => {
    dispatch(fetchInstructorAnalytics({ timeRange, force: true }));
    toast.success('Refreshing analytics...');
  };

  const handleTimeRangeChange = (newRange: '7d' | '30d' | '90d' | 'all') => {
    setTimeRange(newRange);
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

      // Create workbook and add sheets
      const wb = XLSX.utils.book_new();
      const wsOverview = XLSX.utils.aoa_to_sheet(overviewData);
      const wsCourses = XLSX.utils.aoa_to_sheet(courseData);

      XLSX.utils.book_append_sheet(wb, wsOverview, 'Overview');
      XLSX.utils.book_append_sheet(wb, wsCourses, 'Course Performance');

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
        <span className="flex items-center gap-1 text-green-600 dark:text-green-400 text-sm font-semibold">
          <ArrowUp className="w-4 h-4" />
          +{value}%
        </span>
      );
    } else if (value < 0) {
      return (
        <span className="flex items-center gap-1 text-red-600 dark:text-red-400 text-sm font-semibold">
          <ArrowDown className="w-4 h-4" />
          {value}%
        </span>
      );
    }
    return <span className="text-gray-500 text-sm">No change</span>;
  };

  if (loading && !analytics) {
    return (
      <div className="min-h-screen bg-page-gradient flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!analytics || !analytics.overview) {
    return (
      <div className="min-h-screen bg-page-gradient flex items-center justify-center px-3">
        <div className="text-center">
          <BarChart3 className="w-16 h-16 text-green-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-foreground mb-2">No analytics data available</h3>
          <p className="text-muted-foreground">Start creating courses to see your analytics</p>
        </div>
      </div>
    );
  }

  // Pagination calculations
  const totalPages = Math.ceil(analytics.courses.length / coursesPerPage);
  const startIndex = (currentPage - 1) * coursesPerPage;
  const endIndex = startIndex + coursesPerPage;
  const paginatedCourses = analytics.courses.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const showEllipsisStart = currentPage > 3;
    const showEllipsisEnd = currentPage < totalPages - 2;

    // First page
    pages.push(
      <button
        key={1}
        onClick={() => goToPage(1)}
        className={`px-3 py-2 sm:px-4 text-xs sm:text-sm rounded-lg transition-all ${currentPage === 1
          ? 'bg-gradient-to-r from-green-600 to-teal-600 text-white shadow-md'
          : 'bg-card text-muted-foreground hover:bg-secondary border-2 border-border'
          }`}
      >
        1
      </button>
    );

    // Ellipsis after first page
    if (showEllipsisStart) {
      pages.push(<span key="ellipsis-start" className="px-2 text-muted-foreground">...</span>);
    }

    // Pages around current
    const startPage = Math.max(2, currentPage - 1);
    const endPage = Math.min(totalPages - 1, currentPage + 1);

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => goToPage(i)}
          className={`px-3 py-2 sm:px-4 text-xs sm:text-sm rounded-lg transition-all ${currentPage === i
            ? 'bg-gradient-to-r from-green-600 to-teal-600 text-white shadow-md'
            : 'bg-card text-muted-foreground hover:bg-secondary border-2 border-border'
            }`}
        >
          {i}
        </button>
      );
    }

    // Ellipsis before last page
    if (showEllipsisEnd) {
      pages.push(<span key="ellipsis-end" className="px-2 text-muted-foreground">...</span>);
    }

    // Last page
    if (totalPages > 1) {
      pages.push(
        <button
          key={totalPages}
          onClick={() => goToPage(totalPages)}
          className={`px-3 py-2 sm:px-4 text-xs sm:text-sm rounded-lg transition-all ${currentPage === totalPages
            ? 'bg-gradient-to-r from-green-600 to-teal-600 text-white shadow-md'
            : 'bg-card text-muted-foreground hover:bg-secondary border-2 border-border'
            }`}
        >
          {totalPages}
        </button>
      );
    }

    return (
      <div className="flex items-center justify-center gap-2 mt-6 flex-wrap">
        <button
          onClick={() => goToPage(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="flex items-center gap-1 px-3 py-2 sm:px-4 text-xs sm:text-sm bg-card text-muted-foreground rounded-lg hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-all border-2 border-border"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Previous</span>
        </button>

        {pages}

        <button
          onClick={() => goToPage(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="flex items-center gap-1 px-3 py-2 sm:px-4 text-xs sm:text-sm bg-card text-muted-foreground rounded-lg hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-all border-2 border-border"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-page-gradient">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <button
            onClick={() => router.push('/instructor/dashboard')}
            className="flex items-center gap-2 text-muted-foreground hover:text-green-600 dark:hover:text-green-400 mb-4 text-sm sm:text-base transition-colors"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>Back to Dashboard</span>
          </button>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-green-500 to-teal-600 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                </div>
                <span className="text-xl sm:text-3xl">Instructor Analytics</span>
              </h1>
              <p className="text-muted-foreground mt-2 text-xs sm:text-sm lg:text-base">Track your teaching performance and student engagement</p>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              {/* Time Range Filter */}
              <select
                value={timeRange}
                onChange={(e) => handleTimeRangeChange(e.target.value as any)}
                className="px-3 py-2 sm:px-4 text-xs sm:text-sm border-2 border-border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-card text-foreground"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="all">All time</option>
              </select>
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="px-3 py-2 sm:px-4 text-xs sm:text-sm bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all disabled:opacity-50"
              >
                {loading ? 'Refreshing...' : 'Refresh'}
              </button>
              <button
                onClick={exportAnalyticsToExcel}
                className="flex items-center gap-2 px-3 py-2 sm:px-4 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-lg hover:shadow-lg transition-all text-xs sm:text-sm"
              >
                <Download className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Export</span>
              </button>
            </div>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div className="bg-card rounded-xl p-4 sm:p-6 border-2 border-border shadow-sm hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 dark:text-green-400" />
              </div>
              {getChangeIndicator(12)}
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-1">{analytics.overview.totalStudents}</h3>
            <p className="text-xs sm:text-sm text-muted-foreground">Total Students</p>
          </div>

          <div className="bg-card rounded-xl p-4 sm:p-6 border-2 border-border shadow-sm hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-teal-100 dark:bg-teal-900/20 rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-teal-600 dark:text-teal-400" />
              </div>
              {getChangeIndicator(8)}
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-1">{analytics.overview.totalCourses}</h3>
            <p className="text-xs sm:text-sm text-muted-foreground">Total Courses</p>
          </div>

          <div className="bg-card rounded-xl p-4 sm:p-6 border-2 border-border shadow-sm hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-100 dark:bg-emerald-900/20 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              {getChangeIndicator(15)}
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-1 truncate">
              {formatCurrency(analytics.overview.totalRevenue)}
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground">Total Revenue</p>
          </div>

          <div className="bg-card rounded-xl p-4 sm:p-6 border-2 border-border shadow-sm hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 dark:text-green-400" />
              </div>
              {getChangeIndicator(5)}
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-1">{analytics.overview.avgProgress}%</h3>
            <p className="text-xs sm:text-sm text-muted-foreground">Avg Progress</p>
          </div>
        </div>

        {/* Key Metrics Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div className="bg-gradient-to-br from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/20 rounded-xl p-4 sm:p-6 border-2 border-green-200 dark:border-green-800">
            <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
              <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 dark:text-green-400" />
              <p className="text-xs sm:text-sm font-semibold text-foreground">Active Students</p>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-green-600 dark:text-green-400">{analytics.overview.activeStudents}</p>
            <p className="text-xs text-muted-foreground mt-1 sm:mt-2">
              {Math.round((analytics.overview.activeStudents / analytics.overview.totalStudents) * 100)}% of total
            </p>
          </div>

          <div className="bg-gradient-to-br from-teal-50 to-emerald-50 dark:from-teal-900/20 dark:to-emerald-900/20 rounded-xl p-4 sm:p-6 border-2 border-teal-200 dark:border-teal-800">
            <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
              <Target className="w-4 h-4 sm:w-5 sm:h-5 text-teal-600 dark:text-teal-400" />
              <p className="text-xs sm:text-sm font-semibold text-foreground">Completion Rate</p>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-teal-600 dark:text-teal-400">{analytics.overview.completionRate}%</p>
            <p className="text-xs text-muted-foreground mt-1 sm:mt-2">Students completing courses</p>
          </div>

          <div className="bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 rounded-xl p-4 sm:p-6 border-2 border-emerald-200 dark:border-emerald-800">
            <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
              <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 dark:text-emerald-400" />
              <p className="text-xs sm:text-sm font-semibold text-foreground">Total Enrollments</p>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-emerald-600 dark:text-emerald-400">{analytics.overview.totalEnrollments}</p>
            <p className="text-xs text-muted-foreground mt-1 sm:mt-2">Across all courses</p>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/20 rounded-xl p-4 sm:p-6 border-2 border-green-200 dark:border-green-800">
            <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 dark:text-green-400" />
              <p className="text-xs sm:text-sm font-semibold text-foreground">Recent Enrollments</p>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-green-600 dark:text-green-400">{analytics.overview.recentEnrollments}</p>
            <p className="text-xs text-muted-foreground mt-1 sm:mt-2">In last {timeRange === '7d' ? '7 days' : timeRange === '30d' ? '30 days' : '90 days'}</p>
          </div>
        </div>

        {/* Student Engagement Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-card rounded-xl p-4 sm:p-6 border-2 border-border shadow-sm">
            <h3 className="text-base sm:text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <Users className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 dark:text-green-400" />
              <span className="text-sm sm:text-lg">Student Engagement</span>
            </h3>
            <div className="space-y-3 sm:space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs sm:text-sm font-medium text-muted-foreground">Active</span>
                  <span className="text-xs sm:text-sm font-bold text-green-600 dark:text-green-400">{analytics.studentEngagement.active}</span>
                </div>
                <div className="h-2 sm:h-3 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 rounded-full transition-all"
                    style={{
                      width: `${(analytics.studentEngagement.active /
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
                  <span className="text-xs sm:text-sm font-medium text-muted-foreground">Moderately Active</span>
                  <span className="text-xs sm:text-sm font-bold text-teal-600 dark:text-teal-400">{analytics.studentEngagement.moderatelyActive}</span>
                </div>
                <div className="h-2 sm:h-3 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-teal-500 rounded-full transition-all"
                    style={{
                      width: `${(analytics.studentEngagement.moderatelyActive /
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
                  <span className="text-xs sm:text-sm font-medium text-muted-foreground">Inactive</span>
                  <span className="text-xs sm:text-sm font-bold text-red-600 dark:text-red-400">{analytics.studentEngagement.inactive}</span>
                </div>
                <div className="h-2 sm:h-3 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-red-500 rounded-full transition-all"
                    style={{
                      width: `${(analytics.studentEngagement.inactive /
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
          <div className="lg:col-span-2 bg-card rounded-xl p-4 sm:p-6 border-2 border-border shadow-sm">
            <h3 className="text-base sm:text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 dark:text-green-400" />
              <span className="text-sm sm:text-lg">Top Performing Courses</span>
            </h3>
            <div className="space-y-2 sm:space-y-3">
              {analytics.topPerformingCourses.map((course, index) => (
                <div key={course._id} className="flex items-center gap-3 sm:gap-4 p-2 sm:p-3 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors">
                  <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm ${index === 0 ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400' :
                    index === 1 ? 'bg-teal-100 dark:bg-teal-900/20 text-teal-700 dark:text-teal-400' :
                      'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400'
                    }`}>
                    #{index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground truncate text-xs sm:text-sm lg:text-base">{course.title}</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">{course.metric} enrollments</p>
                  </div>
                  <div className="flex-shrink-0">
                    <Star className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 fill-green-500" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Course Performance Table */}
        <div className="bg-card rounded-xl border-2 border-border shadow-sm overflow-hidden mb-6 sm:mb-8">
          <div className="p-4 sm:p-6 border-b-2 border-border">
            <div className="flex items-center justify-between">
              <h3 className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
                <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 dark:text-green-400" />
                <span className="text-sm sm:text-lg">Course Performance</span>
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Showing {startIndex + 1}-{Math.min(endIndex, analytics.courses.length)} of {analytics.courses.length}
              </p>
            </div>
          </div>

          {/* Mobile Card View */}
          <div className="block lg:hidden">
            {paginatedCourses.map((course) => (
              <div key={course._id} className="p-4 border-b-2 border-border hover:bg-secondary/50 transition-colors">
                <div className="mb-3">
                  <p className="font-semibold text-foreground text-sm mb-1">{course.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {course.totalLessons} lessons · {course.totalQuizzes} quizzes
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-2">
                    <p className="text-xs text-muted-foreground mb-1">Students</p>
                    <p className="flex items-center gap-1 text-sm font-bold text-green-600 dark:text-green-400">
                      <Users className="w-3 h-3" />
                      {course.enrolledCount}
                    </p>
                  </div>

                  <div className="bg-teal-50 dark:bg-teal-900/20 rounded-lg p-2">
                    <p className="text-xs text-muted-foreground mb-1">Active</p>
                    <p className="flex items-center gap-1 text-sm font-bold text-teal-600 dark:text-teal-400">
                      <Activity className="w-3 h-3" />
                      {course.activeStudents}
                    </p>
                  </div>

                  <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-2">
                    <p className="text-xs text-muted-foreground mb-1">Completion</p>
                    <p className={`text-sm font-bold ${course.completionRate >= 70 ? 'text-green-600 dark:text-green-400' :
                      course.completionRate >= 50 ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'
                      }`}>
                      {course.completionRate}%
                    </p>
                  </div>

                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-2">
                    <p className="text-xs text-muted-foreground mb-1">Avg Progress</p>
                    <p className="text-sm font-bold text-green-600 dark:text-green-400">{course.avgProgress}%</p>
                  </div>

                  <div className="bg-teal-50 dark:bg-teal-900/20 rounded-lg p-2">
                    <p className="text-xs text-muted-foreground mb-1">Rating</p>
                    <p className="flex items-center gap-1 text-sm font-bold text-teal-600 dark:text-teal-400">
                      <Star className="w-3 h-3 fill-teal-600 dark:fill-teal-400" />
                      {course.avgRating}
                    </p>
                  </div>

                  <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-2">
                    <p className="text-xs text-muted-foreground mb-1">Revenue</p>
                    <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 truncate">
                      {formatCurrency(course.totalRevenue)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table View */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-secondary">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Course
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Students
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Completion
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Avg Progress
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Rating
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Revenue
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Active
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {paginatedCourses.map((course) => (
                  <tr key={course._id} className="hover:bg-secondary/50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-foreground">{course.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {course.totalLessons} lessons · {course.totalQuizzes} quizzes
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-full text-sm font-semibold">
                        <Users className="w-4 h-4" />
                        {course.enrolledCount}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex flex-col items-center">
                        <span className={`text-sm font-bold ${course.completionRate >= 70 ? 'text-green-600 dark:text-green-400' :
                          course.completionRate >= 50 ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'
                          }`}>
                          {course.completionRate}%
                        </span>
                        <div className="w-20 h-2 bg-secondary rounded-full mt-1 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${course.completionRate >= 70 ? 'bg-green-500' :
                              course.completionRate >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                            style={{ width: `${course.completionRate}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-sm font-bold text-foreground">{course.avgProgress}%</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        <span className="text-sm font-bold text-foreground">{course.avgRating}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(course.totalRevenue)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-teal-100 dark:bg-teal-900/20 text-teal-700 dark:text-teal-400 rounded-full text-sm font-semibold">
                        <Activity className="w-4 h-4" />
                        {course.activeStudents}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {renderPagination()}
        </div>
      </div>
    </div>
  );
}