import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard
} from "react-native";
import { useRouter } from "expo-router";
import { useAppDispatch } from "../../store/hooks";
import { clearError } from "../../store/slices/authSlice";
import api from "../../services/api";
import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { api_url } from "../../services/config";

export default function LoginScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    if (!phone || phone.length < 10) {
      Alert.alert("Invalid", "Please enter a valid phone number");
      return;
    }
    try {
      setLoading(true);
      dispatch(clearError());
      await axios.post(`${api_url}/login`, { phone_number: phone });
      router.push({ pathname: "/login/verify", params: { phone } });
    } catch (err) {
      Alert.alert("Error", err?.response?.data?.message || "Something went wrong");
      console.log(err)
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-gray-50"
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View className="flex-1 px-6 pt-16">
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ flexGrow: 1 }}
          >
            {/* Back Button */}


            <View className="items-center mt-12 mb-6">
              {/* Tilted Purple Icon Container */}
              <View
                style={{ transform: [{ rotate: '-15deg' }] }}
                className="bg-[#7C3AED] w-24 h-24 rounded-[28px] items-center justify-center mb-8 shadow-lg shadow-purple-200"
              >
                <Ionicons name="call-outline" size={48} color="white" />
              </View>

              {/* Centered Title */}
              <Text className="text-4xl font-black text-center text-gray-900 leading-[44px]">
                Enter your phone{"\n"}number
              </Text>

              {/* Info Message / Subtitle */}
              <Text className="text-gray-500 text-center mt-3 text-base font-medium px-4">
                Log in to your account to continue and manage your healthcare tasks.
              </Text>
            </View>

            <View className="mb-4">
              <View className="flex-row items-center gap-2 mb-2">
                <Ionicons name="call-outline" size={16} color="#374151" />
                <Text className="text-sm text-gray-700 font-medium">Phone Number</Text>
              </View>
              <TextInput
                className="bg-white border border-gray-200 rounded-xl px-4 py-4 text-base text-gray-900"
                placeholder="024XXXXXXXX"
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
              />
            </View>

            {/* Use a spacer to push the button down instead of absolute positioning */}
            <View className="flex-1" />

            {/* Continue Button */}
            <TouchableOpacity
              className={`bg-purple-700 rounded-2xl py-4 items-center ${loading ? "opacity-60" : ""}`}
              onPress={handleContinue}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-white text-base font-semibold">Continue</Text>
              )}
            </TouchableOpacity>

            {/* Consent text */}
            <Text className="text-center text-xs text-gray-400 mt-4 mb-12 px-2 leading-5">
              By continuing, you agree to our{" "}
              <Text
                className="text-purple-600 font-semibold"
                onPress={() => router.push('/legal/termsConditions')}
              >
                Terms & Conditions
              </Text>
              {" "}and{" "}
              <Text
                className="text-purple-600 font-semibold"
                onPress={() => router.push('/legal/privacyPolicy')}
              >
                Privacy Policy
              </Text>
              .
            </Text>
          </ScrollView>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}