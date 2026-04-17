import React from 'react';
import { View, Text, TouchableOpacity, Image, TextInput, ScrollView } from 'react-native';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSelector } from 'react-redux';

const HealthWorkerHome = () => {
  const router = useRouter();
  const { admin } = useSelector((state) => state.auth);

  const patients = [
    { id: '1', name: 'Ama Love', status: '7 months pregnant', risk: 'High Risk', color: 'text-red-500', bg: 'bg-red-50' },
    { id: '2', name: 'Kate', status: 'Lactating Mother', risk: 'Safe', color: 'text-green-500', bg: 'bg-green-50' },
    { id: '3', name: 'Pat', status: '5 months pregnant', risk: 'Moderate', color: 'text-yellow-600', bg: 'bg-yellow-50' },
  ];

  return (
    <View className="flex-1 bg-white">
      
      {/* ✅ Scrollable content */}
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 30 }}
      >

        {/* Header Section */}
        <View className="flex-row justify-between items-center mb-6">
          <View className="flex-row items-center gap-3">
            <View className="w-12 h-12 rounded-full bg-slate-200 overflow-hidden border border-slate-100">
              <Image 
                source={{ uri: 'https://avatar.iran.liara.run/public/job/doctor/male' }} 
                className="w-full h-full"
              />
            </View>
            <View>
              <Text className="text-slate-400 text-xs font-medium">Good morning,</Text>
              <Text className="text-slate-900 text-xl font-bold">
                {admin?.first_name || 'Janet'}
              </Text>
            </View>
          </View>

          <TouchableOpacity className="p-2 bg-slate-50 rounded-full">
            <Ionicons name="notifications-outline" size={24} color="#64748b" />
          </TouchableOpacity>
        </View>

        {/* Climate Status Card */}
        <View className="bg-emerald-900 rounded-[32px] p-6 mb-6">
          <View className="flex-row justify-between items-start mb-2">
            <View>
              <Text className="text-emerald-100/70 uppercase text-[10px] font-bold tracking-widest">
                Climate Status
              </Text>
              <Text className="text-white text-3xl font-bold">SAFE</Text>
            </View>
            <View className="bg-white/20 p-3 rounded-2xl">
              <Ionicons name="cloud-outline" size={28} color="white" />
            </View>
          </View>

          <Text className="text-emerald-50/80 text-sm leading-5 mb-4">
            Temperature and humidity levels are optimal for pregnancy health in your area today.
          </Text>

          <View className="flex-row items-center gap-2">
            <MaterialCommunityIcons name="map-marker-radius" size={16} color="#ecfdf5" />
            <Text className="text-emerald-50 text-xs font-semibold">Haatso</Text>
            <Feather name="volume-2" size={16} color="white" style={{ marginLeft: 'auto' }} />
          </View>
        </View>

        {/* Risk Stats */}
        <View className="flex-row justify-between mb-8">
          {[
            { label: 'High Risk', count: 10, color: 'text-red-500' },
            { label: 'Moderate Risk', count: 15, color: 'text-yellow-600' },
            { label: 'Safe', count: 50, color: 'text-emerald-600' }
          ].map((stat, i) => (
            <View key={i} className="bg-slate-50 rounded-2xl p-4 w-[30%] items-center border border-slate-100">
              <Text className={`text-xl font-bold ${stat.color}`}>{stat.count}</Text>
              <Text className="text-[10px] text-slate-400 font-bold uppercase text-center mt-1">
                {stat.label}
              </Text>
            </View>
          ))}
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
        <View className="space-y-3 mb-6">
          {patients.map((item) => (
            <TouchableOpacity 
              key={item.id} 
              className="flex-row items-center bg-white p-3 rounded-2xl border border-slate-50 shadow-sm shadow-slate-200"
            >
              <View className="w-10 h-10 rounded-full bg-purple-100 items-center justify-center mr-3">
                <Text className="text-purple-600 font-bold text-xs">{item.name[0]}</Text>
              </View>
              <View className="flex-1">
                <Text className="font-bold text-slate-800 text-sm">{item.name}</Text>
                <Text className="text-slate-400 text-[10px]">{item.status}</Text>
              </View>
              <View className={`${item.bg} px-3 py-1 rounded-full`}>
                <Text className={`${item.color} text-[10px] font-bold`}>{item.risk}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Actions */}
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