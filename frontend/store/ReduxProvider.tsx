'use client';

import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './store';
import { GlobalDataPreloader } from './GlobalDataPreloader';

/**
 * ReduxProvider
 * 
 * Wraps the entire app with:
 * 1. Redux Provider (state management)
 * 2. PersistGate (state persistence)
 * 3. GlobalDataPreloader (automatic data loading)
 */
export function ReduxProvider({ children }: { children: React.ReactNode }) {
    return (
        <Provider store={store}>
            <PersistGate loading={null} persistor={persistor}>
                <GlobalDataPreloader>
                    {children}
                </GlobalDataPreloader>
            </PersistGate>
        </Provider>
    );
}
