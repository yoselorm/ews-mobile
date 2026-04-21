import { useEffect } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { Provider, useDispatch, useSelector } from "react-redux";
import * as SplashScreen from "expo-splash-screen";
import store from "../store";
import { loadAuthData } from "../store/slices/authSlice";
import { usePushToken } from "../services/usePushToken";
import * as Notifications from 'expo-notifications';

// Keep the splash screen visible while we fetch auth data
SplashScreen.preventAutoHideAsync();

function AuthGate() {
  const router = useRouter();
  const segments = useSegments();
  const dispatch = useDispatch();
  
  const { isAuthenticated, isLoading } = useSelector((state) => state.auth);
  const { removeToken } = usePushToken({ enabled: isAuthenticated });

  // 1. Set up Notifications
  useEffect(() => {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });
  }, []);

  // 2. Load Auth Data on Mount
  useEffect(() => {
    dispatch(loadAuthData());
  }, []);

  // 3. Handle Navigation and Splash Screen Hiding
  useEffect(() => {
    if (isLoading) return;

    // Once loading is finished, hide the native splash screen
    SplashScreen.hideAsync();

    const inAuthGroup = segments[0] === "login";

    if (!isAuthenticated) {
      if (!inAuthGroup) {
        router.replace("/login");
      }
    } else {
      if (inAuthGroup || segments.length === 0 || segments[0] === 'index') {
        router.replace("/(tabs)");
      }
    }
  }, [isAuthenticated, isLoading, segments]);

  return null;
}

export default function RootLayout() {
  return (
    <Provider store={store}>
      <AuthGate />
      <Stack screenOptions={{ headerShown: false }} />
    </Provider>
  );
}