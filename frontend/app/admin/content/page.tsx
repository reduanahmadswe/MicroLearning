'use client';

import { useEffect, useState } from 'react';
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
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { lessonsAPI, quizAPI, coursesAPI, flashcardsAPI, forumAPI } from '@/services/api.service';
import { toast } from 'sonner';

type ContentType = 'lessons' | 'quizzes' | 'courses' | 'flashcards' | 'forum';

export default function AdminContentPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<ContentType>('lessons');
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all');

  useEffect(() => {
    loadContent();
  }, [activeTab]);

  const loadContent = async () => {
    try {
      setLoading(true);
      let response;

      switch (activeTab) {
        case 'lessons':
          response = await lessonsAPI.getAllLessons({ search: searchQuery });
          setItems(response.data.data || []);
          break;
        case 'quizzes':
          response = await quizAPI.getAllQuizzes({ search: searchQuery });
          setItems(response.data.data || []);
          break;
        case 'courses':
          response = await coursesAPI.getAllCourses({ search: searchQuery });
          setItems(response.data.data || []);
          break;
        case 'flashcards':
          response = await flashcardsAPI.getAllFlashcards({ search: searchQuery });
          setItems(response.data.data || []);
          break;
        case 'forum':
          response = await forumAPI.getAllPosts({ search: searchQuery });
          setItems(response.data.data || []);
          break;
      }
    } catch (error: any) {
      toast.error('Failed to load content');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (itemId: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
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
        case 'flashcards':
          await flashcardsAPI.deleteFlashcard(itemId);
          break;
        case 'forum':
          await forumAPI.deletePost(itemId);
          break;
      }
      toast.success('Item deleted successfully');
      loadContent();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete item');
    }
  };

  const handleModeratePost = async (postId: string, action: 'approve' | 'reject') => {
    try {
      await forumAPI.moderatePost(postId, { status: action });
      toast.success(`Post ${action}d successfully`);
      loadContent();
    } catch (error: any) {
      toast.error('Failed to moderate post');
    }
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <Link href="/admin">
                <Button variant="ghost" size="sm" className="mb-2">
                  ← Back to Admin
                </Button>
              </Link>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                <BookOpen className="w-8 h-8 text-blue-600" />
                Content Management
              </h1>
              <p className="text-gray-600 mt-1">Create, edit, and manage platform content</p>
            </div>
            <Button 
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              onClick={() => {
                if (activeTab === 'lessons') router.push('/admin/content/lessons/create');
                if (activeTab === 'quizzes') router.push('/admin/content/quizzes/create');
                if (activeTab === 'courses') router.push('/admin/content/courses/create');
                if (activeTab === 'flashcards') router.push('/admin/content/flashcards/create');
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Create New
            </Button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mt-6 overflow-x-auto">
            {(['lessons', 'quizzes', 'courses', 'flashcards', 'forum'] as ContentType[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2 font-medium rounded-lg transition-colors whitespace-nowrap ${
                  activeTab === tab
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {tab === 'lessons' && <BookOpen className="w-4 h-4 inline mr-2" />}
                {tab === 'quizzes' && <FileText className="w-4 h-4 inline mr-2" />}
                {tab === 'courses' && <Award className="w-4 h-4 inline mr-2" />}
                {tab === 'flashcards' && <Sparkles className="w-4 h-4 inline mr-2" />}
                {tab === 'forum' && <MessageSquare className="w-4 h-4 inline mr-2" />}
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search & Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={`Search ${activeTab}...`}
                  className="pl-10"
                />
              </div>
              {activeTab !== 'forum' && (
                <select
                  value={filterDifficulty}
                  onChange={(e) => setFilterDifficulty(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Difficulty</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              )}
              <Button variant="outline" onClick={loadContent}>
                <Filter className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Content List */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredItems.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <p className="text-gray-500 text-lg">No {activeTab} found</p>
                  <Button className="mt-4" onClick={() => router.push(`/admin/content/${activeTab}/create`)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create First {activeTab.slice(0, -1)}
                  </Button>
                </CardContent>
              </Card>
            ) : (
              filteredItems.map((item) => (
                <Card key={item._id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {item.title || item.question || 'Untitled'}
                          </h3>
                          {item.difficulty && (
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              item.difficulty === 'beginner' ? 'bg-green-100 text-green-700' :
                              item.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              {item.difficulty}
                            </span>
                          )}
                          {item.isAIGenerated && (
                            <span className="px-2 py-1 rounded text-xs font-medium bg-purple-100 text-purple-700">
                              AI Generated
                            </span>
                          )}
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {item.content || item.description || 'No description'}
                        </p>

                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          {item.author && (
                            <span>By: {item.author.name || 'Unknown'}</span>
                          )}
                          {item.topic && (
                            <span className="px-2 py-1 bg-gray-100 rounded">
                              {item.topic}
                            </span>
                          )}
                          {item.category && (
                            <span className="px-2 py-1 bg-gray-100 rounded">
                              {item.category}
                            </span>
                          )}
                          {item.createdAt && (
                            <span>
                              {new Date(item.createdAt).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2 ml-4">
                        {activeTab === 'forum' && item.status === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleModeratePost(item._id, 'approve')}
                              className="text-green-600 hover:text-green-700"
                              title="Approve"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleModeratePost(item._id, 'reject')}
                              className="text-red-600 hover:text-red-700"
                              title="Reject"
                            >
                              <XCircle className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                        
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => router.push(`/admin/content/${activeTab}/${item._id}`)}
                          title="View"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => router.push(`/admin/content/${activeTab}/${item._id}/edit`)}
                          title="Edit"
                        >
                          <Edit className="w-4 h-4 text-blue-600" />
                        </Button>
                        
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(item._id)}
                          title="Delete"
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
