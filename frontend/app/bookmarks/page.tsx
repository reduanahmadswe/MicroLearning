'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Bookmark, BookOpen, Clock, X, ChevronLeft, Trash2 } from 'lucide-react';
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
      toast.success('Bookmark removed');
    } catch (error: any) {
      toast.error('Failed to remove bookmark');
    }
  };

  const filteredBookmarks = selectedCollection === 'All' 
    ? bookmarks 
    : bookmarks.filter(b => b.collection === selectedCollection);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading bookmarks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
              >
                <ChevronLeft size={20} />
                <span>Back to Dashboard</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Bookmark className="w-8 h-8 text-amber-600" />
            <h1 className="text-3xl font-bold text-gray-900">My Bookmarks</h1>
          </div>
          <p className="text-gray-600">
            {bookmarks.length} bookmarked lesson{bookmarks.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Collection Filters */}
        {collections.length > 1 && (
          <div className="mb-6 flex gap-2 flex-wrap">
            {collections.map((collection) => (
              <button
                key={collection}
                onClick={() => setSelectedCollection(collection)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCollection === collection
                    ? 'bg-amber-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                }`}
              >
                {collection}
                {collection !== 'All' && ` (${bookmarks.filter(b => b.collection === collection).length})`}
              </button>
            ))}
          </div>
        )}

        {/* Bookmarks List */}
        {filteredBookmarks.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <Bookmark size={64} className="mx-auto text-gray-300 mb-4" />
            <h2 className="text-xl font-semibold text-gray-700 mb-2">
              No bookmarks yet
            </h2>
            <p className="text-gray-500 mb-6">
              Start bookmarking lessons to save them for later!
            </p>
            <Link
              href="/courses"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
            >
              Browse Courses
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredBookmarks.map((bookmark) => (
              <div
                key={bookmark._id}
                className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <BookOpen className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <Link
                          href={`/lessons/${bookmark.lesson._id}`}
                          className="text-lg font-semibold text-gray-900 hover:text-blue-600 line-clamp-2"
                        >
                          {bookmark.lesson.title}
                        </Link>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {bookmark.lesson.description}
                        </p>
                        <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                          {bookmark.lesson.course && (
                            <Link 
                              href={`/courses/${bookmark.lesson.course._id}`}
                              className="flex items-center gap-1 hover:text-blue-600"
                            >
                              <BookOpen size={14} />
                              <span>{bookmark.lesson.course.title}</span>
                            </Link>
                          )}
                          <div className="flex items-center gap-1">
                            <Clock size={14} />
                            <span>{bookmark.lesson.duration} min</span>
                          </div>
                          <span className="px-2 py-1 bg-amber-100 text-amber-800 rounded text-xs font-medium">
                            {bookmark.collection}
                          </span>
                        </div>
                        {bookmark.notes && (
                          <div className="mt-3 p-3 bg-gray-50 rounded border border-gray-200">
                            <p className="text-sm text-gray-700">{bookmark.notes}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveBookmark(bookmark.lesson._id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Remove bookmark"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
