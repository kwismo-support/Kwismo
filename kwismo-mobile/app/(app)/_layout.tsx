import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Stack, Redirect } from 'expo-router';
import { useAuthStore } from '@/shared/store/authStore';
import { useNavAnimationStore } from '@/shared/store/navAnimationStore';
import { useAppTheme } from '@/shared/hooks/useAppTheme';
import { syncDelta, processOutbox } from '@/shared/services/syncEngine';
import { permissionManager } from '@/shared/services/permissionManager';
import { GlobalPermissionGuardModal } from '@/shared/components/GlobalPermissionGuardModal';
import { callListenerService } from '@/features/call-detection/services/callListenerService';
import { colors } from '@/styles/tokens';

export default function AppLayout() {
  const { isAuthenticated, isInitialized } = useAuthStore();
  const { isDark } = useAppTheme();
  const { stackAnimation } = useNavAnimationStore();
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [missingPermissionCount, setMissingPermissionCount] = useState(0);

  useEffect(() => {
    if (isAuthenticated) {
      syncDelta();
      processOutbox();
      callListenerService.initListener();

      permissionManager.checkPermissions().then((res) => {
        if (!res.hasAll) {
          setMissingPermissionCount(res.missingPermissions.length);
          setShowPermissionModal(true);
        }
      });
    }
  }, [isAuthenticated]);

  const handleGrantPermissions = async () => {
    const res = await permissionManager.requestAllPermissions();
    if (res.hasAll) {
      setShowPermissionModal(false);
    } else {
      setMissingPermissionCount(res.missingPermissions.length);
    }
  };

  if (!isInitialized) {
    return (
      <View className="flex-1 bg-white dark:bg-brand-darkBg justify-center items-center">
        <ActivityIndicator size="large" color={colors.green} />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: stackAnimation,
          contentStyle: {
            backgroundColor: isDark ? '#0F1626' : '#FFFFFF',
          },
        }}
      />
      <GlobalPermissionGuardModal
        visible={showPermissionModal}
        missingCount={missingPermissionCount}
        onGrant={handleGrantPermissions}
        onDismiss={() => setShowPermissionModal(false)}
      />
    </>
  );
}
