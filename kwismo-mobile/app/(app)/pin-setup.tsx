import React from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { HeaderBar } from '@/shared/components/HeaderBar';
import { PinPad } from '@/shared/components/PinPad';
import { toast } from '@/shared/store/toastStore';
import { saveUserPin, setBiometricPreference } from '@/shared/lib/secureStore';

export default function PinSetupScreen() {
  const router = useRouter();

  const handleSuccess = async (pin?: string) => {
    if (pin) {
      await saveUserPin(pin);
    }
    await setBiometricPreference(true);
    toast.success('Code PIN configuré et sécurité biométrique activée avec succès !');
    router.back();
  };

  return (
    <View className="flex-1 bg-white dark:bg-brand-darkBg">
      <StatusBar style="light" />
      <HeaderBar title="Code PIN (6 chiffres)" showBack={true} />
      <PinPad
        mode="setup"
        title="Définir un code PIN (6 chiffres)"
        subtitle="Ce code de 6 chiffres sécurise votre application et permet d'activer la biométrie."
        onSuccess={handleSuccess}
        onCancel={() => router.back()}
      />
    </View>
  );
}

