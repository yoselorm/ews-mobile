import React, { useState } from 'react';
import {
    View, Text, TouchableOpacity,
    FlatList, Dimensions, Linking, Image, ImageBackground, ActivityIndicator
} from 'react-native';
import { Ionicons, Feather, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { useAudioPlayer } from 'expo-audio';
import { router } from 'expo-router';

const { width } = Dimensions.get('window');
const ALERT_CARD_WIDTH = width * 0.78;
const TIP_CARD_WIDTH = width * 0.72;

// ─── Helpers ───────────────────────────────────────────────────────────────────
const getRiskStyle = (status) => {
    switch (status?.toLowerCase()) {
        case 'critical': return { bg: '#FEF2F2', border: '#FECACA', text: '#DC2626', iconColor: '#DC2626', dotColor: '#EF4444', icon: 'alert-circle' };
        case 'high': return { bg: '#FFF7ED', border: '#FED7AA', text: '#EA580C', iconColor: '#EA580C', dotColor: '#F97316', icon: 'warning' };
        case 'moderate': return { bg: '#FEFCE8', border: '#FEF08A', text: '#CA8A04', iconColor: '#CA8A04', dotColor: '#EAB308', icon: 'shield-outline' };
        case 'low': return { bg: '#F0FDF4', border: '#BBF7D0', text: '#059669', iconColor: '#059669', dotColor: '#10B981', icon: 'checkmark-circle' };
        default: return { bg: '#F8FAFC', border: '#E2E8F0', text: '#64748B', iconColor: '#64748B', dotColor: '#94A3B8', icon: 'notifications' };
    }
};


// ─── Shared audio hook ─────────────────────────────────────────────────────────
const useAudio = () => {
    const [playingId, setPlayingId] = useState(null);
    const player = useAudioPlayer(null);

    const toggleAudio = async (id, url) => {
        if (!url) return;
        try {
            if (playingId === id) {
                await player.pause();
                setPlayingId(null);
                return;
            }
            await player.replace({ uri: url });
            await player.play();
            setPlayingId(id);
            player.addListener('playbackStatusUpdate', (status) => {
                if (status.didJustFinish) setPlayingId(null);
            });
        } catch (e) {
            console.error('Audio error:', e);
        }
    };

    return { playingId, toggleAudio };
};

// ─── Empty horizontal card ─────────────────────────────────────────────────────
const EmptyCard = ({ icon, title, subtitle, cardWidth }) => (
    <View
        style={{ width: cardWidth, backgroundColor: '#F8FAFC', borderColor: '#E2E8F0', borderWidth: 1 }}
        className="rounded-3xl p-8 items-center justify-center mr-3"
    >
        <MaterialCommunityIcons name={icon} size={36} color="#CBD5E1" />
        <Text className="text-slate-700 font-bold text-sm mt-3">{title}</Text>
        {subtitle && <Text className="text-slate-400 text-xs text-center mt-1">{subtitle}</Text>}
    </View>
);

// ─── Climate Alert Card ────────────────────────────────────────────────────────
const AlertCard = ({ item, playingId, toggleAudio }) => {
    const risk = getRiskStyle(item.status);
    const audioId = `alert-${item.label}-${item.parameter}`;
    const isPlaying = playingId === audioId;

    return (
        <View
            style={{ width: ALERT_CARD_WIDTH, backgroundColor: risk.bg, borderColor: risk.border, borderWidth: 1 }}
            className="rounded-3xl p-5 mr-3"
        >
            {/* Header */}
            <View className="flex-row items-start justify-between mb-3">
                <View className="flex-1 mr-3">
                    <View className="flex-row items-center mb-1" style={{ gap: 6 }}>
                        <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: risk.dotColor }} />
                        <Text style={{ color: risk.text }} className="text-[9px] font-black uppercase tracking-[2px]">
                            {item.label}
                        </Text>
                    </View>
                    <Text style={{ color: risk.text }} className="text-lg font-black capitalize">{item.status}</Text>
                    <Text className="text-slate-500 text-xs font-bold mt-0.5 capitalize">{item.parameter?.replace(/_/g, ' ')}</Text>
                </View>
                <Ionicons name={risk.icon} size={36} color={risk.iconColor} />
            </View>

            {/* Value */}
            <View className="flex-row items-baseline mb-3">
                <Text style={{ color: risk.text }} className="text-3xl font-black">{item.triggered_value}</Text>
                <Text style={{ color: risk.text }} className="text-sm font-bold ml-1">{item.unit}</Text>
            </View>

            {/* Community */}
            <View className="flex-row items-center mb-3">
                <Feather name="map-pin" size={11} color="#94A3B8" />
                <Text className="text-slate-400 text-[10px] font-bold ml-1">{item.community_name}</Text>
            </View>

            {/* Description */}
            <Text className="text-slate-600 text-xs leading-4 mb-4" numberOfLines={2}>{item.description}</Text>

            {/* Audio */}
            <TouchableOpacity
                onPress={() => item.audio_url && toggleAudio(audioId, item.audio_url)}
                style={{
                    backgroundColor: isPlaying ? risk.iconColor : 'white',
                    borderColor: risk.border, borderWidth: 1,
                    opacity: item.audio_url ? 1 : 0.5,
                }}
                className="flex-row items-center justify-center py-2.5 rounded-2xl"
                disabled={!item.audio_url}
            >
                <Ionicons
                    name={item.audio_url ? (isPlaying ? 'pause' : 'volume-high') : 'volume-mute-outline'}
                    size={16}
                    color={isPlaying ? 'white' : item.audio_url ? risk.iconColor : '#CBD5E1'}
                />
                <Text
                    style={{ color: isPlaying ? 'white' : item.audio_url ? risk.iconColor : '#CBD5E1' }}
                    className="font-bold text-xs ml-2"
                >
                    {item.audio_url ? (isPlaying ? 'Playing...' : 'Listen') : 'No audio'}
                </Text>
            </TouchableOpacity>
        </View>
    );
};

