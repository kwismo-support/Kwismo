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
import { Icon } from '@/shared/ui/Icon';
import { HeaderBar } from '@/shared/components/HeaderBar';
import { toast } from '@/shared/store/toastStore';
import { useAppTheme } from '@/shared/hooks/useAppTheme';

import * as Contacts from 'expo-contacts';

interface ContactItem {
  id: string;
  name: string;
  phone: string;
  badge?: string;
  initialBg?: string;
  initials?: string;
}

type Step = 'select_contacts' | 'configure_message' | 'broadcasting' | 'success' | 'failure';

export default function AlertWhatsappScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { isDark } = useAppTheme();

  const [contacts, setContacts] = useState<ContactItem[]>([]);
  const [loadingContacts, setLoadingContacts] = useState(true);
  const [step, setStep] = useState<Step>('select_contacts');
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [messageText, setMessageText] = useState(
    'ALERTE : Mon compte WhatsApp a été piraté. Ne répondez à aucun message et ne validez aucun transfert d’argent provenant de ce numéro.'
  );
  const [alertType, setAlertType] = useState('Piratage de compte');
  const [progress, setProgress] = useState(0);

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
            const loaded: ContactItem[] = data
              .filter((c) => c.phoneNumbers && c.phoneNumbers.length > 0)
              .map((c, idx) => {
                const phone = c.phoneNumbers![0].number || '';
                const name = c.name || phone;
                let initials = '';
                if (c.name) {
                  const parts = c.name.trim().split(' ');
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
            setContacts(loaded);
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

  const startBroadcast = () => {
    setStep('broadcasting');
    setProgress(0);
  };

  useEffect(() => {
    if (step === 'broadcasting') {
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setStep('success');
            return 100;
          }
          return prev + 10;
        });
      }, 200);
      return () => clearInterval(interval);
    }
  }, [step]);

  const handleHeaderBack = () => {
    if (step === 'configure_message') {
      setStep('select_contacts');
    } else if (step === 'broadcasting' || step === 'success' || step === 'failure') {
      setStep('select_contacts');
    } else {
      router.back();
    }
  };

  const selectedCount = selectedIds.size > 0 ? selectedIds.size : 120;

  return (
    <View className="flex-1 bg-brand-green">
      <StatusBar style="light" />

      <HeaderBar
        title={t('whatsapp.title', 'Alerte whatsapp')}
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
            <View className="flex-row items-center hx-12 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-brand-cardDark px-4 mb-4 shadow-sm">
              <Icon name="solar:magnifer-linear" color="#94A3B8" size={20} className="mr-3" />
              <TextInput
                className="flex-1 text-sm font-medium text-slate-900 dark:text-white"
                placeholder="Recherche de..."
                placeholderTextColor="#94A3B8"
                value={search}
                onChangeText={setSearch}
              />
            </View>

            {/* Header select row */}
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-sm font-semibold text-slate-400 dark:text-slate-500">
                Mes contacts
              </Text>

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={toggleSelectAll}
                className="flex-row items-center gap-2"
              >
                <Text className="text-xs font-medium text-slate-400 dark:text-slate-500">
                  Tout sélectionner
                </Text>
                <View
                  className={`wx-5 hx-5 rounded-full border items-center justify-center ${
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
                  <Text className="text-xs text-slate-500 dark:text-slate-400">
                    Aucun contact disponible.
                  </Text>
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
                        className="wx-11 hx-11 rounded-full items-center justify-center mr-3.5"
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
                          {contact.badge || contact.phone}
                        </Text>
                      </View>
                    </View>

                    <View
                      className={`wx-5 hx-5 rounded-full border items-center justify-center ${
                        isSelected
                          ? 'border-brand-green bg-brand-green'
                          : 'border-slate-300 dark:border-slate-600'
                      }`}
                    >
                      {isSelected && <Icon name="gravity-ui:check" color="#FFFFFF" size={14} />}
                    </View>
                  </TouchableOpacity>
                );
              }))}
            </View>

            {/* Suivant Button */}
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => {
                if (selectedIds.size === 0) {
                  toast.info('Veuillez sélectionner au moins un contact.');
                }
                setStep('configure_message');
              }}
              className="h-13 rounded-2xl bg-brand-orange justify-center items-center mb-6 shadow-md shadow-brand-orange/30"
            >
              <Text className="font-montserrat-bold text-base font-bold text-white">
                Suivant
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
            <Text className="font-montserrat-bold text-xl font-bold text-slate-900 dark:text-white mb-1">
              Message d’alerte
            </Text>
            <Text className="text-xs text-slate-500 dark:text-slate-400 leading-4.5 mb-6">
              Sélectionnez ou modifiez le message à envoyer à vos contacts.
            </Text>

            <Text className="font-montserrat-bold text-base font-bold text-slate-900 dark:text-white mb-2">
              Objet du message
            </Text>

            {/* Alert Type Selector */}
            <View className="flex-row items-center justify-between p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-brand-cardDark mb-6">
              <Text className="text-sm font-medium text-slate-900 dark:text-white">
                Type d’alerte
              </Text>
              <Icon name="solar:alt-arrow-down-linear" color="#94A3B8" size={20} />
            </View>

            <Text className="font-montserrat-bold text-base font-bold text-slate-900 dark:text-white mb-2">
              Modèle de message
            </Text>

            {/* Message Template Input Box */}
            <View className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-brand-cardDark mb-6">
              <TextInput
                multiline
                numberOfLines={5}
                textAlignVertical="top"
                value={messageText}
                onChangeText={setMessageText}
                className="text-sm font-medium text-slate-900 dark:text-white leading-6 min-h-[110px]"
              />
            </View>

            {/* Info Container */}
            <View className="flex-row items-center p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/40 mb-8">
              <Icon name="solar:info-circle-bold" color="#6B98FF" size={22} className="mr-3" />
              <Text className="flex-1 text-xs font-medium text-blue-900 dark:text-blue-200 leading-4.5">
                Ce message alerte vos contacts sélectionnés que votre numéro est compromis.
              </Text>
            </View>

            {/* Envoyer Button */}
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={startBroadcast}
              className="h-13 rounded-2xl bg-brand-orange justify-center items-center mb-6 shadow-md shadow-brand-orange/30"
            >
              <Text className="font-montserrat-bold text-base font-bold text-white">
                Envoyer
              </Text>
            </TouchableOpacity>
          </ScrollView>
        )}

        {/* STEP 3: BROADCASTING LOADING STATE */}
        {step === 'broadcasting' && (
          <View className="flex-1 items-center justify-center px-4 pb-12">
            <View className="wx-36 hx-36 rounded-full bg-emerald-50 dark:bg-emerald-950/30 items-center justify-center mb-8 relative">
              <Icon name="solar:shield-warning-bold" color="#25B876" size={68} />
              <ActivityIndicator
                size="large"
                color="#25B876"
                className="absolute"
              />
            </View>

            <Text className="font-montserrat-bold text-xl font-bold text-slate-900 dark:text-white text-center mb-2">
              Alerte en cours de diffusion...
            </Text>

            <Text className="text-xs text-slate-400 dark:text-slate-400 text-center max-w-[280px] leading-5 mb-8">
              {selectedCount} contacts ont été notifiés de la compromission de votre lignes.
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
            <View className="wx-36 hx-36 rounded-full bg-emerald-50 dark:bg-emerald-950/30 items-center justify-center mb-8">
              <View className="wx-20 hx-20 rounded-full bg-brand-green items-center justify-center shadow-lg shadow-emerald-500/30">
                <Icon name="gravity-ui:check" color="#FFFFFF" size={40} />
              </View>
            </View>

            <Text className="font-montserrat-bold text-xl font-bold text-slate-900 dark:text-white text-center mb-2">
              L’alerte a bien été diffusion
            </Text>

            <Text className="text-xs text-slate-400 dark:text-slate-400 text-center max-w-[280px] leading-5 mb-8">
              {selectedCount} contacts ont été notifiés de la compromission de votre lignes.
            </Text>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => router.back()}
              className="w-full max-w-[280px] h-13 rounded-2xl bg-brand-green justify-center items-center shadow-md shadow-emerald-500/30"
            >
              <Text className="font-montserrat-bold text-base font-bold text-white">
                Terminer
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setStep('failure')}
              className="mt-4"
            >
              <Text className="text-xs text-slate-400 underline">
                Simuler échec partiel réseau
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* STEP 5: PARTIAL FAILURE STATE */}
        {step === 'failure' && (
          <ScrollView
            contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
            showsVerticalScrollIndicator={false}
            className="pt-2"
          >
            {/* Top Amber Warning Container */}
            <View className="flex-row items-start p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 mb-8">
              <Icon name="solar:info-circle-bold" color="#D97706" size={22} className="mr-3 mt-0.5" />
              <Text className="flex-1 text-xs text-amber-900 dark:text-amber-200 leading-5">
                L’alerte n’a pas été transmise à tous vos contacts. Vous pouvez relancer l’envoi pour sécuriser les destinataires manqués, ou ignorer.
              </Text>
            </View>

            <View className="items-center justify-center my-4">
              <View className="wx-36 hx-36 rounded-full bg-red-50 dark:bg-red-950/30 items-center justify-center mb-6">
                <Icon name="solar:danger-triangle-bold" color="#EF4444" size={68} />
              </View>

              <Text className="font-montserrat-bold text-xl font-bold text-slate-900 dark:text-white text-center mb-2">
                Diffusion partiellement interrompu
              </Text>

              <Text className="text-xs text-slate-400 dark:text-slate-400 text-center max-w-[280px] leading-5 mb-8">
                95 messages envoyés, 5 échecs dus au réseau.
              </Text>
            </View>

            {/* Ignorer Button */}
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => router.back()}
              className="h-13 rounded-2xl bg-brand-orange justify-center items-center mb-3 shadow-md shadow-brand-orange/30"
            >
              <Text className="font-montserrat-bold text-base font-bold text-white">
                Ignorer
              </Text>
            </TouchableOpacity>

            {/* Réessayer Button */}
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={startBroadcast}
              className="h-13 rounded-2xl bg-red-600 justify-center items-center mb-6 shadow-md shadow-red-600/30"
            >
              <Text className="font-montserrat-bold text-base font-bold text-white">
                Réessayer
              </Text>
            </TouchableOpacity>
          </ScrollView>
        )}
      </View>
    </View>
  );
}
