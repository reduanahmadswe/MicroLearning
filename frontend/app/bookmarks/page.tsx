'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Bookmark,
  BookOpen,
  Clock,
  Trash2,
  ChevronLeft,
  BookmarkCheck,
  Sparkles,
  Search,
  Filter,
  Heart,
  Play,
  Loader2,
  FolderOpen,
  Star,
  Calendar,
  Tag,
  Eye,
  TrendingUp,
  Archive,
  Grid3x3,
  List,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { bookmarkAPI } from '@/services/api.service';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';

interface BookmarkedLesson {
  _id: string;
  lesson: {
    _id: string;
    title: string;
    description: string;
    duration: number;
    course: {
      _id: string;
      title: string;
    };
  };
  collection: string;
  notes?: string;
  createdAt: string;
}

export default function BookmarksPage() {
  const router = useRouter();
  const { token } = useAuthStore();
  const [bookmarks, setBookmarks] = useState<BookmarkedLesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [collections, setCollections] = useState<string[]>([]);
  const [selectedCollection, setSelectedCollection] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    if (!token) {
      router.push('/auth/login');
      return;
    }
    loadBookmarks();
  }, [token]);

  const loadBookmarks = async () => {
    try {
      setLoading(true);
      const response = await bookmarkAPI.getMyBookmarks();
      const bookmarksData: BookmarkedLesson[] = response.data.data || [];
      setBookmarks(bookmarksData);

      // Extract unique collections
      const uniqueCollections: string[] = ['All', ...Array.from(new Set(bookmarksData.map((b) => b.collection)))];
      setCollections(uniqueCollections);
    } catch (error: any) {
      console.error('Error loading bookmarks:', error);
      toast.error('Failed to load bookmarks');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveBookmark = async (lessonId: string) => {
    try {
      await bookmarkAPI.removeBookmark(lessonId);
      setBookmarks(bookmarks.filter(b => b.lesson._id !== lessonId));
      toast.success('🗑️ Bookmark removed');
    } catch (error: any) {
      toast.error('Failed to remove bookmark');
    }
  };

  // Filter bookmarks
  const filteredBookmarks = bookmarks.filter((bookmark) => {
    const matchesCollection = selectedCollection === 'All' || bookmark.collection === selectedCollection;
    const matchesSearch = !searchQuery || 
      bookmark.lesson.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bookmark.lesson.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bookmark.lesson.course?.title?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCollection && matchesSearch;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-teal-50 to-emerald-50 flex items-center justify-center p-4">
        <Card className="border-0 shadow-2xl bg-white/90 backdrop-blur-sm">
          <CardContent className="flex flex-col items-center justify-center py-12 sm:py-16 px-6 sm:px-12">
            <Loader2 className="w-12 h-12 sm:w-16 sm:h-16 animate-spin text-green-600 mb-4" />
            <p className="text-gray-600 font-medium text-sm sm:text-base">Loading your bookmarks...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-teal-50 to-emerald-50">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-64 sm:w-96 h-64 sm:h-96 bg-green-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute top-40 right-10 w-64 sm:w-96 h-64 sm:h-96 bg-teal-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-1/2 w-64 sm:w-96 h-64 sm:h-96 bg-emerald-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Back Button */}
        <div className="mb-4 sm:mb-6">
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-2 text-gray-600 hover:text-green-600 transition-colors group"
          >
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium text-sm sm:text-base">Back to Dashboard</span>
          </button>
        </div>

        {/* Page Header */}
        <div className="mb-6 sm:mb-8 lg:mb-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div>
              <div className="flex items-center gap-2 sm:gap-3 mb-2">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-green-600 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <BookmarkCheck className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900">
                  My Bookmarks
                </h1>
              </div>
              <p className="text-sm sm:text-base text-gray-600 ml-12 sm:ml-14">
                Your saved lessons and learning resources
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-green-600 animate-pulse" />
              <span className="text-sm font-semibold text-green-600">
                {bookmarks.length} Bookmark{bookmarks.length !== 1 ? 's' : ''} Saved
              </span>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        {bookmarks.length > 0 && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
            {/* Total Bookmarks */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-green-500 to-teal-600 overflow-hidden group hover:shadow-xl transition-all duration-300">
              <CardContent className="p-4 sm:p-6 relative">
                <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10 group-hover:scale-110 transition-transform"></div>
                <div className="relative">
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                      <BookmarkCheck className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    </div>
                  </div>
                  <p className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white mb-1">
                    {bookmarks.length}
                  </p>
                  <p className="text-xs text-green-100 font-medium">Total Saved</p>
                </div>
              </CardContent>
            </Card>

            {/* Collections */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-teal-500 to-cyan-600 overflow-hidden group hover:shadow-xl transition-all duration-300">
              <CardContent className="p-4 sm:p-6 relative">
                <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10 group-hover:scale-110 transition-transform"></div>
                <div className="relative">
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                      <FolderOpen className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    </div>
                  </div>
                  <p className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white mb-1">
                    {collections.length - 1}
                  </p>
                  <p className="text-xs text-teal-100 font-medium">Collections</p>
                </div>
              </CardContent>
            </Card>

            {/* Total Time */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-500 to-green-600 overflow-hidden group hover:shadow-xl transition-all duration-300">
              <CardContent className="p-4 sm:p-6 relative">
                <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10 group-hover:scale-110 transition-transform"></div>
                <div className="relative">
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                      <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    </div>
                  </div>
                  <p className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white mb-1">
                    {bookmarks.reduce((sum, b) => sum + (b.lesson.duration || 0), 0)}
                  </p>
                  <p className="text-xs text-emerald-100 font-medium">Total Minutes</p>
                </div>
              </CardContent>
            </Card>

            {/* Recent */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-cyan-500 to-blue-600 overflow-hidden group hover:shadow-xl transition-all duration-300">
              <CardContent className="p-4 sm:p-6 relative">
                <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10 group-hover:scale-110 transition-transform"></div>
                <div className="relative">
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    </div>
                  </div>
                  <p className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white mb-1">
                    {bookmarks.filter(b => {
                      const daysSince = (Date.now() - new Date(b.createdAt).getTime()) / (1000 * 60 * 60 * 24);
                      return daysSince <= 7;
                    }).length}
                  </p>
                  <p className="text-xs text-cyan-100 font-medium">This Week</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Search, Filter and View Toggle */}
        <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm mb-6">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search bookmarks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm sm:text-base text-gray-900"
                />
              </div>

              {/* View Toggle */}
              <div className="flex gap-2">
                <Button
                  onClick={() => setViewMode('grid')}
                  variant="outline"
                  className={`${
                    viewMode === 'grid'
                      ? 'bg-green-600 text-white border-green-600 hover:bg-green-700 hover:text-white'
                      : 'hover:bg-green-50 hover:border-green-200'
                  }`}
                >
                  <Grid3x3 className="w-4 h-4" />
                </Button>
                <Button
                  onClick={() => setViewMode('list')}
                  variant="outline"
                  className={`${
                    viewMode === 'list'
                      ? 'bg-green-600 text-white border-green-600 hover:bg-green-700 hover:text-white'
                      : 'hover:bg-green-50 hover:border-green-200'
                  }`}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Collection Filters */}
            {collections.length > 1 && (
              <div className="flex gap-2 flex-wrap mt-4">
                {collections.map((collection) => (
                  <Button
                    key={collection}
                    onClick={() => setSelectedCollection(collection)}
                    variant="outline"
                    className={`text-xs sm:text-sm ${
                      selectedCollection === collection
                        ? 'bg-green-600 text-white border-green-600 hover:bg-green-700 hover:text-white'
                        : 'hover:bg-green-50 hover:border-green-200'
                    }`}
                  >
                    <Tag className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5" />
                    {collection}
                    {collection !== 'All' && (
                      <span className="ml-1.5 px-1.5 py-0.5 bg-white/20 rounded-full text-xs">
                        {bookmarks.filter(b => b.collection === collection).length}
                      </span>
                    )}
                  </Button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Empty State */}
        {bookmarks.length === 0 ? (
          <Card className="border-0 shadow-2xl bg-white/90 backdrop-blur-sm overflow-hidden">
            <CardContent className="p-8 sm:p-12 lg:p-16 text-center">
              <div className="max-w-md mx-auto">
                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-green-100 to-teal-100 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <Bookmark className="w-10 h-10 sm:w-12 sm:h-12 text-green-600" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">
                  No Bookmarks Yet
                </h3>
                <p className="text-sm sm:text-base text-gray-600 mb-8 leading-relaxed">
                  Start bookmarking your favorite lessons to access them quickly anytime!
                </p>
                <Link href="/courses">
                  <Button className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 shadow-lg px-6 sm:px-8 py-5 sm:py-6 text-sm sm:text-base font-semibold">
                    <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                    Browse Courses
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : filteredBookmarks.length === 0 ? (
          <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
            <CardContent className="p-8 sm:p-12 text-center">
              <Search className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                No Results Found
              </h3>
              <p className="text-sm sm:text-base text-gray-600">
                Try adjusting your search or filter criteria
              </p>
            </CardContent>
          </Card>
        ) : (
          /* Bookmarks Grid/List */
          <div className={
            viewMode === 'grid' 
              ? 'grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6' 
              : 'space-y-4'
          }>
            {filteredBookmarks.map((bookmark) => (
              <Card 
                key={bookmark._id} 
                className="border-0 shadow-lg hover:shadow-2xl bg-white/90 backdrop-blur-sm transition-all duration-300 overflow-hidden group"
              >
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-start gap-3 sm:gap-4 mb-4">
                    {/* Icon */}
                    <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-green-500 to-teal-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                      <BookOpen className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/lessons/${bookmark.lesson._id}`}
                        className="text-base sm:text-lg font-bold text-gray-900 hover:text-green-600 transition-colors line-clamp-2 block mb-2"
                      >
                        {bookmark.lesson.title}
                      </Link>
                      
                      {bookmark.lesson.description && (
                        <p className="text-xs sm:text-sm text-gray-600 line-clamp-2 mb-3">
                          {bookmark.lesson.description}
                        </p>
                      )}

                      {/* Meta Info */}
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-600 mb-3">
                        {bookmark.lesson.course && (
                          <Link 
                            href={`/courses/${bookmark.lesson.course._id}`}
                            className="flex items-center gap-1 hover:text-green-600 transition-colors"
                          >
                            <BookOpen className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span className="truncate max-w-[150px]">{bookmark.lesson.course.title}</span>
                          </Link>
                        )}
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
                          <span>{bookmark.lesson.duration || 0} min</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
                          <span>{new Date(bookmark.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                        </div>
                      </div>

                      {/* Collection Badge */}
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 px-2 sm:px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                          <Tag className="w-3 h-3" />
                          {bookmark.collection}
                        </span>
                      </div>

                      {/* Notes */}
                      {bookmark.notes && (
                        <div className="mt-3 p-3 bg-gradient-to-br from-green-50 to-teal-50 rounded-lg border border-green-100">
                          <p className="text-xs sm:text-sm text-gray-700 italic">"{bookmark.notes}"</p>
                        </div>
                      )}
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => handleRemoveBookmark(bookmark.lesson._id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all flex-shrink-0"
                      title="Remove bookmark"
                    >
                      <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-3 border-t border-gray-100">
                    <Link href={`/lessons/${bookmark.lesson._id}`} className="flex-1">
                      <Button className="w-full bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-xs sm:text-sm font-semibold">
                        <Play className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5" />
                        Start Learning
                      </Button>
                    </Link>
                    {bookmark.lesson.course && (
                      <Link href={`/courses/${bookmark.lesson.course._id}`}>
                        <Button variant="outline" className="border-green-200 hover:bg-green-50 hover:border-green-300 text-xs sm:text-sm">
                          <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                        </Button>
                      </Link>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Results Summary */}
        {filteredBookmarks.length > 0 && (
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Showing <span className="font-semibold text-green-600">{filteredBookmarks.length}</span> of{' '}
              <span className="font-semibold">{bookmarks.length}</span> bookmark{bookmarks.length !== 1 ? 's' : ''}
            </p>
          </div>
        )}

        {/* Quick Actions */}
        {bookmarks.length > 0 && (
          <Card className="mt-8 border-0 shadow-lg bg-gradient-to-br from-green-600 to-teal-600 overflow-hidden">
            <CardContent className="p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-white">
                <div>
                  <h3 className="text-lg sm:text-xl font-bold mb-1">Keep Learning!</h3>
                  <p className="text-sm sm:text-base text-green-100">
                    Continue from where you left off and achieve your goals
                  </p>
                </div>
                <Link href="/courses">
                  <Button 
                    variant="outline" 
                    className="bg-white/20 text-white border-white/30 hover:bg-white/30 backdrop-blur-sm whitespace-nowrap"
                  >
                    <BookOpen className="w-4 h-4 mr-2" />
                    Explore More
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

