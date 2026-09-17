import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useCallDetection } from '@/features/call-detection/hooks/useCallDetection';
import { CallWarningModal } from '@/features/call-detection/components/CallWarningModal';
import { CustomSwitch } from '@/shared/ui/CustomSwitch';

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

  const [simNumber] = useState('+237690000999');

  const handleReportFromModal = (phone: string) => {
    router.push({
      pathname: '/(app)/report',
      params: { numero: phone },
    });
  };

  return (
    <ScrollView className="flex-1 bg-white dark:bg-slate-900" contentContainerStyle={{ padding: 20, paddingTop: 48 }}>
      <View className="flex-row items-center mb-6">
        <TouchableOpacity className="p-2 mr-3" onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} className="text-slate-900 dark:text-white" color="#FFFFFF" />
        </TouchableOpacity>
        <Text className="text-xl font-extrabold text-slate-900 dark:text-white">Détection d'Appels Suspects</Text>
      </View>

      <View className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-5 mb-5 border border-slate-200 dark:border-slate-700/60">
        <View className="flex-row justify-between items-center">
          <View className="flex-1 mr-3">
            <Text className="text-base font-bold text-slate-900 dark:text-white mb-1">Protection Temps Réel</Text>
            <Text className="text-xs text-slate-500 dark:text-slate-400 leading-4">
              Analyse automatique des appels entrants contre la base de données KWISMO.
            </Text>
          </View>
          <CustomSwitch
            value={isEnabled}
            onValueChange={toggleProtection}
            activeColor="#FF9500"
          />
        </View>
      </View>

      <View className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-5 mb-5 border border-slate-200 dark:border-slate-700/60">
        <Text className="text-base font-bold text-slate-900 dark:text-white mb-1.5">Simulateur d'Appel Entrant Suspect</Text>
        <Text className="text-xs text-slate-500 dark:text-slate-400 mb-4 leading-4">
          Testez l'apparition de la modale d'alerte en direct en simulant un appel entrant.
        </Text>

        <TouchableOpacity
          className={`bg-red-600 rounded-xl py-3.5 px-4 flex-row justify-center items-center gap-2 ${loading ? 'opacity-60' : ''}`}
          onPress={() => simulateIncomingCall(simNumber)}
          disabled={loading}
        >
          <Ionicons name="call" size={20} color="#FFFFFF" />
          <Text className="text-white font-bold text-2xs">
            {loading ? 'Analyse en cours...' : 'Simuler un Appel Arnaqueur (+237 690 000 999)'}
          </Text>
        </TouchableOpacity>
      </View>

      <View className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-5 mb-5 border border-slate-200 dark:border-slate-700/60">
        <Text className="text-base font-bold text-slate-900 dark:text-white mb-1.5">Historique des Appels Analysés</Text>
        {callHistory.length === 0 ? (
          <Text className="text-slate-400 dark:text-slate-500 text-2xs italic">Aucun appel analysé pour le moment.</Text>
        ) : (
          callHistory.map((item) => (
            <View key={item.id} className="flex-row justify-between items-center py-3 border-b border-slate-200 dark:border-slate-700/40">
              <View className="flex-row items-center gap-3 flex-1">
                <Ionicons
                  name={item.is_scam ? 'warning' : 'checkmark-circle'}
                  size={24}
                  color={item.is_scam ? '#EF4444' : '#10B981'}
                />
                <View>
                  <Text className="text-sm font-bold text-slate-900 dark:text-white">{item.phone_number}</Text>
                  <Text className="text-2xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {item.caller_name}
                  </Text>
                </View>
              </View>
              <View className={`px-2.5 py-1 rounded-md ${item.is_scam ? 'bg-red-100 dark:bg-red-950/50' : 'bg-emerald-100 dark:bg-emerald-950/50'}`}>
                <Text className={`text-2xs font-bold ${item.is_scam ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-brand-green'}`}>
                  {Math.round(item.risk_score * 100)}% ({item.statut.toUpperCase()})
                </Text>
              </View>
            </View>
          ))
        )}
      </View>

      <CallWarningModal
        visible={activeIncomingCall !== null}
        callData={activeIncomingCall}
        onDismiss={dismissCallWarning}
        onReport={handleReportFromModal}
      />
    </ScrollView>
  );
}

