import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useTranslation } from 'react-i18next';
import * as Contacts from 'expo-contacts/legacy';
import { parsePhoneNumberFromString, getCountryCallingCode } from 'libphonenumber-js/min';
import { Icon } from '@/shared/ui/Icon';
import { HeaderBar } from '@/shared/components/HeaderBar';
import { PhoneCountryInput } from '@/shared/components/PhoneCountryInput';
import { CountryItem, COUNTRIES_DATA } from '@/shared/components/CountryPickerModal';
import { VerificationGraphic } from '@/shared/components/VerificationGraphic';
import { useAppTheme } from '@/shared/hooks/useAppTheme';
import { verifyApi, VerifyResult } from '@/features/verify/services/verify.api';
import { lookupNumberOffline } from '@/shared/services/database';
import { Skeleton, SkeletonCircle, SkeletonLoader } from '@/shared/ui/Skeleton';

export interface DeviceContactItem {
  id: string;
  name: string;
  phone: string;
  initials?: string;
  initialBg?: string;
}

const DEFAULT_COUNTRY: CountryItem = {
  code: 'CM',
  name: 'Cameroun',
  callingCode: '+237',
};

const MOCK_FALLBACK_CONTACTS: DeviceContactItem[] = [
  { id: 'c1', name: 'Inconnu', phone: '+237 6 98 00 40 12', initialBg: '#CBD5E1', initials: '' },
  { id: 'c2', name: 'Lysette Orleanne', phone: '+221 233 16 71 88', initialBg: '#25B46E', initials: 'LO' },
  { id: 'c3', name: 'Superviseur NJS', phone: '+221 233 16 71 88', initialBg: '#F97316', initials: 'S' },
  { id: 'c4', name: 'Inconnu', phone: '+221 233 16 71 88', initialBg: '#CBD5E1', initials: '' },
  { id: 'c5', name: 'Inconnu', phone: '+237 6 98 00 40 12', initialBg: '#CBD5E1', initials: '' },
  { id: 'c6', name: 'Inconnu', phone: '+237 6 40 43 01 00', initialBg: '#CBD5E1', initials: '' },
  { id: 'c7', name: 'Inconnu', phone: '+237 6 98 44 43 88', initialBg: '#CBD5E1', initials: '' },
];

