import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons, Feather } from '@expo/vector-icons';
import { fetchHealthTips, fetchSafetyGuides } from '../../store/slices/contentSlice';

const ContentPage = () => {
  const dispatch = useDispatch();
  const { healthTips, safetyGuides, loading, meta } = useSelector((state) => state.content);

  const [activeTab, setActiveTab] = useState('safety'); // 'health' or 'safety'
  const [page, setPage] = useState(1);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, [activeTab]);

  const loadInitialData = () => {
    setPage(1);
    const action = activeTab === 'health' ? fetchHealthTips : fetchSafetyGuides;
    dispatch(action({ page: 1 }));
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setPage(1);
    const action = activeTab === 'health' ? fetchHealthTips : fetchSafetyGuides;
    await dispatch(action({ page: 1 })).unwrap();
    setIsRefreshing(false);
  };

  const fetchMore = () => {
    const currentMeta = activeTab === 'health' ? meta.healthTips : meta.safetyGuides;

    // Only fetch if there is a next page and we aren't already loading
    if (!loading && currentMeta && currentMeta.current_page < currentMeta.last_page) {
      const nextPage = page + 1;
      setPage(nextPage);
      const action = activeTab === 'health' ? fetchHealthTips : fetchSafetyGuides;
      dispatch(action({ page: nextPage }));
    }
  };



  const renderItem = ({ item }) => (
    <View className="bg-white p-5 rounded-[32px] mb-4 border border-slate-100 shadow-sm shadow-slate-200">
      <View className="flex-row items-center mb-3">
        <View className="bg-purple-50 p-2 rounded-xl mr-3">
          <Ionicons
            name={activeTab === 'health' ? "heart" : "shield-checkmark"}
            size={18}
            color="#8b5cf6"
          />
        </View>
        <Text className="text-[10px] font-black text-purple-600 uppercase tracking-widest">
          {item.category?.name || item.category_name || 'General'}        </Text>
      </View>

      <Text className="text-lg font-black text-slate-900 mb-2 leading-6">
        {item.title}
      </Text>

      <Text className="text-slate-500 text-sm leading-5 mb-4" numberOfLines={3}>
        {item.content}
      </Text>

      <View className="flex-row justify-between items-center">
        {item.audio_url && (
          <TouchableOpacity className="flex-row items-center bg-slate-900 px-4 py-2 rounded-full">
            <Ionicons name="play" size={12} color="white" />
            <Text className="text-white text-[10px] font-bold ml-2">Listen to Tip</Text>
          </TouchableOpacity>
        )}
        {activeTab === 'health' && item.trimester && (
          <View className="bg-slate-50 px-3 py-1 rounded-lg">
            <Text className="text-slate-400 text-[9px] font-black uppercase">Trimester {item.trimester}</Text>
          </View>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={['top']}>
      {/* Header & Tab Switcher */}
      <View className="px-5 pt-4 pb-6 bg-white border-b border-slate-100">
        <Text className="text-2xl font-black text-slate-900 tracking-tight mb-6">Resources</Text>

        <View className="flex-row bg-slate-100 p-1.5 rounded-[24px]">
             <TouchableOpacity
            onPress={() => setActiveTab('safety')}
            className={`flex-1 py-3 rounded-[20px] items-center ${activeTab === 'safety' ? 'bg-white shadow-sm' : ''}`}
          >
            <Text className={`font-black text-xs uppercase tracking-widest ${activeTab === 'safety' ? 'text-slate-900' : 'text-slate-400'}`}>Safety Guides</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActiveTab('health')}
            className={`flex-1 py-3 rounded-[20px] items-center ${activeTab === 'health' ? 'bg-white shadow-sm' : ''}`}
          >
            <Text className={`font-black text-xs uppercase tracking-widest ${activeTab === 'health' ? 'text-slate-900' : 'text-slate-400'}`}>Health Tips</Text>
          </TouchableOpacity>
       
        </View>
      </View>

      <FlatList
        data={activeTab === 'health' ? healthTips : safetyGuides}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}

        // --- Infinite Scroll Logic ---
        onEndReached={fetchMore}
        onEndReachedThreshold={0.5} // Trigger when user is halfway through the last item

        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor="#8b5cf6" />
        }
        ListFooterComponent={() => (
          loading && page > 1 ? (
            <View className="py-10">
              <ActivityIndicator color="#8b5cf6" />
            </View>
          ) : <View className="h-10" />
        )}
      />
    </SafeAreaView>
  );
};

export default ContentPage;