import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Modal,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useTranslation } from 'react-i18next';
import { Icon } from '@/shared/ui/Icon';
import { HeaderBar } from '@/shared/components/HeaderBar';
import { useAppTheme } from '@/shared/hooks/useAppTheme';
import { useAuthStore } from '@/shared/store/authStore';
import { useSubscriptionStore } from '@/features/subscriptions/store/subscriptionStore';

type PaymentMethod = 'orange_money' | 'mtn_momo' | 'wave' | 'ussd';

export default function SubscriptionCheckoutScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t, i18n } = useTranslation();
  const { isDark } = useAppTheme();
  const isEn = i18n.language?.startsWith('en');
  const params = useLocalSearchParams<{ planId: string }>();

  const { availablePlans, activatePlanLocally } = useSubscriptionStore();
  const { user } = useAuthStore();

  const selectedPlan = availablePlans.find((p) => p.id === params.planId) || availablePlans[0];

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('orange_money');
  const [phoneNumber, setPhoneNumber] = useState(user?.phone || (user as any)?.phoneNumber || '');
  const [loading, setLoading] = useState(false);
  const [successModalVisible, setSuccessModalVisible] = useState(false);

  if (!selectedPlan) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50 dark:bg-brand-darkBg">
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  const handlePay = async () => {
    if (!phoneNumber.trim()) {
      Alert.alert(
        t('subscriptions.checkout.phoneRequiredTitle'),
        t('subscriptions.checkout.phoneRequiredDesc')
      );
      return;
    }

    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      await activatePlanLocally(selectedPlan);
      setSuccessModalVisible(true);
    } catch (err: any) {
      Alert.alert(
        t('subscriptions.checkout.errorTitle'),
        err.message || t('subscriptions.checkout.errorDesc')
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSuccessClose = () => {
    setSuccessModalVisible(false);
    if (selectedPlan.max_membres > 1) {
      router.replace('/(app)/family-group' as any);
    } else {
      router.replace('/(app)/' as any);
    }
  };

  return (
    <View className="flex-1 bg-slate-50 dark:bg-brand-darkBg">
      <StatusBar style={isDark ? 'light' : 'dark'} />

      <HeaderBar
        title={t('subscriptions.checkout.title')}
        showBack
        onBack={() => router.back()}
      />

      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
        showsVerticalScrollIndicator={false}
        className="px-5 pt-4"
      >
        {/* Carte Récapitulative de la formule */}
        <View className="rounded-3xl p-5 mb-5 border bg-white dark:bg-brand-cardDark border-slate-200 dark:border-slate-800 shadow-sm">
          <Text className="text-xs font-semibold text-brand-blue uppercase tracking-wider mb-1">
            {t('subscriptions.checkout.selectedPackage')}
          </Text>
          <Text className="text-xl font-bold font-title text-slate-900 dark:text-white">
            {isEn ? selectedPlan.nom_en : selectedPlan.nom_fr}
          </Text>

          <View className="flex-row items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-4 mt-3">
            <Text className="text-xs text-slate-500 dark:text-slate-400">
              {t('subscriptions.checkout.duration')}
            </Text>
            <Text className="text-xs font-bold text-slate-900 dark:text-white">
              {selectedPlan.duree_jours} {selectedPlan.duree_jours > 1 ? t('subscriptions.daysSuffix') : t('subscriptions.daySuffix')}
            </Text>
          </View>

          <View className="flex-row items-center justify-between pt-2">
            <Text className="text-xs text-slate-500 dark:text-slate-400">
              {t('subscriptions.checkout.numbersIncluded')}
            </Text>
            <Text className="text-xs font-bold text-slate-900 dark:text-white">
              {selectedPlan.max_numeros} {selectedPlan.max_numeros > 1 ? t('subscriptions.numberPlural') : t('subscriptions.numberSingular')}
            </Text>
          </View>

          <View className="flex-row items-center justify-between pt-2">
            <Text className="text-xs text-slate-500 dark:text-slate-400">
              {t('subscriptions.checkout.membersIncluded')}
            </Text>
            <Text className="text-xs font-bold text-slate-900 dark:text-white">
              {selectedPlan.max_membres} {selectedPlan.max_membres > 1 ? t('subscriptions.memberPlural') : t('subscriptions.memberSingular')}
            </Text>
          </View>

          <View className="flex-row items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-4 mt-3">
            <Text className="text-sm font-bold text-slate-900 dark:text-white">
              {t('subscriptions.checkout.totalToPay')}
            </Text>
            <Text className="text-xl font-extrabold text-brand-blue font-title">
              {selectedPlan.prix_fcfa.toLocaleString('fr-FR')} FCFA
            </Text>
          </View>
        </View>

        {/* Choix du moyen de paiement */}
        <Text className="text-xs font-bold uppercase tracking-wider mb-3 px-1 text-slate-600 dark:text-slate-400">
          {t('subscriptions.checkout.chooseOperator')}
        </Text>

        <View className="gap-2.5 mb-5">
          {/* Orange Money */}
          <TouchableOpacity
            onPress={() => setPaymentMethod('orange_money')}
            activeOpacity={0.8}
            className={`flex-row items-center p-4 rounded-2xl border ${
              paymentMethod === 'orange_money'
                ? 'bg-orange-500/10 border-orange-500'
                : 'bg-white dark:bg-brand-cardDark border-slate-200 dark:border-slate-800'
            }`}
          >
            <View className="w-10 h-10 rounded-xl bg-orange-500 items-center justify-center mr-3">
              <Icon name="solar:wallet-money-bold" size={20} color="#FFFFFF" />
            </View>
            <View className="flex-1">
              <Text className="text-sm font-bold text-slate-900 dark:text-white">
                Orange Money
              </Text>
              <Text className="text-[11px] text-slate-500 dark:text-slate-400">
                {t('subscriptions.checkout.orangeNotice')}
              </Text>
            </View>
            <View className={`w-5 h-5 rounded-full border items-center justify-center ${
              paymentMethod === 'orange_money' ? 'border-orange-500 bg-orange-500' : 'border-slate-300 dark:border-slate-600'
            }`}>
              {paymentMethod === 'orange_money' && <View className="w-2 h-2 rounded-full bg-white" />}
            </View>
          </TouchableOpacity>

          {/* MTN Mobile Money */}
          <TouchableOpacity
            onPress={() => setPaymentMethod('mtn_momo')}
            activeOpacity={0.8}
            className={`flex-row items-center p-4 rounded-2xl border ${
              paymentMethod === 'mtn_momo'
                ? 'bg-amber-500/10 border-amber-500'
                : 'bg-white dark:bg-brand-cardDark border-slate-200 dark:border-slate-800'
            }`}
          >
            <View className="w-10 h-10 rounded-xl bg-amber-500 items-center justify-center mr-3">
              <Icon name="solar:card-send-bold" size={20} color="#FFFFFF" />
            </View>
            <View className="flex-1">
              <Text className="text-sm font-bold text-slate-900 dark:text-white">
                MTN MoMo
              </Text>
              <Text className="text-[11px] text-slate-500 dark:text-slate-400">
                {t('subscriptions.checkout.mtnNotice')}
              </Text>
            </View>
            <View className={`w-5 h-5 rounded-full border items-center justify-center ${
              paymentMethod === 'mtn_momo' ? 'border-amber-500 bg-amber-500' : 'border-slate-300 dark:border-slate-600'
            }`}>
              {paymentMethod === 'mtn_momo' && <View className="w-2 h-2 rounded-full bg-white" />}
            </View>
          </TouchableOpacity>

          {/* Code USSD Direct */}
          <TouchableOpacity
            onPress={() => setPaymentMethod('ussd')}
            activeOpacity={0.8}
            className={`flex-row items-center p-4 rounded-2xl border ${
              paymentMethod === 'ussd'
                ? 'bg-indigo-500/10 border-indigo-500'
                : 'bg-white dark:bg-brand-cardDark border-slate-200 dark:border-slate-800'
            }`}
          >
            <View className="w-10 h-10 rounded-xl bg-indigo-600 items-center justify-center mr-3">
              <Icon name="solar:hashtag-square-bold" size={20} color="#FFFFFF" />
            </View>
            <View className="flex-1">
              <Text className="text-sm font-bold text-slate-900 dark:text-white">
                {t('subscriptions.checkout.ussdTitle')}
              </Text>
              <Text className="text-[11px] text-slate-500 dark:text-slate-400">
                {t('subscriptions.checkout.ussdNotice')}
              </Text>
            </View>
            <View className={`w-5 h-5 rounded-full border items-center justify-center ${
              paymentMethod === 'ussd' ? 'border-indigo-500 bg-indigo-500' : 'border-slate-300 dark:border-slate-600'
            }`}>
              {paymentMethod === 'ussd' && <View className="w-2 h-2 rounded-full bg-white" />}
            </View>
          </TouchableOpacity>
        </View>

        {/* Numéro de téléphone payeur */}
        <View className="mb-6">
          <Text className="text-xs font-bold uppercase tracking-wider mb-2 px-1 text-slate-600 dark:text-slate-400">
            {t('subscriptions.checkout.payerPhone')}
          </Text>
          <View className="flex-row items-center px-4 py-3 rounded-2xl border bg-white dark:bg-brand-cardDark border-slate-200 dark:border-slate-800">
            <Icon name="solar:phone-bold" size={18} color="#64748B" />
            <TextInput
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              placeholder={t('subscriptions.checkout.phonePlaceholder')}
              placeholderTextColor="#94A3B8"
              keyboardType="phone-pad"
              className="flex-1 ml-2 text-sm font-medium text-slate-900 dark:text-white"
            />
          </View>
        </View>

        {/* Bouton de confirmation */}
        <TouchableOpacity
          onPress={handlePay}
          disabled={loading}
          activeOpacity={0.8}
          className="w-full py-4 rounded-2xl bg-brand-blue items-center justify-center flex-row shadow-md shadow-brand-blue/30"
        >
          {loading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <Icon name="solar:lock-check-bold" size={18} color="#FFFFFF" />
              <Text className="text-sm font-bold text-white ml-2">
                {t('subscriptions.checkout.payButton', { price: selectedPlan.prix_fcfa.toLocaleString('fr-FR') })}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* Modal de Succès */}
      <Modal visible={successModalVisible} transparent animationType="fade">
        <View className="flex-1 bg-black/60 items-center justify-center p-6">
          <View className="w-full max-w-sm rounded-3xl p-6 items-center bg-white dark:bg-brand-cardDark border border-slate-100 dark:border-slate-800 shadow-2xl">
            <View className="w-16 h-16 rounded-full bg-emerald-500/20 items-center justify-center mb-4">
              <Icon name="solar:shield-check-bold" size={36} color="#10B981" />
            </View>

            <Text className="text-lg font-bold font-title text-center text-slate-900 dark:text-white">
              {t('subscriptions.checkout.successTitle')}
            </Text>

            <Text className="text-xs text-center mt-2 mb-6 text-slate-600 dark:text-slate-300 leading-5">
              {t('subscriptions.checkout.successMessage', {
                name: isEn ? selectedPlan.nom_en : selectedPlan.nom_fr,
                days: selectedPlan.duree_jours,
              })}
            </Text>

            <TouchableOpacity
              onPress={handleSuccessClose}
              activeOpacity={0.8}
              className="w-full py-3.5 rounded-xl bg-brand-blue items-center justify-center"
            >
              <Text className="text-xs font-bold text-white">
                {selectedPlan.max_membres > 1
                  ? t('subscriptions.checkout.goToFamily')
                  : t('subscriptions.checkout.goToDashboard')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
