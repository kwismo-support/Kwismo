import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';

interface UssdConfirmProps {
  code: string;
  onLaunch: () => void;
}

export const UssdConfirm: React.FC<UssdConfirmProps> = ({ code, onLaunch }) => {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('transfer.ussdReadyTitle')}</Text>
      <Text style={styles.code}>{code}</Text>
      <Text style={styles.help}>{t('transfer.ussdReadySub')}</Text>
      <TouchableOpacity style={styles.button} onPress={onLaunch}>
        <Text style={styles.buttonText}>{t('transfer.dialUssd')}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    marginVertical: 12,
  },
  title: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '600',
  },
  code: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#0F172A',
    marginVertical: 8,
  },
  help: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
    marginBottom: 12,
  },
  button: {
    backgroundColor: '#16A34A',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});
