import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { api } from '@/lib/api';

// ============================================
// TYPES & INTERFACES
// ============================================

export interface AdminUser {
    _id: string;
    name: string;
    email: string;
    role: 'user' | 'instructor' | 'admin';
    profilePicture?: string;
    xp: number;
    level: number;
    streak: number;
    isActive: boolean;
    isBanned: boolean;
    createdAt: string;
    lastLogin?: string;
}

export interface AdminCourse {
    _id: string;
    title: string;
    description: string;
    instructor: {
        _id: string;
        name: string;
    };
    enrolledCount: number;
    isPublished: boolean;
    isPremium: boolean;
    price: number;
    rating: number;
    createdAt: string;
}

export interface AdminBadge {
    _id: string;
    name: string;
    description: string;
    icon: string;
    category: string;
    criteria: {
        type: string;
        value: number;
    };
    earnedCount: number;
    createdAt: string;
}

export interface AdminLesson {
    _id: string;
    title: string;
    content: string;
    summary: string;
    topic: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    estimatedTime: number;
    course?: {
        _id: string;
        title: string;
    };
    author?: {
        _id: string;
        name: string;
    };
    tags: string[];
    views: number;
    likes: number;
    isPublished: boolean;
    aiGenerated?: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface AdminQuiz {
    _id: string;
    title: string;
    description: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    category: string;
    course?: {
        _id: string;
        title: string;
    };
    lesson?: {
        _id: string;
        title: string;
    };
    questions: Array<{
        _id: string;
        question: string;
        type: 'mcq' | 'true_false' | 'fill_blank';
        options?: string[];
        points: number;
    }>;
    passingScore: number;
    timeLimit?: number;
    author: {
        _id: string;
        name: string;
    };
    attempts: number;
    averageScore: number;
    createdAt: string;
    updatedAt: string;
}

export interface AdminAnalytics {
    overview: {
        totalUsers: number;
        activeUsers: number;
        totalCourses: number;
        totalLessons: number;
        totalRevenue: number;
        newUsersToday: number;
        newUsersThisWeek: number;
        newUsersThisMonth: number;
    };
    userGrowth: Array<{
        date: string;
        count: number;
    }>;
    courseStats: {
        published: number;
        draft: number;
        premium: number;
        free: number;
    };
    revenueData: Array<{
        date: string;
        amount: number;
    }>;
    topCourses: Array<{
        _id: string;
        title: string;
        enrollments: number;
        revenue: number;
    }>;
    topInstructors: Array<{
        _id: string;
        name: string;
        coursesCount: number;
        studentsCount: number;
    }>;
}

interface AdminState {
    // Users
    users: {
        byId: Record<string, AdminUser>;
        allIds: string[];
        total: number;
        page: number;
        limit: number;
    };

    // Courses
    courses: {
        byId: Record<string, AdminCourse>;
        allIds: string[];
        total: number;
        page: number;
        limit: number;
    };

    // Badges
    badges: {
        byId: Record<string, AdminBadge>;
        allIds: string[];
        total: number;
    };

    // Lessons
    lessons: {
        byId: Record<string, AdminLesson>;
        allIds: string[];
        total: number;
        page: number;
        limit: number;
    };

    // Quizzes
    quizzes: {
        byId: Record<string, AdminQuiz>;
        allIds: string[];
        total: number;
        page: number;
        limit: number;
    };

    // Analytics
    analytics: AdminAnalytics | null;

    // UI State
    selectedTab: string;
    searchQuery: string;
    filterRole: string | null;
    filterStatus: string | null;
    contentType: 'courses' | 'lessons' | 'quizzes';

    // Loading & Error States
    loading: {
        users: boolean;
        courses: boolean;
        badges: boolean;
        lessons: boolean;
        quizzes: boolean;
        analytics: boolean;
    };

    error: {
        users: string | null;
        courses: string | null;
        badges: string | null;
        lessons: string | null;
        quizzes: string | null;
        analytics: string | null;
    };

