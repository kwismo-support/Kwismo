import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
  Platform,
  Linking,
} from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Contacts from 'expo-contacts/legacy';
import { Icon } from '@/shared/ui/Icon';
import { HeaderBar } from '@/shared/components/HeaderBar';
import { Skeleton, SkeletonCircle, SkeletonLoader } from '@/shared/ui/Skeleton';
import { CountryFlag } from '@/shared/components/CountryFlag';
import { CountryPickerModal, CountryItem } from '@/shared/components/CountryPickerModal';
import { useAppTheme } from '@/shared/hooks/useAppTheme';
import { toast } from '@/shared/store/toastStore';

export interface ContactItem {
  id: string;
  name: string;
  phone: string;
  hasKwismo: boolean;
  kwismoStatus: 'compromised' | 'pending' | 'secured' | 'signalement' | 'transfert' | 'none';
  countryCode?: string;
  callingCode?: string;
}

const MOCK_CONTACTS: ContactItem[] = [
  {
    id: 'c1',
    name: '+237 6 98 00 40 12',
    phone: '+237 6 98 00 40 12',
    hasKwismo: true,
    kwismoStatus: 'pending',
    countryCode: 'CM',
  },
  {
    id: 'c2',
    name: 'Lysette Orleanne',
    phone: '+237 6 77 12 34 56',
    hasKwismo: true,
    kwismoStatus: 'compromised',
    countryCode: 'CM',
  },
  {
    id: 'c3',
    name: 'Superviseur NJS',
    phone: '#150*1*695 12 34 36*1...',
    hasKwismo: true,
    kwismoStatus: 'secured',
    countryCode: 'CM',
  },
  {
    id: 'c4',
    name: '+221 233 16 71 88',
    phone: '+221 233 16 71 88',
    hasKwismo: false,
    kwismoStatus: 'none',
    countryCode: 'SN',
  },
  {
    id: 'c5',
    name: '+237 6 98 00 40 12',
    phone: '+237 6 98 00 40 12',
    hasKwismo: true,
    kwismoStatus: 'pending',
    countryCode: 'CM',
  },
  {
    id: 'c6',
    name: '+237 6 40 43 01 00',
    phone: '+237 6 40 43 01 00',
    hasKwismo: true,
    kwismoStatus: 'signalement',
    countryCode: 'CM',
  },
  {
    id: 'c7',
    name: '+237 6 98 44 43 88',
    phone: '+237 6 98 44 43 88',
    hasKwismo: false,
    kwismoStatus: 'none',
    countryCode: 'CM',
  },
  {
    id: 'c8',
    name: 'Lysette Orleanne',
    phone: '+237 6 77 12 34 56',
    hasKwismo: false,
    kwismoStatus: 'none',
    countryCode: 'CM',
  },
  {
    id: 'c9',
    name: '+237 6 98 44 43 88',
    phone: '+237 6 98 44 43 88',
    hasKwismo: true,
    kwismoStatus: 'pending',
    countryCode: 'CM',
  },
];

