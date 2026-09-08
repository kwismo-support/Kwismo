// Composant de badge pour afficher l'état de sécurité d'un contact ou d'un numéro
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface StatusBadgeProps {
  status?: 'active' | 'compromised' | 'unknown' | 'safe';
  label?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status = 'safe', label }) => {
  const getBadgeStyle = () => {
    switch (status) {
      case 'compromised':
        return { bg: '#FEE2E2', text: '#DC2626', defaultText: 'Compromis' };
      case 'active':
      case 'safe':
        return { bg: '#DCFCE7', text: '#16A34A', defaultText: 'Sécurisé' };
      default:
        return { bg: '#F3F4F6', text: '#4B5563', defaultText: 'Inconnu' };
    }
  };

  const current = getBadgeStyle();

  return (
    <View style={[styles.badge, { backgroundColor: current.bg }]}>
      <Text style={[styles.text, { color: current.text }]}>
        {label || current.defaultText}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
  },
});
