import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, TextInput, FlatList, ActivityIndicator, Image, ScrollView } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { debounce } from 'lodash';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fetchPatients } from '../../../store/slices/patientSlice';

const PatientsPage = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { list, loading, meta, error } = useSelector((state) => state.patients);

  // Filter and Pagination State based on API
  const [params, setParams] = useState({
    search: '',
    role: '', // Available: pregnant_woman, lactating_mother
    sort: 'first_name,-last_name', // Default sort
    page: 1,
    limit: 15
  });

  useEffect(() => {
    dispatch(fetchPatients(params));
  }, [params, dispatch]);

  // Debounced search to avoid excessive API calls
  const handleSearch = useCallback(
    debounce((text) => {
      setParams(prev => ({ ...prev, search: text, page: 1 }));
    }, 500),
    []
  );

  const getRiskStyles = (risk) => {
    switch (risk?.toLowerCase()) {
      case 'high': return { text: 'text-pink-500', bg: 'bg-pink-50', icon: 'alert-circle' };
      case 'critical': return { text: 'text-red-500', bg: 'bg-red-50', icon: 'alert-circle' };
      case 'moderate': return { text: 'text-yellow-600', bg: 'bg-yellow-50', icon: 'trending-up' };
      default: return { text: 'text-emerald-500', bg: 'bg-emerald-50', icon: 'checkmark-circle' };
    }
  };

  const renderPatientItem = ({ item }) => {
    const risk = getRiskStyles(item.risk_level);
    return (
      <TouchableOpacity 
        onPress={() => router.push(`/health-worker/patients/${item.id}`)}
        className="flex-row items-center bg-white p-4 rounded-[24px] mb-3 border border-slate-50 shadow-sm shadow-slate-200"
      >
        <View className="w-12 h-12 rounded-2xl bg-slate-100 overflow-hidden mr-4">
          {item.avatar_url ? (
            <Image source={{ uri: item.avatar_url }} className="w-full h-full" />
          ) : (
            <View className="w-full h-full items-center justify-center bg-purple-50">
              <Text className="text-purple-600 font-bold text-lg">{item.name[0]}</Text>
            </View>
          )}
        </View>

        <View className="flex-1">
          <Text className="text-slate-900 font-bold text-base">{item.name}</Text>
          <View className="flex-row items-center gap-1">
            <Text className="text-slate-400 text-xs">{item.role_label}</Text>
            {item.gestational_age_weeks && (
              <Text className="text-slate-300 text-[10px]">• {item.gestational_age_weeks} weeks</Text>
            )}
          </View>
        </View>

        <View className={`${risk.bg} px-3 py-1.5 rounded-full flex-row items-center gap-1`}>
          <Ionicons name={risk.icon} size={12} color={risk.text.replace('text-', '')} />
          <Text className={`${risk.text} text-[10px] font-black uppercase tracking-tighter`}>
            {item.risk_level}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
            <View className="flex-1 bg-white pt-4">
      {/* Header */}
      <View className="px-4 flex-row items-center justify-between mb-6">
        <TouchableOpacity onPress={() => router.back()} className="p-2 bg-slate-50 rounded-full">
          <Feather name="chevron-left" size={24} color="#1e293b" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-slate-900">Patient Directory</Text>
        <View className="w-10" /> 
      </View>

      {/* Search and Filters */}
      <View className="px-4 mb-4">
        <View className="relative mb-3">
          <View className="absolute left-4 top-3.5 z-10">
            <Feather name="search" size={18} color="#94a3b8" />
          </View>
          <TextInput 
            placeholder="Search name, phone, or ID..."
            className="bg-slate-50 rounded-2xl py-3.5 pl-12 pr-4 text-slate-700 font-medium border border-slate-100"
            onChangeText={handleSearch}
          />
        </View>

        {/* Role Quick Filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-2">
          {[
            { label: 'All Patients', value: '' },
            { label: 'Pregnant', value: 'pregnant_woman' },
            { label: 'Lactating', value: 'lactating_mother' }
          ].map((btn) => (
            <TouchableOpacity 
              key={btn.value}
              onPress={() => setParams({ ...params, role: btn.value, page: 1 })}
              className={`px-5 py-2.5 rounded-full border ${params.role === btn.value ? 'bg-slate-900 border-slate-900' : 'bg-white border-slate-200'}`}
            >
              <Text className={`text-xs font-bold ${params.role === btn.value ? 'text-white' : 'text-slate-500'}`}>
                {btn.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Patient List */}
      <FlatList
        data={list}
        renderItem={renderPatientItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }}
        ListEmptyComponent={() => !loading && (
          <View className="py-20 items-center">
            <MaterialCommunityIcons name="account-search-outline" size={64} color="#cbd5e1" />
            <Text className="text-slate-400 font-bold mt-4">No patients matching your filters.</Text>
          </View>
        )}
        ListFooterComponent={() => loading && (
          <ActivityIndicator size="small" color="#7C3AED" className="my-4" />
        )}
        onEndReached={() => {
          if (meta.current_page < meta.last_page && !loading) {
            setParams(prev => ({ ...prev, page: prev.page + 1 }));
          }
        }}
        onEndReachedThreshold={0.5}
      />
    </View>

    </SafeAreaView>

  );
};

export default PatientsPage;