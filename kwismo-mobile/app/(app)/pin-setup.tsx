import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useTranslation } from 'react-i18next';
import { HeaderBar } from '@/shared/components/HeaderBar';
import { PinPad } from '@/shared/components/PinPad';
import { Icon } from '@/shared/ui/Icon';
import { toast } from '@/shared/store/toastStore';
import { saveUserPin, setBiometricPreference } from '@/shared/lib/secureStore';

export default function PinSetupScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  const handleSuccess = async (pin?: string) => {
    if (pin) {
      await saveUserPin(pin);
    }
    await setBiometricPreference(true);
    toast.success('Code PIN configuré et sécurité biométrique activée avec succès !');
    router.back();
  };

  return (
    <View className="flex-1 bg-brand-green">
      <StatusBar style="light" />
      <HeaderBar
        title={t('security.pinPageTitle', 'Code PIN')}
        showBack={true}
        onBack={() => router.back()}
        rightAction={
          <TouchableOpacity activeOpacity={0.7} onPress={() => router.back()} className="p-1">
            <Icon name="gravity-ui:check" color="#FFFFFF" size={24} />
          </TouchableOpacity>
        }
      />
      <PinPad
        mode="setup"
        onSuccess={handleSuccess}
        onCancel={() => router.back()}
      />
    </View>
  );
}


