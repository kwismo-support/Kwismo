import React, { useEffect, useCallback, useState } from 'react';
import { View, Text, StatusBar, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '@/shared/hooks/useAppTheme';
import { useBiometricLock } from '@/shared/hooks/useBiometricLock';
import { PinPad } from '@/shared/components/PinPad';
import { useAuthStore } from '@/shared/store/authStore';

interface LockScreenProps {
  onUnlock: () => void;
  biometricEnabled?: boolean;
}

export const LockScreen: React.FC<LockScreenProps> = ({ onUnlock, biometricEnabled = false }) => {
  const { t } = useTranslation();
  const { isDark, colors: themeColors } = useAppTheme();
  const { user } = useAuthStore();
  const { isAvailable: biometricAvailable, authenticate } = useBiometricLock();
  const [biometricPending, setBiometricPending] = useState(false);

  const triggerBiometric = useCallback(async () => {
    if (!biometricAvailable || Platform.OS === 'web') return;
    setBiometricPending(true);
    const ok = await authenticate(t('security.biometricPrompt'));
    setBiometricPending(false);
    if (ok) onUnlock();
  }, [biometricAvailable, authenticate, onUnlock, t]);

  useEffect(() => {
    if (biometricEnabled && biometricAvailable && Platform.OS !== 'web') {
      const timer = setTimeout(triggerBiometric, 300);
      return () => clearTimeout(timer);
    }
  }, [biometricEnabled, biometricAvailable, triggerBiometric]);

  const displayName = user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : user?.email || 'Utilisateur KWISMO';
  const initials = displayName
    .split(' ')
    .map((w: string) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <View className="flex-1 bg-white dark:bg-brand-darkBg">
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      <View className="items-center pt-15 pb-2">
        <View className="w-16 h-16 rounded-full bg-brand-green items-center justify-center mb-2.5">
          <Text className="text-xl font-headline-bold text-white font-bold">{initials}</Text>
        </View>
        <Text className="text-2xs font-regular tracking-widest text-slate-400 dark:text-slate-400 mb-0.5">
          KWISMO SECURITY
        </Text>
        <Text className="text-base font-headline-bold font-bold text-slate-900 dark:text-white">
          {displayName}
        </Text>
      </View>

      <PinPad
        mode="verify"
        onSuccess={onUnlock}
        showBiometric={biometricAvailable && biometricEnabled && Platform.OS !== 'web' && !biometricPending}
        onBiometric={triggerBiometric}
      />
    </View>
  );
};

export default LockScreen;
