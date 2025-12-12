'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { useForumPosts, useForumGroups, useAllCourses, useIsInitializing, useAppDispatch } from '@/store/hooks';
import { createForumPost, voteOnForumPost, markForumPostSolved } from '@/store/globalSlice';
import { api } from '@/lib/api';
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
  const dispatch = useAppDispatch();

  // INSTANT DATA FROM REDUX
  const allPosts = useForumPosts();
  const groups = useForumGroups();
  const courses = useAllCourses();
  const isInitializing = useIsInitializing();

  // UI state only
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

  // Track voting state to prevent rapid clicks
  const [votingPosts, setVotingPosts] = useState<Set<string>>(new Set());

  const categories = [
    { value: 'all', label: 'All Topics', icon: Globe },
    { value: 'programming', label: 'Programming', icon: BookOpen },
    { value: 'business', label: 'Business', icon: Award },
    { value: 'general', label: 'General', icon: MessageSquare },
  ];

  // Client-side filtering (instant!)
  const filteredPosts = useMemo(() => {
    return allPosts.filter(post => {
      // Search filter
      if (searchQuery && !post.title.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      // Status filter
      if (selectedStatus === 'solved' && !post.isSolved) return false;
      if (selectedStatus === 'unsolved' && post.isSolved) return false;
      if (selectedStatus === 'help-needed' && !post.isHelpNeeded) return false;

      return true;
    }).sort((a, b) => {
      if (sortBy === 'recent') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortBy === 'votes') {
        const scoreA = a.upvotes.length - a.downvotes.length;
        const scoreB = b.upvotes.length - b.downvotes.length;
        return scoreB - scoreA;
      }
      if (sortBy === 'unanswered') {
        return a.commentCount - b.commentCount;
      }
      return 0;
    });
  }, [allPosts, searchQuery, selectedStatus, sortBy]);

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
        await api.post(`/forum/groups/${createForm.groupId}/join`, {});
      } catch (joinError) {
        // Ignore if already a member
        console.log('Group join:', joinError);
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

      await dispatch(createForumPost(payload)).unwrap();
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
    } catch (error: any) {
      console.error('Error creating post:', error);
      toast.error(error.message || 'Failed to create post');
    }
  };

  const handleVote = async (postId: string, voteType: 'upvote' | 'downvote') => {
    // Prevent rapid clicks on same post
    if (votingPosts.has(postId)) {
      return; // Silently ignore rapid clicks
    }

    // Debug: Get current post state
    const currentPost = allPosts.find(p => p._id === postId);
    console.log('🗳️ BEFORE VOTE:', {
      postId,
      voteType,
      userId: user?._id,
      upvotes: currentPost?.upvotes,
      downvotes: currentPost?.downvotes,
      hasUpvoted: currentPost?.upvotes?.includes(user?._id || ''),
      hasDownvoted: currentPost?.downvotes?.includes(user?._id || '')
    });

    try {
      // Mark as voting
      setVotingPosts(prev => new Set(prev).add(postId));

      const result = await dispatch(voteOnForumPost({ postId, voteType })).unwrap();

      console.log('✅ AFTER VOTE:', {
        upvotes: result?.upvotes,
        downvotes: result?.downvotes,
        hasUpvoted: result?.upvotes?.includes(user?._id || ''),
        hasDownvoted: result?.downvotes?.includes(user?._id || '')
      });
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to vote';
      toast.error(`Vote failed: ${errorMessage}`);
    } finally {
      // Remove from voting set after delay
      setTimeout(() => {
        setVotingPosts(prev => {
          const newSet = new Set(prev);
          newSet.delete(postId);
          return newSet;
        });
      }, 500); // 500ms cooldown
    }
  };

  const handleMarkSolved = async (postId: string, currentStatus: boolean) => {
    try {
      await dispatch(markForumPostSolved({ postId, isSolved: !currentStatus })).unwrap();
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 overflow-x-hidden">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 sm:gap-3 min-w-0 flex-1">
                <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-r from-green-600 to-teal-600 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                  <MessageSquare className="w-3.5 h-3.5 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent mb-2">
                    Community Forum
                  </h1>
                  <p className="text-sm sm:text-base text-muted-foreground">
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
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <Card className="border-0 shadow-xl bg-card/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-xs text-muted-foreground mb-1 truncate">Questions</p>
                  <p className="text-base sm:text-xl lg:text-2xl font-bold text-foreground">{allPosts.length}</p>
                </div>
                <div className="w-7 h-7 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-green-100 to-teal-100 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                  <MessageSquare className="w-3.5 h-3.5 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-card/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-xs text-muted-foreground mb-1 truncate">Solved</p>
                  <p className="text-base sm:text-xl lg:text-2xl font-bold text-green-600">
                    {allPosts.filter((p: any) => p.isSolved).length}
                  </p>
                </div>
                <div className="w-7 h-7 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-green-100 to-emerald-100 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-3.5 h-3.5 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-card/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-xs text-muted-foreground mb-1 truncate">Need Help</p>
                  <p className="text-base sm:text-xl lg:text-2xl font-bold text-orange-600">
                    {allPosts.filter((p: any) => p.isHelpNeeded && !p.isSolved).length}
                  </p>
                </div>
                <div className="w-7 h-7 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-orange-100 to-amber-100 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                  <Flame className="w-3.5 h-3.5 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-card/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-xs text-muted-foreground mb-1 truncate">Members</p>
                  <p className="text-base sm:text-xl lg:text-2xl font-bold text-teal-600">
                    {new Set(allPosts.map((p: any) => p.author._id)).size}
                  </p>
                </div>
                <div className="w-7 h-7 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-teal-100 to-cyan-100 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                  <Users className="w-3.5 h-3.5 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-teal-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6 sm:space-y-8">
            {/* Search & Filters */}
            <Card className="border-0 shadow-xl bg-card/80 backdrop-blur-sm ">
              <CardContent className="p-4 sm:p-6">
                <div className="space-y-2 sm:space-y-3">
                  {/* Search */}
                  <div className="relative ">
                    <Search className="absolute left-2.5 sm:left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-3 h-3 sm:w-4 sm:h-4" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && setSearchQuery(searchQuery)}
                      placeholder="Search discussions..."
                      className="w-full pl-7 sm:pl-10 pr-4 sm:pr-6 py-1.5 sm:py-2.5 text-[11px] sm:text-sm border border-border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-background text-foreground"
                    />
                  </div>

                  {/* Category Chips - Horizontal Scroll */}
                  <div className="flex gap-2 sm:gap-2 overflow-x-auto pb-2 scrollbar-hide">
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
            {isInitializing ? (
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
            ) : filteredPosts.length === 0 ? (
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
              <div className="space-y-4 sm:space-y-6">
                {filteredPosts.map((post: any) => {
                  const voteScore = getVoteScore(post);
                  const hasUpvoted = hasUserVoted(post, 'up');
                  const hasDownvoted = hasUserVoted(post, 'down');

                  return (
                    <Card
                      key={post._id}
                      className="border-0 shadow-xl bg-card/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 cursor-pointer group"
                    >
                      <CardContent className="p-4 sm:p-6">
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
                                {post.tags.slice(0, 3).map((tag: string, idx: number) => (
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
                                  {post.author?.name?.charAt(0).toUpperCase() || '?'}
                                </div>
                                <span className="text-[10px] sm:text-xs lg:text-sm text-foreground font-medium truncate">
                                  {post.author?.name || 'Unknown'}
                                </span>
                              </div>

                              {/* Mark as Solved Button - Smaller on mobile */}
                              {user?._id === post.author?._id && (
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

          {/* Sidebar - Hidden on mobile, visible on large screens */}
          <div className="hidden lg:block space-y-6">
            {/* Trending Topics */}
            <Card className="border-0 shadow-xl bg-card/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-green-50 to-teal-50 dark:from-green-900/10 dark:to-teal-900/10 border-b border-border p-6">
                <CardTitle className="text-sm sm:text-lg flex items-center gap-1.5 sm:gap-2 text-foreground">
                  <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                  Trending Topics
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
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
            <Card className="border-0 shadow-xl bg-gradient-to-br from-green-600 via-teal-600 to-emerald-600 text-white overflow-hidden">
              <CardContent className="p-6 relative">
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
                      <span className="font-bold text-xs sm:text-base">{allPosts.length * 2}+</span>
                    </div>
                    <div className="flex items-center justify-between p-1.5 sm:p-3 bg-white/10 rounded-lg backdrop-blur-sm">
                      <span className="text-[10px] sm:text-sm text-white/90">Today's Posts</span>
                      <span className="font-bold text-xs sm:text-base">{Math.floor(allPosts.length / 7)}</span>
                    </div>
                    <div className="flex items-center justify-between p-1.5 sm:p-3 bg-white/10 rounded-lg backdrop-blur-sm">
                      <span className="text-[10px] sm:text-sm text-white/90">Active Now</span>
                      <span className="font-bold text-xs sm:text-base">{new Set(allPosts.map((p: any) => p.author._id)).size}</span>
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
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 animate-fadeIn"
            onClick={() => setShowCreateModal(false)}
          />
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-7 sm:p-4 md:p-6">
            <Card className="w-full sm:w-[90%] sm:max-w-lg md:max-w-xl max-h-[95vh] sm:max-h-[85vh] overflow-y-auto border-0 sm:border border-border shadow-2xl animate-slideUp sm:animate-scaleIn bg-card rounded-t-3xl sm:rounded-2xl">
              <CardHeader className="bg-gradient-to-r from-green-600 via-teal-600 to-emerald-600 text-white sticky top-0 z-10 p-3.5 sm:p-4 md:p-5 rounded-t-3xl sm:rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg sm:text-xl md:text-2xl font-bold flex items-center gap-2">
                    <Send className="w-5 h-5 sm:w-6 sm:h-6" />
                    <span>Ask a Question</span>
                  </CardTitle>
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="p-2 hover:bg-white/20 rounded-xl transition-all active:scale-95"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </CardHeader>

              <CardContent className="p-3.5 sm:p-4 md:p-5">
                <div className="space-y-3.5 sm:space-y-4">
                  {/* Title */}
                  <div>
                    <label className="block text-sm sm:text-base font-semibold text-foreground mb-2 flex items-center gap-1.5">
                      <span>Title</span>
                      <span className="text-red-500 text-lg">*</span>
                    </label>
                    <input
                      type="text"
                      value={createForm.title}
                      onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                      placeholder="What's your question?"
                      className="w-full px-4 py-3 sm:py-3.5 text-sm sm:text-base bg-background border-2 border-border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all hover:border-gray-300 dark:hover:border-gray-600 text-foreground placeholder:text-muted-foreground/60"
                    />
                  </div>

                  {/* Content */}
                  <div>
                    <label className="block text-sm sm:text-base font-semibold text-foreground mb-2 flex items-center gap-1.5">
                      <span>Description</span>
                      <span className="text-red-500 text-lg">*</span>
                    </label>
                    <textarea
                      value={createForm.content}
                      onChange={(e) => setCreateForm({ ...createForm, content: e.target.value })}
                      rows={5}
                      placeholder="Provide more details about your question..."
                      className="w-full px-4 py-3 sm:py-3.5 text-sm sm:text-base bg-background border-2 border-border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all hover:border-gray-300 dark:hover:border-gray-600 resize-none text-foreground placeholder:text-muted-foreground/60 leading-relaxed"
                    />
                    <p className="text-xs text-muted-foreground mt-1.5">Minimum 3 characters</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Group Selection */}
                    <div>
                      <label className="block text-sm sm:text-base font-semibold text-foreground mb-2 flex items-center gap-1.5">
                        <span>Group</span>
                        <span className="text-red-500 text-lg">*</span>
                      </label>
                      <select
                        value={createForm.groupId}
                        onChange={(e) => setCreateForm({ ...createForm, groupId: e.target.value })}
                        className="w-full px-4 py-3 sm:py-3.5 text-sm sm:text-base bg-background border-2 border-border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all hover:border-gray-300 dark:hover:border-gray-600 text-foreground cursor-pointer"
                      >
                        <option value="">Select a group</option>
                        {groups.map(group => (
                          <option key={group._id} value={group._id}>{group.name}</option>
                        ))}
                      </select>
                    </div>

                    {/* Type */}
                    <div>
                      <label className="block text-sm sm:text-base font-semibold text-foreground mb-2">
                        Type
                      </label>
                      <select
                        value={createForm.contentType}
                        onChange={(e) => setCreateForm({ ...createForm, contentType: e.target.value })}
                        className="w-full px-4 py-3 sm:py-3.5 text-sm sm:text-base bg-background border-2 border-border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all hover:border-gray-300 dark:hover:border-gray-600 text-foreground cursor-pointer"
                      >
                        <option value="question">❓ Question</option>
                        <option value="discussion">💬 Discussion</option>
                        <option value="text">📝 General Post</option>
                      </select>
                    </div>
                  </div>

                  {/* Course Selection */}
                  <div>
                    <label className="block text-sm sm:text-base font-semibold text-foreground mb-2">
                      Related Course <span className="text-xs text-muted-foreground font-normal">(Optional)</span>
                    </label>
                    <select
                      value={createForm.courseId}
                      onChange={(e) => setCreateForm({ ...createForm, courseId: e.target.value })}
                      className="w-full px-4 py-3 sm:py-3.5 text-sm sm:text-base bg-background border-2 border-border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all hover:border-gray-300 dark:hover:border-gray-600 text-foreground cursor-pointer"
                    >
                      <option value="">Select a course</option>
                      {courses.map(course => (
                        <option key={course._id} value={course._id}>{course.title}</option>
                      ))}
                    </select>
                  </div>

                  {/* Tags */}
                  <div>
                    <label className="block text-sm sm:text-base font-semibold text-foreground mb-2">
                      Tags <span className="text-xs text-muted-foreground font-normal">(comma-separated)</span>
                    </label>
                    <div className="relative">
                      <Hash className="absolute left-4 top-1/2 transform -translate-y-1/2 text-green-600 w-4 h-4" />
                      <input
                        type="text"
                        value={createForm.tags}
                        onChange={(e) => setCreateForm({ ...createForm, tags: e.target.value })}
                        placeholder="javascript, react, beginner"
                        className="w-full pl-11 pr-4 py-3 sm:py-3.5 text-sm sm:text-base bg-background border-2 border-border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all hover:border-gray-300 dark:hover:border-gray-600 text-foreground placeholder:text-muted-foreground/60"
                      />
                    </div>
                  </div>

                  {/* Help Needed */}
                  <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 border-2 border-orange-200 dark:border-orange-800/50 rounded-xl hover:border-orange-300 dark:hover:border-orange-700 transition-all cursor-pointer active:scale-[0.99]">
                    <input
                      type="checkbox"
                      id="helpNeeded"
                      checked={createForm.isHelpNeeded}
                      onChange={(e) => setCreateForm({ ...createForm, isHelpNeeded: e.target.checked })}
                      className="mt-1 w-5 h-5 text-orange-600 border-orange-300 rounded-md focus:ring-orange-500 focus:ring-2 flex-shrink-0 cursor-pointer"
                    />
                    <div className="flex-1 min-w-0">
                      <label htmlFor="helpNeeded" className="text-sm sm:text-base font-bold text-foreground cursor-pointer flex items-center gap-2">
                        <Flame className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600 flex-shrink-0" />
                        <span>Mark as "Urgent - Need Help"</span>
                      </label>
                      <p className="text-xs sm:text-sm text-muted-foreground mt-1.5 leading-relaxed">
                        Use this for time-sensitive questions that need immediate attention
                      </p>
                    </div>
                  </div>
                </div>

                {/* Actions - Fixed at bottom on mobile */}
                <div className="flex flex-col-reverse sm:flex-row gap-2.5 sm:gap-3 mt-5 pt-5 border-t-2 border-border sticky sm:static bottom-0 bg-card sm:bg-transparent -mx-3.5 sm:mx-0 px-3.5 sm:px-0 pb-3.5 sm:pb-0">
                  <Button
                    onClick={() => setShowCreateModal(false)}
                    variant="outline"
                    className="flex-1 border-2 border-border hover:border-muted-foreground/30 hover:bg-secondary h-11 sm:h-12 text-sm sm:text-base font-semibold rounded-xl transition-all active:scale-95"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreatePost}
                    className="flex-1 bg-gradient-to-r from-green-600 via-teal-600 to-emerald-600 hover:from-green-700 hover:via-teal-700 hover:to-emerald-700 h-11 sm:h-12 text-sm sm:text-base font-bold shadow-lg rounded-xl transition-all active:scale-95"
                  >
                    <Send className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
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
