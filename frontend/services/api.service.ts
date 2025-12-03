import { api } from '@/lib/api';

// Auth APIs
export const authAPI = {
  login: (data: { email: string; password: string }) => 
    api.post('/auth/login', data),
  register: (data: { name: string; email: string; password: string }) => 
    api.post('/auth/register', data),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  forgotPassword: (email: string) => 
    api.post('/auth/forgot-password', { email }),
  resetPassword: (token: string, password: string) => 
    api.post('/auth/reset-password', { token, password }),
  verifyEmail: (token: string) => 
    api.post('/auth/verify-email', { token }),
  refreshToken: () => api.post('/auth/refresh-token'),
};

// Profile APIs
export const profileAPI = {
  getMyProfile: () => api.get('/profile/me'),
  getPublicProfile: (userId: string) => api.get(`/profile/${userId}`),
  updateProfile: (data: any) => api.put('/profile/me', data),
  updatePreferences: (data: any) => api.put('/profile/me/preferences', data),
  getMyBadges: () => api.get('/profile/me/badges'),
  getMyStatistics: () => api.get('/profile/me/statistics'),
  searchUsers: (query: string) => api.get(`/profile/search?q=${query}`),
};

// Lessons APIs
export const lessonsAPI = {
  getLessons: (params?: any) => api.get('/lessons', { params }),
  getAllLessons: (params?: any) => api.get('/lessons', { params }),
  getLesson: (id: string) => api.get(`/lessons/${id}`),
  getLessonById: (id: string) => api.get(`/lessons/${id}`),
  createLesson: (data: any) => api.post('/lessons/create', data),
  updateLesson: (id: string, data: any) => api.put(`/lessons/${id}`, data),
  deleteLesson: (id: string) => api.delete(`/lessons/${id}`),
  completeLesson: (id: string) => api.post(`/lessons/${id}/complete`),
  bookmarkLesson: (id: string) => api.post(`/lessons/${id}/bookmark`),
  likeLesson: (id: string) => api.post(`/lessons/${id}/like`),
  // Instructor APIs
  getInstructorLessons: () => api.get('/lessons/instructor/my-lessons'),
  getInstructorAnalytics: () => api.get('/lessons/instructor/analytics'),
};

// AI APIs
export const aiAPI = {
  generateLesson: (data: { topic: string; difficulty?: string; estimatedTime?: number }) => 
    api.post('/ai/generate/lesson', data),
  generateQuiz: (data: { topic?: string; difficulty?: string; questionCount?: number; lessonId?: string }) => 
    api.post('/ai/generate/quiz', data),
  generateFlashcards: (data: { topic: string; count?: number; lessonId?: string }) => 
    api.post('/ai/generate/flashcards', data),
  chat: (data: { message: string; conversationHistory?: any[] }) => 
    api.post('/ai/chat', data),
  chatTutor: (data: { message: string; context?: string }) => 
    api.post('/ai/chat', data),
};

// Quiz APIs
export const quizAPI = {
  getQuizzes: (params?: any) => api.get('/quizzes', { params }),
  getAllQuizzes: (params?: any) => api.get('/quizzes', { params }),
  getQuiz: (id: string) => api.get(`/quizzes/${id}`),
  getQuizById: (id: string) => api.get(`/quizzes/${id}`),
  createQuiz: (data: any) => api.post('/quizzes', data),
  updateQuiz: (id: string, data: any) => api.put(`/quizzes/${id}`, data),
  deleteQuiz: (id: string) => api.delete(`/quizzes/${id}`),
  submitQuiz: (id: string, data: any) => api.post(`/quizzes/${id}/attempt`, data),
  getQuizResult: (attemptId: string) => api.get(`/quizzes/attempt/${attemptId}`),
  getQuizResults: (id: string) => api.get(`/quizzes/${id}/results`),
  getUserStats: () => api.get('/quizzes/attempts/me'),
  getMyQuizHistory: () => api.get('/quizzes/attempts/me'),
  getUserAttempts: () => api.get('/quizzes/attempts/me'),
};

