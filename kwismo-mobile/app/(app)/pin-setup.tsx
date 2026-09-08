// Écran unifié de configuration du code PIN à 6 chiffres
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { HeaderBar } from '../../src/shared/components/HeaderBar';
import { PinPad } from '../../src/shared/components/PinPad';
import { useAppTheme } from '../../src/shared/hooks/useAppTheme';
import { toast } from '../../src/shared/store/toastStore';
import { setBiometricPreference } from '../../src/shared/lib/secureStore';

export default function PinSetupScreen() {
  const router = useRouter();
  const { colors: themeColors } = useAppTheme();

  const handleSuccess = async (pin?: string) => {
    await setBiometricPreference(true);
    toast.success('Code PIN configuré et sécurité biométrique activée avec succès !');
    router.back();
  };

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
