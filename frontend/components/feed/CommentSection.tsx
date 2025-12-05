'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { postAPI } from '@/services/api.service';
import { toast } from 'sonner';
import { Send } from 'lucide-react';
import NestedComment from './NestedComment';

interface CommentUser {
  _id: string;
  name: string;
  profilePicture?: string;
  level?: number;
}

interface CommentType {
  _id: string;
  user: CommentUser;
  content: string;
  likes: string[];
  replies: CommentType[];
  likeCount: number;
  replyCount: number;
  isEdited: boolean;
  createdAt: string;
}

interface CommentSectionProps {
  postId: string;
}

export default function CommentSection({ postId }: CommentSectionProps) {
  const { user } = useAuthStore();
  const [comments, setComments] = useState<CommentType[]>([]);
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadComments();
  }, [postId]);

  const loadComments = async () => {
    try {
      setLoading(true);
      const response = await postAPI.getComments(postId);
      setComments(response.data.data || []);
    } catch (error) {
      console.error('Failed to load comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!commentText.trim()) return;

    try {
      setIsSubmitting(true);
      const response = await postAPI.addNestedComment(postId, commentText.trim());
      setComments([response.data.data, ...comments]);
      setCommentText('');
      toast.success('Comment added');
    } catch (error: any) {
      console.error('Comment error:', error.response?.data || error);
      toast.error(error.response?.data?.message || 'Failed to add comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReply = async (parentCommentId: string, content: string) => {
    try {
      const response = await postAPI.addNestedComment(postId, content, parentCommentId);
      // Refresh comments to get updated replies
      loadComments();
      toast.success('Reply added');
    } catch (error: any) {
      console.error('Reply error:', error.response?.data || error);
      toast.error(error.response?.data?.message || 'Failed to add reply');
    }
  };

  const handleUpdateComment = async (commentId: string, content: string) => {
    try {
      await postAPI.updateComment(commentId, content);
      loadComments();
      toast.success('Comment updated');
    } catch (error) {
      toast.error('Failed to update comment');
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await postAPI.deleteNestedComment(commentId);
      loadComments();
      toast.success('Comment deleted');
    } catch (error) {
      toast.error('Failed to delete comment');
    }
  };

  const handleLikeComment = async (commentId: string) => {
    try {
      await postAPI.likeComment(commentId);
      loadComments();
    } catch (error) {
      toast.error('Failed to like comment');
    }
  };

  const handleLoadReplies = async (commentId: string) => {
    try {
      const response = await postAPI.getCommentReplies(commentId);
      // Update the specific comment with loaded replies
      setComments(prevComments =>
        prevComments.map(comment =>
          comment._id === commentId
            ? { ...comment, replies: response.data.data || [] }
            : comment
        )
      );
    } catch (error) {
      toast.error('Failed to load replies');
    }
  };

  if (!user) return null;

  return (
    <div className="p-4 bg-gray-50 border-t">
      {/* Add Comment Input */}
      <div className="mb-4">
        <div className="flex gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
            {user.profilePicture ? (
              <img
                src={user.profilePicture}
                alt={user.name}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              user.name?.charAt(0)?.toUpperCase() || 'U'
            )}
          </div>
          <div className="flex-1">
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Write a comment..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={2}
              maxLength={2000}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleAddComment();
                }
              }}
            />
            <div className="flex justify-between items-center mt-2">
              <span className="text-xs text-gray-500">
                {commentText.length}/2000
              </span>
              <button
                onClick={handleAddComment}
                disabled={isSubmitting || !commentText.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm"
              >
                <Send className="w-4 h-4" />
                {isSubmitting ? 'Posting...' : 'Comment'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Comments List */}
      <div className="space-y-2">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : comments.length === 0 ? (
          <p className="text-center text-gray-500 text-sm py-8">
            No comments yet. Be the first to comment!
          </p>
        ) : (
          comments.map((comment) => (
            <NestedComment
              key={comment._id}
              comment={comment}
              postId={postId}
              currentUserId={user._id}
              onDelete={handleDeleteComment}
              onUpdate={handleUpdateComment}
              onReply={handleReply}
              onLike={handleLikeComment}
              onLoadReplies={handleLoadReplies}
            />
          ))
        )}
      </div>
    </div>
  );
}
