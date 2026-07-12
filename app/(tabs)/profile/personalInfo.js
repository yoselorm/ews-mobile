import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ScrollView, ActivityIndicator, Alert, KeyboardAvoidingView, Platform,
  Modal, FlatList, Keyboard, TouchableWithoutFeedback
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { fetchProfile, updateProfile } from '../../../store/slices/profileSlice';
import { fetchCommunities, fetchLanguages } from '../../../store/slices/communitySlice';
import { Feather, Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';

// ─── Reusable field components ─────────────────────────────────────────────

const SectionHeader = ({ title, subtitle }) => (
  <View className="mb-4 mt-2">
    <Text className="text-lg font-extrabold text-gray-900">{title}</Text>
    {subtitle ? <Text className="text-gray-400 text-xs mt-0.5">{subtitle}</Text> : null}
  </View>
);

const InfoField = ({ label, value, field, icon, keyboardType = 'default', placeholder, isEditing, onChange }) => (
  <View className="mb-4">
    <Text className="text-gray-400 text-xs font-bold mb-2 uppercase tracking-widest">{label}</Text>
    <View
      className={`flex-row items-center bg-white border ${
        isEditing ? 'border-purple-500' : 'border-gray-200'
      } rounded-xl px-4`}
      style={{ height: 52 }}
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

// Tappable field that opens a picker modal — never focuses a keyboard
const SelectField = ({ label, value, icon, isEditing, onPress, placeholder = 'Not set' }) => (
  <View className="mb-4">
    <Text className="text-gray-400 text-xs font-bold mb-2 uppercase tracking-widest">{label}</Text>
    <TouchableOpacity
      disabled={!isEditing}
      activeOpacity={0.7}
      onPress={() => {
        Keyboard.dismiss();
        onPress();
      }}
      className={`flex-row items-center bg-white border ${
        isEditing ? 'border-purple-500' : 'border-gray-200'
      } rounded-xl px-4`}
      style={{ height: 52 }}
    >
      <Feather name={icon} size={18} color={isEditing ? '#7C3AED' : '#9CA3AF'} />
      <Text
        className={`flex-1 ml-3 text-base ${value ? 'text-gray-900' : 'text-gray-300'}`}
        numberOfLines={1}
      >
        {value || placeholder}
      </Text>
      {isEditing && <Feather name="chevron-down" size={18} color="#9CA3AF" />}
    </TouchableOpacity>
  </View>
);

// Searchable picker modal — no autoFocus, so the keyboard stays down until
// the person deliberately taps the search bar themselves.
const PickerModal = ({ visible, title, data, loading, selectedId, onClose, onSelect }) => {
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!visible) setSearch('');
  }, [visible]);

  const filtered = data.filter((item) =>
    (item.name || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View className="flex-1 bg-black/40 justify-end">
          <TouchableWithoutFeedback>
            <View className="bg-white rounded-t-3xl" style={{ maxHeight: '75%' }}>
              <View className="items-center pt-3">
                <View className="w-10 h-1.5 bg-gray-200 rounded-full" />
              </View>

              <View className="flex-row items-center justify-between px-6 pt-4 pb-3">
                <Text className="text-lg font-extrabold text-gray-900">{title}</Text>
                <TouchableOpacity onPress={onClose} hitSlop={10}>
                  <Ionicons name="close" size={24} color="#9CA3AF" />
                </TouchableOpacity>
              </View>

              <View className="px-6 pb-3">
                <View
                  className="flex-row items-center bg-gray-100 rounded-xl px-4"
                  style={{ height: 44 }}
                >
                  <Feather name="search" size={16} color="#9CA3AF" />
                  <TextInput
                    className="flex-1 ml-2 text-gray-900 text-base"
                    placeholder={`Search ${title.toLowerCase()}...`}
                    placeholderTextColor="#9CA3AF"
                    value={search}
                    onChangeText={setSearch}
                  />
                  {search.length > 0 && (
                    <TouchableOpacity onPress={() => setSearch('')} hitSlop={10}>
                      <Ionicons name="close-circle" size={18} color="#D1D5DB" />
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              {loading ? (
                <View className="py-10 items-center">
                  <ActivityIndicator color="#7C3AED" />
                </View>
              ) : (
                <FlatList
                  data={filtered}
                  keyExtractor={(item) => String(item.id)}
                  keyboardShouldPersistTaps="handled"
                  contentContainerStyle={{ paddingBottom: 24 }}
                  ListEmptyComponent={
                    <View className="items-center py-10">
                      <Feather name="search" size={28} color="#E5E7EB" />
                      <Text className="text-center text-gray-400 mt-2">No results found</Text>
                    </View>
                  }
                  renderItem={({ item }) => {
                    const isSelected = String(item.id) === String(selectedId);
                    return (
                      <TouchableOpacity
                        className="flex-row items-center justify-between px-6 py-4 border-b border-gray-50"
                        onPress={() => {
                          onSelect(item);
                          onClose();
                        }}
                      >
                        <Text className={`text-base ${isSelected ? 'text-purple-700 font-bold' : 'text-gray-800'}`}>
                          {item.name}
                        </Text>
                        {isSelected && <Feather name="check" size={18} color="#7C3AED" />}
                      </TouchableOpacity>
                    );
                  }}
                />
              )}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default function PersonalInfo() {
  const dispatch = useDispatch();
  const { user, loading } = useSelector((state) => state.profile);
  const { communities, languages, loading: communityLoading } = useSelector((state) => state.communities);

  const [isEditing, setIsEditing] = useState(false);
  const [communityModalVisible, setCommunityModalVisible] = useState(false);
  const [languageModalVisible, setLanguageModalVisible] = useState(false);

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    dob: '',
    gender: '',
  });

  const [selectedCommunity, setSelectedCommunity] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState(null);

  // Load the user's own editable field values
  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        phone_number: user.phone_number || '',
        dob: user.dob || '',
        gender: user.gender || '',
      });
    } else {
      dispatch(fetchProfile());
    }
  }, [user]);

  // Fetch the reference lists once, only if not already cached in the store
  useEffect(() => {
    if (!communities.length) dispatch(fetchCommunities());
    if (!languages.length) dispatch(fetchLanguages());
  }, []);

  // The API returns flat community_id / language_id strings, not nested
  // objects — resolve them against the fetched lists. Runs whenever either
  // the user or the lists change, so it self-corrects if the lists arrive
  // after the profile does.
  useEffect(() => {
    if (user?.community_id && communities.length) {
      const match = communities.find((c) => String(c.id) === String(user.community_id));
      setSelectedCommunity(match || null);
    }
  }, [user?.community_id, communities]);

  useEffect(() => {
    if (user?.language_id && languages.length) {
      const match = languages.find((l) => String(l.id) === String(user.language_id));
      setSelectedLanguage(match || null);
    }
  }, [user?.language_id, languages]);

  const handleFieldChange = (field, text) => {
    setFormData((prev) => ({ ...prev, [field]: text }));
  };

  const handleUpdate = async () => {
    Keyboard.dismiss();
    try {
      const payload = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        phone_number: formData.phone_number,
        dob: formData.dob,
        gender: formData.gender,
        community_id: selectedCommunity?.id ?? null,
        language_id: selectedLanguage?.id ?? null,
      };

      await dispatch(updateProfile(payload)).unwrap();
      setIsEditing(false);
      Alert.alert('Success', 'Information updated successfully!');
    } catch (error) {
      Alert.alert('Error', error || 'Something went wrong');
    }
  };

  const handleCancelEdit = () => {
    if (user) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        phone_number: user.phone_number || '',
        dob: user.dob || '',
        gender: user.gender || '',
      });
      const communityMatch = communities.find((c) => String(c.id) === String(user.community_id));
      const languageMatch = languages.find((l) => String(l.id) === String(user.language_id));
      setSelectedCommunity(communityMatch || null);
      setSelectedLanguage(languageMatch || null);
    }
    setIsEditing(false);
    Keyboard.dismiss();
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
      className="flex-1 bg-gray-50"
    >
      <Stack.Screen
        options={{
          headerTitle: 'My Details',
          headerLeft: () =>
            isEditing ? (
              <TouchableOpacity onPress={handleCancelEdit} className="ml-2">
                <Text className="text-gray-400 font-medium text-base">Cancel</Text>
              </TouchableOpacity>
            ) : null,
          headerRight: () => (
            <TouchableOpacity onPress={() => (isEditing ? handleUpdate() : setIsEditing(true))} className="mr-2">
              {loading ? (
                <ActivityIndicator size="small" color="#7C3AED" />
              ) : (
                <Text className="text-[#7C3AED] font-bold text-base">
                  {isEditing ? 'Save' : 'Edit'}
                </Text>
              )}
            </TouchableOpacity>
          ),
        }}
      />

      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          className="flex-1 px-6 pt-6"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {isEditing ?(
            <View className="bg-purple-50 rounded-xl px-4 py-3 mb-5 flex-row items-center">
              <Feather name="edit-3" size={14} color="#7C3AED" />
              <Text className="text-purple-700 text-xs font-semibold ml-2">
                You're editing — tap Save when you're done
              </Text>
            </View>
          ) :   <View className="bg-amber-50 rounded-xl px-4 py-3 mb-5 flex-row items-center">
              <Feather name="edit-3" size={14} color="#7C3AED" />
              <Text className="text-amber-700 text-xs font-semibold ml-2">
                To edit your information, tap the Edit button above
              </Text>
            </View>}

          {/* ── Basic Info ── */}
          <SectionHeader title="Basic Info" />

          <View className="bg-white rounded-2xl p-5 shadow-sm mb-6">
            <View className="flex-row" style={{ gap: 12 }}>
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

            {/* Gender */}
            <View>
              <Text className="text-gray-400 text-xs font-bold mb-2 uppercase tracking-widest">Gender</Text>
              <View className="flex-row" style={{ gap: 12 }}>
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
          </View>

          {/* ── Location & Language ── */}
          <SectionHeader title="Location & Language" subtitle="Helps us connect you with the right resources" />

          <View className="bg-white rounded-2xl p-5 shadow-sm mb-10">
            <SelectField
              label="Community"
              icon="map-pin"
              value={selectedCommunity?.name}
              isEditing={isEditing}
              onPress={() => setCommunityModalVisible(true)}
            />

            <SelectField
              label="Language"
              icon="globe"
              value={selectedLanguage?.name}
              isEditing={isEditing}
              onPress={() => setLanguageModalVisible(true)}
            />
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>

      <PickerModal
        visible={communityModalVisible}
        title="Community"
        data={communities}
        loading={communityLoading && !communities.length}
        selectedId={selectedCommunity?.id}
        onClose={() => setCommunityModalVisible(false)}
        onSelect={setSelectedCommunity}
      />

      <PickerModal
        visible={languageModalVisible}
        title="Language"
        data={languages}
        loading={communityLoading && !languages.length}
        selectedId={selectedLanguage?.id}
        onClose={() => setLanguageModalVisible(false)}
        onSelect={setSelectedLanguage}
      />
    </KeyboardAvoidingView>
  );
}