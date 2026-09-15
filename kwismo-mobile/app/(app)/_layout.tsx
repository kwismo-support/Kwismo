import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Stack, Redirect } from 'expo-router';
import { useAuthStore } from '@/shared/store/authStore';
import { syncDelta, processOutbox } from '@/shared/services/syncEngine';

import { colors } from '@/styles/tokens';

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
      <View className="flex-1 bg-slate-50 dark:bg-brand-darkBg justify-center items-center">
        <ActivityIndicator size="large" color={colors.green} />
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
      }}
    />
  );
}
