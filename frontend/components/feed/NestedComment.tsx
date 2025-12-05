'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Heart, MessageCircle, MoreVertical, Trash2, Edit2, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

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

interface NestedCommentProps {
  comment: CommentType;
  postId: string;
  currentUserId: string;
  depth?: number;
  onDelete: (commentId: string) => void;
  onUpdate: (commentId: string, content: string) => void;
  onReply: (parentCommentId: string, content: string) => void;
  onLike: (commentId: string) => void;
  onLoadReplies?: (commentId: string) => void;
}

export default function NestedComment({
  comment,
  postId,
  currentUserId,
  depth = 0,
  onDelete,
  onUpdate,
  onReply,
  onLike,
  onLoadReplies,
}: NestedCommentProps) {
  const router = useRouter();
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [showMenu, setShowMenu] = useState(false);
  const [showReplies, setShowReplies] = useState(depth < 2); // Auto-show first 2 levels

  const isOwner = comment.user._id === currentUserId;
  const hasLiked = comment.likes?.includes(currentUserId);
  
  const maxDepth = 10; // Maximum nesting level
  const indentClass = depth > 0 ? 'ml-8 pl-4 border-l-2 border-gray-200' : '';

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (date: string) => {
    const now = new Date();
    const commentDate = new Date(date);
    const diffInSeconds = Math.floor((now.getTime() - commentDate.getTime()) / 1000);

    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    
    return commentDate.toLocaleDateString();
  };

  const handleReply = () => {
    if (!replyContent.trim()) return;
    onReply(comment._id, replyContent);
    setReplyContent('');
    setShowReplyBox(false);
    setShowReplies(true); // Show replies after adding one
  };

  const handleEdit = () => {
    if (!editContent.trim()) return;
    onUpdate(comment._id, editContent);
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this comment and all its replies?')) {
      onDelete(comment._id);
    }
  };

  const toggleReplies = () => {
    if (!showReplies && comment.replyCount > 0 && (!comment.replies || comment.replies.length === 0)) {
      // Load replies from server if not loaded yet
      onLoadReplies?.(comment._id);
    }
    setShowReplies(!showReplies);
  };

  return (
    <div className={`py-3 ${indentClass}`}>
      <div className="flex gap-3">
        {/* Avatar */}
        <div className="flex-shrink-0">
          <div 
            onClick={() => router.push(`/profile/${comment.user._id}`)}
            className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold cursor-pointer hover:opacity-80 transition-opacity"
          >
            {comment.user.profilePicture ? (
              <img
                src={comment.user.profilePicture}
                alt={comment.user.name}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              getInitials(comment.user.name)
            )}
          </div>
        </div>

        {/* Comment Content */}
        <div className="flex-1 min-w-0">
          <div className="bg-gray-100 rounded-lg px-3 py-2">
            {/* Author & Time */}
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span 
                  onClick={() => router.push(`/profile/${comment.user._id}`)}
                  className="font-semibold text-sm text-gray-900 cursor-pointer hover:underline"
                >
                  {comment.user.name}
                </span>
                {comment.user.level && (
                  <span className="text-xs bg-purple-100 text-purple-600 px-1.5 py-0.5 rounded">
                    Lv {comment.user.level}
                  </span>
                )}
                <span className="text-xs text-gray-500">{formatDate(comment.createdAt)}</span>
                {comment.isEdited && (
                  <span className="text-xs text-gray-400">(edited)</span>
                )}
              </div>

              {/* Menu for owner */}
              {isOwner && (
                <div className="relative">
                  <button
                    onClick={() => setShowMenu(!showMenu)}
                    className="p-1 hover:bg-gray-200 rounded transition-colors"
                  >
                    <MoreVertical className="w-4 h-4 text-gray-600" />
                  </button>
                  {showMenu && (
                    <div className="absolute right-0 mt-1 w-32 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                      <button
                        onClick={() => {
                          setIsEditing(true);
                          setShowMenu(false);
                        }}
                        className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
                      >
                        <Edit2 className="w-3 h-3" />
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          handleDelete();
                          setShowMenu(false);
                        }}
                        className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 text-red-600 flex items-center gap-2"
                      >
                        <Trash2 className="w-3 h-3" />
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Comment Text */}
            {isEditing ? (
              <div className="mt-2">
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={2}
                  maxLength={2000}
                />
                <div className="flex gap-2 mt-2">
                  <Button size="sm" onClick={handleEdit}>
                    Save
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false);
                      setEditContent(comment.content);
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-800 whitespace-pre-wrap break-words">
                {comment.content}
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-4 mt-1 ml-1">
            <button
              onClick={() => onLike(comment._id)}
              className={`flex items-center gap-1 text-xs ${
                hasLiked ? 'text-red-600 font-semibold' : 'text-gray-600 hover:text-red-600'
              } transition-colors`}
            >
              <Heart className={`w-3.5 h-3.5 ${hasLiked ? 'fill-current' : ''}`} />
              {comment.likeCount > 0 && <span>{comment.likeCount}</span>}
            </button>

            {depth < maxDepth && (
              <button
                onClick={() => setShowReplyBox(!showReplyBox)}
                className="flex items-center gap-1 text-xs text-gray-600 hover:text-blue-600 transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                Reply
              </button>
            )}

            {comment.replyCount > 0 && (
              <button
                onClick={toggleReplies}
                className="text-xs text-blue-600 hover:underline font-medium"
              >
                {showReplies ? 'Hide' : 'Show'} {comment.replyCount} {comment.replyCount === 1 ? 'reply' : 'replies'}
              </button>
            )}
          </div>

          {/* Reply Input Box */}
          {showReplyBox && (
            <div className="mt-3 flex gap-2">
              <div className="flex-shrink-0 w-6 h-6 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full"></div>
              <div className="flex-1">
                <textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="Write a reply..."
                  className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={2}
                  maxLength={2000}
                />
                <div className="flex gap-2 mt-2">
                  <Button size="sm" onClick={handleReply} disabled={!replyContent.trim()}>
                    <Send className="w-3 h-3 mr-1" />
                    Reply
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setShowReplyBox(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Nested Replies */}
          {showReplies && comment.replies && comment.replies.length > 0 && (
            <div className="mt-2">
              {comment.replies.map((reply) => (
                <NestedComment
                  key={reply._id}
                  comment={reply}
                  postId={postId}
                  currentUserId={currentUserId}
                  depth={depth + 1}
                  onDelete={onDelete}
                  onUpdate={onUpdate}
                  onReply={onReply}
                  onLike={onLike}
                  onLoadReplies={onLoadReplies}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
