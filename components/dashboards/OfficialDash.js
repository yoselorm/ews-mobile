import React from 'react';
import { View, Text, ScrollView, TouchableOpacity} from 'react-native';
import { Ionicons, Feather, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { SafeAreaView } from 'react-native-safe-area-context';

const AssemblyOfficialHome = () => {
  const { user } = useSelector((state) => state.auth);

  // Stats specific to the District Official's jurisdiction
  const districtStats = [
    { label: 'Communities', count: '12', icon: 'map-marker-path', color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Active Alerts', count: '03', icon: 'alert-decagram', color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Health Workers', count: '45', icon: 'account-group', color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  return (
    <View className="flex-1 bg-white">
      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        
        {/* Header - Jurisdiction Focus */}
        <View className="py-6 flex-row justify-between items-center">
          <View>
            <Text className="text-slate-400 text-xs font-bold uppercase tracking-widest">
                {user?.profile?.jurisdiction || 'District Office'}
            </Text>
            <Text className="text-slate-900 text-2xl font-bold">Welcome, {user?.last_name}</Text>
          </View>
          <TouchableOpacity className="p-2 bg-slate-100 rounded-full">
            <Ionicons name="settings-outline" size={22} color="#475569" />
          </TouchableOpacity>
        </View>

        {/* District Health Overview Card */}
        <View className="bg-slate-900 rounded-[32px] p-6 mb-6">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-white text-lg font-bold">District Health Status</Text>
            <View className="bg-emerald-500 px-3 py-1 rounded-full">
                <Text className="text-white text-[10px] font-bold uppercase">Stable</Text>
            </View>
          </View>
          
          <View className="flex-row justify-between items-center">
            <View>
                <Text className="text-slate-400 text-xs font-medium">Total Vulnerable Users</Text>
                <Text className="text-white text-3xl font-bold">1,240</Text>
            </View>
            <View className="h-10 w-[1px] bg-slate-700" />
            <View>
                <Text className="text-slate-400 text-xs font-medium">Alert Coverage</Text>
                <Text className="text-emerald-400 text-3xl font-bold">98%</Text>
            </View>
          </View>
        </View>

        {/* Quick Stats Grid */}
        <View className="flex-row flex-wrap justify-between mb-8">
            {districtStats.map((stat, i) => (
                <View key={i} className={`${stat.bg} w-[31%] p-4 rounded-3xl items-center border border-slate-100`}>
                    <MaterialCommunityIcons name={stat.icon} size={24} color={stat.color.replace('text-', '')} />
                    <Text className={`text-xl font-bold mt-2 ${stat.color}`}>{stat.count}</Text>
                    <Text className="text-[10px] text-slate-500 font-bold uppercase text-center">{stat.label}</Text>
                </View>
            ))}
        </View>

        {/* Recent District Incidents */}
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-lg font-bold text-slate-900">Recent Reports</Text>
          <TouchableOpacity>
            <Text className="text-purple-600 font-bold text-sm">View Archive</Text>
          </TouchableOpacity>
        </View>

        <View className="space-y-3 mb-10">
          {[
            { area: 'Accra Central', msg: 'Flood warning response initiated', time: '2 hrs ago', type: 'flood' },
            { area: 'Haatso Community', msg: 'Extreme heat protocol active', time: '5 hrs ago', type: 'heat' }
          ].map((report, idx) => (
            <TouchableOpacity key={idx} className="bg-white p-4 rounded-2xl flex-row items-center border border-slate-100 shadow-sm shadow-slate-200">
                <View className={`w-10 h-10 rounded-xl items-center justify-center mr-4 ${report.type === 'flood' ? 'bg-blue-100' : 'bg-orange-100'}`}>
                    <Ionicons 
                        name={report.type === 'flood' ? "water" : "sunny"} 
                        size={20} 
                        color={report.type === 'flood' ? "#2563eb" : "#d97706"} 
                    />
                </View>
                <View className="flex-1">
                    <Text className="font-bold text-slate-800 text-sm">{report.area}</Text>
                    <Text className="text-slate-500 text-xs">{report.msg}</Text>
                </View>
                <Text className="text-slate-400 text-[10px] font-medium">{report.time}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Official Actions */}
        <TouchableOpacity className="bg-purple-600 p-5 rounded-3xl flex-row items-center justify-center mb-10 shadow-lg shadow-purple-200">
            <Feather name="plus-circle" size={20} color="white" />
            <Text className="text-white font-bold ml-2">Broadcast District Alert</Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
};

export default AssemblyOfficialHome;