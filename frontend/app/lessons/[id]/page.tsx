'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import {
  BookOpen,
  Clock,
  Heart,
  Bookmark,
  Share2,
  CheckCircle,
  ChevronLeft,
  Star,
  Play,
  FileQuestion,
  Video as VideoIcon,
  Trophy,
  ArrowRight,
  Award,
  Loader2,
  MessageSquare,
  ThumbsUp,
  Eye,
  Calendar,
  User,
  ChevronRight,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { lessonsAPI, bookmarkAPI } from '@/services/api.service';
import { toast } from 'sonner';
import { Lesson } from '@/types';
import { useAuthStore } from '@/store/authStore';
import MarkdownRenderer from '@/components/MarkdownRenderer';

// Utility function to extract YouTube video ID
const getYouTubeVideoId = (url: string): string | null => {
  if (!url) return null;
  
  const patterns = [
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([^&]+)/,
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([^?]+)/,
    /(?:https?:\/\/)?(?:www\.)?youtu\.be\/([^?]+)/,
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/v\/([^?]+)/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  
  return null;
};

export default function LessonDetailPage() {
  const router = useRouter();
  const params = useParams();
  const lessonId = params?.id as string;
  const { token, user } = useAuthStore();

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [courseData, setCourseData] = useState<any>(null);

  useEffect(() => {
    if (lessonId) {
      loadLesson();
      checkBookmarkStatus();
    }
  }, [lessonId]);

  const loadLesson = async () => {
    try {
      setLoading(true);
      const response = await lessonsAPI.getLesson(lessonId);
      const lessonData = response.data.data;
      setLesson(lessonData);
      setLikeCount(lessonData.likes || 0);
      
      if (lessonData.likedBy && user?._id) {
        setLiked(lessonData.likedBy.includes(user._id));
      }

      // Load course data to find next lesson
      if (lessonData.course) {
        try {
          const courseResponse = await lessonsAPI.getAllLessons({ course: lessonData.course });
          const allLessons = courseResponse.data.data.lessons || courseResponse.data.data;
          setCourseData({
            _id: lessonData.course,
            lessons: Array.isArray(allLessons) ? allLessons.sort((a: any, b: any) => a.order - b.order) : []
          });
        } catch (err) {
          console.error('Failed to load course lessons:', err);
        }
      }
    } catch (error: any) {
      toast.error('Failed to load lesson');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const checkBookmarkStatus = async () => {
    if (!token) return;
    try {
      const response = await bookmarkAPI.checkBookmark(lessonId);
      setBookmarked(response.data.data.isBookmarked || false);
    } catch (error) {
      console.error('Error checking bookmark status:', error);
    }
  };

  const handleBookmark = async () => {
    if (!token) {
      toast.error('Please login to bookmark lessons');
      router.push('/auth/login');
      return;
    }

    try {
      await bookmarkAPI.toggleBookmark(lessonId);
      setBookmarked(!bookmarked);
      toast.success(bookmarked ? 'Bookmark removed' : '📌 Lesson bookmarked!');
    } catch (error: any) {
      toast.error('Failed to bookmark lesson');
    }
  };

  const handleLike = async () => {
    if (!token) {
      toast.error('Please login to like lessons');
      router.push('/auth/login');
      return;
    }

    try {
      await lessonsAPI.likeLesson(lessonId);
      setLiked(!liked);
      setLikeCount(liked ? likeCount - 1 : likeCount + 1);
      toast.success(liked ? 'Like removed' : '❤️ Lesson liked!');
    } catch (error: any) {
      toast.error('Failed to like lesson');
    }
  };

  const handleShare = async () => {
    const shareUrl = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: lesson?.title,
          text: lesson?.summary,
          url: shareUrl,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      navigator.clipboard.writeText(shareUrl);
      toast.success('📋 Link copied to clipboard!');
    }
  };

  const handleCompleteLesson = async () => {
    if (!token) {
      toast.error('Please login to complete lessons');
      router.push('/auth/login');
      return;
    }

    if (lesson?.isCompleted) {
      toast.info('This lesson is already completed');
      return;
    }

    try {
      setCompleting(true);
      await lessonsAPI.completeLesson(lessonId);
      toast.success('🎉 Lesson completed!');

      // Find next lesson
      if (courseData?.lessons && lesson) {
        const currentLessonOrder = lesson.order || 1;
        const nextLesson = courseData.lessons.find((l: any) => l.order === currentLessonOrder + 1);

        if (nextLesson) {
          // Redirect to next lesson after a short delay
          setTimeout(() => {
            router.push(`/lessons/${nextLesson._id}`);
          }, 1000);
        } else {
          // Last lesson - redirect back to course page
          setTimeout(() => {
            if (lesson.course) {
              router.push(`/courses/${lesson.course}?refresh=true`);
            }
          }, 1000);
        }
      } else {
        // Fallback - redirect to course page
        setTimeout(() => {
          if (lesson?.course) {
            router.push(`/courses/${lesson.course}?refresh=true`);
          }
        }, 1000);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to complete lesson');
      setCompleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-teal-50 to-emerald-50 flex items-center justify-center p-4">
        <Card className="border-0 shadow-2xl bg-white/90 backdrop-blur-sm">
          <CardContent className="flex flex-col items-center justify-center py-16 px-8">
            <Loader2 className="w-12 h-12 animate-spin text-green-600 mb-4" />
            <p className="text-gray-600 font-medium">Loading lesson...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-teal-50 to-emerald-50 flex items-center justify-center p-4">
        <Card className="border-0 shadow-2xl bg-white/90 backdrop-blur-sm max-w-md w-full">
          <CardContent className="p-8 text-center">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Lesson not found</h3>
            <p className="text-gray-600 mb-6">The lesson you're looking for doesn't exist.</p>
            <Link href="/lessons">
              <Button className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700">
                <ChevronLeft className="w-4 h-4 mr-2" />
                Back to Lessons
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const difficultyColors = {
    beginner: 'bg-gradient-to-r from-green-500 to-green-600 text-white',
    intermediate: 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white',
    advanced: 'bg-gradient-to-r from-red-500 to-red-600 text-white',
  };

  // Get video from lesson media
  const lessonVideo = lesson.media?.find(m => m.type === 'video');
  const videoId = lessonVideo ? getYouTubeVideoId(lessonVideo.url) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-teal-50 to-emerald-50">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-green-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-teal-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-emerald-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Back Button */}
        <div className="mb-4 sm:mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-green-600 transition-colors group"
          >
            <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Back</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Lesson Header Card */}
            <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm overflow-hidden">
              <div className="bg-gradient-to-r from-green-600 to-teal-600 p-6 sm:p-8">
                <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs sm:text-sm font-bold shadow-lg ${difficultyColors[lesson.difficulty]}`}>
                      {lesson.difficulty}
                    </span>
                    {lesson.topic && (
                      <span className="px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-white/20 text-white backdrop-blur-sm">
                        {lesson.topic}
                      </span>
                    )}
                  </div>
                  {lesson.isCompleted && (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-full">
                      <CheckCircle className="w-4 h-4 text-white" />
                      <span className="text-xs sm:text-sm font-bold text-white">Completed</span>
                    </div>
                  )}
                </div>
                
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white mb-4 leading-tight">
                  {lesson.title}
                </h1>

                {lesson.summary && (
                  <p className="text-green-50 text-sm sm:text-base leading-relaxed mb-6">
                    {lesson.summary}
                  </p>
                )}

                {/* Stats Row */}
                <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-green-200" />
                    <span className="text-white text-sm sm:text-base font-medium">{lesson.estimatedTime} min</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 sm:w-5 sm:h-5 text-green-200" />
                    <span className="text-white text-sm sm:text-base font-medium">{lesson.views || 0} views</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-green-200" />
                    <span className="text-white text-sm sm:text-base font-medium">{likeCount} likes</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-4 sm:p-6 bg-gray-50 border-t border-gray-100">
                <div className="flex flex-wrap gap-2 sm:gap-3">
                  <Button
                    onClick={handleLike}
                    variant="outline"
                    className={`flex-1 sm:flex-none ${liked ? 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100' : 'hover:bg-white'}`}
                  >
                    <Heart className={`w-4 h-4 mr-2 ${liked ? 'fill-current' : ''}`} />
                    <span className="hidden sm:inline">Like</span>
                  </Button>
                  
                  <Button
                    onClick={handleBookmark}
                    variant="outline"
                    className={`flex-1 sm:flex-none ${bookmarked ? 'bg-yellow-50 border-yellow-200 text-yellow-600 hover:bg-yellow-100' : 'hover:bg-white'}`}
                  >
                    <Bookmark className={`w-4 h-4 mr-2 ${bookmarked ? 'fill-current' : ''}`} />
                    <span className="hidden sm:inline">Save</span>
                  </Button>
                  
                  <Button
                    onClick={handleShare}
                    variant="outline"
                    className="flex-1 sm:flex-none hover:bg-white"
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">Share</span>
                  </Button>
                </div>
              </div>
            </Card>

            {/* Video Section */}
            {videoId && (
              <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm overflow-hidden">
                <CardContent className="p-6 sm:p-8">
                  <div className="flex items-center gap-2 mb-4">
                    <Play className="w-5 h-5 text-green-600" />
                    <h2 className="text-xl font-bold text-gray-900">Video Lesson</h2>
                  </div>
                  <p className="text-gray-600 text-sm mb-4">Watch the video to understand the concepts better</p>
                  
                  <div className="relative w-full rounded-lg overflow-hidden" style={{ paddingBottom: '56.25%' }}>
                    <iframe
                      className="absolute top-0 left-0 w-full h-full"
                      src={`https://www.youtube.com/embed/${videoId}`}
                      title={lesson.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                  
                  <div className="flex items-center gap-2 mt-4 text-sm text-gray-500">
                    <Clock className="w-4 h-4" />
                    <span>{lessonVideo?.duration ? `${lessonVideo.duration} min` : '10 min'}</span>
                    <span className="mx-2">•</span>
                    <span>HD Quality</span>
                    <span className="mx-2">•</span>
                    <span className="text-amber-600">💡 Tip: Use playback speed controls to learn faster</span>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Lesson Content */}
            <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
              <CardContent className="p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-green-600" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Lesson Content</h2>
                </div>

                <div className="prose prose-sm sm:prose lg:prose-lg max-w-none">
                  <MarkdownRenderer content={lesson.content} />
                </div>

                {/* Key Points */}
                {lesson.tags && lesson.tags.length > 0 && (
                  <div className="mt-8 p-6 bg-gradient-to-br from-green-50 to-teal-50 rounded-2xl border border-green-100">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <Star className="w-5 h-5 text-green-600" />
                      Key Points
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {lesson.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-3 py-1.5 bg-white text-green-700 rounded-lg text-sm font-medium border border-green-200 shadow-sm"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Complete Lesson Button */}
            {!lesson.isCompleted && (
              <Card className="border-0 shadow-xl bg-gradient-to-r from-green-600 to-teal-600">
                <CardContent className="p-6 sm:p-8">
                  <div className="text-center">
                    <Trophy className="w-12 h-12 sm:w-16 sm:h-16 text-white mx-auto mb-4" />
                    <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">Ready to Complete?</h3>
                    <p className="text-green-50 mb-6">Mark this lesson as complete and earn XP!</p>
                    <Button
                      onClick={handleCompleteLesson}
                      disabled={completing}
                      className="bg-white text-green-600 hover:bg-green-50 shadow-lg font-bold px-8 py-6 text-base sm:text-lg"
                    >
                      {completing ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Completing...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-5 h-5 mr-2" />
                          Complete Lesson
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm sticky top-6">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <Link href={`/quiz?lessonId=${lessonId}`} className="block">
                    <button className="w-full flex items-center gap-3 p-4 rounded-xl hover:bg-purple-50 border-2 border-transparent hover:border-purple-200 transition-all group">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                        <FileQuestion className="w-5 h-5 text-purple-600" />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="font-semibold text-gray-900 group-hover:text-purple-600">Take Quiz</p>
                        <p className="text-xs text-gray-500">Test your knowledge</p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all" />
                    </button>
                  </Link>

                  {!videoId ? (
                    <Link href={`/videos?lessonId=${lessonId}`} className="block">
                      <button className="w-full flex items-center gap-3 p-4 rounded-xl hover:bg-blue-50 border-2 border-transparent hover:border-blue-200 transition-all group">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                          <VideoIcon className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="flex-1 text-left">
                          <p className="font-semibold text-gray-900 group-hover:text-blue-600">Watch Video</p>
                          <p className="text-xs text-gray-500">Visual learning</p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                      </button>
                    </Link>
                  ) : (
                    <button 
                      onClick={() => {
                        const videoSection = document.querySelector('iframe');
                        videoSection?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      }}
                      className="w-full flex items-center gap-3 p-4 rounded-xl hover:bg-blue-50 border-2 border-transparent hover:border-blue-200 transition-all group"
                    >
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Play className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="font-semibold text-gray-900 group-hover:text-blue-600">Watch Video</p>
                        <p className="text-xs text-gray-500">Scroll to video</p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                    </button>
                  )}

                  {lesson.isCompleted && (
                    <Link href={`/certificates?lessonId=${lessonId}`} className="block">
                      <button className="w-full flex items-center gap-3 p-4 rounded-xl hover:bg-yellow-50 border-2 border-transparent hover:border-yellow-200 transition-all group">
                        <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Award className="w-5 h-5 text-yellow-600" />
                        </div>
                        <div className="flex-1 text-left">
                          <p className="font-semibold text-gray-900 group-hover:text-yellow-600">Get Certificate</p>
                          <p className="text-xs text-gray-500">Download proof</p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-yellow-600 group-hover:translate-x-1 transition-all" />
                      </button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Progress Card */}
            {lesson.isCompleted && (
              <Card className="border-0 shadow-xl bg-gradient-to-br from-green-500 to-teal-600">
                <CardContent className="p-6 text-center">
                  <Trophy className="w-12 h-12 text-white mx-auto mb-3" />
                  <h3 className="text-lg font-bold text-white mb-2">Lesson Completed!</h3>
                  <p className="text-green-50 text-sm">Great job! Keep up the momentum.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
