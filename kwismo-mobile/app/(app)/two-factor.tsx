import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useTranslation } from 'react-i18next';
import { Icon } from '@/shared/ui/Icon';
import { HeaderBar } from '@/shared/components/HeaderBar';
import { CustomSwitch } from '@/shared/ui/CustomSwitch';
import { useAppTheme } from '@/shared/hooks/useAppTheme';
import { toast } from '@/shared/store/toastStore';
import {
  hasConfiguredPin,
  deleteUserPin,
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

  const handlePinToggle = async (val: boolean) => {
    if (val) {
      const pinExists = await hasConfiguredPin();
      if (!pinExists) {
        router.push('/(app)/pin-setup');
      } else {
        setPinConfigured(true);
      }
    } else {
      await deleteUserPin();
      setPinConfigured(false);
      setBiometricsEnabled(false);
      toast.info(t('security.pinDisabled'));
    }
  };

  const handleBioToggle = async (val: boolean) => {
    if (val) {
      const pinExists = await hasConfiguredPin();
      if (!pinExists) {
        toast.info(t('security.pinRequiredForBio'));
        router.push('/(app)/pin-setup');
        return;
      }
      await setBiometricPreference(true);
      setBiometricsEnabled(true);
      toast.success(t('security.bioEnabled'));
    } else {
      await setBiometricPreference(false);
      setBiometricsEnabled(false);
      toast.info(t('security.bioDisabled'));
    }
  };

  return (
    <View className="flex-1 bg-brand-green">
      <StatusBar style="light" />

      <HeaderBar
        title={t('security.twoFactorTitle')}
        showBack={true}
        onBack={() => router.back()}
        rightAction={
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.back()}
            className="p-1"
          >
            <Icon name="gravity-ui:check" color="#FFFFFF" size={24} />
          </TouchableOpacity>
        }
      />

      <View className="flex-1 bg-white dark:bg-brand-darkBg rounded-t-[28px] overflow-hidden pt-6 px-5">
        <ScrollView
          contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
          showsVerticalScrollIndicator={false}
          className="gap-y-4"
        >
          <View className="flex-row items-center justify-between py-4 border-b border-slate-100 dark:border-slate-800">
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => router.push('/(app)/pin-setup')}
              className="flex-row items-center flex-1 pr-3"
            >
              <Icon
                name="solar:lock-keyhole-bold"
                color={isDark ? '#FFFFFF' : '#161E33'}
                size={24}
                className="mr-4"
              />
              <View className="flex-1">
                <Text className="font-montserrat-bold text-base font-bold text-slate-900 dark:text-white">
                  {t('security.pinTitle')}
                </Text>
              </View>
            </TouchableOpacity>

            <CustomSwitch
              value={pinConfigured}
              onValueChange={handlePinToggle}
              activeColor="#FF9500"
            />
          </View>

          <View className="flex-row items-center justify-between py-4 border-b border-slate-100 dark:border-slate-800">
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => router.push('/(app)/biometrics')}
              className="flex-row items-center flex-1 pr-3"
            >
              <Icon
                name="solar:fingerprint-bold"
                color={isDark ? '#FFFFFF' : '#161E33'}
                size={24}
                className="mr-4"
              />
              <View className="flex-1">
                <Text className="font-montserrat-bold text-base font-bold text-slate-900 dark:text-white">
                  {t('security.biometricsTitle')}
                </Text>
              </View>
            </TouchableOpacity>

            <CustomSwitch
              value={biometricsEnabled}
              onValueChange={handleBioToggle}
              activeColor="#FF9500"
            />
          </View>
        </ScrollView>
      </View>
    </View>
  );
}
