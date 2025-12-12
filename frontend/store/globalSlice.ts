import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { progressAPI, badgesAPI, leaderboardAPI, coursesAPI, lessonsAPI, friendsAPI, postAPI, quizAPI, notificationAPI } from '@/services/api.service';
import { api } from '@/lib/api';

// ============================================
// TYPES & INTERFACES
// ============================================

interface User {
    _id: string;
    email: string;
    name: string;
    role: string;
    profilePicture?: string;
    xp?: number;
    level?: number;
    streak?: number;
    totalLessonsCompleted?: number;
    totalQuizzesCompleted?: number;
}

interface ProgressStats {
    totalXP: number;
    currentLevel: number;
    currentStreak: number;
    completedLessons: number;
    completedQuizzes: number;
    totalStudyTime: number;
    longestStreak?: number;
    completedCourses?: number;
    achievementsCount?: number;
    challengesWon?: number;
    rank?: number;
}

interface Badge {
    _id: string;
    badge: {
        _id: string;
        name: string;
        description: string;
        icon: string;
        category: string;
    };
    earnedAt: string;
}

interface LeaderboardEntry {
    _id: string;
    userId: string;
    name: string;
    xp: number;
    level: number;
    profilePicture?: string;
}

interface Course {
    _id: string;
    title: string;
    description: string;
    thumbnail?: string;
    thumbnailUrl?: string; // Database field name
    instructor: any;
    lessons: any[];
    topic: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    estimatedDuration: number;
    enrolledCount: number;
    rating: number;
    price: number;
    isPremium: boolean;
    isPublished: boolean;
    createdAt: string;
}

interface Lesson {
    _id: string;
    title: string;
    content: string;
    summary: string;
    topic: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    estimatedTime: number;
    author?: any;
    tags: string[];
    description?: string;
    views: number;
    likes: number;
    likedBy?: string[];
    isPublished: boolean;
    isCompleted?: boolean;
    aiGenerated?: boolean;
    audioUrl?: string;
    thumbnailUrl?: string;
    course?: string | { _id: string; title: string };
    order?: number;
    media?: Array<{
        type: 'video' | 'audio' | 'image';
        url: string;
        thumbnail?: string;
        duration?: number;
    }>;
    createdAt: string;
    updatedAt: string;
}

interface Friend {
    _id: string;
    user: User;
    friend: User;
    status: 'pending' | 'accepted' | 'rejected';
    createdAt: string;
}

interface Post {
    _id: string;
    user: any;
    content: string;
    images?: string[];
    video?: string;
    type: 'user' | 'achievement' | 'milestone';
    visibility: 'public' | 'friends' | 'private';
    reactions: any[];
    comments: any[];
    shares: string[];
    sharedPost?: Post;
    metadata?: {
        badgeId?: string;
        levelUp?: number;
        milestoneType?: string;
    };
    reactionCount: number;
    commentCount: number;
    shareCount: number;
    createdAt: string;
    updatedAt: string;
}

interface QuizQuestion {
    _id: string;
    question: string;
    type: 'mcq' | 'true_false' | 'fill_blank';
    options?: string[];
    correctAnswer: string | number;
    explanation?: string;
    points: number;
}

interface Quiz {
    _id: string;
    title: string;
    description: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    category: string;
    course?: string;
    lesson?: string;
    questions: QuizQuestion[];
    passingScore: number;
    timeLimit?: number;
    author: {
        _id: string;
        name: string;
        profilePicture?: string;
    };
    attempts: number;
    averageScore: number;
    createdAt: string;
    updatedAt: string;
}

interface QuizAttempt {
    _id: string;
    quiz: string;
    user: string;
    answers: {
        questionId: string;
        answer: string | number;
        isCorrect: boolean;
        points: number;
    }[];
    score: number;
    percentage: number;
    passed: boolean;
    timeSpent: number;
    completedAt: string;
}

interface QuizStats {
    totalQuizzes: number;
    totalAttempts: number;
    averageScore: number;
    passedQuizzes: number;
    failedQuizzes: number;
    totalTimeSpent: number;
    byDifficulty: {
        beginner: number;
        intermediate: number;
        advanced: number;
    };
    recentAttempts: QuizAttempt[];
}

interface Notification {
    _id: string;
    type: string;
    title: string;
    message: string;
    isRead: boolean;
    createdAt: Date;
    data?: any;
}

