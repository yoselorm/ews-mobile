import React, { useState } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, ScrollView, 
  ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Image 
} from 'react-native';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import { registerLactatingMother } from '../../store/slices/patientSlice';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';

const InputField = ({ label, placeholder, value, onChangeText, keyboardType = "default", required = false }) => (
  <View className="mb-4">
    <Text className="text-slate-500 text-[10px] font-bold uppercase mb-2 ml-1">
      {label} {required && <Text className="text-red-500">*</Text>}
    </Text>
    <TextInput
      placeholder={placeholder}
      value={value}
      onChangeText={onChangeText}
      keyboardType={keyboardType}
      className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-slate-800 font-medium focus:border-purple-500"
      placeholderTextColor="#cbd5e1"
    />
  </View>
);

export default function RegisterLactatingMother() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { actionLoading } = useSelector((state) => state.patients);

  const [formData, setFormData] = useState({
    first_name: '', last_name: '', dob: '', phone_number: '', email: '',
    gender: 'Female', language_id: '', community_id: '',
    baby_first_name: '', baby_last_name: '', baby_dob: '',
    birth_weight_kg: '', baby_gender: 'Female', mode_of_delivery: '',
    number_of_babies: '1', delivery_location: '', delivery_date: '',
    emergency_contact_name: '', emergency_contact_phone: '',
    photo: null 
  });

  const pickImage = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert("Permission Denied", "Camera access is required for the photo field.");
      return;
    }

    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      setFormData({ ...formData, photo: result.assets[0].uri });
    }
  };

  const handleSave = async () => {
    const required = ['first_name', 'last_name', 'dob', 'phone_number', 'baby_first_name', 'baby_last_name', 'baby_dob'];
    const missing = required.filter(key => !formData[key]);
    
    if (missing.length > 0) {
      Alert.alert("Required Fields", "Please complete all mandatory fields (*)");
      return;
    }

    try {
      // If your API expects multipart/form-data for the binary photo, 
      // your Redux Thunk should handle the conversion to FormData.
      await dispatch(registerLactatingMother(formData)).unwrap();
      Alert.alert("Success", "Mother and Baby enrolled successfully");
      router.back();
    } catch (err) {
      Alert.alert("Error", err || "Submission failed");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        className="flex-1"
      >
        {/* Header */}
        <View className="px-6 py-4 flex-row items-center border-b border-slate-50">
          <TouchableOpacity onPress={() => router.back()} className="p-2 bg-slate-50 rounded-full mr-4">
            <Ionicons name="close" size={20} color="#64748b" />
          </TouchableOpacity>
          <View>
            <Text className="text-lg font-bold text-slate-900">New Enrollment</Text>
            <Text className="text-slate-400 text-xs">Lactating Mother Record</Text>
          </View>
        </View>

        <ScrollView className="flex-1 px-6 pt-6" showsVerticalScrollIndicator={false}>
          
          {/* Section: Mother's Personal Info */}
          <View className="mb-6">
            <Text className="text-purple-600 font-bold text-xs mb-4">MOTHER'S DETAILS</Text>
            <View className="flex-row gap-4">
              <View className="flex-1">
                <InputField label="First Name" placeholder="Required" required value={formData.first_name} onChangeText={(t) => setFormData({...formData, first_name: t})} />
              </View>
              <View className="flex-1">
                <InputField label="Last Name" placeholder="Required" required value={formData.last_name} onChangeText={(t) => setFormData({...formData, last_name: t})} />
              </View>
            </View>
            <InputField label="Date of Birth" placeholder="YYYY-MM-DD" required value={formData.dob} onChangeText={(t) => setFormData({...formData, dob: t})} />
            <InputField label="Phone Number" placeholder="+233..." keyboardType="phone-pad" required value={formData.phone_number} onChangeText={(t) => setFormData({...formData, phone_number: t})} />
            <InputField label="Email Address" placeholder="Optional" keyboardType="email-address" value={formData.email} onChangeText={(t) => setFormData({...formData, email: t})} />
          </View>

          {/* Section: Baby's Details */}
          <View className="mb-6">
            <View className="h-[1px] bg-slate-100 mb-6" />
            <Text className="text-purple-600 font-bold text-xs mb-4">BABY'S DETAILS</Text>
            <View className="flex-row gap-4">
              <View className="flex-1">
                <InputField label="Baby First Name" placeholder="Required" required value={formData.baby_first_name} onChangeText={(t) => setFormData({...formData, baby_first_name: t})} />
              </View>
              <View className="flex-1">
                <InputField label="Baby Last Name" placeholder="Required" required value={formData.baby_last_name} onChangeText={(t) => setFormData({...formData, baby_last_name: t})} />
              </View>
            </View>
            <InputField label="Baby Date of Birth" placeholder="YYYY-MM-DD" required value={formData.baby_dob} onChangeText={(t) => setFormData({...formData, baby_dob: t})} />
            
            <View className="flex-row gap-4">
              <View className="flex-1">
                <InputField label="Weight (kg)" placeholder="0.0" keyboardType="numeric" value={formData.birth_weight_kg} onChangeText={(t) => setFormData({...formData, birth_weight_kg: t})} />
              </View>
              <View className="flex-1">
                <Text className="text-slate-500 text-[10px] font-bold uppercase mb-2 ml-1">Baby Gender</Text>
                <View className="flex-row bg-slate-50 border border-slate-100 rounded-2xl p-1">
                  {['Male', 'Female'].map((g) => (
                    <TouchableOpacity 
                      key={g}
                      onPress={() => setFormData({...formData, baby_gender: g})}
                      className={`flex-1 py-3 rounded-xl items-center ${formData.baby_gender === g ? 'bg-white shadow-sm' : ''}`}
                    >
                      <Text className={`text-xs font-bold ${formData.baby_gender === g ? 'text-purple-600' : 'text-slate-400'}`}>{g}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
          </View>

          {/* Section: Delivery Info */}
          <View className="mb-6">
            <View className="h-[1px] bg-slate-100 mb-6" />
            <Text className="text-purple-600 font-bold text-xs mb-4">DELIVERY INFORMATION</Text>
            <InputField label="Mode of Delivery" placeholder="e.g. Natural, C-Section" value={formData.mode_of_delivery} onChangeText={(t) => setFormData({...formData, mode_of_delivery: t})} />
            <InputField label="Number of Babies" placeholder="1" keyboardType="numeric" value={formData.number_of_babies} onChangeText={(t) => setFormData({...formData, number_of_babies: t})} />
            <InputField label="Delivery Location" placeholder="Hospital/Clinic name" value={formData.delivery_location} onChangeText={(t) => setFormData({...formData, delivery_location: t})} />
            <InputField label="Delivery Date" placeholder="YYYY-MM-DD" value={formData.delivery_date} onChangeText={(t) => setFormData({...formData, delivery_date: t})} />
          </View>

          {/* Section: Emergency Contact */}
          <View className="mb-6">
            <View className="h-[1px] bg-slate-100 mb-6" />
            <Text className="text-orange-600 font-bold text-xs mb-4">EMERGENCY CONTACT</Text>
            <InputField label="Contact Full Name" placeholder="Contact person" value={formData.emergency_contact_name} onChangeText={(t) => setFormData({...formData, emergency_contact_name: t})} />
            <InputField label="Contact Phone" placeholder="+233..." keyboardType="phone-pad" value={formData.emergency_contact_phone} onChangeText={(t) => setFormData({...formData, emergency_contact_phone: t})} />
          </View>

          {/* Photo Upload Section */}
          <TouchableOpacity 
            onPress={pickImage}
            className="border-2 border-dashed border-slate-200 rounded-[32px] p-6 items-center mb-10 bg-slate-50"
          >
            {formData.photo ? (
              <View className="items-center">
                <Image source={{ uri: formData.photo }} className="w-24 h-24 rounded-full mb-3 border-2 border-purple-100" />
                <View className="bg-purple-100 px-4 py-1 rounded-full">
                   <Text className="text-purple-600 font-bold text-[10px]">TAP TO CHANGE</Text>
                </View>
              </View>
            ) : (
              <>
                <View className="bg-white p-4 rounded-full mb-2 shadow-sm">
                  <MaterialCommunityIcons name="camera-plus-outline" size={28} color="#7c3aed" />
                </View>
                <Text className="text-slate-500 font-bold text-xs">Capture Mother & Baby</Text>
                <Text className="text-slate-400 text-[10px] mt-1">Official record photo required</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Action Buttons */}
          <View className="flex-row gap-4 mb-20">
            <TouchableOpacity onPress={() => router.back()} className="flex-1 py-4 bg-slate-50 border border-slate-100 rounded-2xl items-center">
              <Text className="text-slate-500 font-bold">Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={handleSave}
              disabled={actionLoading}
              className={`flex-1 py-4 rounded-2xl items-center flex-row justify-center ${actionLoading ? 'bg-purple-300' : 'bg-purple-700 shadow-lg shadow-purple-200'}`}
            >
              {actionLoading ? <ActivityIndicator color="white" /> : <Text className="text-white font-bold">Submit Record</Text>}
            </TouchableOpacity>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}