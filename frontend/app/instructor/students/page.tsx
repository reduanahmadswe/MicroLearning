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
  MessageSquare
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

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
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'progress' | 'lastActive'>('name');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/courses/instructor/students`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to fetch students');
      }

      const data = await response.json();
      setStudents(data.data || []);
    } catch (error: any) {
      console.error('Error fetching students:', error);
      toast.error(error.message || 'Failed to load students from database');
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };



  const exportStudentsToExcel = () => {
    if (students.length === 0) {
      toast.error('No student data to export');
      return;
    }

    try {
      const XLSX = require('xlsx');

      // Student Summary Sheet
      const summaryData = [
        ['Student Report'],
        ['Generated on', new Date().toLocaleString()],
        [],
        ['Student Name', 'Email', 'Level', 'XP', 'Streak', 'Status', 'Total Progress', 'Courses Enrolled', 'Joined Date', 'Last Active'],
        ...students.map((student) => [
          student.name,
          student.email,
          student.level || 0,
          student.xp || 0,
          typeof student.streak === 'number' ? student.streak : 0,
          student.status,
          `${student.totalProgress}%`,
          student.enrolledCourses.length,
          new Date(student.joinedDate).toLocaleDateString(),
          formatDate(student.lastActive),
        ]),
      ];

      // Detailed Course Enrollment Sheet
      const enrollmentData = [
        ['Course Enrollments'],
        [],
        ['Student Name', 'Course Title', 'Progress', 'Enrolled Date', 'Last Accessed', 'Completed Lessons', 'Total Lessons', 'Quizzes Taken', 'Average Score'],
      ];

      students.forEach((student) => {
        student.enrolledCourses.forEach((course) => {
          enrollmentData.push([
            student.name,
            course.title,
            `${course.progress}%`,
            new Date(course.enrolledAt).toLocaleDateString(),
            formatDate(course.lastAccessed),
            course.completedLessons,
            course.totalLessons,
            course.quizzesTaken,
            `${course.averageScore}%`,
          ]);
        });
      });

      // Statistics Sheet
      const statsData = [
        ['Student Statistics'],
        [],
        ['Metric', 'Value'],
        ['Total Students', students.length],
        ['Active Students', students.filter(s => s.status === 'active').length],
        ['Inactive Students', students.filter(s => s.status === 'inactive').length],
        ['Average Progress', `${Math.round(students.reduce((acc, s) => acc + s.totalProgress, 0) / students.length) || 0}%`],
        ['Total Enrollments', students.reduce((acc, s) => acc + s.enrolledCourses.length, 0)],
      ];

      // Create workbook and add sheets
      const wb = XLSX.utils.book_new();
      const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
      const wsEnrollments = XLSX.utils.aoa_to_sheet(enrollmentData);
      const wsStats = XLSX.utils.aoa_to_sheet(statsData);

      XLSX.utils.book_append_sheet(wb, wsSummary, 'Students Summary');
      XLSX.utils.book_append_sheet(wb, wsEnrollments, 'Course Enrollments');
      XLSX.utils.book_append_sheet(wb, wsStats, 'Statistics');

      // Generate file name with timestamp
      const fileName = `Students_Report_${new Date().toISOString().split('T')[0]}.xlsx`;

      // Download file
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
    avgProgress: Math.round(students.reduce((acc, s) => acc + s.totalProgress, 0) / students.length) || 0,
    totalEnrollments: students.reduce((acc, s) => acc + s.enrolledCourses.length, 0),
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

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'text-green-600 bg-green-50';
    if (progress >= 50) return 'text-blue-600 bg-blue-50';
    if (progress >= 30) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading students...</p>
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
                  <Users className="w-6 h-6 text-white" />
                </div>
                My Students
              </h1>
              <p className="text-gray-600 mt-2">Monitor and manage your students' progress</p>
            </div>
            <button
              onClick={exportStudentsToExcel}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-lg hover:shadow-lg transition-all"
            >
              <Download className="w-4 h-4" />
              Export Data
            </button>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Students</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalStudents}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Active Students</p>
                  <p className="text-2xl font-bold text-green-600">{stats.activeStudents}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Avg Progress</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.avgProgress}%</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Enrollments</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.totalEnrollments}</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-gray-400" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as any)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              {/* Sort By */}
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-gray-400" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="name">Sort by Name</option>
                  <option value="progress">Sort by Progress</option>
                  <option value="lastActive">Sort by Last Active</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Students List */}
        {filteredStudents.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center border border-gray-200">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No students found</h3>
            <p className="text-gray-600">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredStudents.map((student) => (
              <div
                key={student._id}
                className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-all overflow-hidden"
              >
                <div className="p-6">
                  {/* Student Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-teal-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-md">
                        {student.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                          {student.name}
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            student.status === 'active' 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-gray-100 text-gray-700'
                          }`}>
                            {student.status === 'active' ? 'Active' : 'Inactive'}
                          </span>
                        </h3>
                        <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <Mail className="w-4 h-4" />
                            {student.email}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            Joined {formatDate(student.joinedDate)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            Last active {formatDate(student.lastActive)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedStudent(student);
                        setShowDetailsModal(true);
                      }}
                      className="px-4 py-2 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      View Details
                    </button>
                  </div>

                  {/* Student Stats */}
                  <div className="grid grid-cols-4 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <Award className="w-4 h-4 text-purple-600" />
                        <p className="text-sm font-medium text-gray-600">Level</p>
                      </div>
                      <p className="text-lg font-bold text-purple-600">{student.level || 0}</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <Target className="w-4 h-4 text-blue-600" />
                        <p className="text-sm font-medium text-gray-600">XP</p>
                      </div>
                      <p className="text-lg font-bold text-blue-600">{student.xp || 0}</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <TrendingUp className="w-4 h-4 text-orange-600" />
                        <p className="text-sm font-medium text-gray-600">Streak</p>
                      </div>
                      <p className="text-lg font-bold text-orange-600">{typeof student.streak === 'number' ? student.streak : 0} days</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <BookOpen className="w-4 h-4 text-green-600" />
                        <p className="text-sm font-medium text-gray-600">Courses</p>
                      </div>
                      <p className="text-lg font-bold text-green-600">{student.enrolledCourses.length}</p>
                    </div>
                  </div>

                  {/* Enrolled Courses */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <BookOpen className="w-4 h-4" />
                      Enrolled Courses ({student.enrolledCourses.length})
                    </h4>
                    <div className="space-y-3">
                      {student.enrolledCourses.map((course) => (
                        <div
                          key={course._id}
                          className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-green-300 transition-colors"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex-1">
                              <h5 className="font-semibold text-gray-900">{course.title}</h5>
                              <div className="flex items-center gap-4 mt-1 text-xs text-gray-600">
                                <span>Enrolled {formatDate(course.enrolledAt)}</span>
                                <span>•</span>
                                <span>Last accessed {formatDate(course.lastAccessed)}</span>
                              </div>
                            </div>
                            <div className={`px-3 py-1 rounded-full text-sm font-bold ${getProgressColor(course.progress)}`}>
                              {course.progress}%
                            </div>
                          </div>

                          {/* Progress Bar */}
                          <div className="mb-3">
                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className={`h-full ${getProgressBarColor(course.progress)} transition-all duration-500`}
                                style={{ width: `${course.progress}%` }}
                              ></div>
                            </div>
                          </div>

                          {/* Course Stats */}
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div className="flex items-center gap-2 text-gray-700">
                              <CheckCircle className="w-4 h-4 text-green-600" />
                              <span>{course.completedLessons}/{course.totalLessons} Lessons</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-700">
                              <Target className="w-4 h-4 text-blue-600" />
                              <span>{course.quizzesTaken} Quizzes</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-700">
                              <Award className="w-4 h-4 text-yellow-600" />
                              <span>Avg: {course.averageScore}%</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Student Details Modal */}
        {showDetailsModal && selectedStudent && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
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
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <Award className="w-8 h-8 text-purple-600 mb-2" />
                    <p className="text-sm text-gray-600">Level</p>
                    <p className="text-2xl font-bold text-purple-600">{selectedStudent.level || 0}</p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <Target className="w-8 h-8 text-blue-600 mb-2" />
                    <p className="text-sm text-gray-600">Total XP</p>
                    <p className="text-2xl font-bold text-blue-600">{selectedStudent.xp || 0}</p>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <TrendingUp className="w-8 h-8 text-orange-600 mb-2" />
                    <p className="text-sm text-gray-600">Streak</p>
                    <p className="text-2xl font-bold text-orange-600">{typeof selectedStudent.streak === 'number' ? selectedStudent.streak : 0} days</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <BarChart3 className="w-8 h-8 text-green-600 mb-2" />
                    <p className="text-sm text-gray-600">Avg Progress</p>
                    <p className="text-2xl font-bold text-green-600">{selectedStudent.totalProgress}%</p>
                  </div>
                </div>

                {/* Detailed Course List */}
                <h3 className="text-xl font-bold text-gray-900 mb-4">Course Details</h3>
                <div className="space-y-4">
                  {selectedStudent.enrolledCourses.map((course) => (
                    <div key={course._id} className="border border-gray-200 rounded-xl p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h4 className="text-lg font-bold text-gray-900">{course.title}</h4>
                          <p className="text-sm text-gray-600 mt-1">
                            Enrolled on {new Date(course.enrolledAt).toLocaleDateString('en-GB')}
                          </p>
                        </div>
                        <div className={`px-4 py-2 rounded-full text-lg font-bold ${getProgressColor(course.progress)}`}>
                          {course.progress}%
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-600 mb-1">Lessons</p>
                          <p className="text-lg font-bold text-gray-900">
                            {course.completedLessons}/{course.totalLessons}
                          </p>
                        </div>
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-600 mb-1">Quizzes</p>
                          <p className="text-lg font-bold text-gray-900">{course.quizzesTaken}</p>
                        </div>
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-600 mb-1">Avg Score</p>
                          <p className="text-lg font-bold text-gray-900">{course.averageScore}%</p>
                        </div>
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-600 mb-1">Last Access</p>
                          <p className="text-sm font-semibold text-gray-900">{formatDate(course.lastAccessed)}</p>
                        </div>
                      </div>

                      <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${getProgressBarColor(course.progress)} transition-all`}
                          style={{ width: `${course.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200">
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
