// import { View, Text, TouchableOpacity } from "react-native";
// import { logout } from "../store/slices/authSlice";
// import { useAppDispatch } from "../store/hooks";
// import { router } from "expo-router";

import { useRouter } from "expo-router";
import { useEffect } from "react";
import { useSelector } from "react-redux";

// export default function HomeScreen() {
// const dispatch = useAppDispatch();
//    const handleLogout = async () => {
//   try {
//     await dispatch(logout()).unwrap();
//         // router.replace("/login"); 
//   } catch (error) {
//     Alert.alert("Logout Failed", "Could not connect to server. Please try again.");
//     console.error("Logout error:", error);
//   }
// };
//   return (
//     <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
//       <Text>Home Screen</Text>
//       <TouchableOpacity 
//       onPress={handleLogout}
//       className="bg-red-500 p-4 rounded-xl"
//     >
//       <Text className="text-white text-center font-bold">Logout</Text>
//     </TouchableOpacity>
//     </View>

    
//   );
// }


// import { Redirect } from "expo-router";
// import { useSelector } from "react-redux";
// export default function Index() {
//   const { isAuthenticated, isLoading } = useSelector((state) => state.auth);
//   console.log("Auth State on Index:", { isAuthenticated, isLoading });

//   // While we check SecureStore, don't show anything 
//   // (The Splash screen is visible anyway)
//   if (isLoading) return null;

//   // If we have a token, go to the tabs. If not, go to login.
//   if (isAuthenticated) {
//     return <Redirect href="/(tabs)" />;
//   } else {
//     return <Redirect href="/login" />;
//   }
// }

export default function Index() {
  const { isAuthenticated, isLoading } = useSelector((state) => state.auth);
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        router.replace("/(tabs)");
      } else {
        router.replace("/login");
      }
    }
  }, [isLoading, isAuthenticated]);

  return null; // Keep it clean while redirecting
}

// import { useSelector } from "react-redux";
// import HealthWorkerDashboard from "../components/HealthWorkerDashboard";
// import PregnantMotherDashboard from "../components/PregnantMotherDashboard";
// import LactatingMotherDashboard from "../components/LactatingMotherDashboard";

// export default function HomeScreen() {
//   const { user } = useSelector((state) => state.auth);

//   // Fallback while data is loading
//   if (!user) return null;

//   switch (user.role) {
//     case "health_worker":
//       return <HealthWorkerDashboard />;
//     case "pregnant_mother":
//       return <PregnantMotherDashboard />;
//     case "lactating_mother":
//       return <LactatingMotherDashboard />;
//     default:
//       return <Text>Unauthorized Role: {user.role}</Text>;
//   }
// }