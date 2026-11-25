import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { View, ActivityIndicator, AppState, AppStateStatus } from 'react-native';
import { Stack, Redirect, usePathname, useRouter } from 'expo-router';
import { useAuthStore } from '@/shared/store/authStore';
import { useNavAnimationStore } from '@/shared/store/navAnimationStore';
import { useAppTheme } from '@/shared/hooks/useAppTheme';
import { syncDelta, processOutbox } from '@/shared/services/syncEngine';
import { permissionManager } from '@/shared/services/permissionManager';
import { GlobalPermissionGuardModal } from '@/shared/components/GlobalPermissionGuardModal';
import { TabBar } from '@/shared/components/TabBar';
import { callListenerService } from '@/features/call-detection/services/callListenerService';
import { PostCallPromptModal } from '@/features/reports/components/PostCallPromptModal';
import { usePostCallStore } from '@/features/call-detection/store/postCallStore';
import { colors } from '@/styles/tokens';
import { storage } from '@/shared/services/storage';

export default function AppLayout() {
  const router = useRouter();
  const { isAuthenticated, isInitialized } = useAuthStore();
  const { isDark } = useAppTheme();
  const { stackAnimation } = useNavAnimationStore();
  const pathname = usePathname();
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [missingPermissions, setMissingPermissions] = useState<string[]>([]);
  const [dismissedGuard, setDismissedGuard] = useState(false);

  const { visible: postCallVisible, phoneNumber: postCallPhone, hidePostCallPrompt } = usePostCallStore();

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
    const isDismissed = await storage.getItem('kwismo_perm_guard_dismissed');
    const res = await permissionManager.checkPermissions();
    setMissingPermissions(res.missingPermissions);
    if (res.hasAll || res.missingPermissions.length === 0 || isDismissed === 'true' || dismissedGuard) {
      setShowPermissionModal(false);
    } else {
      setShowPermissionModal(true);
    }
  }, [dismissedGuard]);

  useEffect(() => {
    if (isAuthenticated) {
      syncDelta();
      processOutbox();
      callListenerService.initListener();
      refreshPermissions();

      const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
        if (nextAppState === 'active') {
          refreshPermissions();
          callListenerService.checkAndPromptRecentCall();
        }
      });

      let notifSub: any = null;
      try {
        const Notifications = require('expo-notifications');
        if (Notifications?.addNotificationResponseReceivedListener) {
          notifSub = Notifications.addNotificationResponseReceivedListener((response: any) => {
            const data = response?.notification?.request?.content?.data;
            if (data?.route && data?.phone) {
              hidePostCallPrompt();
              router.push({
                pathname: data.route as any,
                params: { numero: data.phone },
              });
            }
          });
        }
      } catch {}

      return () => {
        subscription.remove();
        if (notifSub?.remove) {
          notifSub.remove();
        }
      };
    }
  }, [isAuthenticated, refreshPermissions, router, hidePostCallPrompt]);

  const handleGrantPermissions = async () => {
    const res = await permissionManager.requestAllPermissions();
    setMissingPermissions(res.missingPermissions);
    setDismissedGuard(true);
    await storage.setItem('kwismo_perm_guard_dismissed', 'true');
    setShowPermissionModal(false);
  };

  const handleDismissGuard = async () => {
    setDismissedGuard(true);
    await storage.setItem('kwismo_perm_guard_dismissed', 'true');
    setShowPermissionModal(false);
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
        visible={showPermissionModal && !postCallVisible}
        missingPermissions={missingPermissions}
        onGrant={handleGrantPermissions}
        onDismiss={handleDismissGuard}
      />
      <PostCallPromptModal
        visible={postCallVisible}
        phoneNumber={postCallPhone}
        onReport={(phone) => {
          hidePostCallPrompt();
          router.push({
            pathname: '/(app)/report',
            params: { numero: phone },
          });
        }}
        onDismiss={hidePostCallPrompt}
      />
    </View>
  );
}

