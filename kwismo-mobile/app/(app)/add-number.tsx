import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { isValidPhoneNumber } from 'libphonenumber-js/min';
import { Icon } from '@/shared/ui/Icon';
import { HeaderBar } from '@/shared/components/HeaderBar';
import { CountryFlag } from '@/shared/components/CountryFlag';
import { CountryPickerModal, CountryItem } from '@/shared/components/CountryPickerModal';
import { toast } from '@/shared/store/toastStore';

export default function AddNumberScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

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

  const handleSaveNewNumber = () => {
    const cleanDigits = addPhone.replace(/\s+/g, '');
    const fullNumber = `${selectedCountry.callingCode}${cleanDigits}`;
    const isValid = isValidPhoneNumber(fullNumber, selectedCountry.code as any);

    if (!cleanDigits || !isValid) {
      setPhoneError(`${t('common.invalidPhoneNumber')} (${selectedCountry.name})`);
      return;
    }

    toast.success(t('common.numberVerifiedSuccess'));
    router.back();
  };

  return (
    <View className="flex-1 bg-brand-green">
      <StatusBar style="light" />

      <HeaderBar
        title={t('common.addPhoneTitle')}
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
          <View className="flex-row items-center hx-13 rounded-xl border border-slate-200 dark:border-slate-700 px-3.5 bg-white dark:bg-brand-cardDark">
            <Icon name="solar:user-linear" color="#94A3B8" size={20} className="mr-2.5" />
            <TextInput
              className="flex-1 font-medium text-base text-slate-900 dark:text-white"
              placeholder={t('common.lastName')}
              placeholderTextColor="#94A3B8"
              value={addNom}
              onChangeText={setAddNom}
            />
          </View>

          <View className="flex-row items-center hx-13 rounded-xl border border-slate-200 dark:border-slate-700 px-3.5 bg-white dark:bg-brand-cardDark">
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
            className="hx-13 rounded-xl border border-slate-200 dark:border-slate-700 px-3.5 flex-row items-center bg-white dark:bg-brand-cardDark"
          >
            <CountryFlag countryCode={selectedCountry.code} size={22} className="mr-2.5" />
            <Text className="font-medium text-base text-slate-900 dark:text-white flex-1">
              {selectedCountry.name} ({selectedCountry.callingCode})
            </Text>
            <Icon name="solar:alt-arrow-down-linear" color="#94A3B8" size={16} />
          </TouchableOpacity>

          <View
            className={`flex-row items-center hx-13 rounded-xl border px-3.5 bg-white dark:bg-brand-cardDark ${
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
