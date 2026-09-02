import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  FlatList,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { parsePhoneNumberFromString, getCountryCallingCode, CountryCode } from 'libphonenumber-js/min';
import countries from 'i18n-iso-countries';
import { Icon } from '../ui/Icon';
import { useAppTheme } from '../hooks/useAppTheme';
import { CountryItem } from './CountryPickerModal';
import { getDeviceContacts, RawContact } from '../lib/contactsService';
import { colors, fonts } from '../../styles/tokens';
import { scaleFont } from '../lib/responsive';

interface ContactPickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (phone: string, country?: CountryItem) => void;
  defaultCountryCode?: CountryCode;
}

export const ContactPickerModal: React.FC<ContactPickerModalProps> = ({
  visible,
  onClose,
  onSelect,
  defaultCountryCode = 'CM',
}) => {
  const insets = useSafeAreaInsets();
  const { i18n, t } = useTranslation();
  const { colors: themeColors } = useAppTheme();

  const [contacts, setContacts] = useState<RawContact[]>([]);
  const [loading, setLoading] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [search, setSearch] = useState('');

  const isFr = i18n.language.startsWith('fr');

  useEffect(() => {
    if (visible) {
      loadContacts();
    }
  }, [visible]);

  const loadContacts = async () => {
    setLoading(true);
    setPermissionDenied(false);

    try {
      const { granted, contacts: list } = await getDeviceContacts();
      if (!granted) {
        setPermissionDenied(true);
      } else {
        setContacts(list);
      }
    } catch {
      setPermissionDenied(true);
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return contacts;
    return contacts.filter(
      (c) => c.name.toLowerCase().includes(q) || c.phone.includes(q)
    );
  }, [contacts, search]);

  const handleSelectContact = (item: RawContact) => {
    let cleanNumber = item.phone.replace(/[\s\-()]/g, '');
    let matchedCountry: CountryItem | undefined;

    try {
      const parsed = parsePhoneNumberFromString(cleanNumber, defaultCountryCode);
      if (parsed) {
        if (parsed.country) {
          const code = parsed.country;
          const name = countries.getName(code, isFr ? 'fr' : 'en') || code;
          const callingCode = `+${getCountryCallingCode(code)}`;
          matchedCountry = {
            code,
            name,
            callingCode,
          };
        }
        cleanNumber = parsed.nationalNumber;
      }
    } catch {
      // ignore
    }

    onSelect(cleanNumber, matchedCountry);
    onClose();
  };

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
              {t('common.selectFromContacts', 'Choisir dans mes contacts')}
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

          {loading ? (
            <View style={styles.centerBox}>
              <ActivityIndicator color={colors.green} size="large" />
            </View>
          ) : permissionDenied ? (
            <View style={styles.centerBox}>
              <Icon name="solar:shield-warning-bold" color={colors.orange} size={48} style={{ marginBottom: 12 }} />
              <Text style={[styles.permissionText, { color: themeColors.textPrimary }]}>
                {t('common.permissionContactsDenied', "Permission d'accès aux contacts refusée.")}
              </Text>
            </View>
          ) : filtered.length === 0 ? (
            <View style={styles.centerBox}>
              <Text style={[styles.emptyText, { color: themeColors.textSecondary }]}>
                {t('common.noContactsFound', 'Aucun contact trouvé')}
              </Text>
            </View>
          ) : (
            <FlatList
              data={filtered}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContent}
              renderItem={({ item }) => (
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => handleSelectContact(item)}
                  style={[
                    styles.contactItem,
                    {
                      backgroundColor: themeColors.cardBg,
                      borderColor: themeColors.inputBorder,
                    },
                  ]}
                >
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{item.name[0] || '?'}</Text>
                  </View>
                  <View style={styles.info}>
                    <Text style={[styles.name, { color: themeColors.textPrimary }]}>
                      {item.name}
                    </Text>
                    <Text style={[styles.phone, { color: themeColors.textSecondary }]}>
                      {item.phone}
                    </Text>
                  </View>
                  <Icon name="solar:alt-arrow-right-linear" color={themeColors.inputPlaceholder} size={18} />
                </TouchableOpacity>
              )}
            />
          )}
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
    height: '80%',
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
    marginBottom: 14,
  },
  searchInput: {
    flex: 1,
    fontFamily: fonts.medium,
    fontSize: scaleFont(15),
    height: '100%',
  },
  centerBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  permissionText: {
    fontFamily: fonts.medium,
    fontSize: scaleFont(14),
    textAlign: 'center',
  },
  emptyText: {
    fontFamily: fonts.medium,
    fontSize: scaleFont(14),
  },
  listContent: {
    paddingVertical: 6,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 8,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.green,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: colors.white,
  },
  info: {
    flex: 1,
  },
  name: {
    fontFamily: fonts.semiBold,
    fontSize: scaleFont(14),
    marginBottom: 2,
  },
  phone: {
    fontFamily: fonts.regular,
    fontSize: scaleFont(12),
  },
});