// ─── Health Tip Card ───────────────────────────────────────────────────────────


const TipCard = ({ item, playingId, toggleAudio, onOpenModal }) => {
    // Standard category config fallback
    const isPlaying = playingId === item.id;
    const hasImage = !!item.image_url;

    // Reuseable Inner UI
    const InnerContent = (
        <View
            className={`p-5 rounded-3xl h-full justify-between ${hasImage ? 'bg-black/40' : ''}`}
            style={{ width: TIP_CARD_WIDTH }}
        >
            <View>
                {/* Header: Icon & Category */}
                <View className="flex-row items-center mb-3" style={{ gap: 10 }}>
                    <View
                        style={{ backgroundColor: hasImage ? 'rgba(255,255,255,0.2)' : 'white' }}
                        className="p-2 rounded-xl shadow-sm"
                    >

                    </View>
                    <Text
                        className={`text-[9px] font-black uppercase tracking-[2px] ${hasImage ? 'text-white' : ''}`}
                    >
                        {item.category?.name}
                    </Text>
                </View>

                {/* Title & Body */}
                <Text
                    className={`font-black text-sm mb-1.5 leading-5 ${hasImage ? 'text-white' : 'text-slate-800'}`}
                    numberOfLines={2}
                >
                    {item.title}
                </Text>
                <Text
                    className={`text-[11px] leading-4 ${hasImage ? 'text-slate-200' : 'text-slate-500'}`}
                    numberOfLines={2}
                >
                    {item.content}
                </Text>
            </View>

            {/* Audio Action Button */}
            <TouchableOpacity
                onPress={() => item.audio_url && toggleAudio(item.id, item.audio_url)}
                style={{
                    backgroundColor: isPlaying ? (hasImage ? 'white' : '') : (hasImage ? 'rgba(255,255,255,0.2)' : 'white'),
                    borderColor: hasImage ? 'transparent' : '#F1F5F9',
                    borderWidth: 1,
                    opacity: item.audio_url ? 1 : 0.5,
                }}
                className="flex-row items-center justify-center py-2.5 rounded-2xl mt-4"
                disabled={!item.audio_url}
            >
                <Ionicons
                    name={item.audio_url ? (isPlaying ? 'stop' : 'play') : 'volume-mute'}
                    size={14}
                    color={isPlaying ? (hasImage ? 'black' : 'white') : (hasImage ? 'white' : '')}
                />
                <Text
                    className="font-black text-[9px] uppercase ml-2 tracking-widest"
                    style={{ color: isPlaying ? (hasImage ? 'black' : 'white') : (hasImage ? 'white' : '') }}
                >
                    {item.audio_url ? (isPlaying ? 'Stop' : 'Listen') : 'No audio'}
                </Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <TouchableOpacity
            activeOpacity={0.9}
            className="mr-4 shadow-sm shadow-slate-300"
            style={{ width: TIP_CARD_WIDTH, height: 220 }}
        >
            {hasImage ? (
                <ImageBackground
                    source={{ uri: item.image_url }}
                    imageStyle={{ borderRadius: 24 }}
                    className="flex-1 overflow-hidden rounded-3xl"
                >
                    {InnerContent}
                </ImageBackground>
            ) : (
                <View
                    className="flex-1 rounded-3xl border border-slate-50 bg-blue-200"
                >
                    {InnerContent}
                </View>
            )}
        </TouchableOpacity>
    );
};

