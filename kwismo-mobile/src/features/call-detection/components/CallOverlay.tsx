// Composant d'affichage flottant (Overlay) lors d'un appel entrant suspect
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { CallDetectionResult } from '../services/call.api';

interface CallOverlayProps {
  result: CallDetectionResult;
  onDismiss: () => void;
}

export const CallOverlay: React.FC<CallOverlayProps> = ({ result, onDismiss }) => {
  return (
    <View style={styles.overlay}>
      <Text style={styles.warningTitle}>⚠️ APPEL SPAM SUSPECTÉ</Text>
      <Text style={styles.caller}>{result.callerName || 'Inconnu'}</Text>
      <Text style={styles.score}>Score de risque: {result.riskScore}%</Text>
      <TouchableOpacity style={styles.dismissBtn} onPress={onDismiss}>
        <Text style={styles.dismissText}>Fermer</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    backgroundColor: '#991B1B',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginVertical: 12,
  },
  warningTitle: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  caller: {
    color: '#FECACA',
    fontSize: 14,
    marginVertical: 4,
  },
  score: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  dismissBtn: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 6,
    marginTop: 10,
  },
  dismissText: {
    color: '#991B1B',
    fontWeight: 'bold',
  },
});
