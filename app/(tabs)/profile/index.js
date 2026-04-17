import React, { useState } from 'react';
import { View, Text, Image, Pressable, ScrollView, Modal, Alert, ActivityIndicator } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'expo-router';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { logout } from '../../../store/slices/authSlice';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ProfileIndex() {
    const insets = useSafeAreaInsets();
    const { user } = useSelector((state) => state.auth);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const dispatch = useDispatch();
    const router = useRouter();
    const [logoutVisible, setLogoutVisible] = useState(false);


    // const handleLogout = async () => {
    //     setIsLoggingOut(true);

    //     try {
    //         await dispatch(logout()).unwrap();

    //         setIsLoggingOut(false);
    //         setLogoutVisible(false);
    //         router.replace("/login");
    //     } catch (error) {
    //         setIsLoggingOut(false);
    //         Alert.alert(
    //             "Logout Failed",
    //             "We couldn't reach the server. Please check your connection and try again."
    //         );
    //         console.error("Logout error:", error);
    //     }
    // };

    const handleLogout = async () => {
    setIsLoggingOut(true);

    try {
 
      await dispatch(logout()).unwrap();
      
      setLogoutVisible(false);
      setIsLoggingOut(false); 
      
    } catch (error) {
      setIsLoggingOut(false);
      Alert.alert("Logout Failed", "Please try again.");
    }
  };
    const MenuItem = ({ icon, title, onPress, isDestructive = false }) => (
        <Pressable
            onPress={onPress}
            className="flex-row items-center justify-between py-4 border-b border-gray-50"
        >
            <View className="flex-row items-center">
                <View className={`w-10 h-10 items-center justify-center rounded-lg ${isDestructive ? 'bg-red-50' : 'bg-gray-50'}`}>
                    {icon}
                </View>
                <Text className={`ml-4 text-base font-medium ${isDestructive ? 'text-red-500' : 'text-gray-800'}`}>
                    {title}
                </Text>
            </View>
            {!isDestructive && <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />}
        </Pressable>
    );

    return (
        <ScrollView className="flex-1 bg-gray-100">
            {/* Purple Curved Header */}
            <View className="bg-[#7C3AED] h-72 items-center justify-end pb-12 rounded-b-[180px]">
                <View className="absolute top-12 left-6">
                    <Text className="text-white text-xl font-bold">{user?.first_name || 'User'}</Text>
                    <Text className="text-purple-200 text-xs capitalize">{user?.role?.replace('_', ' ')}</Text>
                </View>


                {/* Profile Image with Fallback */}
                <View className="translate-y-24 border-4 border-white rounded-full shadow-lg">
                    <Image
                        source={user?.image_url ? { uri: user.image_url } : require('../../../assets/user-fallback.jpg')}
                        className="w-32 h-32 rounded-full bg-gray-300"
                    />
                </View>
            </View>

            {/* Content Card */}
            <View className="mt-20 mx-6 bg-white rounded-3xl p-6 shadow-sm">
                <Text className="text-lg font-bold mb-4 text-gray-900">Account and Settings</Text>

                <MenuItem
                    title="Personal Information"
                    icon={<Feather name="user" size={20} color="#7C3AED" />}
                    onPress={() => router.push("/profile/personalInfo")}
                />
                <MenuItem
                    title="Account Information"
                    icon={<Feather name="settings" size={20} color="#7C3AED" />}
                    onPress={() => router.push("/profile/account-info")}
                />
                <MenuItem
                    title="Log Out"
                    icon={<Feather name="log-out" size={20} color="#EF4444" />}
                    isDestructive={true}
                    onPress={() => setLogoutVisible(true)}
                />
                <MenuItem
                    title="Delete Account"
                    icon={<MaterialCommunityIcons name="delete-outline" size={22} color="#EF4444" />}
                    isDestructive={true}
                    onPress={() => router.push("/profile/deleteAccount")}
                />
            </View>

            {/* Logout Confirmation Modal */}
            <Modal visible={logoutVisible} transparent animationType="fade">
                <View className="flex-1 bg-black/50 justify-center items-center px-10">
                    <View className="bg-white p-6 rounded-2xl w-full items-center">

                        {isLoggingOut ? (
                            // SHOW LOADER
                            <View className="py-10 items-center">
                                <ActivityIndicator size="large" color="#7C3AED" />
                                <Text className="mt-4 text-gray-600 font-medium">Logging you out...</Text>
                            </View>
                        ) : (
                            // SHOW NORMAL CONTENT
                            <>
                                <Text className="text-xl font-bold mb-2">Logout</Text>
                                <Text className="text-gray-500 text-center mb-6">
                                    Are you sure you want to log out of your account?
                                </Text>

                                <View className="flex-row w-full space-x-3">
                                    <Pressable
                                        onPress={() => setLogoutVisible(false)}
                                        className="flex-1 bg-gray-100 py-3 rounded-xl items-center"
                                    >
                                        <Text className="font-semibold text-gray-700">Cancel</Text>
                                    </Pressable>

                                    <Pressable
                                        onPress={handleLogout}
                                        className="flex-1 bg-red-500 py-3 rounded-xl items-center"
                                    >
                                        <Text className="font-semibold text-white">Logout</Text>
                                    </Pressable>
                                </View>
                            </>
                        )}

                    </View>
                </View>
            </Modal>
        </ScrollView>
    );
}