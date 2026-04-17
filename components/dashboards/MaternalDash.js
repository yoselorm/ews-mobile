import React from 'react';
import { View, Text, TouchableOpacity, ScrollView} from 'react-native';
import { Ionicons, Feather, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { SafeAreaView } from 'react-native-safe-area-context';

const MaternalDash = () => {
  const { user } = useSelector((state) => state.auth);

  // Mock status based on your "Moderate Risk" UX screenshot
  const climateStatus = {
    riskLevel: 'High Heat Risk',
    description: "It's very hot today, take care of yourself and your baby",
    actionTitle: 'Drink Water',
    actionDesc: 'Drink two big glasses now',
    icon: 'sunny'
  };

  return (
    <View className="flex-1 bg-white">
      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        
        {/* Header - Welcome */}
        <View className="py-4 flex-row justify-between items-center">
          <View>
            <Text className="text-slate-900 text-2xl font-bold">Hello {user?.first_name || 'Ama'},</Text>
            <Text className="text-slate-500 font-medium">Stay safe today</Text>
          </View>
          <TouchableOpacity className="w-10 h-10 bg-slate-100 rounded-full items-center justify-center">
            <Ionicons name="notifications-outline" size={22} color="#475569" />
          </TouchableOpacity>
        </View>

        {/* Main Risk Banner */}
        <View className="bg-red-50 rounded-[32px] p-6 mb-4 border border-red-100">
          <View className="flex-row justify-between">
            <View className="flex-1">
              <Text className="text-red-600 text-2xl font-bold mb-2">{climateStatus.riskLevel}</Text>
              <Text className="text-slate-600 text-sm leading-5 mb-4">
                {climateStatus.description}
              </Text>
            </View>
            <View className="ml-2">
               <Ionicons name={climateStatus.icon} size={48} color="#ef4444" />
            </View>
          </View>
          
          <TouchableOpacity className="bg-white/80 rounded-2xl py-3 flex-row items-center justify-center border border-red-100">
            <Ionicons name="volume-high" size={20} color="#ef4444" />
            <Text className="text-red-600 font-bold ml-2">Listen</Text>
          </TouchableOpacity>
        </View>

        {/* Action Recommendation Card */}
        <View className="bg-blue-50 rounded-3xl p-5 mb-6 flex-row items-center">
          <View className="bg-white p-3 rounded-2xl mr-4 shadow-sm shadow-blue-200">
            <MaterialCommunityIcons name="cup-water" size={32} color="#3b82f6" />
          </View>
          <View className="flex-1">
            <Text className="text-slate-900 font-bold text-lg">{climateStatus.actionTitle}</Text>
            <Text className="text-slate-500 text-sm">{climateStatus.actionDesc}</Text>
          </View>
          <TouchableOpacity>
             <Ionicons name="volume-medium-outline" size={22} color="#3b82f6" />
          </TouchableOpacity>
        </View>

        {/* Quick Tips Grid */}
        <View className="flex-row gap-4 mb-8">
          <View className="flex-1 bg-slate-50 p-4 rounded-3xl items-center border border-slate-100">
            <View className="bg-white p-2 rounded-xl mb-2">
                <FontAwesome5 name="house-user" size={20} color="#64748b" />
            </View>
            <Text className="text-slate-700 font-bold text-xs">Stay Indoors</Text>
            <Ionicons name="volume-low-outline" size={16} color="#94a3b8" className="mt-1" />
          </View>

          <View className="flex-1 bg-slate-50 p-4 rounded-3xl items-center border border-slate-100">
            <View className="bg-white p-2 rounded-xl mb-2">
                <FontAwesome5 name="bed" size={20} color="#64748b" />
            </View>
            <Text className="text-slate-700 font-bold text-xs">Rest Often</Text>
            <Ionicons name="volume-low-outline" size={16} color="#94a3b8" className="mt-1" />
          </View>
        </View>

        {/* Need Help Section */}
        <Text className="text-lg font-bold text-slate-900 mb-4">Need Help?</Text>
        
        <View className="space-y-3 pb-10">
          <TouchableOpacity className="bg-slate-50 p-4 rounded-2xl flex-row items-center border border-slate-100">
            <View className="w-10 h-10 bg-purple-100 rounded-full items-center justify-center mr-4">
               <FontAwesome5 name="user-nurse" size={18} color="#7c3aed" />
            </View>
            <Text className="flex-1 font-bold text-slate-700">Call Health Worker</Text>
            <Feather name="chevron-right" size={20} color="#94a3b8" />
          </TouchableOpacity>

          <TouchableOpacity className="bg-slate-50 p-4 rounded-2xl flex-row items-center border border-slate-100">
            <View className="w-10 h-10 bg-emerald-100 rounded-full items-center justify-center mr-4">
               <MaterialCommunityIcons name="hospital-marker" size={22} color="#059669" />
            </View>
            <Text className="flex-1 font-bold text-slate-700">Nearest Clinic</Text>
            <Feather name="chevron-right" size={20} color="#94a3b8" />
          </TouchableOpacity>

          <TouchableOpacity className="bg-red-50 p-4 rounded-2xl flex-row items-center border border-red-100">
            <View className="w-10 h-10 bg-red-100 rounded-full items-center justify-center mr-4">
               <MaterialCommunityIcons name="alert-octagon" size={22} color="#dc2626" />
            </View>
            <Text className="flex-1 font-bold text-red-600">Emergency SOS</Text>
            <Feather name="chevron-right" size={20} color="#ef4444" />
          </TouchableOpacity>
        </View>

      </ScrollView>
    </View>
  );
};

export default MaternalDash;