import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Stack, Redirect } from 'expo-router';
import { useAuthStore } from '@/shared/store/authStore';
import { syncDelta, processOutbox } from '@/shared/services/syncEngine';

export default function AppLayout() {
  const { isAuthenticated, isInitialized } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      syncDelta();
      processOutbox();
    }
  }, [isAuthenticated]);

  if (!isInitialized) {
    return (
      <View className="flex-1 bg-brand-navy justify-center items-center">
        <ActivityIndicator size="large" color="#2BB673" />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#161E33' },
      }}
    />
  );
}

