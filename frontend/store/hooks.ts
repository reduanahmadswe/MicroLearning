import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';
import type { RootState, AppDispatch } from './store';

// ============================================
// TYPED HOOKS
// ============================================

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// ============================================
// CUSTOM SELECTOR HOOKS
// ============================================

// User & Progress
export const useCurrentUser = () => useAppSelector((state) => state.global.user);
export const useProgressStats = () => useAppSelector((state) => state.global.progressStats);
export const useIsInitializing = () => useAppSelector((state) => state.global.isInitializing);

// Badges
export const useUserBadges = () => {
    const badgesById = useAppSelector((state) => state.global.badges.byId);
    const userBadgeIds = useAppSelector((state) => state.global.badges.userBadgeIds);
    return userBadgeIds.map(id => badgesById[id]).filter(Boolean);
};

// Leaderboard
export const useGlobalLeaderboard = () => useAppSelector((state) => state.global.leaderboard.global);
export const useFriendsLeaderboard = () => useAppSelector((state) => state.global.leaderboard.friends);

// Courses
export const useAllCourses = () => {
    const coursesById = useAppSelector((state) => state.global.courses.byId);
    const allIds = useAppSelector((state) => state.global.courses.allIds);
    return allIds.map(id => coursesById[id]).filter(Boolean);
};

export const useEnrolledCourses = () => {
    const coursesById = useAppSelector((state) => state.global.courses.byId);
    const enrolledIds = useAppSelector((state) => state.global.courses.enrolledIds);
    return enrolledIds.map(id => coursesById[id]).filter(Boolean);
};

export const useCourseById = (courseId: string | undefined) => {
    return useAppSelector((state) =>
        courseId ? state.global.courses.byId[courseId] : null
    );
};

// Lessons
export const useAllLessons = () => {
    const lessonsById = useAppSelector((state) => state.global.lessons.byId);
    const allIds = useAppSelector((state) => state.global.lessons.allIds);
    return allIds.map(id => lessonsById[id]).filter(Boolean);
};

export const useCompletedLessons = () => {
    const lessonsById = useAppSelector((state) => state.global.lessons.byId);
    const completedIds = useAppSelector((state) => state.global.lessons.completedIds);
    return completedIds.map(id => lessonsById[id]).filter(Boolean);
};

export const useLessonById = (lessonId: string | undefined) => {
    return useAppSelector((state) =>
        lessonId ? state.global.lessons.byId[lessonId] : null
    );
};

// Instructor Lessons (with quiz status)
export const useInstructorLessons = () => {
    const lessonsById = useAppSelector((state) => state.global.instructorLessons?.byId || {});
    const allIds = useAppSelector((state) => state.global.instructorLessons?.allIds || []);
    return allIds.map(id => lessonsById[id]).filter(Boolean);
};

export const useInstructorLessonById = (lessonId: string | undefined) => {
    return useAppSelector((state) =>
        lessonId ? state.global.instructorLessons?.byId?.[lessonId] : null
    );
};

export const useInstructorLessonsLoading = () => useAppSelector((state) => state.global.instructorLessons?.loading || false);
export const useInstructorLessonsError = () => useAppSelector((state) => state.global.instructorLessons?.error || null);
export const useInstructorLessonsLastFetched = () => useAppSelector((state) => state.global.instructorLessons?.lastFetched || null);

// Instructor Courses
export const useInstructorCourses = () => {
    const coursesById = useAppSelector((state) => state.global.instructorCourses?.byId || {});
    const allIds = useAppSelector((state) => state.global.instructorCourses?.allIds || []);
    return allIds.map(id => coursesById[id]).filter(Boolean);
};

export const useInstructorCourseById = (courseId: string | undefined) => {
    return useAppSelector((state) =>
        courseId ? state.global.instructorCourses?.byId?.[courseId] : null
    );
};

export const useInstructorCoursesLoading = () => useAppSelector((state) => state.global.instructorCourses?.loading || false);
export const useInstructorCoursesError = () => useAppSelector((state) => state.global.instructorCourses?.error || null);
export const useInstructorCoursesLastFetched = () => useAppSelector((state) => state.global.instructorCourses?.lastFetched || null);

// Instructor Students
export const useInstructorStudents = () => {
    const studentsById = useAppSelector((state) => state.global.instructorStudents?.byId || {});
    const allIds = useAppSelector((state) => state.global.instructorStudents?.allIds || []);
    return allIds.map(id => studentsById[id]).filter(Boolean);
};

