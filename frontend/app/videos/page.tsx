'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Play,
  Search,
  Sparkles,
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
import { profileAPI } from '@/services/api.service';
import { toast } from 'sonner';

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
  const [youtubeVideos, setYoutubeVideos] = useState<YouTubeVideo[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [youtubeSearching, setYoutubeSearching] = useState(false);
  const [selectedYoutubeVideo, setSelectedYoutubeVideo] = useState<YouTubeVideo | null>(null);
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);

  useEffect(() => {
    loadRecommendedVideos();
  }, []);

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

  const searchYouTube = async (query: string, silent = false, order = 'relevance') => {
    if (!query.trim()) {
      if (!silent) toast.error('Please enter a search term');
      return;
    }

    try {
      setYoutubeSearching(true);
      const apiKey = 'AIzaSyC2bdhYca2ibG35a2Y36eiOrbq56lGUmrc';
      const maxResults = 12;
      
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=${maxResults}&q=${encodeURIComponent(
          query
        )}&type=video&order=${order}&key=${apiKey}`
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
    if (searchQuery.trim()) {
      searchYouTube(searchQuery);
    }
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
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Youtube className="w-10 h-10 text-red-600" />
            <h1 className="text-3xl font-bold text-gray-900">
              Video Learning Hub
            </h1>
          </div>
          <p className="text-gray-600">Discover educational videos tailored to your interests</p>
        </div>

        {/* Filters */}
        <div className="mb-8 space-y-4">
          <form onSubmit={handleSearch} className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search YouTube videos..."
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
        </div>

        {/* YouTube Videos */}
        {youtubeVideos.length === 0 ? (
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
