import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Image, Alert, Linking, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSelector } from 'react-redux';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../../services/api';

const PatientProfile = () => {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [patient, setPatient] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPatient = async () => {
            try {
                setLoading(true);
                const response = await api.get(`/user/patients/${id}`);
                setPatient(response.data.data);
            } catch (error) {
                console.error("Fetch Patient Error:", error);
                Alert.alert("Error", "Could not retrieve patient details.");
            } finally {
                setLoading(false);
            }
        };
        if (id) fetchPatient();
    }, [id]);

    const handleCall = (phoneNumber) => {
        if (!phoneNumber) return Alert.alert("Error", "No phone number available");
        Linking.openURL(`tel:${phoneNumber}`);
    };

    const getRiskStyles = (risk) => {
        switch (risk?.toLowerCase()) {
            case 'critical':
                return { bg: 'bg-red-50', text: 'text-red-600', icon: 'alert-circle', tint: '#dc2626' };
            case 'high':
                return { bg: 'bg-pink-50', text: 'text-pink-600', icon: 'warning', tint: '#db2777' };
            case 'warning':
            case 'moderate':
                return { bg: 'bg-amber-50', text: 'text-amber-600', icon: 'warning', tint: '#d97706' };
            default:
                return { bg: 'bg-emerald-50', text: 'text-emerald-600', icon: 'checkmark-circle', tint: '#059669' };
        }
    };

    if (loading) {
        return (
            <View className="flex-1 items-center justify-center bg-white">
                <ActivityIndicator size="large" color="#7C3AED" />
            </View>
        );
    }

    const calculateAge = (dobString) => {
  if (!dobString) return "N/A";
  
  const birthday = new Date(dobString);
  const today = new Date();
  
  let age = today.getFullYear() - birthday.getFullYear();
  const monthDifference = today.getMonth() - birthday.getMonth();
  
  // Adjust if the birthday hasn't happened yet this year
  if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthday.getDate())) {
    age--;
  }
  
  return `${age}y`;
};

    const risk = getRiskStyles(patient?.risk_level);

    return (
        <SafeAreaView className="flex-1 bg-slate-50" edges={['top']}>
            {/* Custom Modern Header */}
            <View className="px-6 flex-row items-center justify-between py-4 bg-white border-b border-slate-100">
                <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 bg-slate-50 items-center justify-center rounded-2xl">
                    <Feather name="arrow-left" size={20} color="#1e293b" />
                </TouchableOpacity>
                <Text className="text-base font-bold text-slate-900 tracking-tight">Patient Overview</Text>
                <TouchableOpacity className="w-10 h-10 bg-slate-50 items-center justify-center rounded-2xl">
                    {/* <Feather name="edit-3" size={18} color="#1e293b" /> */}
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
                {/* Hero Section */}
                <View className="bg-white px-6 pb-8 pt-6 rounded-b-[40px] shadow-sm shadow-slate-200">
                    <View className="flex-row items-center">
                        <View className="w-20 h-20 rounded-3xl bg-purple-100 items-center justify-center overflow-hidden border-2 border-white shadow-md">
                            {patient?.avatar_url ? (
                                <Image source={{ uri: patient.avatar_url }} className="w-full h-full" />
                            ) : (
                                <Text className="text-purple-600 font-bold text-2xl">{patient?.name?.[0]}</Text>
                            )}
                        </View>
                        <View className="ml-4 flex-1">
                            <Text className="text-xl font-bold text-slate-900">{patient?.name}</Text>
                            <Text className="text-slate-500 font-medium text-xs mb-2">ID: {id?.slice(-8).toUpperCase()}</Text>
                            <View className={`${risk.bg} self-start px-3 py-1 rounded-lg flex-row items-center`}>
                                <Ionicons name={risk.icon} size={12} color={risk.tint} />
                                <Text className={`ml-1 ${risk.text} text-[10px] font-black uppercase tracking-tighter`}>
                                    {patient?.risk_level} Risk
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* Quick Action Buttons */}
                    <View className="flex-row gap-3 mt-6">
                        <TouchableOpacity 
                            onPress={() => handleCall(patient?.phone_number)}
                            className="flex-1 bg-slate-900 flex-row items-center justify-center h-12 rounded-2xl shadow-lg shadow-slate-300"
                        >
                            <Feather name="phone" size={16} color="white" />
                            <Text className="text-white font-bold ml-2 text-sm">Call Now</Text>
                        </TouchableOpacity>
                        {/* <TouchableOpacity className="flex-1 bg-purple-600 flex-row items-center justify-center h-12 rounded-2xl shadow-lg shadow-purple-300">
                            <Feather name="message-circle" size={16} color="white" />
                            <Text className="text-white font-bold ml-2 text-sm">Message</Text>
                        </TouchableOpacity> */}
                    </View>
                </View>

                {/* Patient Vitals/Stats Row */}
                <View className="flex-row justify-between px-6 -mt-4">
                    <StatCard label="Age" value={calculateAge(patient?.dob)} icon="calendar" />
                    <StatCard label="Status" value="Active" icon="activity" color="#10b981" />
                    <StatCard label="Role" value={patient?.role === 'pregnant_woman' ? 'Pregnant' : 'Lactating'} icon="user" />
                </View>

                {/* Detailed Information Section */}
                <View className="px-6 mt-6">
                    <View className="bg-white rounded-[32px] p-6 border border-slate-100 shadow-sm shadow-slate-100">
                        <Text className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-4">Contact & Demographics</Text>
                        
                        <InfoRow 
                            icon="phone" 
                            label="Phone Number" 
                            value={patient?.phone_number} 
                            onPress={() => handleCall(patient?.phone_number)}
                            isLink
                        />
                        <InfoRow icon="map-pin" label="Community" value={patient?.community} />
                        <InfoRow icon="mail" label="Email" value={patient?.email} />
                        <InfoRow icon="calendar" label="Date of Birth" value={patient?.dob} />
                        <InfoRow icon="users" label="Gender" value={patient?.gender} last />
                    </View>
                </View>

                <View className="h-10" />
            </ScrollView>
        </SafeAreaView>
    );
};

// Sub-component for Mini Stats
const StatCard = ({ label, value, icon, color = "#6366f1" }) => (
    <View className="bg-white w-[30%] p-3 rounded-2xl border border-slate-100 shadow-sm items-center">
        <Feather name={icon} size={14} color={color} />
        <Text className="text-slate-900 font-bold mt-1 text-xs">{value}</Text>
        <Text className="text-slate-400 text-[9px] font-medium">{label}</Text>
    </View>
);

// Sub-component for Detailed Rows
const InfoRow = ({ icon, label, value, last, onPress, isLink }) => (
    <TouchableOpacity 
        disabled={!onPress} 
        onPress={onPress}
        className={`flex-row items-center py-4 ${!last ? 'border-b border-slate-50' : ''}`}
    >
        <View className="w-10 h-10 bg-slate-50 rounded-xl items-center justify-center mr-4">
            <Feather name={icon} size={18} color="#64748b" />
        </View>
        <View className="flex-1">
            <Text className="text-slate-400 text-[9px] font-bold uppercase tracking-tight">{label}</Text>
            <Text className={`font-bold text-sm ${isLink ? 'text-purple-600 underline' : 'text-slate-900'}`}>
                {value || 'Not provided'}
            </Text>
        </View>
        {isLink && <Feather name="external-link" size={12} color="#9333ea" />}
    </TouchableOpacity>
);

export default PatientProfile;