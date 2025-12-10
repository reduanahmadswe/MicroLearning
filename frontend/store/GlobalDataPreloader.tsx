'use client';

import { useEffect, useRef } from 'react';
import { useAuthStore } from './authStore';
import { useAppDispatch, useIsInitializing } from './hooks';
import { preloadAllData, setUser, clearGlobalState } from './globalSlice';
import { toast } from 'sonner';

/**
 * GlobalDataPreloader
 * 
 * This component runs once after login and preloads ALL essential data
 * into the Redux store. After this initial load, pages will read from
 * the store instead of making API calls.
 * 
 * Features:
 * - Runs automatically after login
 * - Fetches all data in parallel for speed
 * - Stores data in normalized format
 * - Persists to localStorage
 * - Provides instant navigation
 */
export function GlobalDataPreloader({ children }: { children: React.ReactNode }) {
    const dispatch = useAppDispatch();
    const { user, token, isAuthenticated } = useAuthStore();
    const isInitializing = useIsInitializing();
    const hasPreloaded = useRef(false);
    const previousAuthState = useRef(isAuthenticated);

    useEffect(() => {
        // User just logged in
        if (isAuthenticated && user && token && !hasPreloaded.current) {
            hasPreloaded.current = true;

            // Sync user to Redux
            dispatch(setUser(user));

            // Preload all data
            dispatch(preloadAllData())
                .unwrap()
                .then(() => {
                    console.log('✅ Global data preloaded successfully');
                })
                .catch((error) => {
                    console.error('❌ Failed to preload data:', error);
                    toast.error('Failed to load some data. Please refresh.');
                });
        }

        // User just logged out
        if (!isAuthenticated && previousAuthState.current) {
            hasPreloaded.current = false;
            dispatch(clearGlobalState());
            console.log('🔄 Global state cleared on logout');
        }

        previousAuthState.current = isAuthenticated;
    }, [isAuthenticated, user, token, dispatch]);

    // Sync user updates to Redux
    useEffect(() => {
        if (user && isAuthenticated) {
            dispatch(setUser(user));
        }
    }, [user, isAuthenticated, dispatch]);

    return <>{children}</>;
}
