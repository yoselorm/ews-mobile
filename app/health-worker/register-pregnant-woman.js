import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  ActivityIndicator, Image, Platform, Modal, FlatList
} from 'react-native';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { createPregnantWoman } from '../../store/slices/userSlice';
import { fetchCommunities, fetchLanguages } from '../../store/slices/communitySlice';
import { SafeAreaView } from 'react-native-safe-area-context';
import toast from '../../components/Toast';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

// ─── Label ─────────────────────────────────────────────────────────────────────
const FieldLabel = ({ children }) => (
  <Text className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-2 ml-1">
    {children}
  </Text>
);

// ─── Text Input ────────────────────────────────────────────────────────────────
const InputField = ({ label, placeholder, value, onChangeText, keyboardType = 'default', icon, multiline }) => (
  <View className="mb-5">
    <FieldLabel>{label}</FieldLabel>
    <View className="relative">
      {icon && <View className="absolute left-4 top-4 z-10">{icon}</View>}
      <TextInput
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        multiline={multiline}
        className={`bg-slate-50 border border-slate-100 rounded-2xl p-4 text-slate-800 font-medium ${icon ? 'pl-12' : ''} ${multiline ? 'min-h-[80px]' : ''}`}
        placeholderTextColor="#94a3b8"
        textAlignVertical={multiline ? 'top' : 'center'}
      />
    </View>
  </View>
);

// ─── Date Picker Field ─────────────────────────────────────────────────────────
const DateField = ({ label, value, onChange ,type = 'default' }) => {
  const [show, setShow] = useState(false);
  const date = value ? new Date(value) : new Date();

const isDOB = type === 'dob' || label.toLowerCase().includes('birth');
  const isDelivery = type === 'delivery' || label.toLowerCase().includes('delivery');

  const minDate = isDOB ? new Date(1920, 0, 1) : (isDelivery ? new Date() : undefined);
  const maxDate = isDOB ? new Date() : undefined;

  // 2. Initial picker position: 
  // If it's a DOB and empty, start at 1995 so they don't scroll from 2026.
  const getInitialDate = () => {
    if (value) return new Date(value);
    if (isDOB) return new Date(1995, 0, 1); 
    return new Date();
  };

  const [tempDate, setTempDate] = useState(getInitialDate());



  const handleChange = (event, selected) => {
    if (Platform.OS === 'android') setShow(false);
    if (selected) {
      const formatted = selected.toISOString().split('T')[0]; // YYYY-MM-DD
      onChange(formatted);
    }
  };

  return (
    <View className="mb-5">
      <FieldLabel>{label}</FieldLabel>
      <TouchableOpacity
        onPress={() => setShow(true)}
        className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex-row items-center justify-between"
      >
        <Text className={value ? 'text-slate-800 font-medium' : 'text-slate-400 font-medium'}>
          {value || 'Select date'}
        </Text>
        <Feather name="calendar" size={18} color="#94a3b8" />
      </TouchableOpacity>

      {/* iOS — inline modal */}
      {Platform.OS === 'ios' ? (
        <Modal transparent visible={show} animationType="slide">
          <View className="flex-1 justify-end bg-black/40">
            <View className="bg-white rounded-t-3xl p-6">
              <View className="flex-row justify-between items-center mb-4">
                <Text className="font-bold text-slate-800 text-base">{label}</Text>
                <TouchableOpacity onPress={() => setShow(false)}>
                  <Text className="text-purple-600 font-bold">Done</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={date}
                mode="date"
                display="spinner"
                onChange={handleChange}
                minimumDate={minDate}
                maximumDate={maxDate}
                textColor="black"
              />
            </View>
          </View>
        </Modal>
      ) : (
        show && (
          <DateTimePicker
            value={date}
            mode="date"
            display="default"
            onChange={handleChange}
            minimumDate={minDate}
                maximumDate={maxDate}
                textColor="black"
          />
        )
      )}
    </View>
  );
};