    // Cache (5 minutes)
    lastFetched: {
        users: number | null;
        courses: number | null;
        badges: number | null;
        lessons: number | null;
        quizzes: number | null;
        analytics: number | null;
    };
}

const initialState: AdminState = {
    users: {
        byId: {},
        allIds: [],
        total: 0,
        page: 1,
        limit: 10,
    },
    courses: {
        byId: {},
        allIds: [],
        total: 0,
        page: 1,
        limit: 10,
    },
    badges: {
        byId: {},
        allIds: [],
        total: 0,
    },
    lessons: {
        byId: {},
        allIds: [],
        total: 0,
        page: 1,
        limit: 10,
    },
    quizzes: {
        byId: {},
        allIds: [],
        total: 0,
        page: 1,
        limit: 10,
    },
    analytics: null,
    selectedTab: 'overview',
    searchQuery: '',
    filterRole: null,
    filterStatus: null,
    contentType: 'courses',
    loading: {
        users: false,
        courses: false,
        badges: false,
        lessons: false,
        quizzes: false,
        analytics: false,
    },
    error: {
        users: null,
        courses: null,
        badges: null,
        lessons: null,
        quizzes: null,
        analytics: null,
    },
    lastFetched: {
        users: null,
        courses: null,
        badges: null,
        lessons: null,
        quizzes: null,
        analytics: null,
    },
};

// ============================================
// ASYNC THUNKS
// ============================================

// Users
export const fetchAdminUsers = createAsyncThunk(
    'admin/fetchUsers',
    async ({ page = 1, limit = 10, search = '', role = '' }: {
        page?: number;
        limit?: number;
        search?: string;
        role?: string;
    }, { rejectWithValue }) => {
        try {
            const params: any = { page, limit };
            if (search) params.search = search;
            if (role) params.role = role;

            const response = await api.get('/admin/users', { params });
            return response.data.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch users');
        }
    }
);

export const updateUserRole = createAsyncThunk(
    'admin/updateUserRole',
    async ({ userId, role }: { userId: string; role: string }, { rejectWithValue }) => {
        try {
            const response = await api.patch(`/admin/users/${userId}/role`, { role });
            return response.data.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update user role');
        }
    }
);

export const banUser = createAsyncThunk(
    'admin/banUser',
    async (userId: string, { rejectWithValue }) => {
        try {
            const response = await api.post(`/admin/users/${userId}/ban`);
            return response.data.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to ban user');
        }
    }
);

export const unbanUser = createAsyncThunk(
    'admin/unbanUser',
    async (userId: string, { rejectWithValue }) => {
        try {
            const response = await api.post(`/admin/users/${userId}/unban`);
            return response.data.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to unban user');
        }
    }
);

export const deleteUser = createAsyncThunk(
    'admin/deleteUser',
    async (userId: string, { rejectWithValue }) => {
        try {
            await api.delete(`/admin/users/${userId}`);
            return userId;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to delete user');
        }
    }
);

// Courses
export const fetchAdminCourses = createAsyncThunk(
    'admin/fetchCourses',
    async ({ page = 1, limit = 10 }: { page?: number; limit?: number }, { rejectWithValue }) => {
        try {
            const response = await api.get('/admin/courses', { params: { page, limit } });
            return response.data.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch courses');
        }
    }
);

export const toggleCoursePublish = createAsyncThunk(
    'admin/toggleCoursePublish',
    async (courseId: string, { rejectWithValue }) => {
        try {
            const response = await api.patch(`/admin/courses/${courseId}/toggle-publish`);
            return response.data.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to toggle course publish');
        }
    }
);

export const deleteCourse = createAsyncThunk(
    'admin/deleteCourse',
    async (courseId: string, { rejectWithValue }) => {
        try {
            await api.delete(`/admin/courses/${courseId}`);
            return courseId;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to delete course');
        }
    }
);

// Badges
export const fetchAdminBadges = createAsyncThunk(
    'admin/fetchBadges',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/admin/badges');
            return response.data.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch badges');
        }
    }
);

export const createBadge = createAsyncThunk(
    'admin/createBadge',
    async (badgeData: Partial<AdminBadge>, { rejectWithValue }) => {
        try {
            const response = await api.post('/admin/badges', badgeData);
            return response.data.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to create badge');
        }
    }
);

export const updateBadge = createAsyncThunk(
    'admin/updateBadge',
    async ({ badgeId, badgeData }: { badgeId: string; badgeData: Partial<AdminBadge> }, { rejectWithValue }) => {
        try {
            const response = await api.patch(`/admin/badges/${badgeId}`, badgeData);
            return response.data.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update badge');
        }
    }
);

