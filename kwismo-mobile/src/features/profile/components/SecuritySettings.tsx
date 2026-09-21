import React from 'react';
import { View, Text, StyleSheet, Switch } from 'react-native';
import { useTranslation } from 'react-i18next';

interface SecuritySettingsProps {
  biometricEnabled: boolean;
  onToggleBiometric: (val: boolean) => void;
}

export const SecuritySettings: React.FC<SecuritySettingsProps> = ({
  biometricEnabled,
  onToggleBiometric,
}) => {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('twoFactor.securityHeader')}</Text>
      <View style={styles.row}>
        <Text style={styles.label}>{t('twoFactor.biometricsTitle')}</Text>
        <Switch value={biometricEnabled} onValueChange={onToggleBiometric} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 14,
    color: '#334155',
  },
});
