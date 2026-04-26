import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, ActivityIndicator,
  TouchableOpacity, RefreshControl, ImageBackground
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { fetchHealthTips, fetchSafetyGuides } from '../../store/slices/contentSlice';
import ResourceDetailModal from '../../components/ResourceDetailModal';

const ContentPage = () => {
  const dispatch = useDispatch();
  const { healthTips, safetyGuides, loading, meta } = useSelector((state) => state.content);

  const [activeTab, setActiveTab] = useState('safety');
  const [page, setPage] = useState(1);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Audio States
  const [sound, setSound] = useState(null);
  const [playingId, setPlayingId] = useState(null);
  const [isAudioLoading, setIsAudioLoading] = useState(false);

  const [selectedResource, setSelectedResource] = useState({ id: null, visible: false });

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  // Initial data load
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
    if (!loading && currentMeta && currentMeta.current_page < currentMeta.last_page) {
      const nextPage = page + 1;
      setPage(nextPage);
      const action = activeTab === 'health' ? fetchHealthTips : fetchSafetyGuides;
      dispatch(action({ page: nextPage }));
    }
  };

  const handleAudioPress = async (url, id) => {
    try {
      if (playingId === id && sound) {
        await sound.stopAsync();
        setPlayingId(null);
        return;
      }

      if (sound) {
        await sound.unloadAsync();
      }

      setIsAudioLoading(true);
      setPlayingId(id);

      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
      });

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: url },
        { shouldPlay: true },
        (status) => {
          if (status.didJustFinish) setPlayingId(null);
        }
      );

      setSound(newSound);
      setIsAudioLoading(false);
    } catch (error) {
      console.error("Audio Error:", error);
      setIsAudioLoading(false);
      setPlayingId(null);
    }
  };

  const renderItem = ({ item }) => {
    const isThisItemLoading = isAudioLoading && playingId === item.id;
    const isThisItemPlaying = !isAudioLoading && playingId === item.id;
    const hasImage = !!item.image_url;

    // Card Inner Content
    const Content = (
   <TouchableOpacity
      onPress={() => setSelectedResource({ id: item.id, visible: true })}
     >
   <View className={`p-5 rounded-[32px] border ${hasImage ? 'bg-black/40 border-transparent' : 'bg-white border-slate-100 shadow-sm shadow-slate-200'}`}>
        <View className="flex-row items-center mb-3">
          <View className={`p-2 rounded-xl mr-3 ${hasImage ? 'bg-white/20' : 'bg-purple-50'}`}>
            <Ionicons
              name={activeTab === 'health' ? "heart" : "shield-checkmark"}
              size={18}
              color={hasImage ? "white" : "#8b5cf6"}
            />
          </View>
          <Text className={`text-[10px] font-black uppercase tracking-widest ${hasImage ? 'text-slate-100' : 'text-purple-600'}`}>
            {item.category?.name || item.category_name || 'General'}
          </Text>
        </View>

        <Text className={`text-lg font-black mb-2 leading-6 ${hasImage ? 'text-white' : 'text-slate-900'}`}>
          {item.title}
        </Text>

        <Text className={`text-sm leading-5 mb-4 ${hasImage ? 'text-slate-200' : 'text-slate-500'}`} numberOfLines={3}>
          {item.content}
        </Text>

        <View className="flex-row justify-between items-center">
          {item.audio_url && (
            <TouchableOpacity
              onPress={() => handleAudioPress(item.audio_url, item.id)}
              disabled={isAudioLoading && playingId !== item.id}
              className={`flex-row items-center px-4 py-2 rounded-full ${isThisItemPlaying ? 'bg-purple-600' : (hasImage ? 'bg-white' : 'bg-slate-900')
                }`}
            >
              {isThisItemLoading ? (
                <ActivityIndicator size="small" color={hasImage ? "#8b5cf6" : "white"} />
              ) : (
                <Ionicons
                  name={isThisItemPlaying ? "stop" : "play"}
                  size={12}
                  color={isThisItemPlaying ? "white" : (hasImage ? "black" : "white")}
                />
              )}
              <Text className={`text-[10px] font-bold ml-2 ${isThisItemPlaying ? 'text-white' : (hasImage ? 'text-black' : 'text-white')
                }`}>
                {isThisItemLoading ? 'Loading...' : isThisItemPlaying ? 'Stop Audio' : 'Listen to Tip'}
              </Text>
            </TouchableOpacity>
          )}

          {activeTab === 'health' && item.trimester && (
            <View className={`px-3 py-1 rounded-lg ${hasImage ? 'bg-white/20' : 'bg-slate-50'}`}>
              <Text className={`text-[9px] font-black uppercase ${hasImage ? 'text-white' : 'text-slate-400'}`}>
                Trimester {item.trimester}
              </Text>
            </View>
          )}
        </View>
      </View>
        
      </TouchableOpacity>
    );

    if (hasImage) {
      return (
        <ImageBackground
          source={{ uri: item.image_url }}
          imageStyle={{ borderRadius: 32 }}
          className="mb-4 overflow-hidden rounded-[32px]"
        >
          {Content}
        </ImageBackground>
      );
    }

    return <View className="mb-4">{Content}</View>;
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={['top']}>
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
        onEndReached={fetchMore}
        onEndReachedThreshold={0.5}
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


      <ResourceDetailModal
        visible={selectedResource.visible}
        resourceId={selectedResource.id}
        type={activeTab}
        onClose={() => setSelectedResource({ id: null, visible: false })}
      />
    </SafeAreaView>
  );
};

export default ContentPage;