export const deleteBadge = createAsyncThunk(
    'admin/deleteBadge',
    async (badgeId: string, { rejectWithValue }) => {
        try {
            await api.delete(`/admin/badges/${badgeId}`);
            return badgeId;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to delete badge');
        }
    }
);

// Analytics
export const fetchAdminAnalytics = createAsyncThunk(
    'admin/fetchAnalytics',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/admin/analytics');
            return response.data.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch analytics');
        }
    }
);

// ============================================
// CONTENT MANAGEMENT - LESSONS
// ============================================

export const fetchAdminLessons = createAsyncThunk(
    'admin/fetchLessons',
    async ({ page = 1, limit = 10, search = '', force = false }: {
        page?: number;
        limit?: number;
        search?: string;
        force?: boolean;
    }, { rejectWithValue, getState }) => {
        try {
            // Smart caching - check if data is fresh (less than 5 minutes old)
            const state = getState() as any;
            const lastFetched = state.admin.lastFetched.lessons;
            const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

            if (!force && lastFetched && Date.now() - lastFetched < CACHE_DURATION) {
                // Return cached data
                return {
                    lessons: Object.values(state.admin.lessons.byId),
                    total: state.admin.lessons.total,
                    page: state.admin.lessons.page,
                    fromCache: true
                };
            }

            const params: any = { page, limit };
            if (search) params.search = search;

            const response = await api.get('/admin/lessons', { params });
            return { ...response.data.data, fromCache: false };
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch lessons');
        }
    }
);

export const toggleLessonPublish = createAsyncThunk(
    'admin/toggleLessonPublish',
    async (lessonId: string, { rejectWithValue }) => {
        try {
            const response = await api.patch(`/admin/lessons/${lessonId}/toggle-publish`);
            return response.data.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to toggle lesson publish');
        }
    }
);

export const deleteLesson = createAsyncThunk(
    'admin/deleteLesson',
    async (lessonId: string, { rejectWithValue }) => {
        try {
            await api.delete(`/admin/lessons/${lessonId}`);
            return lessonId;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to delete lesson');
        }
    }
);

// ============================================
// CONTENT MANAGEMENT - QUIZZES
// ============================================

export const fetchAdminQuizzes = createAsyncThunk(
    'admin/fetchQuizzes',
    async ({ page = 1, limit = 10, search = '', force = false }: {
        page?: number;
        limit?: number;
        search?: string;
        force?: boolean;
    }, { rejectWithValue, getState }) => {
        try {
            // Smart caching - check if data is fresh (less than 5 minutes old)
            const state = getState() as any;
            const lastFetched = state.admin.lastFetched.quizzes;
            const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

            if (!force && lastFetched && Date.now() - lastFetched < CACHE_DURATION) {
                // Return cached data
                return {
                    quizzes: Object.values(state.admin.quizzes.byId),
                    total: state.admin.quizzes.total,
                    page: state.admin.quizzes.page,
                    fromCache: true
                };
            }

            const params: any = { page, limit };
            if (search) params.search = search;

            const response = await api.get('/admin/quizzes', { params });
            return { ...response.data.data, fromCache: false };
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch quizzes');
        }
    }
);

export const deleteQuiz = createAsyncThunk(
    'admin/deleteQuiz',
    async (quizId: string, { rejectWithValue }) => {
        try {
            await api.delete(`/admin/quizzes/${quizId}`);
            return quizId;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to delete quiz');
        }
    }
);

// ============================================
// SLICE
// ============================================

