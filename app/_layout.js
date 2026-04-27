import React, { useEffect } from "react";
import { router, Stack, useRouter, useSegments } from "expo-router";
import { Provider, useDispatch, useSelector } from "react-redux";
import * as SplashScreen from "expo-splash-screen";
import * as Notifications from "expo-notifications";

import store from "../store";
import { loadAuthData } from "../store/slices/authSlice";
import { usePushToken } from "../services/usePushToken";

// Keep splash visible until auth check completes
SplashScreen.preventAutoHideAsync().catch(() => {});

function AuthGate() {
  const router = useRouter();
  const segments = useSegments();

  const { isAuthenticated, isLoading } = useSelector(
    (state) => state.auth
  );

  const { removeToken } = usePushToken({ enabled: isAuthenticated });

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments?.[0] === "login";

    // User logged out while inside app
    if (!isAuthenticated && !inAuthGroup && segments.length > 0) {
      router.replace("/login");
    }

    // User logged in while on login screen
    if (isAuthenticated && inAuthGroup) {
      router.replace("/(tabs)");
    }
  }, [isAuthenticated, isLoading, segments]);

  return null;
}

function LayoutContent() {
  const dispatch = useDispatch();
  const { isLoading } = useSelector((state) => state.auth);

  // Load auth state once
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

  // Hide splash when auth loading finishes
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