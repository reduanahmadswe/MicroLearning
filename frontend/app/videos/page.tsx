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
  BookOpen,
  Youtube,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { lessonsAPI, enrollmentsAPI, profileAPI } from '@/services/api.service';
import { toast } from 'sonner';
import { Lesson } from '@/types';

interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  channelTitle: string;
  publishedAt: string;
  duration?: string;
}

export default function VideosPage() {
  const router = useRouter();
  const [videos, setVideos] = useState<Lesson[]>([]);
  const [youtubeVideos, setYoutubeVideos] = useState<YouTubeVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [selectedTopic, setSelectedTopic] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'course' | 'youtube'>('course');
  const [youtubeSearching, setYoutubeSearching] = useState(false);
  const [selectedYoutubeVideo, setSelectedYoutubeVideo] = useState<YouTubeVideo | null>(null);
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);

  const topics = ['Programming', 'Mathematics', 'Science', 'Business', 'Language', 'Design'];
  const difficulties = ['beginner', 'intermediate', 'advanced'];

  useEffect(() => {
    loadEnrolledVideos();
    loadRecommendedVideos();
  }, [selectedDifficulty, selectedTopic]);

  const loadRecommendedVideos = async () => {
    try {
      // Get user profile to fetch interests
      const profileResponse = await profileAPI.getMyProfile();
      const userInterests = profileResponse.data.data?.interests || [];
      
      // Create dynamic search query with randomization
      let searchQuery = '';
      
      if (userInterests.length > 0) {
        // Randomly shuffle and select interests to create variety
        const shuffledInterests = [...userInterests].sort(() => Math.random() - 0.5);
        const selectedInterests = shuffledInterests.slice(0, Math.floor(Math.random() * 2) + 1); // 1-2 interests
        
        // Add variety modifiers randomly
        const modifiers = ['tutorial', 'course', 'learn', 'introduction', 'guide', 'explained', 'basics', 'advanced'];
        const randomModifier = modifiers[Math.floor(Math.random() * modifiers.length)];
        
        // Add difficulty level randomly
        const levels = ['beginner', 'intermediate', 'advanced', ''];
        const randomLevel = levels[Math.floor(Math.random() * levels.length)];
        
        // Add time-based variation (changes throughout the day)
        const hour = new Date().getHours();
        const timeModifier = hour < 12 ? 'morning' : hour < 18 ? 'quick' : 'complete';
        
        // Combine for unique search each time
        searchQuery = `${selectedInterests.join(' ')} ${randomModifier} ${randomLevel} ${timeModifier}`.trim();
      } else {
        // Default with variety
        const defaultTopics = [
          'programming tutorial',
          'web development course',
          'python for beginners',
          'javascript explained',
          'data structures guide',
          'algorithm basics',
          'react tutorial',
          'machine learning intro'
        ];
        searchQuery = defaultTopics[Math.floor(Math.random() * defaultTopics.length)];
      }
      
      // Add random relevance sorting
      const sortOptions = ['relevance', 'date', 'viewCount', 'rating'];
      const randomSort = sortOptions[Math.floor(Math.random() * sortOptions.length)];
      
      await searchYouTube(searchQuery, true, randomSort); // true = silent load
    } catch (error) {
      console.error('Failed to load recommended videos:', error);
      // Silently fail, user can still search manually
    }
  };

  const loadEnrolledVideos = async () => {
    try {
      setLoading(true);
      // Get enrolled courses
      const enrollmentResponse = await enrollmentsAPI.getMyEnrollments();
      const enrollments = enrollmentResponse.data.data || [];
      
      // Get all lessons from enrolled courses
      const allLessons: Lesson[] = [];
      for (const enrollment of enrollments) {
        if (enrollment.course && enrollment.course.lessons) {
          const courseLessons = enrollment.course.lessons.filter(
            (lesson: Lesson) => lesson.media && lesson.media.some(m => m.type === 'video')
          );
          allLessons.push(...courseLessons);
        }
      }

      // Apply filters
      let filteredLessons = allLessons;
      if (selectedDifficulty !== 'all') {
        filteredLessons = filteredLessons.filter(l => l.difficulty === selectedDifficulty);
      }
      if (selectedTopic !== 'all') {
        filteredLessons = filteredLessons.filter(l => 
          l.tags?.some(tag => tag.toLowerCase().includes(selectedTopic.toLowerCase()))
        );
      }

      setVideos(filteredLessons);
    } catch (error: any) {
      console.error('Failed to load enrolled videos:', error);
      toast.error('Failed to load your video lessons');
    } finally {
      setLoading(false);
    }
  };

  const searchYouTube = async (query: string, silent = false, order = 'relevance') => {
    if (!query.trim()) {
      if (!silent) toast.error('Please enter a search term');
      return;
    }

    try {
      setYoutubeSearching(true);
      const apiKey = 'AIzaSyC2bdhYca2ibG35a2Y36eiOrbq56lGUmrc';
      const maxResults = 12;
      
      // Add randomization to pagination for variety
      const randomPageToken = Math.random() > 0.5 ? '' : '&pageToken=';
      
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=${maxResults}&q=${encodeURIComponent(
          query
        )}&type=video&order=${order}&key=${apiKey}${randomPageToken}`
      );

      if (!response.ok) {
        throw new Error('YouTube API request failed');
      }

      const data = await response.json();
      
      const videos: YouTubeVideo[] = data.items.map((item: any) => ({
        id: item.id.videoId,
        title: item.snippet.title,
        description: item.snippet.description,
        thumbnail: item.snippet.thumbnails.medium.url,
        channelTitle: item.snippet.channelTitle,
        publishedAt: item.snippet.publishedAt,
      }));

      setYoutubeVideos(videos);
      if (!silent) {
        setActiveTab('youtube');
        toast.success(`Found ${videos.length} videos`);
      }
    } catch (error: any) {
      console.error('YouTube search error:', error);
      if (!silent) toast.error('Failed to search YouTube. Please try again.');
    } finally {
      setYoutubeSearching(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === 'youtube' || searchQuery.trim()) {
      searchYouTube(searchQuery);
    } else {
      loadEnrolledVideos();
    }
  };

  const getVideoDuration = (lesson: Lesson) => {
    const videoMedia = lesson.media?.find(m => m.type === 'video');
    return videoMedia?.duration || lesson.estimatedTime || 0;
  };

  const formatYouTubeDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };

  const handleYoutubeVideoClick = (video: YouTubeVideo) => {
    setSelectedYoutubeVideo(video);
    setShowVideoPlayer(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
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

        {/* Tabs */}
        <div className="mb-6 flex gap-2">
          <Button
            variant={activeTab === 'course' ? 'default' : 'outline'}
            onClick={() => setActiveTab('course')}
            className="flex items-center gap-2"
          >
            <BookOpen className="w-4 h-4" />
            My Course Videos
          </Button>
          <Button
            variant={activeTab === 'youtube' ? 'default' : 'outline'}
            onClick={() => setActiveTab('youtube')}
            className="flex items-center gap-2"
          >
            <Youtube className="w-4 h-4" />
            YouTube Search
          </Button>
        </div>

        {/* Stats - Only for course videos */}
        {activeTab === 'course' && (
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
        )}

        {/* Filters */}
        <div className="mb-8 space-y-4">
          <form onSubmit={handleSearch} className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  activeTab === 'youtube' 
                    ? 'Search YouTube videos...' 
                    : 'Search your course videos...'
                }
                className="pl-10"
              />
            </div>
            <Button type="submit" disabled={youtubeSearching}>
              {youtubeSearching ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Searching...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 mr-2" />
                  Search
                </>
              )}
            </Button>
          </form>

          {activeTab === 'course' && (
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
          )}
        </div>

        {/* Videos Grid */}
        {activeTab === 'course' ? (
          // Course Videos
          loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : videos.length === 0 ? (
            <Card className="p-12 text-center">
              <Video className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No video lessons found</h3>
              <p className="text-gray-600 mb-4">
                Enroll in courses to access video lessons
              </p>
              <Button onClick={() => router.push('/courses')}>
                Browse Courses
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
                    
                    <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                        <Play className="w-8 h-8 text-blue-600 ml-1" />
                      </div>
                    </div>

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
          )
        ) : (
          // YouTube Videos
          youtubeVideos.length === 0 ? (
            <Card className="p-12 text-center">
              <div className="animate-pulse mb-4">
                <Youtube className="w-16 h-16 text-gray-300 mx-auto" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading Recommended Videos...</h3>
              <p className="text-gray-600 mb-4">
                We're finding videos based on your interests
              </p>
            </Card>
          ) : (
            <>
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-purple-600" />
                    {searchQuery ? 'Search Results' : 'Recommended For You'}
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    {searchQuery ? `Results for "${searchQuery}"` : 'Based on your interests and learning preferences'}
                  </p>
                </div>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {youtubeVideos.map((video) => (
                  <Card
                  key={video.id}
                  className="hover:shadow-xl transition-all hover:-translate-y-1 cursor-pointer group"
                  onClick={() => handleYoutubeVideoClick(video)}
                >
                  <div className="relative aspect-video bg-gray-900 rounded-t-lg overflow-hidden">
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-full h-full object-cover"
                    />
                    
                    <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center">
                        <Play className="w-8 h-8 text-white ml-1" />
                      </div>
                    </div>

                    <div className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 rounded text-xs font-bold flex items-center gap-1">
                      <Youtube className="w-3 h-3" />
                      YouTube
                    </div>
                  </div>

                  <CardHeader>
                    <CardTitle className="text-base line-clamp-2">{video.title}</CardTitle>
                    <p className="text-sm text-gray-600 mt-1">{video.channelTitle}</p>
                  </CardHeader>

                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                      {video.description}
                    </p>

                    <div className="text-xs text-gray-500">
                      {formatYouTubeDate(video.publishedAt)}
                    </div>
                  </CardContent>
                </Card>
              ))}
              </div>
            </>
          )
        )}

        {/* YouTube Video Player Modal */}
        <Dialog open={showVideoPlayer} onOpenChange={setShowVideoPlayer}>
          <DialogContent className="max-w-4xl w-full p-0">
            <DialogHeader className="p-6 pb-4">
              <DialogTitle className="text-xl font-bold">
                {selectedYoutubeVideo?.title}
              </DialogTitle>
              <p className="text-sm text-gray-600 mt-2">
                {selectedYoutubeVideo?.channelTitle}
              </p>
            </DialogHeader>
            <div className="aspect-video w-full bg-black">
              {selectedYoutubeVideo && (
                <iframe
                  width="100%"
                  height="100%"
                  src={`https://www.youtube.com/embed/${selectedYoutubeVideo.id}?autoplay=1`}
                  title={selectedYoutubeVideo.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                ></iframe>
              )}
            </div>
            {selectedYoutubeVideo?.description && (
              <div className="p-6 pt-4 max-h-40 overflow-y-auto">
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-sm text-gray-600 whitespace-pre-wrap">
                  {selectedYoutubeVideo.description}
                </p>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
