import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';

interface PreferencesSettingsProps {
  language?: string;
  onLanguageChange?: (lang: string) => void;
}

export const PreferencesSettings: React.FC<PreferencesSettingsProps> = ({
  language = 'fr',
  onLanguageChange,
}) => {
  const { t } = useTranslation();
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('common.preferences')}</Text>
      <View style={styles.row}>
        <Text style={styles.label}>{t('common.language')}</Text>
        <Text style={styles.value}>{language === 'fr' ? t('common.french') : t('common.english')}</Text>
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
  value: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
  },
});
