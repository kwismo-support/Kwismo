import React, { useState } from 'react';
import { View, Text, Switch, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useCallDetection } from '@/features/call-detection/hooks/useCallDetection';
import { CallWarningModal } from '@/features/call-detection/components/CallWarningModal';

export default function CallDetectionScreen() {
  const router = useRouter();
  const {
    isEnabled,
    toggleProtection,
    activeIncomingCall,
    simulateIncomingCall,
    dismissCallWarning,
    callHistory,
    loading,
  } = useCallDetection();

  const [simNumber, setSimNumber] = useState('+237690000999');

  const handleReportFromModal = (phone: string) => {
    router.push({
      pathname: '/(app)/report',
      params: { numero: phone },
    });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Détection d'Appels Suspects</Text>
      </View>

      {/* Switch Protection */}
      <View style={styles.card}>
        <View style={styles.cardRow}>
          <View style={styles.cardTextCol}>
            <Text style={styles.cardTitle}>Protection Temps Réel</Text>
            <Text style={styles.cardSubtitle}>
              Analyse automatique des appels entrants contre la base de données KWISMO.
            </Text>
          </View>
          <Switch
            value={isEnabled}
            onValueChange={toggleProtection}
            trackColor={{ false: '#374151', true: '#059669' }}
            thumbColor={isEnabled ? '#10B981' : '#9CA3AF'}
          />
        </View>
      </View>

      {/* Simulator Section */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Simulateur d'Appel Entrant Suspect</Text>
        <Text style={styles.sectionDesc}>
          Testez l'apparition de la modale d'alerte en direct en simulant un appel entrant.
        </Text>

        <TouchableOpacity
          style={[styles.simBtn, loading && styles.disabledBtn]}
          onPress={() => simulateIncomingCall(simNumber)}
          disabled={loading}
        >
          <Ionicons name="call" size={20} color="#FFFFFF" />
          <Text style={styles.simBtnText}>
            {loading ? 'Analyse en cours...' : 'Simuler un Appel Arnaqueur (+237 690 000 999)'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Call History */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Historique des Appels Analysés</Text>
        {callHistory.length === 0 ? (
          <Text style={styles.emptyText}>Aucun appel analysé pour le moment.</Text>
        ) : (
          callHistory.map((item) => (
            <View key={item.id} style={styles.historyRow}>
              <View style={styles.historyInfo}>
                <Ionicons
                  name={item.is_scam ? 'warning' : 'checkmark-circle'}
                  size={24}
                  color={item.is_scam ? '#EF4444' : '#10B981'}
                />
                <View>
                  <Text style={styles.historyNumber}>{item.phone_number}</Text>
                  <Text style={styles.historyDate}>
                    {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {item.caller_name}
                  </Text>
                </View>
              </View>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: item.is_scam ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)' },
                ]}
              >
                <Text
                  style={[
                    styles.statusBadgeText,
                    { color: item.is_scam ? '#F87171' : '#34D399' },
                  ]}
                >
                  {Math.round(item.risk_score * 100)}% ({item.statut.toUpperCase()})
                </Text>
              </View>
            </View>
          ))
        )}
      </View>

      {/* Warning Overlay Modal */}
      <CallWarningModal
        visible={activeIncomingCall !== null}
        callData={activeIncomingCall}
        onDismiss={dismissCallWarning}
        onReport={handleReportFromModal}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  content: {
    padding: 20,
    paddingTop: 50,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  backBtn: {
    padding: 8,
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTextCol: {
    flex: 1,
    marginRight: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#94A3B8',
    lineHeight: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  sectionDesc: {
    fontSize: 12,
    color: '#94A3B8',
    marginBottom: 16,
    lineHeight: 16,
  },
  simBtn: {
    backgroundColor: '#DC2626',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  disabledBtn: {
    opacity: 0.6,
  },
  simBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  emptyText: {
    color: '#64748B',
    fontSize: 13,
    fontStyle: 'italic',
  },
  historyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  historyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  historyNumber: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  historyDate: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
});
