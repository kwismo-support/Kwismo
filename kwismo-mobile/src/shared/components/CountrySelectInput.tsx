import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { CountryFlag } from './CountryFlag';
import { CountryPickerModal, CountryItem, getAllCountries } from './CountryPickerModal';
import { Icon } from '../ui/Icon';
import { useAppTheme } from '../hooks/useAppTheme';
import { colors, fonts } from '../../styles/tokens';
import { scaleFont } from '../lib/responsive';

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
  const { i18n, t } = useTranslation();
  const { isDark, colors: themeColors } = useAppTheme();
  const [modalVisible, setModalVisible] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const handleSelect = (item: CountryItem) => {
    onSelectCountry(item.name, item.code);
    setModalVisible(false);
    setIsFocused(false);
  };

  const hasError = !!error;
  const isSelected = !!value;

  const borderColor = hasError
    ? '#EF4444'
    : isFocused || modalVisible
    ? colors.green
    : themeColors.inputBorder;

  return (
    <View style={styles.wrapper}>
      {label && (
        <Text style={[styles.label, { color: themeColors.textPrimary }]}>
          {label}
        </Text>
      )}

      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => {
          setIsFocused(true);
          setModalVisible(true);
        }}
        style={[
          styles.inputContainer,
          {
            backgroundColor: themeColors.inputBg,
            borderColor,
            borderWidth: isFocused || modalVisible || hasError ? 1.5 : 1,
          },
        ]}
      >
        <View style={styles.leftRow}>
          {countryCode ? (
            <CountryFlag countryCode={countryCode} size={22} style={{ marginRight: 10 }} />
          ) : (
            <Icon name="solar:global-linear" color={colors.green} size={20} style={{ marginRight: 10 }} />
          )}

          <Text
            numberOfLines={1}
            style={[
              styles.valueText,
              {
                color: isSelected
                  ? themeColors.textPrimary
                  : themeColors.inputPlaceholder,
              },
            ]}
          >
            {value || placeholder || t('common.selectCountry', 'Sélectionner un pays')}
          </Text>
        </View>

        <Icon
          name="solar:alt-arrow-down-linear"
          color={isFocused || modalVisible ? colors.green : themeColors.inputPlaceholder}
          size={18}
        />
      </TouchableOpacity>

      {hasError && (
        <View style={styles.errorRow}>
          <Icon name="solar:danger-circle-bold" color="#EF4444" size={14} style={{ marginRight: 4 }} />
          <Text style={styles.errorText}>{error}</Text>
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

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 4,
  },
  label: {
    fontFamily: fonts.headlineBold,
    fontSize: scaleFont(13),
    fontWeight: '600',
    marginBottom: 6,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 52,
    borderRadius: 14,
    paddingHorizontal: 14,
  },
  leftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: 10,
  },
  valueText: {
    fontFamily: fonts.regular,
    fontSize: scaleFont(14),
    flex: 1,
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    paddingLeft: 2,
  },
  errorText: {
    fontFamily: fonts.regular,
    fontSize: scaleFont(12),
    color: '#EF4444',
  },
});
