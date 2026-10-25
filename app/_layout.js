import React, { useEffect } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { Provider, useDispatch, useSelector } from "react-redux";
import * as SplashScreen from "expo-splash-screen";
import * as Notifications from "expo-notifications";

import store from "../store";
import { loadAuthData } from "../store/slices/authSlice";
import { usePushToken } from "../services/usePushToken";
import { ToastProvider } from "../components/Toast";

// Keep splash screen visible while loading auth state
SplashScreen.preventAutoHideAsync().catch(() => {});

// Configure foreground notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Routes accessible without authentication
const PUBLIC_SEGMENTS = ["login", "legal"];

function AuthGate() {
  const router = useRouter();
  const segments = useSegments();

  const { isAuthenticated, isLoading } = useSelector(
    (state) => state.auth
  );

  // Custom push token hook handles permission prompt, registration, and logout cleanup
  usePushToken({ enabled: isAuthenticated });

  useEffect(() => {
    if (isLoading) return;

    const topSegment = segments?.[0];
    const inPublicGroup = PUBLIC_SEGMENTS.includes(topSegment);

    if (!isAuthenticated && !inPublicGroup && segments.length > 0) {
      router.replace("/login");
    } else if (isAuthenticated && topSegment === "login") {
      router.replace("/(tabs)");
    }
  }, [isAuthenticated, isLoading, segments, router]);

  return null;
}

function LayoutContent() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { isLoading } = useSelector((state) => state.auth);

  useEffect(() => {
    // 1. Load initial auth data from persistent storage
    dispatch(loadAuthData());

    // 2. Handle app opening/navigation when a push notification is tapped
    const subscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        setTimeout(() => {
          router.push("/(tabs)/alerts");
        }, 100);
      }
    );

    return () => subscription.remove();
  }, [dispatch, router]);

  useEffect(() => {
    // Hide splash screen as soon as authentication loading completes
    if (!isLoading) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [isLoading]);

  return (
    <>
      <AuthGate />

      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen
          name="login/index"
          options={{ animation: "fade" }}
        />
        <Stack.Screen
          name="(tabs)"
          options={{ animation: "fade" }}
        />
      </Stack>

      <ToastProvider />
    </>
  );
}

export default function RootLayout() {
  return (
    <Provider store={store}>
      <LayoutContent />
    </Provider>
  );
}