// Flashcards APIs
export const flashcardsAPI = {
  getFlashcards: (params?: any) => api.get('/flashcards/me', { params }),
  getAllFlashcards: (params?: any) => api.get('/flashcards/me', { params }),
  getFlashcardById: (id: string) => api.get(`/flashcards/${id}`),
  createFlashcard: (data: any) => api.post('/flashcards', data),
  updateFlashcard: (id: string, data: any) => api.put(`/flashcards/${id}`, data),
  deleteFlashcard: (id: string) => api.delete(`/flashcards/${id}`),
  reviewFlashcard: (id: string, data: any) => 
    api.post(`/flashcards/${id}/review`, data),
  getDueFlashcards: () => api.get('/flashcards/due'),
  getFlashcardStats: () => api.get('/flashcards/stats'),
};

// Progress APIs
export const progressAPI = {
  getProgress: () => api.get('/progress/stats/me'),
  getMyProgress: () => api.get('/progress/stats/me'),
  getLessonProgress: (lessonId: string) => api.get(`/progress/lesson/${lessonId}`),
  getCourseProgress: (courseId: string) => api.get(`/progress/course/${courseId}`),
  getStreak: () => api.get('/progress/stats/me'),
  getXPHistory: () => api.get('/progress/activity'),
  getMyStats: () => api.get('/progress/stats/me'),
  getUserStats: (userId: string) => api.get(`/progress/stats/${userId}`),
  getLeaderboard: (params?: any) => api.get('/progress/leaderboard', { params }),
  getMyMilestones: () => api.get('/progress/milestones/me'),
  getActivityFeed: (params?: any) => api.get('/progress/activity', { params }),
};

// Courses APIs
export const coursesAPI = {
  getAllCourses: (params?: any) => api.get('/courses', { params }),
  getCourses: (params?: any) => api.get('/courses', { params }),
  getCourseById: (id: string) => api.get(`/courses/${id}`),
  getCourse: (id: string) => api.get(`/courses/${id}`),
  getEnrollment: (id: string) => api.get(`/courses/${id}/enrollment`),
  createCourse: (data: any) => api.post('/courses', data),
  updateCourse: (id: string, data: any) => api.put(`/courses/${id}`, data),
  deleteCourse: (id: string) => api.delete(`/courses/${id}`),
  enrollInCourse: (id: string) => api.post(`/courses/${id}/enroll`),
  enrollCourse: (id: string) => api.post(`/courses/${id}/enroll`),
  getMyCourses: () => api.get('/courses/my-courses'),
  getEnrolledCourses: () => api.get('/courses/enrollments/me'),
  togglePublish: (id: string) => api.patch(`/courses/${id}/publish`),
  // Instructor APIs
  getInstructorCourses: () => api.get('/courses/instructor/my-courses'),
  getInstructorAnalytics: () => api.get('/courses/instructor/analytics'),
  getCourseStudents: (courseId: string) => api.get(`/courses/instructor/${courseId}/students`),
};

// Leaderboard APIs
export const leaderboardAPI = {
  getGlobalLeaderboard: (params?: any) => api.get('/leaderboard/global', { params }),
  getFriendsLeaderboard: (timeRange?: string) => api.get('/leaderboard/friends', { params: { timeRange } }),
  getTopicLeaderboard: (topic: string, timeRange?: string) => api.get(`/leaderboard/topic/${topic}`, { params: { timeRange } }),
  getMyRank: () => api.get('/leaderboard/my-rank'),
};

// Badges APIs
export const badgesAPI = {
  getBadges: () => api.get('/badges'),
  getAllBadges: () => api.get('/badges'),
  getUserBadges: () => api.get('/badges/earned/me'),
  getMyBadges: () => api.get('/badges/earned/me'),
  getBadgeById: (id: string) => api.get(`/badges/${id}`),
};

// Friends APIs
export const friendsAPI = {
  sendFriendRequest: (userId: string) => api.post('/friends/request', { userId }),
  acceptFriendRequest: (requestId: string) => api.post(`/friends/accept/${requestId}`),
  rejectFriendRequest: (requestId: string) => api.post(`/friends/reject/${requestId}`),
  getFriendRequests: () => api.get('/friends/requests'),
  getFriends: () => api.get('/friends'),
  removeFriend: (friendId: string) => api.delete(`/friends/${friendId}`),
  getFriendSuggestions: () => api.get('/friends/suggestions'),
  getSuggestions: () => api.get('/friends/suggestions'),
};

// Challenges APIs
export const challengesAPI = {
  getDailyChallenges: () => api.get('/daily-challenges'),
  getActiveChallenges: () => api.get('/challenges/active'),
  getChallenges: () => api.get('/challenges'),
  acceptChallenge: (id: string) => api.post(`/challenges/${id}/accept`),
  joinChallenge: (id: string) => api.post(`/challenges/${id}/join`),
  completeChal: (id: string) => api.post(`/challenges/${id}/complete`),
  createChallenge: (data: any) => api.post('/challenges', data),
  getUserStats: () => api.get('/challenges/stats/me'),
};

