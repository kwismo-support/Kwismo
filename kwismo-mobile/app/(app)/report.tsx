import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useTranslation } from 'react-i18next';
import { Icon } from '@/shared/ui/Icon';
import { HeaderBar } from '@/shared/components/HeaderBar';
import { CountryFlag } from '@/shared/components/CountryFlag';
import { PermissionModal } from '@/shared/components/PermissionModal';
import { useAppTheme } from '@/shared/hooks/useAppTheme';
import { toast } from '@/shared/store/toastStore';
import { getDeviceFingerprint } from '@/shared/services/device';
import { apiClient } from '@/shared/services/apiClient';
import { enqueueOutboxItem } from '@/shared/services/database';

const REPORT_REASONS = [
  { id: 'scam', labelKey: 'report.reasonScam', label: "Tentative d'arnaque / Fraude", icon: 'solar:danger-triangle-bold' },
  { id: 'fake_agent', labelKey: 'report.reasonFakeAgent', label: "Faux agent d'opérateur (Orange / MTN)", icon: 'solar:user-cross-bold' },
  { id: 'phishing', labelKey: 'report.reasonPhishing', label: 'Message frauduleux / Phishing', icon: 'solar:link-broken-bold' },
  { id: 'harassment', labelKey: 'report.reasonHarassment', label: 'Appels répétés suspects / Harcèlement', icon: 'solar:phone-calling-rounded-bold' },
  { id: 'wrong_transfer', labelKey: 'report.reasonWrongTransfer', label: 'Faux transfert ou demande de remboursement', icon: 'solar:card-transfer-bold' },
];

const RECENT_CALLS_HISTORY = [
  { phone: '+237 6 55 98 76 54', raw: '655987654', date: 'Il y a 2 minutes', duration: '18s', type: 'incoming', timestamp: Date.now() - 2 * 60 * 1000 },
  { phone: '+237 6 70 88 99 00', raw: '670889900', date: 'Il y a 4 minutes', duration: '45s', type: 'incoming', timestamp: Date.now() - 4 * 60 * 1000 },
];

