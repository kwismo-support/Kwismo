// Composant d'affichage du résultat du niveau de risque
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { VerifyResult } from '../services/verify.api';

interface RiskResultCardProps {
  result: VerifyResult;
}

export const RiskResultCard: React.FC<RiskResultCardProps> = ({ result }) => {
  const getRiskColor = () => {
    switch (result.riskLevel) {
      case 'CRITICAL':
      case 'HIGH':
        return '#DC2626';
      case 'MEDIUM':
        return '#D97706';
      default:
        return '#16A34A';
    }
  };

  const color = getRiskColor();

  return (
    <View style={[styles.card, { borderColor: color }]}>
      <Text style={styles.phone}>{result.phone}</Text>
      <Text style={styles.operator}>{result.operator}</Text>
      <View style={[styles.badge, { backgroundColor: color }]}>
        <Text style={styles.badgeText}>Risque: {result.riskLevel} ({result.riskScore}%)</Text>
      </View>
      <Text style={styles.recommendation}>{result.recommendation}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    marginVertical: 12,
  },
  phone: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  operator: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 8,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginVertical: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 12,
  },
  recommendation: {
    fontSize: 13,
    color: '#334155',
    marginTop: 8,
  },
});
