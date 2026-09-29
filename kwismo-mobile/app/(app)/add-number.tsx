import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { isValidPhoneNumber } from 'libphonenumber-js/min';
import * as Contacts from 'expo-contacts/legacy';
import { Icon } from '@/shared/ui/Icon';
import { HeaderBar } from '@/shared/components/HeaderBar';
import { CountryFlag } from '@/shared/components/CountryFlag';
import { CountryPickerModal, CountryItem } from '@/shared/components/CountryPickerModal';
import { toast } from '@/shared/store/toastStore';
import { storage } from '@/shared/services/storage';
import { contactsApi } from '@/features/contacts/services/contacts.api';

const CONTACTS_CACHE_KEY = 'kwismo_contacts_cache';

export default function AddNumberScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const params = useLocalSearchParams<{
    isEdit?: string;
    phone?: string;
    name?: string;
  }>();

  const isEdit = params.isEdit === 'true';

  const [addNom, setAddNom] = useState('');
  const [addPrenom, setAddPrenom] = useState('');
  const [addPhone, setAddPhone] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [countryModalVisible, setCountryModalVisible] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<CountryItem>({
    code: 'CM',
    name: 'Cameroun',
    callingCode: '+237',
  });

  useEffect(() => {
    if (params.name) {
      const parts = params.name.trim().split(' ');
      if (parts.length > 1) {
        setAddPrenom(parts[0]);
        setAddNom(parts.slice(1).join(' '));
      } else {
        setAddNom(params.name);
      }
    }
    if (params.phone) {
      const clean = params.phone.replace('+237', '').replace(/\s+/g, '');
      setAddPhone(clean);
    }
  }, [params.name, params.phone]);

  const handleSaveNewNumber = async () => {
    const cleanDigits = addPhone.replace(/\s+/g, '');
    const fullNumber = `${selectedCountry.callingCode}${cleanDigits}`;
    const isValid = isValidPhoneNumber(fullNumber, selectedCountry.code as any);

    if (!cleanDigits || !isValid) {
      setPhoneError(`${t('common.invalidPhoneNumber')} (${selectedCountry.name})`);
      return;
    }

    const fullName = `${addPrenom} ${addNom}`.trim() || fullNumber;

    try {
      const { status } = await Contacts.requestPermissionsAsync();
      if (status === 'granted') {
        const contactData: Contacts.Contact = {
          [Contacts.Fields.FirstName]: addPrenom || fullName,
          [Contacts.Fields.LastName]: addNom || '',
          [Contacts.Fields.PhoneNumbers]: [
            {
              number: fullNumber,
              label: 'mobile',
            },
          ],
        } as any;
        await Contacts.addContactAsync(contactData);
      }
    } catch {}

    try {
      const cached = await storage.getItem(CONTACTS_CACHE_KEY);
      let list = cached ? JSON.parse(cached) : [];
      if (Array.isArray(list)) {
        const existingIdx = list.findIndex(
          (c: any) => c.phone && c.phone.replace(/\s+/g, '') === fullNumber.replace(/\s+/g, '')
        );
        if (existingIdx >= 0) {
          list[existingIdx] = {
            ...list[existingIdx],
            name: fullName,
            phone: fullNumber,
          };
        } else {
          list.unshift({
            id: `local-${Date.now()}`,
            name: fullName,
            phone: fullNumber,
            hasKwismo: false,
            kwismoStatus: 'none',
            countryCode: selectedCountry.code,
          });
        }
        await storage.setItem(CONTACTS_CACHE_KEY, JSON.stringify(list));
      }
    } catch {}

    contactsApi.addContact({ nom: fullName, numero: fullNumber }).catch(() => {});

    toast.success(
      isEdit ? t('common.contactUpdatedSuccess') : t('common.numberVerifiedSuccess')
    );
    router.back();
  };

  return (
    <View className="flex-1 bg-brand-green">
      <StatusBar style="light" />

      <HeaderBar
        title={isEdit ? t('common.editContactTitle') : t('common.addPhoneTitle')}
        showBack={true}
        onBack={() => router.back()}
        rightAction={
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleSaveNewNumber}
            className="p-1"
          >
            <Icon name="gravity-ui:check" color="#FFFFFF" size={24} />
          </TouchableOpacity>
        }
      />

      <View className="flex-1 bg-white dark:bg-brand-darkBg rounded-t-[28px] overflow-hidden pt-6 px-6">
        <ScrollView
          contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
          showsVerticalScrollIndicator={false}
          className="gap-y-6"
        >
          <View className="flex-row items-center h-13 rounded-xl border border-slate-200 dark:border-slate-700 px-3.5 bg-white dark:bg-brand-cardDark">
            <Icon name="solar:user-linear" color="#94A3B8" size={20} className="mr-2.5" />
            <TextInput
              className="flex-1 font-medium text-base text-slate-900 dark:text-white"
              placeholder={t('common.lastName')}
              placeholderTextColor="#94A3B8"
              value={addNom}
              onChangeText={setAddNom}
            />
          </View>

          <View className="flex-row items-center h-13 rounded-xl border border-slate-200 dark:border-slate-700 px-3.5 bg-white dark:bg-brand-cardDark">
            <Icon name="solar:user-linear" color="#94A3B8" size={20} className="mr-2.5" />
            <TextInput
              className="flex-1 font-medium text-base text-slate-900 dark:text-white"
              placeholder={t('common.firstName')}
              placeholderTextColor="#94A3B8"
              value={addPrenom}
              onChangeText={setAddPrenom}
            />
          </View>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setCountryModalVisible(true)}
            className="h-13 rounded-xl border border-slate-200 dark:border-slate-700 px-3.5 flex-row items-center bg-white dark:bg-brand-cardDark"
          >
            <CountryFlag countryCode={selectedCountry.code} size={22} className="mr-2.5" />
            <Text className="font-medium text-base text-slate-900 dark:text-white flex-1">
              {selectedCountry.name} ({selectedCountry.callingCode})
            </Text>
            <Icon name="solar:alt-arrow-down-linear" color="#94A3B8" size={16} />
          </TouchableOpacity>

          <View
            className={`flex-row items-center h-13 rounded-xl border px-3.5 bg-white dark:bg-brand-cardDark ${
              phoneError ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'
            }`}
          >
            <Icon name="solar:phone-linear" color="#94A3B8" size={20} className="mr-2.5" />
            <TextInput
              className="flex-1 font-medium text-base text-slate-900 dark:text-white"
              placeholder={t('common.phoneNumber')}
              placeholderTextColor="#94A3B8"
              keyboardType="phone-pad"
              value={addPhone}
              onChangeText={(txt) => {
                setAddPhone(txt);
                if (phoneError) setPhoneError('');
              }}
            />
          </View>

          {phoneError ? (
            <Text className="font-medium text-xs text-red-500 -mt-4 ml-1">{phoneError}</Text>
          ) : null}
        </ScrollView>
      </View>

      <CountryPickerModal
        visible={countryModalVisible}
        onClose={() => setCountryModalVisible(false)}
        onSelect={(c) => setSelectedCountry(c)}
        selectedCode={selectedCountry.code}
      />
    </View>
  );
}
