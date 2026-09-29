import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useTranslation } from 'react-i18next';
import * as Contacts from 'expo-contacts/legacy';
import { Icon } from '@/shared/ui/Icon';
import { HeaderBar } from '@/shared/components/HeaderBar';
import { toast } from '@/shared/store/toastStore';
import { useAppTheme } from '@/shared/hooks/useAppTheme';
import { activityHistoryService } from '@/shared/services/activityHistoryService';
import { contactsApi } from '@/features/contacts/services/contacts.api';
import { whatsappApi } from '@/features/whatsapp-alert/services/whatsapp.api';
import { ApiClient } from '@/shared/services/apiClient';

interface KwismoContactItem {
  id: string;
  name: string;
  phone: string;
  hasKwismo: boolean;
  initialBg?: string;
  initials?: string;
}

type Step = 'select_contacts' | 'configure_message' | 'broadcasting' | 'success' | 'failure';

export default function AlertWhatsappScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { isDark } = useAppTheme();

  const [contacts, setContacts] = useState<KwismoContactItem[]>([]);
  const [loadingContacts, setLoadingContacts] = useState(true);
  const [step, setStep] = useState<Step>('select_contacts');
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [messageText, setMessageText] = useState(
    'ALERTE : Mon compte WhatsApp a été piraté. Ne répondez à aucun message et ne validez aucun transfert d’argent provenant de ce numéro.'
  );
  const [progress, setProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Contacts.requestPermissionsAsync();
        if (status === 'granted') {
          const { data } = await Contacts.getContactsAsync({
            fields: [Contacts.Fields.PhoneNumbers],
          });

          if (data && data.length > 0) {
            const bgColors = ['#25B46E', '#F97316', '#3B82F6', '#6366F1'];
            const localDeviceContacts = data
              .filter((c) => c.phoneNumbers && c.phoneNumbers.length > 0)
              .map((c, idx) => {
                const phone = c.phoneNumbers![0].number || '';
                const nameParts = [(c as any).firstName, (c as any).middleName, (c as any).lastName].filter(Boolean).join(' ');
                const name = c.name || (nameParts.length > 0 ? nameParts : ((c as any).company || (c as any).nickname || phone));
                let initials = '';
                if (name) {
                  const parts = name.trim().split(' ');
                  initials = parts[0][0];
                  if (parts.length > 1) initials += parts[1][0];
                  initials = initials.toUpperCase();
                }
                return {
                  id: c.id || `contact-${idx}`,
                  name,
                  phone,
                  initials,
                  initialBg: initials ? bgColors[idx % bgColors.length] : '#CBD5E1',
                };
              });

            // Sync with backend to get real Kwismo members & DB contact IDs
            const syncPayload = localDeviceContacts.map((c) => ({
              nom: c.name,
              numero: c.phone,
            }));

            const syncRes = await contactsApi.syncContacts(syncPayload);
            if (syncRes.success && Array.isArray(syncRes.data)) {
              const onlineKwismoContacts: KwismoContactItem[] = syncRes.data
                .filter((c: any) => c.has_kwismo === true || c.hasKwismo === true || (Boolean(c.statut) && c.statut !== 'inconnu' && c.statut !== 'unknown'))
                .map((c: any, idx: number) => {
                  const existingLocal = localDeviceContacts.find(
                    (item) => item.phone.replace(/\s+/g, '') === c.numero.replace(/\s+/g, '')
                  );
                  return {
                    id: c.id,
                    name: existingLocal?.name || c.nom || c.numero,
                    phone: c.numero,
                    hasKwismo: true,
                    initials: existingLocal?.initials || 'KW',
                    initialBg: existingLocal?.initialBg || bgColors[idx % bgColors.length],
                  };
                });

              setContacts(onlineKwismoContacts);
            } else {
              setContacts([]);
            }
          }
        }
      } catch (err) {
        console.error('Error fetching contacts for WhatsApp alert:', err);
      } finally {
        setLoadingContacts(false);
      }
    })();
  }, []);

  const filteredContacts = contacts.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.toLowerCase().includes(search.toLowerCase())
  );

  const allSelected =
    filteredContacts.length > 0 &&
    filteredContacts.every((c) => selectedIds.has(c.id));

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredContacts.map((c) => c.id)));
    }
  };

  const toggleSelectContact = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleNextToMessage = () => {
    if (selectedIds.size === 0) {
      toast.info('Veuillez sélectionner au moins un contact Kwismo.');
      return;
    }
    setStep('configure_message');
  };

  const startBroadcast = async () => {
    if (selectedIds.size === 0) {
      toast.info('Veuillez sélectionner au moins un contact Kwismo.');
      setStep('select_contacts');
      return;
    }

    setStep('broadcasting');
    setProgress(15);
    setErrorMessage('');

    try {
      // 1. Fetch user phones to get active user_phone_id
      const userPhonesRes = await ApiClient.request<any[]>('/users/me/phones', {
        method: 'GET',
        silent: true,
      });

      const activePhone = Array.isArray(userPhonesRes) && userPhonesRes.length > 0
        ? userPhonesRes[0]
        : null;

      if (!activePhone || !activePhone.id) {
        throw new Error('Aucun numéro enregistré sur votre compte Kwismo.');
      }

      setProgress(40);

      // 2. Declare WhatsApp incident
      const incidentRes = await whatsappApi.declareIncident({
        user_phone_id: activePhone.id,
      });

      const incidentData = incidentRes.data;
      const incidentId = incidentData?.compromise_incident_id || incidentData?.id;
      if (!incidentId) {
        throw new Error(incidentRes.message || "Impossible d'initialiser l'incident d'alerte.");
      }

      setProgress(70);

      // 3. Broadcast alert to selected contacts
      await whatsappApi.broadcastAlert({
        compromise_incident_id: incidentId,
        contact_ids: Array.from(selectedIds),
        contenu: messageText,
      });

      setProgress(100);
      setStep('success');

      activityHistoryService.addActivity({
        phone: 'Alerte WhatsApp',
        type: 'common.actionWhatsapp',
        category: 'threats',
        status: 'common.alertWhatsapp',
        badgeType: 'yellow',
      });
    } catch (err: any) {
      console.error('WhatsApp Broadcast error:', err);
      setErrorMessage(err?.message || 'Erreur lors de la diffusion de l’alerte.');
      setStep('failure');
    }
  };

  const handleHeaderBack = () => {
    if (step === 'configure_message') {
      setStep('select_contacts');
    } else if (step === 'broadcasting' || step === 'success' || step === 'failure') {
      setStep('select_contacts');
    } else {
      router.back();
    }
  };

  const selectedCount = selectedIds.size;

  return (
    <View className="flex-1 bg-brand-green">
      <StatusBar style="light" />

      <HeaderBar
        title={t('whatsapp.title')}
        showBack={true}
        onBack={handleHeaderBack}
        rightAction={
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.back()}
            className="p-1"
          >
            <Icon name="gravity-ui:check" color="#FFFFFF" size={24} />
          </TouchableOpacity>
        }
      />

      <View className="flex-1 bg-white dark:bg-brand-darkBg rounded-t-[28px] overflow-hidden pt-4 px-5">
        {/* STEP 1: SELECT CONTACTS */}
        {step === 'select_contacts' && (
          <ScrollView
            contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
            showsVerticalScrollIndicator={false}
          >
            {/* Search input */}
            <View className="flex-row items-center h-12 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-brand-cardDark px-4 mb-4 shadow-sm">
              <Icon name="solar:magnifer-linear" color="#94A3B8" size={20} className="mr-3" />
              <TextInput
                className="flex-1 text-sm font-medium text-slate-900 dark:text-white"
                placeholder={t('common.searchPlaceholderContacts')}
                placeholderTextColor="#94A3B8"
                value={search}
                onChangeText={setSearch}
              />
            </View>

            {/* Header select row */}
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-sm font-semibold text-slate-400 dark:text-slate-500">
                Contacts Kwismo uniquement ({filteredContacts.length})
              </Text>

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={toggleSelectAll}
                className="flex-row items-center gap-2"
              >
                <Text className="text-xs font-medium text-slate-400 dark:text-slate-500">
                  {t('common.selectAll')}
                </Text>
                <View
                  className={`w-5 h-5 rounded-full border items-center justify-center ${
                    allSelected
                      ? 'border-brand-green bg-brand-green'
                      : 'border-slate-300 dark:border-slate-600'
                  }`}
                >
                  {allSelected && <Icon name="gravity-ui:check" color="#FFFFFF" size={14} />}
                </View>
              </TouchableOpacity>
            </View>

            {/* Contacts list */}
            <View className="gap-y-1 mb-6">
              {loadingContacts ? (
                <View className="py-8 items-center justify-center">
                  <ActivityIndicator size="small" color="#00A859" />
                </View>
              ) : filteredContacts.length === 0 ? (
                <View className="py-8 items-center justify-center">
                  <Text className="text-xs text-slate-500 dark:text-slate-400 text-center mb-3">
                    Aucun contact Kwismo trouvé dans votre carnet d'adresses.
                  </Text>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => router.push('/(app)/contacts')}
                    className="px-4 py-2 bg-emerald-100 rounded-full"
                  >
                    <Text className="text-xs font-bold text-brand-green">
                      Inviter mes contacts
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : (
                filteredContacts.map((contact) => {
                  const isSelected = selectedIds.has(contact.id);
                  return (
                    <TouchableOpacity
                      key={contact.id}
                      activeOpacity={0.7}
                      onPress={() => toggleSelectContact(contact.id)}
                      className="flex-row items-center justify-between py-3 border-b border-slate-100 dark:border-slate-800/60"
                    >
                      <View className="flex-row items-center flex-1 pr-3">
                        <View
                          style={{ backgroundColor: contact.initialBg || '#CBD5E1' }}
                          className="w-11 h-11 rounded-full items-center justify-center mr-3.5"
                        >
                          {contact.initials ? (
                            <Text className="text-white font-bold text-sm">{contact.initials}</Text>
                          ) : (
                            <Icon name="solar:user-bold" color="#FFFFFF" size={22} />
                          )}
                        </View>

                        <View className="flex-1">
                          <Text className="font-montserrat-bold text-sm font-bold text-slate-900 dark:text-white">
                            {contact.name}
                          </Text>
                          <Text className="text-xs font-medium text-slate-400 dark:text-slate-400 mt-0.5">
                            {contact.phone}
                          </Text>
                        </View>
                      </View>

                      <View
                        className={`w-5 h-5 rounded-full border items-center justify-center ${
                          isSelected
                            ? 'border-brand-green bg-brand-green'
                            : 'border-slate-300 dark:border-slate-600'
                        }`}
                      >
                        {isSelected && <Icon name="gravity-ui:check" color="#FFFFFF" size={14} />}
                      </View>
                    </TouchableOpacity>
                  );
                })
              )}
            </View>

            {/* Suivant Button */}
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleNextToMessage}
              className="h-13 rounded-2xl bg-brand-orange justify-center items-center mb-6 shadow-md shadow-brand-orange/30"
            >
              <Text className="font-montserrat-bold text-base font-bold text-white">
                {t('common.next')} ({selectedIds.size})
              </Text>
            </TouchableOpacity>
          </ScrollView>
        )}

        {/* STEP 2: CONFIGURE MESSAGE */}
        {step === 'configure_message' && (
          <ScrollView
            contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
            showsVerticalScrollIndicator={false}
            className="pt-2"
          >
            <Text className="font-montserrat-bold text-lg font-bold text-slate-900 dark:text-white mb-2">
              Modèle du message
            </Text>

            {/* Message Template Input Box */}
            <View className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-brand-cardDark mb-6">
              <TextInput
                multiline
                numberOfLines={5}
                textAlignVertical="top"
                value={messageText}
                onChangeText={setMessageText}
                className="text-sm font-medium text-slate-900 dark:text-white leading-6 min-h-[120px]"
              />
            </View>

            {/* Info Container */}
            <View className="flex-row items-center p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/40 mb-8">
              <Icon name="solar:info-circle-bold" color="#6B98FF" size={22} className="mr-3" />
              <Text className="flex-1 text-xs font-medium text-blue-900 dark:text-blue-200 leading-4.5">
                Ce message sera envoyé sous forme de notification (push et in-app) à vos {selectedCount} contact(s) Kwismo sélectionné(s).
              </Text>
            </View>

            {/* Envoyer Button */}
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={startBroadcast}
              className="h-13 rounded-2xl bg-brand-orange justify-center items-center mb-6 shadow-md shadow-brand-orange/30"
            >
              <Text className="font-montserrat-bold text-base font-bold text-white">
                {t('common.send')} ({selectedCount})
              </Text>
            </TouchableOpacity>
          </ScrollView>
        )}

        {/* STEP 3: BROADCASTING LOADING STATE */}
        {step === 'broadcasting' && (
          <View className="flex-1 items-center justify-center px-4 pb-12">
            <View className="w-36 h-36 rounded-full bg-emerald-50 dark:bg-emerald-950/30 items-center justify-center mb-8 relative">
              <Icon name="solar:shield-warning-bold" color="#25B876" size={68} />
              <ActivityIndicator
                size="large"
                color="#25B876"
                className="absolute"
              />
            </View>

            <Text className="font-montserrat-bold text-xl font-bold text-slate-900 dark:text-white text-center mb-2">
              {t('whatsapp.broadcastingTitle')}
            </Text>

            <Text className="text-xs text-slate-400 dark:text-slate-400 text-center max-w-[280px] leading-5 mb-8">
              {t('whatsapp.broadcastingSub', { count: selectedCount })}
            </Text>

            {/* Progress Bar */}
            <View className="w-full max-w-[280px] h-2 bg-emerald-100 dark:bg-emerald-950 rounded-full overflow-hidden">
              <View
                style={{ width: `${progress}%` }}
                className="h-full bg-brand-green rounded-full"
              />
            </View>
          </View>
        )}

        {/* STEP 4: SUCCESS STATE */}
        {step === 'success' && (
          <View className="flex-1 items-center justify-center px-4 pb-12">
            <View className="w-36 h-36 rounded-full bg-emerald-50 dark:bg-emerald-950/30 items-center justify-center mb-8">
              <View className="w-20 h-20 rounded-full bg-brand-green items-center justify-center shadow-lg shadow-emerald-500/30">
                <Icon name="gravity-ui:check" color="#FFFFFF" size={40} />
              </View>
            </View>

            <Text className="font-montserrat-bold text-xl font-bold text-slate-900 dark:text-white text-center mb-2">
              {t('whatsapp.broadcastSuccessTitle')}
            </Text>

            <Text className="text-xs text-slate-400 dark:text-slate-400 text-center max-w-[280px] leading-5 mb-8">
              L'alerte a été diffusée par notification push avec succès à vos {selectedCount} contact(s) Kwismo.
            </Text>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => router.back()}
              className="w-full max-w-[280px] h-13 rounded-2xl bg-brand-green justify-center items-center shadow-md shadow-emerald-500/30"
            >
              <Text className="font-montserrat-bold text-base font-bold text-white">
                {t('common.continue')}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* STEP 5: FAILURE STATE */}
        {step === 'failure' && (
          <ScrollView
            contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
            showsVerticalScrollIndicator={false}
            className="pt-2"
          >
            <View className="flex-row items-start p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 mb-8">
              <Icon name="solar:info-circle-bold" color="#D97706" size={22} className="mr-3 mt-0.5" />
              <Text className="flex-1 text-xs text-amber-900 dark:text-amber-200 leading-5">
                {errorMessage || t('whatsapp.failureNotice')}
              </Text>
            </View>

            <View className="items-center justify-center my-4">
              <View className="w-36 h-36 rounded-full bg-red-50 dark:bg-red-950/30 items-center justify-center mb-6">
                <Icon name="solar:danger-triangle-bold" color="#EF4444" size={68} />
              </View>

              <Text className="font-montserrat-bold text-xl font-bold text-slate-900 dark:text-white text-center mb-2">
                {t('whatsapp.failureTitle')}
              </Text>

              <Text className="text-xs text-slate-400 dark:text-slate-400 text-center max-w-[280px] leading-5 mb-8">
                {t('whatsapp.failureSub')}
              </Text>
            </View>

            {/* Ignorer Button */}
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => router.back()}
              className="h-13 rounded-2xl bg-brand-orange justify-center items-center mb-3 shadow-md shadow-brand-orange/30"
            >
              <Text className="font-montserrat-bold text-base font-bold text-white">
                {t('common.skip')}
              </Text>
            </TouchableOpacity>

            {/* Réessayer Button */}
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={startBroadcast}
              className="h-13 rounded-2xl bg-red-600 justify-center items-center mb-6 shadow-md shadow-red-600/30"
            >
              <Text className="font-montserrat-bold text-base font-bold text-white">
                {t('common.retry')}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        )}
      </View>
    </View>
  );
}
