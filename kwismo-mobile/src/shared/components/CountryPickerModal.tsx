import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
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
import { Icon } from '../ui/Icon';
import { useAppTheme } from '../hooks/useAppTheme';
import { colors, fonts } from '../../styles/tokens';
import { scaleFont } from '../lib/responsive';

countries.registerLocale(frLocale);
countries.registerLocale(enLocale);

export interface CountryItem {
  code: CountryCode;
  name: string;
  callingCode: string;
  flag: string;
}

export const getCountryFlag = (countryCode: string): string => {
  if (!countryCode || countryCode.length !== 2) return '🌐';
  return countryCode
    .toUpperCase()
    .replace(/./g, (char) => String.fromCodePoint(char.charCodeAt(0) + 127397));
};

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
          flag: getCountryFlag(code),
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
  const { isDark, colors: themeColors } = useAppTheme();
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
      <View style={styles.modalOverlay}>
        <View
          style={[
            styles.sheetContainer,
            {
              backgroundColor: themeColors.background,
              paddingTop: 16,
              paddingBottom: Math.max(insets.bottom + 16, 24),
            },
          ]}
        >
          <View style={styles.headerRow}>
            <Text style={[styles.modalTitle, { color: themeColors.textPrimary }]}>
              {t('common.selectCountry', 'Sélectionner un pays')}
            </Text>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={onClose}
              style={styles.closeBtn}
            >
              <Icon name="solar:close-circle-bold" color={themeColors.textSecondary} size={26} />
            </TouchableOpacity>
          </View>

          <View
            style={[
              styles.searchBar,
              {
                backgroundColor: themeColors.cardBg,
                borderColor: themeColors.inputBorder,
              },
            ]}
          >
            <Icon name="solar:magnifer-linear" color={themeColors.inputPlaceholder} size={20} style={{ marginRight: 10 }} />
            <TextInput
              style={[
                styles.searchInput,
                { color: themeColors.textPrimary },
                Platform.OS === 'web' ? ({ outline: 'none' } as any) : {},
              ]}
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
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => {
              const isSelected = selectedCode === item.code;
              return (
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => {
                    onSelect(item);
                    onClose();
                  }}
                  style={[
                    styles.countryItem,
                    {
                      backgroundColor: isSelected
                        ? isDark
                          ? '#1E293B'
                          : '#E6F7F0'
                        : 'transparent',
                    },
                  ]}
                >
                  <View style={styles.flagCircle}>
                    <Text style={styles.flagEmoji}>{item.flag}</Text>
                  </View>
                  <Text style={[styles.countryName, { color: themeColors.textPrimary }]}>
                    {item.name}
                  </Text>
                  <Text style={[styles.callingCode, { color: colors.green }]}>
                    {item.callingCode}
                  </Text>
                  {isSelected && (
                    <Icon name="solar:check-circle-bold" color={colors.green} size={20} style={{ marginLeft: 8 }} />
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

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    height: '75%',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  modalTitle: {
    fontFamily: fonts.h6,
    fontSize: scaleFont(18),
    fontWeight: '700',
  },
  closeBtn: {
    padding: 4,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    fontFamily: fonts.medium,
    fontSize: scaleFont(15),
    height: '100%',
  },
  listContent: {
    paddingVertical: 6,
  },
  countryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 4,
  },
  flagCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.04)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  flagEmoji: {
    fontSize: 22,
  },
  countryName: {
    flex: 1,
    fontFamily: fonts.medium,
    fontSize: scaleFont(15),
  },
  callingCode: {
    fontFamily: fonts.semiBold,
    fontSize: scaleFont(14),
  },
});
