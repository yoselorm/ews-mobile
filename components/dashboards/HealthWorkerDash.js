import React from 'react';
import { View, Text, TouchableOpacity, Image, TextInput, ScrollView } from 'react-native';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSelector } from 'react-redux';

const HealthWorkerHome = ({ data }) => {
  const router = useRouter();
  const { user } = useSelector((state) => state.auth);

  // API Data Mapping
  const climate = data?.climate_status;
  const stats = data?.patient_risk_summary;
  const patientList = data?.patients || [];

  // Softened Climate Styles
  const getClimateStyles = (status) => {
    switch (status?.toLowerCase()) {
      case 'critical':
        // Soft Light Red Theme
        return { 
          bg: 'bg-red-50', 
          border: 'border-red-100', 
          text: 'text-red-600', 
          sub: 'text-red-500', 
          icon: 'alert-circle',
          iconBg: 'bg-red-100'
        };
      case 'warning':
      case 'moderate':
        return { 
          bg: 'bg-amber-50', 
          border: 'border-amber-100', 
          text: 'text-amber-600', 
          sub: 'text-amber-500', 
          icon: 'warning',
          iconBg: 'bg-amber-100' 
        };
      default: // Safe
        return { 
          bg: 'bg-emerald-900', 
          border: 'border-emerald-800', 
          text: 'text-white', 
          sub: 'text-emerald-50', 
          icon: 'cloud-outline',
          iconBg: 'bg-white/20'
        };
    }
  };

  const cStyle = getClimateStyles(climate?.status);

  return (
    <View className="flex-1 bg-white">
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 30 }}
      >
        {/* Header Section */}
        <View className="flex-row justify-between items-center mb-6">
          <View className="flex-row items-center gap-3">
            <View className="w-12 h-12 rounded-full bg-slate-200 overflow-hidden border border-slate-100">
              <Image 
                source={{ uri: user?.avatar_url || 'https://avatar.iran.liara.run/public/job/doctor/male' }} 
                className="w-full h-full"
              />
            </View>
            <View>
              <Text className="text-slate-900 text-xl font-bold">
                {user?.first_name || 'Janet'}
              </Text>
            </View>
          </View>
          <TouchableOpacity className="p-2 bg-slate-50 rounded-full">
            <Ionicons name="notifications-outline" size={24} color="#64748b" />
          </TouchableOpacity>
        </View>

        {/* Climate Status Card - Dynamic Colors */}
        <View className={`${cStyle.bg} border ${cStyle.border} rounded-[32px] p-6 mb-6`}>
          <View className="flex-row justify-between items-start mb-2">
            <View>
              <Text className={`${cStyle.sub} uppercase text-[10px] font-bold tracking-widest`}>
                Climate Status
              </Text>
              <Text className={`${cStyle.text} text-3xl font-bold uppercase`}>
                {climate?.status || 'SAFE'}
              </Text>
            </View>
            <View className={`${cStyle.iconBg} p-3 rounded-2xl`}>
              <Ionicons name={cStyle.icon} size={28} color={climate?.status === 'safe' ? 'white' : '#ef4444'} />
            </View>
          </View>

          <Text className={`${cStyle.sub} text-sm leading-5 mb-4`}>
            {climate?.description || "Temperature and humidity levels are optimal for pregnancy health."}
          </Text>

          <View className="flex-row items-center gap-2">
            <MaterialCommunityIcons name="map-marker-radius" size={16} color={climate?.status === 'safe' ? '#ecfdf5' : '#ef4444'} />
            <Text className={`${cStyle.text} text-xs font-semibold`}>{climate?.community_name || 'Your location'}</Text>
            {/* <Feather name="volume-2" size={16} color={climate?.status === 'safe' ? 'white' : '#ef4444'} style={{ marginLeft: 'auto' }} /> */}
          </View>
        </View>

        {/* Risk Stats */}
        <View className="flex-row justify-between mb-8">
          <View className="bg-slate-50 rounded-2xl p-4 w-[30%] items-center border border-slate-100">
            <Text className="text-xl font-bold text-red-500">{stats?.high || 0}</Text>
            <Text className="text-[10px] text-slate-400 font-bold uppercase text-center mt-1">High Risk</Text>
          </View>
          <View className="bg-slate-50 rounded-2xl p-4 w-[30%] items-center border border-slate-100">
            <Text className="text-xl font-bold text-yellow-600">{stats?.moderate || 0}</Text>
            <Text className="text-[10px] text-slate-400 font-bold uppercase text-center mt-1">Moderate</Text>
          </View>
          <View className="bg-slate-50 rounded-2xl p-4 w-[30%] items-center border border-slate-100">
            <Text className="text-xl font-bold text-emerald-600">{stats?.safe || 0}</Text>
            <Text className="text-[10px] text-slate-400 font-bold uppercase text-center mt-1">Safe</Text>
          </View>
        </View>

        {/* Patients Header */}
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-lg font-bold text-slate-900">Patients</Text>
          <TouchableOpacity onPress={() => router.push('/health-worker/patients')}>
            <Text className="text-purple-600 font-bold text-sm">View all</Text>
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View className="relative mb-4">
          <View className="absolute left-4 top-3.5 z-10">
            <Feather name="search" size={18} color="#94a3b8" />
          </View>
          <TextInput 
            placeholder="Search patients..."
            className="bg-slate-50 rounded-2xl py-3.5 pl-12 pr-4 text-slate-600 font-medium border border-slate-100"
          />
        </View>

        {/* Patient List */}
        {/* <View className="space-y-3 mb-6">
          {patientList.map((item) => (
            <TouchableOpacity 
              key={item.id} 
              className="flex-row items-center bg-white p-3 rounded-2xl border border-slate-50 shadow-sm shadow-slate-200 mb-3"
            >
              <View className="w-10 h-10 rounded-full bg-purple-100 items-center justify-center mr-3">
                <Text className="text-purple-600 font-bold text-xs">{item.name[0]}</Text>
              </View>
              <View className="flex-1">
                <Text className="font-bold text-slate-800 text-sm">{item.name}</Text>
                <Text className="text-slate-400 text-[10px]">{item.role_label}</Text>
              </View>
              <View className={`${item.risk_level === 'high' ? 'bg-red-50' : item.risk_level === 'moderate' ? 'bg-yellow-50' : 'bg-emerald-50'} px-3 py-1 rounded-full`}>
                <Text className={`${item.risk_level === 'high' ? 'text-red-500' : item.risk_level === 'moderate' ? 'text-yellow-600' : 'text-emerald-600'} text-[10px] font-bold uppercase`}>
                  {item.risk_level}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View> */}

        <View className="mb-6">
          {patientList.length > 0 ? (
            patientList.map((item) => {
              const riskStyle = getRiskStyles(item.risk_level);
              return (
                <TouchableOpacity 
                  key={item.id} 
                  className="flex-row items-center bg-white p-4 rounded-2xl border border-slate-50 mb-3 shadow-sm shadow-slate-200"
                >
                  <View className="w-12 h-12 rounded-2xl bg-purple-50 items-center justify-center mr-4">
                    <Text className="text-purple-600 font-black text-sm">{item.name[0]}</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="font-bold text-slate-800 text-sm">{item.name}</Text>
                    <Text className="text-slate-400 text-[10px] font-bold uppercase tracking-tighter">{item.role_label}</Text>
                  </View>
                  <View className={`${riskStyle.bg} px-3 py-1.5 rounded-full border border-slate-100`}>
                    <Text className={`${riskStyle.text} text-[10px] font-black uppercase`}>{item.risk_level}</Text>
                  </View>
                </TouchableOpacity>
              );
            })
          ) : (
            <View className="bg-slate-50 rounded-3xl p-10 items-center border border-dashed border-slate-200">
              <Feather name="users" size={24} color="#cbd5e1" />
              <Text className="text-slate-400 font-bold text-xs mt-2 text-center">No patients assigned .</Text>
            </View>
          )}
        </View>

        {/* Reverted Action Buttons */}
        <View className="flex-col gap-3">
          <TouchableOpacity 
            onPress={() => router.push('/health-worker/register-pregnant-woman')}
            className="flex-1 bg-purple-700 p-4 rounded-2xl flex-row items-center justify-between shadow-lg shadow-purple-200"
          >
            <Text className="text-white font-bold text-xs leading-4">
              Register Pregnant Woman
            </Text>
            <Ionicons name="arrow-forward" size={18} color="white" />
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => router.push('/health-worker/register-lactating-mother')}
            className="flex-1 bg-orange-600 p-4 rounded-2xl flex-row items-center justify-between shadow-lg shadow-orange-200"
          >
            <Text className="text-white font-bold text-xs leading-4">
              Register Lactating Mother
            </Text>
            <Ionicons name="arrow-forward" size={18} color="white" />
          </TouchableOpacity>
        </View>

      </ScrollView>
    </View>
  );
};

export default HealthWorkerHome;