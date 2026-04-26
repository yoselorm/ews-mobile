import React, { useEffect, useCallback } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { Provider, useDispatch, useSelector } from "react-redux";
import * as SplashScreen from "expo-splash-screen";
import * as Notifications from 'expo-notifications';
import { View } from "react-native";

import store from "../store";
import { loadAuthData } from "../store/slices/authSlice";
import { usePushToken } from "../services/usePushToken";

// 1. Prevent the splash screen from hiding automatically
SplashScreen.preventAutoHideAsync().catch(() => {
  /* Reloading can sometimes trigger an error here, safely ignore */
});

/**
 * AuthGate handles the logic of redirecting users based on 
 * their authentication status.
 */
function AuthGate() {
  const router = useRouter();
  const segments = useSegments();
  const dispatch = useDispatch();
  
  const { isAuthenticated, isLoading } = useSelector((state) => state.auth);
  // Optional: move push token logic here if it depends on auth
  const { removeToken } = usePushToken({ enabled: isAuthenticated });

  useEffect(() => {
    // Set up Global Notification Handler
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });

    // Load user data from storage
    dispatch(loadAuthData());
  }, [dispatch]);

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === "login";

    if (!isAuthenticated) {
      // If not authenticated and not in the login screens, move to login
      if (!inAuthGroup) {
        router.replace("/login");
      }
    } else {
      // If authenticated and trying to go to login or the root index, move to tabs
      if (inAuthGroup || segments.length === 0 || segments[0] === 'index') {
        router.replace("/(tabs)");
      }
    }
  }, [isAuthenticated, isLoading, segments, router]);

  return null;
}

/**
 * LayoutContent is the wrapper that decides when to hide the Splash Screen.
 * It is separated so it can access the Redux state via the Provider.
 */
function LayoutContent() {
  const { isLoading } = useSelector((state) => state.auth);

  // This function is called every time the root view layouts
  const onLayoutRootView = useCallback(async () => {
    if (!isLoading) {
      // Once auth loading is finished, hide the splash screen
      try {
        await SplashScreen.hideAsync();
      } catch (e) {
        // This handles the "No native splash screen registered" error gracefully
        console.warn("SplashScreen.hideAsync error:", e);
      }
    }
  }, [isLoading]);

  return (
    <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <AuthGate />
      <Stack screenOptions={{ headerShown: false }}>
        {/* You can explicitly define screens here if needed */}
        <Stack.Screen name="login/index" options={{ animation: 'fade' }} />
        <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
      </Stack>
    </View>
  );
}

/**
 * The Root Entry Point
 */
export default function RootLayout() {
  return (
    <Provider store={store}>
      <LayoutContent />
    </Provider>
  );
}