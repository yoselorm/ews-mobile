import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useSelector } from 'react-redux';

import MaternalDash from '../../components/dashboards/MaternalDash';
import { SafeAreaView } from 'react-native-safe-area-context';
import HealthWorkerHome from '../../components/dashboards/HealthWorkerDash';
import AssemblyOfficialHome from '../../components/dashboards/OfficialDash';

export default function HomeTab() {
  // Pull user data and loading status from your authSlice
  const { user, loading } = useSelector((state) => state.auth);

  // 1. Handle Loading State 
  // Useful for when the app is checking the persisted token on startup
  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#7C3AED" />
      </View>
    );
  }


  const renderDashboard = () => {
    switch (user?.role) {
      case 'health_worker':
        return <HealthWorkerHome />;
      case 'pregnant_woman':
      case 'lactating_mother':
        return <MaternalDash />;
      case 'assembly_official':
        return <AssemblyOfficialHome />;
      default:
        return <MaternalDash />;
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {renderDashboard()}
    </SafeAreaView>
  );
}