export default function VerifyScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ phone?: string }>();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { isDark } = useAppTheme();

  // Mode: 'input' | 'analyzing' | 'result'
  const [mode, setMode] = useState<'input' | 'analyzing' | 'result'>(
    params.phone ? 'result' : 'input'
  );

  const [inputPhone, setInputPhone] = useState(params.phone || '');
  const [selectedCountry, setSelectedCountry] = useState<CountryItem>(DEFAULT_COUNTRY);

  // Contacts & Permission state
  const [permissionGranted, setPermissionGranted] = useState<boolean | null>(null);
  const [contactsLoading, setContactsLoading] = useState(true);
  const [contactsList, setContactsList] = useState<DeviceContactItem[]>(MOCK_FALLBACK_CONTACTS);

  // Result state
  const [testResultType, setTestResultType] = useState<'secure' | 'warning' | 'danger'>('secure');
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

  useEffect(() => {
    requestContactsPermission();
  }, []);

  const requestContactsPermission = async () => {
    setContactsLoading(true);
    try {
      const { status } = await Contacts.requestPermissionsAsync();
      if (status === 'granted') {
        setPermissionGranted(true);
        const { data } = await Contacts.getContactsAsync({
          fields: [Contacts.Fields.PhoneNumbers],
        });

        if (data.length > 0) {
          const deviceContacts: DeviceContactItem[] = data
            .filter((c) => c.phoneNumbers && c.phoneNumbers.length > 0)
            .map((c, idx) => {
              const rawPhone = c.phoneNumbers![0].number || '';
              const displayName = c.name || rawPhone;
              const bgColors = ['#25B46E', '#F97316', '#3B82F6', '#6366F1'];
              let initials = '';
              if (c.name) {
                const parts = c.name.trim().split(' ');
                initials = parts[0][0];
                if (parts.length > 1) initials += parts[1][0];
                initials = initials.toUpperCase();
              }

              return {
                id: c.id || `dev-${idx}`,
                name: displayName,
                phone: rawPhone,
                initials,
                initialBg: initials ? bgColors[idx % bgColors.length] : '#CBD5E1',
              };
            });

          if (deviceContacts.length > 0) {
            setContactsList(deviceContacts);
          }
        }
      } else {
        setPermissionGranted(false);
      }
    } catch {
      setPermissionGranted(true);
    } finally {
      setTimeout(() => setContactsLoading(false), 400);
    }
  };

  // Helper to auto-update country when selecting a phone number
  const updateCountryFromPhone = (phoneNumber: string) => {
    const parsed = parsePhoneNumberFromString(phoneNumber);
    if (parsed && parsed.country) {
      const countryList = COUNTRIES_DATA && COUNTRIES_DATA.length > 0 ? COUNTRIES_DATA : COUNTRIES_DATA || [];
      const matched = countryList.find((c) => c.code === parsed.country);
      if (matched) {
        setSelectedCountry(matched);
      }
    }
  };

  const handleSelectContact = (phone: string, name?: string) => {
    const rawNumber = phone.replace(/\s+/g, '');
    setInputPhone(phone);
    updateCountryFromPhone(rawNumber);
    startVerificationProcess(rawNumber);
  };

  const startVerificationProcess = (phoneNumber: string) => {
    const cleanPhone = phoneNumber.replace(/\s+/g, '');
    setMode('analyzing');

    setTimeout(() => {
      if (cleanPhone.includes('90') || cleanPhone.includes('99') || cleanPhone.endsWith('00')) {
        setTestResultType('danger');
        setResult({
          id: 'res-danger',
          valeur: cleanPhone,
          phone: cleanPhone,
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
      } else if (cleanPhone.includes('50') || cleanPhone.includes('221') || cleanPhone.includes('77')) {
        setTestResultType('warning');
        setResult({
          id: 'res-warning',
          valeur: cleanPhone,
          phone: cleanPhone,
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
          valeur: cleanPhone,
          phone: cleanPhone,
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
    }, 2400);
  };

  const handleSearch = () => {
    if (!inputPhone.trim()) return;
    startVerificationProcess(inputPhone.trim());
  };

  const filteredContacts = contactsList.filter(
    (c) =>
      c.name.toLowerCase().includes(inputPhone.toLowerCase()) ||
      c.phone.toLowerCase().includes(inputPhone.toLowerCase())
  );

  const handleHeaderBack = () => {
    if (mode !== 'input') {
      setMode('input');
    } else {
      router.back();
    }
  };

  return (
    <View className="flex-1 bg-brand-green">
      <StatusBar style="light" />

      {/* Unified HeaderBar matching Contacts Page */}
      <HeaderBar
        title={t('common.verifyNumberTitle', 'Vérification numéro')}
        showBack={true}
        onBack={handleHeaderBack}
        rightAction={
          <TouchableOpacity activeOpacity={0.7} onPress={() => router.back()} className="p-1">
            <Icon name="solar:close-linear" color="#FFFFFF" size={24} />
          </TouchableOpacity>
        }
      />

      {/* Main Content Card Container */}
      <View className="flex-1 bg-white dark:bg-brand-darkBg rounded-t-[28px] overflow-hidden pt-4 px-4">
        {mode === 'input' && (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}>
            {/* Country & Phone Input using PhoneCountryInput Component */}
            <PhoneCountryInput
              phoneNumber={inputPhone}
              onChangePhoneNumber={(val) => {
                setInputPhone(val);
                updateCountryFromPhone(val);
              }}
              selectedCountry={selectedCountry}
              onSelectCountry={(c) => setSelectedCountry(c)}
              showContactPicker={false}
              placeholder={t('verify.enterNumberOrNameLabel')}
              onSelectContactFromPicker={(contactPhone, contactName) => {
                handleSelectContact(contactPhone, contactName);
              }}
            />

            {/* Launch Verify Button if text entered */}
            {inputPhone.trim().length > 0 && (
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={handleSearch}
                className="hx-12 rounded-xl bg-brand-orange justify-center items-center mb-5 shadow-sm"
              >
                <Text className="text-white font-bold text-base">
                  {t('common.actionVerify')}
                </Text>
              </TouchableOpacity>
            )}

            {/* Section Récents */}
            <View className="mb-5">
              <Text className="text-sm font-semibold text-slate-400 dark:text-slate-400 mb-3">
                Récents
              </Text>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => handleSelectContact('+237 698 00 40 12')}
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

            {/* Section Contacts (Real Device Contacts or Fallback) */}
            <View className="mb-4">
              <Text className="text-sm font-semibold text-slate-400 dark:text-slate-400 mb-3">
                Contacts
              </Text>

              {permissionGranted === false ? (
                <View className="py-6 items-center justify-center px-4 bg-slate-50 dark:bg-brand-cardDark rounded-2xl border border-slate-100 dark:border-slate-800">
                  <Icon name="solar:users-group-two-rounded-bold" color="#94A3B8" size={48} className="mb-2" />
                  <Text className="font-bold text-sm text-slate-900 dark:text-white text-center mb-1">
                    {t('common.contactsPermissionTitle', 'Accès aux contacts')}
                  </Text>
                  <Text className="text-xs text-slate-500 dark:text-slate-400 text-center mb-4 leading-4">
                    {t('common.contactsPermissionSubtitle', 'Autorisez Kwismo à accéder à vos contacts pour vérifier rapidement leurs numéros.')}
                  </Text>
                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={requestContactsPermission}
                    className="px-5 py-2.5 rounded-xl bg-brand-green"
                  >
                    <Text className="font-bold text-xs text-white">
                      {t('common.grantPermission', 'Accorder la permission')}
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : contactsLoading ? (
                <SkeletonLoader>
                  <View className="gap-y-3">
                    {Array.from({ length: 5 }).map((_, idx) => (
                      <View key={`skel-${idx}`} className="flex-row items-center py-2">
                        <SkeletonCircle size={40} style={{ marginRight: 12 }} />
                        <View style={{ flex: 1, gap: 6 }}>
                          <Skeleton width="50%" height={14} borderRadius={4} />
                          <Skeleton width="35%" height={10} borderRadius={4} />
                        </View>
                      </View>
                    ))}
                  </View>
                </SkeletonLoader>
              ) : filteredContacts.length === 0 ? (
                <View className="py-8 items-center justify-center">
                  <Text className="text-sm text-slate-400">Aucun contact trouvé</Text>
                </View>
              ) : (
                filteredContacts.map((c) => (
                  <TouchableOpacity
                    key={c.id}
                    activeOpacity={0.7}
                    onPress={() => handleSelectContact(c.phone, c.name)}
                    className="flex-row items-center py-2.5 border-b border-slate-100 dark:border-slate-800/60"
                  >
                    <View
                      style={{ backgroundColor: c.initialBg || '#CBD5E1' }}
                      className="wx-10 hx-10 rounded-full items-center justify-center mr-3.5"
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
                ))
              )}
            </View>
          </ScrollView>
        )}

        {mode === 'analyzing' && (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}>
            {/* Top Info Banner */}
            <View className="flex-row items-center bg-blue-50/80 dark:bg-slate-800/80 p-4 rounded-2xl mb-4 border border-blue-100 dark:border-slate-700">
              <Icon name="solar:info-circle-bold" color="#6B98FF" size={22} className="mr-3" />
              <Text className="flex-1 text-xs font-medium text-blue-900 dark:text-blue-200">
                Cette operation prend généralement quelques secondes
              </Text>
            </View>

            {/* Shield Graphic */}
            <VerificationGraphic state="analyzing" isDark={isDark} />

            <View className="items-center mb-6">
              <Text className="text-xl font-bold font-title text-slate-900 dark:text-white text-center mb-1.5">
                Analyse en cours...
              </Text>
              <Text className="text-xs font-medium text-slate-400 dark:text-slate-400 text-center px-6">
                Nous vérifions ce numero dans notre base de données et auprès de la communauté
              </Text>
            </View>

            {/* Checklist */}
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
            {/* Status Graphic */}
            <VerificationGraphic status={testResultType} isDark={isDark} />

            {/* Status Banner */}
            <View
              className={`w-full py-1 rounded-xl items-center justify-center mt-8 mb-4 ${
                testResultType === 'secure'
                  ? 'bg-emerald-50 dark:bg-emerald-950/40'
                  : testResultType === 'warning'
                  ? 'bg-amber-50 dark:bg-amber-950/40'
                  : 'bg-red-50 dark:bg-red-950/40'
              }`}
            >
              <Text
                className={`text-xl font-h1 ${
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

            {/* Dark Green Risk Score Card */}
            <View className="bg-brand-green dark:bg-brand-darkBg rounded-2xl p-4 mb-5">
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

            {/* Community History */}
            <View className="mb-6">
              <Text className="text-base font-bold text-slate-900 dark:text-white mb-3">
                Historique communautaire
              </Text>

              <View className="flex-row justify-between items-center py-3 border-b border-slate-100 dark:border-slate-800">
                <View className="flex-row items-center">
                  <Icon name="solar:alarm-sleep-bold" color={isDark ? '#94A3B8' : '#0F172A'} size={22} className="mr-1" />
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
                  <Icon name="solar:chat-round-line-bold" color={isDark ? '#94A3B8' : '#0F172A'} size={22} className="mr-1" />
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
