import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
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
import { Icon } from '@/shared/ui/Icon';
import { useAppTheme } from '@/shared/hooks/useAppTheme';
import { CountryItem } from '@/shared/components/CountryPickerModal';
import { getDeviceContacts, RawContact } from '@/shared/lib/contactsService';

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
      <View className="flex-1 bg-black/60 justify-end">
        <View
          className="h-[80%] bg-white dark:bg-brand-darkBg rounded-t-3xl px-5 pt-4"
          style={{ paddingBottom: Math.max(insets.bottom + 16, 24) }}
        >
          <View className="flex-row items-center justify-between mb-4">
            <Text className="font-montserrat-bold text-xl text-slate-900 dark:text-white">
              {t('common.selectFromContacts', 'Choisir dans mes contacts')}
            </Text>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={onClose}
              className="p-1"
            >
              <Icon name="solar:close-circle-bold" color={themeColors.textSecondary} size={26} />
            </TouchableOpacity>
          </View>

          <View className="flex-row items-center h-12 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-brand-cardDark px-3.5 mb-3.5">
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

          {loading ? (
            <View className="flex-1 items-center justify-center p-6">
              <ActivityIndicator color="#25B46E" size="large" />
            </View>
          ) : permissionDenied ? (
            <View className="flex-1 items-center justify-center p-6">
              <Icon name="solar:shield-warning-bold" color="#FF9900" size={48} className="mb-3" />
              <Text className="font-medium text-sm text-slate-900 dark:text-white text-center">
                {t('common.permissionContactsDenied', "Permission d'accès aux contacts refusée.")}
              </Text>
            </View>
          ) : filtered.length === 0 ? (
            <View className="flex-1 items-center justify-center p-6">
              <Text className="font-medium text-sm text-slate-500 dark:text-slate-400">
                {t('common.noContactsFound', 'Aucun contact trouvé')}
              </Text>
            </View>
          ) : (
            <FlatList
              data={filtered}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingVertical: 6 }}
              renderItem={({ item }) => (
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => handleSelectContact(item)}
                  className="flex-row items-center p-3 rounded-xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-brand-cardDark mb-2"
                >
                  <View className="w-10 h-10 rounded-full bg-brand-green items-center justify-center mr-3">
                    <Text className="font-bold text-base text-white">{item.name[0] || '?'}</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="font-caption text-sm text-slate-900 dark:text-white mb-0.5">
                      {item.name}
                    </Text>
                    <Text className="font-regular text-xs text-slate-500 dark:text-slate-400">
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

export default ContactPickerModal;
