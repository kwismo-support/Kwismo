import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  FlatList,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { getCountries, getCountryCallingCode, CountryCode } from 'libphonenumber-js/min';
import countries from 'i18n-iso-countries';
import frLocale from 'i18n-iso-countries/langs/fr.json';
import enLocale from 'i18n-iso-countries/langs/en.json';
import { CountryFlag } from '@/shared/components/CountryFlag';
import { Icon } from '@/shared/ui/Icon';
import { useAppTheme } from '@/shared/hooks/useAppTheme';

countries.registerLocale(frLocale);
countries.registerLocale(enLocale);

export interface CountryItem {
  code: CountryCode;
  name: string;
  callingCode: string;
}

export const getAllCountries = (lang: string = 'fr'): CountryItem[] => {
  const isFr = lang.startsWith('fr');
  const codes = getCountries();
  return codes
    .map((code) => {
      try {
        const callingCode = `+${getCountryCallingCode(code)}`;
        const name = countries.getName(code, isFr ? 'fr' : 'en') || code;
        return {
          code,
          name,
          callingCode,
        };
      } catch {
        return null;
      }
    })
    .filter((c): c is CountryItem => c !== null)
    .sort((a, b) => a.name.localeCompare(b.name));
};

interface CountryPickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (country: CountryItem) => void;
  selectedCode?: string;
}

export const CountryPickerModal: React.FC<CountryPickerModalProps> = ({
  visible,
  onClose,
  onSelect,
  selectedCode,
}) => {
  const insets = useSafeAreaInsets();
  const { i18n, t } = useTranslation();
  const { colors: themeColors } = useAppTheme();
  const [search, setSearch] = useState('');

  const allCountries = useMemo(() => {
    return getAllCountries(i18n.language);
  }, [i18n.language]);

  const filteredCountries = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return allCountries;
    return allCountries.filter((c) => {
      return (
        c.name.toLowerCase().includes(q) ||
        c.callingCode.includes(q) ||
        c.code.toLowerCase().includes(q)
      );
    });
  }, [allCountries, search]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/60 justify-end">
        <View
          className="h-[75%] bg-white dark:bg-brand-darkBg rounded-t-3xl px-5 pt-4"
          style={{ paddingBottom: Math.max(insets.bottom + 16, 24) }}
        >
          <View className="flex-row items-center justify-between mb-4">
            <Text className="font-montserrat-bold text-xl text-slate-900 dark:text-white">
              {t('common.selectCountry')}
            </Text>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={onClose}
              className="p-1"
            >
              <Icon name="solar:close-circle-bold" color={themeColors.textSecondary} size={26} />
            </TouchableOpacity>
          </View>

          <View className="flex-row items-center hx-12 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-brand-cardDark px-3.5 mb-3">
            <Icon name="solar:magnifer-linear" color={themeColors.inputPlaceholder} size={20} className="mr-2.5" />
            <TextInput
              style={Platform.OS === 'web' ? ({ outline: 'none' } as any) : {}}
              className="flex-1 font-medium text-sm text-slate-900 dark:text-white h-full"
              placeholder={t('common.search')}
              placeholderTextColor={themeColors.inputPlaceholder}
              value={search}
              onChangeText={setSearch}
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch('')}>
                <Icon name="solar:close-circle-linear" color={themeColors.inputPlaceholder} size={18} />
              </TouchableOpacity>
            )}
          </View>

          <FlatList
            data={filteredCountries}
            keyExtractor={(item) => item.code}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingVertical: 6 }}
            renderItem={({ item }) => {
              const isSelected = selectedCode === item.code;
              return (
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => {
                    onSelect(item);
                    onClose();
                  }}
                  className={`flex-row items-center py-3 px-3 rounded-xl mb-1 ${
                    isSelected ? 'bg-emerald-50 dark:bg-slate-800' : 'bg-transparent'
                  }`}
                >
                  <CountryFlag countryCode={item.code} size={28} className="mr-3" />
                  <Text className="flex-1 font-medium text-sm text-slate-900 dark:text-white">
                    {item.name}
                  </Text>
                  <Text className="font-caption text-sm text-brand-green mr-2">
                    {item.callingCode}
                  </Text>
                  {isSelected && (
                    <Icon name="solar:check-circle-bold" color="#25B46E" size={20} />
                  )}
                </TouchableOpacity>
              );
            }}
          />
        </View>
      </View>
    </Modal>
  );
};

export default CountryPickerModal;
