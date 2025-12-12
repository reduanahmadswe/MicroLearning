'use client';

import { useState, useMemo } from 'react';
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
  Sparkles,
  Award,
  Zap,
  ChevronRight,
  Grid3x3,
  List,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Course } from '@/types';
// ============================================
// REDUX HOOKS - INSTANT DATA ACCESS!
// ============================================
import {
  useAllCourses,
  useEnrolledCourses,
  useIsInitializing,
} from '@/store/hooks';

export default function CoursesPage() {
  const router = useRouter();

  // ============================================
  // INSTANT DATA FROM REDUX - NO API CALLS!
  // ============================================
  const allCourses = useAllCourses(); // Instant!
  const enrolledCourses = useEnrolledCourses(); // Instant!
  const isInitializing = useIsInitializing();

  // UI state only
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [selectedTopic, setSelectedTopic] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'browse' | 'enrolled'>('browse');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const topics = ['Programming', 'Mathematics', 'Science', 'Business', 'Language', 'Design'];
  const difficulties = ['beginner', 'intermediate', 'advanced'];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
  };

  // Client-side filtering (instant!)
  const filteredCourses = useMemo(() => {
    return allCourses.filter(course => {
      // Search filter
      if (searchQuery && !course.title.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      // Difficulty filter
      if (selectedDifficulty !== 'all' && (course as any).difficulty !== selectedDifficulty) {
        return false;
      }
      // Topic filter
      if (selectedTopic !== 'all' && (course as any).topic !== selectedTopic) {
        return false;
      }
      return true;
    });
  }, [allCourses, searchQuery, selectedDifficulty, selectedTopic]);

  return (
    <div className="min-h-screen bg-page-gradient">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header Section */}
        <div className="mb-6 sm:mb-8">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-green-600 to-teal-600 p-6 sm:p-8 text-white shadow-xl">
            <div className="absolute top-0 right-0 -mt-4 -mr-4 h-32 w-32 rounded-full bg-white/10 blur-3xl"></div>
            <div className="absolute bottom-0 left-0 -mb-4 -ml-4 h-32 w-32 rounded-full bg-white/10 blur-3xl"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <GraduationCap className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">Discover Courses</h1>
                  <p className="text-green-50 text-sm sm:text-base mt-1">Structured learning paths for mastery</p>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3 sm:gap-4 mt-6">
                <div className="bg-white/10 dark:bg-black/20 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-white/20">
                  <div className="flex items-center gap-2 mb-1">
                    <BookOpen className="w-4 h-4 text-green-200" />
                    <p className="text-xs sm:text-sm text-green-100">Total Courses</p>
                  </div>
                  <p className="text-xl sm:text-2xl font-bold">{allCourses.length}</p>
                </div>
                <div className="bg-white/10 dark:bg-black/20 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-white/20">
                  <div className="flex items-center gap-2 mb-1">
                    <Play className="w-4 h-4 text-green-200" />
                    <p className="text-xs sm:text-sm text-green-100">Enrolled</p>
                  </div>
                  <p className="text-xl sm:text-2xl font-bold">{enrolledCourses.length}</p>
                </div>
                <div className="bg-white/10 dark:bg-black/20 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-white/20">
                  <div className="flex items-center gap-2 mb-1">
                    <Award className="w-4 h-4 text-green-200" />
                    <p className="text-xs sm:text-sm text-green-100">Completed</p>
                  </div>
                  <p className="text-xl sm:text-2xl font-bold">
                    {enrolledCourses.filter((e: any) => e.progress === 100).length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs & View Toggle */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <button
              onClick={() => setActiveTab('browse')}
              className={`flex-shrink-0 px-5 sm:px-6 py-2.5 font-semibold rounded-xl transition-all duration-300 text-sm sm:text-base ${activeTab === 'browse'
                ? 'bg-gradient-to-r from-green-600 to-teal-600 text-white shadow-lg'
                : 'bg-card text-muted-foreground hover:bg-accent border border-border'
                }`}
            >
              <span className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                <span>Browse All</span>
              </span>
            </button>
            <button
              onClick={() => setActiveTab('enrolled')}
              className={`flex-shrink-0 px-5 sm:px-6 py-2.5 font-semibold rounded-xl transition-all duration-300 text-sm sm:text-base ${activeTab === 'enrolled'
                ? 'bg-gradient-to-r from-green-600 to-teal-600 text-white shadow-lg'
                : 'bg-card text-muted-foreground hover:bg-accent border border-border'
                }`}
            >
              <span className="flex items-center gap-2">
                <Play className="w-4 h-4" />
                <span>My Courses</span>
              </span>
            </button>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-2 bg-card rounded-xl p-1 shadow-md border border-border/50">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'grid'
                ? 'bg-gradient-to-r from-green-600 to-teal-600 text-white shadow-md'
                : 'text-muted-foreground hover:bg-accent'
                }`}
            >
              <Grid3x3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'list'
                ? 'bg-gradient-to-r from-green-600 to-teal-600 text-white shadow-md'
                : 'text-muted-foreground hover:bg-accent'
                }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
        {activeTab === 'browse' ? (
          <>
            {/* Search & Filters */}
            <Card className="mb-6 border-0 shadow-xl bg-card/80 backdrop-blur-sm">
              <CardContent className="p-4 sm:p-6">
                {/* Search Bar */}
                <form onSubmit={handleSearch} className="mb-4">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                    <Input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search courses by title, topic, or keyword..."
                      className="pl-12 pr-4 py-3 bg-background border-border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 text-base text-foreground"
                    />
                    <Button
                      type="submit"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 rounded-lg shadow-md"
                    >
                      Search
                    </Button>
                  </div>
                </form>

                {/* Filter Pills */}
                <div className="space-y-4">
                  {/* Difficulty Filter */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="w-4 h-4 text-green-600 dark:text-green-500" />
                      <span className="text-sm font-semibold text-foreground">Difficulty Level:</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => setSelectedDifficulty('all')}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${selectedDifficulty === 'all'
                          ? 'bg-gradient-to-r from-green-600 to-teal-600 text-white shadow-md'
                          : 'bg-background text-muted-foreground hover:bg-accent border border-border'
                          }`}
                      >
                        All Levels
                      </button>
                      {difficulties.map((diff) => (
                        <button
                          key={diff}
                          onClick={() => setSelectedDifficulty(diff)}
                          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${selectedDifficulty === diff
                            ? 'bg-gradient-to-r from-green-600 to-teal-600 text-white shadow-md'
                            : `${diff === 'beginner' ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800' :
                              diff === 'intermediate' ? 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800' :
                                'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800'
                            } hover:shadow-md`
                            }`}
                        >
                          {diff.charAt(0).toUpperCase() + diff.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Topic Filter */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Filter className="w-4 h-4 text-green-600 dark:text-green-500" />
                      <span className="text-sm font-semibold text-foreground">Topic:</span>
                    </div>
                    <select
                      value={selectedTopic}
                      onChange={(e) => setSelectedTopic(e.target.value)}
                      className="w-full sm:w-auto px-4 py-2.5 bg-background border border-border rounded-xl text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-green-500 cursor-pointer transition-all"
                    >
                      <option value="all">All Topics</option>
                      {topics.map((topic) => (
                        <option key={topic} value={topic}>
                          {topic}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Active Filters Display */}
                  {(selectedDifficulty !== 'all' || selectedTopic !== 'all' || searchQuery) && (
                    <div className="pt-3 border-t border-border">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                        <TrendingUp className="w-4 h-4" />
                        <span className="font-medium">Active Filters:</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {searchQuery && (
                          <span className="px-3 py-1 bg-gradient-to-r from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/20 text-green-700 dark:text-green-300 rounded-full text-xs font-medium border border-green-200 dark:border-green-800">
                            Search: "{searchQuery}"
                          </span>
                        )}
                        {selectedDifficulty !== 'all' && (
                          <span className="px-3 py-1 bg-gradient-to-r from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/20 text-green-700 dark:text-green-300 rounded-full text-xs font-medium border border-green-200 dark:border-green-800">
                            {selectedDifficulty.charAt(0).toUpperCase() + selectedDifficulty.slice(1)}
                          </span>
                        )}
                        {selectedTopic !== 'all' && (
                          <span className="px-3 py-1 bg-gradient-to-r from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/20 text-green-700 dark:text-green-300 rounded-full text-xs font-medium border border-green-200 dark:border-green-800">
                            {selectedTopic}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Courses Grid */}
            {isInitializing ? (
              <Card className="border-0 shadow-xl bg-card/80 backdrop-blur-sm">
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mb-4"></div>
                  <p className="text-muted-foreground font-medium">Loading courses...</p>
                </CardContent>
              </Card>
            ) : filteredCourses.length === 0 ? (
              <Card className="border-0 shadow-xl bg-card/80 backdrop-blur-sm overflow-hidden">
                <div className="relative">
                  <div className="absolute top-0 right-0 -mt-4 -mr-4 h-32 w-32 rounded-full bg-green-100 blur-3xl"></div>
                  <div className="absolute bottom-0 left-0 -mb-4 -ml-4 h-32 w-32 rounded-full bg-teal-100 blur-3xl"></div>
                  <CardContent className="relative z-10 p-12 text-center">
                    <GraduationCap className="w-20 h-20 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-foreground mb-2">No courses found</h3>
                    <p className="text-muted-foreground mb-6">Try adjusting your search or filters</p>
                    <Button
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedDifficulty('all');
                        setSelectedTopic('all');
                      }}
                      className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700"
                    >
                      Clear Filters
                    </Button>
                  </CardContent>
                </div>
              </Card>
            ) : (
              <div className={viewMode === 'grid'
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
                : "space-y-4"
              }>
                {filteredCourses.map((course) => (
                  <Link key={course._id} href={`/courses/${(course as any).slug || course._id}`}>
                    <Card className={`group hover:shadow-2xl transition-all duration-300 border-0 shadow-lg bg-card overflow-hidden cursor-pointer ${viewMode === 'grid' ? '' : 'hover:-translate-y-1'
                      } ${viewMode === 'list' ? 'flex flex-row' : ''}`}>
                      {/* Thumbnail */}
                      <div className={`relative overflow-hidden ${viewMode === 'grid' ? 'h-48' : 'w-48 flex-shrink-0'
                        } bg-gradient-to-br from-green-100 to-teal-100 dark:from-green-900/20 dark:to-teal-900/20`}>
                        {(course.thumbnailUrl || course.thumbnail) ? (
                          <img
                            src={course.thumbnailUrl || course.thumbnail}
                            alt={course.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <GraduationCap className="w-16 h-16 text-teal-300 dark:text-teal-600" />
                          </div>
                        )}

                        {/* Overlay Gradient */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                        {/* Difficulty Badge */}
                        <div className="absolute top-3 left-3">
                          <span className={`px-3 py-1.5 rounded-full text-xs font-bold backdrop-blur-sm shadow-md ${course.difficulty === 'beginner' ? 'bg-green-500/90 text-white' :
                            course.difficulty === 'intermediate' ? 'bg-yellow-500/90 text-white' :
                              'bg-red-500/90 text-white'
                            }`}>
                            {course.difficulty.charAt(0).toUpperCase() + course.difficulty.slice(1)}
                          </span>
                        </div>

                        {/* Price Badge */}
                        {course.isPremium && (
                          <div className="absolute top-3 right-3">
                            <span className="flex items-center gap-1 bg-yellow-500/90 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-sm font-bold shadow-md">
                              <DollarSign className="w-3.5 h-3.5" />
                              {course.price}
                            </span>
                          </div>
                        )}

                        {/* Rating */}
                        <div className="absolute bottom-3 right-3">
                          <div className="flex items-center gap-1 bg-black/70 backdrop-blur-sm text-white px-2.5 py-1 rounded-full text-xs font-semibold">
                            <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                            <span>{course.rating?.toFixed(1) || 'New'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg font-bold text-foreground line-clamp-2 group-hover:text-green-600 transition-colors">
                            {course.title}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div
                            className="text-sm text-muted-foreground mb-4 line-clamp-2 leading-relaxed"
                            dangerouslySetInnerHTML={{ __html: course.description }}
                          />

                          {/* Meta Info */}
                          <div className="grid grid-cols-2 gap-2 mb-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-green-50 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                                <BookOpen className="w-4 h-4 text-green-600 dark:text-green-400" />
                              </div>
                              <span className="font-medium">{(course as any).lessonCount || course.lessons?.length || 0} lessons</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-teal-50 dark:bg-teal-900/30 rounded-lg flex items-center justify-center">
                                <Clock className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                              </div>
                              <span className="font-medium">{course.estimatedDuration}h</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-blue-50 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                                <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                              </div>
                              <span className="font-medium">{course.enrolledCount || 0} students</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
                                <TrendingUp className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                              </div>
                              <span className="font-medium">Popular</span>
                            </div>
                          </div>

                          {/* CTA Button */}
                          <Button className="w-full bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white shadow-md group-hover:shadow-lg transition-all">
                            <span className="flex items-center justify-center gap-2">
                              <span>View Course</span>
                              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </span>
                          </Button>
                        </CardContent>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            {/* Enrolled Courses */}
            {isInitializing ? (
              <Card className="border-0 shadow-xl bg-card/80 backdrop-blur-sm">
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mb-4"></div>
                  <p className="text-muted-foreground font-medium">Loading your courses...</p>
                </CardContent>
              </Card>
            ) : enrolledCourses.length === 0 ? (
              <Card className="border-0 shadow-xl bg-card/80 backdrop-blur-sm overflow-hidden">
                <div className="relative">
                  <div className="absolute top-0 right-0 -mt-4 -mr-4 h-32 w-32 rounded-full bg-green-100 blur-3xl"></div>
                  <div className="absolute bottom-0 left-0 -mb-4 -ml-4 h-32 w-32 rounded-full bg-teal-100 blur-3xl"></div>
                  <CardContent className="relative z-10 p-12 text-center">
                    <GraduationCap className="w-20 h-20 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-foreground mb-2">No enrolled courses yet</h3>
                    <p className="text-muted-foreground mb-6">Start your learning journey by enrolling in a course</p>
                    <Button
                      onClick={() => setActiveTab('browse')}
                      className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 shadow-md"
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      Browse Courses
                    </Button>
                  </CardContent>
                </div>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {enrolledCourses.map((enrollment: any) => {
                  const course = enrollment.course;
                  return (
                    <Link key={enrollment._id} href={`/courses/${(course as any).slug || course._id}`}>
                      <Card className="group hover:shadow-2xl transition-all duration-300 border-0 shadow-lg bg-card overflow-hidden cursor-pointer">
                        {/* Thumbnail with Progress */}
                        <div className="relative h-48 overflow-hidden bg-gradient-to-br from-green-100 to-teal-100 dark:from-green-900/20 dark:to-teal-900/20">
                          {(course.thumbnailUrl || course.thumbnail) ? (
                            <img
                              src={course.thumbnailUrl || course.thumbnail}
                              alt={course.title}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <GraduationCap className="w-16 h-16 text-teal-300 dark:text-teal-600" />
                            </div>
                          )}

                          {/* Overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>

                          {/* Progress Badge */}
                          <div className="absolute top-3 right-3">
                            <div className="bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg">
                              <span className="text-sm font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
                                {enrollment.progress}% Complete
                              </span>
                            </div>
                          </div>

                          {/* Continue Badge */}
                          {enrollment.progress > 0 && enrollment.progress < 100 && (
                            <div className="absolute bottom-3 left-3">
                              <div className="bg-green-500 text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
                                <Play className="w-3 h-3" />
                                In Progress
                              </div>
                            </div>
                          )}

                          {/* Completed Badge */}
                          {enrollment.progress === 100 && (
                            <div className="absolute bottom-3 left-3">
                              <div className="bg-yellow-500 text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
                                <Award className="w-3 h-3" />
                                Completed
                              </div>
                            </div>
                          )}
                        </div>

                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg font-bold text-foreground line-clamp-2 group-hover:text-green-600 transition-colors">
                            {course.title}
                          </CardTitle>
                        </CardHeader>

                        <CardContent>
                          {/* Progress Bar */}
                          <div className="mb-4">
                            <div className="flex justify-between text-sm text-foreground mb-2 font-medium">
                              <span>Your Progress</span>
                              <span className="text-green-600">{enrollment.progress}%</span>
                            </div>
                            <div className="h-3 bg-secondary rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-green-500 to-teal-500 rounded-full transition-all duration-500"
                                style={{ width: `${enrollment.progress}%` }}
                              />
                            </div>
                            <p className="text-xs text-muted-foreground mt-1.5 font-medium">
                              {enrollment.progress === 100
                                ? '🎉 Course completed!'
                                : `${100 - enrollment.progress}% remaining`}
                            </p>
                          </div>

                          {/* Lessons Info */}
                          <div className="flex items-center gap-2 text-sm text-foreground mb-4 bg-green-50 dark:bg-green-900/30 p-3 rounded-xl border border-green-100 dark:border-green-900">
                            <div className="w-8 h-8 bg-green-100 dark:bg-green-800 rounded-lg flex items-center justify-center">
                              <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                            </div>
                            <span className="font-semibold text-foreground">
                              {enrollment.completedLessons?.length || 0} / {course.lessons?.length || 0} lessons completed
                            </span>
                          </div>

                          {/* CTA Button */}
                          <Button className="w-full bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white shadow-md group-hover:shadow-lg transition-all">
                            <span className="flex items-center justify-center gap-2">
                              <Play className="w-4 h-4" />
                              <span>{enrollment.progress === 100 ? 'Review Course' : 'Continue Learning'}</span>
                              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </span>
                          </Button>
                        </CardContent>
                      </Card>
                    </Link>
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
