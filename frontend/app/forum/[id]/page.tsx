'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
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
    <div className="space-y-4">
      <div className="flex gap-3">
        {/* Vote Section for Nested Comment */}
        <div className="flex flex-col items-center gap-1 min-w-[40px]">
          <button
            onClick={() => onVote(comment._id, 'upvote')}
            className="p-1.5 hover:bg-green-50 rounded-lg transition-colors"
          >
            <ThumbsUp 
              className={`w-4 h-4 ${
                comment.upvotes?.includes(userId) 
                  ? 'text-green-600 fill-green-600' 
                  : 'text-gray-400'
              }`} 
            />
          </button>
          <span className="text-sm font-bold text-gray-900">
            {(comment.upvotes?.length || 0) - (comment.downvotes?.length || 0)}
          </span>
          <button
            onClick={() => onVote(comment._id, 'downvote')}
            className="p-1.5 hover:bg-red-50 rounded-lg transition-colors"
          >
            <ThumbsDown 
              className={`w-4 h-4 ${
                comment.downvotes?.includes(userId) 
                  ? 'text-red-600 fill-red-600' 
                  : 'text-gray-400'
              }`} 
            />
          </button>
          
          {comment.isAcceptedAnswer && (
            <div className="mt-1">
              <Award className="w-5 h-5 text-green-600 fill-green-600" />
            </div>
          )}
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              {comment.author?.name?.charAt(0).toUpperCase()}
            </div>
            <span className="font-semibold text-gray-900 text-sm">{comment.author?.name}</span>
            <span className="text-xs text-gray-500">{formatDate(comment.createdAt)}</span>
          </div>
          
          <p className="text-gray-700 text-sm leading-relaxed mb-2">{comment.content}</p>
          
          {/* Reply Button */}
          {!isMaxDepth && (
            <button
              onClick={() => setReplyingTo(replyingTo === comment._id ? null : comment._id)}
              className="text-xs text-blue-600 hover:text-blue-700 font-medium"
            >
              {replyingTo === comment._id ? 'Cancel' : 'Reply'}
            </button>
          )}

          {/* Reply Form */}
          {replyingTo === comment._id && (
            <div className="mt-3 pl-0">
              <textarea
                value={replyText[comment._id] || ''}
                onChange={(e) => setReplyText({ ...replyText, [comment._id]: e.target.value })}
                placeholder="Write your reply..."
                rows={2}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
              <div className="flex justify-end gap-2 mt-2">
                <button
                  onClick={() => setReplyingTo(null)}
                  className="px-3 py-1.5 text-xs text-gray-600 hover:text-gray-800 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={() => onReply(comment._id)}
                  disabled={!replyText[comment._id]?.trim()}
                  className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Post Reply
                </button>
              </div>
            </div>
          )}

          {/* Recursive Nested Replies */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-3 pl-4 border-l-2 border-gray-200 space-y-3">
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

  const [post, setPost] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState<{ [key: string]: string }>({});
  const [viewCounted, setViewCounted] = useState(false);

  useEffect(() => {
    if (postId) {
      loadPost();
      loadComments();
    }
  }, [postId]);

  const loadPost = async () => {
    try {
      setLoading(true);
      
      // Check if this post view has already been counted for this user
      const viewedPosts = JSON.parse(localStorage.getItem('viewedPosts') || '[]');
      const alreadyViewed = viewedPosts.includes(postId);
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/forum/posts/${postId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to load post');
      const data = await response.json();
      setPost(data.data);
      
      // Only mark as viewed if not already in localStorage
      if (!alreadyViewed && !viewCounted) {
        // Add to viewed posts in localStorage
        viewedPosts.push(postId);
        localStorage.setItem('viewedPosts', JSON.stringify(viewedPosts));
        setViewCounted(true);
      }
    } catch (error: any) {
      toast.error('Failed to load post');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadComments = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/forum/posts/${postId}/comments`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setComments(data.data || []);
      }
    } catch (error: any) {
      console.error('Failed to load comments:', error);
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
      loadPost();
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
      loadComments();
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
      
      loadComments();
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
      if (post?.group?._id) {
        try {
          const joinResponse = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/forum/groups/${post.group._id}/join`,
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
            console.log('Successfully joined group');
          }
        } catch (joinError) {
          // Ignore if already a member
          console.log('Group join attempt:', joinError);
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
      loadComments();
      loadPost();
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
      loadComments();
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading post...</p>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-slate-50">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Post not found</h2>
          <Link href="/forum" className="text-blue-600 hover:text-blue-700 font-medium">
            ← Back to Forum
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link 
            href="/forum"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Forum
          </Link>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Main Post */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="p-6">
            <div className="flex gap-6">
              {/* Vote Section */}
              <div className="flex flex-col items-center gap-2 min-w-[60px]">
                <button
                  onClick={() => handleVotePost('upvote')}
                  className="p-2 hover:bg-green-50 rounded-lg transition-colors"
                >
                  <ThumbsUp 
                    className={`w-6 h-6 ${
                      post.upvotes?.includes(user?._id) 
                        ? 'text-green-600 fill-green-600' 
                        : 'text-gray-400'
                    }`} 
                  />
                </button>
                <span className="text-2xl font-bold text-gray-900">
                  {(post.upvotes?.length || 0) - (post.downvotes?.length || 0)}
                </span>
                <button
                  onClick={() => handleVotePost('downvote')}
                  className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <ThumbsDown 
                    className={`w-6 h-6 ${
                      post.downvotes?.includes(user?._id) 
                        ? 'text-red-600 fill-red-600' 
                        : 'text-gray-400'
                    }`} 
                  />
                </button>
              </div>

              {/* Post Content */}
              <div className="flex-1">
                {/* Badges */}
                <div className="flex items-center gap-2 flex-wrap mb-4">
                  {post.isSolved && (
                    <span className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                      <CheckCircle className="w-3 h-3" />
                      Solved
                    </span>
                  )}
                  {post.isHelpNeeded && !post.isSolved && (
                    <span className="flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">
                      <AlertCircle className="w-3 h-3" />
                      Help Needed
                    </span>
                  )}
                  {post.course && (
                    <span className="flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                      <BookOpen className="w-3 h-3" />
                      {post.course.title}
                    </span>
                  )}
                </div>

                {/* Title */}
                <h1 className="text-3xl font-bold text-gray-900 mb-4">{post.title}</h1>

                {/* Content */}
                <div className="prose max-w-none mb-6">
                  <p className="text-gray-700 text-lg whitespace-pre-wrap leading-relaxed">{post.content}</p>
                </div>

                {/* Tags */}
                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-6">
                    {post.tags.map((tag: string, idx: number) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-lg"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Post Meta */}
                <div className="flex items-center gap-6 pt-6 border-t border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {post.author?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{post.author?.name}</p>
                      <p className="text-sm text-gray-500">
                        {post.author?.role === 'instructor' && (
                          <span className="text-blue-600 font-medium">Instructor</span>
                        )}
                        {post.author?.role !== 'instructor' && 'Member'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-500 ml-auto">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{formatDate(post.createdAt)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      <span>{post.viewCount || 0} views</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Answers Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <MessageSquare className="w-6 h-6 text-blue-600" />
              {comments.length} {comments.length === 1 ? 'Answer' : 'Answers'}
            </h2>
          </div>

          <div className="p-6">
            {/* Answer Form */}
            <form onSubmit={handleSubmitComment} className="mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Answer
              </label>
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write your answer here..."
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
              <div className="flex justify-end mt-3">
                <button
                  type="submit"
                  disabled={submitting || !newComment.trim()}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all flex items-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                  {submitting ? 'Posting...' : 'Post Answer'}
                </button>
              </div>
            </form>

            {/* Answers List */}
            <div className="space-y-6">
              {comments.length === 0 ? (
                <div className="text-center py-12">
                  <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No answers yet</h3>
                  <p className="text-gray-600">Be the first to answer this question!</p>
                </div>
              ) : (
                comments.map((comment) => (
                  <div
                    key={comment._id}
                    className="border-b border-gray-200 last:border-0 pb-6 last:pb-0"
                  >
                    <div className="flex gap-4">
                      {/* Vote Section for Comment */}
                      <div className="flex flex-col items-center gap-2 min-w-[50px]">
                        <button
                          onClick={() => handleVoteComment(comment._id, 'upvote')}
                          className="p-2 hover:bg-green-50 rounded-lg transition-colors"
                        >
                          <ThumbsUp 
                            className={`w-5 h-5 ${
                              comment.upvotes?.includes(user?._id) 
                                ? 'text-green-600 fill-green-600' 
                                : 'text-gray-400'
                            }`} 
                          />
                        </button>
                        <span className="text-lg font-bold text-gray-900">
                          {(comment.upvotes?.length || 0) - (comment.downvotes?.length || 0)}
                        </span>
                        <button
                          onClick={() => handleVoteComment(comment._id, 'downvote')}
                          className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <ThumbsDown 
                            className={`w-5 h-5 ${
                              comment.downvotes?.includes(user?._id) 
                                ? 'text-red-600 fill-red-600' 
                                : 'text-gray-400'
                            }`} 
                          />
                        </button>
                        
                        {comment.isAcceptedAnswer && (
                          <div className="mt-2">
                            <Award className="w-6 h-6 text-green-600 fill-green-600" />
                          </div>
                        )}
                      </div>

                      {/* Comment Content */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                              {comment.author?.name?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">{comment.author?.name}</p>
                              <p className="text-sm text-gray-500">{formatDate(comment.createdAt)}</p>
                            </div>
                          </div>
                        </div>

                        <p className="text-gray-700 whitespace-pre-wrap leading-relaxed mb-4">
                          {comment.content}
                        </p>

                        {/* Comment Actions */}
                        <div className="flex items-center gap-4">
                          {post.author?._id === user?._id && (
                            <button 
                              onClick={() => handleAcceptAnswer(comment._id)}
                              className={`text-sm font-medium flex items-center gap-1 transition-colors px-3 py-1.5 rounded-lg ${
                                comment.isAcceptedAnswer
                                  ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                  : 'text-green-600 hover:text-green-700 hover:bg-green-50'
                              }`}
                            >
                              <CheckCircle className={`w-4 h-4 ${comment.isAcceptedAnswer ? 'fill-green-700' : ''}`} />
                              {comment.isAcceptedAnswer ? 'Accepted ✓' : 'Accept Answer'}
                            </button>
                          )}
                          
                          {comment.isAcceptedAnswer && post.author?._id !== user?._id && (
                            <div className="text-sm text-green-700 font-semibold flex items-center gap-1 bg-green-50 px-3 py-1 rounded-full">
                              <CheckCircle className="w-4 h-4 fill-green-700" />
                              Accepted Answer
                            </div>
                          )}
                          
                          <button
                            onClick={() => setReplyingTo(replyingTo === comment._id ? null : comment._id)}
                            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                          >
                            {replyingTo === comment._id ? 'Cancel' : 'Reply'}
                          </button>
                        </div>

                        {/* Reply Form */}
                        {replyingTo === comment._id && (
                          <div className="mt-4 ml-0 pl-4 border-l-2 border-blue-200">
                            <textarea
                              value={replyText[comment._id] || ''}
                              onChange={(e) => setReplyText({ ...replyText, [comment._id]: e.target.value })}
                              placeholder="Write your reply..."
                              rows={3}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                            />
                            <div className="flex justify-end gap-2 mt-2">
                              <button
                                onClick={() => setReplyingTo(null)}
                                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => handleSubmitReply(comment._id)}
                                disabled={!replyText[comment._id]?.trim()}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                Post Reply
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Nested Replies */}
                        {comment.replies && comment.replies.length > 0 && (
                          <div className="mt-4 ml-0 pl-6 border-l-2 border-gray-200 space-y-4">
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