export const useInstructorStudentById = (studentId: string | undefined) => {
    return useAppSelector((state) =>
        studentId ? state.global.instructorStudents?.byId?.[studentId] : null
    );
};

export const useInstructorStudentsLoading = () => useAppSelector((state) => state.global.instructorStudents?.loading || false);
export const useInstructorStudentsError = () => useAppSelector((state) => state.global.instructorStudents?.error || null);
export const useInstructorStudentsLastFetched = () => useAppSelector((state) => state.global.instructorStudents?.lastFetched || null);

// Instructor Analytics
export const useInstructorAnalytics = () => useAppSelector((state) => state.global.instructorAnalytics?.data || null);
export const useInstructorAnalyticsTimeRange = () => useAppSelector((state) => state.global.instructorAnalytics?.timeRange || '30d');
export const useInstructorAnalyticsLoading = () => useAppSelector((state) => state.global.instructorAnalytics?.loading || false);
export const useInstructorAnalyticsError = () => useAppSelector((state) => state.global.instructorAnalytics?.error || null);

// Instructor Quizzes
export const useInstructorQuizzes = () => {
    const quizzesById = useAppSelector((state) => state.global.instructorQuizzes?.byId || {});
    const allIds = useAppSelector((state) => state.global.instructorQuizzes?.allIds || []);
    return allIds.map(id => quizzesById[id]).filter(Boolean);
};

export const useInstructorQuizById = (quizId: string | undefined) => {
    return useAppSelector((state) =>
        quizId ? state.global.instructorQuizzes?.byId?.[quizId] : null
    );
};

export const useInstructorQuizzesLoading = () => useAppSelector((state) => state.global.instructorQuizzes?.loading || false);
export const useInstructorQuizzesError = () => useAppSelector((state) => state.global.instructorQuizzes?.error || null);
export const useInstructorQuizzesLastFetched = () => useAppSelector((state) => state.global.instructorQuizzes?.lastFetched || null);

// Friends
export const useFriends = () => {
    const friendsById = useAppSelector((state) => state.global.friends.byId);
    const allIds = useAppSelector((state) => state.global.friends.allIds);
    return allIds.map(id => friendsById[id]).filter(Boolean);
};

// Posts (Feed)
export const useFeedPosts = () => {
    const postsById = useAppSelector((state) => state.global.posts.byId);
    const feedIds = useAppSelector((state) => state.global.posts.feedIds);
    return feedIds.map(id => postsById[id]).filter(Boolean);
};

export const usePostById = (postId: string | undefined) => {
    return useAppSelector((state) =>
        postId ? state.global.posts.byId[postId] : null
    );
};

// Notifications
export const useNotifications = () => {
    const notificationsById = useAppSelector((state) => state.global.notifications.byId);
    const allIds = useAppSelector((state) => state.global.notifications.allIds);
    return allIds.map(id => notificationsById[id]).filter(Boolean);
};

export const useUnreadNotificationCount = () =>
    useAppSelector((state) => state.global.notifications.unreadCount);

// Forum
export const useForumPosts = () => {
    const postsById = useAppSelector((state) => state.global.forumPosts?.byId || {});
    const allIds = useAppSelector((state) => state.global.forumPosts?.allIds || []);
    return allIds.map(id => postsById[id]).filter(Boolean);
};

export const useForumGroups = () => {
    const groupsById = useAppSelector((state) => state.global.forumGroups?.byId || {});
    const allIds = useAppSelector((state) => state.global.forumGroups?.allIds || []);
    return allIds.map(id => groupsById[id]).filter(Boolean);
};

export const useForumPostById = (postId: string | undefined) => {
    return useAppSelector((state) =>
        postId ? state.global.forumPosts?.byId?.[postId] : null
    );
};

export const useForumCommentsByPostId = (postId: string | undefined) => {
    return useAppSelector((state) => {
        if (!postId || !state.global.forumComments) return [];
        const commentIds = state.global.forumComments.byPostId[postId] || [];
        return commentIds.map(id => state.global.forumComments.byId[id]).filter(Boolean);
    });
};

// Quiz hooks
export const useQuizzes = () => {
    return useAppSelector((state) => {
        const quizzes = state.global.quizzes || { byId: {}, allIds: [], attemptedIds: [] };
        return quizzes.allIds.map(id => quizzes.byId[id]).filter(Boolean);
    });
};

