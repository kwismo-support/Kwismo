import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ViewStyle,
  Platform,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { parsePhoneNumberFromString } from 'libphonenumber-js/min';
import { Icon } from '@/shared/ui/Icon';
import { useAppTheme } from '@/shared/hooks/useAppTheme';
import { CountryFlag } from '@/shared/components/CountryFlag';
import { CountryPickerModal, CountryItem } from '@/shared/components/CountryPickerModal';
import { ContactPickerModal } from '@/shared/components/ContactPickerModal';

export interface PhoneCountryInputProps {
  label?: string;
  error?: string;
  hint?: string;
  phoneNumber: string;
  onPhoneNumberChange: (phone: string) => void;
  selectedCountry: CountryItem;
  onCountryChange: (country: CountryItem) => void;
  containerStyle?: ViewStyle;
  placeholder?: string;
  showContactPicker?: boolean;
}

export const PhoneCountryInput: React.FC<PhoneCountryInputProps> = ({
  label,
  error,
  hint,
  phoneNumber,
  onPhoneNumberChange,
  selectedCountry,
  onCountryChange,
  containerStyle,
  placeholder,
  showContactPicker = true,
}) => {
  const { t } = useTranslation();
  const { colors: themeColors } = useAppTheme();

  const [isFocused, setIsFocused] = useState(false);
  const [countryModalVisible, setCountryModalVisible] = useState(false);
  const [contactModalVisible, setContactModalVisible] = useState(false);

  const parsedPhone = parsePhoneNumberFromString(phoneNumber.trim(), selectedCountry.code);
  const isPhoneValid = Boolean(parsedPhone && parsedPhone.isValid());
  const isPhoneInvalid = Boolean(phoneNumber.trim().length > 0 && !isPhoneValid);

  const handleSelectContact = (phone: string, country?: CountryItem) => {
    onPhoneNumberChange(phone);
    if (country) {
      onCountryChange(country);
    }
  };

  let activeIconColor = themeColors.inputPlaceholder;
  if (error || (isPhoneInvalid && (isFocused || Boolean(error)))) {
    activeIconColor = '#EF4444';
  } else if (isPhoneValid || isFocused) {
    activeIconColor = '#25B46E';
  }

  return (
    <View style={containerStyle} className="w-full mb-4">
      {label ? (
        <Text className="font-caption text-sm text-slate-800 dark:text-slate-200 mb-1.5">
          {label}
        </Text>
      ) : null}

      <View
        className={`flex-row items-center h-13 rounded-xl px-3.5 bg-white dark:bg-brand-cardDark border shadow-sm elevation-2 ${
          error || (isPhoneInvalid && (isFocused || Boolean(error)))
            ? 'border-red-500 border-2'
            : isPhoneValid || isFocused
            ? 'border-brand-green border-2'
            : 'border-slate-200 dark:border-slate-700'
        }`}
      >
        <Icon
          name="solar:phone-linear"
          color={activeIconColor}
          size={20}
          className="mr-2"
        />

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => setCountryModalVisible(true)}
          className="flex-row items-center"
        >
          <CountryFlag countryCode={selectedCountry.code} size={22} className="mr-1.5" />
          <Text className="font-caption text-sm text-slate-900 dark:text-white">
            {selectedCountry.callingCode}
          </Text>
          <Icon
            name="solar:alt-arrow-down-linear"
            color={themeColors.textSecondary}
            size={16}
            className="ml-1 mr-2"
          />
        </TouchableOpacity>

        <TextInput
          style={Platform.OS === 'web' ? ({ outline: 'none' } as any) : {}}
          className="flex-1 h-full font-medium text-sm text-slate-900 dark:text-white py-0"
          selectionColor="#25B46E"
          cursorColor="#25B46E"
          placeholder={placeholder || t('common.phonePlaceholder', 'Numéro de téléphone')}
          placeholderTextColor={themeColors.inputPlaceholder}
          keyboardType="phone-pad"
          value={phoneNumber}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onChangeText={(val) => {
            onPhoneNumberChange(val);
          }}
        />

        {isPhoneValid ? (
          <Icon name="solar:check-circle-bold" color="#25B46E" size={20} className="ml-1.5" />
        ) : showContactPicker ? (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setContactModalVisible(true)}
            className="p-1 ml-1.5 items-center justify-center"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Icon name="solar:users-group-two-rounded-linear" color="#25B46E" size={22} />
          </TouchableOpacity>
        ) : null}
      </View>

      {error ? (
        <View className="flex-row items-center mt-1.5 px-1 gap-1.5">
          <Icon name="solar:danger-circle-bold" color="#EF4444" size={14} />
          <Text className="font-medium text-xs text-red-500 flex-1 leading-4">{error}</Text>
        </View>
      ) : hint ? (
        <Text className="font-regular text-xs text-slate-500 dark:text-slate-400 mt-1 px-1">
          {hint}
        </Text>
      ) : null}

      <CountryPickerModal
        visible={countryModalVisible}
        onClose={() => setCountryModalVisible(false)}
        onSelect={onCountryChange}
        selectedCode={selectedCountry.code}
      />

      <ContactPickerModal
        visible={contactModalVisible}
        onClose={() => setContactModalVisible(false)}
        onSelect={handleSelectContact}
        defaultCountryCode={selectedCountry.code}
      />
    </View>
  );
};

export default PhoneCountryInput;
