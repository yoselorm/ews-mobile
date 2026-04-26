import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  ActivityIndicator, KeyboardAvoidingView, Platform, Image,
  Modal, FlatList
} from 'react-native';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { createLactatingMother } from '../../store/slices/userSlice';
import { fetchCommunities, fetchLanguages } from '../../store/slices/communitySlice';
import { SafeAreaView } from 'react-native-safe-area-context';
import toast from '../../components/Toast';

// ─── Primitives ────────────────────────────────────────────────────────────────
const SectionTitle = ({ children, color = 'text-purple-600' }) => (
  <Text className={`${color} font-bold text-[10px] uppercase tracking-[2px] mb-4`}>{children}</Text>
);

const Divider = () => <View className="h-[1px] bg-slate-100 mb-6" />;

const FieldLabel = ({ children, required }) => (
  <Text className="text-slate-500 text-[10px] font-bold uppercase mb-2 ml-1">
    {children}{required && <Text className="text-red-400"> *</Text>}
  </Text>
);

const InputField = ({ label, placeholder, value, onChangeText, keyboardType = 'default', required, multiline }) => (
  <View className="mb-4">
    <FieldLabel required={required}>{label}</FieldLabel>
    <TextInput
      placeholder={placeholder}
      value={value}
      onChangeText={onChangeText}
      keyboardType={keyboardType}
      multiline={multiline}
      className={`bg-slate-50 border border-slate-100 rounded-2xl p-4 text-slate-800 font-medium ${multiline ? 'min-h-[72px]' : ''}`}
      placeholderTextColor="#cbd5e1"
      textAlignVertical={multiline ? 'top' : 'center'}
    />
  </View>
);

