import { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useAppDispatch } from "../../store/hooks";
import { saveAuthData, saveToken } from "../../store/slices/authSlice";
import api from "../../services/api";
import axios from "axios";
import { api_url } from "../../services/config";

export default function VerifyScreen() {
  const router = useRouter();
  const { phone } = useLocalSearchParams();
  const dispatch = useAppDispatch();
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  const inputs = useRef([]);

  useEffect(() => {
    if (resendTimer === 0) return;
    const interval = setInterval(() => {
      setResendTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleChange = (text, index) => {
    // 1. Detect if the user is pasting or auto-filling a full 6-digit code
    if (text.length > 1) {
      const pastedCode = text.slice(0, 6).split(""); // Take first 6 chars
      const newCode = [...pastedCode, ...Array(6 - pastedCode.length).fill("")].slice(0, 6);
      setCode(newCode);

      // Blur the last input or keep focus on the last digit
      inputs.current[5]?.focus();
      return;
    }

    // 2. Standard single-digit entry
    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);

    // Move to next box if text is entered
    if (text && index < 5) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === "Backspace" && !code[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const otp = code.join("");
    if (otp.length < 6) {
      Alert.alert("Invalid", "Please enter the full 6-digit code");
      return;
    }
    try {
      setLoading(true);
      const res = await axios.post(`${api_url}/login/verify`, { phone_number: phone, otp, type: 'mobile' });
      await dispatch(saveAuthData(res.data)).unwrap();
      router.replace("/");
    } catch (err) {
      console.log(err);
      Alert.alert("Error", err?.response?.data?.message || "Invalid code");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      setResendLoading(true);
      await axios.post(`${api_url}/login`, { phone_number: phone });
      setResendTimer(30);
      setCode(["", "", "", "", "", ""]);
      inputs.current[0]?.focus();
    } catch (err) {
      Alert.alert("Error", "Could not resend code");
    } finally{
      setResendLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-gray-50 px-6 pt-20 items-center">
      {/* Title */}
      <Text className="text-3xl font-bold text-gray-900 mb-2">
        Enter Code
      </Text>
      <Text className="text-sm text-gray-500 mb-10 text-center">
        We sent a 6-digit code to your phone
      </Text>

      {/* OTP Inputs */}
      <View className="flex-row gap-3 mb-10">
        {code.map((digit, index) => (
          <TextInput
            key={index}
            ref={(ref) => (inputs.current[index] = ref)}
            className={`w-12 h-14 border-2 rounded-xl text-xl font-semibold text-gray-900 bg-white text-center ${digit ? "border-purple-700" : "border-gray-200"
              }`}
            value={digit}
            // Remove .slice(-1) from here, handle it inside the function logic instead
            onChangeText={(text) => handleChange(text, index)}
            onKeyPress={(e) => handleKeyPress(e, index)}
            keyboardType="number-pad"
            maxLength={index === 0 ? 6 : 1} // Let the first box accept the full paste
            textContentType="oneTimeCode"   // iOS magic
            autoComplete="one-time-code"    // Android magic
          />
        ))}
      </View>

      {/* Verify Button */}
      <TouchableOpacity
        className={`bg-purple-700 rounded-2xl py-4 items-center w-full ${loading ? "opacity-60" : ""}`}
        onPress={handleVerify}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text className="text-white text-base font-semibold">Verify</Text>
        )}
      </TouchableOpacity>

      {/* Resend */}
      <View className="flex-row mt-6 items-center">
        <Text className="text-sm text-gray-500">Didn't receive code? </Text>
        {resendTimer > 0 ? (
          <Text className="text-sm text-gray-400">Resend in {resendTimer}s</Text>
        ) : (
          <TouchableOpacity disabled={resendLoading} onPress={handleResend}>
            <Text className="text-sm text-purple-700 font-semibold">
              Resend OTP
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}