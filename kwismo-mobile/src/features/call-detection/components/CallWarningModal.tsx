import React from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CallLogItem } from '../services/callDetection.api';

interface CallWarningModalProps {
  visible: boolean;
  callData: CallLogItem | null;
  onDismiss: () => void;
  onReport: (number: string) => void;
}

export const CallWarningModal: React.FC<CallWarningModalProps> = ({
  visible,
  callData,
  onDismiss,
  onReport,
}) => {
  if (!callData) return null;

  const isHighRisk = callData.statut === 'frauduleux' || callData.risk_score >= 0.7;

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={[styles.card, isHighRisk ? styles.cardScam : styles.cardWarning]}>
          <View style={styles.headerRow}>
            <View style={[styles.iconBadge, isHighRisk ? styles.badgeRed : styles.badgeAmber]}>
              <Ionicons
                name={isHighRisk ? 'warning-outline' : 'shield-half-outline'}
                size={32}
                color="#FFFFFF"
              />
            </View>
            <Text style={styles.alertTitle}>
              {isHighRisk ? 'ATTENTION : APPEL SUSPECT !' : 'APPEL À VÉRIFIER'}
            </Text>
          </View>

          <Text style={styles.phoneNumber}>{callData.phone_number}</Text>
          <Text style={styles.callerName}>{callData.caller_name || 'Numéro Inconnu'}</Text>

          <View style={styles.scoreBox}>
            <Text style={styles.scoreLabel}>Niveau de Risque IA :</Text>
            <Text style={[styles.scoreValue, isHighRisk ? styles.textRed : styles.textAmber]}>
              {Math.round(callData.risk_score * 100)}% ({callData.statut.toUpperCase()})
            </Text>
          </View>

          <Text style={styles.warningDesc}>
            {isHighRisk
              ? 'Ce numéro est identifié comme frauduleux dans le registre KWISMO. Ne communiquez aucun code OTP ni mot de passe.'
              : 'Ce numéro présente un niveau de risque modéré. Soyez vigilant lors de votre conversation.'}
          </Text>

          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.btn, styles.btnDanger]}
              onPress={() => {
                onDismiss();
                onReport(callData.phone_number);
              }}
            >
              <Ionicons name="flag-outline" size={18} color="#FFF" style={styles.btnIcon} />
              <Text style={styles.btnTextWhite}>Signaler ce Numéro</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.btn, styles.btnSecondary]} onPress={onDismiss}>
              <Text style={styles.btnTextSecondary}>Ignorer & Continuer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 24,
    padding: 24,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  cardScam: {
    backgroundColor: '#1E1015',
    borderColor: '#EF4444',
  },
  cardWarning: {
    backgroundColor: '#1E1A10',
    borderColor: '#F59E0B',
  },
  headerRow: {
    alignItems: 'center',
    marginBottom: 16,
  },
  iconBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  badgeRed: {
    backgroundColor: '#DC2626',
  },
  badgeAmber: {
    backgroundColor: '#D97706',
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  phoneNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 4,
  },
  callerName: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 16,
  },
  scoreBox: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 16,
    gap: 8,
  },
  scoreLabel: {
    fontSize: 13,
    color: '#D1D5DB',
  },
  scoreValue: {
    fontSize: 14,
    fontWeight: '800',
  },
  textRed: {
    color: '#F87171',
  },
  textAmber: {
    color: '#FBBF24',
  },
  warningDesc: {
    fontSize: 13,
    color: '#E5E7EB',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 24,
  },
  actionButtons: {
    gap: 12,
  },
  btn: {
    flexDirection: 'row',
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnDanger: {
    backgroundColor: '#DC2626',
  },
  btnSecondary: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  btnIcon: {
    marginRight: 8,
  },
  btnTextWhite: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  btnTextSecondary: {
    color: '#D1D5DB',
    fontWeight: '600',
    fontSize: 14,
  },
});
