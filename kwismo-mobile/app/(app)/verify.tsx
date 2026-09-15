import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useTranslation } from 'react-i18next';
import { Icon } from '@/shared/ui/Icon';
import { HeaderBar } from '@/shared/components/HeaderBar';
import { useAppTheme } from '@/shared/hooks/useAppTheme';
import { verifyApi, VerifyResult } from '@/features/verify/services/verify.api';
import { lookupNumberOffline } from '@/shared/services/database';

export default function VerifyScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ phone?: string }>();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { isDark } = useAppTheme();

  const [inputPhone, setInputPhone] = useState(params.phone || '');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VerifyResult | null>(
    params.phone
      ? {
          id: 'num-init',
          valeur: params.phone,
          phone: params.phone,
          score_risque: 90,
          riskScore: 90,
          statut: 'active',
          riskLevel: 'HIGH',
          est_compromis: true,
          nombre_signalements: 90,
          reportCount: 90,
          operator: 'MTN Cameroon',
          recommendation: 'Dernier signalement il y’a 8 mois',
        }
      : null
  );

  const handleVerify = async () => {
    if (!inputPhone.trim()) return;
    setLoading(true);
    try {
      const res = await verifyApi.checkNumber(inputPhone);
      if (res.success && res.data) {
        setResult(res.data);
      }
    } catch (err) {
      try {
        const offlineResult = await lookupNumberOffline(inputPhone.trim());
        if (offlineResult) {
          const score = Math.round(offlineResult.score_risque * 100);
          setResult({
            id: `num-offline-${Date.now()}`,
            valeur: offlineResult.valeur,
            phone: offlineResult.valeur,
            score_risque: score,
            riskScore: score,
            statut: offlineResult.statut,
            riskLevel: offlineResult.statut === 'frauduleux' ? 'HIGH' : offlineResult.statut === 'suspect' ? 'MEDIUM' : 'LOW',
            est_compromis: offlineResult.statut === 'frauduleux',
            nombre_signalements: 1,
            reportCount: 1,
            operator: 'Réseau Mobile',
            recommendation: 'Résultat issu de la base locale SQLite (Mode hors-ligne)',
          });
        }
      } catch {}
    } finally {
      setLoading(false);
    }
  };

  const isFraudulent = result?.riskLevel === 'HIGH' || result?.riskLevel === 'CRITICAL' || (result?.riskScore || 0) >= 70;
  const isSuspect = result?.riskLevel === 'MEDIUM' || ((result?.riskScore || 0) >= 40 && (result?.riskScore || 0) < 70);

  return (
    <View className="flex-1 bg-slate-50 dark:bg-brand-darkBg">
      <StatusBar style={isDark ? 'light' : 'dark'} />

      <HeaderBar title="Verification du numero" showBack={true} />

      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
        showsVerticalScrollIndicator={false}
        className="px-4 pt-4"
      >
        <View className="mb-5">
          <View className="flex-row items-center h-12 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-brand-cardDark px-3.5 mb-2.5">
            <Icon name="solar:magnifer-linear" color="#94A3B8" size={20} className="mr-2.5" />
            <TextInput
              className="flex-1 text-base font-font-regular text-slate-900 dark:text-white"
              placeholder="Entrez un numéro (+237...)"
              placeholderTextColor="#94A3B8"
              keyboardType="phone-pad"
              value={inputPhone}
              onChangeText={setInputPhone}
            />
          </View>

          <TouchableOpacity
            className="h-12 rounded-xl bg-brand-green justify-center items-center"
            onPress={handleVerify}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text className="text-white text-base font-font-bold font-bold">Vérifier</Text>
            )}
          </TouchableOpacity>
        </View>

        {result && (
          <View className="bg-white dark:bg-brand-cardDark rounded-3xl p-5 shadow-sm mb-6">
            <View
              className={`self-center px-10 py-2.5 rounded-full border-2 mb-5 ${
                isFraudulent
                  ? 'border-red-500'
                  : isSuspect
                  ? 'border-amber-500'
                  : 'border-emerald-500'
              }`}
            >
              <Text
                className={`text-lg font-font-bold font-black ${
                  isFraudulent
                    ? 'text-red-500'
                    : isSuspect
                    ? 'text-amber-500'
                    : 'text-emerald-500'
                }`}
              >
                {isFraudulent ? 'Frauduleux' : isSuspect ? 'A signaler' : 'Sécurisé'}
              </Text>
            </View>

            <View className="items-center my-4">
              <View
                className={`w-36 h-36 rounded-full justify-center items-center ${
                  isFraudulent
                    ? 'bg-red-100 dark:bg-red-950/40'
                    : isSuspect
                    ? 'bg-amber-100 dark:bg-amber-950/40'
                    : 'bg-emerald-100 dark:bg-emerald-950/40'
                }`}
              >
                <View
                  className={`w-24 h-24 rounded-full justify-center items-center ${
                    isFraudulent
                      ? 'bg-red-500'
                      : isSuspect
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
                  }`}
                >
                  <Icon
                    name={
                      isFraudulent
                        ? 'solar:danger-triangle-bold'
                        : isSuspect
                        ? 'solar:danger-bold'
                        : 'solar:shield-check-bold'
                    }
                    color="#FFFFFF"
                    size={48}
                  />
                </View>
              </View>
            </View>

            <View className="bg-brand-green rounded-2xl p-4 my-4">
              <View className="flex-row justify-between items-center mb-3">
                <View className="flex-row items-center">
                  <Text className="text-white text-sm font-font-bold font-bold">Score de risque</Text>
                  <Icon name="solar:info-circle-linear" color="#FFFFFF" size={16} className="ml-1" />
                </View>
                <View className="bg-white/25 px-3 py-1 rounded-xl">
                  <Text className="text-white text-xs font-font-bold font-bold">
                    {isFraudulent ? 'Attention' : isSuspect ? 'Suspect' : 'Faible'}
                  </Text>
                </View>
              </View>

              <View className="mt-1">
                <View className="flex-row justify-between mb-1">
                  <Text className="text-white text-xs font-font-regular">0</Text>
                  <Text className="text-white text-xs font-font-regular">100</Text>
                </View>
                <View className="h-2 bg-white/30 rounded-full overflow-hidden">
                  <View
                    className="h-full bg-white rounded-full"
                    style={{ width: `${Math.min(result.riskScore, 100)}%` }}
                  />
                </View>
              </View>
            </View>

            <View className="my-3">
              <Text className="text-base font-font-bold font-black text-slate-900 dark:text-white mb-3">
                Historique communautaire
              </Text>

              <View className="flex-row justify-between items-center py-2.5 border-b border-slate-100 dark:border-slate-800">
                <View className="flex-row items-center">
                  <Icon name="solar:bell-bing-bold" color={isDark ? '#94A3B8' : '#0F172A'} size={20} className="mr-2.5" />
                  <Text className="text-sm font-font-regular text-slate-900 dark:text-white">
                    Signalements
                  </Text>
                </View>
                <Text className="text-base font-font-bold font-black text-slate-900 dark:text-white">
                  {result.reportCount < 10 ? `0${result.reportCount}` : result.reportCount}
                </Text>
              </View>

              <View className="flex-row justify-between items-center py-2.5 border-b border-slate-100 dark:border-slate-800">
                <View className="flex-row items-center">
                  <Icon name="solar:chat-round-line-bold" color={isDark ? '#94A3B8' : '#0F172A'} size={20} className="mr-2.5" />
                  <Text className="text-sm font-font-regular text-slate-900 dark:text-white">
                    Commentaires positifs
                  </Text>
                </View>
                <Text className="text-base font-font-bold font-black text-slate-900 dark:text-white">
                  {isFraudulent ? '00' : isSuspect ? '10' : '45'}
                </Text>
              </View>

              <Text className="text-xs text-slate-400 font-font-regular mt-3">
                {result.recommendation || 'Dernier signalement il y’a 8 mois'}
              </Text>
            </View>

            <View className="flex-row justify-between mt-5 gap-3">
              {isFraudulent ? (
                <>
                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={() => router.push({ pathname: '/(app)/report', params: { phone: result.phone } })}
                    className="flex-1 h-12 rounded-full bg-amber-500 justify-center items-center"
                  >
                    <Text className="text-white text-base font-font-bold font-bold">Signaler</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={() => router.push({ pathname: '/(app)/transfer', params: { recipient: result.phone } })}
                    className="flex-1 h-12 rounded-full bg-slate-900 dark:bg-slate-700 justify-center items-center"
                  >
                    <Text className="text-white text-base font-font-bold font-bold">Transferer</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => router.push({ pathname: '/(app)/transfer', params: { recipient: result.phone } })}
                  className="w-full h-12 rounded-full bg-amber-500 justify-center items-center"
                >
                  <Text className="text-white text-base font-font-bold font-bold">Transferer</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

