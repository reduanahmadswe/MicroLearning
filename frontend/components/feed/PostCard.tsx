'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { postAPI } from '@/services/api.service';
import { toast } from 'sonner';
import {
  Heart,
  MessageCircle,
  Share2,
  MoreVertical,
  Trash2,
  Edit,
  Globe,
  Users,
  Lock,
  Lightbulb,
  ThumbsUp,
  PartyPopper,
  Sparkles,
  Award,
} from 'lucide-react';
import ReactionButtons from '@/components/feed/ReactionButtons';
import CommentSection from '@/components/feed/CommentSection';

interface IReaction {
  user: string;
  type: 'like' | 'love' | 'celebrate' | 'insightful' | 'curious';
  createdAt: Date;
}

interface IComment {
  _id: string;
  user: {
    _id: string;
    name: string;
    profilePicture?: string;
  };
  content: string;
  createdAt: Date;
}

interface IPost {
  _id: string;
  user: {
    _id: string;
    name: string;
    profilePicture?: string;
    level?: number;
  };
  content: string;
  images?: string[];
  video?: string;
  type: 'user' | 'achievement' | 'milestone';
  visibility: 'public' | 'friends' | 'private';
  reactions: IReaction[];
  comments: IComment[];
  shares: string[];
  sharedPost?: IPost;
  metadata?: {
    badgeId?: string;
    levelUp?: number;
    milestoneType?: string;
  };
  reactionCount: number;
  commentCount: number;
  shareCount: number;
  createdAt: Date;
  updatedAt: Date;
}

interface PostCardProps {
  post: IPost;
  onDelete: (postId: string) => void;
  onUpdate: (updatedPost: IPost) => void;
}

