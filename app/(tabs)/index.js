import React, { useEffect } from 'react';
import { View, ActivityIndicator, RefreshControl, ScrollView } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { SafeAreaView } from 'react-native-safe-area-context';

import MaternalDash from '../../components/dashboards/MaternalDash';
import HealthWorkerHome from '../../components/dashboards/HealthWorkerDash';
import AssemblyOfficialHome from '../../components/dashboards/OfficialDash';

// Import our new slice action
import { fetchHomeData } from '../../store/slices/homeSlice';
import { ToastProvider } from '../../components/Toast';

export default function HomeTab() {
  const dispatch = useDispatch();
  
  // Pull auth for the user role and home for the actual dashboard data
  const { user, loading: authLoading } = useSelector((state) => state.auth);
  const { data, loading: homeLoading } = useSelector((state) => state.home);

  // 1. Initial Data Fetch
  useEffect(() => {
    dispatch(fetchHomeData());
  }, [dispatch]);

  // 2. Refresh Handler (Optional but recommended for mobile)
  const onRefresh = () => {
    dispatch(fetchHomeData());
  };

  // 3. Handle Initial Global Loading
  if (authLoading || (homeLoading && !data)) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#7C3AED" />
      </View>
    );
  }

  const renderDashboard = () => {
    switch (user?.role) {
      case 'health_worker':
        return <HealthWorkerHome data={data} />;
      case 'pregnant_woman':
      case 'lactating_mother':
        return <MaternalDash data={data} />;
      case 'assembly_official':
        return <AssemblyOfficialHome data={data} />;
      default:
        return <MaternalDash data={data} />;
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <ScrollView 
        contentContainerStyle={{ flexGrow: 1 }}
        refreshControl={
          <RefreshControl refreshing={homeLoading} onRefresh={onRefresh} tintColor="#7C3AED" />
        }
      >
        {renderDashboard()}
      </ScrollView>

       <ToastProvider />
    </SafeAreaView>
  );
}