export default function ContactsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { isDark } = useAppTheme();

  const [permissionGranted, setPermissionGranted] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [contactsList, setContactsList] = useState<ContactItem[]>(MOCK_CONTACTS);
  const [search, setSearch] = useState('');
  const [selectedContactIds, setSelectedContactIds] = useState<Set<string>>(new Set());

  // Invite Mode State
  const [isInviteMode, setIsInviteMode] = useState(false);
  const [inviteModalVisible, setInviteModalVisible] = useState(false);
  const [targetInviteContact, setTargetInviteContact] = useState<ContactItem | null>(null);

  // Add Number Modal State
  const [addNumberModalVisible, setAddNumberModalVisible] = useState(false);
  const [addNom, setAddNom] = useState('');
  const [addPrenom, setAddPrenom] = useState('');
  const [addPhone, setAddPhone] = useState('');
  const [countryModalVisible, setCountryModalVisible] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<CountryItem>({
    code: 'CM',
    name: 'Cameroun',
    callingCode: '+237',
  });

  useEffect(() => {
    requestContactsPermission();
  }, []);

  const requestContactsPermission = async () => {
    setLoading(true);
    try {
      const { status } = await Contacts.requestPermissionsAsync();
      if (status === 'granted') {
        setPermissionGranted(true);
        const { data } = await Contacts.getContactsAsync({
          fields: [Contacts.Fields.PhoneNumbers, Contacts.Fields.Emails],
        });

        if (data.length > 0) {
          const deviceContacts: ContactItem[] = data
            .filter((c) => c.phoneNumbers && c.phoneNumbers.length > 0)
            .map((c, idx) => {
              const rawPhone = c.phoneNumbers![0].number || '';
              const displayName = c.name || rawPhone;
              const isKwismoMock = idx % 3 !== 0;
              let statusMock: ContactItem['kwismoStatus'] = 'none';
              if (isKwismoMock) {
                const statuses: ContactItem['kwismoStatus'][] = [
                  'pending',
                  'compromised',
                  'secured',
                  'signalement',
                  'transfert',
                ];
                statusMock = statuses[idx % statuses.length];
              }

              return {
                id: c.id || `dev-${idx}`,
                name: displayName,
                phone: rawPhone,
                hasKwismo: isKwismoMock,
                kwismoStatus: statusMock,
                countryCode: 'CM',
              };
            });

          if (deviceContacts.length > 0) {
            setContactsList(deviceContacts);
          }
        }
      } else {
        setPermissionGranted(false);
      }
    } catch (e) {
      setPermissionGranted(true);
    } finally {
      setTimeout(() => setLoading(false), 600);
    }
  };

  const currentDisplayContacts = isInviteMode
    ? contactsList.filter((c) => !c.hasKwismo)
    : contactsList;

  const filteredContacts = currentDisplayContacts.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.toLowerCase().includes(search.toLowerCase())
  );

  const allSelected =
    filteredContacts.length > 0 &&
    filteredContacts.every((c) => selectedContactIds.has(c.id));

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedContactIds(new Set());
    } else {
      const newSet = new Set<string>();
      filteredContacts.forEach((c) => newSet.add(c.id));
      setSelectedContactIds(newSet);
    }
  };

  const toggleSelectContact = (contact: ContactItem) => {
    const newSet = new Set(selectedContactIds);
    if (newSet.has(contact.id)) {
      newSet.delete(contact.id);
    } else {
      newSet.add(contact.id);
    }
    setSelectedContactIds(newSet);

    if (isInviteMode && !contact.hasKwismo) {
      setTargetInviteContact(contact);
      setInviteModalVisible(true);
    }
  };

  const handleOpenAddNumber = () => {
    setAddNom('');
    setAddPrenom('');
    setAddPhone('');
    setAddNumberModalVisible(true);
  };

  const handleSaveNewNumber = () => {
    if (!addPhone.trim()) {
      toast.error(t('common.invalidPhoneNumber'));
      return;
    }

    const newContact: ContactItem = {
      id: `new-${Date.now()}`,
      name: `${addPrenom} ${addNom}`.trim() || addPhone,
      phone: `${selectedCountry.callingCode} ${addPhone}`,
      hasKwismo: false,
      kwismoStatus: 'none',
      countryCode: selectedCountry.code,
    };

    setContactsList((prev) => [newContact, ...prev]);
    setAddNumberModalVisible(false);
    toast.success(t('common.numberVerifiedSuccess'));
  };

  const handleConfirmInvite = async () => {
    if (!targetInviteContact) return;
    setInviteModalVisible(false);
    const bodyText = `Rejoins-moi sur Kwismo pour sécuriser tes transactions Mobile Money ! https://kwismo.com/download`;
    const smsUrl = `sms:${targetInviteContact.phone.replace(/\s+/g, '')}${
      Platform.OS === 'ios' ? '&' : '?'
    }body=${encodeURIComponent(bodyText)}`;

    try {
      const supported = await Linking.canOpenURL(smsUrl);
      if (supported) {
        await Linking.openURL(smsUrl);
      } else {
        toast.info(`Invitation envoyée à ${targetInviteContact.name}`);
      }
    } catch {
      toast.info(`Invitation envoyée à ${targetInviteContact.name}`);
    }
  };

  const renderSubtitle = (item: ContactItem) => {
    if (!item.hasKwismo) {
      return (
        <Text className="text-xs text-slate-400 font-medium">
          {t('common.contactSubtitleNotOnKwismo')}
        </Text>
      );
    }

    switch (item.kwismoStatus) {
      case 'compromised':
        return (
          <Text className="text-xs text-red-500 font-medium">
            {t('common.contactSubtitleCompromised')}
          </Text>
        );
      case 'pending':
        return (
          <Text className="text-xs text-orange-400 font-medium">
            {t('common.contactSubtitlePending')}
          </Text>
        );
      case 'signalement':
        return (
          <Text className="text-xs text-emerald-500 font-medium">
            {t('common.contactSubtitleSignalement')}
          </Text>
        );
      case 'transfert':
        return (
          <Text className="text-xs text-emerald-500 font-medium">
            {t('common.contactSubtitleTransfert')}
          </Text>
        );
      case 'secured':
      default:
        return (
          <Text className="text-xs text-emerald-500 font-medium">
            {t('common.contactSubtitleSecured')}
          </Text>
        );
    }
  };

  const getAvatarBg = (item: ContactItem, index: number) => {
    if (!item.hasKwismo) return 'bg-slate-200 dark:bg-slate-700';
    const bgColors = ['bg-emerald-500', 'bg-orange-400', 'bg-blue-500', 'bg-brand-green'];
    return bgColors[index % bgColors.length];
  };

  const getAvatarContent = (item: ContactItem) => {
    if (!item.name || item.name.startsWith('+') || item.name.startsWith('#')) {
      return <Icon name="solar:user-bold" color="#FFFFFF" size={22} />;
    }
    const parts = item.name.trim().split(' ');
    let initials = parts[0][0];
    if (parts.length > 1) initials += parts[1][0];
    return <Text className="font-bold text-sm text-white">{initials.toUpperCase()}</Text>;
  };

  const handleHeaderBack = () => {
    if (isInviteMode) {
      setIsInviteMode(false);
    } else {
      router.back();
    }
  };

  return (
    <View className="flex-1 bg-brand-green">
      <StatusBar style="light" />

      {/* HeaderBar Component */}
      <HeaderBar
        title={isInviteMode ? t('common.inviteFriends') : t('common.myContactsTitle')}
        showBack={true}
        onBack={handleHeaderBack}
        rightAction={
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.back()}
            className="p-1"
          >
            <Icon name="solar:close-linear" color="#FFFFFF" size={24} />
          </TouchableOpacity>
        }
      />

      {/* Main Content White Container */}
      <View className="flex-1 bg-white dark:bg-brand-darkBg rounded-t-[28px] overflow-hidden pt-4 px-4">
        {permissionGranted === false ? (
          <View className="flex-1 items-center justify-center px-6">
            <Icon name="solar:users-group-two-rounded-bold" color="#94A3B8" size={64} className="mb-4" />
            <Text className="font-title text-lg font-bold text-slate-900 dark:text-white text-center mb-2">
              {t('common.contactsPermissionTitle')}
            </Text>
            <Text className="text-sm text-slate-500 dark:text-slate-400 text-center mb-6 leading-5">
              {t('common.contactsPermissionSubtitle')}
            </Text>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={requestContactsPermission}
              className="px-6 py-3 rounded-xl bg-brand-green"
            >
              <Text className="font-bold text-sm text-white">
                {t('common.grantPermission')}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Search Input */}
            <View className="flex-row items-center h-12 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-brand-cardDark px-4 mb-4 shadow-sm">
              <Icon name="solar:magnifer-linear" color="#94A3B8" size={20} className="mr-3" />
              <TextInput
                className="flex-1 text-sm font-medium text-slate-900 dark:text-white"
                placeholder={t('common.searchPlaceholderContacts')}
                placeholderTextColor="#94A3B8"
                value={search}
                onChangeText={setSearch}
              />
            </View>

            <ScrollView
              contentContainerStyle={{ paddingBottom: insets.bottom + 90 }}
              showsVerticalScrollIndicator={false}
            >
              {/* Inviter des amis Item (Only in normal contacts mode) */}
              {!isInviteMode && (
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => setIsInviteMode(true)}
                  className="flex-row items-center py-3 mb-2"
                >
                  <View className="w-11 h-11 rounded-full bg-brand-green items-center justify-center mr-3.5">
                    <Icon name="gravity-ui:hashtag" color="#FFFFFF" size={20} />
                  </View>
                  <Text className="font-bold text-base text-slate-900 dark:text-white">
                    {t('common.inviteFriends')}
                  </Text>
                </TouchableOpacity>
              )}

              {/* Section Header: Contacts / Tout sélectionner */}
              <View className="flex-row items-center justify-between mt-2 mb-3">
                <Text className="text-sm font-semibold text-slate-400 dark:text-slate-500">
                  {isInviteMode ? t('common.myContacts') : t('common.contactsHeader')}
                </Text>

                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={toggleSelectAll}
                  className="flex-row items-center gap-2"
                >
                  <Text className="text-xs font-medium text-slate-400 dark:text-slate-500">
                    {t('common.selectAll')}
                  </Text>
                  <View
                    className={`w-5 h-5 rounded-full border items-center justify-center ${
                      allSelected
                        ? 'border-brand-green bg-brand-green'
                        : 'border-slate-300 dark:border-slate-600'
                    }`}
                  >
                    {allSelected && <Icon name="gravity-ui:check" color="#FFFFFF" size={14} />}
                  </View>
                </TouchableOpacity>
              </View>

              {/* Contacts List with Skeleton Loader */}
              {loading ? (
                <SkeletonLoader>
                  <View className="gap-y-3 pt-2">
                    {Array.from({ length: 6 }).map((_, idx) => (
                      <View
                        key={`skel-contact-${idx}`}
                        className="flex-row items-center py-2.5 border-b border-slate-100 dark:border-slate-800/60"
                      >
                        <SkeletonCircle size={44} style={{ marginRight: 14 }} />
                        <View style={{ flex: 1, gap: 6 }}>
                          <Skeleton width="55%" height={16} borderRadius={4} />
                          <Skeleton width="35%" height={12} borderRadius={4} />
                        </View>
                        <SkeletonCircle size={20} />
                      </View>
                    ))}
                  </View>
                </SkeletonLoader>
              ) : filteredContacts.length === 0 ? (
                <View className="py-12 items-center justify-center">
                  <Text className="text-sm text-slate-400">{t('common.noContactsFound')}</Text>
                </View>
              ) : (
                filteredContacts.map((item, idx) => {
                  const isSelected = selectedContactIds.has(item.id);

                  return (
                    <TouchableOpacity
                      key={item.id}
                      activeOpacity={0.75}
                      onPress={() => toggleSelectContact(item)}
                      className="flex-row items-center justify-between py-2.5 border-b border-slate-100 dark:border-slate-800/60"
                    >
                      <View className="flex-row items-center flex-1 mr-2">
                        <View
                          className={`w-11 h-11 rounded-full items-center justify-center mr-3.5 ${getAvatarBg(
                            item,
                            idx
                          )}`}
                        >
                          {getAvatarContent(item)}
                        </View>

                        <View className="flex-1">
                          <Text
                            numberOfLines={1}
                            className="font-bold text-sm text-slate-900 dark:text-white"
                          >
                            {item.name}
                          </Text>
                          {renderSubtitle(item)}
                        </View>
                      </View>

                      <View className="flex-row items-center gap-2">
                        {item.hasKwismo && (
                          <Icon
                            name="solar:verified-check-bold"
                            color="#25B876"
                            size={18}
                          />
                        )}

                        <View
                          className={`w-5 h-5 rounded-full border items-center justify-center ${
                            isSelected
                              ? 'border-brand-green bg-brand-green'
                              : 'border-slate-300 dark:border-slate-600'
                          }`}
                        >
                          {isSelected && <Icon name="gravity-ui:check" color="#FFFFFF" size={14} />}
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })
              )}
            </ScrollView>
          </>
        )}
      </View>

      {/* Floating Action Button (Keypad Dialer to Add Number) */}
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => router.push('/(app)/add-number')}
        style={{ bottom: Math.max(insets.bottom + 24, 30) }}
        className="absolute right-5 w-14 h-14 rounded-full items-center justify-center bg-orange-400 shadow-lg shadow-orange-400/40 z-50"
      >
        <Icon name="ic:sharp-dialpad" color="#FFFFFF" size={26} />
      </TouchableOpacity>

      {/* Modal: Inviter sur Kwismo Confirmation */}
      <Modal visible={inviteModalVisible} transparent animationType="slide">
        <Pressable
          className="flex-1 bg-black/60 justify-end"
          onPress={() => setInviteModalVisible(false)}
        >
          <Pressable
            className="w-full bg-white dark:bg-brand-cardDark rounded-t-3xl p-6 pb-8"
            onPress={(e) => e.stopPropagation()}
          >
            <Text className="font-bold text-lg text-slate-900 dark:text-white mb-2">
              {t('common.inviteToKwismoTitle')}
            </Text>
            <Text className="text-sm text-slate-600 dark:text-slate-300 leading-5 mb-6">
              {t('common.inviteToKwismoMessage', {
                name: targetInviteContact?.name || targetInviteContact?.phone,
              })}
            </Text>

            <View className="flex-row justify-end gap-6">
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setInviteModalVisible(false)}
                className="px-4 py-2"
              >
                <Text className="font-bold text-base text-brand-green">{t('common.no')}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={handleConfirmInvite}
                className="px-4 py-2"
              >
                <Text className="font-bold text-base text-brand-green">{t('common.yes')}</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Country Picker Modal */}
      <CountryPickerModal
        visible={countryModalVisible}
        onClose={() => setCountryModalVisible(false)}
        onSelect={(c) => setSelectedCountry(c)}
        selectedCode={selectedCountry.code}
      />
    </View>
  );
}
