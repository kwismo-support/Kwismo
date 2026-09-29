import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Share,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from '@/shared/ui/Icon';
import { HeaderBar } from '@/shared/components/HeaderBar';
import { toast } from '@/shared/store/toastStore';
import { verifyApi, VerifyResult } from '@/features/verify/services/verify.api';

export default function ContactDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const params = useLocalSearchParams<{
    phone?: string;
    name?: string;
    status?: string;
  }>();

  const phone = params.phone || '';
  const name = params.name && params.name !== phone ? params.name : t('common.unknown');

  const [loading, setLoading] = useState(true);
  const [phoneInfo, setPhoneInfo] = useState<VerifyResult | null>(null);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      if (!phone) {
        setLoading(false);
        return;
      }
      try {
        const res = await verifyApi.checkNumber(phone);
        if (res && res.success && res.data && isMounted) {
          setPhoneInfo(res.data);
        }
      } catch {
      } finally {
        if (isMounted) setLoading(false);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [phone]);

  const currentStatus = phoneInfo?.statut || params.status || 'securise';
  const operatorName = phoneInfo?.operator && phoneInfo.operator !== 'Opérateur Mobile'
    ? phoneInfo.operator
    : t('common.operatorNotRegistered');

  const handleShare = async () => {
    try {
      await Share.share({
        title: `${t('common.myContactsTitle')} - ${name}`,
        message: `${name}\n${phone}\n${operatorName}`,
      });
    } catch {
      toast.info(t('common.shareError'));
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
    let text = t('common.contactSubtitleSecured');
    let bgClass = 'bg-emerald-100 dark:bg-emerald-950/40';
    let textClass = 'text-emerald-700 dark:text-emerald-400';

    if (
      currentStatus === 'compromised' ||
      currentStatus === 'compromis' ||
      currentStatus === 'whatsapp_alert' ||
      currentStatus === 'alert'
    ) {
      text = t('common.contactSubtitleCompromised');
      bgClass = 'bg-red-100 dark:bg-red-950/40';
      textClass = 'text-red-700 dark:text-red-400';
    } else if (
      currentStatus === 'suspect' ||
      currentStatus === 'frauduleux' ||
      currentStatus === 'a_signaler'
    ) {
      text = t('common.contactSubtitleSignalement');
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
    <View className="flex-1 bg-brand-green">
      <StatusBar style="light" />

      <HeaderBar
        title={t('common.myContactsTitle')}
        showBack={true}
        onBack={() => router.back()}
        rightAction={
          <View className="flex-row items-center gap-3">
            <TouchableOpacity activeOpacity={0.7} onPress={handleEdit} className="p-1">
              <Icon name="solar:pen-linear" color="#FFFFFF" size={20} />
            </TouchableOpacity>

            <TouchableOpacity activeOpacity={0.7} onPress={handleShare} className="p-1">
              <Icon name="solar:share-linear" color="#FFFFFF" size={20} />
            </TouchableOpacity>
          </View>
        }
      />

      <View className="flex-1 bg-white dark:bg-brand-darkBg rounded-t-[28px] overflow-hidden pt-6 px-6">
        <ScrollView
          contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
          showsVerticalScrollIndicator={false}
        >
          <View className="items-center mb-6">
            <View className="wx-20 hx-20 rounded-full bg-brand-green/10 dark:bg-brand-green/20 items-center justify-center mb-3 border border-brand-green/30">
              <Icon name="solar:user-bold" color="#25B876" size={40} />
            </View>

            <Text className="font-montserrat-bold text-xl font-bold text-slate-900 dark:text-white text-center mb-0.5">
              {phone}
            </Text>
            <Text className="text-xs font-medium text-slate-500 dark:text-slate-400 text-center">
              {name}
            </Text>
          </View>

          <View className="flex-row items-center justify-around mb-8">
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() =>
                router.push({
                  pathname: '/(app)/verify',
                  params: { phone },
                })
              }
              className="wx-16 hx-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 items-center justify-center border border-emerald-100 dark:border-emerald-900/40 shadow-sm"
            >
              <Icon name="solar:qr-code-bold" color="#25B876" size={22} />
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() =>
                router.push({
                  pathname: '/(app)/new-transfer',
                  params: { recipient: phone },
                })
              }
              className="wx-16 hx-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 items-center justify-center border border-emerald-100 dark:border-emerald-900/40 shadow-sm"
            >
              <Icon name="solar:transfer-horizontal-bold" color="#25B876" size={22} />
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => Linking.openURL(`tel:${phone.replace(/\s+/g, '')}`).catch(() => {})}
              className="wx-16 hx-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 items-center justify-center border border-emerald-100 dark:border-emerald-900/40 shadow-sm"
            >
              <Icon name="solar:user-speak-bold" color="#25B876" size={22} />
            </TouchableOpacity>
          </View>

          <View className="bg-white dark:bg-brand-cardDark rounded-2xl p-4 border border-slate-100 dark:border-slate-800/80 shadow-sm gap-y-4">
            <View className="flex-row items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800/60 pb-3">
              <Text className="text-xs font-medium text-slate-500 dark:text-slate-400">
                {t('common.phoneNumber')}
              </Text>
              <Text className="font-montserrat-bold text-xs font-bold text-slate-900 dark:text-white">
                {phone}
              </Text>
            </View>

            <View className="flex-row items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800/60 pb-3">
              <Text className="text-xs font-medium text-slate-500 dark:text-slate-400">
                {t('common.operator')}
              </Text>

              {loading ? (
                <ActivityIndicator size="small" color="#00A859" />
              ) : (
                <Text className="font-montserrat-bold text-xs font-bold text-slate-900 dark:text-white">
                  {operatorName}
                </Text>
              )}
            </View>

            <View className="flex-row items-center justify-between py-1">
              <Text className="text-xs font-medium text-slate-500 dark:text-slate-400">
                {t('common.status')}
              </Text>
              {renderStatusBadge()}
            </View>
          </View>
        </ScrollView>
      </View>
    </View>
  );
}
