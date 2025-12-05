'use client';

import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { postAPI } from '@/services/api.service';
import { toast } from 'sonner';
import { Heart, ThumbsUp, PartyPopper, Lightbulb, Sparkles } from 'lucide-react';

interface IReaction {
  user: string;
  type: 'like' | 'love' | 'celebrate' | 'insightful' | 'curious';
  createdAt: Date;
}

interface IPost {
  _id: string;
  reactions: IReaction[];
  reactionCount: number;
}

interface ReactionButtonsProps {
  post: IPost;
  onUpdate: (updatedPost: any) => void;
}

const reactionIcons = {
  like: { icon: ThumbsUp, label: 'Like', color: 'text-blue-600', bgColor: 'bg-blue-50' },
  love: { icon: Heart, label: 'Love', color: 'text-red-600', bgColor: 'bg-red-50' },
  celebrate: { icon: PartyPopper, label: 'Celebrate', color: 'text-yellow-600', bgColor: 'bg-yellow-50' },
  insightful: { icon: Lightbulb, label: 'Insightful', color: 'text-green-600', bgColor: 'bg-green-50' },
  curious: { icon: Sparkles, label: 'Curious', color: 'text-purple-600', bgColor: 'bg-purple-50' },
};

export default function ReactionButtons({ post, onUpdate }: ReactionButtonsProps) {
  const { user } = useAuthStore();
  const [showReactions, setShowReactions] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Find user's current reaction
  const userReaction = post.reactions.find((r) => r.user === user?._id);

  const handleReaction = async (type: 'like' | 'love' | 'celebrate' | 'insightful' | 'curious') => {
    if (isUpdating) return;

    try {
      setIsUpdating(true);
      setShowReactions(false);

      // If user already has this reaction, remove it
      if (userReaction?.type === type) {
        await postAPI.removeReaction(post._id);
        onUpdate({
          ...post,
          reactions: post.reactions.filter((r) => r.user !== user?._id),
          reactionCount: post.reactionCount - 1,
        });
      } else {
        // Add or change reaction
        const response = await postAPI.addReaction(post._id, type);
        onUpdate(response.data.data);
      }
    } catch (error) {
      toast.error('Failed to update reaction');
    } finally {
      setIsUpdating(false);
    }
  };

  const getCurrentReactionIcon = () => {
    if (!userReaction) return null;
    const config = reactionIcons[userReaction.type];
    const Icon = config.icon;
    return <Icon className={`w-5 h-5 ${config.color}`} />;
  };

  const getCurrentReactionLabel = () => {
    if (!userReaction) return 'React';
    return reactionIcons[userReaction.type].label;
  };

  return (
    <div className="relative">
      {/* Main Button */}
      <button
        onClick={() => setShowReactions(!showReactions)}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
          userReaction
            ? `${reactionIcons[userReaction.type].bgColor} ${reactionIcons[userReaction.type].color} font-medium`
            : 'hover:bg-gray-100 text-gray-700'
        }`}
        disabled={isUpdating}
      >
        {getCurrentReactionIcon() || <ThumbsUp className="w-5 h-5" />}
        <span>{getCurrentReactionLabel()}</span>
      </button>

      {/* Reaction Picker */}
      {showReactions && (
        <div className="absolute bottom-full left-0 mb-2 bg-white rounded-full shadow-lg border border-gray-200 p-2 flex items-center gap-1 z-10">
          {Object.entries(reactionIcons).map(([type, config]) => {
            const Icon = config.icon;
            const isActive = userReaction?.type === type;

            return (
              <button
                key={type}
                onClick={() => handleReaction(type as any)}
                className={`p-2 rounded-full transition-all hover:scale-125 ${
                  isActive ? `${config.bgColor} scale-110` : 'hover:bg-gray-100'
                }`}
                title={config.label}
              >
                <Icon className={`w-6 h-6 ${config.color}`} />
              </button>
            );
          })}
        </div>
      )}

      {/* Overlay to close picker */}
      {showReactions && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setShowReactions(false)}
        />
      )}
    </div>
  );
}