export const useQuizById = (quizId: string | undefined) => {
    return useAppSelector((state) =>
        quizId ? state.global.quizzes?.byId?.[quizId] : null
    );
};

export const useQuizAttempts = () => {
    return useAppSelector((state) => {
        const attempts = state.global.quizAttempts || { byId: {}, allIds: [] };
        return attempts.allIds.map(id => attempts.byId[id]).filter(Boolean);
    });
};

export const useQuizStats = () => {
    return useAppSelector((state) => state.global.quizStats);
};


// Cache metadata
export const useCacheTimestamp = (key: keyof RootState['global']['cache']) =>
    useAppSelector((state) => state.global.cache[key]);

// Check if data is stale (older than 5 minutes)
export const useIsDataStale = (key: keyof RootState['global']['cache'], maxAgeMs = 5 * 60 * 1000) => {
    const timestamp = useCacheTimestamp(key);
    if (!timestamp) return true;
    return Date.now() - timestamp > maxAgeMs;
};

// ============================================
// VIDEOS HOOKS
// ============================================

// Get all videos
export const useAllVideos = () => {
    const videosById = useAppSelector((state) => state.videos.videos.byId);
    const allIds = useAppSelector((state) => state.videos.videos.allIds);
    return allIds.map(id => videosById[id]).filter(Boolean);
};

// Get recommended videos
export const useRecommendedVideos = () => {
    const videosById = useAppSelector((state) => state.videos.videos.byId);
    const recommendedIds = useAppSelector((state) => state.videos.videos.recommendedIds);
    return recommendedIds.map(id => videosById[id]).filter(Boolean);
};

// Get video by ID
export const useVideoById = (videoId: string | undefined) => {
    return useAppSelector((state) =>
        videoId ? state.videos.videos.byId[videoId] : null
    );
};

// UI state
export const useVideosSearchQuery = () => useAppSelector((state) => state.videos.searchQuery);
export const useVideosSelectedCategory = () => useAppSelector((state) => state.videos.selectedCategory);
export const useVideosSelectedVideo = () => useAppSelector((state) => state.videos.selectedVideo);
export const useVideosShowPlayer = () => useAppSelector((state) => state.videos.showVideoPlayer);
export const useVideosShowMobileFilters = () => useAppSelector((state) => state.videos.showMobileFilters);

// Loading & error states
export const useVideosLoading = () => useAppSelector((state) => state.videos.loading);
export const useVideosSearching = () => useAppSelector((state) => state.videos.searching);
export const useVideosError = () => useAppSelector((state) => state.videos.error);

// Cache
export const useVideosLastFetched = () => useAppSelector((state) => state.videos.lastFetched);
export const useVideosLastSearchQuery = () => useAppSelector((state) => state.videos.lastSearchQuery);

// ============================================
// ADMIN HOOKS
// ============================================

// Users
export const useAdminUsers = () => {
    const usersById = useAppSelector((state) => state.admin.users.byId);
    const allIds = useAppSelector((state) => state.admin.users.allIds);
    return allIds.map(id => usersById[id]).filter(Boolean);
};

export const useAdminUserById = (userId: string | undefined) => {
    return useAppSelector((state) =>
        userId ? state.admin.users.byId[userId] : null
    );
};

export const useAdminUsersTotal = () => useAppSelector((state) => state.admin.users.total);
export const useAdminUsersPage = () => useAppSelector((state) => state.admin.users.page);
export const useAdminUsersLimit = () => useAppSelector((state) => state.admin.users.limit);

// Courses
export const useAdminCourses = () => {
    const coursesById = useAppSelector((state) => state.admin.courses.byId);
    const allIds = useAppSelector((state) => state.admin.courses.allIds);
    return allIds.map(id => coursesById[id]).filter(Boolean);
};

export const useAdminCourseById = (courseId: string | undefined) => {
    return useAppSelector((state) =>
        courseId ? state.admin.courses.byId[courseId] : null
    );
};

export const useAdminCoursesTotal = () => useAppSelector((state) => state.admin.courses.total);
export const useAdminCoursesPage = () => useAppSelector((state) => state.admin.courses.page);
export const useAdminCoursesLimit = () => useAppSelector((state) => state.admin.courses.limit);

