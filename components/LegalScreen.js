import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';


const LegalScreen = ({ title, lastUpdated, sections }) => {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      {/* Header */}
      <View className="px-5 pt-2 pb-4 flex-row items-center border-b border-slate-100">
        <TouchableOpacity
          onPress={() => router.back()}
          className="p-2 -ml-2 mr-2 rounded-xl active:bg-slate-50"
        >
          <Ionicons name="chevron-back" size={22} color="#1e293b" />
        </TouchableOpacity>
        <View className="flex-1">
          <Text className="text-lg font-black text-slate-900">{title}</Text>
          {lastUpdated && (
            <Text className="text-xs text-slate-400 font-medium mt-0.5">
              Last updated: {lastUpdated}
            </Text>
          )}
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 20, paddingBottom: 60 }}
      >
        {sections.map((section, i) => (
          <View key={i} className="mb-6">
            <Text className="text-sm font-black text-purple-700 uppercase tracking-wide mb-2">
              {section.heading}
            </Text>
            {section.body.map((paragraph, j) => (
              <Text
                key={j}
                className="text-sm text-slate-600 leading-6 mb-2.5"
              >
                {paragraph}
              </Text>
            ))}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

export default LegalScreen;