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
  Volume2,
  MessageSquare,
  ChevronLeft,
  Star,
  User,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { lessonsAPI, bookmarkAPI, commentAPI } from '@/services/api.service';
import { toast } from 'sonner';
import { Lesson } from '@/types';

export default function LessonDetailPage() {
  const router = useRouter();
  const params = useParams();
  const lessonId = params.id as string;

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [liked, setLiked] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [playingAudio, setPlayingAudio] = useState(false);

  useEffect(() => {
    if (lessonId) {
      loadLesson();
      loadComments();
    }
  }, [lessonId]);

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
      const response = await commentAPI.getComments({ lessonId, limit: 20 });
      setComments(response.data.data || []);
    } catch (error: any) {
      console.error('Failed to load comments:', error);
    }
  };

  const handleComplete = async () => {
    try {
      setCompleting(true);
      await lessonsAPI.completeLesson(lessonId);
      toast.success('Lesson completed! +50 XP');
      if (lesson) {
        setLesson({ ...lesson });
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to complete lesson');
    } finally {
      setCompleting(false);
    }
  };

  const handleBookmark = async () => {
    try {
      if (bookmarked) {
        await bookmarkAPI.removeBookmark(lessonId);
        toast.success('Bookmark removed');
      } else {
        await bookmarkAPI.createBookmark({ resourceId: lessonId, resourceType: 'lesson' });
        toast.success('Lesson bookmarked');
      }
      setBookmarked(!bookmarked);
    } catch (error: any) {
      toast.error('Failed to bookmark lesson');
    }
  };

  const handleLike = async () => {
    try {
      // Like logic would be implemented here
      setLiked(!liked);
      if (lesson) {
        setLesson({
          ...lesson,
          likes: liked ? (lesson.likes || 0) - 1 : (lesson.likes || 0) + 1,
        });
      }
      toast.success(liked ? 'Like removed' : 'Lesson liked!');
    } catch (error: any) {
      toast.error('Failed to like lesson');
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/lessons">
            <Button variant="ghost" size="sm">
              <ChevronLeft className="w-4 h-4 mr-1" />
              Back to Lessons
            </Button>
          </Link>
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
                  <Bookmark className={`w-4 h-4 ${bookmarked ? 'fill-blue-500' : ''}`} />
                </Button>
                <Button variant="outline" size="sm" onClick={handleLike}>
                  <Heart className={`w-4 h-4 ${liked ? 'fill-red-500' : ''}`} />
                </Button>
                <Button variant="outline" size="sm" onClick={handleShare}>
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lesson Content */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div
              className="prose prose-blue max-w-none"
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

        {/* Complete Lesson */}
        <Card className="mb-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold mb-1">Mark as Complete</h3>
                <p className="text-white/90 text-sm">Earn 50 XP by completing this lesson</p>
              </div>
              <Button
                onClick={handleComplete}
                disabled={completing}
                className="bg-white text-blue-600 hover:bg-gray-100"
              >
                {completing ? (
                  'Completing...'
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Complete
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

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
