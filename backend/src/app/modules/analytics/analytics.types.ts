export interface IUserAnalytics {
  learningStreak: {
    current: number;
    longest: number;
    lastActivityDate: Date;
  };
  progressOverTime: Array<{
    date: string;
    xp: number;
    lessonsCompleted: number;
  }>;
  categoryBreakdown: Array<{
    category: string;
    lessonsCompleted: number;
    timeSpent: number; // in minutes
  }>;
  performanceMetrics: {
    averageQuizScore: number;
    totalQuizzes: number;
    completionRate: number;
    studyTimeTotal: number; // in minutes
  };
  achievements: {
    badges: number;
    certificates: number;
    coursesCompleted: number;
  };
}

export interface ISystemAnalytics {
  userGrowth: Array<{
    date: string;
    newUsers: number;
    totalUsers: number;
  }>;
  engagementMetrics: {
    dailyActiveUsers: number;
    weeklyActiveUsers: number;
    monthlyActiveUsers: number;
    averageSessionDuration: number;
  };
  contentMetrics: {
    mostPopularLessons: Array<{
      lessonId: string;
      title: string;
      completions: number;
    }>;
    mostPopularCourses: Array<{
      courseId: string;
      title: string;
      enrollments: number;
    }>;
  };
  performanceMetrics: {
    averageCompletionTime: number;
    dropOffRate: number;
    retentionRate: number;
  };
}
