import React from 'react';
import { View, Text, StyleSheet, Switch } from 'react-native';
import { useTranslation } from 'react-i18next';

interface DetectionSettingsProps {
  enabled: boolean;
  onToggle: (val: boolean) => void;
}

export const DetectionSettings: React.FC<DetectionSettingsProps> = ({ enabled, onToggle }) => {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('callDetection.title')}</Text>
      <View style={styles.row}>
        <Text style={styles.label}>{t('callDetection.realtimeTitle')}</Text>
        <Switch value={enabled} onValueChange={onToggle} />
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
    fontSize: 15,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 8,
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
