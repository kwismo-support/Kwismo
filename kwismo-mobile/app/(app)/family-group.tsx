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
    isFamilyAdmin,
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
        isEn ? 'Information Missing' : 'Informations incomplètes',
        isEn ? 'Please enter both a name and a phone number.' : 'Veuillez saisir un nom et un numéro de téléphone.'
      );
      return;
    }

    setLoading(true);
    const ok = await addFamilyMemberLocally(inviteName, invitePhone);
    setLoading(false);

    if (ok) {
      setInviteName('');
      setInvitePhone('');
      setInviteModalVisible(false);
      Alert.alert(
        isEn ? 'Member Added' : 'Membre Ajouté',
        isEn
          ? `${inviteName} is now protected under your family security umbrella.`
          : `${inviteName} est désormais protégé sous votre couverture familiale.`
      );
    } else {
      Alert.alert(
        isEn ? 'Quota Limit Reached' : 'Limite atteinte',
        isEn ? 'You have reached the maximum number of family members.' : 'Votre formule a atteint le nombre maximum de membres.'
      );
    }
  };

  const handleRemoveMember = (id: string, name: string) => {
    Alert.alert(
      isEn ? 'Remove Member' : 'Retirer ce membre',
      isEn
        ? `Are you sure you want to remove ${name} from your family plan?`
        : `Voulez-vous vraiment retirer ${name} de votre protection familiale ?`,
      [
        { text: isEn ? 'Cancel' : 'Annuler', style: 'cancel' },
        {
          text: isEn ? 'Remove' : 'Retirer',
          style: 'destructive',
          onPress: () => removeFamilyMemberLocally(id),
        },
      ]
    );
  };

  return (
    <View className={`flex-1 ${isDark ? 'bg-[#161E33]' : 'bg-slate-50'}`}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      <HeaderBar
        title={isEn ? 'Family Security Hub' : 'Sécurité Familiale'}
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
                  {currentPlan ? (isEn ? currentPlan.nom_en : currentPlan.nom_fr) : (isEn ? 'Family Plan' : 'Pack Famille')}
                </Text>
                <Text className="text-white/80 text-xs">
                  {familyMembers.length} / {maxMembers} {isEn ? 'protected members' : 'membres protégés'}
                </Text>
              </View>
            </View>

            <View className="bg-white/20 px-3 py-1 rounded-full">
              <Text className="text-white text-[11px] font-bold">
                {availableSlots} {isEn ? 'left' : 'dispo'}
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
            className={`flex-row items-center justify-center p-3.5 mb-5 rounded-2xl border-2 border-dashed ${
              isDark ? 'border-brand-blue/40 bg-brand-blue/10' : 'border-brand-blue/30 bg-brand-blue/5'
            }`}
          >
            <Icon name="solar:user-plus-bold" size={18} color="#2563EB" />
            <Text className="text-xs font-bold text-brand-blue ml-2">
              {isEn ? '+ Invite a Family Member' : '+ Inviter un membre de ma famille'}
            </Text>
          </TouchableOpacity>
        ) : null}

        {/* Liste des membres */}
        <Text className={`text-xs font-bold uppercase tracking-wider mb-3 px-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
          {isEn ? 'Protected Family Circle' : 'Membres du Cercle'}
        </Text>

        <View className="gap-2.5">
          {familyMembers.map((member) => (
            <View
              key={member.id}
              className={`p-4 rounded-2xl border flex-row items-center justify-between ${
                isDark ? 'bg-[#1D273F] border-white/10' : 'bg-white border-slate-200 shadow-sm'
              }`}
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
                    <Text className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {member.name}
                    </Text>
                    {member.role === 'admin' && (
                      <View className="bg-amber-500/15 px-1.5 py-0.5 rounded">
                        <Text className="text-[9px] font-bold text-amber-600">Admin</Text>
                      </View>
                    )}
                  </View>
                  <Text className="text-xs text-slate-500">{member.phoneNumber}</Text>
                </View>
              </View>

              <View className="flex-row items-center gap-2">
                <View className="flex-row items-center bg-emerald-500/10 px-2 py-1 rounded-full border border-emerald-500/20">
                  <Icon name="solar:shield-check-bold" size={13} color="#10B981" />
                  <Text className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 ml-1">
                    {isEn ? 'Protected' : 'Protégé'}
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
        <View className="mt-8 p-4 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10">
          <View className="flex-row items-center mb-1.5">
            <Icon name="solar:shield-star-bold" size={16} color="#2563EB" />
            <Text className={`text-xs font-bold ml-1.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {isEn ? 'Shared Family Benefits' : 'Avantages de la Protection Familiale'}
            </Text>
          </View>
          <Text className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
            {isEn
              ? 'All family members receive automatic scam detection on unknown incoming calls and SMS. Fraud alerts are shared immediately across the circle.'
              : 'Tous les membres invités bénéficient gratuitement du filtrage des appels et SMS inconnus. Si un membre reçoit un appel suspect, le cercle est prévenu.'}
          </Text>
        </View>
      </ScrollView>

      {/* Modal Inviter un Proche */}
      <Modal visible={inviteModalVisible} transparent animationType="slide">
        <View className="flex-1 bg-black/60 justify-end">
          <View className={`rounded-t-3xl p-6 ${isDark ? 'bg-[#1D273F]' : 'bg-white'}`}>
            <View className="flex-row items-center justify-between mb-4">
              <Text className={`text-base font-bold font-title ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {isEn ? 'Add a Family Member' : 'Ajouter un membre à la famille'}
              </Text>
              <TouchableOpacity onPress={() => setInviteModalVisible(false)} className="p-1">
                <Icon name="solar:close-circle-bold" size={22} color="#94A3B8" />
              </TouchableOpacity>
            </View>

            <View className="mb-4">
              <Text className={`text-xs font-semibold mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                {isEn ? 'Full Name' : 'Nom du proche'} *
              </Text>
              <TextInput
                value={inviteName}
                onChangeText={setInviteName}
                placeholder="ex: Maman, Junior..."
                placeholderTextColor="#94A3B8"
                className={`p-3 rounded-xl border text-xs ${
                  isDark ? 'bg-white/5 border-white/15 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                }`}
              />
            </View>

            <View className="mb-6">
              <Text className={`text-xs font-semibold mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                {isEn ? 'Phone Number' : 'Numéro de téléphone'} *
              </Text>
              <TextInput
                value={invitePhone}
                onChangeText={setInvitePhone}
                placeholder="ex: +237 699 00 00 00"
                placeholderTextColor="#94A3B8"
                keyboardType="phone-pad"
                className={`p-3 rounded-xl border text-xs ${
                  isDark ? 'bg-white/5 border-white/15 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                }`}
              />
            </View>

            <TouchableOpacity
              onPress={handleInviteSubmit}
              disabled={loading}
              activeOpacity={0.8}
              className="w-full py-3.5 rounded-xl bg-brand-blue items-center justify-center"
            >
              <Text className="text-xs font-bold text-white">
                {isEn ? 'Confirm & Protect' : 'Confirmer et Protéger'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
