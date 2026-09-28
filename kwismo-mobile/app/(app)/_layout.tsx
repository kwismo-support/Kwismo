import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { View, ActivityIndicator, AppState, AppStateStatus } from 'react-native';
import { Stack, Redirect, usePathname } from 'expo-router';
import { useAuthStore } from '@/shared/store/authStore';
import { useNavAnimationStore } from '@/shared/store/navAnimationStore';
import { useAppTheme } from '@/shared/hooks/useAppTheme';
import { syncDelta, processOutbox } from '@/shared/services/syncEngine';
import { permissionManager } from '@/shared/services/permissionManager';
import { GlobalPermissionGuardModal } from '@/shared/components/GlobalPermissionGuardModal';
import { TabBar } from '@/shared/components/TabBar';
import { callListenerService } from '@/features/call-detection/services/callListenerService';
import { colors } from '@/styles/tokens';

export default function AppLayout() {
  const { isAuthenticated, isInitialized } = useAuthStore();
  const { isDark } = useAppTheme();
  const { stackAnimation } = useNavAnimationStore();
  const pathname = usePathname();
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [missingPermissions, setMissingPermissions] = useState<string[]>([]);

  const isMainTab = useMemo(() => {
    const cleanPath = pathname ? pathname.replace(/\/$/, '') : '';
    return (
      cleanPath === '' ||
      cleanPath === '/' ||
      cleanPath === '/(app)' ||
      cleanPath === '/(app)/index' ||
      cleanPath.endsWith('/management') ||
      cleanPath.endsWith('/transfer') ||
      cleanPath.endsWith('/profile')
    );
  }, [pathname]);

  const refreshPermissions = useCallback(async () => {
    const res = await permissionManager.checkPermissions();
    setMissingPermissions(res.missingPermissions);
    if (!res.hasAll && res.missingPermissions.length > 0) {
      setShowPermissionModal(true);
    } else {
      setShowPermissionModal(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      syncDelta();
      processOutbox();
      callListenerService.initListener();
      refreshPermissions();

      const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
        if (nextAppState === 'active') {
          refreshPermissions();
        }
      });

      return () => {
        subscription.remove();
      };
    }
  }, [isAuthenticated, refreshPermissions]);

  const handleGrantPermissions = async () => {
    const res = await permissionManager.requestAllPermissions();
    setMissingPermissions(res.missingPermissions);
    if (res.hasAll || res.missingPermissions.length === 0) {
      setShowPermissionModal(false);
    } else {
      setShowPermissionModal(true);
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
    <View style={{ flex: 1, backgroundColor: isDark ? '#0F1626' : '#FFFFFF' }}>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: stackAnimation,
          gestureEnabled: true,
          fullScreenGestureEnabled: true,
          animationDuration: 200,
          contentStyle: {
            backgroundColor: isDark ? '#0F1626' : '#FFFFFF',
          },
        }}
      />
      {isMainTab && <TabBar />}
      <GlobalPermissionGuardModal
        visible={showPermissionModal}
        missingPermissions={missingPermissions}
        onGrant={handleGrantPermissions}
        onDismiss={() => setShowPermissionModal(false)}
      />
    </View>
  );
}
