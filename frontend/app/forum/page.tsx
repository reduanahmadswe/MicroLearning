'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import {
  MessageSquare,
  Plus,
  Search,
  TrendingUp,
  Clock,
  MessageCircle,
  ThumbsUp,
  ThumbsDown,
  Eye,
  Filter,
  CheckCircle,
  AlertCircle,
  BookOpen,
  Users,
  Award,
  Star,
  X,
  Flame,
  Sparkles,
  Tag,
  Send,
  Hash,
  Globe,
  Lock,
  ChevronRight,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
  group: {
    _id: string;
    name: string;
  };
  contentType: string;
  course?: {
    _id: string;
    title: string;
  };
  lesson?: {
    _id: string;
    title: string;
  };
  tags: string[];
  upvotes: string[];
  downvotes: string[];
  viewCount: number;
  commentCount: number;
  isHelpNeeded: boolean;
  isSolved: boolean;
  isPinned: boolean;
  createdAt: string;
}

interface Course {
  _id: string;
  title: string;
}

interface ForumGroup {
  _id: string;
  name: string;
}

export default function ForumPage() {
  const router = useRouter();
  const { user, token } = useAuthStore();
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [groups, setGroups] = useState<ForumGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'votes' | 'unanswered'>('recent');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    title: '',
    content: '',
    contentType: 'question',
    groupId: '',
    courseId: '',
    lessonId: '',
    tags: '',
    isHelpNeeded: false,
  });

  const categories = [
    { value: 'all', label: 'All Topics', icon: Globe },
    { value: 'programming', label: 'Programming', icon: BookOpen },
    { value: 'business', label: 'Business', icon: Award },
    { value: 'general', label: 'General', icon: MessageSquare },
  ];

  useEffect(() => {
    loadPosts();
    loadCourses();
    loadGroups();
  }, [selectedCategory, selectedStatus, sortBy]);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchQuery) params.append('query', searchQuery);
      if (selectedCategory !== 'all') params.append('category', selectedCategory);
      if (selectedStatus === 'solved') params.append('isSolved', 'true');
      if (selectedStatus === 'unsolved') params.append('isSolved', 'false');
      if (selectedStatus === 'help-needed') params.append('isHelpNeeded', 'true');
      params.append('sortBy', sortBy);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/forum/posts?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to fetch posts');

      const data = await response.json();
      setPosts(data.data || []);
    } catch (error) {
      console.error('Error loading posts:', error);
      toast.error('Failed to load forum posts');
    } finally {
      setLoading(false);
    }
  };

  const loadCourses = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/courses`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setCourses(data.data || []);
      }
    } catch (error) {
      console.error('Error loading courses:', error);
    }
  };

  const loadGroups = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/forum/groups`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        let groupsList = data.data || [];

        // Create default group if none exist
        if (groupsList.length === 0) {
          try {
            const createResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/forum/groups`, {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                name: 'General Discussion',
                description: 'A place for general questions and discussions',
                category: 'general',
                privacy: 'public',
              }),
            });

            if (createResponse.ok) {
              const newGroupData = await createResponse.json();
              groupsList = [newGroupData.data];
              toast.success('Created default forum group');
            }
          } catch (createError) {
            console.error('Error creating default group:', createError);
          }
        }

        setGroups(groupsList);

        // Set first group as default if available
        if (groupsList.length > 0 && !createForm.groupId) {
          setCreateForm(prev => ({ ...prev, groupId: groupsList[0]._id }));
        }
      }
    } catch (error) {
      console.error('Error loading groups:', error);
    }
  };

  const handleCreatePost = async () => {
    if (!createForm.title || !createForm.content) {
      toast.error('Please fill in title and content');
      return;
    }

    if (!createForm.groupId) {
      toast.error('Please select a group');
      return;
    }

    try {
      // First, try to join the group if not already a member
      try {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/forum/groups/${createForm.groupId}/join`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({}),
        });
      } catch (joinError) {
        // Ignore if already a member
        console.log('Group join attempt:', joinError);
      }

      const payload = {
        groupId: createForm.groupId,
        title: createForm.title,
        content: createForm.content,
        contentType: createForm.contentType,
        tags: createForm.tags.split(',').map(t => t.trim()).filter(t => t),
        course: createForm.courseId || undefined,
        lesson: createForm.lessonId || undefined,
        isHelpNeeded: createForm.isHelpNeeded,
      };

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/forum/posts`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create post');
      }

      toast.success('Post created successfully!');
      setShowCreateModal(false);
      setCreateForm({
        title: '',
        content: '',
        contentType: 'question',
        groupId: groups[0]?._id || '',
        courseId: '',
        lessonId: '',
        tags: '',
        isHelpNeeded: false,
      });
      loadPosts();
    } catch (error: any) {
      console.error('Error creating post:', error);
      toast.error(error.message || 'Failed to create post');
    }
  };

  const handleVote = async (postId: string, voteType: 'upvote' | 'downvote') => {
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

      loadPosts();
      toast.success('Vote recorded!');
    } catch (error) {
      console.error('Error voting:', error);
      toast.error('Failed to vote');
    }
  };

  const handleMarkSolved = async (postId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/forum/posts/${postId}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isSolved: !currentStatus }),
      });

      if (!response.ok) throw new Error('Failed to update status');

      loadPosts();
      toast.success(currentStatus ? 'Marked as unsolved' : 'Marked as solved!');
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
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

  const getVoteScore = (post: ForumPost) => {
    return post.upvotes.length - post.downvotes.length;
  };

  const hasUserVoted = (post: ForumPost, type: 'up' | 'down') => {
    if (!user?._id) return false;
    return type === 'up'
      ? post.upvotes.includes(user._id)
      : post.downvotes.includes(user._id);
  };

  return (
    <div className="min-h-screen bg-page-gradient">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 xl:px-8 py-2 sm:py-4 lg:py-6">
        {/* Header */}
        <div className="mb-4 sm:mb-6">
          <div className="flex flex-col gap-3">
            <div className="flex items-start sm:items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 sm:gap-3 min-w-0 flex-1">
                <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-r from-green-600 to-teal-600 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                  <MessageSquare className="w-3.5 h-3.5 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <h1 className="text-base sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-green-700 via-teal-600 to-emerald-600 bg-clip-text text-transparent truncate">
                    Community Forum
                  </h1>
                  <p className="text-[10px] sm:text-sm text-muted-foreground mt-0.5 line-clamp-1">
                    Ask questions, share knowledge
                  </p>
                </div>
              </div>
              <Button
                onClick={() => setShowCreateModal(true)}
                className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 shadow-lg text-xs sm:text-sm whitespace-nowrap flex-shrink-0 h-9 sm:h-10"
                size="sm"
              >
                <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                <span className="hidden xs:inline">Ask Question</span>
                <span className="xs:hidden">Ask</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-1.5 sm:gap-3 lg:gap-4 mb-3 sm:mb-6">
          <Card className="border border-border shadow-md hover:shadow-lg transition-shadow bg-card">
            <CardContent className="p-2 sm:p-4 lg:p-6">
              <div className="flex items-center justify-between gap-1.5 sm:gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] sm:text-xs text-muted-foreground mb-0.5 truncate">Questions</p>
                  <p className="text-base sm:text-xl lg:text-2xl font-bold text-foreground">{posts.length}</p>
                </div>
                <div className="w-7 h-7 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-green-100 to-teal-100 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                  <MessageSquare className="w-3.5 h-3.5 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-border shadow-md hover:shadow-lg transition-shadow bg-card">
            <CardContent className="p-2 sm:p-4 lg:p-6">
              <div className="flex items-center justify-between gap-1.5 sm:gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] sm:text-xs text-muted-foreground mb-0.5 truncate">Solved</p>
                  <p className="text-base sm:text-xl lg:text-2xl font-bold text-green-600">
                    {posts.filter(p => p.isSolved).length}
                  </p>
                </div>
                <div className="w-7 h-7 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-green-100 to-emerald-100 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-3.5 h-3.5 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-border shadow-md hover:shadow-lg transition-shadow bg-card">
            <CardContent className="p-2 sm:p-4 lg:p-6">
              <div className="flex items-center justify-between gap-1.5 sm:gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] sm:text-xs text-muted-foreground mb-0.5 truncate">Need Help</p>
                  <p className="text-base sm:text-xl lg:text-2xl font-bold text-orange-600">
                    {posts.filter(p => p.isHelpNeeded && !p.isSolved).length}
                  </p>
                </div>
                <div className="w-7 h-7 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-orange-100 to-amber-100 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                  <Flame className="w-3.5 h-3.5 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-border shadow-md hover:shadow-lg transition-shadow bg-card">
            <CardContent className="p-2 sm:p-4 lg:p-6">
              <div className="flex items-center justify-between gap-1.5 sm:gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] sm:text-xs text-muted-foreground mb-0.5 truncate">Members</p>
                  <p className="text-base sm:text-xl lg:text-2xl font-bold text-teal-600">
                    {new Set(posts.map(p => p.author._id)).size}
                  </p>
                </div>
                <div className="w-7 h-7 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-teal-100 to-cyan-100 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                  <Users className="w-3.5 h-3.5 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-teal-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-2 sm:gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-2 sm:space-y-6">
            {/* Search & Filters */}
            <Card className="border border-border shadow-lg bg-card">
              <CardContent className="p-2 sm:p-4 lg:p-6">
                <div className="space-y-2 sm:space-y-3">
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-2.5 sm:left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-3 h-3 sm:w-4 sm:h-4" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && loadPosts()}
                      placeholder="Search discussions..."
                      className="w-full pl-7 sm:pl-10 pr-2.5 sm:pr-4 py-1.5 sm:py-2.5 text-[11px] sm:text-sm border border-border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-background text-foreground"
                    />
                  </div>

                  {/* Category Chips - Horizontal Scroll */}
                  <div className="flex gap-1.5 sm:gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-1 px-1">
                    {categories.map((cat) => {
                      const Icon = cat.icon;
                      return (
                        <button
                          key={cat.value}
                          onClick={() => setSelectedCategory(cat.value)}
                          className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 lg:px-4 py-1.5 sm:py-2 rounded-lg whitespace-nowrap text-xs font-medium transition-all flex-shrink-0 ${selectedCategory === cat.value
                              ? 'bg-gradient-to-r from-green-600 to-teal-600 text-white shadow-md'
                              : 'bg-card text-muted-foreground hover:bg-accent border border-border'
                            }`}
                        >
                          <Icon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                          <span className="text-xs">{cat.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Filters Row - Stack on mobile */}
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      className="w-full px-2 sm:px-3 py-2 text-xs border border-border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-background text-foreground"
                    >
                      <option value="all">All Status</option>
                      <option value="solved">✅ Solved</option>
                      <option value="unsolved">❓ Unsolved</option>
                      <option value="help-needed">🔥 Urgent</option>
                    </select>

                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="w-full px-2 sm:px-3 py-2 text-xs border border-border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-background text-foreground"
                    >
                      <option value="recent">🕒 Recent</option>
                      <option value="votes">🔥 Top</option>
                      <option value="unanswered">❓ Unanswered</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>
            {/* Posts List */}
            {loading ? (
              <Card className="border border-border shadow-lg bg-card">
                <CardContent className="p-8 sm:p-12 lg:p-16">
                  <div className="flex flex-col justify-center items-center">
                    <div className="relative">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 border-4 border-green-100 border-t-green-600 rounded-full animate-spin"></div>
                      <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-green-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                    </div>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-4">Loading discussions...</p>
                  </div>
                </CardContent>
              </Card>
            ) : posts.length === 0 ? (
              <Card className="border border-border shadow-lg bg-card">
                <CardContent className="p-8 sm:p-12 text-center">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-green-100 to-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageSquare className="w-10 h-10 sm:w-12 sm:h-12 text-green-600" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-foreground mb-2">No discussions found</h3>
                  <p className="text-sm sm:text-base text-muted-foreground mb-6">
                    Be the first to start a conversation!
                  </p>
                  <Button
                    onClick={() => setShowCreateModal(true)}
                    className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Ask Question
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {posts.map((post) => {
                  const voteScore = getVoteScore(post);
                  const hasUpvoted = hasUserVoted(post, 'up');
                  const hasDownvoted = hasUserVoted(post, 'down');

                  return (
                    <Card
                      key={post._id}
                      className="border border-border shadow-md hover:shadow-xl transition-all cursor-pointer group bg-card"
                    >
                      <CardContent className="p-3 sm:p-4 lg:p-6">
                        <div className="flex gap-2 sm:gap-3 lg:gap-4">
                          {/* Vote Section - More compact */}
                          <div className="flex flex-col items-center gap-0.5 sm:gap-1 min-w-[40px] sm:min-w-[50px] lg:min-w-[60px] flex-shrink-0">
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                handleVote(post._id, 'upvote');
                              }}
                              className={`p-1 sm:p-1.5 lg:p-2 rounded-lg transition-all ${hasUpvoted
                                  ? 'bg-green-100 dark:bg-green-900/30 text-green-600'
                                  : 'hover:bg-green-50 dark:hover:bg-green-900/20 text-muted-foreground hover:text-green-600'
                                }`}
                            >
                              <ThumbsUp className={`w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5 ${hasUpvoted ? 'fill-green-600' : ''}`} />
                            </button>
                            <span className={`text-sm sm:text-base lg:text-xl font-bold ${voteScore > 0 ? 'text-green-600' : voteScore < 0 ? 'text-destructive' : 'text-foreground'
                              }`}>
                              {voteScore}
                            </span>
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                handleVote(post._id, 'downvote');
                              }}
                              className={`p-1 sm:p-1.5 lg:p-2 rounded-lg transition-all ${hasDownvoted
                                  ? 'bg-destructive/10 text-destructive'
                                  : 'hover:bg-destructive/10 text-muted-foreground hover:text-destructive'
                                }`}
                            >
                              <ThumbsDown className={`w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5 ${hasDownvoted ? 'fill-destructive' : ''}`} />
                            </button>
                          </div>

                          {/* Content Section */}
                          <Link href={`/forum/${post._id}`} className="flex-1 min-w-0">
                            {/* Badges - Smaller on mobile */}
                            <div className="flex items-center gap-1 sm:gap-1.5 lg:gap-2 flex-wrap mb-1.5 sm:mb-2 lg:mb-3">
                              {post.isPinned && (
                                <span className="flex items-center gap-0.5 sm:gap-1 px-1.5 py-0.5 sm:px-2 lg:px-3 sm:py-1 bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-700 rounded-full text-[10px] sm:text-xs font-medium border border-amber-200">
                                  <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-amber-500" />
                                  <span className="hidden sm:inline">Pinned</span>
                                </span>
                              )}
                              {post.isSolved && (
                                <span className="flex items-center gap-0.5 sm:gap-1 px-1.5 py-0.5 sm:px-2 lg:px-3 sm:py-1 bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 rounded-full text-[10px] sm:text-xs font-medium border border-green-200">
                                  <CheckCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                  <span className="hidden xs:inline">Solved</span>
                                </span>
                              )}
                              {post.isHelpNeeded && !post.isSolved && (
                                <span className="flex items-center gap-0.5 sm:gap-1 px-1.5 py-0.5 sm:px-2 lg:px-3 sm:py-1 bg-gradient-to-r from-orange-100 to-red-100 text-orange-700 rounded-full text-[10px] sm:text-xs font-medium border border-orange-200">
                                  <Flame className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                  <span className="hidden xs:inline">Urgent</span>
                                </span>
                              )}
                              {post.course && (
                                <span className="flex items-center gap-0.5 sm:gap-1 px-1.5 py-0.5 sm:px-2 lg:px-3 sm:py-1 bg-gradient-to-r from-teal-100 to-cyan-100 text-teal-700 rounded-full text-[10px] sm:text-xs font-medium border border-teal-200">
                                  <BookOpen className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                  <span className="hidden sm:inline truncate max-w-[100px] lg:max-w-[150px]">{post.course.title}</span>
                                </span>
                              )}
                            </div>

                            {/* Title - Smaller on mobile */}
                            <h3 className="text-sm sm:text-base lg:text-lg font-bold text-foreground group-hover:text-green-600 transition-colors line-clamp-2 mb-1.5 sm:mb-2">
                              {post.title}
                            </h3>

                            {/* Content Preview - Smaller on mobile */}
                            <p className="text-xs sm:text-sm lg:text-base text-muted-foreground line-clamp-2 mb-2 sm:mb-3">
                              {post.content}
                            </p>

                            {/* Meta Info - More compact */}
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 sm:gap-2 lg:gap-4">
                              <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 text-[10px] sm:text-xs lg:text-sm text-muted-foreground">
                                <div className="flex items-center gap-0.5 sm:gap-1">
                                  <MessageCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5 lg:w-4 lg:h-4 text-green-600" />
                                  <span>{post.commentCount}</span>
                                </div>
                                <div className="flex items-center gap-0.5 sm:gap-1">
                                  <Eye className="w-3 h-3 sm:w-3.5 sm:h-3.5 lg:w-4 lg:h-4 text-muted-foreground" />
                                  <span>{post.viewCount}</span>
                                </div>
                                <div className="flex items-center gap-0.5 sm:gap-1">
                                  <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 lg:w-4 lg:h-4 text-muted-foreground" />
                                  <span className="hidden xs:inline">{formatDate(post.createdAt)}</span>
                                </div>
                              </div>

                              {/* Tags - Horizontal scroll on mobile */}
                              <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto scrollbar-hide">
                                {post.tags.slice(0, 3).map((tag, idx) => (
                                  <span
                                    key={idx}
                                    className="px-1.5 sm:px-2 py-0.5 bg-secondary text-muted-foreground rounded text-[10px] sm:text-xs whitespace-nowrap flex items-center gap-0.5 sm:gap-1"
                                  >
                                    <Hash className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            </div>

                            {/* Author - More compact */}
                            <div className="flex items-center justify-between mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-border">
                              <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                                <div className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 bg-gradient-to-r from-green-600 to-teal-600 rounded-full flex items-center justify-center text-white font-semibold text-[10px] sm:text-xs lg:text-sm flex-shrink-0">
                                  {post.author.name.charAt(0).toUpperCase()}
                                </div>
                                <span className="text-[10px] sm:text-xs lg:text-sm text-foreground font-medium truncate">
                                  {post.author.name}
                                </span>
                              </div>

                              {/* Mark as Solved Button - Smaller on mobile */}
                              {user?._id === post.author._id && (
                                <button
                                  onClick={(e) => {
                                    e.preventDefault();
                                    handleMarkSolved(post._id, post.isSolved);
                                  }}
                                  className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[10px] sm:text-xs lg:text-sm font-medium transition-all flex-shrink-0 ${post.isSolved
                                      ? 'bg-secondary text-muted-foreground hover:bg-secondary/80'
                                      : 'bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 shadow-sm'
                                    }`}
                                >
                                  <CheckCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5 lg:w-4 lg:h-4" />
                                  <span className="hidden xs:inline">{post.isSolved ? 'Unsolved' : 'Mark Solved'}</span>
                                </button>
                              )}
                            </div>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>

          {/* Sidebar */}
          {/* Sidebar */}
          <div className="space-y-2 sm:space-y-6">
            {/* Trending Topics */}
            <Card className="border border-border shadow-lg bg-card">
              <CardHeader className="bg-gradient-to-r from-green-50 to-teal-50 dark:from-green-900/10 dark:to-teal-900/10 border-b border-border p-2.5 sm:p-4 lg:p-6">
                <CardTitle className="text-sm sm:text-lg flex items-center gap-1.5 sm:gap-2 text-foreground">
                  <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                  Trending Topics
                </CardTitle>
              </CardHeader>
              <CardContent className="p-2 sm:p-4 lg:p-6">
                <div className="space-y-1.5 sm:space-y-3">
                  {['JavaScript', 'React', 'Python', 'Node.js', 'TypeScript'].map((topic, idx) => (
                    <div
                      key={topic}
                      className="flex items-center justify-between p-1.5 sm:p-3 bg-gradient-to-r from-green-50 to-teal-50 dark:from-green-900/10 dark:to-teal-900/10 rounded-lg border border-green-100 dark:border-green-800/30 hover:border-green-300 dark:hover:border-green-700 transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center gap-1.5 sm:gap-3 min-w-0">
                        <div className="w-5 h-5 sm:w-8 sm:h-8 bg-gradient-to-br from-green-600 to-teal-600 rounded-md sm:rounded-lg flex items-center justify-center text-white font-bold text-[10px] sm:text-sm flex-shrink-0">
                          {idx + 1}
                        </div>
                        <div className="min-w-0">
                          <p className="text-[11px] sm:text-sm font-semibold text-foreground group-hover:text-green-600 transition-colors truncate">
                            #{topic}
                          </p>
                          <p className="text-[9px] sm:text-xs text-muted-foreground">{Math.floor(Math.random() * 50) + 10} discussions</p>
                        </div>
                      </div>
                      <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground group-hover:text-green-600 transition-colors flex-shrink-0" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Community Stats */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-green-600 via-teal-600 to-emerald-600 text-white overflow-hidden">
              <CardContent className="p-3 sm:p-6 relative">
                <div className="absolute top-0 right-0 w-20 h-20 sm:w-32 sm:h-32 bg-white/10 rounded-full -mr-10 sm:-mr-16 -mt-10 sm:-mt-16"></div>
                <div className="absolute bottom-0 left-0 w-14 h-14 sm:w-24 sm:h-24 bg-white/10 rounded-full -ml-7 sm:-ml-12 -mb-7 sm:-mb-12"></div>

                <div className="relative z-10">
                  <div className="flex items-center gap-1.5 sm:gap-3 mb-2 sm:mb-4">
                    <div className="w-8 h-8 sm:w-12 sm:h-12 bg-white/20 rounded-lg sm:rounded-xl flex items-center justify-center backdrop-blur-sm flex-shrink-0">
                      <Users className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm sm:text-xl font-bold">Active Community</h3>
                      <p className="text-[10px] sm:text-sm text-white/80">Join the discussion</p>
                    </div>
                  </div>

                  <div className="space-y-1.5 sm:space-y-3 mb-3 sm:mb-6">
                    <div className="flex items-center justify-between p-1.5 sm:p-3 bg-white/10 rounded-lg backdrop-blur-sm">
                      <span className="text-[10px] sm:text-sm text-white/90">Total Members</span>
                      <span className="font-bold text-xs sm:text-base">{posts.length * 2}+</span>
                    </div>
                    <div className="flex items-center justify-between p-1.5 sm:p-3 bg-white/10 rounded-lg backdrop-blur-sm">
                      <span className="text-[10px] sm:text-sm text-white/90">Today's Posts</span>
                      <span className="font-bold text-xs sm:text-base">{Math.floor(posts.length / 7)}</span>
                    </div>
                    <div className="flex items-center justify-between p-1.5 sm:p-3 bg-white/10 rounded-lg backdrop-blur-sm">
                      <span className="text-[10px] sm:text-sm text-white/90">Active Now</span>
                      <span className="font-bold text-xs sm:text-base">{new Set(posts.map(p => p.author._id)).size}</span>
                    </div>
                  </div>

                  <Button
                    onClick={() => setShowCreateModal(true)}
                    className="w-full bg-white dark:bg-black text-green-700 hover:bg-gray-100 dark:hover:bg-zinc-900 font-semibold shadow-lg text-[11px] sm:text-sm h-8 sm:h-10"
                  >
                    <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    Start Discussion
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Quick Guide */}
            <Card className="border border-border shadow-lg bg-card hidden lg:block">
              <CardHeader className="bg-gradient-to-r from-green-50 to-teal-50 dark:from-green-900/10 dark:to-teal-900/10 border-b border-border">
                <CardTitle className="text-base flex items-center gap-2 text-foreground">
                  <Award className="w-5 h-5 text-green-600" />
                  Community Guidelines
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">Be respectful</p>
                      <p className="text-xs text-muted-foreground">Treat others with kindness</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Search className="w-4 h-4 text-teal-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">Search first</p>
                      <p className="text-xs text-muted-foreground">Your question might be answered</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <MessageSquare className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">Be clear</p>
                      <p className="text-xs text-muted-foreground">Provide context and details</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Tag className="w-4 h-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">Use tags</p>
                      <p className="text-xs text-muted-foreground">Help others find your post</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Create Post Modal */}
      {showCreateModal && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40 animate-fadeIn"
            onClick={() => setShowCreateModal(false)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
            <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto border border-border shadow-2xl animate-scaleIn bg-card">
              <CardHeader className="bg-gradient-to-r from-green-600 via-teal-600 to-emerald-600 text-white sticky top-0 z-10 p-3 sm:p-4 lg:p-6">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base sm:text-xl lg:text-2xl font-bold flex items-center gap-1.5 sm:gap-2">
                    <Send className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
                    Ask a Question
                  </CardTitle>
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="p-1.5 sm:p-2 hover:bg-white/20 rounded-lg transition-colors flex-shrink-0"
                  >
                    <X className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </div>
              </CardHeader>

              <CardContent className="p-3 sm:p-4 lg:p-6">
                <div className="space-y-3 sm:space-y-4 lg:space-y-5">
                  {/* Title */}
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-foreground mb-1.5 sm:mb-2 flex items-center gap-1">
                      Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={createForm.title}
                      onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                      placeholder="What's your question?"
                      className="w-full px-3 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm lg:text-base bg-background border-2 border-border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all hover:border-gray-300 dark:hover:border-gray-600 text-foreground"
                    />
                  </div>

                  {/* Content */}
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-foreground mb-1.5 sm:mb-2 flex items-center gap-1">
                      Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={createForm.content}
                      onChange={(e) => setCreateForm({ ...createForm, content: e.target.value })}
                      rows={6}
                      placeholder="Provide more details about your question..."
                      className="w-full px-3 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm lg:text-base bg-background border-2 border-border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all hover:border-gray-300 dark:hover:border-gray-600 resize-none text-foreground"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    {/* Group Selection */}
                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-foreground mb-1.5 sm:mb-2 flex items-center gap-1">
                        Group <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={createForm.groupId}
                        onChange={(e) => setCreateForm({ ...createForm, groupId: e.target.value })}
                        className="w-full px-3 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm lg:text-base bg-background border-2 border-border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all hover:border-gray-300 dark:hover:border-gray-600 text-foreground"
                      >
                        <option value="">Select a group</option>
                        {groups.map(group => (
                          <option key={group._id} value={group._id}>{group.name}</option>
                        ))}
                      </select>
                    </div>

                    {/* Type */}
                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-foreground mb-1.5 sm:mb-2">
                        Type
                      </label>
                      <select
                        value={createForm.contentType}
                        onChange={(e) => setCreateForm({ ...createForm, contentType: e.target.value })}
                        className="w-full px-3 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm lg:text-base bg-background border-2 border-border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all hover:border-gray-300 dark:hover:border-gray-600 text-foreground"
                      >
                        <option value="question">❓ Question</option>
                        <option value="discussion">💬 Discussion</option>
                        <option value="text">📝 General Post</option>
                      </select>
                    </div>
                  </div>

                  {/* Course Selection */}
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-foreground mb-1.5 sm:mb-2">
                      Related Course (Optional)
                    </label>
                    <select
                      value={createForm.courseId}
                      onChange={(e) => setCreateForm({ ...createForm, courseId: e.target.value })}
                      className="w-full px-3 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm lg:text-base bg-background border-2 border-border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all hover:border-gray-300 dark:hover:border-gray-600 text-foreground"
                    >
                      <option value="">Select a course</option>
                      {courses.map(course => (
                        <option key={course._id} value={course._id}>{course.title}</option>
                      ))}
                    </select>
                  </div>

                  {/* Tags */}
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-foreground mb-1.5 sm:mb-2">
                      Tags (comma-separated)
                    </label>
                    <div className="relative">
                      <Hash className="absolute left-2.5 sm:left-3 top-1/2 transform -translate-y-1/2 text-green-500 w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      <input
                        type="text"
                        value={createForm.tags}
                        onChange={(e) => setCreateForm({ ...createForm, tags: e.target.value })}
                        placeholder="javascript, react, beginner"
                        className="w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-3 text-xs sm:text-sm lg:text-base bg-background border-2 border-border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all hover:border-gray-300 dark:hover:border-gray-600 text-foreground"
                      />
                    </div>
                  </div>

                  {/* Help Needed */}
                  <div className="flex items-start gap-2 sm:gap-3 p-2.5 sm:p-4 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/10 dark:to-amber-900/10 border-2 border-orange-200 dark:border-orange-800 rounded-xl hover:border-orange-300 dark:hover:border-orange-700 transition-all">
                    <input
                      type="checkbox"
                      id="helpNeeded"
                      checked={createForm.isHelpNeeded}
                      onChange={(e) => setCreateForm({ ...createForm, isHelpNeeded: e.target.checked })}
                      className="mt-0.5 w-4 h-4 sm:w-5 sm:h-5 text-orange-600 border-orange-300 rounded focus:ring-orange-500 flex-shrink-0 cursor-pointer"
                    />
                    <div className="flex-1 min-w-0">
                      <label htmlFor="helpNeeded" className="text-xs sm:text-sm font-semibold text-foreground cursor-pointer flex items-center gap-1.5 sm:gap-2">
                        <Flame className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-orange-600 flex-shrink-0" />
                        <span className="line-clamp-1">Mark as "Urgent - Need Help"</span>
                      </label>
                      <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1 line-clamp-2">
                        Use this for time-sensitive questions that need immediate attention
                      </p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 mt-4 sm:mt-6 pt-4 sm:pt-6 border-t-2 border-border">
                  <Button
                    onClick={() => setShowCreateModal(false)}
                    variant="outline"
                    className="flex-1 border-2 border-border hover:border-muted-foreground/30 hover:bg-secondary h-9 sm:h-10 text-xs sm:text-sm font-semibold rounded-xl transition-all"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreatePost}
                    className="flex-1 bg-gradient-to-r from-green-600 via-teal-600 to-emerald-600 hover:from-green-700 hover:via-teal-700 hover:to-emerald-700 h-9 sm:h-10 text-xs sm:text-sm font-semibold shadow-lg rounded-xl transition-all"
                  >
                    <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                    Post Question
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
