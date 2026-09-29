import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Share,
  Linking,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from '@/shared/ui/Icon';
import { toast } from '@/shared/store/toastStore';

function detectOperator(phone: string = ''): string {
  const clean = phone.replace(/\D/g, '');
  const suffix = clean.length >= 9 ? clean.slice(-9) : clean;
  if (!suffix || suffix.length < 9) return 'Opérateur Mobile';

  const prefix3 = suffix.slice(0, 3);
  const prefix2 = suffix.slice(0, 2);

  if (prefix2 === '69' || ['655', '656', '657', '658', '659'].includes(prefix3)) {
    return 'Orange';
  }
  if (prefix2 === '67' || prefix2 === '68' || ['650', '651', '652', '653', '654'].includes(prefix3)) {
    return 'MTN';
  }
  if (prefix2 === '62') {
    return 'Camtel';
  }
  if (prefix2 === '66') {
    return 'Nexttel';
  }
  return 'Opérateur Mobile';
}

export default function ContactDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const params = useLocalSearchParams<{
    phone?: string;
    name?: string;
    status?: string;
    hasKwismo?: string;
  }>();

  const phone = params.phone || '+237 6 98 00 40 12';
  const name = params.name && params.name !== phone ? params.name : 'Inconnu';
  const rawStatus = params.status || 'securise';
  const operator = detectOperator(phone);

  const handleShare = async () => {
    try {
      await Share.share({
        title: `Contact Kwismo - ${name}`,
        message: `Contact Kwismo : ${name}\nNuméro : ${phone}\nStatut : ${rawStatus}`,
      });
    } catch {
      toast.info(t('common.shareError') || 'Erreur lors du partage');
    }
  };

  const handleEdit = () => {
    router.push({
      pathname: '/(app)/add-number',
      params: {
        isEdit: 'true',
        phone,
        name,
      },
    });
  };

  const renderStatusBadge = () => {
    let text = t('common.contactSubtitleSecured') || 'Sécurisé';
    let bgClass = 'bg-emerald-100 dark:bg-emerald-950/40';
    let textClass = 'text-emerald-700 dark:text-emerald-400';

    if (rawStatus === 'compromised' || rawStatus === 'compromis' || rawStatus === 'whatsapp_alert' || rawStatus === 'alert') {
      text = t('common.contactSubtitleCompromised') || 'Compromis';
      bgClass = 'bg-red-100 dark:bg-red-950/40';
      textClass = 'text-red-700 dark:text-red-400';
    } else if (rawStatus === 'suspect' || rawStatus === 'frauduleux' || rawStatus === 'a_signaler') {
      text = t('common.contactSubtitleSignalement') || 'A signaler / Suspect';
      bgClass = 'bg-amber-100 dark:bg-amber-950/40';
      textClass = 'text-amber-700 dark:text-amber-400';
    }

    return (
      <View className={`px-3 py-1 rounded-full ${bgClass}`}>
        <Text className={`font-bold text-xs ${textClass}`}>{text}</Text>
      </View>
    );
  };

  return (
    <View className="flex-1 bg-white dark:bg-brand-darkBg">
      <StatusBar style="light" />

      {/* GREEN TOP SECTION */}
      <View
        style={{ paddingTop: Math.max(insets.top, 16) }}
        className="bg-brand-green rounded-b-[36px] px-6 pb-8 items-center"
      >
        {/* Header navigation & actions */}
        <View className="w-full flex-row items-center justify-between mb-4">
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.back()}
            className="p-1"
          >
            <Icon name="solar:alt-arrow-left-linear" color="#FFFFFF" size={24} />
          </TouchableOpacity>

          <View className="flex-row items-center gap-4">
            <TouchableOpacity activeOpacity={0.7} onPress={handleEdit} className="p-1">
              <Icon name="solar:pen-linear" color="#FFFFFF" size={22} />
            </TouchableOpacity>

            <TouchableOpacity activeOpacity={0.7} onPress={handleShare} className="p-1">
              <Icon name="solar:share-linear" color="#FFFFFF" size={22} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Large Avatar */}
        <View className="w-24 h-24 rounded-full bg-white/20 items-center justify-center mb-4 border-2 border-white/30">
          <Icon name="solar:user-bold" color="#FFFFFF" size={48} />
        </View>

        {/* Phone number & Name */}
        <Text className="font-montserrat-bold text-2xl font-bold text-white text-center mb-1">
          {phone}
        </Text>
        <Text className="text-sm font-medium text-white/90 text-center">
          {name}
        </Text>
      </View>

      {/* MAIN CONTENT */}
      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
        showsVerticalScrollIndicator={false}
        className="flex-1 px-6 pt-6"
      >
        {/* 3 MIDDLE ACTION BUTTONS */}
        <View className="flex-row items-center justify-around mb-8">
          {/* Action 1: Verify */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() =>
              router.push({
                pathname: '/(app)/verify',
                params: { phone },
              })
            }
            className="w-18 h-18 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 items-center justify-center border border-emerald-100 dark:border-emerald-900/40 shadow-sm"
          >
            <Icon name="solar:qr-code-bold" color="#25B876" size={28} />
          </TouchableOpacity>

          {/* Action 2: Transfer */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() =>
              router.push({
                pathname: '/(app)/new-transfer',
                params: { recipient: phone },
              })
            }
            className="w-18 h-18 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 items-center justify-center border border-emerald-100 dark:border-emerald-900/40 shadow-sm"
          >
            <Icon name="solar:transfer-horizontal-bold" color="#25B876" size={28} />
          </TouchableOpacity>

          {/* Action 3: Dial / Call */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => Linking.openURL(`tel:${phone.replace(/\s+/g, '')}`).catch(() => {})}
            className="w-18 h-18 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 items-center justify-center border border-emerald-100 dark:border-emerald-900/40 shadow-sm"
          >
            <Icon name="solar:user-speak-bold" color="#25B876" size={28} />
          </TouchableOpacity>
        </View>

        {/* DETAILS TABLE */}
        <View className="bg-white dark:bg-brand-cardDark rounded-2xl p-4 border border-slate-100 dark:border-slate-800/80 shadow-sm gap-y-5">
          <View className="flex-row items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800/60 pb-4">
            <Text className="text-sm font-medium text-slate-600 dark:text-slate-400">
              {t('common.phoneNumber')}
            </Text>
            <Text className="font-montserrat-bold text-sm font-bold text-slate-900 dark:text-white">
              {phone}
            </Text>
          </View>

          <View className="flex-row items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800/60 pb-4">
            <Text className="text-sm font-medium text-slate-600 dark:text-slate-400">
              {t('common.operator')}
            </Text>
            <Text className="font-montserrat-bold text-sm font-bold text-slate-900 dark:text-white">
              {operator}
            </Text>
          </View>

          <View className="flex-row items-center justify-between py-1">
            <Text className="text-sm font-medium text-slate-600 dark:text-slate-400">
              {t('common.status')}
            </Text>
            {renderStatusBadge()}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
