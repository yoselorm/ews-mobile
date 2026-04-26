import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ScrollView, ActivityIndicator, Alert, KeyboardAvoidingView, Platform
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { fetchProfile, updateProfile } from '../../../store/slices/profileSlice';
import { Feather, Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';


const InfoField = ({ label, value, field, icon, keyboardType = 'default', placeholder, isEditing, onChange }) => (
  <View className="mb-5">
    <Text className="text-gray-400 text-xs font-bold mb-2 uppercase tracking-widest">{label}</Text>
    <View
      className={`flex-row items-center bg-white border ${
        isEditing ? 'border-purple-500' : 'border-gray-200'
      } rounded-xl px-4`}
      style={{ height: 52 }}  // ✅ FIX 2: fixed height on the container, not on TextInput
    >
      <Feather name={icon} size={18} color={isEditing ? '#7C3AED' : '#9CA3AF'} />
      <TextInput
        className="flex-1 ml-3 text-gray-900 text-base"
        value={value}
        editable={isEditing}
        onChangeText={(text) => onChange(field, text)}
        keyboardType={keyboardType}
        placeholder={placeholder}
        placeholderTextColor="#D1D5DB"
   
      />
    </View>
  </View>
);

export default function PersonalInfo() {
  const dispatch = useDispatch();
  const { user, loading } = useSelector((state) => state.profile);

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    dob: '',
    gender: '',
    // emergency_contact_name: '',
    // emergency_contact_phone: '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        phone_number: user.phone_number || '',
        dob: user.dob || '',
        gender: user.gender || '',
        // emergency_contact_name: user.profile?.emergency_contact_name || '',
        // emergency_contact_phone: user.profile?.emergency_contact_phone || '',
      });
    } else {
      dispatch(fetchProfile());
    }
  }, [user]);

  // ✅ Stable callback — doesn't cause InfoField to re-mount
  const handleFieldChange = (field, text) => {
    setFormData((prev) => ({ ...prev, [field]: text }));
  };

  const handleUpdate = async () => {
    try {
      const payload = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        phone_number: formData.phone_number,
        dob: formData.dob,
        gender: formData.gender,
        profile: {
          emergency_contact_name: formData.emergency_contact_name,
          emergency_contact_phone: formData.emergency_contact_phone,
        },
      };

      await dispatch(updateProfile(payload)).unwrap();
      setIsEditing(false);
      Alert.alert('Success', 'Information updated successfully!');
    } catch (error) {
      Alert.alert('Error', error || 'Something went wrong');
    }
  };

  if (loading && !user) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#7C3AED" />
        <Text className="mt-4 text-gray-500 font-medium">Fetching profile...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-white"
    >
      <Stack.Screen
        options={{
          headerTitle: 'My Details',
          headerRight: () => (
            <TouchableOpacity onPress={() => (isEditing ? handleUpdate() : setIsEditing(true))}>
              {loading ? (
                <ActivityIndicator size="small" color="#7C3AED" />
              ) : (
                <Text className="text-[#7C3AED] font-bold text-base mr-2">
                  {isEditing ? 'Save' : 'Edit'}
                </Text>
              )}
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView className="flex-1 px-6 pt-6" showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <Text className="text-xl font-extrabold text-gray-900 mb-6">Basic Info</Text>

        <View className="flex-row space-x-4">
          <View className="flex-1">
            <InfoField
              label="First Name"
              value={formData.first_name}
              field="first_name"
              icon="user"
              isEditing={isEditing}
              onChange={handleFieldChange}
            />
          </View>
          <View className="flex-1">
            <InfoField
              label="Last Name"
              value={formData.last_name}
              field="last_name"
              icon="user"
              isEditing={isEditing}
              onChange={handleFieldChange}
            />
          </View>
        </View>

        <InfoField
          label="Email"
          value={formData.email}
          field="email"
          icon="mail"
          keyboardType="email-address"
          isEditing={isEditing}
          onChange={handleFieldChange}
        />

        <InfoField
          label="Phone Number"
          value={formData.phone_number}
          field="phone_number"
          icon="phone"
          keyboardType="phone-pad"
          isEditing={isEditing}
          onChange={handleFieldChange}
        />

        {/* Gender Select Row */}
        <View className="mb-5">
          <Text className="text-gray-400 text-xs font-bold mb-2 uppercase tracking-widest">Gender</Text>
          <View className="flex-row space-x-3">
            {['male', 'female'].map((option) => (
              <TouchableOpacity
                key={option}
                disabled={!isEditing}
                onPress={() => setFormData((prev) => ({ ...prev, gender: option }))}
                className={`flex-1 flex-row items-center justify-center rounded-xl border ${
                  formData.gender === option
                    ? 'bg-purple-50 border-purple-500'
                    : 'bg-white border-gray-200'
                }`}
                style={{ height: 52 }}
              >
                <Ionicons
                  name={option === 'male' ? 'male' : 'female'}
                  size={18}
                  color={formData.gender === option ? '#7C3AED' : '#9CA3AF'}
                />
                <Text
                  className={`ml-2 capitalize font-semibold ${
                    formData.gender === option ? 'text-purple-700' : 'text-gray-500'
                  }`}
                >
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}