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
} from 'lucide-react';
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
    { value: 'all', label: 'All Topics' },
    { value: 'programming', label: 'Programming' },
    { value: 'business', label: 'Business' },
    { value: 'general', label: 'General Discussion' },
    { value: 'bug-report', label: 'Bug Reports' },
    { value: 'feature-request', label: 'Feature Requests' },
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              Community Forum
            </h1>
            <p className="text-gray-600 mt-1">Ask questions, share knowledge, and help others</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all flex items-center gap-2 font-medium shadow-lg"
          >
            <Plus className="w-5 h-5" />
            Ask Question
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Questions</p>
                <p className="text-2xl font-bold text-gray-900">{posts.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Solved</p>
                <p className="text-2xl font-bold text-green-600">
                  {posts.filter(p => p.isSolved).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Need Help</p>
                <p className="text-2xl font-bold text-orange-600">
                  {posts.filter(p => p.isHelpNeeded && !p.isSolved).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Active Users</p>
                <p className="text-2xl font-bold text-purple-600">
                  {new Set(posts.map(p => p.author._id)).size}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && loadPosts()}
                placeholder="Search questions..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="solved">Solved</option>
              <option value="unsolved">Unsolved</option>
              <option value="help-needed">Need Help</option>
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="recent">Recent</option>
              <option value="votes">Most Voted</option>
              <option value="unanswered">Unanswered</option>
            </select>
          </div>
        </div>
        {/* Posts List */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : posts.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No questions found</h3>
            <p className="text-gray-600 mb-4">Be the first to ask a question!</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Ask Question
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <Link key={post._id} href={`/forum/${post._id}`}>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all cursor-pointer">
                  <div className="flex gap-4">
                    {/* Vote Section */}
                    <div className="flex flex-col items-center gap-2 min-w-[60px]">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          handleVote(post._id, 'upvote');
                        }}
                        className="p-2 hover:bg-green-50 rounded-lg transition-colors"
                      >
                        <ThumbsUp className={`w-5 h-5 ${post.upvotes.includes(user?._id || '') ? 'text-green-600 fill-green-600' : 'text-gray-400'}`} />
                      </button>
                      <span className="text-xl font-bold text-gray-900">
                        {post.upvotes.length - post.downvotes.length}
                      </span>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          handleVote(post._id, 'downvote');
                        }}
                        className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <ThumbsDown className={`w-5 h-5 ${post.downvotes.includes(user?._id || '') ? 'text-red-600 fill-red-600' : 'text-gray-400'}`} />
                      </button>
                    </div>

                    {/* Content Section */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap mb-2">
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
                            {post.isPinned && (
                              <span className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                                <Star className="w-3 h-3" />
                                Pinned
                              </span>
                            )}
                            {post.course && (
                              <span className="flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                                <BookOpen className="w-3 h-3" />
                                {post.course.title}
                              </span>
                            )}
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors line-clamp-2">
                            {post.title}
                          </h3>
                          <p className="text-gray-600 mt-2 line-clamp-2">{post.content}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <MessageCircle className="w-4 h-4" />
                            <span>{post.commentCount} answers</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            <span>{post.viewCount} views</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>{formatDate(post.createdAt)}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {post.tags.map((tag, idx) => (
                            <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-200">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                          {post.author.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm text-gray-700 font-medium">{post.author.name}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Create Post Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Ask a Question</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={createForm.title}
                  onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                  placeholder="What's your question?"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Content */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  value={createForm.content}
                  onChange={(e) => setCreateForm({ ...createForm, content: e.target.value })}
                  rows={6}
                  placeholder="Provide more details about your question..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>

              {/* Group Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Group *
                </label>
                <select
                  value={createForm.groupId}
                  onChange={(e) => setCreateForm({ ...createForm, groupId: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select a group</option>
                  {groups.map(group => (
                    <option key={group._id} value={group._id}>{group.name}</option>
                  ))}
                </select>
              </div>

              {/* Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type
                </label>
                <select
                  value={createForm.contentType}
                  onChange={(e) => setCreateForm({ ...createForm, contentType: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="question">Question</option>
                  <option value="discussion">Discussion</option>
                  <option value="text">General Post</option>
                </select>
              </div>

              {/* Course Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Related Course (Optional)
                </label>
                <select
                  value={createForm.courseId}
                  onChange={(e) => setCreateForm({ ...createForm, courseId: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select a course</option>
                  {courses.map(course => (
                    <option key={course._id} value={course._id}>{course.title}</option>
                  ))}
                </select>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  value={createForm.tags}
                  onChange={(e) => setCreateForm({ ...createForm, tags: e.target.value })}
                  placeholder="javascript, react, beginner"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Help Needed */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="helpNeeded"
                  checked={createForm.isHelpNeeded}
                  onChange={(e) => setCreateForm({ ...createForm, isHelpNeeded: e.target.checked })}
                  className="w-5 h-5 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                />
                <label htmlFor="helpNeeded" className="text-sm font-medium text-gray-700 cursor-pointer">
                  Mark as "Help Needed" (urgent question)
                </label>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleCreatePost}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-colors font-medium"
              >
                Post Question
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
