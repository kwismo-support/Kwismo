import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { CountryFlag } from '@/shared/components/CountryFlag';
import { CountryPickerModal, CountryItem } from '@/shared/components/CountryPickerModal';
import { Icon } from '@/shared/ui/Icon';
import { useAppTheme } from '@/shared/hooks/useAppTheme';

interface CountrySelectInputProps {
  value: string;
  onSelectCountry: (countryName: string, countryCode: string) => void;
  label?: string;
  error?: string;
  placeholder?: string;
  countryCode?: string;
}

export const CountrySelectInput: React.FC<CountrySelectInputProps> = ({
  value,
  onSelectCountry,
  label,
  error,
  placeholder,
  countryCode = 'CM',
}) => {
  const { t } = useTranslation();
  const { colors: themeColors } = useAppTheme();
  const [modalVisible, setModalVisible] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const handleSelect = (item: CountryItem) => {
    onSelectCountry(item.name, item.code);
    setModalVisible(false);
    setIsFocused(false);
  };

  const hasError = !!error;
  const isSelected = !!value;

  return (
    <View className="mb-1 w-full">
      {label && (
        <Text className="font-caption text-sm text-slate-800 dark:text-slate-200 mb-1.5">
          {label}
        </Text>
      )}

      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => {
          setIsFocused(true);
          setModalVisible(true);
        }}
        className={`flex-row items-center justify-between h-13 rounded-xl px-3.5 bg-white dark:bg-brand-cardDark border ${
          hasError
            ? 'border-red-500 border-2'
            : isFocused || modalVisible
            ? 'border-brand-green border-2'
            : 'border-slate-200 dark:border-slate-700'
        }`}
      >
        <View className="flex-row items-center flex-1 pr-2.5">
          {countryCode ? (
            <CountryFlag countryCode={countryCode} size={22} className="mr-2.5" />
          ) : (
            <Icon name="solar:global-linear" color="#25B46E" size={20} className="mr-2.5" />
          )}

          <Text
            numberOfLines={1}
            className={`font-medium text-sm flex-1 ${
              isSelected ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-500'
            }`}
          >
            {value || placeholder || t('common.selectCountry', 'Sélectionner un pays')}
          </Text>
        </View>

        <Icon
          name="solar:alt-arrow-down-linear"
          color={isFocused || modalVisible ? '#25B46E' : themeColors.inputPlaceholder}
          size={18}
        />
      </TouchableOpacity>

      {hasError && (
        <View className="flex-row items-center mt-1.5 px-0.5">
          <Icon name="solar:danger-circle-bold" color="#EF4444" size={14} className="mr-1" />
          <Text className="font-regular text-xs text-red-500">{error}</Text>
        </View>
      )}

      <CountryPickerModal
        visible={modalVisible}
        onClose={() => {
          setModalVisible(false);
          setIsFocused(false);
        }}
        onSelect={handleSelect}
        selectedCode={countryCode}
      />
    </View>
  );
};

export default CountrySelectInput;
