'use client';

import { useEffect, useState } from 'react';
import {
  Users,
  BookOpen,
  TrendingUp,
  Award,
  Search,
  Filter,
  Mail,
  Calendar,
  Clock,
  Target,
  CheckCircle,
  XCircle,
  BarChart3,
  Download,
  Eye,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  ArrowLeft
} from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useAppDispatch } from '@/store/hooks';
import {
  useInstructorStudents,
  useInstructorStudentsLoading,
  useInstructorStudentsError,
} from '@/store/hooks';
import { fetchInstructorStudents } from '@/store/globalSlice';
import { useAuthStore } from '@/store/authStore';

interface Course {
  _id: string;
  title: string;
  thumbnail?: string;
  progress: number;
  enrolledAt: string;
  lastAccessed: string;
  completedLessons: number;
  totalLessons: number;
  quizzesTaken: number;
  averageScore: number;
}

interface Student {
  _id: string;
  name: string;
  email: string;
  profilePicture?: string;
  enrolledCourses: Course[];
  totalProgress: number;
  level: number;
  xp: number;
  streak: number;
  joinedDate: string;
  lastActive: string;
  status: 'active' | 'inactive';
}

export default function InstructorStudentsPage() {
  const router = useRouter();
  const { token } = useAuthStore();
  const dispatch = useAppDispatch();

  // Redux state
  const students = useInstructorStudents() as Student[];
  const loading = useInstructorStudentsLoading();
  const error = useInstructorStudentsError();

  // Local UI state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'progress' | 'lastActive'>('name');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);

  useEffect(() => {
    if (!token) {
      router.push('/auth/login');
      return;
    }

    // Fetch students (will use cache if available)
    dispatch(fetchInstructorStudents({}));
  }, [token, dispatch]);

  // Show error toast
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const handleRefresh = () => {
    dispatch(fetchInstructorStudents({ force: true }));
    toast.success('Refreshing students...');
  };

  const exportStudentsToExcel = () => {
    if (students.length === 0) {
      toast.error('No student data to export');
      return;
    }

    try {
      const XLSX = require('xlsx');

      const summaryData = [
        ['Student Report'],
        ['Generated on', new Date().toLocaleString()],
        [],
        ['Student Name', 'Email', 'Level', 'XP', 'Streak', 'Status', 'Total Progress', 'Courses Enrolled', 'Joined Date', 'Last Active'],
        ...students.map((student) => [
          student.name || 'N/A',
          student.email || 'N/A',
          student.level || 0,
          student.xp || 0,
          typeof student.streak === 'number' ? student.streak : 0,
          student.status || 'inactive',
          `${student.totalProgress || 0}%`,
          Array.isArray(student.enrolledCourses) ? student.enrolledCourses.length : 0,
          student.joinedDate ? new Date(student.joinedDate).toLocaleDateString() : 'N/A',
          student.lastActive ? formatDate(student.lastActive) : 'N/A',
        ]),
      ];

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(wb, ws, 'Students Summary');

      const fileName = `Students_Report_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(wb, fileName);
      toast.success('Student data exported successfully!');
    } catch (error) {
      console.error('Error exporting student data:', error);
      toast.error('Failed to export student data. Please try again.');
    }
  };

  // Statistics calculation
  const stats = {
    totalStudents: students.length,
    activeStudents: students.filter(s => s.status === 'active').length,
    avgProgress: Math.round(students.reduce((acc, s) => acc + (s.totalProgress || 0), 0) / students.length) || 0,
    totalEnrollments: students.reduce((acc, s) => acc + (Array.isArray(s.enrolledCourses) ? s.enrolledCourses.length : 0), 0),
  };

  // Filter and sort students
  const filteredStudents = students
    .filter(student => {
      const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterStatus === 'all' || student.status === filterStatus;
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'progress') return b.totalProgress - a.totalProgress;
      if (sortBy === 'lastActive') return new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime();
      return 0;
    });

  // Calculate pagination
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentStudents = filteredStudents.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus, sortBy]);

  // Reset to page 1 if current page exceeds total pages
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [filteredStudents.length, currentPage, totalPages]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400';
    if (progress >= 50) return 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400';
    if (progress >= 30) return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 dark:text-yellow-400';
    return 'text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400';
  };

  const getProgressBarColor = (progress: number) => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 50) return 'bg-blue-500';
    if (progress >= 30) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  if (loading && students.length === 0) {
    return (
      <div className="min-h-screen bg-page-gradient flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-sm sm:text-base text-muted-foreground">Loading students...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-page-gradient">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Back Button */}
        <button
          onClick={() => router.push('/instructor')}
          className="flex items-center gap-2 text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 mb-4 sm:mb-6 text-sm sm:text-base font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          Back to Dashboard
        </button>

        {/* Header */}
        <div className="mb-4 sm:mb-6 lg:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-green-600 to-teal-600 rounded-lg flex items-center justify-center shadow-md">
                <Users className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">My Students</h1>
                <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">Monitor and manage your students' progress</p>
              </div>
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
              <Button
                onClick={exportStudentsToExcel}
                className="w-full sm:w-auto bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white text-sm sm:text-base"
              >
                <Download className="w-4 h-4 mr-2" />
                Export Data
              </Button>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
            <Card className="bg-card border-border">
              <CardContent className="p-3 sm:p-4 lg:p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm text-muted-foreground mb-0.5 sm:mb-1">Total Students</p>
                    <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">{stats.totalStudents}</p>
                  </div>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-50 dark:bg-green-900/20 rounded-lg flex items-center justify-center border border-green-200 dark:border-green-800">
                    <Users className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 dark:text-green-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardContent className="p-3 sm:p-4 lg:p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm text-muted-foreground mb-0.5 sm:mb-1">Active Students</p>
                    <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-emerald-600 dark:text-emerald-400">{stats.activeStudents}</p>
                  </div>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg flex items-center justify-center border border-emerald-200 dark:border-emerald-800">
                    <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardContent className="p-3 sm:p-4 lg:p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm text-muted-foreground mb-0.5 sm:mb-1">Avg Progress</p>
                    <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-teal-600 dark:text-teal-400">{stats.avgProgress}%</p>
                  </div>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-teal-50 dark:bg-teal-900/20 rounded-lg flex items-center justify-center border border-teal-200 dark:border-teal-800">
                    <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-teal-600 dark:text-teal-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardContent className="p-3 sm:p-4 lg:p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm text-muted-foreground mb-0.5 sm:mb-1">Enrollments</p>
                    <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-green-600 dark:text-green-400">{stats.totalEnrollments}</p>
                  </div>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-50 dark:bg-green-900/20 rounded-lg flex items-center justify-center border border-green-200 dark:border-green-800">
                    <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 dark:text-green-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters and Search */}
          <Card className="bg-card border-border">
            <CardContent className="p-3 sm:p-4">
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                {/* Search */}
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm border-2 border-border rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 placeholder:text-muted-foreground"
                  />
                </div>

                {/* Status Filter */}
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-muted-foreground hidden sm:block" />
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as any)}
                    className="flex-1 sm:flex-none px-3 py-2 text-sm border-2 border-border rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                {/* Sort By */}
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-muted-foreground hidden sm:block" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="flex-1 sm:flex-none px-3 py-2 text-sm border-2 border-border rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="name">Sort by Name</option>
                    <option value="progress">Sort by Progress</option>
                    <option value="lastActive">Sort by Last Active</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Students List */}
        {filteredStudents.length === 0 ? (
          <Card className="bg-card border-border">
            <CardContent className="p-8 sm:p-12 text-center">
              <Users className="w-12 h-12 sm:w-16 sm:h-16 text-green-600 dark:text-green-400 mx-auto mb-4" />
              <h3 className="text-base sm:text-xl font-semibold text-foreground mb-2">No students found</h3>
              <p className="text-sm sm:text-base text-muted-foreground">Try adjusting your search or filters</p>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-3 sm:gap-4">
              {currentStudents.map((student) => (
                <Card
                  key={student._id}
                  className="bg-card border-border hover:shadow-lg transition-all"
                >
                  <CardContent className="p-4 sm:p-5 lg:p-6">
                    {/* Student Header */}
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4 mb-4">
                      <div className="flex items-center gap-3 sm:gap-4">
                        <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-green-600 to-teal-600 rounded-full flex items-center justify-center text-white font-bold text-lg sm:text-xl shadow-md flex-shrink-0">
                          {student.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="text-base sm:text-lg lg:text-xl font-bold text-foreground flex flex-wrap items-center gap-2">
                            <span className="truncate">{student.name}</span>
                            <span className={`px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium flex-shrink-0 ${student.status === 'active'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800'
                              : 'bg-gray-50 text-gray-700 border border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700'
                              }`}>
                              {student.status === 'active' ? 'Active' : 'Inactive'}
                            </span>
                          </h3>
                          <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-1 sm:gap-3 lg:gap-4 mt-1 text-xs sm:text-sm text-muted-foreground">
                            <span className="flex items-center gap-1 truncate">
                              <Mail className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                              <span className="truncate">{student.email}</span>
                            </span>
                            <span className="hidden sm:inline">•</span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                              Joined {formatDate(student.joinedDate)}
                            </span>
                            <span className="hidden sm:inline">•</span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                              {formatDate(student.lastActive)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Button
                        onClick={() => {
                          setSelectedStudent(student);
                          setShowDetailsModal(true);
                        }}
                        className="w-full sm:w-auto bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white text-xs sm:text-sm flex-shrink-0"
                        size="sm"
                      >
                        <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5" />
                        View Details
                      </Button>
                    </div>

                    {/* Student Stats */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 lg:gap-4 mb-4 p-3 sm:p-4 bg-green-50/30 dark:bg-green-900/10 rounded-lg border border-green-100 dark:border-green-800">
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 mb-0.5 sm:mb-1">
                          <Award className="w-3 h-3 sm:w-4 sm:h-4 text-teal-600 dark:text-teal-400" />
                          <p className="text-xs sm:text-sm font-medium text-muted-foreground">Level</p>
                        </div>
                        <p className="text-base sm:text-lg font-bold text-teal-600 dark:text-teal-400">{student.level || 0}</p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 mb-0.5 sm:mb-1">
                          <Target className="w-3 h-3 sm:w-4 sm:h-4 text-green-600 dark:text-green-400" />
                          <p className="text-xs sm:text-sm font-medium text-muted-foreground">XP</p>
                        </div>
                        <p className="text-base sm:text-lg font-bold text-green-600 dark:text-green-400">{student.xp || 0}</p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 mb-0.5 sm:mb-1">
                          <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-600 dark:text-emerald-400" />
                          <p className="text-xs sm:text-sm font-medium text-muted-foreground">Streak</p>
                        </div>
                        <p className="text-base sm:text-lg font-bold text-emerald-600 dark:text-emerald-400">{typeof student.streak === 'number' ? student.streak : 0}d</p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 mb-0.5 sm:mb-1">
                          <BookOpen className="w-3 h-3 sm:w-4 sm:h-4 text-green-600 dark:text-green-400" />
                          <p className="text-xs sm:text-sm font-medium text-muted-foreground">Courses</p>
                        </div>
                        <p className="text-base sm:text-lg font-bold text-green-600 dark:text-green-400">{Array.isArray(student.enrolledCourses) ? student.enrolledCourses.length : 0}</p>
                      </div>
                    </div>

                    {/* Enrolled Courses */}
                    <div>
                      <h4 className="text-xs sm:text-sm font-semibold text-foreground mb-2 sm:mb-3 flex items-center gap-1.5 sm:gap-2">
                        <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        Enrolled Courses ({Array.isArray(student.enrolledCourses) ? student.enrolledCourses.length : 0})
                      </h4>
                      <div className="space-y-2 sm:space-y-3">
                        {(Array.isArray(student.enrolledCourses) ? student.enrolledCourses : []).slice(0, 2).map((course) => (
                          <div
                            key={course._id}
                            className="p-3 sm:p-4 bg-secondary rounded-lg border border-border hover:border-green-300 dark:hover:border-green-700 transition-colors"
                          >
                            <div className="flex items-center justify-between mb-2 sm:mb-3">
                              <div className="flex-1 min-w-0 pr-2">
                                <h5 className="font-semibold text-foreground text-sm sm:text-base truncate">{course.title || 'Untitled Course'}</h5>
                                <div className="flex flex-wrap items-center gap-1 sm:gap-2 mt-1 text-xs text-muted-foreground">
                                  <span>Enrolled {course.enrolledAt ? formatDate(course.enrolledAt) : 'N/A'}</span>
                                  <span className="hidden sm:inline">•</span>
                                  <span>Last {course.lastAccessed ? formatDate(course.lastAccessed) : 'N/A'}</span>
                                </div>
                              </div>
                              <div className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-bold flex-shrink-0 ${getProgressColor(course.progress || 0)}`}>
                                {course.progress || 0}%
                              </div>
                            </div>

                            {/* Progress Bar */}
                            <div className="mb-2 sm:mb-3">
                              <div className="h-1.5 sm:h-2 bg-secondary/50 rounded-full overflow-hidden">
                                <div
                                  className={`h-full ${getProgressBarColor(course.progress || 0)} transition-all duration-500`}
                                  style={{ width: `${course.progress || 0}%` }}
                                ></div>
                              </div>
                            </div>

                            {/* Course Stats */}
                            <div className="grid grid-cols-3 gap-2 sm:gap-4 text-xs sm:text-sm">
                              <div className="flex items-center gap-1 sm:gap-2 text-muted-foreground">
                                <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                                <span className="truncate">{course.completedLessons || 0}/{course.totalLessons || 0}</span>
                              </div>
                              <div className="flex items-center gap-1 sm:gap-2 text-muted-foreground">
                                <Target className="w-3 h-3 sm:w-4 sm:h-4 text-teal-600 dark:text-teal-400 flex-shrink-0" />
                                <span className="truncate">{course.quizzesTaken || 0} Quiz</span>
                              </div>
                              <div className="flex items-center gap-1 sm:gap-2 text-muted-foreground">
                                <Award className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
                                <span className="truncate">{course.averageScore || 0}%</span>
                              </div>
                            </div>
                          </div>
                        ))}
                        {(Array.isArray(student.enrolledCourses) ? student.enrolledCourses.length : 0) > 2 && (
                          <p className="text-xs sm:text-sm text-muted-foreground text-center py-1">
                            +{student.enrolledCourses.length - 2} more courses
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <Card className="bg-card border-border mt-4 sm:mt-6">
                <CardContent className="p-3 sm:p-4 lg:p-5">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                    {/* Page Info */}
                    <div className="text-xs sm:text-sm text-muted-foreground font-medium">
                      Page {currentPage} of {totalPages} • Showing {startIndex + 1}-{Math.min(endIndex, filteredStudents.length)} of {filteredStudents.length}
                    </div>

                    {/* Pagination Controls */}
                    <div className="flex items-center gap-1 sm:gap-2">
                      <Button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        variant="outline"
                        size="sm"
                        className="border-2 border-border text-muted-foreground hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        <span className="hidden sm:inline ml-1">Previous</span>
                      </Button>

                      {/* Page Numbers */}
                      <div className="flex gap-1">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
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
                                : 'border-2 border-border text-muted-foreground hover:bg-secondary'
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
                        className="border-2 border-border text-muted-foreground hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span className="hidden sm:inline mr-1">Next</span>
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {/* Student Details Modal */}
        {showDetailsModal && selectedStudent && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowDetailsModal(false)}>
            <div className="bg-card rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="sticky top-0 bg-gradient-to-r from-green-600 to-teal-600 p-6 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white font-bold text-2xl">
                      {selectedStudent.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">{selectedStudent.name}</h2>
                      <p className="text-white/80">{selectedStudent.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowDetailsModal(false)}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="p-6">
                {/* Detailed Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-secondary/50 p-4 rounded-lg">
                    <Award className="w-8 h-8 text-purple-600 mb-2" />
                    <p className="text-sm text-muted-foreground">Level</p>
                    <p className="text-2xl font-bold text-purple-600">{selectedStudent.level || 0}</p>
                  </div>
                  <div className="bg-secondary/50 p-4 rounded-lg">
                    <Target className="w-8 h-8 text-blue-600 mb-2" />
                    <p className="text-sm text-muted-foreground">Total XP</p>
                    <p className="text-2xl font-bold text-blue-600">{selectedStudent.xp || 0}</p>
                  </div>
                  <div className="bg-secondary/50 p-4 rounded-lg">
                    <TrendingUp className="w-8 h-8 text-orange-600 mb-2" />
                    <p className="text-sm text-muted-foreground">Streak</p>
                    <p className="text-2xl font-bold text-orange-600">{typeof selectedStudent.streak === 'number' ? selectedStudent.streak : 0} days</p>
                  </div>
                  <div className="bg-secondary/50 p-4 rounded-lg">
                    <BarChart3 className="w-8 h-8 text-green-600 mb-2" />
                    <p className="text-sm text-muted-foreground">Avg Progress</p>
                    <p className="text-2xl font-bold text-green-600">{selectedStudent.totalProgress}%</p>
                  </div>
                </div>

                {/* Detailed Course List */}
                <h3 className="text-xl font-bold text-foreground mb-4">Course Details</h3>
                <div className="space-y-4">
                  {(Array.isArray(selectedStudent.enrolledCourses) ? selectedStudent.enrolledCourses : []).map((course) => (
                    <div key={course._id} className="border border-border rounded-xl p-6 bg-card">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h4 className="text-lg font-bold text-foreground">{course.title || 'Untitled Course'}</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            Enrolled on {course.enrolledAt ? new Date(course.enrolledAt).toLocaleDateString('en-GB') : 'N/A'}
                          </p>
                        </div>
                        <div className={`px-4 py-2 rounded-full text-lg font-bold ${getProgressColor(course.progress || 0)}`}>
                          {course.progress || 0}%
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div className="text-center p-3 bg-secondary rounded-lg">
                          <p className="text-sm text-muted-foreground mb-1">Lessons</p>
                          <p className="text-lg font-bold text-foreground">
                            {course.completedLessons || 0}/{course.totalLessons || 0}
                          </p>
                        </div>
                        <div className="text-center p-3 bg-secondary rounded-lg">
                          <p className="text-sm text-muted-foreground mb-1">Quizzes</p>
                          <p className="text-lg font-bold text-foreground">{course.quizzesTaken || 0}</p>
                        </div>
                        <div className="text-center p-3 bg-secondary rounded-lg">
                          <p className="text-sm text-muted-foreground mb-1">Avg Score</p>
                          <p className="text-lg font-bold text-foreground">{course.averageScore || 0}%</p>
                        </div>
                        <div className="text-center p-3 bg-secondary rounded-lg">
                          <p className="text-sm text-muted-foreground mb-1">Last Access</p>
                          <p className="text-sm font-semibold text-foreground">{course.lastAccessed ? formatDate(course.lastAccessed) : 'N/A'}</p>
                        </div>
                      </div>

                      <div className="h-3 bg-secondary/50 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${getProgressBarColor(course.progress || 0)} transition-all`}
                          style={{ width: `${course.progress || 0}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 mt-6 pt-6 border-t border-border">
                  <button
                    onClick={() => {
                      toast.success(`Message sent to ${selectedStudent.name}`);
                    }}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:shadow-lg transition-all"
                  >
                    <MessageSquare className="w-5 h-5" />
                    Send Message
                  </button>
                  <button
                    onClick={() => {
                      toast.success('Generating report...');
                    }}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-lg hover:shadow-lg transition-all"
                  >
                    <Download className="w-5 h-5" />
                    Download Report
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
