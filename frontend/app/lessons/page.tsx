'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  BookOpen,
  Clock,
  Search,
  Filter,
  Plus,
  Sparkles,
  TrendingUp,
  Heart,
  Eye,
  Star,
  ChevronRight,
  CheckCircle,
  Video,
  FileQuestion,
  Award,
  PlayCircle,
  Zap,
  Target,
  Users,
  Flame,
  X,
  Loader2,
  ChevronLeft,
  Trash2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { lessonsAPI, aiAPI } from '@/services/api.service';
import { toast } from 'sonner';
import { Lesson } from '@/types';

export default function LessonsPage() {
  const router = useRouter();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [selectedTopic, setSelectedTopic] = useState<string>('all');
  const [showAIModal, setShowAIModal] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiForm, setAiForm] = useState({
    topic: '',
    difficulty: 'beginner',
  });
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalLessons, setTotalLessons] = useState(0);
  const lessonsPerPage = 9;
  
  // Delete modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [lessonToDelete, setLessonToDelete] = useState<{ id: string; title: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const topics = ['Programming', 'Mathematics', 'Science', 'Business', 'Language', 'Design'];
  const difficulties = ['beginner', 'intermediate', 'advanced'];

  useEffect(() => {
    loadEnrolledCourses();
    loadLessons();
  }, [selectedDifficulty, selectedTopic, currentPage]);

  const loadEnrolledCourses = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/v1/courses/enrollments/me', {
        headers: { 
          Authorization: `Bearer ${localStorage.getItem('token')}` 
        }
      });
      if (response.ok) {
        const data = await response.json();
        const courseIds = data.data.map((enrollment: any) => enrollment.course._id);
        setEnrolledCourseIds(courseIds);
      }
    } catch (error) {
      console.error('Error loading enrolled courses:', error);
    }
  };

  const loadLessons = async () => {
    try {
      setLoading(true);
      const params: any = {
        page: currentPage,
        limit: lessonsPerPage,
      };
      if (selectedDifficulty !== 'all') params.difficulty = selectedDifficulty;
      if (selectedTopic !== 'all') params.topic = selectedTopic;
      if (searchQuery) params.search = searchQuery;

      const response = await lessonsAPI.getLessons(params);
      setLessons(response.data.data || []);
      
      // Update pagination info from response
      const meta = response.data.meta;
      if (meta) {
        setTotalPages(meta.totalPages || 1);
        setTotalLessons(meta.total || 0);
      }
    } catch (error: any) {
      toast.error('Failed to load lessons');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page on new search
    loadLessons();
  };

  const handleGenerateAILesson = async () => {
    if (!aiForm.topic.trim()) {
      toast.error('Please enter a topic');
      return;
    }

    setAiGenerating(true);
    try {
      const response = await aiAPI.generateLesson({
        topic: aiForm.topic,
        difficulty: aiForm.difficulty,
      });

      // Show success message
      toast.success('🎉 AI Lesson generated successfully!');
      
      // Close modal and reset form
      setShowAIModal(false);
      setAiForm({ topic: '', difficulty: 'beginner' });
      
      // Reload enrolled courses to include AI Generated Lessons course
      await loadEnrolledCourses();
      
      // Reset to first page and reload lessons to show the new lesson
      setCurrentPage(1);
      await loadLessons();
      
      // Optional: Navigate to the new lesson if you want
      if (response.data?.data?._id) {
        setTimeout(() => {
          toast.info('Click on the new lesson to start learning!');
        }, 1000);
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 'Failed to generate lesson';
      toast.error(errorMessage);
      console.error('AI Generation Error:', error);
    } finally {
      setAiGenerating(false);
    }
  };

  const handleDeleteLesson = async (lessonId: string, lessonTitle: string) => {
    setLessonToDelete({ id: lessonId, title: lessonTitle });
    setShowDeleteModal(true);
  };

  const confirmDeleteLesson = async () => {
    if (!lessonToDelete) return;

    setIsDeleting(true);
    try {
      await lessonsAPI.deleteLesson(lessonToDelete.id);
      toast.success('Lesson deleted successfully!');
      
      // Close modal and reset
      setShowDeleteModal(false);
      setLessonToDelete(null);
      
      // Reload lessons
      await loadLessons();
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 'Failed to delete lesson';
      toast.error(errorMessage);
      console.error('Delete Error:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setLessonToDelete(null);
  };

  const filteredLessons = lessons.filter(lesson => {
    // Only show lessons from enrolled courses
    const courseId = typeof lesson.course === 'string' ? lesson.course : lesson.course?._id;
    if (courseId && enrolledCourseIds.length > 0 && !enrolledCourseIds.includes(courseId)) {
      return false;
    }
    if (searchQuery && !lesson.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-teal-50 to-emerald-50">
      {/* Animated Background Blur Circles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-green-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-teal-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-emerald-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Header Banner */}
        <div className="mb-4 sm:mb-6">
          <div className="bg-gradient-to-r from-green-600 to-teal-600 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden">
            <div className="relative px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-teal-500/20"></div>
              <div className="relative z-10">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 backdrop-blur-sm rounded-xl sm:rounded-2xl flex items-center justify-center">
                        <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                      </div>
                      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white">
                        Micro Lessons
                      </h1>
                    </div>
                    <p className="text-green-50 text-sm sm:text-base lg:text-lg max-w-2xl">
                      Bite-sized learning for maximum impact - master concepts in minutes
                    </p>
                  </div>
                  <Button
                    onClick={() => setShowAIModal(true)}
                    className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border-2 border-white/30 shadow-lg hover:shadow-xl transition-all duration-300 hidden sm:flex"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    AI Generate
                  </Button>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-6">
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-white/20">
                    <div className="flex items-center gap-2 mb-1">
                      <Target className="w-4 h-4 text-green-200" />
                      <span className="text-xs sm:text-sm text-green-100 font-medium">Total</span>
                    </div>
                    <p className="text-xl sm:text-2xl font-bold text-white">{lessons.length}</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-white/20">
                    <div className="flex items-center gap-2 mb-1">
                      <CheckCircle className="w-4 h-4 text-green-200" />
                      <span className="text-xs sm:text-sm text-green-100 font-medium">Completed</span>
                    </div>
                    <p className="text-xl sm:text-2xl font-bold text-white">{filteredLessons.filter(l => l.isCompleted).length}</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-white/20">
                    <div className="flex items-center gap-2 mb-1">
                      <Flame className="w-4 h-4 text-orange-200" />
                      <span className="text-xs sm:text-sm text-green-100 font-medium">In Progress</span>
                    </div>
                    <p className="text-xl sm:text-2xl font-bold text-white">{filteredLessons.filter(l => !l.isCompleted).length}</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-white/20">
                    <div className="flex items-center gap-2 mb-1">
                      <Eye className="w-4 h-4 text-blue-200" />
                      <span className="text-xs sm:text-sm text-green-100 font-medium">Total Views</span>
                    </div>
                    <p className="text-xl sm:text-2xl font-bold text-white">{lessons.reduce((sum, l) => sum + (l.views || 0), 0)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile AI Generate Button */}
        <div className="mb-4 sm:hidden">
          <Button
            onClick={() => setShowAIModal(true)}
            className="w-full bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 shadow-md"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Generate Lesson with AI
          </Button>
        </div>
        {/* Filters */}
        <Card className="mb-4 sm:mb-6 border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardContent className="p-3 sm:p-4 lg:p-6">
            <form onSubmit={handleSearch} className="mb-4">
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search lessons..."
                    className="pl-9 sm:pl-10 rounded-xl border-green-200 focus:border-green-400 focus:ring-green-400 text-sm sm:text-base"
                  />
                </div>
                <Button 
                  type="submit" 
                  className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 shadow-md px-4 sm:px-6"
                >
                  <Search className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Search</span>
                </Button>
              </div>
            </form>

            <div className="space-y-3 sm:space-y-0 sm:flex sm:flex-wrap sm:gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-green-100 rounded-lg flex items-center justify-center">
                    <Filter className="w-4 h-4 text-green-600" />
                  </div>
                  <span className="text-sm font-bold text-gray-700">Difficulty:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={selectedDifficulty === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => {
                      setSelectedDifficulty('all');
                      setCurrentPage(1);
                    }}
                    className={selectedDifficulty === 'all' ? 'bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700' : 'border-gray-300 hover:border-green-300 hover:bg-green-50'}
                  >
                    All
                  </Button>
                  {difficulties.map((diff) => {
                    const colorMap: any = {
                      beginner: 'bg-green-100 text-green-700 border-green-300',
                      intermediate: 'bg-yellow-100 text-yellow-700 border-yellow-300',
                      advanced: 'bg-red-100 text-red-700 border-red-300'
                    };
                    return (
                      <Button
                        key={diff}
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedDifficulty(diff);
                          setCurrentPage(1);
                        }}
                        className={selectedDifficulty === diff ? colorMap[diff] : 'border-gray-300 hover:border-green-300 hover:bg-green-50'}
                      >
                        {diff.charAt(0).toUpperCase() + diff.slice(1)}
                      </Button>
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-teal-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-teal-600" />
                  </div>
                  <span className="text-sm font-bold text-gray-700">Topic:</span>
                </div>
                <select
                  value={selectedTopic}
                  onChange={(e) => {
                    setSelectedTopic(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="px-3 py-1.5 border border-gray-300 rounded-xl text-sm focus:border-green-400 focus:ring-1 focus:ring-green-400 outline-none bg-white"
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
          </CardContent>
        </Card>

        {/* Lessons Grid */}
        {loading ? (
          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Loader2 className="w-12 h-12 animate-spin text-green-600 mb-4" />
              <p className="text-gray-600 font-medium">Loading lessons...</p>
            </CardContent>
          </Card>
        ) : filteredLessons.length === 0 ? (
          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm overflow-hidden">
            <div className="relative">
              <div className="absolute top-0 right-0 -mt-4 -mr-4 h-32 w-32 rounded-full bg-green-100 blur-3xl"></div>
              <div className="absolute bottom-0 left-0 -mb-4 -ml-4 h-32 w-32 rounded-full bg-teal-100 blur-3xl"></div>
              <CardContent className="relative z-10 p-12 text-center">
                <BookOpen className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">No lessons found</h3>
                <p className="text-gray-600 mb-6">Try adjusting your filters or generate a new lesson with AI</p>
                <Button 
                  onClick={() => setShowAIModal(true)}
                  className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 shadow-md"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate with AI
                </Button>
              </CardContent>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
            {filteredLessons.map((lesson) => (
              <Card 
                key={lesson._id} 
                className="group hover:shadow-2xl transition-all duration-300 border-0 shadow-lg overflow-hidden cursor-pointer hover:-translate-y-1 flex flex-col h-full"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between mb-3">
                    <div className={`px-3 py-1 rounded-full text-xs font-bold shadow-md ${
                      lesson.difficulty === 'beginner' ? 'bg-gradient-to-r from-green-400 to-green-500 text-white' :
                      lesson.difficulty === 'intermediate' ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-white' :
                      'bg-gradient-to-r from-red-400 to-red-500 text-white'
                    }`}>
                      {lesson.difficulty}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1.5 px-2 py-1 bg-gray-100 rounded-full">
                        <Eye className="w-3.5 h-3.5 text-gray-600" />
                        <span className="text-xs font-semibold text-gray-700">{lesson.views || 0}</span>
                      </div>
                      {lesson.aiGenerated && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteLesson(lesson._id, lesson.title);
                          }}
                          className="p-1.5 hover:bg-red-50 rounded-lg transition-colors group/delete"
                          title="Delete AI Lesson"
                        >
                          <Trash2 className="w-4 h-4 text-gray-400 group-hover/delete:text-red-600" />
                        </button>
                      )}
                    </div>
                  </div>
                  <CardTitle className="text-base sm:text-lg font-bold text-gray-900 line-clamp-2 group-hover:text-green-600 transition-colors">
                    {lesson.title}
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="flex-1 flex flex-col pt-0">
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{lesson.summary}</p>

                  {/* Meta Info */}
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div className="flex items-center gap-2 p-2 bg-green-50 rounded-lg border border-green-100">
                      <div className="w-6 h-6 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Clock className="w-3 h-3 text-green-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500 font-medium leading-tight">Duration</p>
                        <p className="text-sm font-bold text-gray-900">{lesson.estimatedTime} min</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-red-50 rounded-lg border border-red-100">
                      <div className="w-6 h-6 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Heart className="w-3 h-3 text-red-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500 font-medium leading-tight">Likes</p>
                        <p className="text-sm font-bold text-gray-900">{lesson.likes || 0}</p>
                      </div>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {lesson.tags && lesson.tags.length > 0 && lesson.tags.slice(0, 3).map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-0.5 bg-teal-50 text-teal-700 rounded-md text-xs font-medium border border-teal-200"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Completion Status */}
                  {lesson.isCompleted && (
                    <div className="mb-3 flex items-center gap-2 text-green-600 bg-green-50 px-3 py-1.5 rounded-lg border border-green-200">
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span className="text-xs font-bold">Completed</span>
                    </div>
                  )}

                  {/* Quick Actions */}
                  <div className="grid grid-cols-3 gap-1.5 mb-3">
                    <Link href={`/quiz?lessonId=${lesson._id}`}>
                      <button className="w-full flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-purple-50 border border-transparent hover:border-purple-200 transition-all duration-300 group/action">
                        <div className="w-7 h-7 bg-purple-100 rounded-lg flex items-center justify-center group-hover/action:scale-110 transition-transform">
                          <FileQuestion className="w-3.5 h-3.5 text-purple-600" />
                        </div>
                        <span className="text-xs font-semibold text-gray-600 group-hover/action:text-purple-600">Quiz</span>
                      </button>
                    </Link>
                    
                    <Link href={`/videos?lessonId=${lesson._id}`}>
                      <button className="w-full flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-blue-50 border border-transparent hover:border-blue-200 transition-all duration-300 group/action">
                        <div className="w-7 h-7 bg-blue-100 rounded-lg flex items-center justify-center group-hover/action:scale-110 transition-transform">
                          <Video className="w-3.5 h-3.5 text-blue-600" />
                        </div>
                        <span className="text-xs font-semibold text-gray-600 group-hover/action:text-blue-600">Video</span>
                      </button>
                    </Link>
                    
                    {lesson.isCompleted ? (
                      <Link href={`/certificates?lessonId=${lesson._id}`}>
                        <button className="w-full flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-yellow-50 border border-transparent hover:border-yellow-200 transition-all duration-300 group/action">
                          <div className="w-7 h-7 bg-yellow-100 rounded-lg flex items-center justify-center group-hover/action:scale-110 transition-transform">
                            <Award className="w-3.5 h-3.5 text-yellow-600" />
                          </div>
                          <span className="text-xs font-semibold text-gray-600 group-hover/action:text-yellow-600">Cert</span>
                        </button>
                      </Link>
                    ) : (
                      <div className="w-full flex flex-col items-center gap-1 p-2 rounded-lg border border-transparent opacity-50">
                        <div className="w-7 h-7 bg-gray-100 rounded-lg flex items-center justify-center">
                          <Award className="w-3.5 h-3.5 text-gray-400" />
                        </div>
                        <span className="text-xs font-semibold text-gray-400">Cert</span>
                      </div>
                    )}
                  </div>

                  {/* Main CTA - Always at bottom */}
                  <div className="mt-auto">
                    <Link href={`/lessons/${lesson._id}`}>
                      <Button className={`w-full shadow-md group-hover:shadow-lg transition-all h-10 ${
                        lesson.isCompleted 
                          ? 'bg-white border-2 border-green-200 text-green-700 hover:bg-green-50 hover:border-green-300'
                          : 'bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white'
                      }`}>
                        <span className="flex items-center justify-center gap-2 text-sm">
                          {lesson.isCompleted ? (
                            <>
                              <PlayCircle className="w-4 h-4" />
                              <span>Review</span>
                            </>
                          ) : (
                            <>
                              <span>Start Learning</span>
                              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </>
                          )}
                        </span>
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination Controls */}
        {!loading && filteredLessons.length > 0 && totalPages > 1 && (
          <div className="mt-6 sm:mt-8">
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  {/* Page Info */}
                  <div className="text-sm text-gray-600 font-medium">
                    Showing <span className="font-bold text-gray-900">{((currentPage - 1) * lessonsPerPage) + 1}</span> to{' '}
                    <span className="font-bold text-gray-900">
                      {Math.min(currentPage * lessonsPerPage, totalLessons)}
                    </span>{' '}
                    of <span className="font-bold text-gray-900">{totalLessons}</span> lessons
                  </div>

                  {/* Pagination Buttons */}
                  <div className="flex items-center gap-2">
                    {/* Previous Button */}
                    <Button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      variant="outline"
                      size="sm"
                      className="border-green-200 hover:bg-green-50 hover:border-green-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="w-4 h-4 mr-1" />
                      <span className="hidden sm:inline">Previous</span>
                    </Button>

                    {/* Page Numbers */}
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNumber;
                        if (totalPages <= 5) {
                          pageNumber = i + 1;
                        } else if (currentPage <= 3) {
                          pageNumber = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNumber = totalPages - 4 + i;
                        } else {
                          pageNumber = currentPage - 2 + i;
                        }

                        return (
                          <Button
                            key={pageNumber}
                            onClick={() => setCurrentPage(pageNumber)}
                            variant={currentPage === pageNumber ? 'default' : 'outline'}
                            size="sm"
                            className={
                              currentPage === pageNumber
                                ? 'bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white min-w-[2.5rem]'
                                : 'border-green-200 hover:bg-green-50 hover:border-green-300 min-w-[2.5rem]'
                            }
                          >
                            {pageNumber}
                          </Button>
                        );
                      })}
                    </div>

                    {/* Next Button */}
                    <Button
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      variant="outline"
                      size="sm"
                      className="border-green-200 hover:bg-green-50 hover:border-green-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="hidden sm:inline">Next</span>
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* AI Generation Modal */}
      {showAIModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md border-0 shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-green-600 to-teal-600 p-6">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-3 text-white">
                  <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xl font-bold">Generate with AI</span>
                </CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowAIModal(false)}
                  disabled={aiGenerating}
                  className="text-white hover:bg-white/20 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
              <p className="text-green-50 text-sm mt-2">
                Let AI create a personalized micro lesson just for you
              </p>
            </div>
            
            <CardContent className="p-6 space-y-5 bg-white">
              <div>
                <label className="text-sm font-bold text-gray-700 mb-2 block flex items-center gap-2">
                  <Target className="w-4 h-4 text-green-600" />
                  What topic would you like to learn?
                </label>
                <Input
                  value={aiForm.topic}
                  onChange={(e) => setAiForm({ ...aiForm, topic: e.target.value })}
                  placeholder="e.g., JavaScript Promises, Photosynthesis..."
                  className="rounded-xl border-green-200 focus:border-green-400 focus:ring-green-400"
                  disabled={aiGenerating}
                />
              </div>

              <div>
                <label className="text-sm font-bold text-gray-700 mb-2 block flex items-center gap-2">
                  <Zap className="w-4 h-4 text-yellow-600" />
                  Difficulty Level
                </label>
                <select
                  value={aiForm.difficulty}
                  onChange={(e) => setAiForm({ ...aiForm, difficulty: e.target.value })}
                  className="w-full px-4 py-2.5 border border-green-200 rounded-xl focus:border-green-400 focus:ring-1 focus:ring-green-400 outline-none bg-white"
                  disabled={aiGenerating}
                >
                  <option value="beginner">🟢 Beginner - I'm new to this</option>
                  <option value="intermediate">🟡 Intermediate - I have some knowledge</option>
                  <option value="advanced">🔴 Advanced - I want deep insights</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowAIModal(false)}
                  disabled={aiGenerating}
                  className="flex-1 border-gray-300 hover:bg-gray-50 rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleGenerateAILesson}
                  disabled={aiGenerating || !aiForm.topic.trim()}
                  className="flex-1 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 shadow-md rounded-xl"
                >
                  {aiGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generate Lesson
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && lessonToDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md border-0 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="bg-gradient-to-r from-red-600 to-red-700 p-6">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-3 text-white">
                  <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    <Trash2 className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xl font-bold">Delete Lesson</span>
                </CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={cancelDelete}
                  disabled={isDeleting}
                  className="text-white hover:bg-white/20 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>
            
            <CardContent className="p-6 bg-white">
              <div className="mb-6">
                <p className="text-gray-700 text-base mb-3">
                  Are you sure you want to delete this lesson?
                </p>
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <p className="text-sm font-semibold text-red-900 mb-1">
                    "{lessonToDelete.title}"
                  </p>
                  <p className="text-xs text-red-700">
                    This action cannot be undone. All lesson data will be permanently removed.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={cancelDelete}
                  disabled={isDeleting}
                  className="flex-1 border-gray-300 hover:bg-gray-50 rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  onClick={confirmDeleteLesson}
                  disabled={isDeleting}
                  className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-md rounded-xl"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Lesson
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
