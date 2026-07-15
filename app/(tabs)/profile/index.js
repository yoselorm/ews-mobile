import React, { useEffect, useState } from 'react';
import {
  View, Text, Image, Pressable, ScrollView,
  Modal, ActivityIndicator, TouchableOpacity, Linking, Platform
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'expo-router';
import { Ionicons, Feather, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { logout } from '../../../store/slices/authSlice';
import { fetchProfile, removePushToken, uploadAvatar } from '../../../store/slices/profileSlice';

// ─── Helpers ───────────────────────────────────────────────────────────────────
const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  try {
    return new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch { return dateStr; }
};

const getRoleBadge = (role) => {
  switch (role) {
    case 'pregnant_woman':    return { label: 'Pregnant Woman',    bg: '#FEF2F2', text: '#DC2626' };
    case 'lactating_mother':  return { label: 'Lactating Mother',  bg: '#EFF6FF', text: '#2563EB' };
    case 'health_worker':     return { label: 'Health Worker',     bg: '#F0FDF4', text: '#059669' };
    case 'assembly_official': return { label: 'Assembly Official', bg: '#FFFBEB', text: '#D97706' };
    default:                  return { label: role?.replace(/_/g, ' ') || 'Member', bg: '#F5F3FF', text: '#7C3AED' };
  }
};

// ─── Reusable components ───────────────────────────────────────────────────────
const InfoRow = ({ label, value, onPress }) => (
  <View className="flex-row justify-between items-start py-3 border-b border-slate-50">
    <Text className="text-slate-400 text-xs font-bold uppercase tracking-wider flex-1">{label}</Text>
    {onPress ? (
      <TouchableOpacity onPress={onPress} className="flex-row items-center" style={{ gap: 4 }}>
        <Text className="text-purple-600 text-sm font-bold">{value || '—'}</Text>
        <Feather name="phone-call" size={13} color="#7C3AED" />
      </TouchableOpacity>
    ) : (
      <Text className="text-slate-700 text-sm font-bold flex-1 text-right ml-4" numberOfLines={2}>{value || '—'}</Text>
    )}
  </View>
);

const SectionCard = ({ title, icon, children }) => (
  <View className="mx-6 bg-white rounded-3xl p-6 shadow-sm mb-4">
    <View className="flex-row items-center mb-4" style={{ gap: 8 }}>
      {icon}
      <Text className="text-base font-bold text-slate-900">{title}</Text>
    </View>
    {children}
  </View>
);

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

// ─── Role-specific profile section ────────────────────────────────────────────
const ProfileSection = ({ role, profile }) => {
  if (!profile) return null;

  switch (role) {
    case 'pregnant_woman':
      return (
        <SectionCard title="Pregnancy Details" icon={<MaterialCommunityIcons name="baby-face-outline" size={20} color="#DC2626" />}>
          <InfoRow label="Gestational Age"    value={profile.gestational_age_weeks ? `${profile.gestational_age_weeks} weeks` : null} />
          <InfoRow label="Expected Delivery"  value={formatDate(profile.expected_delivery_date)} />
          <InfoRow label="Gravida"            value={String(profile.gravida ?? '—')} />
          <InfoRow label="Parity"             value={String(profile.parity ?? '—')} />
          <InfoRow label="Blood Group"        value={profile.blood_group} />
          <InfoRow label="ANC Facility"       value={profile.anc_facility} />
          {profile.medical_conditions && (
            <InfoRow label="Medical Conditions" value={
              typeof profile.medical_conditions === 'string'
                ? profile.medical_conditions.replace(/[\[\]']/g, '')
                : profile.medical_conditions.join(', ')
            } />
          )}
          {(profile.emergency_contact_name || profile.emergency_contact_phone) && (
            <View className="mt-2">
              <Text className="text-[10px] font-black text-orange-500 uppercase tracking-[2px] mb-2">Emergency Contact</Text>
              <InfoRow label="Name"  value={profile.emergency_contact_name} />
              <InfoRow label="Phone" value={profile.emergency_contact_phone} onPress={() => Linking.openURL(`tel:${profile.emergency_contact_phone}`)} />
            </View>
          )}
          {profile.health_worker && (
            <View className="mt-2">
              <Text className="text-[10px] font-black text-purple-600 uppercase tracking-[2px] mb-2">Assigned Health Worker</Text>
              <InfoRow label="Name"          value={profile.health_worker.name} />
              <InfoRow label="Facility"      value={`${profile.health_worker.facility_name} (${profile.health_worker.facility_type})`} />
              <InfoRow label="Qualification" value={profile.health_worker.qualification} />
              <InfoRow label="Phone"         value={profile.health_worker.phone_number} onPress={() => Linking.openURL(`tel:${profile.health_worker.phone_number}`)} />
            </View>
          )}
        </SectionCard>
      );

    case 'lactating_mother':
      return (
        <SectionCard title="Baby Details" icon={<MaterialCommunityIcons name="baby-carriage" size={20} color="#2563EB" />}>
          <InfoRow label="Baby Name"         value={`${profile.baby_first_name || ''} ${profile.baby_last_name || ''}`.trim()} />
          <InfoRow label="Baby DOB"          value={formatDate(profile.baby_dob)} />
          <InfoRow label="Baby Gender"       value={profile.baby_gender} />
          <InfoRow label="Birth Weight"      value={profile.birth_weight_kg ? `${profile.birth_weight_kg} kg` : null} />
          <InfoRow label="Mode of Delivery"  value={profile.mode_of_delivery} />
          <InfoRow label="No. of Babies"     value={String(profile.number_of_babies ?? '—')} />
          <InfoRow label="Delivery Location" value={profile.delivery_location} />
          <InfoRow label="Delivery Date"     value={formatDate(profile.delivery_date)} />
          {(profile.emergency_contact_name || profile.emergency_contact_phone) && (
            <View className="mt-2">
              <Text className="text-[10px] font-black text-orange-500 uppercase tracking-[2px] mb-2">Emergency Contact</Text>
              <InfoRow label="Name"  value={profile.emergency_contact_name} />
              <InfoRow label="Phone" value={profile.emergency_contact_phone} onPress={() => Linking.openURL(`tel:${profile.emergency_contact_phone}`)} />
            </View>
          )}
          {profile.health_worker && (
            <View className="mt-2">
              <Text className="text-[10px] font-black text-purple-600 uppercase tracking-[2px] mb-2">Assigned Health Worker</Text>
              <InfoRow label="Name"          value={profile.health_worker.name} />
              <InfoRow label="Facility"      value={`${profile.health_worker.facility_name} (${profile.health_worker.facility_type})`} />
              <InfoRow label="Qualification" value={profile.health_worker.qualification} />
              <InfoRow label="Phone"         value={profile.health_worker.phone_number} onPress={() => Linking.openURL(`tel:${profile.health_worker.phone_number}`)} />
            </View>
          )}
        </SectionCard>
      );

    case 'health_worker':
      return (
        <SectionCard title="Work Details" icon={<FontAwesome5 name="user-nurse" size={16} color="#059669" />}>
          <InfoRow label="Staff ID"      value={profile.staff_id} />
          <InfoRow label="Facility"      value={profile.facility_name} />
          <InfoRow label="Facility Type" value={profile.facility_type} />
          <InfoRow label="Qualification" value={profile.qualification} />
          <InfoRow label="Experience"    value={profile.years_of_experience ? `${profile.years_of_experience} years` : null} />
        </SectionCard>
      );

    case 'assembly_official':
      return (
        <SectionCard title="Official Details" icon={<MaterialCommunityIcons name="bank-outline" size={20} color="#D97706" />}>
          <InfoRow label="Title"        value={profile.title} />
          <InfoRow label="Jurisdiction" value={profile.jurisdiction} />
        </SectionCard>
      );

    default: return null;
  }
};

// ══════════════════════════════════════════════════════════════════════════════
export default function ProfileIndex() {
  const dispatch = useDispatch();
  const router   = useRouter();

  const { user: authUser }                          = useSelector((s) => s.auth);
  const { user: profileUser, loading, uploadingAvatar } = useSelector((s) => s.profile);

  const [logoutVisible, setLogoutVisible] = useState(false);
  const [isLoggingOut,  setIsLoggingOut]  = useState(false);

  const user      = profileUser || authUser;
  const roleBadge = getRoleBadge(user?.role);

  useEffect(() => { dispatch(fetchProfile()); }, []);

  // ── Avatar upload ──────────────────────────────────────────────────────────
  const handleAvatarPress = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      const { status: camStatus } = await ImagePicker.requestCameraPermissionsAsync();
      if (camStatus !== 'granted') return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled && result.assets?.[0]) {
      const asset = result.assets[0];
      const formData = new FormData();
      formData.append('avatar', {
        uri:  Platform.OS === 'android' ? asset.uri : asset.uri.replace('file://', ''),
        type: asset.mimeType || 'image/jpeg',
        name: asset.fileName || `avatar_${Date.now()}.jpg`,
      });
      dispatch(uploadAvatar(formData));
    }
  };

  // ── Logout ─────────────────────────────────────────────────────────────────
const handleLogout = async () => {
  setIsLoggingOut(true);
  try {
    await dispatch(logout()).unwrap();
    setLogoutVisible(false);
  } catch {
    // logout thunk always clears local SecureStore in its own `finally`,
    // even if the server call fails — so state is still safe to close out
    setLogoutVisible(false);
  } finally {
    setIsLoggingOut(false);
  }
};

  if (loading && !user) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#7C3AED" />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-gray-100" showsVerticalScrollIndicator={false}>

      {/* ── Purple Header ── */}
      <View className="bg-[#7C3AED] h-72 items-center justify-end pb-12 rounded-b-[180px]">
        <View className="absolute top-14 left-6">
          <Text className="text-white text-xl font-bold">{user?.first_name} {user?.last_name}</Text>
          <View style={{ backgroundColor: roleBadge.bg }} className="px-3 py-0.5 rounded-full mt-1 self-start">
            <Text style={{ color: roleBadge.text }} className="text-[10px] font-black uppercase tracking-wider">
              {roleBadge.label}
            </Text>
          </View>
        </View>

        {/* ── Avatar with edit button ── */}
        <View className="translate-y-24">
          <TouchableOpacity onPress={handleAvatarPress} activeOpacity={0.85}>
            <View className="border-4 border-white rounded-full shadow-lg">
              {uploadingAvatar ? (
                <View
                  style={{ width: 112, height: 112, borderRadius: 56, backgroundColor: '#E2E8F0' }}
                  className="items-center justify-center"
                >
                  <ActivityIndicator color="#7C3AED" />
                </View>
              ) : (
                <Image
                  source={
                    user?.avatar_url
                      ? { uri: user.avatar_url }
                      : require('../../../assets/user-fallback.jpg')
                  }
                  style={{ width: 112, height: 112, borderRadius: 56, backgroundColor: '#E2E8F0' }}
                />
              )}
            </View>

            {/* Edit badge */}
            <View
              className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-md"
              style={{ borderWidth: 2, borderColor: '#7C3AED' }}
            >
              {uploadingAvatar
                ? <ActivityIndicator size={14} color="#7C3AED" />
                : <Feather name="camera" size={14} color="#7C3AED" />
              }
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Core Info ── */}
      <View className="mt-24 mx-6 bg-white rounded-3xl p-6 shadow-sm mb-4">
        <View className="flex-row items-center mb-4" style={{ gap: 8 }}>
          <Feather name="user" size={18} color="#7C3AED" />
          <Text className="text-base font-bold text-slate-900">Personal Information</Text>
        </View>
        <InfoRow label="Phone"         value={user?.phone_number} onPress={() => user?.phone_number && Linking.openURL(`tel:${user.phone_number}`)} />
        <InfoRow label="Email"         value={user?.email} />
        <InfoRow label="Date of Birth" value={formatDate(user?.dob)} />
        <InfoRow label="Gender"        value={user?.gender} />
        <InfoRow label="Status"        value={user?.status} />
        {user?.community?.name && <InfoRow label="Community" value={user.community.name} />}
        {user?.language?.name  && <InfoRow label="Language"  value={user.language.name} />}
      </View>

      {/* ── Role section ── */}
      <ProfileSection role={user?.role} profile={user?.profile} />

      {/* ── Settings ── */}
     {/* ── Settings ── */}
<View className="mx-6 bg-white rounded-3xl p-6 shadow-sm mb-8">
  <Text className="text-base font-bold text-slate-900 mb-4">Account & Settings</Text>
  <MenuItem
    title="Edit Profile"
    icon={<Feather name="user" size={18} color="#7C3AED" />}
    onPress={() => router.push('/profile/personalInfo')}
  />
  <MenuItem
    title="Privacy Policy"
    icon={<Feather name="shield" size={18} color="#7C3AED" />}
    onPress={() => router.push('/legal/privacyPolicy')}
  />
  <MenuItem
    title="Terms & Conditions"
    icon={<Feather name="file-text" size={18} color="#7C3AED" />}
    onPress={() => router.push('/legal/termsConditions')}
  />
  <MenuItem
    title="Log Out"
    icon={<Feather name="log-out" size={18} color="#EF4444" />}
    isDestructive
    onPress={() => setLogoutVisible(true)}
  />
  <MenuItem
    title="Delete Account"
    icon={<MaterialCommunityIcons name="delete-outline" size={20} color="#EF4444" />}
    isDestructive
    onPress={() => router.push('/profile/deleteAccount')}
  />
</View>

      {/* ── Logout Modal ── */}
      <Modal visible={logoutVisible} transparent animationType="fade">
        <View className="flex-1 bg-black/50 justify-center items-center px-10">
          <View className="bg-white p-6 rounded-3xl w-full items-center">
            {isLoggingOut ? (
              <View className="py-10 items-center">
                <ActivityIndicator size="large" color="#7C3AED" />
                <Text className="mt-4 text-gray-600 font-medium">Logging you out...</Text>
              </View>
            ) : (
              <>
                <View className="w-14 h-14 bg-red-50 rounded-full items-center justify-center mb-4">
                  <Feather name="log-out" size={24} color="#EF4444" />
                </View>
                <Text className="text-xl font-bold mb-2 text-slate-900">Log Out?</Text>
                <Text className="text-gray-500 text-center mb-6 text-sm">
                  Are you sure you want to log out of your account?
                </Text>
                <View className="flex-row w-full" style={{ gap: 12 }}>
                  <Pressable
                    onPress={() => setLogoutVisible(false)}
                    className="flex-1 bg-gray-100 py-3.5 rounded-2xl items-center"
                  >
                    <Text className="font-semibold text-gray-700">Cancel</Text>
                  </Pressable>
                  <Pressable
                    onPress={handleLogout}
                    className="flex-1 bg-red-500 py-3.5 rounded-2xl items-center"
                  >
                    <Text className="font-semibold text-white">Log Out</Text>
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