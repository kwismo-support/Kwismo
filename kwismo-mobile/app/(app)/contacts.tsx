import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Pressable,
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
import { Icon } from '@/shared/ui/Icon';
import { HeaderBar } from '@/shared/components/HeaderBar';
import { Skeleton, SkeletonCircle, SkeletonLoader } from '@/shared/ui/Skeleton';
import { toast } from '@/shared/store/toastStore';
import { useContacts } from '@/features/contacts/hooks/useContacts';
import { ContactCard } from '@/features/contacts/components/ContactCard';
import { EmptyContactsState } from '@/features/contacts/components/EmptyContactsState';
import { ContactItem } from '@/features/contacts/types/contacts.types';

export default function ContactsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  const {
    loading,
    permissionGranted,
    filteredContacts,
    search,
    setSearch,
    selectedContactIds,
    isInviteMode,
    setIsInviteMode,
    loadContacts,
    toggleSelectAll,
    toggleSelectContact,
  } = useContacts();

  const [inviteModalVisible, setInviteModalVisible] = useState(false);
  const [targetInviteContact, setTargetInviteContact] = useState<ContactItem | null>(null);

  const allSelected =
    filteredContacts.length > 0 &&
    filteredContacts.every((c) => selectedContactIds.has(c.id));

  const handleSelectContactItem = (contact: ContactItem) => {
    toggleSelectContact(contact.id);
    if (isInviteMode && !contact.hasKwismo) {
      setTargetInviteContact(contact);
      setInviteModalVisible(true);
    }
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
        toast.info(t('toasts.inviteSentTo', { name: targetInviteContact.name }));
      }
    } catch {
      toast.info(t('toasts.inviteSentTo', { name: targetInviteContact.name }));
    }
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

      <View className="flex-1 bg-white dark:bg-brand-darkBg rounded-t-[28px] overflow-hidden pt-4 px-4">
        <View className="flex-row items-center hx-12 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-brand-cardDark px-4 mb-4 shadow-sm">
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
          {!isInviteMode && (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setIsInviteMode(true)}
              className="flex-row items-center py-3 mb-2"
            >
              <View className="wx-11 hx-11 rounded-full bg-brand-green items-center justify-center mr-3.5">
                <Icon name="gravity-ui:hashtag" color="#FFFFFF" size={20} />
              </View>
              <Text className="font-bold text-base text-slate-900 dark:text-white">
                {t('common.inviteFriends')}
              </Text>
            </TouchableOpacity>
          )}

          <View className="flex-row items-center justify-between mt-2 mb-3">
            <Text className="text-sm font-semibold text-slate-400 dark:text-slate-500">
              {isInviteMode ? t('common.myContacts') : t('common.contactsHeader')}
            </Text>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => toggleSelectAll(filteredContacts)}
              className="flex-row items-center gap-2"
            >
              <Text className="text-xs font-medium text-slate-400 dark:text-slate-500">
                {t('common.selectAll')}
              </Text>
              <View
                className={`wx-5 hx-5 rounded-full border items-center justify-center ${
                  allSelected
                    ? 'border-brand-green bg-brand-green'
                    : 'border-slate-300 dark:border-slate-600'
                }`}
              >
                {allSelected && <Icon name="gravity-ui:check" color="#FFFFFF" size={14} />}
              </View>
            </TouchableOpacity>
          </View>

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
            <EmptyContactsState
              permissionGranted={permissionGranted}
              onRequestPermission={loadContacts}
              onAddContact={() => router.push('/(app)/add-number')}
            />
          ) : (
            filteredContacts.map((item, idx) => (
              <ContactCard
                key={item.id}
                item={item}
                index={idx}
                isSelected={selectedContactIds.has(item.id)}
                onToggleSelect={handleSelectContactItem}
              />
            ))
          )}
        </ScrollView>
      </View>

      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => router.push('/(app)/add-number')}
        style={{ bottom: Math.max(insets.bottom + 24, 30) }}
        className="absolute right-5 wx-14 hx-14 rounded-full items-center justify-center bg-orange-400 shadow-lg shadow-orange-400/40 z-50"
      >
        <Icon name="ic:sharp-dialpad" color="#FFFFFF" size={26} />
      </TouchableOpacity>

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
    </View>
  );
}
