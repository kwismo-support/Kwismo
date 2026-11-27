import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useTranslation } from 'react-i18next';
import { Icon } from '@/shared/ui/Icon';
import { HeaderBar } from '@/shared/components/HeaderBar';
import { useAppTheme } from '@/shared/hooks/useAppTheme';
import { useSubscriptionStore } from '@/features/subscriptions/store/subscriptionStore';

export default function FamilyGroupScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t, i18n } = useTranslation();
  const { isDark } = useAppTheme();
  const isEn = i18n.language?.startsWith('en');

  const {
    currentPlan,
    familyMembers,
    maxMembers,
    addFamilyMemberLocally,
    removeFamilyMemberLocally,
  } = useSubscriptionStore();

  const [inviteModalVisible, setInviteModalVisible] = useState(false);
  const [inviteName, setInviteName] = useState('');
  const [invitePhone, setInvitePhone] = useState('');
  const [loading, setLoading] = useState(false);

  const availableSlots = Math.max(0, maxMembers - familyMembers.length);

  const handleInviteSubmit = async () => {
    if (!inviteName.trim() || !invitePhone.trim()) {
      Alert.alert(
        t('subscriptions.family.missingInfoTitle'),
        t('subscriptions.family.missingInfoDesc')
      );
      return;
    }

    setLoading(true);
    const ok = await addFamilyMemberLocally(inviteName, invitePhone);
    setLoading(false);

    if (ok) {
      const addedName = inviteName;
      setInviteName('');
      setInvitePhone('');
      setInviteModalVisible(false);
      Alert.alert(
        t('subscriptions.family.addedTitle'),
        t('subscriptions.family.addedDesc', { name: addedName })
      );
    } else {
      Alert.alert(
        t('subscriptions.family.quotaReachedTitle'),
        t('subscriptions.family.quotaReachedDesc')
      );
    }
  };

  const handleRemoveMember = (id: string, name: string) => {
    Alert.alert(
      t('subscriptions.family.removeTitle'),
      t('subscriptions.family.removeDesc', { name }),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('subscriptions.family.removeConfirm'),
          style: 'destructive',
          onPress: () => removeFamilyMemberLocally(id),
        },
      ]
    );
  };

  const planName = currentPlan
    ? (isEn ? (currentPlan.nom_en || currentPlan.nom_fr) : currentPlan.nom_fr)
    : t('subscriptions.family.defaultTitle');

  return (
    <View className="flex-1 bg-slate-50 dark:bg-brand-darkBg">
      <StatusBar style={isDark ? 'light' : 'dark'} />

      <HeaderBar
        title={t('subscriptions.family.title')}
        showBack
        onBack={() => router.back()}
      />

      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
        showsVerticalScrollIndicator={false}
        className="px-5 pt-3"
      >
        {/* Jauge des quotas de membres */}
        <View className="p-5 rounded-3xl bg-indigo-600 mb-5 shadow-sm">
          <View className="flex-row items-center justify-between mb-3">
            <View className="flex-row items-center">
              <View className="w-10 h-10 rounded-2xl bg-white/20 items-center justify-center mr-3">
                <Icon name="solar:users-group-two-rounded-bold" size={22} color="#FFFFFF" />
              </View>
              <View>
                <Text className="text-white font-bold font-title text-base">
                  {planName}
                </Text>
                <Text className="text-white/80 text-xs">
                  {t('subscriptions.family.protectedMembers', { count: familyMembers.length, max: maxMembers })}
                </Text>
              </View>
            </View>

            <View className="bg-white/20 px-3 py-1 rounded-full">
              <Text className="text-white text-[11px] font-bold">
                {t('subscriptions.family.slotsLeft', { count: availableSlots })}
              </Text>
            </View>
          </View>

          {/* Barre de progression */}
          <View className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
            <View
              className="h-full bg-white rounded-full"
              style={{ width: `${Math.min(100, (familyMembers.length / Math.max(1, maxMembers)) * 100)}%` }}
            />
          </View>
        </View>

        {/* Bouton d'ajout de membre */}
        {availableSlots > 0 ? (
          <TouchableOpacity
            onPress={() => setInviteModalVisible(true)}
            activeOpacity={0.8}
            className="flex-row items-center justify-center p-3.5 mb-5 rounded-2xl border-2 border-dashed border-brand-blue/30 bg-brand-blue/5 dark:border-brand-blue/40 dark:bg-brand-blue/10"
          >
            <Icon name="solar:user-plus-bold" size={18} color="#2563EB" />
            <Text className="text-xs font-bold text-brand-blue ml-2">
              {t('subscriptions.family.inviteButton')}
            </Text>
          </TouchableOpacity>
        ) : null}

        {/* Liste des membres */}
        <Text className="text-xs font-bold uppercase tracking-wider mb-3 px-1 text-slate-600 dark:text-slate-400">
          {t('subscriptions.family.circleTitle')}
        </Text>

        <View className="gap-2.5">
          {familyMembers.map((member) => (
            <View
              key={member.id}
              className="p-4 rounded-2xl border flex-row items-center justify-between bg-white dark:bg-brand-cardDark border-slate-200 dark:border-slate-800 shadow-sm"
            >
              <View className="flex-row items-center flex-1 pr-2">
                <View className={`w-10 h-10 rounded-2xl items-center justify-center mr-3 ${
                  member.role === 'admin' ? 'bg-amber-500/20' : 'bg-indigo-500/20'
                }`}>
                  <Icon
                    name={member.role === 'admin' ? 'solar:crown-bold' : 'solar:user-bold'}
                    size={20}
                    color={member.role === 'admin' ? '#D97706' : '#6366F1'}
                  />
                </View>

                <View className="flex-1">
                  <View className="flex-row items-center gap-1.5">
                    <Text className="text-sm font-bold text-slate-900 dark:text-white">
                      {member.name}
                    </Text>
                    {member.role === 'admin' && (
                      <View className="bg-amber-500/15 px-1.5 py-0.5 rounded">
                        <Text className="text-[9px] font-bold text-amber-600">
                          {t('subscriptions.family.adminBadge')}
                        </Text>
                      </View>
                    )}
                  </View>
                  <Text className="text-xs text-slate-500 dark:text-slate-400">{member.phoneNumber}</Text>
                </View>
              </View>

              <View className="flex-row items-center gap-2">
                <View className="flex-row items-center bg-emerald-500/10 px-2 py-1 rounded-full border border-emerald-500/20">
                  <Icon name="solar:shield-check-bold" size={13} color="#10B981" />
                  <Text className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 ml-1">
                    {t('subscriptions.family.protectedBadge')}
                  </Text>
                </View>

                {member.role !== 'admin' && (
                  <TouchableOpacity
                    onPress={() => handleRemoveMember(member.id, member.name)}
                    className="p-1.5 rounded-lg bg-rose-500/10"
                  >
                    <Icon name="solar:trash-bin-trash-bold" size={16} color="#E11D48" />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))}
        </View>

        {/* Explications */}
        <View className="mt-8 p-4 rounded-2xl bg-slate-100 dark:bg-brand-cardDark border border-slate-200 dark:border-slate-800">
          <View className="flex-row items-center mb-1.5">
            <Icon name="solar:shield-star-bold" size={16} color="#2563EB" />
            <Text className="text-xs font-bold ml-1.5 text-slate-900 dark:text-white">
              {t('subscriptions.family.benefitsTitle')}
            </Text>
          </View>
          <Text className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
            {t('subscriptions.family.benefitsDesc')}
          </Text>
        </View>
      </ScrollView>

      {/* Modal Inviter un Proche */}
      <Modal visible={inviteModalVisible} transparent animationType="slide">
        <View className="flex-1 bg-black/60 justify-end">
          <View className="rounded-t-3xl p-6 bg-white dark:bg-brand-cardDark border-t border-slate-200 dark:border-slate-800">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-base font-bold font-title text-slate-900 dark:text-white">
                {t('subscriptions.family.modalTitle')}
              </Text>
              <TouchableOpacity onPress={() => setInviteModalVisible(false)} className="p-1">
                <Icon name="solar:close-circle-bold" size={22} color="#94A3B8" />
              </TouchableOpacity>
            </View>

            <View className="mb-4">
              <Text className="text-xs font-semibold mb-1.5 text-slate-700 dark:text-slate-300">
                {t('subscriptions.family.nameLabel')} *
              </Text>
              <TextInput
                value={inviteName}
                onChangeText={setInviteName}
                placeholder={t('subscriptions.family.namePlaceholder')}
                placeholderTextColor="#94A3B8"
                className="h-12 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-brand-darkBg text-slate-900 dark:text-white text-sm"
              />
            </View>

            <View className="mb-6">
              <Text className="text-xs font-semibold mb-1.5 text-slate-700 dark:text-slate-300">
                {t('subscriptions.family.phoneLabel')} *
              </Text>
              <TextInput
                value={invitePhone}
                onChangeText={setInvitePhone}
                placeholder={t('subscriptions.family.phonePlaceholder')}
                placeholderTextColor="#94A3B8"
                keyboardType="phone-pad"
                className="h-12 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-brand-darkBg text-slate-900 dark:text-white text-sm"
              />
            </View>

            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={() => setInviteModalVisible(false)}
                activeOpacity={0.8}
                className="flex-1 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 items-center justify-center bg-slate-50 dark:bg-slate-800"
              >
                <Text className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {t('subscriptions.family.modalCancel')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleInviteSubmit}
                disabled={loading}
                activeOpacity={0.8}
                className="flex-1 py-3.5 rounded-xl bg-brand-blue items-center justify-center shadow-md shadow-brand-blue/30"
              >
                <Text className="text-xs font-bold text-white">
                  {t('subscriptions.family.modalConfirm')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
