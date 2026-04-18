import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, RefreshControl, ActivityIndicator } from 'react-native';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { Audio } from 'expo-av';
import { fetchUserAlerts, markAlertAsRead, markAllAlertsAsRead } from '../../store/slices/alertSlice';
import toast from '../../components/Toast';

const AlertPage = () => {
  const dispatch = useDispatch();
  const { alerts, loading, unreadCount } = useSelector((state) => state.alerts);

  const [sound, setSound] = useState(null);
  const [playingId, setPlayingId] = useState(null);

  useEffect(() => {
    loadAlerts();
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, []);

  const loadAlerts = () => {
    dispatch(fetchUserAlerts());
  };

  const handlePlayAudio = async (item) => {
    const audioUrl = item.alert.audio_url;
    if (!audioUrl) return;

    try {
      // Toggle stop if clicking the same audio
      if (playingId === item.id && sound) {
        await sound.stopAsync();
        setPlayingId(null);
        return;
      }

      // Stop any existing sound
      if (sound) {
        await sound.unloadAsync();
      }

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: audioUrl },
        { shouldPlay: true }
      );

      setSound(newSound);
      setPlayingId(item.id);

      newSound.setOnPlaybackStatusUpdate(async (status) => {
        if (status.didJustFinish) {
          setPlayingId(null);
          // Requirement: Mark as read only after listening
          if (!item.is_read) {
            handleReadAlert(item.id);
          }
        }
      });
    } catch (error) {
      toast.error("Error playing audio", "error");
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await dispatch(markAllAlertsAsRead()).unwrap();
      toast.success("All alerts marked as read", "success");
    } catch (err) {
      toast.error(err || "Failed to update alerts", "error");
    }
  };

  const handleReadAlert = async (id) => {
    try {
      await dispatch(markAlertAsRead(id)).unwrap();
    } catch (err) {
      toast.error(err || "Failed to update alert", "error");
      console.error("Error marking alert as read:", err);
    }
  };

  const getRiskStyles = (risk) => {
    switch (risk?.toLowerCase()) {
      case 'critical':
        return { color: '#ef4444', bg: 'bg-red-50', icon: 'alert-circle' };
      case 'high':
        return { color: '#ad0591', bg: 'bg-pink-50', icon: 'warning' };
      case 'moderate':
        return { color: '#eab308', bg: 'bg-yellow-50', icon: 'shield-outline' };
      case 'low':
        return { color: '#10b981', bg: 'bg-emerald-50', icon: 'checkmark-circle' };
      default:
        return { color: '#8b5cf6', bg: 'bg-purple-50', icon: 'notifications' };
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#7C3AED" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      {/* Header */}
      <View className="px-5 pt-2 pb-4 flex-row justify-between items-center border-b border-slate-50">
        <View>
          <Text className="text-2xl font-black text-slate-900 tracking-tight">Notifications</Text>
          {unreadCount > 0 && (
            <View className="flex-row items-center mt-0.5">
              <View className="w-1.5 h-1.5 rounded-full bg-purple-600 mr-1.5" />
              <Text className="text-slate-500 text-[11px] font-bold uppercase tracking-wider">{unreadCount} New</Text>
            </View>
          )}
        </View>

        {unreadCount > 0 && (
          <TouchableOpacity onPress={handleMarkAllRead} className="bg-purple-50 px-4 py-2 rounded-2xl border border-purple-100">
            <Text className="text-purple-700 font-bold text-xs">Mark all read</Text>
          </TouchableOpacity>
        )}
      </View>

      <View className="flex-1">
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 20, paddingTop: 20, paddingBottom: 100 }}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={loadAlerts} tintColor="#8b5cf6" />}
        >
          {alerts.length > 0 ? (
            alerts.map((item) => {
              const { alert } = item;
              const risk = getRiskStyles(alert.risk_level);
              const isPlaying = playingId === item.id;

              return (
                <View
                  key={item.id}
                  className={`p-5 rounded-[30px] mb-4 border ${item.is_read ? 'bg-white border-slate-100' : 'bg-slate-50 border-purple-100 shadow-sm shadow-purple-100'
                    }`}
                >
                  <View className="flex-row items-start">
                    {/* Icon */}
                    <View className={`w-12 h-12 rounded-2xl ${risk.bg} items-center justify-center mr-4`}>
                      <Ionicons name={risk.icon} size={22} color={risk.color} />
                    </View>

                    {/* Content */}
                    <View className="flex-1">
                      <View className="flex-row justify-between items-center mb-1">
                        <Text className={`text-sm flex-1 font-bold ${item.is_read ? 'text-slate-500' : 'text-slate-900'}`}>
                          {alert.title}
                        </Text>
                        {!item.is_read && <View className="w-2 h-2 rounded-full bg-purple-600" />}
                      </View>

                      <Text className="text-slate-500 text-xs leading-4 mb-3">{alert.message}</Text>

                      <View className="flex-row items-center justify-between">
                        <View className="flex-row items-center gap-x-3">
                          {/* Risk Level Badge */}
                          <View className={`${risk.bg} px-2 py-0.5 rounded-md border border-white`}>
                            <Text style={{ color: risk.color }} className="text-[9px] font-black uppercase tracking-tighter">
                              {alert.risk_level}
                            </Text>
                          </View>

                          {/* Time Horizon */}
                          <View className="flex-row items-center">
                            <Feather name="clock" size={10} color="#94a3b8" />
                            <Text className="text-slate-400 text-[10px] font-bold ml-1 uppercase tracking-tighter">
                              {alert.horizon}
                            </Text>
                          </View>
                        </View>

                        {/* Audio Control */}
                        {alert.audio_url && (
                          <TouchableOpacity
                            onPress={() => handlePlayAudio(item)}
                            className={`flex-row items-center px-4 py-2 rounded-full ${isPlaying ? 'bg-purple-600' : 'bg-white border border-slate-200'}`}
                          >
                            <Ionicons
                              name={isPlaying ? "pause" : "play"}
                              size={14}
                              color={isPlaying ? "white" : "#8b5cf6"}
                            />
                            <Text className={`text-[10px] font-bold ml-1 ${isPlaying ? 'text-white' : 'text-purple-600'}`}>
                              {isPlaying ? "Playing..." : "Listen"}
                            </Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                  </View>
                </View>
              );
            })
          ) : (
            <View className="flex-1 items-center justify-center -mt-10">
              <MaterialCommunityIcons name="bell-off-outline" size={48} color="#cbd5e1" />
              <Text className="text-slate-900 font-bold text-lg mt-6">All caught up</Text>
            </View>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default AlertPage;