import { useCallback, useState, useEffect } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { Provider, useDispatch, useSelector } from "react-redux";
import * as SplashScreen from "expo-splash-screen";
import store from "../store";
import { loadAuthData } from "../store/slices/authSlice";
import AnimatedSplashScreen from "../components/AnimatedSplashScreen";
import { usePushToken } from "../services/usePushToken";
import * as Notifications from 'expo-notifications';


SplashScreen.preventAutoHideAsync();

// Handles redirect logic after token check
function AuthGate() {
 const router = useRouter();
  const segments = useSegments();
  const dispatch = useDispatch();
  Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});
  const { isAuthenticated, isLoading } = useSelector((state) => state.auth);

    const { removeToken } = usePushToken({ enabled: isAuthenticated });


  useEffect(() => {
    dispatch(loadAuthData());
  }, []);

  useEffect(() => {
    if (isLoading) return;

    // Check if the user is currently looking at a login screen
    const inAuthGroup = segments[0] === "login";

    if (!isAuthenticated) {
      // If not logged in and not on login page, send to login
      if (!inAuthGroup) {
        router.replace("/login");
      }
    } else {
      // If logged in but still on the login page, send to tabs
      if (inAuthGroup || segments.length === 0 || segments[0] === 'index') {
        router.replace("/(tabs)");
      }
    }
  }, [isAuthenticated, isLoading, segments]);

  return null;
}

function RootLayoutNav() {
  const dispatch = useDispatch();
  const [appReady, setAppReady] = useState(false);

  const handleFinish = useCallback(async () => {
    await SplashScreen.hideAsync();
    setAppReady(true);
  }, []);

  if (!appReady) {
    return <AnimatedSplashScreen onFinish={handleFinish} />;
  }

  return (
    <>
      <AuthGate />
      <Stack screenOptions={{ headerShown: false }} />
    </>
  );
}

export default function RootLayout() {
  return (
    <Provider store={store}>
      <RootLayoutNav />
    </Provider>
  );
}