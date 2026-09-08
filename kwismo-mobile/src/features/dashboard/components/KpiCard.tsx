// Composant d'affichage d'un indicateur clé (KPI) sur l'accueil
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  color?: string;
}

export const KpiCard: React.FC<KpiCardProps> = ({ title, value, subtitle, color = '#1E293B' }) => {
  return (
    <View style={[styles.card, { borderLeftColor: color }]}>
      <Text style={styles.title}>{title}</Text>
      <Text style={[styles.value, { color }]}>{value}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    flex: 1,
    marginHorizontal: 4,
  },
  title: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
    textTransform: 'uppercase',
  },
  value: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 4,
  },
  subtitle: {
    fontSize: 11,
    color: '#94A3B8',
  },
});
