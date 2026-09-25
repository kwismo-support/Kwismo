import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { CallDetectionResult } from '../services/call.api';

interface CallOverlayProps {
  result: CallDetectionResult;
  onDismiss: () => void;
}

export const CallOverlay: React.FC<CallOverlayProps> = ({ result, onDismiss }) => {
  const { t } = useTranslation();

  return (
    <View style={styles.overlay}>
      <Text style={styles.warningTitle}>{t('callDetection.overlayTitle')}</Text>
      <Text style={styles.caller}>{result.callerName || t('callDetection.unknownNumber')}</Text>
      <Text style={styles.score}>{t('callDetection.riskScore', { score: result.riskScore })}</Text>
      <TouchableOpacity style={styles.dismissBtn} onPress={onDismiss}>
        <Text style={styles.dismissText}>{t('callDetection.dismiss')}</Text>
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
