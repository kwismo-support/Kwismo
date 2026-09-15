import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Switch,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useTranslation } from 'react-i18next';
import { Icon } from '@/shared/ui/Icon';
import { HeaderBar } from '@/shared/components/HeaderBar';
import { Skeleton, SkeletonLoader } from '@/shared/ui/Skeleton';
import { useAppTheme } from '@/shared/hooks/useAppTheme';
import { toast } from '@/shared/store/toastStore';

const USER_REGISTERED_NUMBERS = [
  { id: '1', phone: '+237 6 98 44 43 88', operator: 'Orange Cameroun', isProtected: true, countryCode: 'CM' },
  { id: '2', phone: '+237 6 70 12 34 56', operator: 'MTN Cameroun', isProtected: false, countryCode: 'CM' },
];

export default function AlertWhatsappScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { isDark } = useAppTheme();

  const [loading, setLoading] = useState(true);
  const [selectedNumberId, setSelectedNumberId] = useState('1');
  const [protectionEnabled, setProtectionEnabled] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const handleSelectNumber = (id: string, currentlyProtected: boolean) => {
    setSelectedNumberId(id);
    setProtectionEnabled(currentlyProtected);
  };

  const handleSaveSettings = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast.success(
        t('whatsapp.settingsSaved', 'Paramètres d’alerte WhatsApp enregistrés avec succès !')
      );
    }, 600);
  };

  const selectedNumberObj = USER_REGISTERED_NUMBERS.find((n) => n.id === selectedNumberId);

  return (
    <View className="flex-1 bg-brand-green">
      <StatusBar style="light" />

      <HeaderBar
        title={t('whatsapp.title', 'Alerte WhatsApp')}
        showBack={true}
      />

      <View className="flex-1 bg-slate-50 dark:bg-brand-darkBg rounded-tl-3xl overflow-hidden">
        <ScrollView
          contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
          showsVerticalScrollIndicator={false}
          className="px-4 pt-5"
        >
          <View className="flex-row items-start p-4 rounded-2xl border border-brand-green bg-emerald-50 dark:bg-emerald-950/40">
            <Icon name="ic:baseline-whatsapp" color="#25D366" size={28} className="mr-3" />
            <View className="flex-1">
              <Text className="font-font-bold text-sm font-bold text-emerald-900 dark:text-emerald-300 mb-1">
                {t('whatsapp.subtitle', 'Protection anti-piratage WhatsApp')}
              </Text>
              <Text className="font-font-regular text-xs text-emerald-700 dark:text-emerald-400 leading-4.5">
                {t(
                  'whatsapp.noticeText',
                  'En activant cette protection, Kwismo surveillera automatiquement les tentatives d’usurpation de votre compte WhatsApp sur le numéro sélectionné.'
                )}
              </Text>
            </View>
          </View>

          <Text className="font-font-bold text-base font-extrabold text-slate-900 dark:text-white mt-5">
            {t('whatsapp.selectNumberLabel', 'Sélectionner le numéro à protéger')}
          </Text>

          {loading ? (
            <SkeletonLoader>
              <View className="gap-2.5 mt-2.5">
                <Skeleton width="100%" height={70} borderRadius={16} />
                <Skeleton width="100%" height={70} borderRadius={16} />
              </View>
            </SkeletonLoader>
          ) : (
            <View className="gap-2.5 mt-2.5">
              {USER_REGISTERED_NUMBERS.map((item) => {
                const isSelected = selectedNumberId === item.id;
                return (
                  <TouchableOpacity
                    key={item.id}
                    activeOpacity={0.8}
                    onPress={() => handleSelectNumber(item.id, item.isProtected)}
                    className={`flex-row items-center justify-between p-3.5 rounded-2xl border-2 ${
                      isSelected
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 border-brand-green'
                        : 'bg-white dark:bg-brand-cardDark border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <View className="flex-row items-center">
                      <View
                        className={`w-5 h-5 rounded-full border-2 items-center justify-center ${
                          isSelected ? 'border-brand-green' : 'border-slate-300 dark:border-slate-600'
                        }`}
                      >
                        {isSelected && <View className="w-2.5 h-2.5 rounded-full bg-brand-green" />}
                      </View>

                      <View className="ml-3">
                        <Text className="font-font-bold text-sm font-bold text-slate-900 dark:text-white">
                          {item.phone}
                        </Text>
                        <Text className="font-font-regular text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          {item.operator}
                        </Text>
                      </View>
                    </View>

                    <View
                      className={`px-2.5 py-1 rounded-xl ${
                        item.isProtected
                          ? 'bg-emerald-100 dark:bg-emerald-950/50'
                          : 'bg-slate-100 dark:bg-slate-800'
                      }`}
                    >
                      <Text
                        className={`font-font-bold text-xs font-bold ${
                          item.isProtected ? 'text-brand-green' : 'text-slate-500 dark:text-slate-400'
                        }`}
                      >
                        {item.isProtected
                          ? t('whatsapp.statusProtected', 'Protégé')
                          : t('whatsapp.statusNotProtected', 'Non protégé')}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          <View className="flex-row items-center justify-between p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-brand-cardDark mt-5">
            <View className="flex-1 pr-3">
              <Text className="font-font-bold text-sm font-bold text-slate-900 dark:text-white">
                {t('whatsapp.enableProtection', 'Activer la détection de piratage')}
              </Text>
              <Text className="font-font-regular text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {selectedNumberObj ? selectedNumberObj.phone : ''}
              </Text>
            </View>

            <Switch
              value={protectionEnabled}
              onValueChange={setProtectionEnabled}
              trackColor={{ false: '#CBD5E1', true: '#25B876' }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View
            className={`flex-row items-center p-4 rounded-2xl border mt-5 ${
              protectionEnabled
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-brand-green'
                : 'bg-red-50 dark:bg-red-950/40 border-red-500'
            }`}
          >
            <Icon
              name={protectionEnabled ? 'solar:shield-check-bold' : 'solar:shield-warning-bold'}
              color={protectionEnabled ? '#25B876' : '#EF4444'}
              size={24}
              className="mr-3"
            />
            <View className="flex-1">
              <Text
                className={`font-font-bold text-sm font-bold ${
                  protectionEnabled ? 'text-brand-green' : 'text-red-500'
                }`}
              >
                {protectionEnabled
                  ? t('whatsapp.statusProtected', 'Protection WhatsApp Active')
                  : t('whatsapp.statusNotProtected', 'Protection Désactivée')}
              </Text>
              <Text className="font-font-regular text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                {protectionEnabled
                  ? 'Alerte instantanée en cas de connexion suspecte sur un autre appareil.'
                  : 'Ce numéro ne recevra pas d’alertes préventives sur WhatsApp.'}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            activeOpacity={0.85}
            disabled={isSaving}
            onPress={handleSaveSettings}
            className="flex-row items-center justify-center h-13 rounded-2xl bg-brand-green mt-7"
          >
            {isSaving ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Icon name="solar:check-read-bold" color="#FFFFFF" size={20} className="mr-2" />
                <Text className="font-font-bold text-base font-bold text-white">
                  {t('whatsapp.saveSettings', 'Enregistrer la configuration')}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      </View>
    </View>
  );
}

