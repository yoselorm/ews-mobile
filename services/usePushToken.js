import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { useDispatch } from 'react-redux';
import { registerPushToken, removePushToken } from '../store/slices/profileSlice';

/**
 * usePushToken
 *
 * Call this once at the root of your app (e.g. inside your root _layout.jsx
 * or right after the user logs in).
 *
 * It will:
 *  1. Request notification permissions
 *  2. Get the Expo push token
 *  3. Dispatch registerPushToken to send it to your backend
 *
 * Pass `enabled: false` to skip registration (e.g. when user is logged out).
 * Call the returned `removeToken()` on logout to clean up server-side.
 */
export const usePushToken = ({ enabled = true } = {}) => {
  const dispatch    = useDispatch();
  const tokenRef    = useRef(null);

  useEffect(() => {
    if (!enabled) return;
    registerForPushNotifications();
  }, [enabled]);

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
      console.log('[PushToken] Token:', expoToken);

      // Send to backend
      await dispatch(registerPushToken(expoToken)).unwrap();
    } catch (err) {
      console.error('[PushToken] Failed to get or register token:', err);
    }
  };

  // Call this on logout to remove the token from the backend
  const removeToken = () => dispatch(removePushToken());

  return { removeToken };
};