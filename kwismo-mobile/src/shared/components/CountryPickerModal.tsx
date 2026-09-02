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
import { Icon } from '../ui/Icon';
import { useAppTheme } from '../hooks/useAppTheme';
import { COUNTRIES_LIST, CountryInfo } from '../lib/countryData';
import { colors, fonts } from '../../styles/tokens';
import { scaleFont } from '../lib/responsive';

interface CountryPickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (country: CountryInfo) => void;
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

  const isFr = i18n.language.startsWith('fr');

  const filteredCountries = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return COUNTRIES_LIST;
    return COUNTRIES_LIST.filter((c) => {
      const name = isFr ? c.nameFr.toLowerCase() : c.nameEn.toLowerCase();
      return name.includes(q) || c.callingCode.includes(q) || c.code.toLowerCase().includes(q);
    });
  }, [search, isFr]);

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
          {/* Header */}
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

          {/* Search bar */}
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
              autoFocus={false}
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch('')}>
                <Icon name="solar:close-circle-linear" color={themeColors.inputPlaceholder} size={18} />
              </TouchableOpacity>
            )}
          </View>

          {/* Countries list */}
          <FlatList
            data={filteredCountries}
            keyExtractor={(item) => item.code}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => {
              const isSelected = selectedCode === item.code;
              const displayName = isFr ? item.nameFr : item.nameEn;
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
                    {displayName}
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
