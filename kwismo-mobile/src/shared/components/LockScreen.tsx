// Écran de déverrouillage sécurisé par Biométrie et/ou PIN 6 chiffres
import React, { useEffect, useCallback, useState } from 'react';
import { View, Text, StatusBar, StyleSheet, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '../hooks/useAppTheme';
import { useBiometricLock } from '../hooks/useBiometricLock';
import { PinPad } from './PinPad';
import { colors, fonts } from '../../styles/tokens';
import { scaleFont } from '../lib/responsive';
import { useAuthStore } from '../store/authStore';

interface LockScreenProps {
  onUnlock: () => void;
  biometricEnabled?: boolean;
}

export const LockScreen: React.FC<LockScreenProps> = ({ onUnlock, biometricEnabled = false }) => {
  const { t } = useTranslation();
  const { colors: themeColors } = useAppTheme();
  const { user } = useAuthStore();
  const { isAvailable: biometricAvailable, authenticate } = useBiometricLock();
  const [biometricPending, setBiometricPending] = useState(false);

  const triggerBiometric = useCallback(async () => {
    if (!biometricAvailable || Platform.OS === 'web') return;
    setBiometricPending(true);
    const ok = await authenticate(t('security.biometricPrompt', 'Déverrouillez KWISMO'));
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
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <StatusBar barStyle="light-content" backgroundColor={themeColors.background} />

      {/* Profil de l'utilisateur en haut */}
      <View style={styles.userRow}>
        <View style={[styles.avatar, { backgroundColor: colors.green }]}>
          <Text style={styles.avatarInitials}>{initials}</Text>
        </View>
        <Text style={[styles.appName, { color: themeColors.textSecondary }]}>KWISMO SECURITY</Text>
        <Text style={[styles.userName, { color: themeColors.textPrimary }]}>
          {displayName}
        </Text>
      </View>

      {/* Pavé numérique PIN */}
      <PinPad
        mode="verify"
        onSuccess={onUnlock}
        showBiometric={biometricAvailable && biometricEnabled && Platform.OS !== 'web' && !biometricPending}
        onBiometric={triggerBiometric}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  userRow: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 8,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  avatarInitials: {
    fontSize: scaleFont(22),
    fontFamily: fonts.headlineBold,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  appName: {
    fontSize: scaleFont(11),
    fontFamily: fonts.regular,
    letterSpacing: 1,
    marginBottom: 2,
  },
  userName: {
    fontSize: scaleFont(16),
    fontFamily: fonts.headlineBold,
    fontWeight: '700',
  },
});
