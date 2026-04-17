import React, { useState } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, ScrollView, 
ActivityIndicator, Alert 
} from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import { createLactatingMother } from '../../store/slices/userSlice';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function RegisterLactatingMother() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { userActionLoading } = useSelector((state) => state.users);

  // Form State
  const [formData, setFormData] = useState({
    first_name: '', last_name: '', phone_number: '', age: '',
    baby_name: '', baby_dob: '', birth_weight: '', gender: 'Female',
    mode_of_delivery: '', num_babies: '1', location_of_delivery: '',
    delivery_date: '', emergency_contact: '', community_id: ''
  });

  const handleSave = async () => {
    try {
      await dispatch(createLactatingMother(formData)).unwrap();
      Alert.alert("Success", "Lactating Mother registered successfully");
      router.back();
    } catch (err) {
      Alert.alert("Error", err.message || "Failed to register mother");
    }
  };

  const InputField = ({ label, placeholder, value, onChangeText, keyboardType = "default" }) => (
    <View className="mb-4">
      <Text className="text-slate-500 text-xs font-bold uppercase mb-2 ml-1">{label}</Text>
      <TextInput
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-slate-800 font-medium focus:border-purple-500"
        placeholderTextColor="#94a3b8"
      />
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="px-6 py-4 flex-row items-center border-b border-slate-50">
        <TouchableOpacity onPress={() => router.back()} className="p-2 bg-slate-100 rounded-full mr-4">
          <Ionicons name="chevron-back" size={20} color="#1e293b" />
        </TouchableOpacity>
        <View>
          <View className="flex-row items-center">
             <Feather name="user-plus" size={18} color="#7c3aed" />
             <Text className="text-xl font-bold text-slate-900 ml-2">Register Mother</Text>
          </View>
          <Text className="text-slate-400 text-xs">Lactating Mother Profile</Text>
        </View>
      </View>

      <ScrollView className="flex-1 px-6 pt-6" showsVerticalScrollIndicator={false}>
        
        <InputField 
          label="Full Name" placeholder="Enter mother's full name" 
          value={formData.first_name} onChangeText={(t) => setFormData({...formData, first_name: t})} 
        />

        <InputField 
          label="Phone Number" placeholder="+233 xx xxx xxxx" keyboardType="phone-pad"
          value={formData.phone_number} onChangeText={(t) => setFormData({...formData, phone_number: t})} 
        />

        <View className="flex-row gap-4">
          <View className="flex-1">
            <InputField label="Mother's Age" placeholder="28" keyboardType="numeric" />
          </View>
          <View className="flex-1">
            <InputField label="No. of Babies" placeholder="1" keyboardType="numeric" />
          </View>
        </View>

        <View className="h-[1px] bg-slate-100 my-4" />
        <Text className="text-purple-600 font-bold mb-4">Baby's Details</Text>

        <InputField label="Baby's Full Name" placeholder="Enter baby's name" />
        
        <View className="flex-row gap-4">
            <View className="flex-1">
                <InputField label="Birth Weight (kg)" placeholder="3.5" keyboardType="numeric" />
            </View>
            <View className="flex-1">
                <Text className="text-slate-500 text-xs font-bold uppercase mb-2 ml-1">Gender</Text>
                <View className="flex-row bg-slate-50 border border-slate-100 rounded-2xl p-1">
                    {['Male', 'Female'].map((g) => (
                        <TouchableOpacity 
                            key={g}
                            onPress={() => setFormData({...formData, gender: g})}
                            className={`flex-1 py-3 rounded-xl items-center ${formData.gender === g ? 'bg-white shadow-sm' : ''}`}
                        >
                            <Text className={`text-xs font-bold ${formData.gender === g ? 'text-purple-600' : 'text-slate-400'}`}>{g}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
        </View>

        <InputField label="Location of Delivery" placeholder="e.g. Korle Bu Teaching Hospital" />

        {/* Location Section */}
        <View className="mb-4">
            <Text className="text-slate-500 text-xs font-bold uppercase mb-2 ml-1">Community (Location)</Text>
            <TouchableOpacity className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex-row justify-between items-center">
                <Text className="text-slate-400">Select Community...</Text>
                <Feather name="map-pin" size={18} color="#94a3b8" />
            </TouchableOpacity>
        </View>

        {/* Picture Action */}
        <TouchableOpacity className="border-2 border-dashed border-slate-200 rounded-[32px] p-8 items-center mb-8">
            <Ionicons name="camera-outline" size={32} color="#94a3b8" />
            <Text className="text-slate-400 font-bold mt-2">Take Picture of Mother & Baby</Text>
        </TouchableOpacity>

        {/* Buttons */}
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
              <ActivityIndicator color="white" className="mr-2" />
            ) : (
              <Text className="text-white font-bold">Save Record</Text>
            )}
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}