const MaternalDash = ({ data }) => {
    const { user } = useSelector((s) => s.auth);
    const { user: profileUser } = useSelector((s) => s.profile);
    const { playingId, toggleAudio } = useAudio();

    const alerts = data?.climate_alerts || [];
    const tips = data?.health_advice?.health_tips || [];
    const emergency = data?.emergency || {};

    const highestAlert = alerts.map(a => a.horizon == 'current' ? a : null).filter(Boolean)[0] || null;
    const displayAlerts = alerts.filter(a => a.horizon !== 'current');
    const risk = getRiskStyle(highestAlert?.status);

    const handleCall = (number) => {
        if (!number) return;
        Linking.openURL(`tel:${number}`);
    };


    return (
        <View className="flex-1 bg-white">
            <View className="flex-1 px-5">

                {/* ── Header ── */}
                <View className="flex-row justify-between items-center mb-6">
                    <TouchableOpacity onPress={() => router.push('profile')} className="flex-row items-center gap-3">
                        <View className="w-12 h-12 rounded-full bg-slate-200 overflow-hidden border border-slate-100">
                            <Image
                                source={{ uri: profileUser?.avatar_url || user?.avatar_url || 'https://avatar.iran.liara.run/public/job/doctor/male' }}
                                className="w-full h-full"
                            />
                        </View>
                        <View>
                            <Text className="text-slate-900 text-xl font-bold">
                                {user?.first_name || 'User'}
                            </Text>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => router.push('alerts')} className="p-2 bg-slate-50 rounded-full">
                        <Ionicons name="notifications-outline" size={24} color="#64748b" />
                    </TouchableOpacity>
                </View>
                {/* ── Main Banner ── */}
                {highestAlert ? (
                    <View
                        style={{ backgroundColor: risk.bg, borderColor: risk.border, borderWidth: 1 }}
                        className="rounded-[32px] p-6 mb-5"
                    >
                        <View className="flex-row justify-between items-start mb-3">
                            <View className="flex-1 mr-3">
                                <View className="flex-row items-center mb-1" style={{ gap: 6 }}>
                                    <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: risk.dotColor }} />
                                    <Text style={{ color: risk.text }} className="text-[9px] font-black uppercase tracking-[2px]">
                                        Current Status
                                    </Text>
                                </View>
                                <Text style={{ color: risk.text }} className="text-2xl font-black capitalize mb-1">
                                    {highestAlert.status} Risk
                                </Text>
                                <View className="flex-row items-baseline mb-3">
                                    <Text style={{ color: risk.text }} className="text-3xl font-black">{highestAlert.triggered_value}</Text>
                                    <Text style={{ color: risk.text }} className="text-sm font-bold ml-1">{highestAlert.unit}</Text>
                                </View>
                                <Text className="text-slate-600 text-sm leading-5">{highestAlert.description}</Text>
                            </View>
                            <Ionicons name={risk.icon} size={44} color={risk.iconColor} />
                        </View>

                        <View className="flex-row items-center mb-4">
                            <Feather name="map-pin" size={11} color="#94A3B8" />
                            <Text className="text-slate-400 text-[10px] font-bold ml-1">{highestAlert.community_name}</Text>
                        </View>

                        <TouchableOpacity
                            onPress={() => highestAlert.audio_url && toggleAudio('banner', highestAlert.audio_url)}
                            style={{
                                backgroundColor: 'white', borderColor: risk.border, borderWidth: 1,
                                opacity: highestAlert.audio_url ? 1 : 0.5,
                            }}
                            className="flex-row items-center justify-center py-3 rounded-2xl"
                            disabled={!highestAlert.audio_url}
                        >
                            <Ionicons
                                name={highestAlert.audio_url ? (playingId === 'banner' ? 'pause' : 'volume-high') : 'volume-mute-outline'}
                                size={20}
                                color={highestAlert.audio_url ? risk.iconColor : '#CBD5E1'}
                            />
                            <Text style={{ color: highestAlert.audio_url ? risk.iconColor : '#CBD5E1' }} className="font-bold ml-2">
                                {highestAlert.audio_url
                                    ? (playingId === 'banner' ? 'Playing...' : 'Listen to Alert')
                                    : 'No audio available'
                                }
                            </Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View className="bg-emerald-50 rounded-[32px] p-6 mb-5 border border-emerald-100 flex-row items-center">
                        <View className="flex-1">
                            <Text className="text-emerald-700 text-xl font-black mb-1">All Clear 🌿</Text>
                            <Text className="text-slate-500 text-sm">No active climate alerts in your area.</Text>
                        </View>
                        <Ionicons name="checkmark-circle" size={44} color="#10B981" />
                    </View>
                )}

                {/* ── Climate Alerts ── */}
                <View className="mb-5">
                    <View className="flex-row justify-between items-center mb-3">
                        <Text className="text-slate-900 font-bold text-base">Climate Alerts</Text>
                        <Text className="text-slate-400 text-xs font-bold">{displayAlerts?.length} active</Text>
                    </View>
                    <FlatList
                        data={displayAlerts?.length > 0 ? displayAlerts : [{ _empty: true }]}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        keyExtractor={(item, i) => item._empty ? 'empty-alert' : `alert-${i}`}
                        contentContainerStyle={{ paddingRight: 20 }}
                        snapToInterval={ALERT_CARD_WIDTH + 12}
                        decelerationRate="fast"
                        renderItem={({ item }) =>
                            item._empty
                                ? <EmptyCard icon="weather-sunny" title="No Alerts" subtitle="Your area is safe right now" cardWidth={ALERT_CARD_WIDTH} />
                                : <AlertCard item={item} playingId={playingId} toggleAudio={toggleAudio} />
                        }
                    />
                </View>

                {/* ── Health Tips ── */}
                <View className="mb-5">
                    <View className="flex-row justify-between items-center mb-3">
                        <Text className="text-slate-900 font-bold text-base">Health Tips</Text>
                        <Text className="text-slate-400 text-xs font-bold">{tips.length} tips</Text>
                    </View>
                    <FlatList
                        data={tips.length > 0 ? tips : [{ _empty: true }]}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        keyExtractor={(item) => item._empty ? 'empty-tip' : item.id}
                        contentContainerStyle={{ paddingRight: 20 }}
                        snapToInterval={TIP_CARD_WIDTH + 12}
                        decelerationRate="fast"
                        renderItem={({ item }) =>
                            item._empty
                                ? <EmptyCard icon="lightbulb-outline" title="No Tips Yet" subtitle="Check back later for health advice" cardWidth={TIP_CARD_WIDTH} />
                                : <TipCard item={item} playingId={playingId} toggleAudio={toggleAudio} />
                        }
                    />
                </View>

                {/* ── Need Help ── */}
                <Text className="text-lg font-bold text-slate-900 mb-4">Need Help?</Text>

                <View style={{ gap: 12 }} className="pb-10">
                    {/* Health Worker */}
                    <TouchableOpacity
                        onPress={() => handleCall(emergency.health_worker?.phone)}
                        className="bg-slate-50 p-4 rounded-2xl flex-row items-center border border-slate-100"
                    >
                        <View className="w-10 h-10 bg-purple-100 rounded-full items-center justify-center mr-4">
                            <FontAwesome5 name="user-nurse" size={16} color="#7C3AED" />
                        </View>
                        <View className="flex-1">
                            <Text className="font-bold text-slate-700">Call Health Worker</Text>
                            <Text className="text-slate-400 text-xs mt-0.5">
                                {emergency.health_worker?.name || 'Not assigned'}
                            </Text>
                        </View>
                        {emergency.health_worker?.phone
                            ? <View className="flex-row items-center" style={{ gap: 4 }}>
                                <Text className="text-purple-600 text-xs font-bold">{emergency.health_worker.phone}</Text>
                                <Feather name="phone-call" size={13} color="#7C3AED" />
                            </View>
                            : <Text className="text-slate-300 text-xs">No number</Text>
                        }
                    </TouchableOpacity>

                    {/* Care Facility */}
                    <View className="bg-slate-50 p-4 rounded-2xl flex-row items-center border border-slate-100">
                        <View className="w-10 h-10 bg-emerald-100 rounded-full items-center justify-center mr-4">
                            <MaterialCommunityIcons name="hospital-marker" size={20} color="#059669" />
                        </View>
                        <View className="flex-1">
                            <Text className="font-bold text-slate-700">Care Facility</Text>
                            <Text className="text-slate-400 text-xs mt-0.5">{emergency.care_facility || 'Not set'}</Text>
                        </View>
                    </View>

                    {/* SOS */}
                    <TouchableOpacity
                        onPress={() => handleCall(emergency.sos_number)}
                        className="bg-red-50 p-4 rounded-2xl flex-row items-center border border-red-100"
                    >
                        <View className="w-10 h-10 bg-red-100 rounded-full items-center justify-center mr-4">
                            <MaterialCommunityIcons name="alert-octagon" size={20} color="#DC2626" />
                        </View>
                        <View className="flex-1">
                            <Text className="font-bold text-red-600">Emergency SOS</Text>
                            {emergency.sos_number && (
                                <Text className="text-red-400 text-xs mt-0.5">Call {emergency.sos_number}</Text>
                            )}
                        </View>
                        <Feather name="phone-call" size={16} color="#EF4444" />
                    </TouchableOpacity>
                </View>

            </View>
        </View>
    );
};

export default MaternalDash;