const adminSlice = createSlice({
    name: 'admin',
    initialState,
    reducers: {
        // UI Actions
        setSelectedTab: (state, action: PayloadAction<string>) => {
            state.selectedTab = action.payload;
        },

        setSearchQuery: (state, action: PayloadAction<string>) => {
            state.searchQuery = action.payload;
        },

        setFilterRole: (state, action: PayloadAction<string | null>) => {
            state.filterRole = action.payload;
        },

        setFilterStatus: (state, action: PayloadAction<string | null>) => {
            state.filterStatus = action.payload;
        },

        setUsersPage: (state, action: PayloadAction<number>) => {
            state.users.page = action.payload;
        },

        setCoursesPage: (state, action: PayloadAction<number>) => {
            state.courses.page = action.payload;
        },

        setLessonsPage: (state, action: PayloadAction<number>) => {
            state.lessons.page = action.payload;
        },

        setQuizzesPage: (state, action: PayloadAction<number>) => {
            state.quizzes.page = action.payload;
        },

        setContentType: (state, action: PayloadAction<'courses' | 'lessons' | 'quizzes'>) => {
            state.contentType = action.payload;
        },

        // Clear errors
        clearError: (state, action: PayloadAction<keyof AdminState['error']>) => {
            state.error[action.payload] = null;
        },

        // Clear all admin data
        clearAdminData: () => initialState,
    },

    extraReducers: (builder) => {
        // Fetch Users
        builder.addCase(fetchAdminUsers.pending, (state) => {
            state.loading.users = true;
            state.error.users = null;
        });
        builder.addCase(fetchAdminUsers.fulfilled, (state, action) => {
            const { users, total, page } = action.payload;
            state.users.byId = {};
            state.users.allIds = [];

            users.forEach((user: AdminUser) => {
                state.users.byId[user._id] = user;
                state.users.allIds.push(user._id);
            });

            state.users.total = total;
            state.users.page = page;
            state.loading.users = false;
            state.lastFetched.users = Date.now();
        });
        builder.addCase(fetchAdminUsers.rejected, (state, action) => {
            state.loading.users = false;
            state.error.users = action.payload as string;
        });

        // Update User Role
        builder.addCase(updateUserRole.fulfilled, (state, action) => {
            const user = action.payload;
            if (state.users.byId[user._id]) {
                state.users.byId[user._id] = user;
            }
        });

        // Ban User
        builder.addCase(banUser.fulfilled, (state, action) => {
            const user = action.payload;
            if (state.users.byId[user._id]) {
                state.users.byId[user._id] = user;
            }
        });

        // Unban User
        builder.addCase(unbanUser.fulfilled, (state, action) => {
            const user = action.payload;
            if (state.users.byId[user._id]) {
                state.users.byId[user._id] = user;
            }
        });

        // Delete User
        builder.addCase(deleteUser.fulfilled, (state, action) => {
            const userId = action.payload;
            delete state.users.byId[userId];
            state.users.allIds = state.users.allIds.filter(id => id !== userId);
            state.users.total -= 1;
        });

        // Fetch Courses
        builder.addCase(fetchAdminCourses.pending, (state) => {
            state.loading.courses = true;
            state.error.courses = null;
        });
        builder.addCase(fetchAdminCourses.fulfilled, (state, action) => {
            const { courses, total, page } = action.payload;
            state.courses.byId = {};
            state.courses.allIds = [];

            courses.forEach((course: AdminCourse) => {
                state.courses.byId[course._id] = course;
                state.courses.allIds.push(course._id);
            });

            state.courses.total = total;
            state.courses.page = page;
            state.loading.courses = false;
            state.lastFetched.courses = Date.now();
        });
        builder.addCase(fetchAdminCourses.rejected, (state, action) => {
            state.loading.courses = false;
            state.error.courses = action.payload as string;
        });

        // Toggle Course Publish
        builder.addCase(toggleCoursePublish.fulfilled, (state, action) => {
            const course = action.payload;
            if (state.courses.byId[course._id]) {
                state.courses.byId[course._id] = course;
            }
        });

        // Delete Course
        builder.addCase(deleteCourse.fulfilled, (state, action) => {
            const courseId = action.payload;
            delete state.courses.byId[courseId];
            state.courses.allIds = state.courses.allIds.filter(id => id !== courseId);
            state.courses.total -= 1;
        });

        // Fetch Badges
        builder.addCase(fetchAdminBadges.pending, (state) => {
            state.loading.badges = true;
            state.error.badges = null;
        });
        builder.addCase(fetchAdminBadges.fulfilled, (state, action) => {
            const badges = action.payload;
            state.badges.byId = {};
            state.badges.allIds = [];

            badges.forEach((badge: AdminBadge) => {
                state.badges.byId[badge._id] = badge;
                state.badges.allIds.push(badge._id);
            });

            state.badges.total = badges.length;
            state.loading.badges = false;
            state.lastFetched.badges = Date.now();
        });
        builder.addCase(fetchAdminBadges.rejected, (state, action) => {
            state.loading.badges = false;
            state.error.badges = action.payload as string;
        });

        // Create Badge
        builder.addCase(createBadge.fulfilled, (state, action) => {
            const badge = action.payload;
            state.badges.byId[badge._id] = badge;
            state.badges.allIds.push(badge._id);
            state.badges.total += 1;
        });

        // Update Badge
        builder.addCase(updateBadge.fulfilled, (state, action) => {
            const badge = action.payload;
            if (state.badges.byId[badge._id]) {
                state.badges.byId[badge._id] = badge;
            }
        });

        // Delete Badge
        builder.addCase(deleteBadge.fulfilled, (state, action) => {
            const badgeId = action.payload;
            delete state.badges.byId[badgeId];
            state.badges.allIds = state.badges.allIds.filter(id => id !== badgeId);
            state.badges.total -= 1;
        });

        // Fetch Analytics
        builder.addCase(fetchAdminAnalytics.pending, (state) => {
            state.loading.analytics = true;
            state.error.analytics = null;
        });
        builder.addCase(fetchAdminAnalytics.fulfilled, (state, action) => {
            state.analytics = action.payload;
            state.loading.analytics = false;
            state.lastFetched.analytics = Date.now();
        });
        builder.addCase(fetchAdminAnalytics.rejected, (state, action) => {
            state.loading.analytics = false;
            state.error.analytics = action.payload as string;
        });

        // Fetch Lessons (with smart caching)
        builder.addCase(fetchAdminLessons.pending, (state) => {
            state.loading.lessons = true;
            state.error.lessons = null;
        });
        builder.addCase(fetchAdminLessons.fulfilled, (state, action) => {
            const { lessons, total, page, fromCache } = action.payload;

            // Only update if not from cache
            if (!fromCache) {
                state.lessons.byId = {};
                state.lessons.allIds = [];

                lessons.forEach((lesson: AdminLesson) => {
                    state.lessons.byId[lesson._id] = lesson;
                    state.lessons.allIds.push(lesson._id);
                });

                state.lessons.total = total;
                state.lessons.page = page;
                state.lastFetched.lessons = Date.now();
            }

            state.loading.lessons = false;
        });
        builder.addCase(fetchAdminLessons.rejected, (state, action) => {
            state.loading.lessons = false;
            state.error.lessons = action.payload as string;
        });

        // Toggle Lesson Publish
        builder.addCase(toggleLessonPublish.fulfilled, (state, action) => {
            const lesson = action.payload;
            if (state.lessons.byId[lesson._id]) {
                state.lessons.byId[lesson._id] = lesson;
            }
        });

        // Delete Lesson
        builder.addCase(deleteLesson.fulfilled, (state, action) => {
            const lessonId = action.payload;
            delete state.lessons.byId[lessonId];
            state.lessons.allIds = state.lessons.allIds.filter(id => id !== lessonId);
            state.lessons.total -= 1;
        });

        // Fetch Quizzes (with smart caching)
        builder.addCase(fetchAdminQuizzes.pending, (state) => {
            state.loading.quizzes = true;
            state.error.quizzes = null;
        });
        builder.addCase(fetchAdminQuizzes.fulfilled, (state, action) => {
            const { quizzes, total, page, fromCache } = action.payload;

            // Only update if not from cache
            if (!fromCache) {
                state.quizzes.byId = {};
                state.quizzes.allIds = [];

                quizzes.forEach((quiz: AdminQuiz) => {
                    state.quizzes.byId[quiz._id] = quiz;
                    state.quizzes.allIds.push(quiz._id);
                });

                state.quizzes.total = total;
                state.quizzes.page = page;
                state.lastFetched.quizzes = Date.now();
            }

            state.loading.quizzes = false;
        });
        builder.addCase(fetchAdminQuizzes.rejected, (state, action) => {
            state.loading.quizzes = false;
            state.error.quizzes = action.payload as string;
        });

        // Delete Quiz
        builder.addCase(deleteQuiz.fulfilled, (state, action) => {
            const quizId = action.payload;
            delete state.quizzes.byId[quizId];
            state.quizzes.allIds = state.quizzes.allIds.filter(id => id !== quizId);
            state.quizzes.total -= 1;
        });
    },
});

// ============================================
// EXPORTS
// ============================================

export const {
    setSelectedTab,
    setSearchQuery,
    setFilterRole,
    setFilterStatus,
    setUsersPage,
    setCoursesPage,
    setLessonsPage,
    setQuizzesPage,
    setContentType,
    clearError,
    clearAdminData,
} = adminSlice.actions;

export default adminSlice.reducer;
