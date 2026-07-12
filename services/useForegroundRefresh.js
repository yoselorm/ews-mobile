import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const REFRESH_INTERVAL_MS = 8 * 60 * 60 * 1000; // 8 hours


export const useForegroundRefresh = (storageKey, onRefresh) => {
    const appState = useRef(AppState.currentState);

    useEffect(() => {
        const checkAndRefresh = async () => {
            try {
                const lastFetchStr = await AsyncStorage.getItem(storageKey);
                const lastFetch = lastFetchStr ? parseInt(lastFetchStr, 10) : 0;
                const now = Date.now();

                if (now - lastFetch >= REFRESH_INTERVAL_MS) {
                    onRefresh();
                    await AsyncStorage.setItem(storageKey, String(now));
                }
            } catch (err) {
                // if storage read fails, refresh anyway to be safe
                onRefresh();
            }
        };

        // Run once on mount (covers cold start / first screen focus)
        checkAndRefresh();

        const subscription = AppState.addEventListener('change', (nextState) => {
            const cameToForeground =
                appState.current.match(/inactive|background/) && nextState === 'active';

            if (cameToForeground) {
                checkAndRefresh();
            }

            appState.current = nextState;
        });

        return () => subscription.remove();
    }, [storageKey, onRefresh]);
};