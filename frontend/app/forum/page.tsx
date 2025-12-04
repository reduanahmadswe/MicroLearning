'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  MessageSquare,
  Plus,
  Search,
  TrendingUp,
  Clock,
  MessageCircle,
  ThumbsUp,
  Eye,
  Filter,
  Pin,
  Star,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { forumAPI } from '@/services/api.service';
import { toast } from 'sonner';

interface ForumPost {
  _id: string;
  title: string;
  content: string;
  author: {
    _id: string;
    name: string;
    avatar?: string;
  };
  category: string;
  tags: string[];
  upvotes: number;
  views: number;
  replies: number;
  isPinned: boolean;
  isSolved: boolean;
  createdAt: string;
}

export default function ForumPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [trendingTopics, setTrendingTopics] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'popular' | 'trending'>('recent');
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const categories = [
    'General Discussion',
    'Programming',
    'Mathematics',
    'Science',
    'Career Advice',
    'Study Tips',
    'Help & Support',
  ];

  useEffect(() => {
    loadPosts();
    loadTrendingTopics();
  }, [selectedCategory, sortBy]);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (selectedCategory !== 'all') params.category = selectedCategory;
      if (searchQuery) params.search = searchQuery;
      if (sortBy) params.sort = sortBy;

      const response = await forumAPI.getPosts(params);
      setPosts(response.data.data || []);
    } catch (error: any) {
      toast.error('Failed to load posts');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadTrendingTopics = async () => {
    try {
      const response = await forumAPI.getTrendingTopics();
      setTrendingTopics(response.data.data || []);
    } catch (error: any) {
      console.error(error);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadPosts();
  };

  const handleUpvote = async (postId: string) => {
    try {
      await forumAPI.upvotePost(postId);
      loadPosts();
    } catch (error: any) {
      toast.error('Failed to upvote');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <MessageSquare className="w-8 h-8 text-indigo-600" />
              Community Forum
            </h1>
            <p className="text-gray-600 mt-1">Ask questions, share knowledge, and connect</p>
          </div>
          <Button
            onClick={() => router.push('/forum/create')}
            size="lg"
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create Post
          </Button>
        </div>
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="space-y-6">
            {/* Categories */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                      selectedCategory === 'all'
                        ? 'bg-indigo-100 text-indigo-700 font-medium'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    All Categories
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-colors text-sm ${
                        selectedCategory === cat
                          ? 'bg-indigo-100 text-indigo-700 font-medium'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Trending Topics */}
            <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-orange-600" />
                  Trending Topics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {trendingTopics.slice(0, 5).map((topic, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 p-2 bg-white rounded-lg cursor-pointer hover:shadow-md transition-all"
                      onClick={() => setSearchQuery(topic)}
                    >
                      <div className="w-6 h-6 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                        {index + 1}
                      </div>
                      <span className="text-sm font-medium text-gray-700 flex-1 truncate">
                        {topic}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Forum Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Forum Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-blue-600" />
                    <span className="text-sm font-medium text-gray-700">Total Posts</span>
                  </div>
                  <span className="text-lg font-bold text-blue-600">{posts.length}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <MessageCircle className="w-5 h-5 text-green-600" />
                    <span className="text-sm font-medium text-gray-700">Active Today</span>
                  </div>
                  <span className="text-lg font-bold text-green-600">
                    {posts.filter(p => {
                      const today = new Date();
                      const postDate = new Date(p.createdAt);
                      return postDate.toDateString() === today.toDateString();
                    }).length}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Search & Filters */}
            <Card>
              <CardContent className="p-4">
                <form onSubmit={handleSearch} className="flex gap-4 mb-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search discussions..."
                      className="pl-10"
                    />
                  </div>
                  <Button type="submit">Search</Button>
                </form>

                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">Sort by:</span>
                  <div className="flex gap-2">
                    <Button
                      variant={sortBy === 'recent' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSortBy('recent')}
                    >
                      <Clock className="w-3 h-3 mr-1" />
                      Recent
                    </Button>
                    <Button
                      variant={sortBy === 'popular' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSortBy('popular')}
                    >
                      <ThumbsUp className="w-3 h-3 mr-1" />
                      Popular
                    </Button>
                    <Button
                      variant={sortBy === 'trending' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSortBy('trending')}
                    >
                      <TrendingUp className="w-3 h-3 mr-1" />
                      Trending
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Posts List */}
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
              </div>
            ) : posts.length === 0 ? (
              <Card className="p-12 text-center">
                <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No posts found</h3>
                <p className="text-gray-600 mb-4">
                  {searchQuery || selectedCategory !== 'all'
                    ? 'Try adjusting your filters'
                    : 'Be the first to start a discussion!'}
                </p>
                <Button onClick={() => router.push('/forum/create')}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Post
                </Button>
              </Card>
            ) : (
              <div className="space-y-4">
                {posts.map((post) => (
                  <Card
                    key={post._id}
                    className={`hover:shadow-lg transition-all cursor-pointer ${
                      post.isPinned ? 'border-2 border-yellow-300 bg-yellow-50' : ''
                    }`}
                    onClick={() => router.push(`/forum/${post._id}`)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        {/* Vote Section */}
                        <div className="flex flex-col items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUpvote(post._id);
                            }}
                            className="p-2 hover:bg-indigo-100 rounded-lg transition-colors"
                          >
                            <ThumbsUp className="w-5 h-5 text-indigo-600" />
                          </button>
                          <span className="text-lg font-bold text-gray-900">{post.upvotes}</span>
                        </div>

                        {/* Post Content */}
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2 mb-2">
                              {post.isPinned && (
                                <Pin className="w-4 h-4 text-yellow-600" />
                              )}
                              {post.isSolved && (
                                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">
                                  ✓ Solved
                                </span>
                              )}
                              <span className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs font-medium rounded">
                                {post.category}
                              </span>
                            </div>
                          </div>

                          <h3 className="text-xl font-bold text-gray-900 mb-2 hover:text-indigo-600">
                            {post.title}
                          </h3>

                          <p className="text-gray-600 mb-3 line-clamp-2">{post.content}</p>

                          {/* Tags */}
                          {post.tags && post.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-3">
                              {post.tags.map((tag) => (
                                <span
                                  key={tag}
                                  className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
                                >
                                  #{tag}
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Post Meta */}
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <div className="w-6 h-6 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                {post.author?.name?.charAt(0).toUpperCase()}
                              </div>
                              <span>{post.author?.name}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <MessageCircle className="w-4 h-4" />
                              <span>{post.replies} replies</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Eye className="w-4 h-4" />
                              <span>{post.views} views</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
