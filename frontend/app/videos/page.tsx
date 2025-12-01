'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Play,
  Clock,
  Eye,
  Heart,
  Search,
  Filter,
  TrendingUp,
  Sparkles,
  ChevronRight,
  Video,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { lessonsAPI } from '@/services/api.service';
import { toast } from 'sonner';
import { Lesson } from '@/types';

export default function VideosPage() {
  const router = useRouter();
  const [videos, setVideos] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [selectedTopic, setSelectedTopic] = useState<string>('all');

  const topics = ['Programming', 'Mathematics', 'Science', 'Business', 'Language', 'Design'];
  const difficulties = ['beginner', 'intermediate', 'advanced'];

  useEffect(() => {
    loadVideos();
  }, [selectedDifficulty, selectedTopic]);

  const loadVideos = async () => {
    try {
      setLoading(true);
      const params: any = { hasVideo: true }; // Filter for lessons with video
      if (selectedDifficulty !== 'all') params.difficulty = selectedDifficulty;
      if (selectedTopic !== 'all') params.topic = selectedTopic;
      if (searchQuery) params.search = searchQuery;

      const response = await lessonsAPI.getLessons(params);
      // Filter lessons that have video media
      const videoLessons = (response.data.data || []).filter(
        (lesson: Lesson) => lesson.media && lesson.media.some(m => m.type === 'video')
      );
      setVideos(videoLessons);
    } catch (error: any) {
      toast.error('Failed to load videos');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadVideos();
  };

  const getVideoDuration = (lesson: Lesson) => {
    const videoMedia = lesson.media?.find(m => m.type === 'video');
    return videoMedia?.duration || lesson.estimatedTime || 0;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <Link href="/dashboard">
                <Button variant="ghost" size="sm" className="mb-2">
                  ← Back to Dashboard
                </Button>
              </Link>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                <Video className="w-8 h-8 text-blue-600" />
                Video Lessons
              </h1>
              <p className="text-gray-600 mt-1">Learn through engaging video content</p>
            </div>
            <Button
              onClick={() => router.push('/lessons')}
              variant="outline"
            >
              View All Lessons
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Videos</p>
                  <p className="text-2xl font-bold text-gray-900">{videos.length}</p>
                </div>
                <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                  <Video className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Watch Time</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {videos.reduce((acc, v) => acc + getVideoDuration(v), 0)} min
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Most Viewed</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {Math.max(...videos.map(v => v.views || 0), 0)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="mb-8 space-y-4">
          <form onSubmit={handleSearch} className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search videos..."
                className="pl-10"
              />
            </div>
            <Button type="submit">Search</Button>
          </form>

          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Difficulty:</span>
              <div className="flex gap-2">
                <Button
                  variant={selectedDifficulty === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedDifficulty('all')}
                >
                  All
                </Button>
                {difficulties.map((diff) => (
                  <Button
                    key={diff}
                    variant={selectedDifficulty === diff ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedDifficulty(diff)}
                  >
                    {diff.charAt(0).toUpperCase() + diff.slice(1)}
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">Topic:</span>
              <select
                value={selectedTopic}
                onChange={(e) => setSelectedTopic(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm"
              >
                <option value="all">All Topics</option>
                {topics.map((topic) => (
                  <option key={topic} value={topic}>
                    {topic}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Videos Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : videos.length === 0 ? (
          <Card className="p-12 text-center">
            <Video className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No video lessons found</h3>
            <p className="text-gray-600 mb-4">
              {searchQuery || selectedDifficulty !== 'all' || selectedTopic !== 'all'
                ? 'Try adjusting your filters'
                : 'Video lessons will appear here once available'}
            </p>
            <Button onClick={() => router.push('/lessons')}>
              View All Lessons
            </Button>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map((video) => (
              <Card
                key={video._id}
                className="hover:shadow-xl transition-all hover:-translate-y-1 cursor-pointer group"
              >
                <div className="relative aspect-video bg-gray-900 rounded-t-lg overflow-hidden">
                  {video.thumbnailUrl ? (
                    <img
                      src={video.thumbnailUrl}
                      alt={video.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Video className="w-16 h-16 text-gray-600" />
                    </div>
                  )}
                  
                  {/* Play Overlay */}
                  <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                      <Play className="w-8 h-8 text-blue-600 ml-1" />
                    </div>
                  </div>

                  {/* Duration Badge */}
                  <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs font-medium">
                    {getVideoDuration(video)} min
                  </div>
                </div>

                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <div
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        video.difficulty === 'beginner'
                          ? 'bg-green-100 text-green-700'
                          : video.difficulty === 'intermediate'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {video.difficulty}
                    </div>
                  </div>
                  <CardTitle className="text-base line-clamp-2">{video.title}</CardTitle>
                </CardHeader>

                <CardContent>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {video.description || video.summary}
                  </p>

                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      <span>{video.views || 0} views</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Heart className="w-4 h-4" />
                      <span>{video.likes || 0} likes</span>
                    </div>
                  </div>

                  {video.tags && video.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {video.tags.slice(0, 3).map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-blue-50 text-blue-600 rounded text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <Link href={`/lessons/${video._id}`}>
                    <Button className="w-full">
                      <Play className="w-4 h-4 mr-2" />
                      Watch Now
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
