import React, { useEffect, useState } from 'react';
import { 
  View, Text, Modal, ScrollView, TouchableOpacity, 
  ActivityIndicator, Image, Dimensions 
} from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { Audio } from 'expo-av'; // Official Expo Audio library
import api from '../services/api';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const ResourceDetailModal = ({ visible, onClose, resourceId, type }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Audio States
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAudioLoading, setIsAudioLoading] = useState(false);

  useEffect(() => {
    if (visible && resourceId) {
      fetchDetails();
    }
    // Cleanup audio when modal closes or resource changes
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [visible, resourceId]);

  const fetchDetails = async () => {
    setLoading(true);
    try {
      const endpoint = type === 'health' 
        ? `/user/health-tips/${resourceId}` 
        : `/user/safety-guides/${resourceId}`;
      const response = await api.get(endpoint);
      setData(response.data.data);
    } catch (error) {
      console.error("Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAudioPlayback = async () => {
    try {
      if (isPlaying) {
        await sound.pauseAsync();
        setIsPlaying(false);
        return;
      }

      if (sound) {
        await sound.playAsync();
        setIsPlaying(true);
        return;
      }

      setIsAudioLoading(true);
      
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
      });

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: data.audio_url },
        { shouldPlay: true },
        (status) => {
          if (status.didJustFinish) setIsPlaying(false);
        }
      );

      setSound(newSound);
      setIsPlaying(true);
      setIsAudioLoading(false);
    } catch (error) {
      console.error("Playback failed", error);
      setIsAudioLoading(false);
    }
  };

  const handleClose = async () => {
    if (sound) {
      await sound.stopAsync();
    }
    onClose();
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={handleClose}
    >
      <View className="flex-1 justify-end bg-black/50">
        <View 
          style={{ height: SCREEN_HEIGHT * 0.9 }} 
          className="bg-white rounded-t-[50px] overflow-hidden"
        >
          {/* Header Action: Close Button Floating */}
          <TouchableOpacity 
            onPress={handleClose} 
            className="absolute top-6 right-6 z-50 bg-black/40 p-2 rounded-full"
          >
            <Ionicons name="close" size={24} color="white" />
          </TouchableOpacity>

          {loading ? (
            <View className="flex-1 justify-center items-center">
              <ActivityIndicator size="large" color="#8b5cf6" />
            </View>
          ) : data ? (
            <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
              
              {/* 1. Feature Image */}
              {data.image_url ? (
                <Image 
                  source={{ uri: data.image_url }} 
                  className="w-full h-80 object-cover"
                />
              ) : (
                <View className="w-full h-32 bg-purple-50" />
              )}

              {/* 2. Content Container (Floating over image) */}
              <View className="p-8 -mt-12 bg-white min-h-screen">
                
                {/* Category & Trimester Badges */}
                <View className="flex-row items-center mb-6">
                  <View className="bg-purple-100 px-4 py-1.5 rounded-xl mr-3">
                    <Text className="text-purple-600 font-black text-[10px] uppercase tracking-widest">
                      {data.category?.name || 'General'}
                    </Text>
                  </View>
                  {data.trimester && (
                    <View className="bg-slate-100 px-4 py-1.5 rounded-xl">
                      <Text className="text-slate-500 font-black text-[10px] uppercase">
                        Trimester {data.trimester}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Title */}
                <Text className="text-3xl font-black text-slate-900 leading-[38px] mb-6">
                  {data.title}
                </Text>

                {/* 3. Global Audio Player Bar */}
                {data.audio_url && (
                  <TouchableOpacity 
                    onPress={handleAudioPlayback}
                    className="bg-slate-900 flex-row items-center p-5 rounded-[32px] mb-8 shadow-xl shadow-slate-200"
                  >
                    <View className="bg-purple-500 p-3 rounded-2xl mr-4">
                      {isAudioLoading ? (
                        <ActivityIndicator size="small" color="white" />
                      ) : (
                        <Ionicons name={isPlaying ? "pause" : "play"} size={20} color="white" />
                      )}
                    </View>
                    <View className="flex-1">
                      <Text className="text-white font-bold text-sm">
                        {isPlaying ? 'Playing Audio...' : `Listen to this ${type}`}
                      </Text>
                      <Text className="text-slate-400 text-[10px] font-black uppercase">
                        Professional Guidance
                      </Text>
                    </View>
                  </TouchableOpacity>
                )}

                {/* 4. Full Content Body */}
                <Text className="text-slate-600 text-lg leading-8 mb-8">
                  {data.content}
                </Text>
                
                {/* Footer Info */}
                <View className="bg-slate-50 p-6 rounded-[32px] border border-slate-100 mb-10">
                   <View className="flex-row items-center mb-2">
                      <Feather name="info" size={16} color="#8b5cf6" />
                      <Text className="ml-2 font-bold text-slate-800">Note</Text>
                   </View>
                   <Text className="text-slate-500 text-sm italic">
                      This information is provided for educational purposes. Consult your healthcare provider for medical advice.
                   </Text>
                </View>

                {/* Extra space for scrolling */}
                <View className="h-20" />
              </View>
            </ScrollView>
          ) : (
            <View className="flex-1 justify-center items-center p-10">
               <Text className="text-slate-400">Content unavailable.</Text>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

export default ResourceDetailModal;