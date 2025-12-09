'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  BookOpen,
  FileText,
  Award,
  MessageSquare,
  Sparkles,
  Plus,
  Edit,
  Trash2,
  Eye,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ChevronLeft,
  Package,
  TrendingUp,
  Users,
  Calendar,
  RefreshCw,
  Grid,
  List,
  Clock,
  X,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { lessonsAPI, quizAPI, coursesAPI, forumAPI } from '@/services/api.service';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';

type ContentType = 'lessons' | 'quizzes' | 'courses' | 'forum';
type ViewMode = 'grid' | 'list';

export default function AdminContentPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<ContentType>('lessons');
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [viewModal, setViewModal] = useState<{ open: boolean; item: any; type: ContentType } | null>(null);
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; itemId: string; itemTitle: string } | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    published: 0,
    draft: 0,
    pending: 0,
  });

  useEffect(() => {
    if (user?.role !== 'admin') {
      router.push('/dashboard');
      return;
    }
    loadContent();
  }, [activeTab, user]);

  const loadContent = async () => {
    try {
      setLoading(true);
      let response;
      let loadedItems: any[] = [];

      switch (activeTab) {
        case 'lessons':
          response = await lessonsAPI.getAllLessons({ search: searchQuery });
          loadedItems = response.data.data || [];
          break;
        case 'quizzes':
          response = await quizAPI.getAllQuizzes({ search: searchQuery });
          loadedItems = response.data.data || [];
          break;
        case 'courses':
          response = await coursesAPI.getAllCourses({ search: searchQuery });
          loadedItems = response.data.data || [];
          break;
        case 'forum':
          response = await forumAPI.getAllPosts({ search: searchQuery });
          loadedItems = response.data.data || [];
          break;
      }

      setItems(loadedItems);

      // Calculate stats from loaded items
      const total = loadedItems.length;
      const published = loadedItems.filter((i: any) => i.status === 'published' || i.isPublished || !i.status).length;
      const draft = loadedItems.filter((i: any) => i.status === 'draft').length;
      const pending = loadedItems.filter((i: any) => i.status === 'pending').length;
      setStats({ total, published, draft, pending });
    } catch (error: any) {
      toast.error('Failed to load content');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (itemId: string, itemTitle: string) => {
    // Show custom confirmation modal
    setDeleteModal({ open: true, itemId, itemTitle });
  };

  const confirmDelete = async () => {
    if (!deleteModal) return;

    const { itemId, itemTitle } = deleteModal;
    setDeleteModal(null);

    toast.promise(
      (async () => {
        switch (activeTab) {
          case 'lessons':
            await lessonsAPI.deleteLesson(itemId);
            break;
          case 'quizzes':
            await quizAPI.deleteQuiz(itemId);
            break;
          case 'courses':
            await coursesAPI.deleteCourse(itemId);
            break;
          case 'forum':
            await forumAPI.deletePost(itemId);
            break;
        }
        await loadContent();
      })(),
      {
        loading: `Deleting "${itemTitle}"...`,
        success: `"${itemTitle}" deleted successfully!`,
        error: (err: any) => err.response?.data?.message || 'Failed to delete item',
      }
    );
  };

  const handleModeratePost = async (postId: string, action: 'approve' | 'reject', postTitle: string) => {
    toast.promise(
      (async () => {
        await forumAPI.moderatePost(postId, { status: action });
        await loadContent();
      })(),
      {
        loading: `${action === 'approve' ? 'Approving' : 'Rejecting'} "${postTitle}"...`,
        success: `"${postTitle}" ${action}d successfully!`,
        error: 'Failed to moderate post',
      }
    );
  };

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.question?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.content?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDifficulty =
      filterDifficulty === 'all' || item.difficulty === filterDifficulty;

    return matchesSearch && matchesDifficulty;
  });

  const getContentIcon = (type: ContentType) => {
    switch (type) {
      case 'lessons': return BookOpen;
      case 'quizzes': return FileText;
      case 'courses': return Award;
      case 'forum': return MessageSquare;
    }
  };

  const getContentColor = (type: ContentType) => {
    switch (type) {
      case 'lessons': return 'from-blue-500 to-blue-600';
      case 'quizzes': return 'from-green-500 to-green-600';
      case 'courses': return 'from-purple-500 to-purple-600';
      case 'forum': return 'from-orange-500 to-orange-600';
    }
  };

  return (
    <div className="min-h-screen bg-page-gradient">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Header */}
        <div className="mb-6">
          <Link href="/admin" className="inline-flex items-center text-green-600 hover:text-green-700 mb-4">
            <ChevronLeft className="w-5 h-5 mr-1" />
            Back to Admin Dashboard
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-green-600 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Package className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Content Management</h1>
                <p className="text-muted-foreground text-sm">Create, edit, and manage platform content</p>
              </div>
            </div>

            <Button
              className="w-full sm:w-auto bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 shadow-md"
              onClick={() => {
                if (activeTab === 'lessons') router.push('/instructor/lessons/create');
                if (activeTab === 'quizzes') router.push('/instructor/quizzes/create');
                if (activeTab === 'courses') router.push('/instructor/courses/create');
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Create New {activeTab.slice(0, -1)}
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
          <Card className="border border-border/50 bg-card shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <Package className="w-4 h-4 text-white" />
                </div>
              </div>
              <p className="text-2xl font-bold text-foreground">{items.length}</p>
              <p className="text-xs text-muted-foreground">Total {activeTab}</p>
            </CardContent>
          </Card>

          <Card className="border border-border/50 bg-card shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-white" />
                </div>
              </div>
              <p className="text-2xl font-bold text-foreground">{stats.published}</p>
              <p className="text-xs text-muted-foreground">Published</p>
            </CardContent>
          </Card>

          <Card className="border border-border/50 bg-card shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                  <Clock className="w-4 h-4 text-white" />
                </div>
              </div>
              <p className="text-2xl font-bold text-foreground">{stats.pending}</p>
              <p className="text-xs text-muted-foreground">Pending</p>
            </CardContent>
          </Card>

          <Card className="border border-border/50 bg-card shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Edit className="w-4 h-4 text-white" />
                </div>
              </div>
              <p className="text-2xl font-bold text-foreground">{stats.draft}</p>
              <p className="text-xs text-muted-foreground">Drafts</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Card className="border border-border/50 bg-card shadow-sm mb-6">
          <CardContent className="p-3 sm:p-4">
            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
              {(['lessons', 'quizzes', 'courses', 'forum'] as ContentType[]).map((tab) => {
                const Icon = getContentIcon(tab);
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex items-center gap-2 px-4 py-2.5 font-medium rounded-lg transition-all whitespace-nowrap text-sm ${activeTab === tab
                        ? 'bg-gradient-to-r from-green-600 to-teal-600 text-white shadow-md'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                      }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="capitalize">{tab}</span>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Search & Filters */}
        <Card className="border border-border/50 bg-card shadow-sm mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={`Search ${activeTab}...`}
                  className="pl-10 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-background text-foreground"
                />
              </div>

              <div className="flex gap-2">
                {activeTab !== 'forum' && (
                  <select
                    value={filterDifficulty}
                    onChange={(e) => setFilterDifficulty(e.target.value)}
                    className="px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-background text-foreground text-sm"
                  >
                    <option value="all">All Levels</option>
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                )}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={loadContent}
                  className="border border-input text-muted-foreground hover:bg-muted"
                >
                  <RefreshCw className="w-4 h-4" />
                </Button>

                <div className="hidden sm:flex gap-1 border border-border/50 rounded-lg p-1 bg-muted/30">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-background shadow text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-background shadow text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Content List */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : filteredItems.length === 0 ? (
          <Card className="border border-border/50 bg-card">
            <CardContent className="p-8 sm:p-12 text-center">
              <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="w-8 h-8 text-primary/50" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">No {activeTab} found</h3>
              <p className="text-muted-foreground mb-4">Get started by creating your first {activeTab.slice(0, -1)}</p>
              <Button
                className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700"
                onClick={() => {
                  if (activeTab === 'lessons') router.push('/instructor/lessons/create');
                  if (activeTab === 'quizzes') router.push('/instructor/quizzes/create');
                  if (activeTab === 'courses') router.push('/instructor/courses/create');
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Create First {activeTab.slice(0, -1)}
              </Button>
            </CardContent>
          </Card>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredItems.map((item) => (
              <Card key={item._id} className="border border-border/50 bg-card shadow-sm hover:shadow-lg transition-all group">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className={`w-10 h-10 bg-gradient-to-br ${getContentColor(activeTab)} rounded-xl flex items-center justify-center`}>
                      {React.createElement(getContentIcon(activeTab), { className: "w-5 h-5 text-white" })}
                    </div>
                    {item.difficulty && (
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${item.difficulty === 'beginner' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                          item.difficulty === 'intermediate' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' :
                            'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                        }`}>
                        {item.difficulty}
                      </span>
                    )}
                  </div>

                  <h3 className="font-semibold text-foreground mb-2 line-clamp-2 min-h-[2.5rem]">
                    {item.title || item.question || 'Untitled'}
                  </h3>

                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2 min-h-[2.5rem]">
                    {item.content || item.description || 'No description'}
                  </p>

                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                    {item.createdAt && (
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                      </div>
                    )}
                    {item.isAIGenerated && (
                      <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-full font-medium">
                        AI
                      </span>
                    )}
                  </div>

                  <div className="flex gap-2">
                    {activeTab === 'forum' && item.status === 'pending' && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => handleModeratePost(item._id, 'approve', item.title || item.question || 'Post')}
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                        >
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleModeratePost(item._id, 'reject', item.title || item.question || 'Post')}
                          className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                        >
                          <XCircle className="w-3 h-3 mr-1" />
                          Reject
                        </Button>
                      </>
                    )}

                    {(!item.status || item.status !== 'pending') && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setViewModal({ open: true, item, type: activeTab })}
                          className="flex-1 border-input text-muted-foreground hover:bg-muted"
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          View
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => router.push(`/instructor/${activeTab}/${item._id}/edit`)}
                          className="flex-1 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30"
                        >
                          <Edit className="w-3 h-3 mr-1" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(item._id, item.title || item.question || 'Item')}
                          className="border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredItems.map((item) => (
              <Card key={item._id} className="border border-border/50 bg-card shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-4 sm:p-5">
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className={`flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br ${getContentColor(activeTab)} rounded-xl flex items-center justify-center`}>
                      {React.createElement(getContentIcon(activeTab), { className: "w-5 h-5 sm:w-6 sm:h-6 text-white" })}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base sm:text-lg font-semibold text-foreground mb-1 line-clamp-2">
                            {item.title || item.question || 'Untitled'}
                          </h3>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {item.content || item.description || 'No description'}
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {item.difficulty && (
                            <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${item.difficulty === 'beginner' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                                item.difficulty === 'intermediate' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' :
                                  'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                              }`}>
                              {item.difficulty}
                            </span>
                          )}
                          {item.isAIGenerated && (
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 whitespace-nowrap">
                              AI Generated
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-muted-foreground">
                          {item.author && (
                            <div className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              <span>{item.author.name || 'Unknown'}</span>
                            </div>
                          )}
                          {item.topic && (
                            <span className="px-2 py-1 bg-muted rounded">
                              {item.topic}
                            </span>
                          )}
                          {item.category && (
                            <span className="px-2 py-1 bg-muted rounded">
                              {item.category}
                            </span>
                          )}
                          {item.createdAt && (
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                            </div>
                          )}
                        </div>

                        <div className="flex gap-2">
                          {activeTab === 'forum' && item.status === 'pending' ? (
                            <>
                              <Button
                                size="sm"
                                onClick={() => handleModeratePost(item._id, 'approve', item.title || item.question || 'Post')}
                                className="bg-green-600 hover:bg-green-700 text-white"
                              >
                                <CheckCircle className="w-4 h-4 mr-1" />
                                <span className="hidden sm:inline">Approve</span>
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handleModeratePost(item._id, 'reject', item.title || item.question || 'Post')}
                                className="bg-red-600 hover:bg-red-700 text-white"
                              >
                                <XCircle className="w-4 h-4 mr-1" />
                                <span className="hidden sm:inline">Reject</span>
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setViewModal({ open: true, item, type: activeTab })}
                                className="text-muted-foreground hover:text-foreground hover:bg-muted"
                                title="View"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>

                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => router.push(`/instructor/${activeTab}/${item._id}/edit`)}
                                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/30"
                                title="Edit"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>

                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDelete(item._id, item.title || item.question || 'Item')}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </>
                          )}
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

      {/* View Modal */}
      {viewModal?.open && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setViewModal(null)}>
          <div className="bg-card border border-border/50 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-green-600 to-teal-600 text-white p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {React.createElement(getContentIcon(viewModal.type), { className: "w-6 h-6" })}
                <div>
                  <h2 className="text-xl font-bold">
                    {viewModal.item.title || viewModal.item.question || 'Content Details'}
                  </h2>
                  <p className="text-green-100 text-sm">
                    {viewModal.type.charAt(0).toUpperCase() + viewModal.type.slice(1)}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setViewModal(null)}
                className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Metadata */}
              <div className="flex flex-wrap gap-3">
                {viewModal.item.difficulty && (
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${viewModal.item.difficulty === 'beginner' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                      viewModal.item.difficulty === 'intermediate' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' :
                        'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                    }`}>
                    {viewModal.item.difficulty}
                  </span>
                )}
                {viewModal.item.status && (
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${viewModal.item.status === 'published' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                      viewModal.item.status === 'draft' ? 'bg-muted text-muted-foreground' :
                        'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                    }`}>
                    {viewModal.item.status}
                  </span>
                )}
                {viewModal.item.isAIGenerated && (
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400">
                    🤖 AI Generated
                  </span>
                )}
              </div>

              {/* Description/Content */}
              {(viewModal.item.description || viewModal.item.content) && (
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-2">Description</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {viewModal.item.description || viewModal.item.content}
                  </p>
                </div>
              )}

              {/* Quiz-specific fields */}
              {viewModal.type === 'quizzes' && (
                <>
                  {viewModal.item.options && (
                    <div>
                      <h3 className="text-sm font-semibold text-foreground mb-2">Options</h3>
                      <div className="space-y-2">
                        {viewModal.item.options.map((option: string, idx: number) => (
                          <div
                            key={idx}
                            className={`p-3 rounded-lg border ${viewModal.item.correctAnswer === option
                                ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                                : 'border-border/50'
                              }`}
                          >
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-foreground">{String.fromCharCode(65 + idx)}.</span>
                              <span className="text-foreground">{option}</span>
                              {viewModal.item.correctAnswer === option && (
                                <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 ml-auto" />
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {viewModal.item.explanation && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                      <h3 className="text-sm font-semibold text-blue-700 dark:text-blue-400 mb-2">Explanation</h3>
                      <p className="text-blue-900 dark:text-blue-300">{viewModal.item.explanation}</p>
                    </div>
                  )}
                </>
              )}

              {/* Additional Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-border/50">
                {viewModal.item.author && (
                  <div>
                    <h3 className="text-sm font-semibold text-foreground mb-1">Author</h3>
                    <p className="text-muted-foreground">{viewModal.item.author.name || 'Unknown'}</p>
                  </div>
                )}
                {viewModal.item.topic && (
                  <div>
                    <h3 className="text-sm font-semibold text-foreground mb-1">Topic</h3>
                    <p className="text-muted-foreground">{viewModal.item.topic}</p>
                  </div>
                )}
                {viewModal.item.category && (
                  <div>
                    <h3 className="text-sm font-semibold text-foreground mb-1">Category</h3>
                    <p className="text-muted-foreground">{viewModal.item.category}</p>
                  </div>
                )}
                {viewModal.item.createdAt && (
                  <div>
                    <h3 className="text-sm font-semibold text-foreground mb-1">Created</h3>
                    <p className="text-muted-foreground">{new Date(viewModal.item.createdAt).toLocaleString()}</p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-border/50">
                <Button
                  onClick={() => {
                    router.push(`/instructor/${viewModal.type}/${viewModal.item._id}/edit`);
                    setViewModal(null);
                  }}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Content
                </Button>
                <Button
                  onClick={() => {
                    handleDelete(viewModal.item._id, viewModal.item.title || viewModal.item.question || 'Item');
                    setViewModal(null);
                  }}
                  variant="outline"
                  className="border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal?.open && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={() => setDeleteModal(null)}>
          <div className="bg-card border border-border/50 rounded-2xl max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-6 rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Delete Content</h2>
                  <p className="text-red-100 text-sm">This action cannot be undone</p>
                </div>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <p className="text-foreground mb-2">
                Are you sure you want to delete this content?
              </p>
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
                <p className="font-semibold text-red-900 dark:text-red-300 break-words">
                  "{deleteModal.itemTitle}"
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  onClick={() => setDeleteModal(null)}
                  variant="outline"
                  className="flex-1 border border-input text-foreground hover:bg-muted font-medium"
                >
                  Cancel
                </Button>
                <Button
                  onClick={confirmDelete}
                  className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-medium"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