// Badges
export const useAdminBadges = () => {
    const badgesById = useAppSelector((state) => state.admin.badges.byId);
    const allIds = useAppSelector((state) => state.admin.badges.allIds);
    return allIds.map(id => badgesById[id]).filter(Boolean);
};

export const useAdminBadgeById = (badgeId: string | undefined) => {
    return useAppSelector((state) =>
        badgeId ? state.admin.badges.byId[badgeId] : null
    );
};

export const useAdminBadgesTotal = () => useAppSelector((state) => state.admin.badges.total);

// Lessons
export const useAdminLessons = () => {
    const lessonsById = useAppSelector((state) => state.admin.lessons.byId);
    const allIds = useAppSelector((state) => state.admin.lessons.allIds);
    return allIds.map(id => lessonsById[id]).filter(Boolean);
};

export const useAdminLessonById = (lessonId: string | undefined) => {
    return useAppSelector((state) =>
        lessonId ? state.admin.lessons.byId[lessonId] : null
    );
};

export const useAdminLessonsTotal = () => useAppSelector((state) => state.admin.lessons.total);
export const useAdminLessonsPage = () => useAppSelector((state) => state.admin.lessons.page);
export const useAdminLessonsLimit = () => useAppSelector((state) => state.admin.lessons.limit);

// Quizzes
export const useAdminQuizzes = () => {
    const quizzesById = useAppSelector((state) => state.admin.quizzes.byId);
    const allIds = useAppSelector((state) => state.admin.quizzes.allIds);
    return allIds.map(id => quizzesById[id]).filter(Boolean);
};

export const useAdminQuizById = (quizId: string | undefined) => {
    return useAppSelector((state) =>
        quizId ? state.admin.quizzes.byId[quizId] : null
    );
};

export const useAdminQuizzesTotal = () => useAppSelector((state) => state.admin.quizzes.total);
export const useAdminQuizzesPage = () => useAppSelector((state) => state.admin.quizzes.page);
export const useAdminQuizzesLimit = () => useAppSelector((state) => state.admin.quizzes.limit);

// Analytics
export const useAdminAnalytics = () => useAppSelector((state) => state.admin.analytics);

// UI State
export const useAdminSelectedTab = () => useAppSelector((state) => state.admin.selectedTab);
export const useAdminSearchQuery = () => useAppSelector((state) => state.admin.searchQuery);
export const useAdminFilterRole = () => useAppSelector((state) => state.admin.filterRole);
export const useAdminFilterStatus = () => useAppSelector((state) => state.admin.filterStatus);
export const useAdminContentType = () => useAppSelector((state) => state.admin.contentType);

// Loading States
export const useAdminUsersLoading = () => useAppSelector((state) => state.admin.loading.users);
export const useAdminCoursesLoading = () => useAppSelector((state) => state.admin.loading.courses);
export const useAdminBadgesLoading = () => useAppSelector((state) => state.admin.loading.badges);
export const useAdminLessonsLoading = () => useAppSelector((state) => state.admin.loading.lessons);
export const useAdminQuizzesLoading = () => useAppSelector((state) => state.admin.loading.quizzes);
export const useAdminAnalyticsLoading = () => useAppSelector((state) => state.admin.loading.analytics);

// Error States
export const useAdminUsersError = () => useAppSelector((state) => state.admin.error.users);
export const useAdminCoursesError = () => useAppSelector((state) => state.admin.error.courses);
export const useAdminBadgesError = () => useAppSelector((state) => state.admin.error.badges);
export const useAdminLessonsError = () => useAppSelector((state) => state.admin.error.lessons);
export const useAdminQuizzesError = () => useAppSelector((state) => state.admin.error.quizzes);
export const useAdminAnalyticsError = () => useAppSelector((state) => state.admin.error.analytics);

// Cache
export const useAdminUsersLastFetched = () => useAppSelector((state) => state.admin.lastFetched.users);
export const useAdminCoursesLastFetched = () => useAppSelector((state) => state.admin.lastFetched.courses);
export const useAdminBadgesLastFetched = () => useAppSelector((state) => state.admin.lastFetched.badges);
export const useAdminLessonsLastFetched = () => useAppSelector((state) => state.admin.lastFetched.lessons);
export const useAdminQuizzesLastFetched = () => useAppSelector((state) => state.admin.lastFetched.quizzes);
export const useAdminAnalyticsLastFetched = () => useAppSelector((state) => state.admin.lastFetched.analytics);
