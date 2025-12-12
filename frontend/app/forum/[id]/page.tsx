'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { useAppDispatch, useForumPostById, useForumCommentsByPostId, useIsInitializing } from '@/store/hooks';
import { fetchForumPostById, fetchForumComments } from '@/store/globalSlice';
import {
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Eye,
  Clock,
  Send,
  ChevronLeft,
  CheckCircle,
  AlertCircle,
  BookOpen,
  Award,
  ArrowLeft,
} from 'lucide-react';
import { toast } from 'sonner';

// Recursive Nested Comment Component
interface NestedCommentProps {
  comment: any;
  depth: number;
  onVote: (commentId: string, voteType: 'upvote' | 'downvote') => void;
  onReply: (parentCommentId: string) => void;
  replyingTo: string | null;
  setReplyingTo: (id: string | null) => void;
  replyText: { [key: string]: string };
  setReplyText: (text: { [key: string]: string }) => void;
  userId?: string;
  formatDate: (date: string) => string;
}

const NestedComment: React.FC<NestedCommentProps> = ({
  comment,
  depth,
  onVote,
  onReply,
  replyingTo,
  setReplyingTo,
  replyText,
  setReplyText,
  userId,
  formatDate,
}) => {
  const maxDepth = 5; // Maximum nesting depth
  const isMaxDepth = depth >= maxDepth;

  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="flex gap-2 sm:gap-3">
        {/* Vote Section for Nested Comment */}
        <div className="flex flex-col items-center gap-0.5 sm:gap-1 min-w-[30px] sm:min-w-[40px]">
          <button
            onClick={() => onVote(comment._id, 'upvote')}
            className="p-1 sm:p-1.5 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
          >
            <ThumbsUp
              className={`w-3 h-3 sm:w-4 sm:h-4 ${comment.upvotes?.includes(userId)
                ? 'text-green-600 fill-green-600'
                : 'text-muted-foreground'
                }`}
            />
          </button>
          <span className="text-xs sm:text-sm font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
            {(comment.upvotes?.length || 0) - (comment.downvotes?.length || 0)}
          </span>
          <button
            onClick={() => onVote(comment._id, 'downvote')}
            className="p-1 sm:p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
          >
            <ThumbsDown
              className={`w-3 h-3 sm:w-4 sm:h-4 ${comment.downvotes?.includes(userId)
                ? 'text-red-600 fill-red-600'
                : 'text-muted-foreground'
                }`}
            />
          </button>

          {comment.isAcceptedAnswer && (
            <div className="mt-0.5 sm:mt-1">
              <Award className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-green-600 fill-green-600" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 sm:gap-2 mb-1">
            <div className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 bg-gradient-to-r from-green-600 via-teal-600 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-[10px] sm:text-xs lg:text-sm flex-shrink-0 shadow-sm">
              {comment.author?.name?.charAt(0).toUpperCase()}
            </div>
            <span className="font-semibold text-foreground text-[11px] sm:text-sm truncate">{comment.author?.name}</span>
            <span className="text-[9px] sm:text-xs text-muted-foreground flex-shrink-0">{formatDate(comment.createdAt)}</span>
          </div>

          <p className="text-[11px] sm:text-sm text-muted-foreground leading-relaxed mb-1.5 sm:mb-2">{comment.content}</p>

          {/* Reply Button */}
          {!isMaxDepth && (
            <button
              onClick={() => setReplyingTo(replyingTo === comment._id ? null : comment._id)}
              className="text-[10px] sm:text-xs text-teal-600 dark:text-teal-500 hover:text-teal-700 dark:hover:text-teal-400 font-semibold px-2 py-0.5 sm:py-1 hover:bg-teal-50 dark:hover:bg-teal-900/20 rounded transition-all"
            >
              {replyingTo === comment._id ? 'Cancel' : 'Reply'}
            </button>
          )}

          {/* Reply Form */}
          {replyingTo === comment._id && (
            <div className="mt-2 sm:mt-3 pl-0">
              <textarea
                value={replyText[comment._id] || ''}
                onChange={(e) => setReplyText({ ...replyText, [comment._id]: e.target.value })}
                placeholder="Write your reply..."
                rows={2}
                className="w-full px-2 py-1.5 sm:px-3 sm:py-2 text-[11px] sm:text-sm bg-background border-2 border-border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none transition-all hover:border-gray-300 dark:hover:border-gray-600 text-foreground"
              />
              <div className="flex justify-end gap-1.5 sm:gap-2 mt-1.5 sm:mt-2">
                <button
                  onClick={() => setReplyingTo(null)}
                  className="px-2 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs text-muted-foreground hover:text-foreground font-semibold hover:bg-secondary rounded-lg transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={() => onReply(comment._id)}
                  disabled={!replyText[comment._id]?.trim()}
                  className="px-2 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-lg hover:from-green-700 hover:to-teal-700 transition-all font-semibold shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Post Reply
                </button>
              </div>
            </div>
          )}

          {/* Recursive Nested Replies */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-2 sm:mt-3 pl-2 sm:pl-4 border-l-2 border-border space-y-2 sm:space-y-3">
              {comment.replies.map((reply: any) => (
                <NestedComment
                  key={reply._id}
                  comment={reply}
                  depth={depth + 1}
                  onVote={onVote}
                  onReply={onReply}
                  replyingTo={replyingTo}
                  setReplyingTo={setReplyingTo}
                  replyText={replyText}
                  setReplyText={setReplyText}
                  userId={userId}
                  formatDate={formatDate}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default function ForumPostPage() {
  const router = useRouter();
  const params = useParams();
  const postId = params.id as string;
  const { user, token } = useAuthStore();
  
  const dispatch = useAppDispatch();
  const postFromRedux = useForumPostById(postId);
  const commentsFromRedux = useForumCommentsByPostId(postId);
  const isInitializing = useIsInitializing();

  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState<{ [key: string]: string }>({});
  const [viewCounted, setViewCounted] = useState(false);

  useEffect(() => {
    if (postId && !isInitializing) {
      // Load post if not in Redux or needs refresh
      if (!postFromRedux) {
        dispatch(fetchForumPostById(postId));
      }
      // Load comments if not in Redux
      if (commentsFromRedux.length === 0) {
        dispatch(fetchForumComments(postId));
      }
      // Mark post as viewed
      markAsViewed();
    }
  }, [postId, isInitializing, postFromRedux, commentsFromRedux.length, dispatch]);

  const markAsViewed = () => {
    if (!postId || viewCounted) return;
    
    // Check if this post view has already been counted for this user
    const viewedPosts = JSON.parse(localStorage.getItem('viewedPosts') || '[]');
    const alreadyViewed = viewedPosts.includes(postId);

    // Only mark as viewed if not already in localStorage
    if (!alreadyViewed) {
      viewedPosts.push(postId);
      localStorage.setItem('viewedPosts', JSON.stringify(viewedPosts));
      setViewCounted(true);
    }
  };

  const handleVotePost = async (voteType: 'upvote' | 'downvote') => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/forum/posts/${postId}/vote`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ voteType }),
      });
      if (!response.ok) throw new Error('Failed to vote');
      dispatch(fetchForumPostById(postId));
      toast.success('Vote recorded!');
    } catch (error: any) {
      toast.error('Failed to vote');
    }
  };

  const handleVoteComment = async (commentId: string, voteType: 'upvote' | 'downvote') => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/forum/comments/${commentId}/vote`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ voteType }),
      });
      if (!response.ok) throw new Error('Failed to vote');
      dispatch(fetchForumComments(postId));
      toast.success('Vote recorded!');
    } catch (error: any) {
      toast.error('Failed to vote comment');
    }
  };

  const handleAcceptAnswer = async (commentId: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/forum/comments/${commentId}/accept`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to accept answer');
      }

      dispatch(fetchForumComments(postId));
      toast.success('✅ Answer accepted!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to accept answer');
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setSubmitting(true);
    try {
      // Try to join the group first if not already a member
      if (postFromRedux?.group?._id) {
        try {
          const joinResponse = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/forum/groups/${postFromRedux.group._id}/join`,
            {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({}),
            }
          );
          if (joinResponse.ok) {
          }
        } catch (joinError) {
          // Ignore if already a member
        }
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/forum/comments`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          postId: postId,
          content: newComment,
        }),
      });

      if (!response.ok) throw new Error('Failed to post comment');

      setNewComment('');
      toast.success('Answer posted! 💬');
      dispatch(fetchForumComments(postId));
      dispatch(fetchForumPostById(postId));
    } catch (error: any) {
      console.error('Comment error:', error);
      const errorMessage = error.message || 'Failed to post answer';
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitReply = async (parentCommentId: string) => {
    const replyContent = replyText[parentCommentId];
    if (!replyContent?.trim()) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/forum/comments`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          postId: postId,
          content: replyContent,
          parentCommentId: parentCommentId,
        }),
      });

      if (!response.ok) throw new Error('Failed to post reply');

      setReplyText({ ...replyText, [parentCommentId]: '' });
      setReplyingTo(null);
      toast.success('Reply posted! 💬');
      dispatch(fetchForumComments(postId));
    } catch (error: any) {
      console.error('Reply error:', error);
      toast.error('Failed to post reply');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  if (isInitializing || !postFromRedux) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-page-gradient">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading post...</p>
        </div>
      </div>
    );
  }

  if (!postFromRedux) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-page-gradient">
        <div className="bg-card rounded-xl shadow-sm border border-border p-8 text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">Post not found</h2>
          <Link href="/forum" className="text-blue-600 hover:text-blue-700 font-medium">
            ← Back to Forum
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-page-gradient">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 via-teal-600 to-emerald-600 text-white shadow-lg sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-2 sm:px-4 lg:px-8 py-2 sm:py-4">
          <Link
            href="/forum"
            className="inline-flex items-center gap-1.5 sm:gap-2 text-white hover:text-green-100 transition-colors font-semibold text-xs sm:text-sm"
          >
            <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            Back to Forum
          </Link>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-2 sm:px-4 lg:px-8 py-3 sm:py-6 lg:py-8">
        {/* Main Post */}
        <div className="bg-card rounded-xl sm:rounded-2xl shadow-lg border-0 mb-3 sm:mb-6 overflow-hidden">
          <div className="p-3 sm:p-6">
            <div className="flex gap-2 sm:gap-6">
              {/* Vote Section */}
              <div className="flex flex-col items-center gap-1 sm:gap-2 min-w-[35px] sm:min-w-[60px]">
                <button
                  onClick={() => handleVotePost('upvote')}
                  className="p-1 sm:p-2 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                >
                  <ThumbsUp
                    className={`w-4 h-4 sm:w-6 sm:h-6 ${user?._id && postFromRedux.upvotes?.includes(user._id)
                      ? 'text-green-600 fill-green-600'
                      : 'text-muted-foreground'
                      }`}
                  />
                </button>
                <span className="text-base sm:text-2xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
                  {(postFromRedux.upvotes?.length || 0) - (postFromRedux.downvotes?.length || 0)}
                </span>
                <button
                  onClick={() => handleVotePost('downvote')}
                  className="p-1 sm:p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                >
                  <ThumbsDown
                    className={`w-4 h-4 sm:w-6 sm:h-6 ${user?._id && postFromRedux.downvotes?.includes(user._id)
                      ? 'text-red-600 fill-red-600'
                      : 'text-muted-foreground'
                      }`}
                  />
                </button>
              </div>

              {/* Post Content */}
              <div className="flex-1 min-w-0">
                {/* Badges */}
                <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap mb-2 sm:mb-4">
                  {postFromRedux.isSolved && (
                    <span className="flex items-center gap-0.5 sm:gap-1 px-2 sm:px-3 py-0.5 sm:py-1 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 text-green-700 dark:text-green-400 rounded-full text-[10px] sm:text-xs font-semibold border border-green-200 dark:border-green-800/30">
                      <CheckCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                      Solved
                    </span>
                  )}
                  {postFromRedux.isHelpNeeded && !postFromRedux.isSolved && (
                    <span className="flex items-center gap-0.5 sm:gap-1 px-2 sm:px-3 py-0.5 sm:py-1 bg-gradient-to-r from-orange-100 to-amber-100 dark:from-orange-900/30 dark:to-amber-900/30 text-orange-700 dark:text-orange-400 rounded-full text-[10px] sm:text-xs font-semibold border border-orange-200 dark:border-orange-800/30">
                      <AlertCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                      Help Needed
                    </span>
                  )}
                  {postFromRedux.course && (
                    <span className="flex items-center gap-0.5 sm:gap-1 px-2 sm:px-3 py-0.5 sm:py-1 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 text-purple-700 dark:text-purple-400 rounded-full text-[10px] sm:text-xs font-semibold border border-purple-200 dark:border-purple-800/30 truncate max-w-[150px] sm:max-w-none">
                      <BookOpen className="w-2.5 h-2.5 sm:w-3 sm:h-3 flex-shrink-0" />
                      <span className="truncate">{postFromRedux.course.title}</span>
                    </span>
                  )}
                </div>

                {/* Title */}
                <h1 className="text-lg sm:text-2xl lg:text-3xl font-bold text-foreground mb-2 sm:mb-4 line-clamp-3 sm:line-clamp-none">{postFromRedux.title}</h1>

                {/* Content */}
                <div className="prose max-w-none mb-3 sm:mb-6 dark:prose-invert">
                  <p className="text-sm sm:text-base lg:text-lg text-muted-foreground whitespace-pre-wrap leading-relaxed">{postFromRedux.content}</p>
                </div>

                {/* Tags */}
                {postFromRedux.tags && postFromRedux.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3 sm:mb-6">
                    {postFromRedux.tags.map((tag: string, idx: number) => (
                      <span
                        key={idx}
                        className="px-2 sm:px-3 py-0.5 sm:py-1 bg-secondary text-muted-foreground text-[10px] sm:text-sm rounded-lg font-medium border border-border"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Post Meta */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 pt-3 sm:pt-6 border-t-2 border-border">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-8 h-8 sm:w-12 sm:h-12 bg-gradient-to-r from-green-600 via-teal-600 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-sm sm:text-lg shadow-md">
                      {postFromRedux.author?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground text-xs sm:text-base">{postFromRedux.author?.name}</p>
                      <p className="text-[10px] sm:text-sm text-muted-foreground">
                        {postFromRedux.author?.role === 'instructor' && (
                          <span className="text-green-600 font-semibold">Instructor</span>
                        )}
                        {postFromRedux.author?.role !== 'instructor' && 'Member'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 sm:gap-4 text-[10px] sm:text-sm text-muted-foreground sm:ml-auto">
                    <div className="flex items-center gap-0.5 sm:gap-1">
                      <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
                      <span>{formatDate(postFromRedux.createdAt)}</span>
                    </div>
                    <div className="flex items-center gap-0.5 sm:gap-1">
                      <Eye className="w-3 h-3 sm:w-4 sm:h-4 text-teal-600" />
                      <span>{postFromRedux.viewCount || 0} views</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Answers Section */}
        <div className="bg-card rounded-xl sm:rounded-2xl shadow-lg border-0 overflow-hidden">
          <div className="p-3 sm:p-6 bg-gradient-to-r from-green-50 to-teal-50 dark:from-green-900/10 dark:to-teal-900/10 border-b-2 border-green-100 dark:border-green-800/30">
            <h2 className="text-base sm:text-xl lg:text-2xl font-bold text-foreground flex items-center gap-1.5 sm:gap-2">
              <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-green-600" />
              <span className="bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
                {commentsFromRedux.length} {commentsFromRedux.length === 1 ? 'Answer' : 'Answers'}
              </span>
            </h2>
          </div>

          <div className="p-3 sm:p-6">
            {/* Answer Form */}
            <form onSubmit={handleSubmitComment} className="mb-4 sm:mb-8">
              <label className="block text-xs sm:text-sm font-semibold text-foreground mb-1.5 sm:mb-2">
                Your Answer
              </label>
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write your answer here..."
                rows={4}
                className="w-full px-3 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm lg:text-base bg-background border-2 border-border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none transition-all hover:border-gray-300 dark:hover:border-gray-600 text-foreground"
              />
              <div className="flex justify-end mt-2 sm:mt-3">
                <button
                  type="submit"
                  disabled={submitting || !newComment.trim()}
                  className="px-4 py-2 sm:px-6 sm:py-3 bg-gradient-to-r from-green-600 via-teal-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:via-teal-700 hover:to-emerald-700 transition-all flex items-center gap-1.5 sm:gap-2 font-semibold text-xs sm:text-sm shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  {submitting ? 'Posting...' : 'Post Answer'}
                </button>
              </div>
            </form>

            {/* Answers List */}
            <div className="space-y-4 sm:space-y-6">
              {commentsFromRedux.length === 0 ? (
                <div className="text-center py-8 sm:py-12">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-green-100 to-teal-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                    <MessageSquare className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
                  </div>
                  <h3 className="text-sm sm:text-lg font-semibold text-foreground mb-1 sm:mb-2">No answers yet</h3>
                  <p className="text-xs sm:text-base text-muted-foreground">Be the first to answer this question!</p>
                </div>
              ) : (
                commentsFromRedux.map((comment) => (
                  <div
                    key={comment._id}
                    className="border-b-2 border-border last:border-0 pb-4 sm:pb-6 last:pb-0"
                  >
                    <div className="flex gap-2 sm:gap-4">
                      {/* Vote Section for Comment */}
                      <div className="flex flex-col items-center gap-1 sm:gap-2 min-w-[35px] sm:min-w-[50px]">
                        <button
                          onClick={() => handleVoteComment(comment._id, 'upvote')}
                          className="p-1 sm:p-2 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                        >
                          <ThumbsUp
                            className={`w-4 h-4 sm:w-5 sm:h-5 ${comment.upvotes?.includes(user?._id)
                              ? 'text-green-600 fill-green-600'
                              : 'text-muted-foreground'
                              }`}
                          />
                        </button>
                        <span className="text-sm sm:text-lg font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
                          {(comment.upvotes?.length || 0) - (comment.downvotes?.length || 0)}
                        </span>
                        <button
                          onClick={() => handleVoteComment(comment._id, 'downvote')}
                          className="p-1 sm:p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        >
                          <ThumbsDown
                            className={`w-4 h-4 sm:w-5 sm:h-5 ${comment.downvotes?.includes(user?._id)
                              ? 'text-red-600 fill-red-600'
                              : 'text-muted-foreground'
                              }`}
                          />
                        </button>

                        {comment.isAcceptedAnswer && (
                          <div className="mt-1 sm:mt-2">
                            <Award className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-green-600 fill-green-600" />
                          </div>
                        )}
                      </div>

                      {/* Comment Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2 sm:mb-3">
                          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                            <div className="w-7 h-7 sm:w-10 sm:h-10 bg-gradient-to-r from-green-600 via-teal-600 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-xs sm:text-base shadow-md flex-shrink-0">
                              {comment.author?.name?.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-foreground text-xs sm:text-base truncate">{comment.author?.name}</p>
                              <p className="text-[10px] sm:text-sm text-muted-foreground">{formatDate(comment.createdAt)}</p>
                            </div>
                          </div>
                        </div>

                        <p className="text-xs sm:text-sm lg:text-base text-muted-foreground whitespace-pre-wrap leading-relaxed mb-2 sm:mb-4">
                          {comment.content}
                        </p>

                        {/* Comment Actions */}
                        <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
                          {postFromRedux.author?._id === user?._id && (
                            <button
                              onClick={() => handleAcceptAnswer(comment._id)}
                              className={`text-[11px] sm:text-sm font-semibold flex items-center gap-1 transition-all px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg ${comment.isAcceptedAnswer
                                ? 'bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 text-green-700 dark:text-green-400 hover:from-green-200 hover:to-emerald-200 dark:hover:from-green-800/40 dark:hover:to-emerald-800/40 border border-green-200 dark:border-green-800/30'
                                : 'text-green-600 dark:text-green-500 hover:text-green-700 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 border border-green-200 dark:border-green-800/30'
                                }`}
                            >
                              <CheckCircle className={`w-3 h-3 sm:w-4 sm:h-4 ${comment.isAcceptedAnswer ? 'fill-green-700 dark:fill-green-600' : ''}`} />
                              <span className="hidden xs:inline">{comment.isAcceptedAnswer ? 'Accepted ✓' : 'Accept Answer'}</span>
                            </button>
                          )}

                          {comment.isAcceptedAnswer && postFromRedux.author?._id !== user?._id && (
                            <div className="text-[11px] sm:text-sm text-green-700 dark:text-green-400 font-semibold flex items-center gap-1 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 px-2 sm:px-3 py-1 rounded-full border border-green-200 dark:border-green-800/30">
                              <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 fill-green-700 dark:fill-green-600" />
                              <span className="hidden xs:inline">Accepted Answer</span>
                            </div>
                          )}

                          <button
                            onClick={() => setReplyingTo(replyingTo === comment._id ? null : comment._id)}
                            className="text-[11px] sm:text-sm text-teal-600 dark:text-teal-500 hover:text-teal-700 dark:hover:text-teal-400 font-semibold px-2 sm:px-3 py-1 sm:py-1.5 hover:bg-teal-50 dark:hover:bg-teal-900/20 rounded-lg transition-all"
                          >
                            {replyingTo === comment._id ? 'Cancel' : 'Reply'}
                          </button>
                        </div>

                        {/* Reply Form */}
                        {replyingTo === comment._id && (
                          <div className="mt-3 sm:mt-4 ml-0 pl-3 sm:pl-4 border-l-2 border-green-200">
                            <textarea
                              value={replyText[comment._id] || ''}
                              onChange={(e) => setReplyText({ ...replyText, [comment._id]: e.target.value })}
                              placeholder="Write your reply..."
                              rows={3}
                              className="w-full px-3 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm bg-background border-2 border-border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none transition-all hover:border-gray-300 dark:hover:border-gray-600 text-foreground"
                            />
                            <div className="flex justify-end gap-2 mt-2">
                              <button
                                onClick={() => setReplyingTo(null)}
                                className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-muted-foreground hover:text-foreground font-semibold hover:bg-secondary rounded-lg transition-all"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => handleSubmitReply(comment._id)}
                                disabled={!replyText[comment._id]?.trim()}
                                className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-xl hover:from-green-700 hover:to-teal-700 transition-all font-semibold shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                Post Reply
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Nested Replies */}
                        {comment.replies && comment.replies.length > 0 && (
                          <div className="mt-3 sm:mt-4 ml-0 pl-3 sm:pl-6 border-l-2 border-green-200 dark:border-green-800/30 space-y-3 sm:space-y-4">
                            {comment.replies.map((reply: any) => (
                              <NestedComment
                                key={reply._id}
                                comment={reply}
                                depth={1}
                                onVote={handleVoteComment}
                                onReply={handleSubmitReply}
                                replyingTo={replyingTo}
                                setReplyingTo={setReplyingTo}
                                replyText={replyText}
                                setReplyText={setReplyText}
                                userId={user?._id}
                                formatDate={formatDate}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
