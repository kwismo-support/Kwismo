// Écran de gestion de l'Authentification à Deux Facteurs (Biométrie & PIN 6 chiffres)
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  Modal,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useTranslation } from 'react-i18next';
import { Icon } from '../../src/shared/ui/Icon';
import { HeaderBar } from '../../src/shared/components/HeaderBar';
import { PinPad } from '../../src/shared/components/PinPad';
import { useAppTheme } from '../../src/shared/hooks/useAppTheme';
import { toast } from '../../src/shared/store/toastStore';
import { colors, fonts } from '../../src/styles/tokens';
import { scaleFont } from '../../src/shared/lib/responsive';
import {
  hasConfiguredPin,
  getBiometricPreference,
  setBiometricPreference,
} from '../../src/shared/lib/secureStore';

export default function TwoFactorScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { isDark, colors: themeColors } = useAppTheme();

  const [biometricsEnabled, setBiometricsEnabled] = useState(false);
  const [pinConfigured, setPinConfigured] = useState(false);
  const [twoFactorSmsEnabled, setTwoFactorSmsEnabled] = useState(false);

  const [pinVerifyModalVisible, setPinVerifyModalVisible] = useState(false);

  useFocusEffect(
    useCallback(() => {
      async function loadSecurityState() {
        const pinState = await hasConfiguredPin();
        const bioState = await getBiometricPreference();
        setPinConfigured(pinState);
        setBiometricsEnabled(bioState && pinState);
      }
      loadSecurityState();
    }, [])
  );

  const handleToggleBiometrics = async (value: boolean) => {
    const hasPin = await hasConfiguredPin();
    if (value) {
      if (!hasPin) {
        toast.info(t('security.pinRequired', 'Veuillez définir un code PIN à 6 chiffres pour activer la biométrie.'));
        router.push('/(app)/pin-setup');
      } else {
        await setBiometricPreference(true);
        setBiometricsEnabled(true);
        toast.success(t('security.bioEnabled', 'Authentification biométrique activée.'));
      }
    } else {
      // Pour désactiver la biométrie, demander le code PIN pour confirmer
      setPinVerifyModalVisible(true);
    }
  };

  const handleDisableBioSuccess = async () => {
    await setBiometricPreference(false);
    setBiometricsEnabled(false);
    setPinVerifyModalVisible(false);
    toast.info(t('security.bioDisabled', 'Authentification biométrique désactivée.'));
  };

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <StatusBar style="light" />

      <HeaderBar title={t('security.twoFactorTitle', 'Authentification à Deux Facteurs')} showBack={true} />

      <ScrollView
        contentContainerStyle={[
          styles.scrollBody,
          { paddingBottom: insets.bottom + 40 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.sectionTitle, { color: themeColors.textPrimary }]}>
          {t('security.securityHeader', 'Protection du compte')}
        </Text>
        <Text style={[styles.sectionSub, { color: themeColors.textSecondary }]}>
          {t('security.securitySubtitle', 'Configurez le verrouillage biométrique et votre code PIN de secours.')}
        </Text>

        {/* Option 1 : Biométrie */}
        <View style={[styles.card, { backgroundColor: themeColors.cardBg, borderColor: themeColors.inputBorder, marginTop: 16 }]}>
          <View style={styles.row}>
            <Icon name="solar:fingerprint-bold" color={colors.green} size={24} style={{ marginRight: 12 }} />
            <View style={{ flex: 1, paddingRight: 10 }}>
              <Text style={[styles.rowTitle, { color: themeColors.textPrimary }]}>
                {t('security.biometricsTitle', 'Empreinte digital / Face ID')}
              </Text>
              <Text style={[styles.rowSub, { color: themeColors.textSecondary }]}>
                {biometricsEnabled
                  ? t('security.biometricsActive', 'Déverrouillage rapide activé')
                  : t('security.biometricsDisabled', 'Désactivé par défaut')}
              </Text>
            </View>
            <Switch
              value={biometricsEnabled}
              onValueChange={handleToggleBiometrics}
              trackColor={{ false: '#CBD5E1', true: colors.green }}
              thumbColor={colors.white}
            />
          </View>
        </View>

        {/* Option 2 : Code PIN 6 Chiffres */}
        <View style={[styles.card, { backgroundColor: themeColors.cardBg, borderColor: themeColors.inputBorder, marginTop: 16 }]}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push('/(app)/pin-setup')}
            style={styles.row}
          >
            <Icon name="solar:shield-keyhole-bold" color={colors.green} size={24} style={{ marginRight: 12 }} />
            <View style={{ flex: 1, paddingRight: 10 }}>
              <Text style={[styles.rowTitle, { color: themeColors.textPrimary }]}>
                {t('security.pinTitle', 'Code PIN (6 chiffres)')}
              </Text>
              <Text style={[styles.rowSub, { color: themeColors.textSecondary }]}>
                {pinConfigured
                  ? t('security.pinActive', 'Code PIN configuré')
                  : t('security.pinNotConfigured', 'Non défini (Requis pour la biométrie)')}
              </Text>
            </View>
            <Icon name="solar:alt-arrow-right-linear" color={themeColors.inputPlaceholder} size={20} />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Modale de vérification PIN pour désactivation */}
      <Modal visible={pinVerifyModalVisible} animationType="slide">
        <View style={{ flex: 1, backgroundColor: themeColors.background }}>
          <HeaderBar title={t('security.disableBiometrics', 'Désactiver la Biométrie')} showBack={true} onBack={() => setPinVerifyModalVisible(false)} />
          <PinPad
            mode="verify"
            title={t('security.enterPinToConfirm', 'Entrez le code PIN pour désactiver')}
            onSuccess={handleDisableBioSuccess}
            onCancel={() => setPinVerifyModalVisible(false)}
          />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollBody: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  sectionTitle: {
    fontFamily: fonts.headlineBold,
    fontSize: scaleFont(16),
    fontWeight: '800',
  },
  sectionSub: {
    fontFamily: fonts.regular,
    fontSize: scaleFont(13),
    marginTop: 4,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
  rowTitle: {
    fontFamily: fonts.headlineBold,
    fontSize: scaleFont(14),
    fontWeight: '700',
  },
  rowSub: {
    fontFamily: fonts.regular,
    fontSize: scaleFont(12),
    marginTop: 2,
  },
});
