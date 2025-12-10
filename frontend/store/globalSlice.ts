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
    level: number;
    currentStreak: number;
    lessonsCompleted: number;
    quizzesCompleted: number;
    studyTimeMinutes: number;
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
    earnedAt: Date;
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
    name: string;
    email: string;
    profilePicture?: string;
    level?: number;
    xp?: number;
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
    createdAt: Date;
    updatedAt: Date;
}

interface Quiz {
    _id: string;
    title: string;
    description: string;
    course?: string;
    lesson?: string;
    questions: any[];
    passingScore: number;
    timeLimit: number;
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

    // Cache metadata
    cache: {
        badges: number | null;
        leaderboard: number | null;
        courses: number | null;
        lessons: number | null;
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
    cache: {
        badges: null,
        leaderboard: null,
        courses: null,
        lessons: null,
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
        const response = await postAPI.getFeed({ page, limit: 50 });
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
