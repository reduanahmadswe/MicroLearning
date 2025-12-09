'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Play,
  Search,
  Sparkles,
  Youtube,
  TrendingUp,
  BookOpen,
  Code,
  Brain,
  Trophy,
  Clock,
  Filter,
  X,
  PlayCircle
} from 'lucide-react';
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
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const categories = [
    { id: 'all', name: 'All Educational', icon: Sparkles, color: 'from-green-500 to-teal-500' },
    { id: 'programming', name: 'Programming Courses', icon: Code, color: 'from-blue-500 to-cyan-500' },
    { id: 'science', name: 'Science & Math', icon: Brain, color: 'from-purple-500 to-indigo-500' },
    { id: 'language', name: 'Language Learning', icon: BookOpen, color: 'from-pink-500 to-rose-500' },
    { id: 'business', name: 'Business & Skills', icon: Trophy, color: 'from-orange-500 to-amber-500' },
  ];

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

        // Combine for unique search each time with educational focus
        searchQuery = `${selectedInterests.join(' ')} ${randomModifier} ${randomLevel} ${timeModifier} education learning course`.trim();
      } else {
        // Default with educational variety
        const defaultTopics = [
          'programming tutorial education',
          'web development course learn',
          'python for beginners educational',
          'javascript explained tutorial',
          'data structures course',
          'algorithm basics education',
          'react tutorial learn',
          'machine learning course introduction'
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
      const apiKey = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY || '';
      const maxResults = 12;

      // Add educational keywords to ensure educational content only
      const educationalQuery = `${query} tutorial course education learning`;

      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=${maxResults}&q=${encodeURIComponent(
          educationalQuery
        )}&type=video&order=${order}&safeSearch=strict&videoCategoryId=27&key=${apiKey}`
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
      setSelectedCategory('all');
    }
  };

  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setShowMobileFilters(false);
    if (categoryId === 'all') {
      loadRecommendedVideos();
    } else {
      // Add educational context to category searches
      const categoryMap: { [key: string]: string } = {
        'programming': 'programming tutorial course education',
        'science': 'science math education learn',
        'language': 'language learning course tutorial',
        'business': 'business skills professional development'
      };
      searchYouTube(categoryMap[categoryId] || categoryId);
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
    <div className="min-h-screen w-full bg-page-gradient">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-3 sm:gap-4 mb-3">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-green-600 to-teal-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg">
              <PlayCircle className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-green-600 via-teal-600 to-emerald-600 bg-clip-text text-transparent">
                Video Learning Hub
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">Discover educational videos tailored for you</p>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4 mt-4">
            <div className="bg-card rounded-xl border border-border/50 p-3 sm:p-4 text-center hover:shadow-lg transition-all">
              <p className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
                {youtubeVideos.length}
              </p>
              <p className="text-[10px] sm:text-xs text-muted-foreground font-medium mt-1">Videos</p>
            </div>
            <div className="bg-card rounded-xl border border-border/50 p-3 sm:p-4 text-center hover:shadow-lg transition-all">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Youtube className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
              </div>
              <p className="text-[10px] sm:text-xs text-muted-foreground font-medium">YouTube</p>
            </div>
            <div className="bg-card rounded-xl border border-border/50 p-3 sm:p-4 text-center hover:shadow-lg transition-all">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
              </div>
              <p className="text-[10px] sm:text-xs text-muted-foreground font-medium">Curated</p>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search videos by topic, skill, or keyword..."
              className="w-full pl-12 pr-24 sm:pr-32 py-3 sm:py-4 bg-background border border-border rounded-xl text-foreground placeholder-muted-foreground focus:border-green-500 focus:ring-4 focus:ring-green-100 dark:focus:ring-green-900/30 transition-all outline-none text-sm sm:text-base"
            />
            <button
              type="submit"
              disabled={youtubeSearching}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-green-600 to-teal-600 text-white font-semibold px-4 sm:px-6 py-2 rounded-lg hover:shadow-lg transition-all disabled:opacity-50 text-sm sm:text-base flex items-center gap-2"
            >
              {youtubeSearching ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span className="hidden sm:inline">Searching...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span className="hidden sm:inline">Search</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Categories */}
        <div className="mb-6 sm:mb-8">
          {/* Mobile Filter Button */}
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="md:hidden w-full bg-card border border-border rounded-xl p-3 mb-3 flex items-center justify-between font-semibold text-foreground hover:bg-accent transition-all"
          >
            <span className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-green-600" />
              Categories
            </span>
            {showMobileFilters ? <X className="w-5 h-5" /> : <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-1 rounded-full">{categories.length}</span>}
          </button>

          {/* Desktop Categories */}
          <div className="hidden md:flex gap-3 overflow-x-auto scrollbar-hide pb-2">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <button
                  key={category.id}
                  onClick={() => handleCategoryClick(category.id)}
                  className={`flex items-center gap-2 px-5 py-3 font-semibold rounded-xl transition-all whitespace-nowrap ${selectedCategory === category.id
                    ? 'bg-gradient-to-r from-green-600 via-teal-600 to-emerald-600 text-white shadow-lg scale-105'
                    : 'bg-card text-muted-foreground hover:bg-accent border border-border'
                    }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{category.name}</span>
                </button>
              );
            })}
          </div>

          {/* Mobile Categories Dropdown */}
          {showMobileFilters && (
            <div className="md:hidden grid grid-cols-2 gap-2 animate-in slide-in-from-top duration-200">
              {categories.map((category) => {
                const Icon = category.icon;
                return (
                  <button
                    key={category.id}
                    onClick={() => handleCategoryClick(category.id)}
                    className={`flex items-center gap-2 px-4 py-3 font-semibold rounded-xl transition-all text-sm ${selectedCategory === category.id
                      ? 'bg-gradient-to-r from-green-600 to-teal-600 text-white shadow-lg'
                      : 'bg-card text-muted-foreground hover:bg-accent border border-border'
                      }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="truncate">{category.name}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* YouTube Videos */}
        {youtubeVideos.length === 0 ? (
          <div className="bg-card rounded-2xl sm:rounded-3xl shadow-xl border border-border p-8 sm:p-16 text-center">
            <div className="relative mb-6">
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-green-100 to-teal-100 dark:from-green-900/30 dark:to-teal-900/30 rounded-full flex items-center justify-center mx-auto">
                <div className="w-16 h-16 sm:w-20 sm:h-20 border-4 border-green-200 dark:border-green-800 rounded-full"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 sm:w-20 sm:h-20 border-4 border-green-600 rounded-full border-t-transparent animate-spin"></div>
              </div>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-3">Loading Recommended Videos...</h3>
            <p className="text-sm sm:text-base text-muted-foreground">
              We're finding the best educational content for you
            </p>
          </div>
        ) : (
          <>
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-foreground flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-green-600 dark:text-green-400" />
                  <span>{searchQuery ? 'Search Results' : 'Recommended For You'}</span>
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                  {searchQuery ? `Found ${youtubeVideos.length} videos for "${searchQuery}"` : 'Personalized based on your interests'}
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
                <span className="font-medium">{youtubeVideos.length} Videos Available</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {youtubeVideos.map((video) => (
                <div
                  key={video.id}
                  onClick={() => handleYoutubeVideoClick(video)}
                  className="bg-card rounded-xl sm:rounded-2xl shadow-lg border border-border overflow-hidden hover:shadow-2xl hover:scale-[1.02] transition-all cursor-pointer group"
                >
                  {/* Thumbnail */}
                  <div className="relative aspect-video bg-gray-900 overflow-hidden">
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />

                    {/* Play Overlay */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 flex items-center justify-center transition-all duration-300">
                      <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-green-600 to-teal-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 scale-50 group-hover:scale-100 transition-all duration-300 shadow-2xl">
                        <Play className="w-7 h-7 sm:w-8 sm:h-8 text-white ml-1" />
                      </div>
                    </div>

                    {/* YouTube Badge */}
                    <div className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 rounded-lg text-[10px] sm:text-xs font-bold flex items-center gap-1 shadow-lg">
                      <Youtube className="w-3 h-3" />
                      <span>YouTube</span>
                    </div>

                    {/* Duration Badge (placeholder) */}
                    <div className="absolute bottom-2 right-2 bg-black bg-opacity-80 text-white px-2 py-1 rounded text-[10px] sm:text-xs font-semibold">
                      <Clock className="w-3 h-3 inline mr-1" />
                      Video
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4 sm:p-5">
                    <h3 className="font-bold text-foreground text-sm sm:text-base line-clamp-2 mb-2 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                      {video.title}
                    </h3>

                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-6 h-6 sm:w-7 sm:h-7 bg-gradient-to-br from-teal-600 to-emerald-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                        {video.channelTitle.charAt(0).toUpperCase()}
                      </div>
                      <p className="text-xs sm:text-sm text-muted-foreground font-medium truncate flex-1">{video.channelTitle}</p>
                    </div>

                    <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 mb-3">
                      {video.description}
                    </p>

                    <div className="flex items-center justify-between pt-3 border-t border-border">
                      <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        <span>{formatYouTubeDate(video.publishedAt)}</span>
                      </div>
                      <button className="flex items-center gap-1 text-[10px] sm:text-xs font-semibold text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 transition-colors">
                        <PlayCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        <span>Watch</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* YouTube Video Player Modal */}
        {selectedYoutubeVideo && showVideoPlayer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-75 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-card rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-5xl max-h-[95vh] overflow-hidden animate-in zoom-in-95 duration-300 border border-border">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-green-600 to-teal-600 text-white p-4 sm:p-6 flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white bg-opacity-20 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0">
                    <PlayCircle className="w-6 h-6 sm:w-7 sm:h-7" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-sm sm:text-lg line-clamp-1">{selectedYoutubeVideo.title}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Youtube className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      <p className="text-xs sm:text-sm text-white text-opacity-90 truncate">{selectedYoutubeVideo.channelTitle}</p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setShowVideoPlayer(false)}
                  className="ml-3 w-8 h-8 sm:w-10 sm:h-10 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-xl flex items-center justify-center transition-all hover:scale-105 flex-shrink-0"
                >
                  <X className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </div>

              {/* Video Player */}
              <div className="aspect-video bg-black">
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
              </div>

              {/* Video Details */}
              <div className="p-4 sm:p-6 max-h-48 overflow-y-auto bg-card">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-teal-600 to-emerald-600 rounded-full flex items-center justify-center text-white text-base sm:text-lg font-bold flex-shrink-0">
                    {selectedYoutubeVideo.channelTitle.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm sm:text-base text-foreground truncate">{selectedYoutubeVideo.channelTitle}</p>
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{formatYouTubeDate(selectedYoutubeVideo.publishedAt)}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-muted/50 rounded-xl p-3 sm:p-4 border border-border">
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {selectedYoutubeVideo.description || 'No description available for this video.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