// Daily Challenge APIs
export const dailyChallengeAPI = {
  getTodayChallenge: () => api.get('/daily-challenges/today'),
  completeChallenge: (id: string) => api.post(`/daily-challenges/${id}/complete`),
  getChallenges: () => api.get('/daily-challenges'),
};

// Quiz Battle APIs
export const quizBattleAPI = {
  getBattles: () => api.get('/quiz-battles'),
  createBattle: (data: any) => api.post('/quiz-battles', data),
  getBattleById: (id: string) => api.get(`/quiz-battles/${id}`),
  joinBattle: (id: string) => api.post(`/quiz-battles/${id}/join`),
  submitAnswer: (battleId: string, data: any) => api.post(`/quiz-battles/${battleId}/answer`, data),
};

export const challengeAPI = challengesAPI;

// Notifications APIs
export const notificationsAPI = {
  getNotifications: (params?: any) => api.get('/notifications', { params }),
  markAsRead: (id: string) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
  deleteNotification: (id: string) => api.delete(`/notifications/${id}`),
  getUnreadCount: () => api.get('/notifications/unread-count'),
};

export const notificationAPI = notificationsAPI;

// Comments APIs
export const commentAPI = {
  getComments: (params?: any) => api.get('/comments', { params }),
  getLessonComments: (lessonId: string) => api.get(`/comments/lesson/${lessonId}`),
  getForumComments: (postId: string) => api.get(`/forum/posts/${postId}/comments`),
  createComment: (data: any) => api.post('/forum/comments', data),
  updateComment: (id: string, data: any) => api.patch(`/forum/comments/${id}`, data),
  deleteComment: (id: string) => api.delete(`/forum/comments/${id}`),
  likeComment: (id: string) => api.post(`/forum/comments/${id}/like`),
  getReplies: (commentId: string) => api.get(`/comments/${commentId}/replies`),
};

export const commentsAPI = commentAPI;

// Forum APIs
export const forumAPI = {
  getAllPosts: (params?: any) => api.get('/forum/posts', { params }),
  getPosts: (params?: any) => api.get('/forum/posts', { params }),
  getPostById: (id: string) => api.get(`/forum/posts/${id}`),
  getPost: (id: string) => api.get(`/forum/posts/${id}`),
  createPost: (data: any) => api.post('/forum/posts', data),
  updatePost: (id: string, data: any) => api.patch(`/forum/posts/${id}`, data),
  deletePost: (id: string) => api.delete(`/forum/posts/${id}`),
  likePost: (id: string) => api.post(`/forum/posts/${id}/like`),
  votePost: (id: string, vote: 1 | -1) => api.post(`/forum/posts/${id}/like`, { vote }),
  upvotePost: (id: string) => api.post(`/forum/posts/${id}/like`, { vote: 1 }),
  getTrendingTopics: () => api.get('/forum/stats'),
  moderatePost: (id: string, data: { status: string }) => api.post(`/forum/posts/${id}/report`, data),
};

// Analytics APIs
export const analyticsAPI = {
  getMyAnalytics: () => api.get('/analytics'),
  getAnalytics: (params?: any) => api.get('/analytics', { params }),
  getLearningInsights: () => api.get('/analytics/insights'),
  getSystemAnalytics: () => api.get('/analytics/system'),
};

// Certificates APIs
export const certificatesAPI = {
  getMyCertificates: () => api.get('/certificates/me'),
  getCertificateById: (id: string) => api.get(`/certificates/view/${id}`),
  generateCertificate: (courseId: string) => api.post('/certificates/generate', { courseId }),
  verifyCertificate: (certificateId: string) => api.get(`/certificates/verify/${certificateId}`),
};

