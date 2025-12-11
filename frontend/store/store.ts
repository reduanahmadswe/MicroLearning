import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // localStorage
import globalReducer from './globalSlice';
import videosReducer from './videosSlice';
import adminReducer from './adminSlice';

// ============================================
// PERSISTENCE CONFIGURATION
// ============================================

const persistConfig = {
    key: 'microlearning-root',
    version: 1,
    storage,
    whitelist: ['global', 'videos'], // Persist global and videos state (not admin for security)
    blacklist: ['admin'], // Don't persist admin data
    // Throttle writes to localStorage (performance optimization)
    throttle: 1000,
};

// ============================================
// ROOT REDUCER
// ============================================

const rootReducer = combineReducers({
    global: globalReducer,
    videos: videosReducer,
    admin: adminReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

// ============================================
// STORE CONFIGURATION
// ============================================

export const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                // Ignore redux-persist actions
                ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
            },
        }),
    devTools: process.env.NODE_ENV !== 'production',
});

export const persistor = persistStore(store);

// ============================================
// TYPES
// ============================================

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
