import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { profileAPI } from '@/services/api.service';

// ============================================
// TYPES & INTERFACES
// ============================================

export interface YouTubeVideo {
    id: string;
    title: string;
    description: string;
    thumbnail: string;
    channelTitle: string;
    publishedAt: string;
    duration?: string;
}

interface VideosState {
    // YouTube videos
    videos: {
        byId: Record<string, YouTubeVideo>;
        allIds: string[];
        recommendedIds: string[];
    };

    // UI state
    searchQuery: string;
    selectedCategory: string;
    selectedVideo: YouTubeVideo | null;
    showVideoPlayer: boolean;
    showMobileFilters: boolean;

    // Loading & error states
    loading: boolean;
    searching: boolean;
    error: string | null;

    // Cache
    lastFetched: number | null;
    lastSearchQuery: string | null;
}

const initialState: VideosState = {
    videos: {
        byId: {},
        allIds: [],
        recommendedIds: [],
    },
    searchQuery: '',
    selectedCategory: 'all',
    selectedVideo: null,
    showVideoPlayer: false,
    showMobileFilters: false,
    loading: false,
    searching: false,
    error: null,
    lastFetched: null,
    lastSearchQuery: null,
};

// ============================================
// ASYNC THUNKS
// ============================================

export const fetchRecommendedVideos = createAsyncThunk(
    'videos/fetchRecommended',
    async (_, { rejectWithValue }) => {
        try {
            // Get user profile to fetch interests
            const profileResponse = await profileAPI.getMyProfile();
            const userInterests = profileResponse.data.data?.interests || [];

            // Create dynamic search query with randomization
            let searchQuery = '';

            if (userInterests.length > 0) {
                // Randomly shuffle and select interests
                const shuffledInterests = [...userInterests].sort(() => Math.random() - 0.5);
                const selectedInterests = shuffledInterests.slice(0, Math.floor(Math.random() * 2) + 1);

                // Add variety modifiers
                const modifiers = ['tutorial', 'course', 'learn', 'introduction', 'guide', 'explained', 'basics', 'advanced'];
                const randomModifier = modifiers[Math.floor(Math.random() * modifiers.length)];

                // Add difficulty level
                const levels = ['beginner', 'intermediate', 'advanced', ''];
                const randomLevel = levels[Math.floor(Math.random() * levels.length)];

                // Add time-based variation
                const hour = new Date().getHours();
                const timeModifier = hour < 12 ? 'morning' : hour < 18 ? 'quick' : 'complete';

                searchQuery = `${selectedInterests.join(' ')} ${randomModifier} ${randomLevel} ${timeModifier} education learning course`.trim();
            } else {
                // Default topics
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

            // Random sorting
            const sortOptions = ['relevance', 'date', 'viewCount', 'rating'];
            const randomSort = sortOptions[Math.floor(Math.random() * sortOptions.length)];

            return await searchYouTubeVideos(searchQuery, randomSort);
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to load recommended videos');
        }
    }
);

export const searchVideos = createAsyncThunk(
    'videos/search',
    async ({ query, order = 'relevance' }: { query: string; order?: string }, { rejectWithValue }) => {
        try {
            if (!query.trim()) {
                throw new Error('Please enter a search term');
            }
            return await searchYouTubeVideos(query, order);
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to search videos');
        }
    }
);

export const searchByCategory = createAsyncThunk(
    'videos/searchByCategory',
    async (categoryId: string, { rejectWithValue }) => {
        try {
            const categoryMap: { [key: string]: string } = {
                'programming': 'programming tutorial course education',
                'science': 'science math education learn',
                'language': 'language learning course tutorial',
                'business': 'business skills professional development'
            };

            const query = categoryMap[categoryId] || categoryId;
            return await searchYouTubeVideos(query);
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to search by category');
        }
    }
);

// ============================================
// HELPER FUNCTIONS
// ============================================

async function searchYouTubeVideos(query: string, order = 'relevance'): Promise<YouTubeVideo[]> {
    const apiKey = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY || '';
    const maxResults = 12;

    // Add educational keywords
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

    return data.items.map((item: any) => ({
        id: item.id.videoId,
        title: item.snippet.title,
        description: item.snippet.description,
        thumbnail: item.snippet.thumbnails.medium.url,
        channelTitle: item.snippet.channelTitle,
        publishedAt: item.snippet.publishedAt,
    }));
}

// ============================================
// SLICE
// ============================================

const videosSlice = createSlice({
    name: 'videos',
    initialState,
    reducers: {
        // UI actions
        setSearchQuery: (state, action: PayloadAction<string>) => {
            state.searchQuery = action.payload;
        },

        setSelectedCategory: (state, action: PayloadAction<string>) => {
            state.selectedCategory = action.payload;
        },

        setSelectedVideo: (state, action: PayloadAction<YouTubeVideo | null>) => {
            state.selectedVideo = action.payload;
        },

        setShowVideoPlayer: (state, action: PayloadAction<boolean>) => {
            state.showVideoPlayer = action.payload;
        },

        setShowMobileFilters: (state, action: PayloadAction<boolean>) => {
            state.showMobileFilters = action.payload;
        },

        // Clear videos
        clearVideos: (state) => {
            state.videos = {
                byId: {},
                allIds: [],
                recommendedIds: [],
            };
            state.lastFetched = null;
        },

        // Clear error
        clearError: (state) => {
            state.error = null;
        },
    },

    extraReducers: (builder) => {
        // Fetch recommended videos
        builder.addCase(fetchRecommendedVideos.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(fetchRecommendedVideos.fulfilled, (state, action) => {
            const videos = action.payload;
            state.videos.byId = {};
            state.videos.allIds = [];
            state.videos.recommendedIds = [];

            videos.forEach((video) => {
                state.videos.byId[video.id] = video;
                state.videos.allIds.push(video.id);
                state.videos.recommendedIds.push(video.id);
            });

            state.loading = false;
            state.lastFetched = Date.now();
            state.lastSearchQuery = null;
        });
        builder.addCase(fetchRecommendedVideos.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        });

        // Search videos
        builder.addCase(searchVideos.pending, (state) => {
            state.searching = true;
            state.error = null;
        });
        builder.addCase(searchVideos.fulfilled, (state, action) => {
            const videos = action.payload;
            state.videos.byId = {};
            state.videos.allIds = [];

            videos.forEach((video) => {
                state.videos.byId[video.id] = video;
                state.videos.allIds.push(video.id);
            });

            state.searching = false;
            state.lastFetched = Date.now();
            state.lastSearchQuery = state.searchQuery;
        });
        builder.addCase(searchVideos.rejected, (state, action) => {
            state.searching = false;
            state.error = action.payload as string;
        });

        // Search by category
        builder.addCase(searchByCategory.pending, (state) => {
            state.searching = true;
            state.error = null;
        });
        builder.addCase(searchByCategory.fulfilled, (state, action) => {
            const videos = action.payload;
            state.videos.byId = {};
            state.videos.allIds = [];

            videos.forEach((video) => {
                state.videos.byId[video.id] = video;
                state.videos.allIds.push(video.id);
            });

            state.searching = false;
            state.lastFetched = Date.now();
        });
        builder.addCase(searchByCategory.rejected, (state, action) => {
            state.searching = false;
            state.error = action.payload as string;
        });
    },
});

// ============================================
// EXPORTS
// ============================================

export const {
    setSearchQuery,
    setSelectedCategory,
    setSelectedVideo,
    setShowVideoPlayer,
    setShowMobileFilters,
    clearVideos,
    clearError,
} = videosSlice.actions;

export default videosSlice.reducer;
