'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { postAPI } from '@/services/api.service';
import { toast } from 'sonner';
import CreatePost from '@/components/feed/CreatePost';
import PostCard from '@/components/feed/PostCard';
import SearchBar from '@/components/SearchBar';
import { Loader2 } from 'lucide-react';

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

export default function FeedPage() {
  const { user } = useAuthStore();
  const [posts, setPosts] = useState<IPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const loadFeed = async (pageNum: number = 1) => {
    try {
      if (pageNum === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const response = await postAPI.getFeed({ page: pageNum, limit: 10 });
      const newPosts = response.data.data || [];

      if (pageNum === 1) {
        setPosts(newPosts);
      } else {
        setPosts((prev) => [...prev, ...newPosts]);
      }

      setHasMore(newPosts.length === 10);
    } catch (error: any) {
      console.error('Failed to load feed:', error);
      toast.error('Failed to load feed');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    loadFeed(1);
  }, []);

  const handlePostCreated = (newPost: IPost) => {
    setPosts((prev) => [newPost, ...prev]);
    toast.success('Post created successfully!');
  };

  const handlePostDeleted = (postId: string) => {
    setPosts((prev) => prev.filter((p) => p._id !== postId));
    toast.success('Post deleted');
  };

  const handlePostUpdated = (updatedPost: IPost) => {
    setPosts((prev) =>
      prev.map((p) => (p._id === updatedPost._id ? updatedPost : p))
    );
  };

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadFeed(nextPage);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Please log in to view your feed</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Search Bar */}
        <div className="mb-6">
          <SearchBar />
        </div>

        {/* Create Post */}
        <CreatePost onPostCreated={handlePostCreated} />

        {/* Feed */}
        <div className="mt-6 space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : posts.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <p className="text-gray-500 text-lg">No posts yet</p>
              <p className="text-gray-400 text-sm mt-2">
                Create your first post or add some friends to see their posts!
              </p>
            </div>
          ) : (
            <>
              {posts.map((post) => (
                <PostCard
                  key={post._id}
                  post={post}
                  onDelete={handlePostDeleted}
                  onUpdate={handlePostUpdated}
                />
              ))}

              {/* Load More Button */}
              {hasMore && (
                <div className="flex justify-center py-4">
                  <button
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {loadingMore ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      'Load More'
                    )}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
