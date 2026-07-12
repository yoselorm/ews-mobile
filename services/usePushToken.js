import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { useDispatch, useSelector } from 'react-redux';
import { registerPushToken, removePushToken } from '../store/slices/profileSlice';

export const usePushToken = ({ enabled = true } = {}) => {
    const dispatch = useDispatch();
    const tokenRef = useRef(null);
    const { isAuthenticated } = useSelector((state) => state.auth);

    const registerForPushNotifications = async () => {
        // Push notifications only work on physical devices
        if (!Device.isDevice) {
            console.warn('[PushToken] Must use a physical device for push notifications');
            return;
        }

        // Android requires a notification channel
        if (Platform.OS === 'android') {
            await Notifications.setNotificationChannelAsync('default', {
                name: 'default',
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: '#7C3AED',
            });
        }

        // Request permission
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }

        if (finalStatus !== 'granted') {
            console.warn('[PushToken] Notification permission not granted');
            return;
        }

        // Get Expo push token
        // projectId is required for managed workflow — pulled from app.json / app.config.js
        const projectId =
            Constants.expoConfig?.extra?.eas?.projectId ??
            Constants.easConfig?.projectId;

        if (!projectId) {
            console.error('[PushToken] Missing EAS projectId in app config');
            return;
        }

        try {
            const { data: expoToken } = await Notifications.getExpoPushTokenAsync({ projectId });
            tokenRef.current = expoToken;

            // Send to backend
            await dispatch(registerPushToken(expoToken)).unwrap();
        } catch (err) {
            console.error('[PushToken] Failed to get or register token:', err);
        }
    };

    useEffect(() => {
        if (!enabled || !isAuthenticated) return;

        registerForPushNotifications();
    }, [enabled, isAuthenticated, dispatch]);

    // Available if you ever need to remove the token manually.
    // Logout already handles this automatically via the logout thunk.
    const removeToken = () => {
        dispatch(removePushToken());
        tokenRef.current = null;
    };

    return { removeToken };
};