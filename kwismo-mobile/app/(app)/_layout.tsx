import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Stack, Redirect } from 'expo-router';
import { useAuthStore } from '@/shared/store/authStore';
import { useNavAnimationStore } from '@/shared/store/navAnimationStore';
import { useAppTheme } from '@/shared/hooks/useAppTheme';
import { syncDelta, processOutbox } from '@/shared/services/syncEngine';

import { colors } from '@/styles/tokens';

export default function AppLayout() {
  const { isAuthenticated, isInitialized } = useAuthStore();
  const { isDark } = useAppTheme();
  const { stackAnimation } = useNavAnimationStore();

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
        animation: stackAnimation,
        contentStyle: {
          backgroundColor: isDark ? '#0F1626' : '#FFFFFF',
        },
      }}
    />
  );
}
