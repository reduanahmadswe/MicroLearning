'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { postAPI } from '@/services/api.service';
import { toast } from 'sonner';
import CreatePost from '@/components/feed/CreatePost';
import PostCard from '@/components/feed/PostCard';
import SearchBar from '@/components/SearchBar';
import { Loader2, TrendingUp, Users, Sparkles, Filter, ChevronDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

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
  const [activeFilter, setActiveFilter] = useState<'all' | 'achievements' | 'milestones'>('all');

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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-teal-50 to-emerald-50">
        <Card className="max-w-md w-full mx-4 shadow-xl border-0">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-green-600 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Join the Community</h3>
            <p className="text-gray-600 mb-6">Please log in to view your personalized feed and connect with other learners</p>
            <Button className="w-full bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700">
              Log In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const filteredPosts = posts.filter((post) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'achievements') return post.type === 'achievement';
    if (activeFilter === 'milestones') return post.type === 'milestone';
    return true;
  });

  return (
    <div className="min-h-screen bg-page-gradient">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header Section */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent mb-2">
                Community Feed
              </h1>
              <p className="text-muted-foreground text-sm sm:text-base">
                Stay connected with your learning community
              </p>
            </div>

            {/* User Stats Badge */}
            <div className="flex items-center space-x-2 sm:space-x-3 bg-card rounded-xl px-4 py-3 shadow-lg border border-border">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-green-600 to-teal-600 rounded-full flex items-center justify-center text-white font-bold text-sm sm:text-base">
                {user.level || 1}
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">Your Level</p>
                <p className="text-sm font-bold text-foreground">{user.xp || 0} XP</p>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mb-4">
            <SearchBar />
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-hide">
            <button
              onClick={() => setActiveFilter('all')}
              className={`flex-shrink-0 px-4 sm:px-6 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 ${activeFilter === 'all'
                ? 'bg-gradient-to-r from-green-600 to-teal-600 text-white shadow-lg'
                : 'bg-card text-muted-foreground hover:bg-accent border border-border'
                }`}
            >
              <span className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4" />
                <span>All Posts</span>
              </span>
            </button>
            <button
              onClick={() => setActiveFilter('achievements')}
              className={`flex-shrink-0 px-4 sm:px-6 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 ${activeFilter === 'achievements'
                ? 'bg-gradient-to-r from-green-600 to-teal-600 text-white shadow-lg'
                : 'bg-card text-muted-foreground hover:bg-accent border border-border'
                }`}
            >
              <span className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4" />
                <span>Achievements</span>
              </span>
            </button>
            <button
              onClick={() => setActiveFilter('milestones')}
              className={`flex-shrink-0 px-4 sm:px-6 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 ${activeFilter === 'milestones'
                ? 'bg-gradient-to-r from-green-600 to-teal-600 text-white shadow-lg'
                : 'bg-card text-muted-foreground hover:bg-accent border border-border'
                }`}
            >
              <span className="flex items-center space-x-2">
                <Users className="w-4 h-4" />
                <span>Milestones</span>
              </span>
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Main Feed Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Create Post */}
            <CreatePost onPostCreated={handlePostCreated} />

            {/* Feed Posts */}
            <div className="space-y-4 sm:space-y-6">
              {loading ? (
                <Card className="border-0 shadow-xl bg-card/80 backdrop-blur-sm">
                  <CardContent className="flex flex-col items-center justify-center py-16">
                    <Loader2 className="w-10 h-10 sm:w-12 sm:h-12 animate-spin text-green-600 mb-4" />
                    <p className="text-muted-foreground font-medium">Loading your feed...</p>
                  </CardContent>
                </Card>
              ) : filteredPosts.length === 0 ? (
                <Card className="border-0 shadow-xl bg-card/80 backdrop-blur-sm overflow-hidden">
                  <div className="relative">
                    <div className="absolute top-0 right-0 -mt-4 -mr-4 h-32 w-32 rounded-full bg-green-100 blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 -mb-4 -ml-4 h-32 w-32 rounded-full bg-teal-100 blur-3xl"></div>
                    <CardContent className="relative z-10 p-8 sm:p-12 text-center">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-green-100 to-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 text-green-600" />
                      </div>
                      <p className="text-foreground text-lg sm:text-xl font-bold mb-2">No posts yet</p>
                      <p className="text-muted-foreground text-sm sm:text-base">
                        {activeFilter === 'all'
                          ? "Create your first post or add some friends to see their posts!"
                          : `No ${activeFilter} to show. Try selecting a different filter!`}
                      </p>
                    </CardContent>
                  </div>
                </Card>
              ) : (
                <>
                  {filteredPosts.map((post) => (
                    <PostCard
                      key={`${post._id}-${post.reactionCount}`} // Force re-render on meaningful updates
                      post={post}
                      onDelete={handlePostDeleted}
                      onUpdate={handlePostUpdated}
                    />
                  ))}

                  {/* Load More Button */}
                  {hasMore && activeFilter === 'all' && (
                    <div className="flex justify-center pt-4">
                      <Button
                        onClick={handleLoadMore}
                        disabled={loadingMore}
                        className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white shadow-lg px-8 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                      >
                        {loadingMore ? (
                          <span className="flex items-center space-x-2">
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span>Loading...</span>
                          </span>
                        ) : (
                          <span className="flex items-center space-x-2">
                            <span>Load More Posts</span>
                            <ChevronDown className="w-5 h-5" />
                          </span>
                        )}
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Sidebar - Hidden on mobile, visible on large screens */}
          <div className="hidden lg:block space-y-6">
            {/* Trending Topics */}
            <Card className="border-0 shadow-xl bg-card/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  <span>Trending Topics</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {['Web Development', 'Data Science', 'Machine Learning', 'UI/UX Design', 'Mobile Development'].map((topic, index) => (
                  <div
                    key={topic}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-accent transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${index === 0 ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white' :
                          index === 1 ? 'bg-gradient-to-r from-green-400 to-teal-500 text-white' :
                            'bg-accent text-primary'
                        }`}>
                        {index + 1}
                      </div>
                      <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                        {topic}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground font-medium">
                      {Math.floor(Math.random() * 500 + 100)} posts
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Suggestions */}
            <Card className="border-0 shadow-xl bg-gradient-to-br from-green-600 via-teal-600 to-emerald-600 text-white">
              <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-white/10 blur-2xl"></div>
              <div className="absolute bottom-0 left-0 -mb-4 -ml-4 h-24 w-24 rounded-full bg-white/10 blur-2xl"></div>
              <CardHeader className="relative z-10">
                <CardTitle className="text-white flex items-center space-x-2">
                  <Sparkles className="w-5 h-5" />
                  <span>Stay Active!</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="relative z-10 space-y-3">
                <p className="text-green-50 text-sm">
                  Share your learning journey and inspire others in the community!
                </p>
                <Button className="w-full bg-white text-green-600 hover:bg-green-50 font-semibold shadow-lg transition-all duration-300 hover:scale-105">
                  Create a Post
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
