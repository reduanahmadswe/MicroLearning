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
  getAllLessons: (params?: any) => api.get('/lessons', { params }),
  getLessonById: (id: string) => api.get(`/lessons/${id}`),
  createLesson: (data: any) => api.post('/lessons', data),
  updateLesson: (id: string, data: any) => api.put(`/lessons/${id}`, data),
  deleteLesson: (id: string) => api.delete(`/lessons/${id}`),
  completeLesson: (id: string) => api.post(`/lessons/${id}/complete`),
  bookmarkLesson: (id: string) => api.post(`/lessons/${id}/bookmark`),
};

// AI APIs
export const aiAPI = {
  generateLesson: (data: { topic: string; difficulty?: string }) => 
    api.post('/ai/generate-lesson', data),
  generateQuiz: (data: { lessonId?: string; topic?: string }) => 
    api.post('/ai/generate-quiz', data),
  generateFlashcards: (data: { lessonId?: string; topic?: string }) => 
    api.post('/ai/generate-flashcards', data),
  chatTutor: (data: { message: string; context?: string }) => 
    api.post('/ai/chat-tutor', data),
};

// Quiz APIs
export const quizAPI = {
  getAllQuizzes: (params?: any) => api.get('/quizzes', { params }),
  getQuizById: (id: string) => api.get(`/quizzes/${id}`),
  submitQuiz: (id: string, answers: any) => api.post(`/quizzes/${id}/submit`, answers),
  getQuizResults: (id: string) => api.get(`/quizzes/${id}/results`),
  getMyQuizHistory: () => api.get('/quizzes/my-history'),
};

// Flashcards APIs
export const flashcardsAPI = {
  getAllFlashcards: (params?: any) => api.get('/flashcards', { params }),
  getFlashcardById: (id: string) => api.get(`/flashcards/${id}`),
  createFlashcard: (data: any) => api.post('/flashcards', data),
  reviewFlashcard: (id: string, rating: number) => 
    api.post(`/flashcards/${id}/review`, { rating }),
  getDueFlashcards: () => api.get('/flashcards/due'),
};

// Progress APIs
export const progressAPI = {
  getMyProgress: () => api.get('/progress/me'),
  getLessonProgress: (lessonId: string) => api.get(`/progress/lesson/${lessonId}`),
  getCourseProgress: (courseId: string) => api.get(`/progress/course/${courseId}`),
  getStreak: () => api.get('/progress/streak'),
  getXPHistory: () => api.get('/progress/xp-history'),
};

// Courses APIs
export const coursesAPI = {
  getAllCourses: (params?: any) => api.get('/courses', { params }),
  getCourseById: (id: string) => api.get(`/courses/${id}`),
  enrollInCourse: (id: string) => api.post(`/courses/${id}/enroll`),
  getMyCourses: () => api.get('/courses/my-courses'),
  getEnrolledCourses: () => api.get('/courses/enrolled'),
};

// Leaderboard APIs
export const leaderboardAPI = {
  getGlobalLeaderboard: (params?: any) => api.get('/leaderboard/global', { params }),
  getFriendsLeaderboard: () => api.get('/leaderboard/friends'),
  getTopicLeaderboard: (topic: string) => api.get(`/leaderboard/topic/${topic}`),
  getMyRank: () => api.get('/leaderboard/my-rank'),
};

// Badges APIs
export const badgesAPI = {
  getAllBadges: () => api.get('/badges'),
  getMyBadges: () => api.get('/badges/my-badges'),
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
};

// Challenges APIs
export const challengesAPI = {
  getDailyChallenges: () => api.get('/daily-challenges'),
  getActiveChallenges: () => api.get('/challenges/active'),
  acceptChallenge: (id: string) => api.post(`/challenges/${id}/accept`),
  completeChal: (id: string) => api.post(`/challenges/${id}/complete`),
  createChallenge: (data: any) => api.post('/challenges', data),
};

// Notifications APIs
export const notificationsAPI = {
  getNotifications: (params?: any) => api.get('/notifications', { params }),
  markAsRead: (id: string) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
  deleteNotification: (id: string) => api.delete(`/notifications/${id}`),
  getUnreadCount: () => api.get('/notifications/unread-count'),
};

// Comments APIs
export const commentsAPI = {
  getLessonComments: (lessonId: string) => api.get(`/comments/lesson/${lessonId}`),
  createComment: (data: any) => api.post('/comments', data),
  updateComment: (id: string, data: any) => api.put(`/comments/${id}`, data),
  deleteComment: (id: string) => api.delete(`/comments/${id}`),
  likeComment: (id: string) => api.post(`/comments/${id}/like`),
  getReplies: (commentId: string) => api.get(`/comments/${commentId}/replies`),
};

// Forum APIs
export const forumAPI = {
  getAllPosts: (params?: any) => api.get('/forum', { params }),
  getPostById: (id: string) => api.get(`/forum/${id}`),
  createPost: (data: any) => api.post('/forum', data),
  updatePost: (id: string, data: any) => api.put(`/forum/${id}`, data),
  deletePost: (id: string) => api.delete(`/forum/${id}`),
  votePost: (id: string, vote: 1 | -1) => api.post(`/forum/${id}/vote`, { vote }),
};

// Analytics APIs
export const analyticsAPI = {
  getMyAnalytics: () => api.get('/analytics'),
  getLearningInsights: () => api.get('/analytics/insights'),
  getSystemAnalytics: () => api.get('/analytics/system'),
};

// Certificates APIs
export const certificatesAPI = {
  getMyCertificates: () => api.get('/certificates/my-certificates'),
  getCertificateById: (id: string) => api.get(`/certificates/${id}`),
  generateCertificate: (courseId: string) => api.post('/certificates/generate', { courseId }),
  verifyCertificate: (certificateId: string) => api.get(`/certificates/verify/${certificateId}`),
};

// Marketplace APIs
export const marketplaceAPI = {
  getAllItems: (params?: any) => api.get('/marketplace', { params }),
  getItemById: (id: string) => api.get(`/marketplace/${id}`),
  purchaseItem: (id: string) => api.post(`/marketplace/${id}/purchase`),
  getMyPurchases: () => api.get('/marketplace/my-purchases'),
  createItem: (data: any) => api.post('/marketplace', data),
};

// TTS (Text-to-Speech) APIs
export const ttsAPI = {
  generateAudio: (data: { text: string; voice?: string }) => api.post('/tts/generate', data),
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
  getRoadmapById: (id: string) => api.get(`/roadmap/${id}`),
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
export const bookmarksAPI = {
  getMyBookmarks: () => api.get('/bookmarks'),
  addBookmark: (data: { resourceType: string; resourceId: string }) => 
    api.post('/bookmarks', data),
  removeBookmark: (id: string) => api.delete(`/bookmarks/${id}`),
};

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
  getDashboardStats: () => api.get('/admin/stats'),
  getAllUsers: (params?: any) => api.get('/admin/users', { params }),
  updateUser: (userId: string, data: any) => api.put(`/admin/users/${userId}`, data),
  deleteUser: (userId: string) => api.delete(`/admin/users/${userId}`),
  getAllContent: (type: string) => api.get(`/admin/content/${type}`),
  moderateContent: (id: string, action: string) => 
    api.post(`/admin/moderate/${id}`, { action }),
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
};
