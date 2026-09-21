import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useTranslation } from 'react-i18next';
import { Icon } from '@/shared/ui/Icon';
import { HeaderBar } from '@/shared/components/HeaderBar';
import { CustomSwitch } from '@/shared/ui/CustomSwitch';
import { toast } from '@/shared/store/toastStore';
import {
  hasConfiguredPin,
  getBiometricPreference,
  setBiometricPreference,
} from '@/shared/lib/secureStore';

export default function BiometricsScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  const [biometricsEnabled, setBiometricsEnabled] = useState(false);

  useEffect(() => {
    async function loadBioState() {
      const bioState = await getBiometricPreference();
      setBiometricsEnabled(bioState);
    }
    loadBioState();
  }, []);

  const handleToggle = async (val: boolean) => {
    if (val) {
      const hasPin = await hasConfiguredPin();
      if (!hasPin) {
        toast.info(t('security.pinRequiredForBio'));
        router.push('/(app)/pin-setup');
        return;
      }
    }
    await setBiometricPreference(val);
    setBiometricsEnabled(val);
    if (val) {
      toast.success(t('security.bioEnabled'));
    } else {
      toast.info(t('security.bioDisabled'));
    }
  };

  const handleCheckSave = () => {
    router.back();
  };

  return (
    <View className="flex-1 bg-brand-green">
      <StatusBar style="light" />

      <HeaderBar
        title={t('security.biometricsTitle')}
        showBack={true}
        onBack={() => router.back()}
        rightAction={
          <TouchableOpacity activeOpacity={0.7} onPress={handleCheckSave} className="p-1">
            <Icon name="gravity-ui:check" color="#FFFFFF" size={24} />
          </TouchableOpacity>
        }
      />

      <View className="flex-1 bg-white dark:bg-brand-darkBg rounded-t-[28px] overflow-hidden pt-12 px-6 items-center">
        <View className="wx-32 hx-32 rounded-full bg-emerald-50 dark:bg-emerald-950/30 items-center justify-center mb-6">
          <Icon name="solar:fingerprint-bold" color="#25B876" size={60} />
        </View>

        <Text className="font-montserrat-bold text-xl font-bold text-slate-900 dark:text-white text-center mb-2">
          {t('security.useBiometricsTitle')}
        </Text>

        <Text className="text-xs text-slate-400 dark:text-slate-400 text-center max-w-[280px] leading-5 mb-8">
          {t('security.useBiometricsSubtitle')}
        </Text>

        <View className="flex-row items-center justify-between w-full max-w-[320px] p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-brand-cardDark">
          <Text className="font-montserrat-bold text-sm font-bold text-slate-900 dark:text-white">
            {t('security.enableBiometrics')}
          </Text>
          <CustomSwitch
            value={biometricsEnabled}
            onValueChange={handleToggle}
            activeColor="#FF9500"
          />
        </View>
      </View>
    </View>
  );
}