interface ForumPost {
    _id: string;
    title: string;
    content: string;
    author: {
        _id: string;
        name: string;
        avatar?: string;
        role?: string;
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

interface ForumGroup {
    _id: string;
    name: string;
    description?: string;
    category?: string;
    privacy?: string;
}


interface GlobalState {
    // Loading states
    isInitializing: boolean;
    lastSyncTime: number | null;

    // User data
    user: User | null;
    progressStats: ProgressStats | null;

    // Normalized data stores
    badges: {
        byId: Record<string, Badge>;
        allIds: string[];
        userBadgeIds: string[];
    };

    leaderboard: {
        global: LeaderboardEntry[];
        friends: LeaderboardEntry[];
    };

    courses: {
        byId: Record<string, Course>;
        allIds: string[];
        enrolledIds: string[];
        purchasedIds: string[];
    };

    lessons: {
        byId: Record<string, Lesson>;
        allIds: string[];
        completedIds: string[];
    };

    // Instructor-specific lessons (with quiz status)
    instructorLessons: {
        byId: Record<string, Lesson & { hasQuiz?: boolean }>;
        allIds: string[];
        loading: boolean;
        error: string | null;
        lastFetched: number | null;
    };

    // Instructor-specific courses
    instructorCourses: {
        byId: Record<string, Course>;
        allIds: string[];
        loading: boolean;
        error: string | null;
        lastFetched: number | null;
    };

    // Instructor-specific students
    instructorStudents: {
        byId: Record<string, any>;
        allIds: string[];
        loading: boolean;
        error: string | null;
        lastFetched: number | null;
    };

    // Instructor analytics (with time range caching)
    instructorAnalytics: {
        data: any | null;
        timeRange: '7d' | '30d' | '90d' | 'all';
        loading: boolean;
        error: string | null;
        lastFetched: Record<string, number | null>; // Cache per time range
    };

    // Instructor-specific quizzes
    instructorQuizzes: {
        byId: Record<string, any>;
        allIds: string[];
        loading: boolean;
        error: string | null;
        lastFetched: number | null;
    };

    friends: {
        byId: Record<string, Friend>;
        allIds: string[];
        requestIds: string[];
    };

    posts: {
        byId: Record<string, Post>;
        feedIds: string[];
        userPostsById: Record<string, string[]>;
    };

    quizzes: {
        byId: Record<string, Quiz>;
        allIds: string[];
        attemptedIds: string[];
    };

    quizAttempts: {
        byId: Record<string, QuizAttempt>;
        allIds: string[];
    };

    quizStats: QuizStats | null;

    notifications: {
        byId: Record<string, Notification>;
        allIds: string[];
        unreadCount: number;
    };

    forumPosts: {
        byId: Record<string, ForumPost>;
        allIds: string[];
    };

    forumGroups: {
        byId: Record<string, ForumGroup>;
        allIds: string[];
    };

    forumComments: {
        byId: Record<string, any>;
        byPostId: Record<string, string[]>;
    };

    // Cache metadata (5 minutes)
    cache: {
        badges: number | null;
        leaderboard: number | null;
        courses: number | null;
        lessons: number | null;
        instructorLessons: number | null;
        instructorCourses: number | null;
        instructorStudents: number | null;
        friends: number | null;
        posts: number | null;
        quizzes: number | null;
        notifications: number | null;
    };
}

const initialState: GlobalState = {
    isInitializing: false,
    lastSyncTime: null,
    user: null,
    progressStats: null,
    badges: {
        byId: {},
        allIds: [],
        userBadgeIds: [],
    },
    leaderboard: {
        global: [],
        friends: [],
    },
    courses: {
        byId: {},
        allIds: [],
        enrolledIds: [],
        purchasedIds: [],
    },
    lessons: {
        byId: {},
        allIds: [],
        completedIds: [],
    },
    instructorLessons: {
        byId: {},
        allIds: [],
        loading: false,
        error: null,
        lastFetched: null,
    },
    instructorCourses: {
        byId: {},
        allIds: [],
        loading: false,
        error: null,
        lastFetched: null,
    },
    instructorStudents: {
        byId: {},
        allIds: [],
        loading: false,
        error: null,
        lastFetched: null,
    },
    instructorAnalytics: {
        data: null,
        timeRange: '30d',
        loading: false,
        error: null,
        lastFetched: {
            '7d': null,
            '30d': null,
            '90d': null,
            'all': null,
        },
    },
    instructorQuizzes: {
        byId: {},
        allIds: [],
        loading: false,
        error: null,
        lastFetched: null,
    },
    friends: {
        byId: {},
        allIds: [],
        requestIds: [],
    },
    posts: {
        byId: {},
        feedIds: [],
        userPostsById: {},
    },
    quizzes: {
        byId: {},
        allIds: [],
        attemptedIds: [],
    },
    quizAttempts: {
        byId: {},
        allIds: [],
    },
    quizStats: null,
    notifications: {
        byId: {},
        allIds: [],
        unreadCount: 0,
    },
    forumPosts: {
        byId: {},
        allIds: [],
    },
    forumGroups: {
        byId: {},
        allIds: [],
    },
    forumComments: {
        byId: {},
        byPostId: {},
    },
    cache: {
        badges: null,
        leaderboard: null,
        courses: null,
        lessons: null,
        instructorLessons: null,
        instructorCourses: null,
        instructorStudents: null,
        friends: null,
        posts: null,
        quizzes: null,
        notifications: null,
    },
};

// ============================================
// ASYNC THUNKS - Data Fetching
// ============================================

// Preload all essential data at login
export const preloadAllData = createAsyncThunk(
    'global/preloadAllData',
    async (_, { dispatch }) => {
        try {
            // Fetch all data in parallel for maximum speed
            const results = await Promise.allSettled([
                dispatch(fetchProgressStats()).unwrap(),
                dispatch(fetchUserBadges()).unwrap(),
                dispatch(fetchGlobalLeaderboard()).unwrap(),
                dispatch(fetchAllCourses()).unwrap(),
                dispatch(fetchEnrolledCourses()).unwrap(),
                dispatch(fetchAllLessons()).unwrap(),
                dispatch(fetchFriends()).unwrap(),
                dispatch(fetchFeedPosts(1)).unwrap(),
                dispatch(fetchNotifications()).unwrap(),
                dispatch(fetchForumPosts()).unwrap(),
                dispatch(fetchForumGroups()).unwrap(),
                dispatch(fetchQuizzes()).unwrap(),
                dispatch(fetchQuizStats()).unwrap(),
            ]);

            return { success: true, results };
        } catch (error) {
            console.error('Preload error:', error);
            throw error;
        }
    }
);

// Progress Stats
export const fetchProgressStats = createAsyncThunk(
    'global/fetchProgressStats',
    async () => {
        const response = await progressAPI.getProgress();
        return response.data.data;
    }
);

// Badges
export const fetchUserBadges = createAsyncThunk(
    'global/fetchUserBadges',
    async () => {
        const response = await badgesAPI.getUserBadges();
        return response.data.data || [];
    }
);

// Leaderboard
export const fetchGlobalLeaderboard = createAsyncThunk(
    'global/fetchGlobalLeaderboard',
    async () => {
        const response = await leaderboardAPI.getGlobalLeaderboard({ limit: 100 });
        return response.data.data || [];
    }
);

export const fetchFriendsLeaderboard = createAsyncThunk(
    'global/fetchFriendsLeaderboard',
    async () => {
        const response = await leaderboardAPI.getFriendsLeaderboard();
        return response.data.data || [];
    }
);

// Courses
export const fetchAllCourses = createAsyncThunk(
    'global/fetchAllCourses',
    async () => {
        const response = await coursesAPI.getAllCourses();
        return response.data.data || [];
    }
);

export const fetchEnrolledCourses = createAsyncThunk(
    'global/fetchEnrolledCourses',
    async () => {
        const response = await coursesAPI.getEnrolledCourses();
        return response.data.data || [];
    }
);

// Lessons
export const fetchAllLessons = createAsyncThunk(
    'global/fetchAllLessons',
    async () => {
        const response = await lessonsAPI.getAllLessons();
        return response.data.data || [];
    }
);

// Instructor Lessons (with smart caching and quiz status)
export const fetchInstructorLessons = createAsyncThunk(
    'global/fetchInstructorLessons',
    async ({ force = false }: { force?: boolean } = {}, { getState, rejectWithValue }) => {
        try {
            const state = getState() as any;
            const lastFetched = state.global.instructorLessons.lastFetched;
            const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

            // Smart caching - return cached data if fresh
            if (!force && lastFetched && Date.now() - lastFetched < CACHE_DURATION) {
                const cachedLessons = state.global.instructorLessons.allIds.map(
                    (id: string) => state.global.instructorLessons.byId[id]
                );
                return { lessons: cachedLessons, fromCache: true };
            }

            // Fetch instructor's lessons
            const response = await api.get('/lessons/instructor/my-lessons');
            const lessonsData = response.data.data || [];

            // Check quiz status for each lesson (parallel requests)
            const lessonsWithQuizStatus = await Promise.all(
                lessonsData.map(async (lesson: any) => {
                    try {
                        const quizRes = await api.get(`/quiz?lesson=${lesson._id}`);
                        return {
                            ...lesson,
                            hasQuiz: quizRes.data.data?.length > 0,
                        };
                    } catch (error) {
                        return { ...lesson, hasQuiz: false };
                    }
                })
            );

            return { lessons: lessonsWithQuizStatus, fromCache: false };
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch instructor lessons');
        }
    }
);

// Instructor Courses (with smart caching)
export const fetchInstructorCourses = createAsyncThunk(
    'global/fetchInstructorCourses',
    async ({ force = false }: { force?: boolean } = {}, { getState, rejectWithValue }) => {
        try {
            const state = getState() as any;
            const lastFetched = state.global.instructorCourses.lastFetched;
            const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

            // Smart caching - return cached data if fresh
            if (!force && lastFetched && Date.now() - lastFetched < CACHE_DURATION) {
                const cachedCourses = state.global.instructorCourses.allIds.map(
                    (id: string) => state.global.instructorCourses.byId[id]
                );
                return { courses: cachedCourses, fromCache: true };
            }

            // Fetch instructor's courses
            const response = await api.get('/courses/instructor/my-courses');
            const coursesData = response.data?.data || response.data || [];

            return { courses: coursesData, fromCache: false };
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch instructor courses');
        }
    }
);

// Instructor Students (with smart caching)
export const fetchInstructorStudents = createAsyncThunk(
    'global/fetchInstructorStudents',
    async ({ force = false }: { force?: boolean } = {}, { getState, rejectWithValue }) => {
        try {
            const state = getState() as any;
            const lastFetched = state.global.instructorStudents.lastFetched;
            const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

            // Smart caching - return cached data if fresh
            if (!force && lastFetched && Date.now() - lastFetched < CACHE_DURATION) {
                const cachedStudents = state.global.instructorStudents.allIds.map(
                    (id: string) => state.global.instructorStudents.byId[id]
                );
                return { students: cachedStudents, fromCache: true };
            }

            // Fetch instructor's students
            const response = await api.get('/courses/instructor/students');
            const studentsData = response.data?.data || [];

            return { students: studentsData, fromCache: false };
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch instructor students');
        }
    }
);

// Instructor Analytics (with smart caching per time range)
export const fetchInstructorAnalytics = createAsyncThunk(
    'global/fetchInstructorAnalytics',
    async ({ timeRange = '30d', force = false }: { timeRange?: '7d' | '30d' | '90d' | 'all'; force?: boolean } = {}, { getState, rejectWithValue }) => {
        try {
            const state = getState() as any;
            const lastFetched = state.global.instructorAnalytics.lastFetched[timeRange];
            const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

            // Smart caching - return cached data if fresh and same time range
            if (!force && lastFetched && Date.now() - lastFetched < CACHE_DURATION &&
                state.global.instructorAnalytics.timeRange === timeRange &&
                state.global.instructorAnalytics.data) {
                return { analytics: state.global.instructorAnalytics.data, timeRange, fromCache: true };
            }

            // Fetch instructor's analytics
            const response = await api.get(`/courses/instructor/analytics?range=${timeRange}`);
            const analyticsData = response.data?.data || null;

            return { analytics: analyticsData, timeRange, fromCache: false };
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch instructor analytics');
        }
    }
);

// Instructor Quizzes (with smart caching)
export const fetchInstructorQuizzes = createAsyncThunk(
    'global/fetchInstructorQuizzes',
    async ({ force = false }: { force?: boolean } = {}, { getState, rejectWithValue }) => {
        try {
            const state = getState() as any;
            const lastFetched = state.global.instructorQuizzes.lastFetched;
            const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

            // Smart caching - return cached data if fresh
            if (!force && lastFetched && Date.now() - lastFetched < CACHE_DURATION) {
                const cachedQuizzes = state.global.instructorQuizzes.allIds.map(
                    (id: string) => state.global.instructorQuizzes.byId[id]
                );
                return { quizzes: cachedQuizzes, fromCache: true };
            }

            // Fetch instructor's quizzes
            const response = await api.get('/quiz/instructor');
            const quizzesData = response.data?.data || [];

            return { quizzes: quizzesData, fromCache: false };
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch instructor quizzes');
        }
    }
);

// Friends
export const fetchFriends = createAsyncThunk(
    'global/fetchFriends',
    async () => {
        const response = await friendsAPI.getFriends();
        return response.data.data || [];
    }
);

// Posts (Feed)
export const fetchFeedPosts = createAsyncThunk(
    'global/fetchFeedPosts',
    async (page: number = 1) => {
        const response = await postAPI.getFeed({ page, limit: 1000 });
        return response.data.data || [];
    }
);

// Notifications
export const fetchNotifications = createAsyncThunk(
    'global/fetchNotifications',
    async () => {
        const response = await notificationAPI.getNotifications({ limit: 50 });
        const unreadResponse = await notificationAPI.getUnreadCount();
        return {
            notifications: response.data.data || [],
            unreadCount: unreadResponse.data.data?.unreadCount || 0,
        };
    }
);

// Forum Posts
export const fetchForumPosts = createAsyncThunk(
    'global/fetchForumPosts',
    async () => {
        const response = await api.get('/forum/posts');
        return response.data.data || [];
    }
);

export const fetchForumGroups = createAsyncThunk(
    'global/fetchForumGroups',
    async () => {
        const response = await api.get('/forum/groups');
        return response.data.data || [];
    }
);

export const createForumPost = createAsyncThunk(
    'global/createForumPost',
    async (postData: any) => {
        const response = await api.post('/forum/posts', postData);
        return response.data.data;
    }
);

export const voteOnForumPost = createAsyncThunk(
    'global/voteOnForumPost',
    async ({ postId, voteType }: { postId: string; voteType: 'upvote' | 'downvote' }) => {
        const response = await api.post(`/forum/posts/${postId}/vote`, { voteType });
        return response.data.data;
    }
);

export const markForumPostSolved = createAsyncThunk(
    'global/markForumPostSolved',
    async ({ postId, isSolved }: { postId: string; isSolved: boolean }) => {
        const response = await api.patch(`/forum/posts/${postId}`, { isSolved });
        return response.data.data;
    }
);

export const fetchForumPostById = createAsyncThunk(
    'global/fetchForumPostById',
    async (postId: string) => {
        const response = await api.get(`/forum/posts/${postId}`);
        return response.data.data;
    }
);

export const fetchForumComments = createAsyncThunk(
    'global/fetchForumComments',
    async (postId: string) => {
        const response = await api.get(`/forum/posts/${postId}/comments`);
        return { postId, comments: response.data.data || [] };
    }
);

// ============================================
// QUIZ THUNKS
// ============================================

export const fetchQuizzes = createAsyncThunk(
    'global/fetchQuizzes',
    async (params?: { difficulty?: string; category?: string; search?: string }) => {
        const response = await api.get('/quiz', { params });
        return response.data.data || [];
    }
);

export const fetchQuizById = createAsyncThunk(
    'global/fetchQuizById',
    async (quizId: string) => {
        const response = await api.get(`/quiz/${quizId}`);
        return response.data.data;
    }
);

export const submitQuizAttempt = createAsyncThunk(
    'global/submitQuizAttempt',
    async ({ quizId, answers, timeTaken }: { quizId: string; answers: any[]; timeTaken: number }) => {
        const response = await api.post(`/quiz/${quizId}/submit`, { answers, timeTaken });
        return response.data.data;
    }
);

export const fetchQuizStats = createAsyncThunk(
    'global/fetchQuizStats',
    async () => {
        const response = await api.get('/quiz/stats');
        return response.data.data;
    }
);

export const generateAIQuiz = createAsyncThunk(
    'global/generateAIQuiz',
    async (params: { topic: string; difficulty: string; questionCount: number }) => {
        const response = await api.post('/ai/generate-quiz', params);
        return response.data.data;
    }
);

// ============================================
// SLICE
// ============================================

const globalSlice = createSlice({
    name: 'global',
    initialState,
    reducers: {
        // Update user
        setUser: (state, action: PayloadAction<User>) => {
            state.user = action.payload;
        },

        updateUser: (state, action: PayloadAction<Partial<User>>) => {
            if (state.user) {
                state.user = { ...state.user, ...action.payload };
            }
        },

        // Clear all data on logout
        clearGlobalState: () => initialState,

        // Add new post to feed
        addPost: (state, action: PayloadAction<Post>) => {
            const post = action.payload;
            state.posts.byId[post._id] = post;
            if (!state.posts.feedIds.includes(post._id)) {
                state.posts.feedIds.unshift(post._id);
            }
        },

        // Update post
        updatePost: (state, action: PayloadAction<Post>) => {
            const post = action.payload;
            state.posts.byId[post._id] = post;
        },

        // Delete post
        deletePost: (state, action: PayloadAction<string>) => {
            const postId = action.payload;
            delete state.posts.byId[postId];
            state.posts.feedIds = state.posts.feedIds.filter(id => id !== postId);
        },

        // Mark notification as read
        markNotificationRead: (state, action: PayloadAction<string>) => {
            const notifId = action.payload;
            if (state.notifications.byId[notifId]) {
                state.notifications.byId[notifId].isRead = true;
                state.notifications.unreadCount = Math.max(0, state.notifications.unreadCount - 1);
            }
        },

        // Add new notification
        addNotification: (state, action: PayloadAction<Notification>) => {
            const notif = action.payload;
            state.notifications.byId[notif._id] = notif;
            if (!state.notifications.allIds.includes(notif._id)) {
                state.notifications.allIds.unshift(notif._id);
                if (!notif.isRead) {
                    state.notifications.unreadCount += 1;
                }
            }
        },

        // Update cache timestamp
        updateCacheTimestamp: (state, action: PayloadAction<keyof GlobalState['cache']>) => {
            state.cache[action.payload] = Date.now();
        },
    },

    extraReducers: (builder) => {
        // Preload all data
        builder.addCase(preloadAllData.pending, (state) => {
            state.isInitializing = true;
        });
        builder.addCase(preloadAllData.fulfilled, (state) => {
            state.isInitializing = false;
            state.lastSyncTime = Date.now();
        });
        builder.addCase(preloadAllData.rejected, (state) => {
            state.isInitializing = false;
        });

        // Progress stats
        builder.addCase(fetchProgressStats.fulfilled, (state, action) => {
            state.progressStats = action.payload;
            state.cache.badges = Date.now();
        });

        // Badges
        builder.addCase(fetchUserBadges.fulfilled, (state, action) => {
            const badges = Array.isArray(action.payload) ? action.payload : [];
            badges.forEach((badge: Badge) => {
                state.badges.byId[badge._id] = badge;
                if (!state.badges.allIds.includes(badge._id)) {
                    state.badges.allIds.push(badge._id);
                }
                if (!state.badges.userBadgeIds.includes(badge._id)) {
                    state.badges.userBadgeIds.push(badge._id);
                }
            });
            state.cache.badges = Date.now();
        });

        // Leaderboard
        builder.addCase(fetchGlobalLeaderboard.fulfilled, (state, action) => {
            state.leaderboard.global = action.payload;
            state.cache.leaderboard = Date.now();
        });

        builder.addCase(fetchFriendsLeaderboard.fulfilled, (state, action) => {
            state.leaderboard.friends = action.payload;
        });

        // Courses
        builder.addCase(fetchAllCourses.fulfilled, (state, action) => {
            const courses = Array.isArray(action.payload) ? action.payload : [];
            courses.forEach((course: Course) => {
                state.courses.byId[course._id] = course;
                if (!state.courses.allIds.includes(course._id)) {
                    state.courses.allIds.push(course._id);
                }
            });
            state.cache.courses = Date.now();
        });

        builder.addCase(fetchEnrolledCourses.fulfilled, (state, action) => {
            const courses = Array.isArray(action.payload) ? action.payload : [];
            courses.forEach((course: Course) => {
                state.courses.byId[course._id] = course;
                if (!state.courses.enrolledIds.includes(course._id)) {
                    state.courses.enrolledIds.push(course._id);
                }
            });
        });

        // Lessons
        builder.addCase(fetchAllLessons.fulfilled, (state, action) => {
            const lessons = Array.isArray(action.payload) ? action.payload : [];
            lessons.forEach((lesson: Lesson) => {
                state.lessons.byId[lesson._id] = lesson;
                if (!state.lessons.allIds.includes(lesson._id)) {
                    state.lessons.allIds.push(lesson._id);
                }
                if (lesson.isCompleted && !state.lessons.completedIds.includes(lesson._id)) {
                    state.lessons.completedIds.push(lesson._id);
                }
            });
            state.cache.lessons = Date.now();
        });

        // Friends
        builder.addCase(fetchFriends.fulfilled, (state, action) => {
            const friends = Array.isArray(action.payload) ? action.payload : [];
            friends.forEach((friend: Friend) => {
                state.friends.byId[friend._id] = friend;
                if (!state.friends.allIds.includes(friend._id)) {
                    state.friends.allIds.push(friend._id);
                }
            });
            state.cache.friends = Date.now();
        });

        // Posts
        builder.addCase(fetchFeedPosts.fulfilled, (state, action) => {
            const posts = Array.isArray(action.payload) ? action.payload : [];
            posts.forEach((post: Post) => {
                state.posts.byId[post._id] = post;
                if (!state.posts.feedIds.includes(post._id)) {
                    state.posts.feedIds.push(post._id);
                }
            });
            state.cache.posts = Date.now();
        });

        // Notifications
        builder.addCase(fetchNotifications.fulfilled, (state, action) => {
            const { notifications, unreadCount } = action.payload || { notifications: [], unreadCount: 0 };
            const notifArray = Array.isArray(notifications) ? notifications : [];
            notifArray.forEach((notif: Notification) => {
                state.notifications.byId[notif._id] = notif;
                if (!state.notifications.allIds.includes(notif._id)) {
                    state.notifications.allIds.push(notif._id);
                }
            });
            state.notifications.unreadCount = unreadCount || 0;
            state.cache.notifications = Date.now();
        });

        // Forum Posts
        builder.addCase(fetchForumPosts.fulfilled, (state, action) => {
            // Initialize if not exists (for old persisted state)
            if (!state.forumPosts) {
                state.forumPosts = { byId: {}, allIds: [] };
            }
            const posts = Array.isArray(action.payload) ? action.payload : [];
            posts.forEach((post: ForumPost) => {
                state.forumPosts.byId[post._id] = post;
                if (!state.forumPosts.allIds.includes(post._id)) {
                    state.forumPosts.allIds.push(post._id);
                }
            });
        });

        builder.addCase(fetchForumGroups.fulfilled, (state, action) => {
            // Initialize if not exists (for old persisted state)
            if (!state.forumGroups) {
                state.forumGroups = { byId: {}, allIds: [] };
            }
            const groups = Array.isArray(action.payload) ? action.payload : [];
            groups.forEach((group: ForumGroup) => {
                state.forumGroups.byId[group._id] = group;
                if (!state.forumGroups.allIds.includes(group._id)) {
                    state.forumGroups.allIds.push(group._id);
                }
            });
        });

        builder.addCase(createForumPost.fulfilled, (state, action) => {
            // Initialize if not exists
            if (!state.forumPosts) {
                state.forumPosts = { byId: {}, allIds: [] };
            }
            const post = action.payload;
            if (post) {
                state.forumPosts.byId[post._id] = post;
                state.forumPosts.allIds.unshift(post._id);
            }
        });

        builder.addCase(fetchForumPostById.fulfilled, (state, action) => {
            if (!state.forumPosts) {
                state.forumPosts = { byId: {}, allIds: [] };
            }
            const post = action.payload;
            if (post) {
                state.forumPosts.byId[post._id] = post;
                if (!state.forumPosts.allIds.includes(post._id)) {
                    state.forumPosts.allIds.push(post._id);
                }
            }
        });

        builder.addCase(fetchForumComments.fulfilled, (state, action) => {
            if (!state.forumComments) {
                state.forumComments = { byId: {}, byPostId: {} };
            }
            const { postId, comments } = action.payload;
            const commentIds: string[] = [];
            
            comments.forEach((comment: any) => {
                state.forumComments.byId[comment._id] = comment;
                commentIds.push(comment._id);
            });
            
            state.forumComments.byPostId[postId] = commentIds;
        });

        builder.addCase(voteOnForumPost.fulfilled, (state, action) => {
            // Initialize if not exists
            if (!state.forumPosts) {
                state.forumPosts = { byId: {}, allIds: [] };
            }
            const updatedPost = action.payload;
            if (updatedPost) {
                state.forumPosts.byId[updatedPost._id] = updatedPost;
            }
        });

        builder.addCase(markForumPostSolved.fulfilled, (state, action) => {
            // Initialize if not exists
            if (!state.forumPosts) {
                state.forumPosts = { byId: {}, allIds: [] };
            }
            const updatedPost = action.payload;
            if (updatedPost) {
                state.forumPosts.byId[updatedPost._id] = updatedPost;
            }
        });

        // Quiz reducers
        builder.addCase(fetchQuizzes.fulfilled, (state, action) => {
            if (!state.quizzes) {
                state.quizzes = { byId: {}, allIds: [], attemptedIds: [] };
            }
            const quizzes = Array.isArray(action.payload) ? action.payload : [];
            quizzes.forEach((quiz: Quiz) => {
                state.quizzes.byId[quiz._id] = quiz;
                if (!state.quizzes.allIds.includes(quiz._id)) {
                    state.quizzes.allIds.push(quiz._id);
                }
            });
        });

        builder.addCase(fetchQuizById.fulfilled, (state, action) => {
            if (!state.quizzes) {
                state.quizzes = { byId: {}, allIds: [], attemptedIds: [] };
            }
            const quiz = action.payload;
            if (quiz) {
                state.quizzes.byId[quiz._id] = quiz;
                if (!state.quizzes.allIds.includes(quiz._id)) {
                    state.quizzes.allIds.push(quiz._id);
                }
            }
        });

        builder.addCase(submitQuizAttempt.fulfilled, (state, action) => {
            if (!state.quizAttempts) {
                state.quizAttempts = { byId: {}, allIds: [] };
            }
            const attempt = action.payload;
            if (attempt) {
                state.quizAttempts.byId[attempt._id] = attempt;
                if (!state.quizAttempts.allIds.includes(attempt._id)) {
                    state.quizAttempts.allIds.unshift(attempt._id);
                }

                // Mark quiz as attempted
                if (!state.quizzes.attemptedIds.includes(attempt.quiz)) {
                    state.quizzes.attemptedIds.push(attempt.quiz);
                }

                // Update quiz stats
                if (state.quizStats) {
                    state.quizStats.totalAttempts++;
                    if (attempt.passed) {
                        state.quizStats.passedQuizzes++;
                    } else {
                        state.quizStats.failedQuizzes++;
                    }
                    state.quizStats.totalTimeSpent += attempt.timeSpent;
                }
            }
        });

        builder.addCase(fetchQuizStats.fulfilled, (state, action) => {
            state.quizStats = action.payload;
        });

        builder.addCase(generateAIQuiz.fulfilled, (state, action) => {
            if (!state.quizzes) {
                state.quizzes = { byId: {}, allIds: [], attemptedIds: [] };
            }
            const quiz = action.payload;
            if (quiz) {
                state.quizzes.byId[quiz._id] = quiz;
                if (!state.quizzes.allIds.includes(quiz._id)) {
                    state.quizzes.allIds.unshift(quiz._id); // Add to beginning
                }
            }
        });

        // Instructor Lessons
        builder.addCase(fetchInstructorLessons.pending, (state) => {
            if (!state.instructorLessons) {
                state.instructorLessons = {
                    byId: {},
                    allIds: [],
                    loading: false,
                    error: null,
                    lastFetched: null,
                };
            }
            state.instructorLessons.loading = true;
            state.instructorLessons.error = null;
        });

        builder.addCase(fetchInstructorLessons.fulfilled, (state, action) => {
            if (!state.instructorLessons) {
                state.instructorLessons = {
                    byId: {},
                    allIds: [],
                    loading: false,
                    error: null,
                    lastFetched: null,
                };
            }

            const { lessons, fromCache } = action.payload;

            // Only update if not from cache
            if (!fromCache) {
                state.instructorLessons.byId = {};
                state.instructorLessons.allIds = [];

                lessons.forEach((lesson: any) => {
                    state.instructorLessons.byId[lesson._id] = lesson;
                    state.instructorLessons.allIds.push(lesson._id);
                });

                state.instructorLessons.lastFetched = Date.now();
                if (!state.cache) {
                    state.cache = {
                        badges: null,
                        leaderboard: null,
                        courses: null,
                        lessons: null,
                        instructorLessons: null,
                        instructorCourses: null,
                        instructorStudents: null,
                        friends: null,
                        posts: null,
                        quizzes: null,
                        notifications: null,
                    };
                }
                state.cache.instructorLessons = Date.now();
            }

            state.instructorLessons.loading = false;
            state.instructorLessons.error = null;
        });

        builder.addCase(fetchInstructorLessons.rejected, (state, action) => {
            if (!state.instructorLessons) {
                state.instructorLessons = {
                    byId: {},
                    allIds: [],
                    loading: false,
                    error: null,
                    lastFetched: null,
                };
            }
            state.instructorLessons.loading = false;
            state.instructorLessons.error = action.payload as string;
        });

        // Instructor Courses
        builder.addCase(fetchInstructorCourses.pending, (state) => {
            if (!state.instructorCourses) {
                state.instructorCourses = {
                    byId: {},
                    allIds: [],
                    loading: false,
                    error: null,
                    lastFetched: null,
                };
            }
            state.instructorCourses.loading = true;
            state.instructorCourses.error = null;
        });

        builder.addCase(fetchInstructorCourses.fulfilled, (state, action) => {
            if (!state.instructorCourses) {
                state.instructorCourses = {
                    byId: {},
                    allIds: [],
                    loading: false,
                    error: null,
                    lastFetched: null,
                };
            }

            const { courses, fromCache } = action.payload;

            // Only update if not from cache
            if (!fromCache) {
                state.instructorCourses.byId = {};
                state.instructorCourses.allIds = [];

                courses.forEach((course: any) => {
                    state.instructorCourses.byId[course._id] = course;
                    state.instructorCourses.allIds.push(course._id);
                });

                state.instructorCourses.lastFetched = Date.now();
                if (!state.cache) {
                    state.cache = {
                        badges: null,
                        leaderboard: null,
                        courses: null,
                        lessons: null,
                        instructorLessons: null,
                        instructorCourses: null,
                        instructorStudents: null,
                        friends: null,
                        posts: null,
                        quizzes: null,
                        notifications: null,
                    };
                }
                state.cache.instructorCourses = Date.now();
            }

            state.instructorCourses.loading = false;
            state.instructorCourses.error = null;
        });

        builder.addCase(fetchInstructorCourses.rejected, (state, action) => {
            if (!state.instructorCourses) {
                state.instructorCourses = {
                    byId: {},
                    allIds: [],
                    loading: false,
                    error: null,
                    lastFetched: null,
                };
            }
            state.instructorCourses.loading = false;
            state.instructorCourses.error = action.payload as string;
        });

        // Instructor Students
        builder.addCase(fetchInstructorStudents.pending, (state) => {
            if (!state.instructorStudents) {
                state.instructorStudents = {
                    byId: {},
                    allIds: [],
                    loading: false,
                    error: null,
                    lastFetched: null,
                };
            }
            state.instructorStudents.loading = true;
            state.instructorStudents.error = null;
        });

        builder.addCase(fetchInstructorStudents.fulfilled, (state, action) => {
            if (!state.instructorStudents) {
                state.instructorStudents = {
                    byId: {},
                    allIds: [],
                    loading: false,
                    error: null,
                    lastFetched: null,
                };
            }

            const { students, fromCache } = action.payload;

            // Only update if not from cache
            if (!fromCache) {
                state.instructorStudents.byId = {};
                state.instructorStudents.allIds = [];

                students.forEach((student: any) => {
                    state.instructorStudents.byId[student._id] = student;
                    state.instructorStudents.allIds.push(student._id);
                });

                state.instructorStudents.lastFetched = Date.now();
                if (!state.cache) {
                    state.cache = {
                        badges: null,
                        leaderboard: null,
                        courses: null,
                        lessons: null,
                        instructorLessons: null,
                        instructorCourses: null,
                        instructorStudents: null,
                        friends: null,
                        posts: null,
                        quizzes: null,
                        notifications: null,
                    };
                }
                state.cache.instructorStudents = Date.now();
            }

            state.instructorStudents.loading = false;
            state.instructorStudents.error = null;
        });

        builder.addCase(fetchInstructorStudents.rejected, (state, action) => {
            if (!state.instructorStudents) {
                state.instructorStudents = {
                    byId: {},
                    allIds: [],
                    loading: false,
                    error: null,
                    lastFetched: null,
                };
            }
            state.instructorStudents.loading = false;
            state.instructorStudents.error = action.payload as string;
        });

        // Instructor Analytics
        builder.addCase(fetchInstructorAnalytics.pending, (state) => {
            if (!state.instructorAnalytics) {
                state.instructorAnalytics = {
                    data: null,
                    timeRange: '30d',
                    loading: false,
                    error: null,
                    lastFetched: { '7d': null, '30d': null, '90d': null, 'all': null },
                };
            }
            state.instructorAnalytics.loading = true;
            state.instructorAnalytics.error = null;
        });

        builder.addCase(fetchInstructorAnalytics.fulfilled, (state, action) => {
            if (!state.instructorAnalytics) {
                state.instructorAnalytics = {
                    data: null,
                    timeRange: '30d',
                    loading: false,
                    error: null,
                    lastFetched: { '7d': null, '30d': null, '90d': null, 'all': null },
                };
            }

            const { analytics, timeRange, fromCache } = action.payload;

            // Only update if not from cache
            if (!fromCache) {
                state.instructorAnalytics.data = analytics;
                state.instructorAnalytics.timeRange = timeRange;
                state.instructorAnalytics.lastFetched[timeRange] = Date.now();
            }

            state.instructorAnalytics.loading = false;
            state.instructorAnalytics.error = null;
        });

        builder.addCase(fetchInstructorAnalytics.rejected, (state, action) => {
            if (!state.instructorAnalytics) {
                state.instructorAnalytics = {
                    data: null,
                    timeRange: '30d',
                    loading: false,
                    error: null,
                    lastFetched: { '7d': null, '30d': null, '90d': null, 'all': null },
                };
            }
            state.instructorAnalytics.loading = false;
            state.instructorAnalytics.error = action.payload as string;
        });

        // Instructor Quizzes
        builder.addCase(fetchInstructorQuizzes.pending, (state) => {
            if (!state.instructorQuizzes) {
                state.instructorQuizzes = {
                    byId: {},
                    allIds: [],
                    loading: false,
                    error: null,
                    lastFetched: null,
                };
            }
            state.instructorQuizzes.loading = true;
            state.instructorQuizzes.error = null;
        });

        builder.addCase(fetchInstructorQuizzes.fulfilled, (state, action) => {
            if (!state.instructorQuizzes) {
                state.instructorQuizzes = {
                    byId: {},
                    allIds: [],
                    loading: false,
                    error: null,
                    lastFetched: null,
                };
            }

            const { quizzes, fromCache } = action.payload;

            // Only update if not from cache
            if (!fromCache) {
                state.instructorQuizzes.byId = {};
                state.instructorQuizzes.allIds = [];

                quizzes.forEach((quiz: any) => {
                    state.instructorQuizzes.byId[quiz._id] = quiz;
                    state.instructorQuizzes.allIds.push(quiz._id);
                });

                state.instructorQuizzes.lastFetched = Date.now();
            }

            state.instructorQuizzes.loading = false;
            state.instructorQuizzes.error = null;
        });

        builder.addCase(fetchInstructorQuizzes.rejected, (state, action) => {
            if (!state.instructorQuizzes) {
                state.instructorQuizzes = {
                    byId: {},
                    allIds: [],
                    loading: false,
                    error: null,
                    lastFetched: null,
                };
            }
            state.instructorQuizzes.loading = false;
            state.instructorQuizzes.error = action.payload as string;
        });
    },
});

export const {
    setUser,
    updateUser,
    clearGlobalState,
    addPost,
    updatePost,
    deletePost,
    markNotificationRead,
    addNotification,
    updateCacheTimestamp,
} = globalSlice.actions;

export default globalSlice.reducer;
