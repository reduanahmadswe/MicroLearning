import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { analyticsAPI } from '@/services/api.service';

export interface AnalyticsOverview {
    currentLevel: number;
    totalXP: number;
    totalStudyHours: number;
    lessonsCompleted: number;
    lessonsGrowth: number;
    quizzesTaken: number;
    averageScore: number;
    avgDailyHours: number;
    currentXP: number;
    nextLevelXP: number;
}

export interface PerformanceMetrics {
    quizAverage: number;
    completionRate: number;
    accuracy: number;
    currentStreak: number;
    longestStreak: number;
}

export interface TopTopic {
    name: string;
    count: number;
    percentage: number;
}

export interface StudyTimeData {
    date: string;
    hours: number;
}

export interface LearningActivity {
    date: string;
    count: number;
}

export interface Achievements {
    badges: number;
    challenges: number;
    certificates: number;
    recentMilestones?: Array<{
        title: string;
        date: string;
    }>;
}

export interface AnalyticsData {
    overview: AnalyticsOverview;
    performance: PerformanceMetrics;
    topTopics: TopTopic[];
    studyTime: StudyTimeData[];
    learningActivity: LearningActivity[];
    achievements: Achievements;
}

interface AnalyticsState {
    analytics: AnalyticsData;
    timeRange: '7d' | '30d' | '90d' | 'all';
    loading: boolean;
    error: string | null;
    lastFetched: number | null;

    // Actions
    setTimeRange: (range: '7d' | '30d' | '90d' | 'all') => void;
    fetchAnalytics: (force?: boolean) => Promise<void>;
    clearAnalytics: () => void;
    updateAnalytics: (data: Partial<AnalyticsData>) => void;
}

const initialAnalyticsData: AnalyticsData = {
    overview: {
        currentLevel: 1,
        totalXP: 0,
        totalStudyHours: 0,
        lessonsCompleted: 0,
        lessonsGrowth: 0,
        quizzesTaken: 0,
        averageScore: 0,
        avgDailyHours: 0,
        currentXP: 0,
        nextLevelXP: 100,
    },
    performance: {
        quizAverage: 0,
        completionRate: 0,
        accuracy: 0,
        currentStreak: 0,
        longestStreak: 0,
    },
    topTopics: [],
    studyTime: [],
    learningActivity: [],
    achievements: {
        badges: 0,
        challenges: 0,
        certificates: 0,
        recentMilestones: [],
    },
};

export const useAnalyticsStore = create<AnalyticsState>()(
    persist(
        (set, get) => ({
            analytics: initialAnalyticsData,
            timeRange: '30d',
            loading: false,
            error: null,
            lastFetched: null,

            setTimeRange: (range) => {
                set({ timeRange: range });
                // Automatically fetch when time range changes
                get().fetchAnalytics(true);
            },

            fetchAnalytics: async (force = false) => {
                const state = get();

                // Cache for 5 minutes unless forced
                const CACHE_DURATION = 5 * 60 * 1000;
                if (
                    !force &&
                    state.lastFetched &&
                    Date.now() - state.lastFetched < CACHE_DURATION
                ) {
                    return;
                }

                set({ loading: true, error: null });

                try {
                    const response = await analyticsAPI.getAnalytics({
                        timeRange: state.timeRange
                    });

                    const data = response.data.data || initialAnalyticsData;

                    set({
                        analytics: data,
                        loading: false,
                        error: null,
                        lastFetched: Date.now(),
                    });
                } catch (error: any) {
                    console.error('Failed to fetch analytics:', error);
                    set({
                        loading: false,
                        error: error?.response?.data?.message || 'Failed to load analytics',
                    });
                }
            },

            clearAnalytics: () => {
                set({
                    analytics: initialAnalyticsData,
                    loading: false,
                    error: null,
                    lastFetched: null,
                });
            },

            updateAnalytics: (data) => {
                set((state) => ({
                    analytics: {
                        ...state.analytics,
                        ...data,
                    },
                }));
            },
        }),
        {
            name: 'analytics-storage',
            partialize: (state) => ({
                analytics: state.analytics,
                timeRange: state.timeRange,
                lastFetched: state.lastFetched,
            }),
        }
    )
);
