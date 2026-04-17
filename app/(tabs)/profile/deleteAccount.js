import React, { useState } from 'react';
import { 
  View, Text, TouchableOpacity, ScrollView, 
  ActivityIndicator, Alert,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { deleteAccount } from '../../../store/slices/profileSlice';
import { logout } from '../../../store/slices/authSlice';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function DeleteAccountScreen() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { loading } = useSelector((state) => state.profile);
  const [confirmed, setConfirmed] = useState(false);

  const handleDelete = async () => {
    if (!confirmed) {
      Alert.alert("Wait!", "Please check the box to confirm you understand the consequences.");
      return;
    }

    Alert.alert(
      "Final Warning",
      "Are you absolutely sure? This action is permanent and cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete My Account", 
          style: "destructive", 
          onPress: async () => {
            try {
              // 1. Hit the backend delete endpoint
              await dispatch(deleteAccount()).unwrap();
              // 2. Clear local auth state (token, etc)
              dispatch(logout());
              // No need to navigate, AuthGate layout handles the redirect to /login
            } catch (err) {
              Alert.alert("Error", err || "Failed to delete account. Please contact support.");
            }
          }
        }
      ]
    );
  };

  const WarningItem = ({ icon, text }) => (
    <View className="flex-row items-start mb-6 px-2">
      <View className="bg-red-50 p-2 rounded-lg mr-4">
        <Feather name={icon} size={20} color="#EF4444" />
      </View>
      <Text className="flex-1 text-gray-600 leading-6 text-sm">
        {text}
      </Text>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      <Stack.Screen options={{ 
        headerTitle: "Delete Account",
        headerShadowVisible: false,
      }} />

      <ScrollView className="flex-1 px-6 pt-4">
        <View className="items-center mb-8">
          <View className="bg-red-100 w-20 h-20 rounded-full items-center justify-center mb-4">
            <MaterialCommunityIcons name="account-remove-outline" size={40} color="#EF4444" />
          </View>
          <Text className="text-2xl font-bold text-gray-900">We're sorry to see you go</Text>
          <Text className="text-gray-500 text-center mt-2 px-4">
            Before you delete your account, please read the following information carefully.
          </Text>
        </View>

        <View className="bg-gray-50 rounded-3xl p-6 mb-8">
          <Text className="text-gray-900 font-bold mb-6 text-lg">What happens now?</Text>
          
          <WarningItem 
            icon="trash-2" 
            text="All your personal data, including medical history and profile information, will be permanently removed from our servers." 
          />
          <WarningItem 
            icon="slashed-eye" 
            text="You will lose immediate access to your health records and any upcoming appointment reminders." 
          />
          <WarningItem 
            icon="alert-circle" 
            text="This action is irreversible. We cannot recover your data once the account is deleted." 
          />
        </View>

        {/* Petty Confirmation Box */}
        <TouchableOpacity 
          activeOpacity={0.8}
          onPress={() => setConfirmed(!confirmed)}
          className={`flex-row items-center p-4 rounded-2xl mb-10 border ${confirmed ? 'bg-red-50 border-red-200' : 'bg-white border-gray-200'}`}
        >
          <View className={`w-6 h-6 rounded-md border-2 items-center justify-center ${confirmed ? 'bg-red-500 border-red-500' : 'border-gray-300'}`}>
            {confirmed && <Feather name="check" size={16} color="white" />}
          </View>
          <Text className="ml-3 flex-1 text-gray-700 text-sm font-medium">
            I understand that my data will be deleted and this action cannot be undone.
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleDelete}
          disabled={loading}
          className={`py-4 rounded-2xl items-center mb-4 ${confirmed ? 'bg-red-500' : 'bg-red-200'}`}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-bold text-lg">Delete My Account</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={() => router.back()}
          className="items-center py-2 mb-10"
        >
          <Text className="text-gray-500 font-medium">I've changed my mind, keep my account</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}