export default function PostCard({ post, onDelete, onUpdate }: PostCardProps) {
  const { user } = useAuthStore();
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [shareMessage, setShareMessage] = useState('');

  const isOwner = user?._id === post.user._id;

  const getVisibilityIcon = () => {
    switch (post.visibility) {
      case 'public':
        return <Globe className="w-4 h-4 text-gray-500" />;
      case 'friends':
        return <Users className="w-4 h-4 text-gray-500" />;
      case 'private':
        return <Lock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getPostTypeIcon = () => {
    if (post.type === 'achievement') {
      return <Award className="w-5 h-5 text-yellow-500" />;
    }
    if (post.type === 'milestone') {
      return <Sparkles className="w-5 h-5 text-purple-500" />;
    }
    return null;
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this post?')) return;

    try {
      await postAPI.deletePost(post._id);
      onDelete(post._id);
    } catch (error) {
      toast.error('Failed to delete post');
    }
  };

  const handleShare = async () => {
    try {
      const response = await postAPI.sharePost(post._id, shareMessage || undefined);
      toast.success('Post shared successfully!');
      setIsSharing(false);
      setShareMessage('');
      
      // Update share count
      onUpdate({
        ...post,
        shareCount: post.shareCount + 1,
        shares: [...post.shares, user!._id],
      });
    } catch (error) {
      toast.error('Failed to share post');
    }
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return new Date(date).toLocaleDateString();
  };

  const getEmbedUrl = (url: string) => {
    if (!url) return url;

    // YouTube URL patterns
    const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(youtubeRegex);
    
    if (match && match[1]) {
      return `https://www.youtube.com/embed/${match[1]}`;
    }

    // If already an embed URL, return as is
    if (url.includes('youtube.com/embed/')) {
      return url;
    }

    // For other videos, return as is
    return url;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="p-4 flex items-start justify-between">
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <div 
            onClick={() => router.push(`/profile/${post.user._id}`)}
            className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
          >
            {post.user.profilePicture ? (
              <img
                src={post.user.profilePicture}
                alt={post.user.name}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              post.user.name.charAt(0).toUpperCase()
            )}
          </div>

          {/* User Info */}
          <div>
            <div className="flex items-center gap-2">
              <h3 
                onClick={() => router.push(`/profile/${post.user._id}`)}
                className="font-semibold text-gray-900 cursor-pointer hover:underline"
              >
                {post.user.name}
              </h3>
              {post.user.level && (
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                  Lv {post.user.level}
                </span>
              )}
              {getPostTypeIcon()}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>{formatDate(post.createdAt)}</span>
              <span>•</span>
              {getVisibilityIcon()}
            </div>
          </div>
        </div>

        {/* Menu */}
        {isOwner && (
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <MoreVertical className="w-5 h-5 text-gray-500" />
            </button>

            {showMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                <button
                  onClick={handleDelete}
                  className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 flex items-center gap-2 rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Post
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Achievement/Milestone Badge */}
      {post.type === 'achievement' && post.metadata?.badgeId && (
        <div className="px-4 pb-3">
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-3 flex items-center gap-2">
            <Award className="w-5 h-5 text-yellow-600" />
            <span className="text-sm font-medium text-yellow-800">Earned a new badge!</span>
          </div>
        </div>
      )}

      {post.type === 'milestone' && post.metadata?.levelUp && (
        <div className="px-4 pb-3">
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-3 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            <span className="text-sm font-medium text-purple-800">
              Level Up! Reached Level {post.metadata.levelUp}
            </span>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="px-4 pb-3">
        <p className="text-gray-800 whitespace-pre-wrap">{post.content}</p>
      </div>

      {/* Images */}
      {post.images && post.images.length > 0 && (
        <div className="px-4 pb-3">
          <div className={`grid gap-2 ${post.images.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
            {post.images.map((img, idx) => (
              <img
                key={idx}
                src={img}
                alt={`Post image ${idx + 1}`}
                className="w-full h-64 object-cover rounded-lg"
              />
            ))}
          </div>
        </div>
      )}

      {/* Video */}
      {post.video && (
        <div className="px-4 pb-3">
          <div className="aspect-video rounded-lg overflow-hidden bg-gray-900">
            <iframe
              src={getEmbedUrl(post.video)}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}

      {/* Shared Post */}
      {post.sharedPost && post.sharedPost.user && (
        <div className="mx-4 mb-3 border border-gray-300 rounded-lg p-3 bg-gray-50">
          <div className="flex items-center gap-2 mb-2">
            <div 
              onClick={() => router.push(`/profile/${post.sharedPost?.user?._id}`)}
              className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold cursor-pointer hover:opacity-80 transition-opacity"
            >
              {post.sharedPost.user?.profilePicture ? (
                <img
                  src={post.sharedPost.user.profilePicture}
                  alt={post.sharedPost.user.name}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                post.sharedPost.user?.name?.charAt(0)?.toUpperCase() || 'U'
              )}
            </div>
            <div>
              <p 
                onClick={() => router.push(`/profile/${post.sharedPost?.user?._id}`)}
                className="font-semibold text-sm text-gray-900 cursor-pointer hover:underline"
              >
                {post.sharedPost.user?.name || 'Unknown'}
              </p>
              <p className="text-xs text-gray-500">{formatDate(post.sharedPost.createdAt)}</p>
            </div>
          </div>
          <p className="text-sm text-gray-700">{post.sharedPost.content}</p>
        </div>
      )}

      {/* Stats */}
      <div className="px-4 pb-3 flex items-center justify-between text-sm text-gray-500">
        <div className="flex items-center gap-4">
          {post.reactionCount > 0 && (
            <span>{post.reactionCount} {post.reactionCount === 1 ? 'reaction' : 'reactions'}</span>
          )}
        </div>
        <div className="flex items-center gap-4">
          {post.commentCount > 0 && <span>{post.commentCount} comments</span>}
          {post.shareCount > 0 && <span>{post.shareCount} shares</span>}
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-200" />

      {/* Action Buttons */}
      <div className="px-4 py-2">
        <ReactionButtons post={post} onUpdate={onUpdate} />
      </div>

      <div className="border-t border-gray-200" />

      <div className="px-4 py-2 flex items-center gap-2">
        <button
          onClick={() => setShowComments(!showComments)}
          className="flex-1 flex items-center justify-center gap-2 py-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <MessageCircle className="w-5 h-5 text-gray-600" />
          <span className="text-gray-700 font-medium">Comment</span>
        </button>

        <button
          onClick={() => setIsSharing(!isSharing)}
          className="flex-1 flex items-center justify-center gap-2 py-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Share2 className="w-5 h-5 text-gray-600" />
          <span className="text-gray-700 font-medium">Share</span>
        </button>
      </div>

      {/* Share Form */}
      {isSharing && (
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <textarea
            value={shareMessage}
            onChange={(e) => setShareMessage(e.target.value)}
            placeholder="Add a message (optional)..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            rows={2}
          />
          <div className="flex items-center gap-2 mt-2">
            <button
              onClick={handleShare}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Share Now
            </button>
            <button
              onClick={() => {
                setIsSharing(false);
                setShareMessage('');
              }}
              className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Comments Section */}
      {showComments && (
        <div className="border-t border-gray-200">
          <CommentSection postId={post._id} />
        </div>
      )}
    </div>
  );
}
