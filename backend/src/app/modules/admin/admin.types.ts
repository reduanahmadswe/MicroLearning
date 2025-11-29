export interface IAdminStats {
  users: {
    total: number;
    active: number;
    new: number;
    byRole: {
      student: number;
      instructor: number;
      admin: number;
    };
  };
  content: {
    lessons: number;
    quizzes: number;
    flashcards: number;
    courses: number;
  };
  engagement: {
    totalLessonCompletions: number;
    totalQuizAttempts: number;
    totalCertificates: number;
    averageCompletionRate: number;
  };
  topPerformers: Array<{
    userId: string;
    name: string;
    email: string;
    xp: number;
    level: number;
    completedLessons: number;
  }>;
}

export interface IUserManagement {
  userId: string;
  action: 'ban' | 'unban' | 'promote' | 'demote';
}
