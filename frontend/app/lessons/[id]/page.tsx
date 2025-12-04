'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

// Utility function to extract YouTube video ID
const getYouTubeVideoId = (url: string): string | null => {
  if (!url) return null;
  
  // Handle different YouTube URL formats
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
import {
  BookOpen,
  Clock,
  Heart,
  Bookmark,
  Share2,
  CheckCircle,
  Volume2,
  MessageSquare,
  ChevronLeft,
  Star,
  User,
  Play,
  FileQuestion,
  Video as VideoIcon,
  Trophy,
  Lock,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { lessonsAPI, bookmarkAPI, commentAPI } from '@/services/api.service';
import { toast } from 'sonner';
import { Lesson } from '@/types';
import VideoPlayer from '@/components/VideoPlayer';
import { useAuthStore } from '@/store/authStore';

export default function LessonDetailPage() {
  const router = useRouter();
  const params = useParams();
  const lessonId = params?.id as string;
  const { token } = useAuthStore();

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [liked, setLiked] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [playingAudio, setPlayingAudio] = useState(false);
  const [accessGranted, setAccessGranted] = useState(false);
  const [accessMessage, setAccessMessage] = useState('');
  const [quiz, setQuiz] = useState<any>(null);

  useEffect(() => {
    if (lessonId) {
      checkAccessAndLoadLesson();
      loadComments();
      checkBookmarkStatus();
    }
  }, [lessonId]);

  useEffect(() => {
    if (lesson) {
      checkLikeStatus();
    }
  }, [lesson]);

  const checkBookmarkStatus = async () => {
    if (!token) return;
    
    try {
      const response = await bookmarkAPI.checkBookmark(lessonId);
      const isBookmarked = response.data.data.isBookmarked || false;
      setBookmarked(isBookmarked);
      console.log('Bookmark status loaded:', isBookmarked);
    } catch (error) {
      console.error('Error checking bookmark status:', error);
      setBookmarked(false);
    }
  };

  const checkLikeStatus = async () => {
    if (!token || !lesson) return;
    
    try {
      // Check if current user's ID is in the likedBy array
      const response = await lessonsAPI.getLesson(lessonId);
      const lessonData = response.data.data;
      
      // Get user ID from profile endpoint
      const userResponse = await fetch('http://localhost:5000/api/v1/profile/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!userResponse.ok) {
        console.error('Failed to fetch user data');
        setLiked(false);
        return;
      }
      
      const userData = await userResponse.json();
      const userId = userData?.data?._id;
      
      if (!userId) {
        console.error('User ID not found');
        setLiked(false);
        return;
      }
      
      // Check if user has liked
      const hasLiked = lessonData.likedBy?.some((id: string) => id === userId) || false;
      setLiked(hasLiked);
      console.log('Like status check:', { 
        userId, 
        likedBy: lessonData.likedBy, 
        hasLiked,
        lessonLikes: lessonData.likes 
      });
    } catch (error) {
      console.error('Error checking like status:', error);
      setLiked(false);
    }
  };

  const checkAccessAndLoadLesson = async () => {
    try {
      setLoading(true);
      
      // First, load lesson data
      const lessonResponse = await lessonsAPI.getLesson(lessonId);
      const lessonData = lessonResponse.data.data;
      setLesson(lessonData);
      
      // Check if user is enrolled in the course
      if (!token) {
        setAccessGranted(false);
        setAccessMessage('Please login to access this lesson');
        setLoading(false);
        return;
      }
      
      // Check enrollment
      try {
        const enrollmentResponse = await fetch(
          `http://localhost:5000/api/v1/courses/${lessonData.course}/enrollment`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        if (!enrollmentResponse.ok) {
          setAccessGranted(false);
          setAccessMessage('You need to enroll in this course first');
          setLoading(false);
          return;
        }
        
        const enrollment = await enrollmentResponse.json();
        
        // Check if this is the first lesson (always accessible)
        if (lessonData.order === 1) {
          setAccessGranted(true);
          loadQuizForLesson(lessonId);
        } else {
          // Check if previous lesson quiz was passed
          await checkPreviousLessonQuiz(lessonData, enrollment.data);
        }
      } catch (error) {
        setAccessGranted(false);
        setAccessMessage('You need to enroll in this course first');
      }
    } catch (error: any) {
      toast.error('Failed to load lesson');
      console.error(error);
      setAccessGranted(false);
    } finally {
      setLoading(false);
    }
  };

  const checkPreviousLessonQuiz = async (lessonData: any, enrollmentData: any) => {
    try {
      
      // Find previous lesson
      const previousLessonResponse = await fetch(
        `http://localhost:5000/api/v1/lessons?course=${lessonData.course}&order=${lessonData.order - 1}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (!previousLessonResponse.ok) {
        setAccessGranted(true); // No previous lesson, unlock
        loadQuizForLesson(lessonId);
        return;
      }
      
      const previousLessons = await previousLessonResponse.json();
      const previousLesson = previousLessons.data?.[0];
      
      if (!previousLesson) {
        setAccessGranted(true); // No previous lesson found
        loadQuizForLesson(lessonId);
        return;
      }
      
      // Check if quiz exists for previous lesson
      const quizResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/quiz/lesson/${previousLesson._id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (!quizResponse.ok) {
        // No quiz for previous lesson, allow access
        setAccessGranted(true);
        loadQuizForLesson(lessonId);
        return;
      }
      
      const quizData = await quizResponse.json();
      const previousQuiz = quizData.data;
      
      // Check if student passed the quiz
      const attemptResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/quiz/${previousQuiz._id}/attempts`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (attemptResponse.ok) {
        const attempts = await attemptResponse.json();
        const passedAttempt = attempts.data?.find((a: any) => a.passed === true);
        
        if (passedAttempt) {
          setAccessGranted(true);
          loadQuizForLesson(lessonId);
        } else {
          setAccessGranted(false);
          setAccessMessage(`🔒 This lesson is locked. You must pass the quiz for "${previousLesson.title}" with at least 80% to unlock it.`);
        }
      } else {
        setAccessGranted(false);
        setAccessMessage(`🔒 This lesson is locked. You must complete and pass the quiz for "${previousLesson.title}" first.`);
      }
    } catch (error) {
      console.error('Error checking previous lesson quiz:', error);
      setAccessGranted(false);
      setAccessMessage('Unable to verify access. Please try again.');
    }
  };

  const loadQuizForLesson = async (lessonId: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/quiz/lesson/${lessonId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.ok) {
        const quizData = await response.json();
        setQuiz(quizData.data);
      }
    } catch (error) {
      console.error('Error loading quiz:', error);
    }
  };

  const loadLesson = async () => {
    try {
      setLoading(true);
      const response = await lessonsAPI.getLesson(lessonId);
      setLesson(response.data.data);
    } catch (error: any) {
      toast.error('Failed to load lesson');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadComments = async () => {
    try {
      const response = await commentAPI.getLessonComments(lessonId);
      setComments(response.data.data || []);
    } catch (error: any) {
      console.error('Failed to load comments:', error);
    }
  };

  const handleComplete = async () => {
    try {
      setCompleting(true);
      const response = await lessonsAPI.completeLesson(lessonId);
      const xpEarned = response.data.data?.xpEarned || 50;
      
      toast.success(`🎉 Lesson completed! +${xpEarned} XP earned`);
      
      if (lesson) {
        setLesson({ ...lesson, isCompleted: true });
      }
      
      // Navigate based on quiz availability
      if (quiz) {
        // If quiz exists, go to quiz
        toast.info('Redirecting to quiz...', { duration: 2000 });
        setTimeout(() => {
          router.push(`/quiz/${quiz._id}`);
        }, 2000);
      } else {
        // If no quiz, find and go to next lesson
        await goToNextLesson();
      }
    } catch (error: any) {
      const errorMsg = error?.response?.data?.message || 'Failed to complete lesson';
      toast.error(errorMsg);
      console.error('Complete lesson error:', error);
    } finally {
      setCompleting(false);
    }
  };

  const goToNextLesson = async () => {
    try {
      if (!lesson?.course) {
        router.push('/dashboard');
        return;
      }

      const courseId = typeof lesson.course === 'string' ? lesson.course : lesson.course._id;
      
      // Get next lesson in the course
      const response = await fetch(
        `http://localhost:5000/api/v1/lessons?course=${courseId}&order=${(lesson.order || 0) + 1}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.ok) {
        const nextLessons = await response.json();
        const nextLesson = nextLessons.data?.[0];
        
        if (nextLesson) {
          toast.info('Going to next lesson...', { duration: 1500 });
          setTimeout(() => {
            router.push(`/lessons/${nextLesson._id}`);
          }, 1500);
        } else {
          // No more lessons, go back to course
          toast.success('Course completed! 🎉', { duration: 2000 });
          setTimeout(() => {
            router.push(`/courses/${courseId}`);
          }, 2000);
        }
      } else {
        // Fallback to course page
        router.push(`/courses/${courseId}`);
      }
    } catch (error) {
      console.error('Error finding next lesson:', error);
      if (lesson?.course) {
        const courseId = typeof lesson.course === 'string' ? lesson.course : lesson.course._id;
        router.push(`/courses/${courseId}`);
      } else {
        router.push('/dashboard');
      }
    }
  };

  const handleBookmark = async () => {
    try {
      if (bookmarked) {
        await bookmarkAPI.removeBookmark(lessonId);
        toast.success('Bookmark removed');
        setBookmarked(false);
      } else {
        await bookmarkAPI.createBookmark({ lessonId });
        toast.success('Lesson bookmarked');
        setBookmarked(true);
      }
    } catch (error: any) {
      const errorMsg = error?.response?.data?.message || 'Failed to bookmark lesson';
      toast.error(errorMsg);
      console.error('Bookmark error:', error?.response?.data || error);
    }
  };

  const handleLike = async () => {
    if (!token) {
      toast.error('Please login to like lessons');
      return;
    }

    try {
      // Call API to toggle like
      const response = await lessonsAPI.likeLesson(lessonId);
      const updatedLesson = response.data.data;
      
      console.log('Like response:', { hasLiked: updatedLesson.hasLiked, likes: updatedLesson.likes });
      
      // Update local state immediately
      const newLikedState = updatedLesson.hasLiked;
      setLiked(newLikedState);
      
      if (lesson) {
        setLesson({
          ...lesson,
          likes: updatedLesson.likes,
          likedBy: updatedLesson.likedBy,
        });
      }
      
      toast.success(newLikedState ? 'Lesson liked!' : 'Like removed');
    } catch (error: any) {
      const errorMsg = error?.response?.data?.message || 'Failed to like lesson';
      toast.error(errorMsg);
      console.error('Like error:', error?.response?.data || error);
    }
  };

  const handlePlayAudio = () => {
    if (lesson?.audioUrl) {
      // Play audio logic
      setPlayingAudio(true);
      toast.info('Playing audio...');
    } else {
      toast.error('Audio not available for this lesson');
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      await commentAPI.createComment({
        lesson: lessonId,
        content: newComment,
      });
      setNewComment('');
      loadComments();
      toast.success('Comment added!');
    } catch (error: any) {
      toast.error('Failed to add comment');
    }
  };

  const handleShare = () => {
    if (navigator.share && lesson) {
      navigator
        .share({
          title: lesson.title,
          text: lesson.summary,
          url: window.location.href,
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading lesson...</p>
        </div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Lesson not found</h2>
          <p className="text-gray-600 mb-4">The lesson you're looking for doesn't exist.</p>
          <Link href="/lessons">
            <Button>Back to Lessons</Button>
          </Link>
        </Card>
      </div>
    );
  }

  // Show access denied message if not granted
  if (!accessGranted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => lesson?.course ? router.push(`/courses/${lesson.course}`) : router.push('/courses')}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Back to Course
            </Button>
          </div>
        </header>
        
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <Card className="p-8 text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trophy className="w-8 h-8 text-orange-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Lesson Locked</h2>
            <p className="text-gray-600 mb-6 text-lg">{accessMessage}</p>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-blue-900 mb-2">How to Unlock:</h3>
              <ol className="text-left text-sm text-blue-800 space-y-2">
                <li>1. Go back to the course page</li>
                <li>2. Complete the previous lesson</li>
                <li>3. Pass the quiz with <strong>80% or higher</strong></li>
                <li>4. This lesson will automatically unlock!</li>
              </ol>
            </div>
            
            <div className="flex gap-3 justify-center">
              <Button 
                onClick={() => lesson?.course ? router.push(`/courses/${lesson.course}`) : router.push('/courses')}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Back to Course
              </Button>
              <Link href="/dashboard">
                <Button variant="outline">Go to Dashboard</Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => lesson?.course ? router.push(`/courses/${lesson.course}`) : router.push('/lessons')}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Back to Course
            </Button>
            
            {lesson.order === 1 && (
              <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-medium">
                ✓ Always Unlocked
              </span>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Lesson Header */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      lesson.difficulty === 'beginner'
                        ? 'bg-green-100 text-green-700'
                        : lesson.difficulty === 'intermediate'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {lesson.difficulty}
                  </span>
                  <span className="text-sm text-gray-500">{lesson.topic}</span>
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{lesson.title}</h1>
                <p className="text-gray-600">{lesson.summary}</p>
                
                {/* Completed Badge */}
                {lesson.isCompleted && (
                  <div className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-full">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-semibold">Lesson Completed</span>
                    <Trophy className="w-5 h-5" />
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between text-sm text-gray-600 border-t border-gray-200 pt-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{lesson.estimatedTime} min</span>
                </div>
                <div className="flex items-center gap-1">
                  <Heart className={`w-4 h-4 ${liked ? 'fill-red-500 text-red-500' : ''}`} />
                  <span>{lesson.likes || 0}</span>
                </div>
                <div className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  <span>{lesson.author?.name || 'Anonymous'}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {lesson.audioUrl && (
                  <Button variant="outline" size="sm" onClick={handlePlayAudio}>
                    <Volume2 className="w-4 h-4" />
                  </Button>
                )}
                <Button variant="outline" size="sm" onClick={handleBookmark}>
                  <Bookmark className={`w-4 h-4 ${bookmarked ? 'fill-blue-500 text-blue-500' : ''}`} />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleLike}
                  className={liked ? 'border-red-200 bg-red-50' : ''}
                >
                  <Heart className={`w-4 h-4 ${liked ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
                  <span className={`ml-1 ${liked ? 'text-red-600 font-medium' : ''}`}>
                    {liked ? 'Liked' : 'Like'}
                  </span>
                </Button>
                <Button variant="outline" size="sm" onClick={handleShare}>
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Video Player (if available) */}
        {lesson.media && lesson.media.some(m => m.type === 'video') && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Play className="w-5 h-5 text-blue-600" />
                Video Lesson
              </CardTitle>
              <p className="text-sm text-gray-600">
                Watch the video to understand the concepts better
              </p>
            </CardHeader>
            <CardContent className="p-4">
              {lesson.media
                .filter(m => m.type === 'video')
                .map((media, index) => {
                  const youtubeId = getYouTubeVideoId(media.url);
                  
                  if (youtubeId) {
                    // Render YouTube iframe embed
                    return (
                      <div key={index} className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                        <iframe
                          className="absolute top-0 left-0 w-full h-full rounded-lg"
                          src={`https://www.youtube.com/embed/${youtubeId}?rel=0&modestbranding=1`}
                          title="Video Lesson"
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      </div>
                    );
                  } else {
                    // Render native VideoPlayer for direct video files
                    return (
                      <VideoPlayer
                        key={index}
                        src={media.url}
                        poster={lesson.thumbnailUrl || media.thumbnail}
                        onEnded={() => {
                          toast.success('🎉 Video completed! +30 XP earned');
                        }}
                        onProgress={(progress) => {
                          // Track video progress for analytics
                          if (progress > 90) {
                            console.log('Video almost complete:', progress);
                          }
                        }}
                      />
                    );
                  }
                })}
              
              {/* Video Info */}
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1 text-gray-600">
                      <Clock className="w-4 h-4" />
                      {lesson.media.find(m => m.type === 'video')?.duration || lesson.estimatedTime} min
                    </span>
                    <span className="text-gray-400">|</span>
                    <span className="text-gray-600">HD Quality</span>
                  </div>
                  <div className="text-gray-600">
                    💡 Tip: Use playback speed controls to learn faster
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Lesson Content */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-600" />
              Lesson Content
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div
              className="prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: lesson.content }}
            />
          </CardContent>
        </Card>

        {/* Tags */}
        {lesson.tags && lesson.tags.length > 0 && (
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex flex-wrap gap-2">
                {lesson.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions - Quiz, Video, Certificate */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Related Resources</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Quiz */}
              {quiz ? (
                <Link href={`/quiz/${quiz._id}`}>
                  <div className="p-4 border-2 border-purple-200 rounded-lg hover:bg-purple-50 hover:border-purple-400 transition-all cursor-pointer group">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                        <FileQuestion className="w-6 h-6 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Take Quiz</h3>
                        <p className="text-xs text-gray-600">Pass with 80%+ to unlock next</p>
                      </div>
                    </div>
                  </div>
                </Link>
              ) : (
                <div className="p-4 border-2 border-gray-200 rounded-lg bg-gray-50 opacity-60 cursor-not-allowed">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                      <FileQuestion className="w-6 h-6 text-gray-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-500">No Quiz Yet</h3>
                      <p className="text-xs text-gray-500">Instructor hasn't added a quiz</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Video */}
              <Link href={`/videos?lessonId=${lessonId}`}>
                <div className="p-4 border-2 border-blue-200 rounded-lg hover:bg-blue-50 hover:border-blue-400 transition-all cursor-pointer group">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                      <VideoIcon className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Watch Video</h3>
                      <p className="text-xs text-gray-600">Visual learning</p>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Complete Lesson */}
        {!lesson.isCompleted && (
          <Card className="mb-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold mb-1">Mark as Complete & Go to Next</h3>
                  <p className="text-white/90 text-sm">
                    {quiz 
                      ? '✓ Earn 50 XP → Go to Quiz (Required to unlock next lesson)' 
                      : '✓ Earn 50 XP → Go to Next Lesson'}
                  </p>
                </div>
                <Button
                  onClick={handleComplete}
                  disabled={completing}
                  className="bg-white text-blue-600 hover:bg-gray-100 font-semibold"
                >
                  {completing ? (
                    'Completing...'
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      {quiz ? 'Complete & Take Quiz' : 'Complete & Next'}
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
        
        {lesson.isCompleted && (
          <Card className="mb-6 bg-gradient-to-r from-green-500 to-emerald-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-1">Lesson Completed! 🎉</h3>
                  <p className="text-white/90 text-sm">Great job! Continue to the next lesson or complete all course lessons to earn your certificate.</p>
                </div>
                {lesson?.course && (
                  <Link href={`/courses/${lesson.course}`}>
                    <Button className="bg-white text-green-600 hover:bg-gray-100">
                      <BookOpen className="w-4 h-4 mr-2" />
                      Back to Course
                    </Button>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Comments Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Comments ({comments.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddComment} className="mb-6">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Share your thoughts..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
              />
              <div className="flex justify-end mt-2">
                <Button type="submit" disabled={!newComment.trim()}>
                  Post Comment
                </Button>
              </div>
            </form>

            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment._id} className="border-b border-gray-200 pb-4 last:border-0">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                      {comment.user?.name?.charAt(0).toUpperCase() || 'A'}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-gray-900">
                          {comment.user?.name || 'Anonymous'}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(comment.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-gray-700">{comment.content}</p>
                      {comment.likes > 0 && (
                        <div className="flex items-center gap-1 mt-2 text-sm text-gray-500">
                          <Heart className="w-3 h-3" />
                          <span>{comment.likes}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
