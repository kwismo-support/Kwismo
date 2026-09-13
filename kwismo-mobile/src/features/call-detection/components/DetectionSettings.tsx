// Composant de configuration de la détection automatique d'appels
import React from 'react';
import { View, Text, StyleSheet, Switch } from 'react-native';

interface DetectionSettingsProps {
  enabled: boolean;
  onToggle: (val: boolean) => void;
}

export const DetectionSettings: React.FC<DetectionSettingsProps> = ({ enabled, onToggle }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Détection automatique d'appels</Text>
      <View style={styles.row}>
        <Text style={styles.label}>Activer la protection en temps réel</Text>
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
