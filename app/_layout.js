import React, { useEffect } from "react";
import { router, Stack, useRouter, useSegments } from "expo-router";
import { Provider, useDispatch, useSelector } from "react-redux";
import * as SplashScreen from "expo-splash-screen";
import * as Notifications from "expo-notifications";

import store from "../store";
import { loadAuthData } from "../store/slices/authSlice";
import { usePushToken } from "../services/usePushToken";
import { ToastProvider } from "../components/Toast"; // 1. add this import

// Keep splash visible until auth check completes
SplashScreen.preventAutoHideAsync().catch(() => {});

// Segments reachable without an authenticated session
const PUBLIC_SEGMENTS = ["login", "legal"];

function AuthGate() {
  const router = useRouter();
  const segments = useSegments();

  const { isAuthenticated, isLoading } = useSelector(
    (state) => state.auth
  );

  usePushToken({ enabled: isAuthenticated });

  useEffect(() => {
    if (isLoading) return;

    const inPublicGroup = PUBLIC_SEGMENTS.includes(segments?.[0]);

    if (!isAuthenticated && !inPublicGroup && segments.length > 0) {
      router.replace("/login");
    }

    if (isAuthenticated && segments?.[0] === "login") {
      router.replace("/(tabs)");
    }
  }, [isAuthenticated, isLoading, segments]);

  return null;
}

function LayoutContent() {
  const dispatch = useDispatch();
  const { isLoading } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(loadAuthData());

    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });

    const subscription = Notifications.addNotificationResponseReceivedListener(response => {
      setTimeout(() => {
        router.push("/(tabs)/alerts");
      }, 500);
    });

    return () => subscription.remove();
  }, [dispatch]);

  useEffect(() => {
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