// Marketplace APIs
export const marketplaceAPI = {
  getAllItems: (params?: any) => api.get('/marketplace', { params }),
  getItems: (params?: any) => api.get('/marketplace', { params }),
  getItemById: (id: string) => api.get(`/marketplace/${id}`),
  purchaseItem: (id: string) => api.post(`/marketplace/${id}/purchase`),
  getMyPurchases: () => api.get('/marketplace/my-purchases'),
  getPurchases: () => api.get('/marketplace/my-purchases'),
  getMyItems: () => api.get('/marketplace/my-items'),
  createItem: (data: any) => api.post('/marketplace', data),
  deleteItem: (id: string) => api.delete(`/marketplace/${id}`),
  
  // Admin Moderation APIs
  getItemsByStatus: (status: string) => api.get(`/marketplace/admin/items?status=${status}`),
  moderateItem: (id: string, data: { status: string; reason?: string }) => 
    api.patch(`/marketplace/${id}/moderate`, data),
  getModerationStats: () => api.get('/marketplace/admin/stats'),
  getAllSellers: () => api.get('/marketplace/admin/sellers'),
  verifySeller: (sellerId: string) => api.patch(`/marketplace/sellers/${sellerId}/verify`),
  suspendSeller: (sellerId: string, data: { reason: string }) => 
    api.patch(`/marketplace/sellers/${sellerId}/suspend`, data),
};

// TTS (Text-to-Speech) APIs
export const ttsAPI = {
  textToSpeech: (data: { text: string; voice?: string }) => api.post('/tts/synthesize', data),
  generateAudio: (data: { text: string; voice?: string }) => api.post('/tts/synthesize', data),
  getVoices: () => api.get('/tts/voices'),
  getMyAudios: () => api.get('/tts/my-audios'),
};

