import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  Platform,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { parsePhoneNumberFromString, getCountryCallingCode, CountryCode } from 'libphonenumber-js/min';
import countries from 'i18n-iso-countries';
import { Icon } from '../ui/Icon';
import { useAppTheme } from '../hooks/useAppTheme';
import { CountryFlag } from './CountryFlag';
import { CountryPickerModal, CountryItem } from './CountryPickerModal';
import { ContactPickerModal } from './ContactPickerModal';
import { colors, fonts } from '../../styles/tokens';
import { scaleFont } from '../lib/responsive';

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
}) => {
  const { i18n, t } = useTranslation();
  const { colors: themeColors } = useAppTheme();

  const [isFocused, setIsFocused] = useState(false);
  const [countryModalVisible, setCountryModalVisible] = useState(false);
  const [contactModalVisible, setContactModalVisible] = useState(false);

  // Validation téléphonique en direct
  const parsedPhone = parsePhoneNumberFromString(phoneNumber.trim(), selectedCountry.code);
  const isPhoneValid = Boolean(parsedPhone && parsedPhone.isValid());
  const isPhoneInvalid = Boolean(phoneNumber.trim().length > 0 && !isPhoneValid);

  const handleSelectContact = (phone: string, country?: CountryItem) => {
    onPhoneNumberChange(phone);
    if (country) {
      onCountryChange(country);
    }
  };

  let borderColor = themeColors.inputBorder;
  let activeIconColor = themeColors.inputPlaceholder;

  if (error || (isPhoneInvalid && isFocused)) {
    borderColor = '#EF4444';
    activeIconColor = '#EF4444';
  } else if (isPhoneValid || isFocused) {
    borderColor = colors.green;
    activeIconColor = colors.green;
  }

  return (
    <View style={[styles.wrapper, containerStyle]}>
      {label ? (
        <Text style={[styles.label, { color: themeColors.textPrimary }]}>
          {label}
        </Text>
      ) : null}

      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: themeColors.cardBg,
            borderColor,
            borderWidth: isFocused || error || isPhoneValid ? 1.5 : 1,
          },
        ]}
      >
        {/* Icône Téléphone */}
        <Icon
          name="solar:phone-linear"
          color={activeIconColor}
          size={20}
          style={{ marginRight: 8 }}
        />

        {/* Sélecteur de pays : Drapeau + Indicatif + Flèche vers le bas */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => setCountryModalVisible(true)}
          style={styles.countryPicker}
        >
          <CountryFlag countryCode={selectedCountry.code} size={22} style={{ marginRight: 6 }} />
          <Text style={[styles.countryCodeText, { color: themeColors.textPrimary }]}>
            {selectedCountry.callingCode}
          </Text>
          <Icon
            name="solar:alt-arrow-down-linear"
            color={themeColors.textSecondary}
            size={16}
            style={{ marginLeft: 4 }}
          />
        </TouchableOpacity>

        {/* Séparateur vertical discret */}
        <View style={[styles.verticalDivider, { backgroundColor: themeColors.inputBorder }]} />

        {/* Champ Texte Téléphone */}
        <TextInput
          style={[
            styles.textInput,
            {
              color: themeColors.textPrimary,
              fontFamily: fonts.medium,
            },
            Platform.OS === 'web' ? ({ outline: 'none' } as any) : {},
          ]}
          selectionColor={colors.green}
          cursorColor={colors.green}
          placeholder={placeholder || t('common.phonePlaceholder', 'Numéro de téléphone')}
          placeholderTextColor={themeColors.inputPlaceholder}
          keyboardType="phone-pad"
          value={phoneNumber}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onChangeText={onPhoneNumberChange}
        />

        {/* Valide Checkmark ou Bouton Contacts */}
        {isPhoneValid ? (
          <Icon name="solar:check-circle-bold" color={colors.green} size={20} style={{ marginLeft: 6 }} />
        ) : (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setContactModalVisible(true)}
            style={styles.contactBtn}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Icon name="solar:users-group-two-rounded-linear" color={colors.green} size={22} />
          </TouchableOpacity>
        )}
      </View>

      {/* Ligne d'erreur ou d'indication */}
      {error ? (
        <View style={styles.errorRow}>
          <Icon name="solar:danger-circle-bold" color="#EF4444" size={14} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : hint ? (
        <Text style={[styles.hintText, { color: themeColors.textSecondary }]}>
          {hint}
        </Text>
      ) : null}

      {/* Modale de sélection du Pays */}
      <CountryPickerModal
        visible={countryModalVisible}
        onClose={() => setCountryModalVisible(false)}
        onSelect={onCountryChange}
        selectedCode={selectedCountry.code}
      />

      {/* Modale de sélection dans les Contacts */}
      <ContactPickerModal
        visible={contactModalVisible}
        onClose={() => setContactModalVisible(false)}
        onSelect={handleSelectContact}
        defaultCountryCode={selectedCountry.code}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    marginBottom: 16,
  },
  label: {
    fontFamily: fonts.semiBold,
    fontSize: scaleFont(14),
    marginBottom: 6,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 54,
    borderRadius: 14,
    paddingHorizontal: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  countryPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 8,
  },
  countryCodeText: {
    fontFamily: fonts.bold,
    fontSize: scaleFont(14),
  },
  verticalDivider: {
    width: 1,
    height: 24,
    marginHorizontal: 8,
  },
  textInput: {
    flex: 1,
    height: '100%',
    paddingVertical: 0,
    fontSize: scaleFont(15),
  },
  contactBtn: {
    padding: 4,
    marginLeft: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    paddingHorizontal: 4,
    gap: 6,
  },
  errorText: {
    fontFamily: fonts.medium,
    fontSize: scaleFont(12),
    color: '#EF4444',
    flex: 1,
    lineHeight: 16,
  },
  hintText: {
    fontFamily: fonts.regular,
    fontSize: scaleFont(12),
    marginTop: 4,
    paddingHorizontal: 4,
  },
});