// ─── Date Picker ───────────────────────────────────────────────────────────────
const DateField = ({ label, value, onChange, required,type = 'default'  }) => {
  const [show, setShow] = useState(false);
  const date = value ? new Date(value) : new Date();

  const isDOB = type === 'dob' || label.toLowerCase().includes('birth');
  const isDelivery = type === 'delivery' || label.toLowerCase().includes('delivery');

  const minDate = isDOB ? new Date(1920, 0, 1) : (isDelivery ? new Date() : undefined);
  const maxDate = isDOB ? new Date() : undefined;
  const handleChange = (_, selected) => {
    if (Platform.OS === 'android') setShow(false);
    if (selected) onChange(selected.toISOString().split('T')[0]);
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

// ─── Searchable Dropdown ───────────────────────────────────────────────────────
const SelectDropdown = ({ label, placeholder, value, onSelect, items = [], loading, required, icon }) => {
  const [show, setShow] = useState(false);
  const [search, setSearch] = useState('');
  const selected = items.find((i) => i.id === value);
  const filtered = items.filter((i) => i.name?.toLowerCase().includes(search.toLowerCase()));

  return (
    <View className="mb-4">
      <FieldLabel required={required}>{label}</FieldLabel>
      <TouchableOpacity
        onPress={() => setShow(true)}
        className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex-row items-center justify-between"
      >
        <Text className={`flex-1 font-medium ${selected ? 'text-slate-800' : 'text-slate-400'}`} numberOfLines={1}>
          {selected ? selected.name : placeholder}
        </Text>
        {icon || <Feather name="chevron-down" size={17} color="#94a3b8" />}
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
                <Feather name="search" size={15} color="#94a3b8" />
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
                keyExtractor={(item) => String(item.id)}
                contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}
                ListEmptyComponent={<Text className="text-center text-slate-300 font-bold py-8">No results</Text>}
                renderItem={({ item }) => {
                  const isSelected = item.id === value;
                  return (
                    <TouchableOpacity
                      onPress={() => { onSelect(item.id); setShow(false); setSearch(''); }}
                      className={`py-3.5 px-4 rounded-2xl mb-1 flex-row justify-between items-center ${isSelected ? 'bg-purple-50 border border-purple-100' : 'border border-transparent'}`}
                    >
                      <Text className={`font-medium ${isSelected ? 'text-purple-700' : 'text-slate-700'}`}>{item.name}</Text>
                      {isSelected && <Ionicons name="checkmark-circle" size={18} color="#7c3aed" />}
                    </TouchableOpacity>
                  );
                }}
              />
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

// ─── Toggle Selector (Gender / Mode of Delivery) ──────────────────────────────
const ToggleField = ({ label, value, options, onSelect }) => (
  <View className="mb-4">
    <FieldLabel>{label}</FieldLabel>
    <View className="flex-row bg-slate-50 border border-slate-100 rounded-2xl p-1">
      {options.map((o) => (
        <TouchableOpacity
          key={o.value}
          onPress={() => onSelect(o.value)}
          className={`flex-1 py-3 rounded-xl items-center ${value === o.value ? 'bg-white shadow-sm' : ''}`}
        >
          <Text className={`text-xs font-bold ${value === o.value ? 'text-purple-600' : 'text-slate-400'}`}>{o.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  </View>
);

// ══════════════════════════════════════════════════════════════════════════════
export default function RegisterLactatingMother() {
  const router   = useRouter();
  const dispatch = useDispatch();
  const { userActionLoading }                       = useSelector((s) => s.users);
  const { communities, languages, loading: communityLoading } = useSelector((s) => s.communities);

  const [photo, setPhoto] = useState(null);

  const [formData, setFormData] = useState({
    first_name:              '',
    last_name:               '',
    dob:                     '',
    phone_number:            '',
    email:                   '',
    gender:                  'female',
    language_id:             '',
    community_id:            '',
    baby_first_name:         '',
    baby_last_name:          '',
    baby_dob:                '',
    birth_weight_kg:         '',
    baby_gender:             'female',
    mode_of_delivery:        '',
    number_of_babies:        '1',
    delivery_location:       '',
    // delivery_date:           '',
    emergency_contact_name:  '',
    emergency_contact_phone: '',
  });

  const set = (key) => (val) => setFormData((prev) => ({ ...prev, [key]: val }));

  useEffect(() => {
    dispatch(fetchCommunities());
    dispatch(fetchLanguages());
  }, []);

  // ── Image ─────────────────────────────────────────────────────────────────────
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
    const required = ['first_name', 'last_name', 'dob', 'phone_number', 'baby_first_name', 'baby_last_name', 'baby_dob'];
    const missing  = required.filter((k) => !formData[k]);
    if (missing.length > 0) { toast.warning('Please complete all required fields (*)'); return; }

    const body = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (value === '' || value === null || value === undefined) return;
      body.append(key, String(value));
    });
    if (photo) {
      body.append('photo', {
        uri:  Platform.OS === 'android' ? photo.uri : photo.uri.replace('file://', ''),
        type: photo.type,
        name: photo.name,
      });
    }

    try {
      await dispatch(createLactatingMother(body)).unwrap();
      toast.success('Mother and baby enrolled successfully');
      router.back();
    } catch (err) {
      toast.error(err || 'Submission failed');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">

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

          {/* ── Mother's Details ── */}
          <SectionTitle>Mother's Details</SectionTitle>

          <View className="flex-row gap-4">
            <View className="flex-1">
              <InputField label="First Name" placeholder="Required" required value={formData.first_name} onChangeText={set('first_name')} />
            </View>
            <View className="flex-1">
              <InputField label="Last Name" placeholder="Required" required value={formData.last_name} onChangeText={set('last_name')} />
            </View>
          </View>

          <DateField label="Date of Birth" value={formData.dob} onChange={set('dob')} required maxDate={new Date()} />

          <InputField label="Phone Number" placeholder="+233..." keyboardType="phone-pad" required value={formData.phone_number} onChangeText={set('phone_number')} />
          <InputField label="Email Address" placeholder="Optional" keyboardType="email-address" value={formData.email} onChangeText={set('email')} />

          <ToggleField
            label="Gender"
            value={formData.gender}
            options={[{ label: 'Female', value: 'female' }, { label: 'Male', value: 'male' }]}
            onSelect={set('gender')}
          />

          <SelectDropdown
            label="Language"
            placeholder="Select language"
            value={formData.language_id}
            onSelect={set('language_id')}
            items={languages}
            loading={communityLoading}
            icon={<Feather name="globe" size={17} color="#94a3b8" />}
          />

          <SelectDropdown
            label="Community"
            placeholder="Select community"
            value={formData.community_id}
            onSelect={set('community_id')}
            items={communities}
            loading={communityLoading}
            icon={<Feather name="map-pin" size={17} color="#94a3b8" />}
          />

          {/* ── Baby's Details ── */}
          <Divider />
          <SectionTitle>Baby's Details</SectionTitle>

          <View className="flex-row gap-4">
            <View className="flex-1">
              <InputField label="Baby First Name" placeholder="Required" required value={formData.baby_first_name} onChangeText={set('baby_first_name')} />
            </View>
            <View className="flex-1">
              <InputField label="Baby Last Name" placeholder="Required" required value={formData.baby_last_name} onChangeText={set('baby_last_name')} />
            </View>
          </View>

          <DateField label="Baby Date of Birth" value={formData.baby_dob} onChange={set('baby_dob')} required maxDate={new Date()} />

          <View className="flex-row gap-4">
            <View className="flex-1">
              <InputField label="Birth Weight (kg)" placeholder="e.g. 3.2" keyboardType="numeric" value={formData.birth_weight_kg} onChangeText={set('birth_weight_kg')} />
            </View>
            <View className="flex-1">
              <ToggleField
                label="Baby Gender"
                value={formData.baby_gender}
                options={[{ label: 'Female', value: 'female' }, { label: 'Male', value: 'male' }]}
                onSelect={set('baby_gender')}
              />
            </View>
          </View>

          {/* ── Delivery Info ── */}
          <Divider />
          <SectionTitle>Delivery Information</SectionTitle>

          <ToggleField
            label="Mode of Delivery"
            value={formData.mode_of_delivery}
            options={[{ label: 'Vaginal', value: 'vaginal' }, { label: 'Caesarean', value: 'caesarean' }]}
            onSelect={set('mode_of_delivery')}
          />

          {/* <View className="flex-row gap-4">
            <View className="flex-1">
              <InputField label="No. of Babies" placeholder="1" keyboardType="numeric" value={formData.number_of_babies} onChangeText={set('number_of_babies')} />
            </View>
            <View className="flex-1">
              <DateField label="Delivery Date" value={formData.delivery_date} onChange={set('delivery_date')} maxDate={new Date()} />
            </View>
          </View> */}

          <InputField label="Delivery Location" placeholder="Hospital / Clinic name" value={formData.delivery_location} onChangeText={set('delivery_location')} />

          {/* ── Emergency Contact ── */}
          <Divider />
          <SectionTitle color="text-orange-500">Emergency Contact</SectionTitle>

          <InputField label="Contact Full Name" placeholder="Contact person" value={formData.emergency_contact_name} onChangeText={set('emergency_contact_name')} />
          <InputField label="Contact Phone" placeholder="+233..." keyboardType="phone-pad" value={formData.emergency_contact_phone} onChangeText={set('emergency_contact_phone')} />

          {/* ── Photo ── */}
          <Divider />
          <SectionTitle>Photo</SectionTitle>

          {photo ? (
            <View className="items-center mb-8">
              <Image source={{ uri: photo.uri }} style={{ width: 120, height: 120, borderRadius: 60 }} resizeMode="cover" />
              <View className="flex-row gap-4 mt-4">
                <TouchableOpacity onPress={handleTakePhoto} className="bg-purple-50 border border-purple-100 px-4 py-2 rounded-full">
                  <Text className="text-purple-600 font-bold text-[10px] uppercase tracking-wider">Retake</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setPhoto(null)} className="bg-red-50 border border-red-100 px-4 py-2 rounded-full">
                  <Text className="text-red-500 font-bold text-[10px] uppercase tracking-wider">Remove</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View className="flex-row gap-3 mb-8">
              <TouchableOpacity onPress={handleTakePhoto} className="flex-1 border-2 border-dashed border-slate-200 rounded-[28px] py-8 items-center bg-slate-50">
                <View className="bg-white p-3 rounded-full mb-2 shadow-sm">
                  <MaterialCommunityIcons name="camera-plus-outline" size={24} color="#7c3aed" />
                </View>
                <Text className="text-slate-500 font-bold text-xs">Take Photo</Text>
                <Text className="text-slate-400 text-[10px] mt-0.5">Camera</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handlePickImage} className="flex-1 border-2 border-dashed border-slate-200 rounded-[28px] py-8 items-center bg-slate-50">
                <View className="bg-white p-3 rounded-full mb-2 shadow-sm">
                  <Ionicons name="image-outline" size={24} color="#7c3aed" />
                </View>
                <Text className="text-slate-500 font-bold text-xs">From Gallery</Text>
                <Text className="text-slate-400 text-[10px] mt-0.5">Library</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* ── Actions ── */}
          <View className="flex-row gap-4 mb-20">
            <TouchableOpacity onPress={() => router.back()} className="flex-1 py-4 bg-slate-50 border border-slate-100 rounded-2xl items-center">
              <Text className="text-slate-500 font-bold">Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSave}
              disabled={userActionLoading}
              className={`flex-1 py-4 rounded-2xl items-center flex-row justify-center ${userActionLoading ? 'bg-purple-300' : 'bg-purple-700 shadow-lg shadow-purple-200'}`}
            >
              {userActionLoading
                ? <ActivityIndicator color="white" />
                : <Text className="text-white font-bold">Submit Record</Text>
              }
            </TouchableOpacity>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}