import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
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
import { Icon } from '@/shared/ui/Icon';
import { HeaderBar } from '@/shared/components/HeaderBar';
import { PinPad } from '@/shared/components/PinPad';
import { useAppTheme } from '@/shared/hooks/useAppTheme';
import { toast } from '@/shared/store/toastStore';
import {
  hasConfiguredPin,
  getBiometricPreference,
  setBiometricPreference,
} from '@/shared/lib/secureStore';

export default function TwoFactorScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { isDark } = useAppTheme();

  const [biometricsEnabled, setBiometricsEnabled] = useState(false);
  const [pinConfigured, setPinConfigured] = useState(false);
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
    <View className="flex-1 bg-slate-50 dark:bg-brand-darkBg">
      <StatusBar style={isDark ? 'light' : 'dark'} />

      <HeaderBar title={t('security.twoFactorTitle', 'Authentification à Deux Facteurs')} showBack={true} />

      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
        showsVerticalScrollIndicator={false}
        className="px-5 pt-5"
      >
        <Text className="font-font-bold text-base font-extrabold text-slate-900 dark:text-white">
          {t('security.securityHeader', 'Protection du compte')}
        </Text>
        <Text className="font-font-regular text-xs text-slate-500 dark:text-slate-400 mt-1">
          {t('security.securitySubtitle', 'Configurez le verrouillage biométrique et votre code PIN de secours.')}
        </Text>

        <View className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-brand-cardDark px-4 mt-4">
          <View className="flex-row items-center justify-between py-4">
            <Icon name="solar:fingerprint-bold" color="#25B876" size={24} className="mr-3" />
            <View className="flex-1 pr-2.5">
              <Text className="font-font-bold text-sm font-bold text-slate-900 dark:text-white">
                {t('security.biometricsTitle', 'Empreinte digital / Face ID')}
              </Text>
              <Text className="font-font-regular text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {biometricsEnabled
                  ? t('security.biometricsActive', 'Déverrouillage rapide activé')
                  : t('security.biometricsDisabled', 'Désactivé par défaut')}
              </Text>
            </View>
            <Switch
              value={biometricsEnabled}
              onValueChange={handleToggleBiometrics}
              trackColor={{ false: '#CBD5E1', true: '#25B876' }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        <View className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-brand-cardDark px-4 mt-4">
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push('/(app)/pin-setup')}
            className="flex-row items-center justify-between py-4"
          >
            <Icon name="solar:shield-keyhole-bold" color="#25B876" size={24} className="mr-3" />
            <View className="flex-1 pr-2.5">
              <Text className="font-font-bold text-sm font-bold text-slate-900 dark:text-white">
                {t('security.pinTitle', 'Code PIN (6 chiffres)')}
              </Text>
              <Text className="font-font-regular text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {pinConfigured
                  ? t('security.pinActive', 'Code PIN configuré')
                  : t('security.pinNotConfigured', 'Non défini (Requis pour la biométrie)')}
              </Text>
            </View>
            <Icon name="solar:alt-arrow-right-linear" color="#94A3B8" size={20} />
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal visible={pinVerifyModalVisible} animationType="slide">
        <View className="flex-1 bg-slate-50 dark:bg-brand-darkBg">
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

