import React, { useState, useEffect } from 'react';
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
import { CountryFlag } from '@/shared/components/CountryFlag';
import { VerificationGraphic, OperationStepSpinner } from '@/shared/components/VerificationGraphic';
import { useAppTheme } from '@/shared/hooks/useAppTheme';
import { verifyApi, VerifyResult } from '@/features/verify/services/verify.api';
import { lookupNumberOffline } from '@/shared/services/database';

export default function VerifyScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ phone?: string; testState?: string }>();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { isDark } = useAppTheme();

  // Mode & State management
  // 'input' | 'analyzing' | 'result'
  const initialMode = params.testState === 'analyzing'
    ? 'analyzing'
    : (params.phone || params.testState)
    ? 'result'
    : 'input';

  const [mode, setMode] = useState<'input' | 'analyzing' | 'result'>(initialMode);
  const [testResultType, setTestResultType] = useState<'secure' | 'warning' | 'danger'>(
    params.testState === 'warning' ? 'warning' : params.testState === 'danger' ? 'danger' : 'secure'
  );

  const [inputPhone, setInputPhone] = useState(params.phone || '');
  const [analyzingStep, setAnalyzingStep] = useState(1);

  const [result, setResult] = useState<VerifyResult | null>(
    params.phone
      ? {
          id: 'num-init',
          valeur: params.phone,
          phone: params.phone,
          score_risque: 0,
          riskScore: 0,
          statut: 'active',
          riskLevel: 'LOW',
          est_compromis: false,
          nombre_signalements: 0,
          reportCount: 0,
          operator: 'MTN Cameroon',
          recommendation: 'Dernier signalement il y’a 8 mois',
        }
      : null
  );

  // Handle analysis simulation
  const startVerificationProcess = (phoneNumber: string) => {
    setInputPhone(phoneNumber);
    setMode('analyzing');
    setAnalyzingStep(1);

    // Simulate step sequence
    setTimeout(() => setAnalyzingStep(2), 700);
    setTimeout(() => setAnalyzingStep(3), 1400);
    setTimeout(() => setAnalyzingStep(4), 2100);
    setTimeout(() => {
      // Determine result based on input
      if (phoneNumber.includes('90') || phoneNumber.includes('99')) {
        setTestResultType('danger');
        setResult({
          id: 'res-danger',
          valeur: phoneNumber,
          phone: phoneNumber,
          score_risque: 90,
          riskScore: 90,
          statut: 'frauduleux',
          riskLevel: 'HIGH',
          est_compromis: true,
          nombre_signalements: 90,
          reportCount: 90,
          operator: 'Orange Cameroon',
          recommendation: 'Dernier signalement il y’a 8 mois',
        });
      } else if (phoneNumber.includes('50') || phoneNumber.includes('221')) {
        setTestResultType('warning');
        setResult({
          id: 'res-warning',
          valeur: phoneNumber,
          phone: phoneNumber,
          score_risque: 50,
          riskScore: 50,
          statut: 'suspect',
          riskLevel: 'MEDIUM',
          est_compromis: false,
          nombre_signalements: 50,
          reportCount: 50,
          operator: 'MTN Cameroon',
          recommendation: 'Dernier signalement il y’a 8 mois',
        });
      } else {
        setTestResultType('secure');
        setResult({
          id: 'res-secure',
          valeur: phoneNumber,
          phone: phoneNumber,
          score_risque: 0,
          riskScore: 0,
          statut: 'securise',
          riskLevel: 'LOW',
          est_compromis: false,
          nombre_signalements: 0,
          reportCount: 0,
          operator: 'MTN Cameroon',
          recommendation: 'Dernier signalement il y’a 8 mois',
        });
      }
      setMode('result');
    }, 2800);
  };

  const handleSearch = () => {
    if (!inputPhone.trim()) return;
    startVerificationProcess(inputPhone.trim());
  };

  // Switch result type for easy UI testing
  const switchTestResult = (type: 'secure' | 'warning' | 'danger') => {
    setTestResultType(type);
    setMode('result');
    if (type === 'secure') {
      setResult({
        id: 'test-sec',
        valeur: inputPhone || '+237 698 00 40 12',
        phone: inputPhone || '+237 698 00 40 12',
        score_risque: 0,
        riskScore: 0,
        statut: 'securise',
        riskLevel: 'LOW',
        est_compromis: false,
        nombre_signalements: 0,
        reportCount: 0,
        operator: 'MTN Cameroon',
        recommendation: 'Dernier signalement il y’a 8 mois',
      });
    } else if (type === 'warning') {
      setResult({
        id: 'test-warn',
        valeur: inputPhone || '+221 233 16 71 88',
        phone: inputPhone || '+221 233 16 71 88',
        score_risque: 50,
        riskScore: 50,
        statut: 'suspect',
        riskLevel: 'MEDIUM',
        est_compromis: false,
        nombre_signalements: 50,
        reportCount: 50,
        operator: 'Orange',
        recommendation: 'Dernier signalement il y’a 8 mois',
      });
    } else {
      setResult({
        id: 'test-dang',
        valeur: inputPhone || '+237 698 00 40 12',
        phone: inputPhone || '+237 698 00 40 12',
        score_risque: 90,
        riskScore: 90,
        statut: 'frauduleux',
        riskLevel: 'HIGH',
        est_compromis: true,
        nombre_signalements: 90,
        reportCount: 90,
        operator: 'MTN Cameroon',
        recommendation: 'Dernier signalement il y’a 8 mois',
      });
    }
  };

  // Contacts mock list (matching Image 1)
  const contactsList = [
    { id: 'c1', name: 'Inconnu', phone: '+237 6 98 00 40 12', initialBg: '#CBD5E1', initials: '' },
    { id: 'c2', name: 'Lysette Orleanne', phone: '+221 233 16 71 88', initialBg: '#25B46E', initials: 'LO' },
    { id: 'c3', name: 'Superviseur NJS', phone: '+221 233 16 71 88', initialBg: '#F97316', initials: 'S' },
    { id: 'c4', name: 'Inconnu', phone: '+221 233 16 71 88', initialBg: '#CBD5E1', initials: '' },
    { id: 'c5', name: 'Inconnu', phone: '+237 6 98 00 40 12', initialBg: '#CBD5E1', initials: '' },
    { id: 'c6', name: 'Inconnu', phone: '+237 6 40 43 01 00', initialBg: '#CBD5E1', initials: '' },
    { id: 'c7', name: 'Inconnu', phone: '+237 6 98 44 43 88', initialBg: '#CBD5E1', initials: '' },
    { id: 'c8', name: 'Lysette Orleanne', phone: '+221 233 16 71 88', initialBg: '#25B46E', initials: 'LO' },
  ];

  return (
    <View className="flex-1 bg-white dark:bg-brand-darkBg">
      <StatusBar style="light" />

      {/* Top Green Header matching Mockup */}
      <View
        style={{
          paddingTop: Math.max(insets.top + 10, 24),
          paddingBottom: 40,
        }}
        className="bg-brand-green px-4 relative rounded-b-3xl"
      >
        <View className="flex-row items-center justify-between min-h-8">
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => {
              if (mode !== 'input') {
                setMode('input');
              } else {
                router.back();
              }
            }}
            className="w-10 h-10 items-center justify-start"
          >
            <Icon name="solar:arrow-left-linear" color="#FFFFFF" size={24} />
          </TouchableOpacity>

          <Text className="font-montserrat-bold font-bold text-lg text-white text-center">
            Vérification numéro
          </Text>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.back()}
            className="w-10 h-10 items-center justify-end"
          >
            <Icon name="ion:close" color="#FFFFFF" size={24} />
          </TouchableOpacity>
        </View>

        {/* Test Mode Switcher Bar (For inspecting all 4 states) */}
        <View className="flex-row justify-center gap-1.5 mt-3 pt-1">
          <TouchableOpacity
            onPress={() => setMode('input')}
            className={`px-2.5 py-1 rounded-full ${mode === 'input' ? 'bg-white' : 'bg-white/20'}`}
          >
            <Text className={`text-[10px] font-bold ${mode === 'input' ? 'text-brand-green' : 'text-white'}`}>
              🔍 Recherche
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setMode('analyzing')}
            className={`px-2.5 py-1 rounded-full ${mode === 'analyzing' ? 'bg-white' : 'bg-white/20'}`}
          >
            <Text className={`text-[10px] font-bold ${mode === 'analyzing' ? 'text-brand-green' : 'text-white'}`}>
              🔄 Analyse
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => switchTestResult('secure')}
            className={`px-2.5 py-1 rounded-full ${mode === 'result' && testResultType === 'secure' ? 'bg-white' : 'bg-white/20'}`}
          >
            <Text className={`text-[10px] font-bold ${mode === 'result' && testResultType === 'secure' ? 'text-brand-green' : 'text-white'}`}>
              ✅ Sécurisé
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => switchTestResult('warning')}
            className={`px-2.5 py-1 rounded-full ${mode === 'result' && testResultType === 'warning' ? 'bg-white' : 'bg-white/20'}`}
          >
            <Text className={`text-[10px] font-bold ${mode === 'result' && testResultType === 'warning' ? 'text-brand-green' : 'text-white'}`}>
              ⚠️ Risque
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => switchTestResult('danger')}
            className={`px-2.5 py-1 rounded-full ${mode === 'result' && testResultType === 'danger' ? 'bg-white' : 'bg-white/20'}`}
          >
            <Text className={`text-[10px] font-bold ${mode === 'result' && testResultType === 'danger' ? 'text-brand-green' : 'text-white'}`}>
              🚨 Danger
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Overlapping Content Container */}
      <View className="flex-1 bg-white dark:bg-brand-darkBg rounded-t-3xl -mt-5 pt-4 px-4 overflow-hidden">
        {mode === 'input' && (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}>
            {/* Input Bar with Flag & Prefix */}
            <View className="flex-row items-center hx-13 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-brand-cardDark px-3.5 mb-5 shadow-sm">
              <CountryFlag countryCode="CM" size={24} />
              <Text className="text-slate-400 font-medium text-sm ml-2 mr-2">+237</Text>
              <View className="h-5 w-[1px] bg-slate-200 dark:bg-slate-700 mr-2.5" />
              <TextInput
                className="flex-1 text-base font-font-regular text-slate-900 dark:text-white py-0"
                placeholder="Entrez le numéro ou le nom"
                placeholderTextColor="#94A3B8"
                keyboardType="phone-pad"
                value={inputPhone}
                onChangeText={setInputPhone}
                onSubmitEditing={handleSearch}
              />
              {inputPhone.length > 0 && (
                <TouchableOpacity onPress={() => startVerificationProcess(inputPhone)}>
                  <Icon name="solar:magnifer-linear" color="#25B46E" size={20} />
                </TouchableOpacity>
              )}
            </View>

            {/* Récents Section */}
            <View className="mb-5">
              <Text className="text-sm font-semibold text-slate-400 dark:text-slate-400 mb-3">
                Récents
              </Text>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => startVerificationProcess('+237 698 00 40 12')}
                className="flex-row items-center"
              >
                <View className="wx-10 hx-10 rounded-full bg-brand-green items-center justify-center mr-3">
                  <Text className="text-white font-bold text-base">#</Text>
                </View>
                <Text className="text-base font-bold text-slate-900 dark:text-white">
                  +237 698 00 40 12
                </Text>
              </TouchableOpacity>
            </View>

            {/* Contacts Section */}
            <View className="mb-4">
              <Text className="text-sm font-semibold text-slate-400 dark:text-slate-400 mb-3">
                Contacts
              </Text>
              {contactsList.map((c) => (
                <TouchableOpacity
                  key={c.id}
                  activeOpacity={0.7}
                  onPress={() => startVerificationProcess(c.phone)}
                  className="flex-row items-center py-2.5"
                >
                  <View
                    style={{ backgroundColor: c.initialBg }}
                    className="wx-10 hx-10 rounded-full items-center justify-center mr-3"
                  >
                    {c.initials ? (
                      <Text className="text-white font-bold text-sm">{c.initials}</Text>
                    ) : (
                      <Icon name="solar:user-bold" color="#FFFFFF" size={22} />
                    )}
                  </View>

                  <View className="flex-1">
                    <Text className="text-sm font-bold text-slate-900 dark:text-white">
                      {c.name}
                    </Text>
                    <Text className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                      {c.phone}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        )}

        {mode === 'analyzing' && (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}>
            {/* Top Notice Banner */}
            <View className="flex-row items-center bg-blue-50/80 dark:bg-slate-800/80 p-4 rounded-2xl mb-4 border border-blue-100 dark:border-slate-700">
              <Icon name="solar:info-circle-bold" color="#6B98FF" size={22} className="mr-3" />
              <Text className="flex-1 text-xs font-medium text-blue-900 dark:text-blue-200">
                Cette operation prend généralement quelques secondes
              </Text>
            </View>

            {/* Animated Graphic */}
            <VerificationGraphic state="analyzing" isDark={isDark} />

            <View className="items-center mb-6">
              <Text className="text-xl font-bold font-title text-slate-900 dark:text-white text-center mb-1.5">
                Analyse en cours...
              </Text>
              <Text className="text-xs font-medium text-slate-400 dark:text-slate-400 text-center px-6">
                Nous vérifions ce numero dans notre base de données et auprès de la communauté
              </Text>
            </View>

            {/* Steps Checklist */}
            <View className="bg-white dark:bg-brand-cardDark rounded-2xl p-2 border border-slate-100 dark:border-slate-800">
              <View className="flex-row justify-between items-center py-3 px-3 border-b border-slate-100 dark:border-slate-800">
                <Text className="text-sm font-medium text-slate-400 dark:text-slate-400">
                  Analyse de la base de données
                </Text>
                <Icon name="solar:shield-minimalistic-bold" color="#CBD5E1" size={20} />
              </View>

              <View className="flex-row justify-between items-center py-3 px-3 border-b border-slate-100 dark:border-slate-800">
                <Text className="text-sm font-medium text-slate-400 dark:text-slate-400">
                  Vérification des signalements
                </Text>
                <Icon name="solar:shield-minimalistic-bold" color="#CBD5E1" size={20} />
              </View>

              <View className="flex-row justify-between items-center py-3 px-3 border-b border-slate-100 dark:border-slate-800">
                <Text className="text-sm font-medium text-slate-400 dark:text-slate-400">
                  Consultation de la communauté
                </Text>
                <Icon name="solar:shield-minimalistic-bold" color="#CBD5E1" size={20} />
              </View>

              <View className="flex-row justify-between items-center py-3 px-3">
                <Text className="text-sm font-medium text-slate-400 dark:text-slate-400">
                  Calcul du score de risque
                </Text>
                <Icon name="solar:shield-minimalistic-bold" color="#CBD5E1" size={20} />
              </View>
            </View>
          </ScrollView>
        )}

        {mode === 'result' && (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}>
            {/* Status Graphic matching testResultType */}
            <VerificationGraphic status={testResultType} isDark={isDark} />

            {/* Status Banner */}
            <View
              className={`w-full py-3 rounded-xl items-center justify-center mb-4 ${
                testResultType === 'secure'
                  ? 'bg-emerald-50 dark:bg-emerald-950/40'
                  : testResultType === 'warning'
                  ? 'bg-amber-50 dark:bg-amber-950/40'
                  : 'bg-red-50 dark:bg-red-950/40'
              }`}
            >
              <Text
                className={`text-xl font-bold ${
                  testResultType === 'secure'
                    ? 'text-brand-green'
                    : testResultType === 'warning'
                    ? 'text-amber-500'
                    : 'text-red-500'
                }`}
              >
                {testResultType === 'secure'
                  ? 'Sécurisé'
                  : testResultType === 'warning'
                  ? 'Risque détecté'
                  : 'Danger'}
              </Text>
            </View>

            {/* Score de risque Card (Dark green card matching mockups) */}
            <View className="bg-[#0A5F43] dark:bg-[#084B35] rounded-2xl p-4 mb-5">
              <View className="flex-row justify-between items-center mb-3">
                <View className="flex-row items-center">
                  <Text className="text-white text-sm font-bold mr-1">Score de risque</Text>
                  <Icon name="solar:info-circle-bold" color="#FFFFFF" size={16} />
                </View>

                <View className="bg-white/20 px-3 py-1 rounded-xl">
                  <Text className="text-white text-xs font-bold">
                    {testResultType === 'secure'
                      ? 'Tres faible'
                      : testResultType === 'warning'
                      ? 'Suspect'
                      : 'Frauduleux'}
                  </Text>
                </View>
              </View>

              {/* Progress Slider Track */}
              <View className="mt-1">
                <View className="flex-row justify-between mb-1">
                  <Text className="text-white text-xs font-medium">0</Text>
                  <Text className="text-white text-xs font-medium">100</Text>
                </View>

                <View className="hx-2 bg-white/30 rounded-full overflow-hidden">
                  <View
                    className="h-full bg-white rounded-full"
                    style={{
                      width: `${
                        testResultType === 'secure'
                          ? 5
                          : testResultType === 'warning'
                          ? 50
                          : 90
                      }%`,
                    }}
                  />
                </View>
              </View>
            </View>

            {/* Historique communautaire */}
            <View className="mb-6">
              <Text className="text-base font-bold text-slate-900 dark:text-white mb-3">
                Historique communautaire
              </Text>

              <View className="flex-row justify-between items-center py-3 border-b border-slate-100 dark:border-slate-800">
                <View className="flex-row items-center">
                  <Icon name="ph:alarm" color={isDark ? '#94A3B8' : '#0F172A'} size={22} className="mr-3" />
                  <Text className="text-sm font-medium text-slate-900 dark:text-white ml-2">
                    Signalements
                  </Text>
                </View>
                <Text className="text-base font-bold text-slate-900 dark:text-white">
                  {testResultType === 'secure' ? '0' : testResultType === 'warning' ? '50' : '90'}
                </Text>
              </View>

              <View className="flex-row justify-between items-center py-3 border-b border-slate-100 dark:border-slate-800">
                <View className="flex-row items-center">
                  <Icon name="solar:chat-round-line-bold" color={isDark ? '#94A3B8' : '#0F172A'} size={22} className="mr-3" />
                  <Text className="text-sm font-medium text-slate-900 dark:text-white ml-2">
                    Commentaires positifs
                  </Text>
                </View>
                <Text className="text-base font-bold text-slate-900 dark:text-white">
                  {testResultType === 'secure' ? '24' : testResultType === 'warning' ? '10' : '00'}
                </Text>
              </View>

              <Text className="text-xs font-medium text-slate-400 dark:text-slate-400 mt-3">
                Dernier signalement il y’a 8 mois
              </Text>
            </View>

            {/* Action Button: Transferer */}
            <TouchableOpacity
              activeOpacity={0.88}
              onPress={() =>
                router.push({
                  pathname: '/(app)/transfer',
                  params: { recipient: inputPhone || '+237698004012' },
                })
              }
              className="w-full hx-13 rounded-2xl bg-brand-orange justify-center items-center shadow-md shadow-brand-orange/30 mb-4"
            >
              <Text className="text-white text-base font-bold">Transferer</Text>
            </TouchableOpacity>
          </ScrollView>
        )}
      </View>
    </View>
  );
}