// ASR (Speech-to-Text) APIs
export const asrAPI = {
  transcribe: (audioFile: File) => {
    const formData = new FormData();
    formData.append('audio', audioFile);
    return api.post('/asr/transcribe', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  getTranscriptions: () => api.get('/asr/transcriptions'),
};

// Roadmap APIs
export const roadmapAPI = {
  generateRoadmap: (data: { goal: string; currentLevel?: string; timeframe?: string }) => 
    api.post('/roadmap/generate', data),
  getMyRoadmaps: () => api.get('/roadmap/my-roadmaps'),
  getRoadmaps: () => api.get('/roadmap/my-roadmaps'),
  getRoadmapById: (id: string) => api.get(`/roadmap/${id}`),
  getRoadmap: (id: string) => api.get(`/roadmap/${id}`),
  enrollRoadmap: (id: string) => api.post(`/roadmap/${id}/enroll`),
  updateMilestone: (roadmapId: string, milestoneId: string, status: string) => 
    api.put(`/roadmap/${roadmapId}/milestone/${milestoneId}`, { status }),
};

// Career Mentor APIs
export const careerMentorAPI = {
  getCareerAdvice: (data: { currentRole?: string; targetRole?: string; skills?: string[] }) => 
    api.post('/career-mentor/advice', data),
  getSkillGapAnalysis: () => api.get('/career-mentor/skill-gap'),
  getJobRecommendations: () => api.get('/career-mentor/job-recommendations'),
};

// Bookmarks APIs
export const bookmarkAPI = {
  getMyBookmarks: () => api.get('/bookmarks/me'),
  getBookmarks: () => api.get('/bookmarks/me'),
  createBookmark: (data: { lessonId: string; collection?: string; notes?: string }) => 
    api.post('/bookmarks/add', data),
  addBookmark: (data: { lessonId: string; collection?: string; notes?: string }) => 
    api.post('/bookmarks/add', data),
  removeBookmark: (lessonId: string) => api.delete(`/bookmarks/remove/${lessonId}`),
  checkBookmark: (lessonId: string) => api.get(`/bookmarks/check/${lessonId}`),
};

export const bookmarksAPI = bookmarkAPI;

// Upload APIs
export const uploadAPI = {
  uploadFile: (file: File, type: string) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    return api.post('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  deleteFile: (fileId: string) => api.delete(`/upload/${fileId}`),
};

// Admin APIs
export const adminAPI = {
  // Dashboard
  getStats: () => api.get('/admin/dashboard'),
  getContentStats: () => api.get('/admin/content-stats'),
  
  // User Management
  getUsers: (params?: any) => api.get('/admin/users', { params }),
  deleteUser: (userId: string) => api.delete(`/admin/users/${userId}`),
  banUser: (userId: string) => api.patch(`/admin/users/${userId}/ban`),
  unbanUser: (userId: string) => api.patch(`/admin/users/${userId}/unban`),
  promoteToInstructor: (userId: string) => api.patch(`/admin/users/${userId}/promote`),
  demoteToLearner: (userId: string) => api.patch(`/admin/users/${userId}/demote`),
  
  // System Monitoring
  getSystemStats: () => api.get('/admin/system/stats'),
  getPerformanceMetrics: () => api.get('/admin/system/performance'),
  getErrorLogs: (params?: any) => api.get('/admin/system/errors', { params }),
  getDatabaseHealth: () => api.get('/admin/system/database-health'),
  
  // Content Moderation
  getComments: (params?: any) => api.get('/admin/moderation/comments', { params }),
  moderateComment: (commentId: string, data: { action: string; reason?: string }) =>
    api.patch(`/admin/moderation/comments/${commentId}`, data),
  getFlaggedContent: (params?: any) => api.get('/admin/moderation/flagged', { params }),
  removeSpam: (contentId: string, contentType: string) =>
    api.delete(`/admin/moderation/spam/${contentId}`, { data: { contentType } }),
  
  // Content Management (legacy - for backwards compatibility)
  getContent: () => api.get('/admin/content-stats'),
  deleteContent: (contentId: string) => api.delete(`/admin/content/${contentId}`),
};

// Challenge Admin APIs
export const challengeAdminAPI = {
  getAllChallenges: (params?: any) => api.get('/challenges/admin/all', { params }),
  updateChallenge: (challengeId: string, data: any) => api.patch(`/challenges/admin/${challengeId}`, data),
  deleteChallenge: (challengeId: string) => api.delete(`/challenges/admin/${challengeId}`),
  createQuizBattle: (data: any) => api.post('/challenges/admin/quiz-battle', data),
  getQuizBattles: (params?: any) => api.get('/challenges/admin/quiz-battles', { params }),
};

// Leaderboard Admin APIs
export const leaderboardAdminAPI = {
  resetLeaderboard: (data: { type: string; topic?: string }) => api.post('/leaderboard/admin/reset', data),
  adjustUserScore: (userId: string, data: { xpChange: number; reason: string }) =>
    api.patch(`/leaderboard/admin/adjust/${userId}`, data),
  getLeaderboardStats: () => api.get('/leaderboard/admin/stats'),
};

// Badge Admin APIs
export const badgeAdminAPI = {
  getAllBadges: () => api.get('/badges/admin/all'),
  createBadge: (data: any) => api.post('/badges/create', data),
  updateBadge: (badgeId: string, data: any) => api.patch(`/badges/admin/${badgeId}`, data),
  deleteBadge: (badgeId: string) => api.delete(`/badges/admin/${badgeId}`),
  awardBadge: (data: { userId: string; badgeId: string; reason?: string }) =>
    api.post('/badges/admin/award', data),
};

// Analytics Admin APIs
export const analyticsAdminAPI = {
  getSystemAnalytics: () => api.get('/analytics/system'),
  getRevenueAnalytics: (params?: { startDate?: string; endDate?: string }) =>
    api.get('/analytics/admin/revenue', { params }),
  getEngagementReport: (params?: { timeframe?: string }) =>
    api.get('/analytics/admin/engagement', { params }),
  getPopularContent: (params?: { limit?: number }) =>
    api.get('/analytics/admin/popular-content', { params }),
  getLearningTrends: (params?: { period?: string }) =>
    api.get('/analytics/admin/learning-trends', { params }),
  getUserGrowth: (params?: { period?: string }) =>
    api.get('/analytics/admin/user-growth', { params }),
};

export default {
  auth: authAPI,
  profile: profileAPI,
  lessons: lessonsAPI,
  ai: aiAPI,
  quiz: quizAPI,
  flashcards: flashcardsAPI,
  progress: progressAPI,
  courses: coursesAPI,
  leaderboard: leaderboardAPI,
  badges: badgesAPI,
  friends: friendsAPI,
  challenges: challengesAPI,
  notifications: notificationsAPI,
  comments: commentsAPI,
  forum: forumAPI,
  analytics: analyticsAPI,
  certificates: certificatesAPI,
  marketplace: marketplaceAPI,
  tts: ttsAPI,
  asr: asrAPI,
  roadmap: roadmapAPI,
  careerMentor: careerMentorAPI,
  bookmarks: bookmarksAPI,
  upload: uploadAPI,
  admin: adminAPI,
  challengeAdmin: challengeAdminAPI,
  leaderboardAdmin: leaderboardAdminAPI,
  badgeAdmin: badgeAdminAPI,
  analyticsAdmin: analyticsAdminAPI,
};