// ─── Generic Search Dropdown Modal ─────────────────────────────────────────────
const DropdownField = ({ label, placeholder, value, valueKey = 'id', labelKey = 'name', items = [], loading, icon }) => {
  const [show, setShow] = useState(false);
  const [search, setSearch] = useState('');

  const selected = items.find((i) => i[valueKey] === value);
  const filtered = items.filter((i) =>
    i[labelKey]?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View className="mb-5">
      <FieldLabel>{label}</FieldLabel>
      <TouchableOpacity
        onPress={() => setShow(true)}
        className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex-row items-center justify-between"
      >
        <Text className={selected ? 'text-slate-800 font-medium flex-1' : 'text-slate-400 font-medium flex-1'} numberOfLines={1}>
          {selected ? selected[labelKey] : placeholder}
        </Text>
        {icon || <Feather name="chevron-down" size={18} color="#94a3b8" />}
      </TouchableOpacity>

      <Modal transparent visible={show} animationType="slide">
        <View className="flex-1 justify-end bg-black/40">
          <View className="bg-white rounded-t-3xl" style={{ maxHeight: '70%' }}>
            {/* Modal Header */}
            <View className="px-5 pt-5 pb-3 flex-row justify-between items-center border-b border-slate-100">
              <Text className="font-bold text-slate-800 text-base">{label}</Text>
              <TouchableOpacity onPress={() => { setShow(false); setSearch(''); }}>
                <Ionicons name="close" size={22} color="#64748b" />
              </TouchableOpacity>
            </View>

            {/* Search */}
            <View className="px-4 py-3">
              <View className="flex-row items-center bg-slate-50 border border-slate-100 rounded-xl px-3">
                <Feather name="search" size={16} color="#94a3b8" />
                <TextInput
                  placeholder={`Search ${label.toLowerCase()}...`}
                  value={search}
                  onChangeText={setSearch}
                  className="flex-1 p-3 text-slate-700 font-medium"
                  placeholderTextColor="#94a3b8"
                />
              </View>
            </View>

            {/* List */}
            {loading ? (
              <ActivityIndicator color="#7c3aed" className="py-8" />
            ) : (
              <FlatList
                data={filtered}
                keyExtractor={(item) => String(item[valueKey])}
                contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}
                renderItem={({ item }) => {
                  const isSelected = item[valueKey] === value;
                  return (
                    <TouchableOpacity
                      onPress={() => { setShow(false); setSearch(''); }}
                      // Note: we return the id via onSelect below
                      className={`py-3.5 px-4 rounded-2xl mb-1 flex-row justify-between items-center ${isSelected ? 'bg-purple-50 border border-purple-100' : 'border border-transparent'}`}
                    >
                      <Text className={`font-medium ${isSelected ? 'text-purple-700' : 'text-slate-700'}`}>
                        {item[labelKey]}
                      </Text>
                      {isSelected && <Ionicons name="checkmark-circle" size={18} color="#7c3aed" />}
                    </TouchableOpacity>
                  );
                }}
                ListEmptyComponent={
                  <Text className="text-center text-slate-300 font-bold py-8">No results found</Text>
                }
              />
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

// ─── Dropdown with onSelect wired up properly ──────────────────────────────────
const SelectDropdown = ({ label, placeholder, value, onSelect, valueKey = 'id', labelKey = 'name', items = [], loading, icon }) => {
  const [show, setShow] = useState(false);
  const [search, setSearch] = useState('');

  const selected = items.find((i) => i[valueKey] === value);
  const filtered = items.filter((i) =>
    i[labelKey]?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View className="mb-5">
      <FieldLabel>{label}</FieldLabel>
      <TouchableOpacity
        onPress={() => setShow(true)}
        className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex-row items-center justify-between"
      >
        <Text
          className={selected ? 'text-slate-800 font-medium flex-1' : 'text-slate-400 font-medium flex-1'}
          numberOfLines={1}
        >
          {selected ? selected[labelKey] : placeholder}
        </Text>
        {icon || <Feather name="chevron-down" size={18} color="#94a3b8" />}
      </TouchableOpacity>

      <Modal transparent visible={show} animationType="slide">
        <View className="flex-1 justify-end bg-black/40">
          <View className="bg-white rounded-t-3xl" style={{ maxHeight: '70%' }}>
            <View className="px-5 pt-5 pb-3 flex-row justify-between items-center border-b border-slate-100">
              <Text className="font-bold text-slate-800 text-base">{label}</Text>
              <TouchableOpacity onPress={() => { setShow(false); setSearch(''); }}>
                <Ionicons name="close" size={22} color="#64748b" />
              </TouchableOpacity>
            </View>

            <View className="px-4 py-3">
              <View className="flex-row items-center bg-slate-50 border border-slate-100 rounded-xl px-3">
                <Feather name="search" size={16} color="#94a3b8" />
                <TextInput
                  placeholder={`Search ${label.toLowerCase()}...`}
                  value={search}
                  onChangeText={setSearch}
                  className="flex-1 p-3 text-slate-700 font-medium"
                  placeholderTextColor="#94a3b8"
                />
              </View>
            </View>

            {loading ? (
              <ActivityIndicator color="#7c3aed" style={{ paddingVertical: 32 }} />
            ) : (
              <FlatList
                data={filtered}
                keyExtractor={(item) => String(item[valueKey])}
                contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}
                renderItem={({ item }) => {
                  const isSelected = item[valueKey] === value;
                  return (
                    <TouchableOpacity
                      onPress={() => {
                        onSelect(item[valueKey]);
                        setShow(false);
                        setSearch('');
                      }}
                      className={`py-3.5 px-4 rounded-2xl mb-1 flex-row justify-between items-center ${isSelected ? 'bg-purple-50 border border-purple-100' : 'border border-transparent'}`}
                    >
                      <Text className={`font-medium ${isSelected ? 'text-purple-700' : 'text-slate-700'}`}>
                        {item[labelKey]}
                      </Text>
                      {isSelected && <Ionicons name="checkmark-circle" size={18} color="#7c3aed" />}
                    </TouchableOpacity>
                  );
                }}
                ListEmptyComponent={
                  <Text className="text-center text-slate-300 font-bold py-8">No results found</Text>
                }
              />
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
export default function RegisterPregnantWoman() {
  const router   = useRouter();
  const dispatch = useDispatch();
  const { userActionLoading } = useSelector((s) => s.users);
  const { communities, languages, loading: communityLoading } = useSelector((s) => s.communities);

  const [photo, setPhoto] = useState(null);
  const [showBloodGroupPicker, setShowBloodGroupPicker] = useState(false);

  const [formData, setFormData] = useState({
    first_name:              '',
    last_name:               '',
    phone_number:            '',
    email:                   '',
    dob:                     '',
    gender:                  'female',
    language_id:             '',
    community_id:            '',
    gestational_age_weeks:   '',
    expected_delivery_date:  '',
    gravida:                 '',
    parity:                  '',
    blood_group:             '',
    // health_worker_id:        '',
    anc_facility:            '',
    emergency_contact_name:  '',
    emergency_contact_phone: '',
    medical_conditions:      '',
  });

  const set = (key) => (val) => setFormData((prev) => ({ ...prev, [key]: val }));

  useEffect(() => {
    dispatch(fetchCommunities());
    dispatch(fetchLanguages());
  }, []);

  // ── Image picker ──────────────────────────────────────────────────────────────
  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') { toast.warning('Gallery permission is required'); return; }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [1, 1], quality: 0.7 });
    if (!result.canceled && result.assets?.[0]) {
      const a = result.assets[0];
      setPhoto({ uri: a.uri, type: a.mimeType || 'image/jpeg', name: a.fileName || `photo_${Date.now()}.jpg` });
    }
  };

  const handleTakePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') { toast.warning('Camera permission is required'); return; }
    const result = await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect: [1, 1], quality: 0.7 });
    if (!result.canceled && result.assets?.[0]) {
      const a = result.assets[0];
      setPhoto({ uri: a.uri, type: a.mimeType || 'image/jpeg', name: a.fileName || `photo_${Date.now()}.jpg` });
    }
  };

  // ── Submit ─────────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!formData.first_name || !formData.last_name || !formData.phone_number || !formData.community_id || !formData.dob || !formData.language_id) {
      toast.warning('Kinldy fill al required fields marked with *');
      return;
    }

    const body = new FormData();

    Object.entries(formData).forEach(([key, value]) => {
      if (value === '' || value === null || value === undefined) return;
      if (key === 'medical_conditions') {
        const conditions = value.split(',').map((c) => c.trim()).filter(Boolean);
        conditions.forEach((c) => body.append('medical_conditions[]', c));
      } else {
        body.append(key, String(value));
      }
    });

    if (photo) {
      body.append('photo', {
        uri:  Platform.OS === 'android' ? photo.uri : photo.uri.replace('file://', ''),
        type: photo.type,
        name: photo.name,
      });
    }

    try {
      await dispatch(createPregnantWoman(body)).unwrap();
      toast.success('Pregnant woman registered successfully');
      router.back();
    } catch (err) {
  toast.error(err?.response?.data?.message || err?.message || 'Submission failed');
}
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="px-6 py-4 flex-row items-center justify-between border-b border-slate-50">
        <TouchableOpacity onPress={() => router.back()} className="p-2 bg-slate-50 rounded-full">
          <Ionicons name="arrow-back" size={20} color="#1e293b" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-slate-900">Register Pregnant Woman</Text>
        <View className="w-10" />
      </View>

      <ScrollView className="flex-1 px-6 pt-6" showsVerticalScrollIndicator={false}>

        {/* Avatar */}
        <View className="items-center mb-8">
          <View className="bg-purple-100 p-4 rounded-full">
            <MaterialCommunityIcons name="baby-face-outline" size={32} color="#7c3aed" />
          </View>
        </View>

        {/* ── Personal Info ── */}
        <Text className="text-[10px] font-black text-purple-600 uppercase tracking-[3px] mb-4 border-b border-slate-100 pb-2">
          Personal Information
        </Text>

        <View className="flex-row gap-3">
          <View className="flex-1">
            <InputField label="First Name *" placeholder="Ama" value={formData.first_name} onChangeText={set('first_name')} />
          </View>
          <View className="flex-1">
            <InputField label="Last Name *" placeholder="Asante" value={formData.last_name} onChangeText={set('last_name')} />
          </View>
        </View>

        <InputField
          label="Phone Number *" placeholder="0241234567" keyboardType="phone-pad"
          value={formData.phone_number} onChangeText={set('phone_number')}
          icon={<Feather name="phone" size={16} color="#94a3b8" />}
        />

        <InputField
          label="Email Address" placeholder="user@example.com" keyboardType="email-address"
          value={formData.email} onChangeText={set('email')}
          icon={<Feather name="mail" size={16} color="#94a3b8" />}
        />

        {/* DOB Date Picker */}
        <DateField label="Date of Birth *" value={formData.dob} onChange={set('dob')} />

        {/* Language Dropdown */}
        <SelectDropdown
          label="Language"
          placeholder="Select language"
          value={formData.language_id}
          onSelect={set('language_id')}
          items={languages}
          loading={communityLoading}
          icon={<Feather name="globe" size={18} color="#94a3b8" />}
        />

        {/* Community Dropdown */}
        <SelectDropdown
          label="Community *"
          placeholder="Select community"
          value={formData.community_id}
          onSelect={set('community_id')}
          items={communities}
          loading={communityLoading}
          icon={<Feather name="map-pin" size={18} color="#94a3b8" />}
        />

        {/* ── Pregnancy Details ── */}
        <Text className="text-[10px] font-black text-purple-600 uppercase tracking-[3px] mb-4 border-b border-slate-100 pb-2 mt-2">
          Pregnancy Details
        </Text>

        <View className="flex-row gap-3">
          <View className="flex-1">
            <InputField
              label="Gestational Age (wks)" placeholder="e.g. 20" keyboardType="numeric"
              value={formData.gestational_age_weeks} onChangeText={set('gestational_age_weeks')}
            />
          </View>
          <View className="flex-1">
            <DateField label="Expected Delivery" value={formData.expected_delivery_date} onChange={set('expected_delivery_date')} />
          </View>
        </View>

        <View className="flex-row gap-3">
          <View className="flex-1">
            <InputField
              label="Gravida" placeholder="No. of pregnancies" keyboardType="numeric"
              value={formData.gravida} onChangeText={set('gravida')}
            />
          </View>
          <View className="flex-1">
            <InputField
              label="Parity" placeholder="No. of births" keyboardType="numeric"
              value={formData.parity} onChangeText={set('parity')}
            />
          </View>
        </View>

        {/* Blood Group */}
        <View className="mb-5">
          <FieldLabel>Blood Group</FieldLabel>
          <TouchableOpacity
            onPress={() => setShowBloodGroupPicker((v) => !v)}
            className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex-row justify-between items-center"
          >
            <Text className={formData.blood_group ? 'text-slate-800 font-medium' : 'text-slate-400 font-medium'}>
              {formData.blood_group || 'Select blood group'}
            </Text>
            <Feather name={showBloodGroupPicker ? 'chevron-up' : 'chevron-down'} size={18} color="#94a3b8" />
          </TouchableOpacity>
          {showBloodGroupPicker && (
            <View className="flex-row flex-wrap gap-2 mt-2 px-1">
              {BLOOD_GROUPS.map((g) => (
                <TouchableOpacity
                  key={g}
                  onPress={() => { set('blood_group')(g); setShowBloodGroupPicker(false); }}
                  className={`px-4 py-2 rounded-xl border ${formData.blood_group === g ? 'bg-purple-600 border-purple-600' : 'bg-white border-slate-200'}`}
                >
                  <Text className={`font-bold text-sm ${formData.blood_group === g ? 'text-white' : 'text-slate-600'}`}>{g}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <InputField
          label="ANC Facility" placeholder="e.g. Ridge Hospital"
          value={formData.anc_facility} onChangeText={set('anc_facility')}
          icon={<MaterialCommunityIcons name="hospital-building" size={16} color="#94a3b8" />}
        />

        {/* <InputField
          label="Health Worker ID" placeholder="Assigned health worker ID"
          value={formData.health_worker_id} onChangeText={set('health_worker_id')}
        /> */}

        <InputField
          label="Medical Conditions"
          placeholder="e.g. Diabetes, Hypertension (comma separated)"
          value={formData.medical_conditions} onChangeText={set('medical_conditions')}
          multiline
        />

        {/* ── Emergency Contact ── */}
        <Text className="text-[10px] font-black text-purple-600 uppercase tracking-[3px] mb-4 border-b border-slate-100 pb-2 mt-2">
          Emergency Contact
        </Text>

        <InputField
          label="Contact Name" placeholder="Kofi Asante"
          value={formData.emergency_contact_name} onChangeText={set('emergency_contact_name')}
          icon={<Feather name="user" size={16} color="#94a3b8" />}
        />

        <InputField
          label="Contact Phone" placeholder="0209876543" keyboardType="phone-pad"
          value={formData.emergency_contact_phone} onChangeText={set('emergency_contact_phone')}
          icon={<Feather name="phone" size={16} color="#94a3b8" />}
        />

        {/* ── Photo ── */}
        <Text className="text-[10px] font-black text-purple-600 uppercase tracking-[3px] mb-4 border-b border-slate-100 pb-2 mt-2">
          Photo
        </Text>

        {photo ? (
          <View className="items-center mb-6">
            <Image source={{ uri: photo.uri }} style={{ width: 144, height: 144, borderRadius: 24 }} resizeMode="cover" />
            <TouchableOpacity onPress={() => setPhoto(null)} className="mt-3 flex-row items-center gap-1">
              <Feather name="trash-2" size={14} color="#ef4444" />
              <Text className="text-red-500 text-xs font-bold ml-1">Remove photo</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View className="flex-row gap-3 mb-8">
            <TouchableOpacity onPress={handleTakePhoto} className="flex-1 border-2 border-dashed border-slate-200 rounded-[28px] py-8 items-center bg-slate-50/50">
              <Ionicons name="camera" size={28} color="#94a3b8" />
              <Text className="text-slate-400 font-bold text-xs mt-2 text-center">Take Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handlePickImage} className="flex-1 border-2 border-dashed border-slate-200 rounded-[28px] py-8 items-center bg-slate-50/50">
              <Ionicons name="image-outline" size={28} color="#94a3b8" />
              <Text className="text-slate-400 font-bold text-xs mt-2 text-center">From Gallery</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── Actions ── */}
        <View className="flex-row gap-4 mb-12">
          <TouchableOpacity onPress={() => router.back()} className="flex-1 py-4 bg-slate-100 rounded-2xl items-center">
            <Text className="text-slate-600 font-bold">Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleSave}
            disabled={userActionLoading}
            className={`flex-1 py-4 rounded-2xl items-center flex-row justify-center gap-2 ${userActionLoading ? 'bg-purple-400' : 'bg-purple-600'}`}
          >
            {userActionLoading
              ? <ActivityIndicator color="white" />
              : <Text className="text-white font-bold">Save</Text>
            }
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}