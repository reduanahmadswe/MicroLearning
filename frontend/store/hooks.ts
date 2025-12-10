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


// Cache metadata
export const useCacheTimestamp = (key: keyof RootState['global']['cache']) =>
    useAppSelector((state) => state.global.cache[key]);

// Check if data is stale (older than 5 minutes)
export const useIsDataStale = (key: keyof RootState['global']['cache'], maxAgeMs = 5 * 60 * 1000) => {
    const timestamp = useCacheTimestamp(key);
    if (!timestamp) return true;
    return Date.now() - timestamp > maxAgeMs;
};
