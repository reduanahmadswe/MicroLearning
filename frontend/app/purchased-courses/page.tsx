'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ShoppingBag,
  Calendar,
  DollarSign,
  CheckCircle,
  Eye,
  ChevronLeft,
  Award,
  TrendingUp,
  CreditCard,
  BookOpen,
  Clock,
  Star,
  Filter,
  Search,
  Download,
  XCircle,
  Loader2,
  PlayCircle,
  BarChart3,
  Trophy,
  Sparkles,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

// ============================================
// REDUX HOOKS - INSTANT DATA ACCESS!
// ============================================
import {
  useEnrolledCourses,
  useIsInitializing,
} from '@/store/hooks';

export default function PurchasedCoursesPage() {
  const router = useRouter();

  // ============================================
  // INSTANT DATA FROM REDUX - NO API CALLS!
  // ============================================
  const enrolledCourses = useEnrolledCourses(); // Instant!
  const isInitializing = useIsInitializing();

  // UI state only
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter and search logic (instant client-side filtering!)
  const filteredCourses = useMemo(() => {
    return enrolledCourses.filter((enrollment: any) => {
      const course = enrollment.course;
      if (!course) return false;

      // Status filter - using enrollment progress
      if (filterStatus === 'completed' && enrollment.progress !== 100) return false;
      if (filterStatus === 'pending' && enrollment.progress === 100) return false;
      // 'all' and 'failed' show everything for now

      // Search filter
      if (searchQuery) {
        const searchLower = searchQuery.toLowerCase();
        const matchesTitle = course.title?.toLowerCase().includes(searchLower);
        const matchesTopic = course.topic?.toLowerCase().includes(searchLower);
        if (!matchesTitle && !matchesTopic) return false;
      }

      return true;
    });
  }, [enrolledCourses, filterStatus, searchQuery]);

  // Calculate stats (instant!)
  const stats = useMemo(() => {
    const completed = enrolledCourses.filter((e: any) => e.progress === 100).length;
    const inProgress = enrolledCourses.filter((e: any) => e.progress > 0 && e.progress < 100).length;
    const totalSpent = enrolledCourses.reduce((sum: number, e: any) => {
      return sum + (e.course?.price || 0);
    }, 0);

    return {
      totalCourses: enrolledCourses.length,
      completed,
      inProgress,
      totalSpent,
      pending: 0, // We don't have pending payments in enrolled courses
    };
  }, [enrolledCourses]);

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-page-gradient flex items-center justify-center p-4">
        <Card className="border-0 shadow-2xl bg-card backdrop-blur-sm">
          <CardContent className="flex flex-col items-center justify-center py-12 sm:py-16 px-6 sm:px-12">
            <Loader2 className="w-12 h-12 sm:w-16 sm:h-16 animate-spin text-green-600 dark:text-green-400 mb-4" />
            <p className="text-muted-foreground font-medium text-sm sm:text-base">Loading your purchases...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-page-gradient">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-64 sm:w-96 h-64 sm:h-96 bg-green-200 dark:bg-green-900/20 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute top-40 right-10 w-64 sm:w-96 h-64 sm:h-96 bg-teal-200 dark:bg-teal-900/20 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-1/2 w-64 sm:w-96 h-64 sm:h-96 bg-emerald-200 dark:bg-emerald-900/20 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Back Button */}
        <div className="mb-4 sm:mb-6">
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-2 text-muted-foreground hover:text-green-600 dark:hover:text-green-400 transition-colors group"
          >
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium text-sm sm:text-base">Back to Dashboard</span>
          </button>
        </div>

        {/* Page Header */}
        <div className="mb-6 sm:mb-8 lg:mb-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div>
              <div className="flex items-center gap-2 sm:gap-3 mb-2">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-green-600 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-foreground">
                  My Purchased Courses
                </h1>
              </div>
              <p className="text-sm sm:text-base text-muted-foreground ml-12 sm:ml-14">
                Access all your enrolled courses and track your learning journey
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-green-600 dark:text-green-400 animate-pulse" />
              <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                {stats.completed} Course{stats.completed !== 1 ? 's' : ''} Active
              </span>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        {enrolledCourses.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
            {/* Total Courses */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-green-500 to-teal-600 dark:from-green-600 dark:to-teal-700 overflow-hidden group hover:shadow-xl transition-all duration-300">
              <CardContent className="p-4 sm:p-6 relative">
                <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10 group-hover:scale-110 transition-transform"></div>
                <div className="relative">
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                      <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <TrendingUp className="w-5 h-5 text-white/60" />
                  </div>
                  <p className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white mb-1">
                    {stats.totalCourses}
                  </p>
                  <p className="text-xs sm:text-sm text-green-100 font-medium">Total Courses</p>
                </div>
              </CardContent>
            </Card>

            {/* Total Spent */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-500 to-cyan-600 dark:from-emerald-600 dark:to-cyan-700 overflow-hidden group hover:shadow-xl transition-all duration-300">
              <CardContent className="p-4 sm:p-6 relative">
                <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10 group-hover:scale-110 transition-transform"></div>
                <div className="relative">
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                      <CreditCard className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <DollarSign className="w-5 h-5 text-white/60" />
                  </div>
                  <p className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white mb-1">
                    ৳{stats.totalSpent.toLocaleString()}
                  </p>
                  <p className="text-xs sm:text-sm text-green-100 font-medium">Total Investment</p>
                </div>
              </CardContent>
            </Card>

            {/* Pending */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-teal-500 to-green-600 dark:from-teal-600 dark:to-green-700 overflow-hidden group hover:shadow-xl transition-all duration-300">
              <CardContent className="p-4 sm:p-6 relative">
                <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10 group-hover:scale-110 transition-transform"></div>
                <div className="relative">
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                      <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <BarChart3 className="w-5 h-5 text-white/60" />
                  </div>
                  <p className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white mb-1">
                    {stats.pending}
                  </p>
                  <p className="text-xs sm:text-sm text-teal-100 font-medium">Pending Payments</p>
                </div>
              </CardContent>
            </Card>

            {/* Achievement */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-cyan-500 to-blue-600 dark:from-cyan-600 dark:to-blue-700 overflow-hidden group hover:shadow-xl transition-all duration-300">
              <CardContent className="p-4 sm:p-6 relative">
                <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10 group-hover:scale-110 transition-transform"></div>
                <div className="relative">
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                      <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <Award className="w-5 h-5 text-white/60" />
                  </div>
                  <p className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white mb-1">
                    {enrolledCourses.length}
                  </p>
                  <p className="text-xs sm:text-sm text-cyan-100 font-medium">Total Transactions</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Search and Filter Section */}
        {enrolledCourses.length > 0 && (
          <Card className="border-0 shadow-lg bg-card backdrop-blur-sm mb-6">
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                {/* Search */}
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search courses..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm sm:text-base text-foreground placeholder:text-muted-foreground"
                  />
                </div>

                {/* Filter Buttons */}
                <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
                  {[
                    { value: 'all', label: 'All', icon: Filter },
                    { value: 'completed', label: 'Completed', icon: CheckCircle },
                    { value: 'pending', label: 'Pending', icon: Clock },
                    { value: 'failed', label: 'Failed', icon: XCircle },
                  ].map((filter) => {
                    const Icon = filter.icon;
                    return (
                      <Button
                        key={filter.value}
                        onClick={() => setFilterStatus(filter.value)}
                        variant="outline"
                        className={`whitespace-nowrap text-sm ${filterStatus === filter.value
                          ? 'bg-green-600 text-white border-green-600 hover:bg-green-700 hover:text-white dark:hover:text-white'
                          : 'hover:bg-green-50 dark:hover:bg-green-900/20 hover:border-green-200 dark:hover:border-green-800'
                          }`}
                      >
                        <Icon className="w-4 h-4 mr-1.5" />
                        {filter.label}
                      </Button>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {enrolledCourses.length === 0 ? (
          <Card className="border-0 shadow-2xl bg-card backdrop-blur-sm overflow-hidden">
            <CardContent className="p-8 sm:p-12 lg:p-16 text-center">
              <div className="max-w-md mx-auto">
                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-green-100 to-teal-100 dark:from-green-900/30 dark:to-teal-900/30 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <ShoppingBag className="w-10 h-10 sm:w-12 sm:h-12 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-3">
                  No Purchases Yet
                </h3>
                <p className="text-sm sm:text-base text-muted-foreground mb-8 leading-relaxed">
                  Start your learning journey today! Browse our extensive course catalog and find the perfect courses to boost your skills.
                </p>
                <Link href="/courses">
                  <Button className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 shadow-lg px-6 sm:px-8 py-5 sm:py-6 text-sm sm:text-base font-semibold">
                    <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                    Explore Courses
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : filteredCourses.length === 0 ? (
          <Card className="border-0 shadow-lg bg-card backdrop-blur-sm">
            <CardContent className="p-8 sm:p-12 text-center">
              <Search className="w-12 h-12 sm:w-16 sm:h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg sm:text-xl font-bold text-foreground mb-2">
                No Results Found
              </h3>
              <p className="text-sm sm:text-base text-muted-foreground">
                Try adjusting your search or filter criteria
              </p>
            </CardContent>
          </Card>
        ) : (
          /* Course Cards Grid */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {filteredCourses.map((enrollment: any) => {
              const course = enrollment.course;
              if (!course) return null;

              const isCompleted = enrollment.progress === 100;
              const inProgress = enrollment.progress > 0 && enrollment.progress < 100;

              return (
                <Card
                  key={enrollment._id}
                  className="border-0 shadow-lg hover:shadow-2xl bg-card backdrop-blur-sm transition-all duration-300 overflow-hidden group"
                >
                  <CardContent className="p-0">
                    {/* Course Image */}
                    <div className="relative h-40 sm:h-48 overflow-hidden bg-gradient-to-br from-green-100 to-teal-100 dark:from-green-900/30 dark:to-teal-900/30">
                      {course.thumbnail ? (
                        <img
                          src={course.thumbnail}
                          alt={course.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <BookOpen className="w-16 h-16 text-green-300" />
                        </div>
                      )}

                      {/* Progress Badge */}
                      <div className="absolute top-3 right-3">
                        <span
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold shadow-lg backdrop-blur-sm ${isCompleted
                            ? 'bg-green-500/90 text-white'
                            : inProgress
                              ? 'bg-blue-500/90 text-white'
                              : 'bg-gray-500/90 text-white'
                            }`}
                        >
                          {isCompleted && <CheckCircle className="w-3.5 h-3.5" />}
                          {isCompleted ? 'Completed' : inProgress ? `${enrollment.progress}%` : 'Not Started'}
                        </span>
                      </div>
                    </div>

                    {/* Course Info */}
                    <div className="p-4 sm:p-6">
                      <h3 className="text-lg sm:text-xl font-bold text-foreground mb-2 line-clamp-2 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                        {course.title || 'Course Title'}
                      </h3>

                      {course.topic && (
                        <div className="flex items-center gap-2 mb-4">
                          <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-xs font-medium">
                            {course.topic}
                          </span>
                        </div>
                      )}

                      {/* Meta Info */}
                      <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-4 text-xs sm:text-sm text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-4 h-4 text-green-600 dark:text-green-400" />
                          <span>{new Date(enrollment.enrolledAt || enrollment.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        </div>
                        {course.price > 0 && (
                          <div className="flex items-center gap-1.5 font-semibold text-green-600">
                            <DollarSign className="w-4 h-4" />
                            <span>৳{course.price}</span>
                          </div>
                        )}
                      </div>

                      {/* Progress Bar */}
                      {enrollment.progress > 0 && (
                        <div className="mb-4">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-medium text-muted-foreground">Progress</span>
                            <span className="text-xs font-bold text-green-600">{enrollment.progress}%</span>
                          </div>
                          <div className="w-full bg-secondary rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-green-600 to-teal-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${enrollment.progress}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                        <Link href={`/courses/${course._id}`} className="flex-1">
                          <Button className="w-full bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 shadow-md font-semibold">
                            <PlayCircle className="w-4 h-4 mr-2" />
                            {isCompleted ? 'Review Course' : inProgress ? 'Continue Learning' : 'Start Learning'}
                          </Button>
                        </Link>
                        <Button
                          variant="outline"
                          className="sm:w-auto border-green-200 hover:bg-green-50 hover:border-green-300 dark:border-green-800 dark:hover:bg-green-900/20"
                          onClick={() => toast.info('Certificate feature coming soon!')}
                        >
                          <Award className="w-4 h-4 sm:mr-2" />
                          <span className="hidden sm:inline">Certificate</span>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Results Summary */}
        {filteredCourses.length > 0 && (
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Showing <span className="font-semibold text-green-600 dark:text-green-400">{filteredCourses.length}</span> of{' '}
              <span className="font-semibold">{enrolledCourses.length}</span> course{enrolledCourses.length !== 1 ? 's' : ''}
            </p>
          </div>
        )}

        {/* Help Section */}
        {enrolledCourses.length > 0 && (
          <Card className="mt-8 border-0 shadow-lg bg-gradient-to-br from-green-600 to-teal-600 dark:from-green-700 dark:to-teal-800 overflow-hidden">
            <CardContent className="p-6 sm:p-8 text-center text-white">
              <h3 className="text-lg sm:text-xl font-bold mb-2">Need Help?</h3>
              <p className="text-sm sm:text-base text-green-100 mb-4">
                Having issues with your courses or learning journey? Our support team is here to help.
              </p>
              <Button
                variant="outline"
                className="bg-white/20 text-white border-white/30 hover:bg-white/30 backdrop-blur-sm"
                onClick={() => router.push('/contact')}
              >
                Contact Support
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