export default function ReportScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ phone?: string }>();
  const { t } = useTranslation();
  const { isDark } = useAppTheme();

  const [targetPhone, setTargetPhone] = useState(params.phone || '');
  const [selectedReason, setSelectedReason] = useState<string>('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [permissionModalVisible, setPermissionModalVisible] = useState(false);
  const [showCallPickerModal, setShowCallPickerModal] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [successModalVisible, setSuccessModalVisible] = useState(false);

  const filteredFiveMinCalls = RECENT_CALLS_HISTORY.filter(
    (c) => Date.now() - c.timestamp <= 5 * 60 * 1000
  );

  const handleGrantCallLogPermission = () => {
    setPermissionModalVisible(false);
    setShowCallPickerModal(true);
  };

  const handleSelectRecentCall = (phone: string) => {
    setTargetPhone(phone);
    setValidationError('');
    setShowCallPickerModal(false);
  };

  const handleSubmitReport = async () => {
    setValidationError('');

    if (!targetPhone.trim()) {
      setValidationError(t('report.selectPhoneError'));
      return;
    }

    if (!selectedReason) {
      setValidationError(t('report.selectReasonError'));
      return;
    }

    setIsSubmitting(true);
    try {
      const fingerprint = await getDeviceFingerprint();
      const selectedReasonObj = REPORT_REASONS.find((r) => r.id === selectedReason);
      const motifText = `${selectedReasonObj?.label || selectedReason}${description.trim() ? ' - ' + description.trim() : ''}`;
      
      const payload = {
        numero: targetPhone.trim(),
        motif: motifText,
        device_fingerprint: fingerprint,
      };

      try {
        await apiClient.post('/reports', payload);
        setSuccessModalVisible(true);
      } catch (apiErr: any) {
        if (apiErr?.response?.status === 409) {
          const detail = apiErr.response.data?.detail || 'Cet appareil a déjà effectué un signalement pour ce numéro.';
          setValidationError(detail);
          toast.error(detail);
        } else {
          await enqueueOutboxItem('report', payload);
          toast.info('Signalement enregistré en local (sera envoyé automatiquement dès reconnexion).');
          setSuccessModalVisible(true);
        }
      }
    } catch {
      toast.error('Erreur lors du traitement du signalement.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View className="flex-1 bg-brand-green">
      <StatusBar style="light" />

      <HeaderBar
        title={t('common.report')}
        showBack={true}
      />

      <View className="flex-1 bg-slate-50 dark:bg-brand-darkBg rounded-tl-3xl overflow-hidden">
        <ScrollView
          contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
          showsVerticalScrollIndicator={false}
          className="px-5 pt-6"
        >
          <View className="flex-row items-center p-3.5 rounded-xl mb-5 bg-amber-100 dark:bg-slate-800">
            <Icon name="solar:shield-warning-bold" color="#F97316" size={22} className="mr-2.5" />
            <Text className="flex-1 font-font-medium text-xs text-amber-900 dark:text-amber-200 leading-4.5">
              {t('report.ruleNotice')}
            </Text>
          </View>

          <Text className="font-font-bold text-sm font-bold text-slate-900 dark:text-white mb-2">
            {t('report.phoneLabel')}
          </Text>

          <View
            className={`flex-row items-center h-13 rounded-xl border px-3.5 bg-white dark:bg-brand-cardDark ${
              validationError ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'
            }`}
          >
            <View className="flex-row items-center mr-2 pr-2 border-r border-slate-200 dark:border-slate-700">
              <CountryFlag countryCode="CM" size={20} className="mr-1" />
              <Text className="font-font-bold text-sm font-bold text-slate-900 dark:text-white">+237</Text>
            </View>

            <TextInput
              className="flex-1 font-font-semibold text-base text-slate-900 dark:text-white"
              placeholder={t('common.phonePlaceholder')}
              placeholderTextColor="#94A3B8"
              keyboardType="phone-pad"
              value={targetPhone}
              onChangeText={(text) => {
                setTargetPhone(text);
                if (validationError) setValidationError('');
              }}
            />

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setPermissionModalVisible(true)}
              className="flex-row items-center px-2.5 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40"
            >
              <Icon name="solar:history-bold" color="#25B876" size={18} className="mr-1" />
              <Text className="font-font-bold text-xs text-brand-green font-bold">
                {t('report.recentCalls5min')}
              </Text>
            </TouchableOpacity>
          </View>

          {validationError ? (
            <View className="flex-row items-center mt-2 px-1">
              <Icon name="solar:danger-triangle-bold" color="#EF4444" size={16} className="mr-1.5" />
              <Text className="flex-1 font-font-medium text-xs text-red-500 leading-4">{validationError}</Text>
            </View>
          ) : null}

          <Text className="font-font-bold text-sm font-bold text-slate-900 dark:text-white mt-6 mb-2">
            {t('report.reasonLabel')}
          </Text>

          <View className="gap-2.5">
            {REPORT_REASONS.map((reason) => {
              const isSelected = selectedReason === reason.id;
              return (
                <TouchableOpacity
                  key={reason.id}
                  activeOpacity={0.75}
                  onPress={() => setSelectedReason(reason.id)}
                  className={`flex-row items-center justify-between p-3.5 rounded-xl border ${
                    isSelected
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-brand-green'
                      : 'bg-white dark:bg-brand-cardDark border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <View className="flex-row items-center flex-1 pr-2.5">
                    <Icon
                      name={reason.icon}
                      size={20}
                      color={isSelected ? '#25B876' : '#94A3B8'}
                      className="mr-3"
                    />
                    <Text
                      className={`font-font-medium text-xs flex-1 ${
                        isSelected
                          ? 'text-brand-green font-bold'
                          : 'text-slate-900 dark:text-white'
                      }`}
                    >
                      {t(reason.labelKey)}
                    </Text>
                  </View>

                  <View
                    className={`w-5 h-5 rounded-full border-2 items-center justify-center ${
                      isSelected
                        ? 'border-brand-green bg-brand-green'
                        : 'border-slate-300 dark:border-slate-600'
                    }`}
                  >
                    {isSelected && <View className="w-2 h-2 rounded-full bg-white" />}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text className="font-font-bold text-sm font-bold text-slate-900 dark:text-white mt-6 mb-2">
            {t('report.detailsLabel')}
          </Text>

          <TextInput
            className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-brand-cardDark p-3.5 font-font-regular text-xs text-slate-900 dark:text-white min-h-24 text-top"
            placeholder={t('report.detailsPlaceholder')}
            placeholderTextColor="#94A3B8"
            multiline
            numberOfLines={4}
            value={description}
            onChangeText={setDescription}
          />

          <TouchableOpacity
            activeOpacity={0.85}
            disabled={isSubmitting || !targetPhone.trim() || !selectedReason}
            onPress={handleSubmitReport}
            className={`flex-row items-center justify-center h-13 rounded-xl mt-8 shadow-sm ${
              targetPhone.trim() && selectedReason
                ? 'bg-orange-500'
                : 'bg-slate-300 dark:bg-slate-700'
            }`}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Icon name="heroicons:signal-16-solid" color="#FFFFFF" size={20} className="mr-2" />
                <Text className="font-font-bold text-base font-bold text-white">
                  {t('report.submitReport')}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      </View>

      <Modal visible={showCallPickerModal} transparent animationType="slide">
        <View className="flex-1 bg-black/60 justify-end">
          <View className="rounded-t-3xl p-6 pb-9 bg-white dark:bg-brand-darkBg">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="font-font-bold text-lg font-extrabold text-slate-900 dark:text-white">
                {t('report.recentCallsModalTitle')}
              </Text>
              <TouchableOpacity onPress={() => setShowCallPickerModal(false)}>
                <Icon name="solar:close-circle-bold" color="#94A3B8" size={26} />
              </TouchableOpacity>
            </View>

            <Text className="font-font-regular text-xs text-slate-500 dark:text-slate-400 mb-4">
              {t('report.recentCallsModalSub')}
            </Text>

            <View className="gap-1">
              {filteredFiveMinCalls.length === 0 ? (
                <View className="py-6 items-center">
                  <Text className="text-xs text-slate-400">{t('report.noRecent5minCalls')}</Text>
                </View>
              ) : (
                filteredFiveMinCalls.map((call, idx) => (
                  <TouchableOpacity
                    key={idx}
                    activeOpacity={0.7}
                    onPress={() => handleSelectRecentCall(call.phone)}
                    className="flex-row items-center py-3 border-b border-slate-100 dark:border-slate-800"
                  >
                    <View className="w-9 h-9 rounded-full bg-emerald-50 dark:bg-emerald-950/40 items-center justify-center mr-3">
                      <Icon name="solar:phone-calling-rounded-bold" color="#25B876" size={20} />
                    </View>
                    <View className="flex-1">
                      <Text className="font-font-bold text-sm font-bold text-slate-900 dark:text-white">
                        {call.phone}
                      </Text>
                      <Text className="font-font-regular text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {call.date} · Durée : {call.duration}
                      </Text>
                    </View>
                    <Icon name="solar:alt-arrow-right-linear" color="#94A3B8" size={18} />
                  </TouchableOpacity>
                ))
              )}
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={successModalVisible} transparent animationType="fade">
        <View className="flex-1 bg-black/60 items-center justify-center p-5">
          <View className="w-11/12 rounded-3xl p-6 items-center bg-white dark:bg-brand-cardDark">
            <View className="mb-3.5">
              <Icon name="solar:check-circle-bold" color="#25B876" size={50} />
            </View>

            <Text className="font-font-bold text-xl font-extrabold text-slate-900 dark:text-white text-center mb-2">
              {t('report.reportSuccessModalTitle')}
            </Text>
            <Text className="font-font-regular text-xs text-slate-600 dark:text-slate-300 text-center leading-5 mb-6">
              {t('report.reportSuccessModalSub')}
            </Text>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => {
                setSuccessModalVisible(false);
                router.back();
              }}
              className="h-12 rounded-xl w-full items-center justify-center bg-brand-green"
            >
              <Text className="font-font-bold text-base font-bold text-white">{t('report.finishBtn')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <PermissionModal
        visible={permissionModalVisible}
        title={t('report.permissionCallLogTitle')}
        description={t('report.permissionCallLogDesc')}
        iconName="solar:phone-calling-rounded-bold"
        iconColor="#25B876"
        confirmText={t('common.grantPermission')}
        cancelText={t('common.cancel')}
        onConfirm={handleGrantCallLogPermission}
        onCancel={() => setPermissionModalVisible(false)}
      />
    </View>
  );
}
