import React, { useState } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, ScrollView, 
 ActivityIndicator, Alert 
} from 'react-native';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import { createPregnantWoman } from '../../store/slices/userSlice';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function RegisterPregnantWoman() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { userActionLoading } = useSelector((state) => state.users);

  // Form State based on your backend and UX
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone_number: '',
    age: '',
    gestational_stage: '', 
    expected_delivery_date: '',
    emergency_contact: '',
    community_id: ''
  });

  const handleSave = async () => {
    // Basic validation
    if (!formData.first_name || !formData.phone_number) {
      Alert.alert("Missing Info", "Please provide at least the name and phone number.");
      return;
    }

    try {
      await dispatch(createPregnantWoman(formData)).unwrap();
      Alert.alert("Success", "Pregnant woman registered successfully");
      router.back();
    } catch (err) {
      Alert.alert("Registration Failed", err.message || "Something went wrong");
    }
  };

  const InputField = ({ label, placeholder, value, onChangeText, keyboardType = "default", icon }) => (
    <View className="mb-5">
      <Text className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-2 ml-1">{label}</Text>
      <View className="relative">
        {icon && (
          <View className="absolute left-4 top-4 z-10">
            {icon}
          </View>
        )}
        <TextInput
          placeholder={placeholder}
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          className={`bg-slate-50 border border-slate-100 rounded-2xl p-4 text-slate-800 font-medium focus:border-purple-500 ${icon ? 'pl-12' : ''}`}
          placeholderTextColor="#94a3b8"
        />
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="px-6 py-4 flex-row items-center justify-between border-b border-slate-50">
        <TouchableOpacity onPress={() => router.back()} className="p-2 bg-slate-50 rounded-full">
          <Ionicons name="arrow-back" size={20} color="#1e293b" />
        </TouchableOpacity>
        <View className="items-center">
            <Text className="text-lg font-bold text-slate-900">Register Pregnant Woman</Text>
        </View>
        <View className="w-10" /> {/* Spacer for centering */}
      </View>

      <ScrollView className="flex-1 px-6 pt-6" showsVerticalScrollIndicator={false}>
        
        {/* Profile Icon Header */}
        <View className="items-center mb-6">
            <View className="bg-purple-100 p-4 rounded-full">
                <MaterialCommunityIcons name="baby-face-outline" size={32} color="#7c3aed" />
            </View>
        </View>

        <InputField 
          label="Full Name" 
          placeholder="Enter full name" 
          value={formData.first_name} 
          onChangeText={(t) => setFormData({...formData, first_name: t})} 
        />

        <InputField 
          label="Phone Number" 
          placeholder="+233 xx xxx xxxx" 
          keyboardType="phone-pad"
          value={formData.phone_number} 
          onChangeText={(t) => setFormData({...formData, phone_number: t})} 
        />

        <View className="flex-row gap-4">
          <View className="flex-1">
            <InputField 
                label="Age" 
                placeholder="25" 
                keyboardType="numeric"
                value={formData.age}
                onChangeText={(t) => setFormData({...formData, age: t})}
            />
          </View>
          <View className="flex-1">
            <InputField 
                label="Gestational Stage" 
                placeholder="eg. 2nd Trimester" 
                value={formData.gestational_stage}
                onChangeText={(t) => setFormData({...formData, gestational_stage: t})}
            />
          </View>
        </View>

        <InputField 
          label="Expected Delivery Date" 
          placeholder="dd/mm/yyyy" 
          value={formData.expected_delivery_date}
          onChangeText={(t) => setFormData({...formData, expected_delivery_date: t})}
          icon={<Feather name="calendar" size={18} color="#94a3b8" />}
        />

        <InputField 
          label="Emergency Contact" 
          placeholder="+233 xx xxx xxxx" 
          keyboardType="phone-pad"
          value={formData.emergency_contact}
          onChangeText={(t) => setFormData({...formData, emergency_contact: t})}
        />

        {/* Location Select (Trigger for Geography logic) */}
        <View className="mb-6">
          <Text className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-2 ml-1">Location</Text>
          <TouchableOpacity className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex-row justify-between items-center">
            <Text className="text-slate-400 font-medium">Select District/Community</Text>
            <Feather name="map-pin" size={18} color="#94a3b8" />
          </TouchableOpacity>
        </View>

        {/* Photo Upload Placeholder */}
        <TouchableOpacity className="border-2 border-dashed border-slate-200 rounded-[32px] p-10 items-center mb-8 bg-slate-50/50">
            <Ionicons name="camera" size={32} color="#94a3b8" />
            <Text className="text-slate-400 font-bold mt-2">Take Picture of Pregnant Woman</Text>
        </TouchableOpacity>

        {/* Action Buttons */}
        <View className="flex-row gap-4 mb-12">
          <TouchableOpacity 
            onPress={() => router.back()}
            className="flex-1 py-4 bg-slate-100 rounded-2xl items-center"
          >
            <Text className="text-slate-600 font-bold">Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={handleSave}
            disabled={userActionLoading}
            className={`flex-1 py-4 rounded-2xl items-center flex-row justify-center ${userActionLoading ? 'bg-purple-400' : 'bg-purple-600'}`}
          >
            {userActionLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-bold">Save</Text>
            )}
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}