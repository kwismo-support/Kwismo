import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useTranslation } from 'react-i18next';
import { AsYouType, isValidPhoneNumber } from 'libphonenumber-js/min';
import { Icon } from '@/shared/ui/Icon';
import { HeaderBar } from '@/shared/components/HeaderBar';
import { TabBar } from '@/shared/components/TabBar';
import { Skeleton, SkeletonLoader } from '@/shared/ui/Skeleton';
import { CountryFlag } from '@/shared/components/CountryFlag';
import { CountryPickerModal, CountryItem } from '@/shared/components/CountryPickerModal';
import { useAppTheme } from '@/shared/hooks/useAppTheme';
import { toast } from '@/shared/store/toastStore';
import { useManagement } from '@/features/management/hooks/useManagement';
import { SimNumberCard } from '@/features/management/components/SimNumberCard';
import { EmptyManagementState } from '@/features/management/components/EmptyManagementState';
import { UserSimNumber } from '@/features/management/types/management.types';

export default function ManagementScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { isDark } = useAppTheme();

  const {
    loading,
    refreshing,
    numbers,
    refresh,
    addNumber,
    verifyOtp,
    resendOtp,
    deleteNumber,
    declareCompromised,
  } = useManagement();

  const [fullScreenAddVisible, setFullScreenAddVisible] = useState(false);
  const [countryModalVisible, setCountryModalVisible] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<CountryItem>({
    code: 'CM',
    name: 'Cameroun',
    callingCode: '+237',
  });
  const [newPhoneNumber, setNewPhoneNumber] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [isSubmittingPhone, setIsSubmittingPhone] = useState(false);

  const [fullScreenOtpVisible, setFullScreenOtpVisible] = useState(false);
  const [otpTargetNumber, setOtpTargetNumber] = useState<UserSimNumber | null>(null);
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);
  const [otpTimer, setOtpTimer] = useState(60);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);

  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [targetActionNumber, setTargetActionNumber] = useState<UserSimNumber | null>(null);

  useEffect(() => {
    let interval: any;
    if (fullScreenOtpVisible && otpTimer > 0) {
      interval = setInterval(() => setOtpTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [fullScreenOtpVisible, otpTimer]);

  const handlePhoneChange = (text: string) => {
    const cleanDigits = text.replace(/[^0-9]/g, '');
    const formatter = new AsYouType(selectedCountry.code as any);
    const formatted = formatter.input(cleanDigits);
    setNewPhoneNumber(formatted);
    if (phoneError) setPhoneError('');
  };

  const handleOpenAddNumber = () => {
    setNewPhoneNumber('');
    setPhoneError('');
    setFullScreenAddVisible(true);
  };

  const handleSavePhone = async () => {
    const cleanDigits = newPhoneNumber.replace(/\s+/g, '');
    const fullNumber = `${selectedCountry.callingCode}${cleanDigits}`;
    const isValid = isValidPhoneNumber(fullNumber, selectedCountry.code as any);

    if (!isValid) {
      setPhoneError(`${t('common.invalidPhoneNumber')} (${selectedCountry.name})`);
      return;
    }

    const duplicate = numbers.find(
      (n) => n.rawValeur === fullNumber || n.phone.replace(/\s+/g, '') === cleanDigits
    );
    if (duplicate) {
      setPhoneError(t('common.phoneAlreadyLinked'));
      return;
    }

    setIsSubmittingPhone(true);
    const result = await addNumber(fullNumber);
    setIsSubmittingPhone(false);

    if (result.success && result.data) {
      setFullScreenAddVisible(false);
      setNewPhoneNumber('');
      setOtpTargetNumber(result.data);
      setOtpCode(['', '', '', '', '', '']);
      setOtpTimer(60);
      setFullScreenOtpVisible(true);
      toast.success(t('common.otpSentBySms'));
    } else {
      setPhoneError(result.message || t('common.invalidPhoneNumber'));
    }
  };

  const handleOtpInput = (text: string, index: number) => {
    const digit = text.slice(-1);
    const newCode = [...otpCode];
    newCode[index] = digit;
    setOtpCode(newCode);

    if (digit && index === 5 && newCode.every((c) => c !== '')) {
      handleConfirmOtp(newCode.join(''));
    }
  };

  const handleConfirmOtp = async (codeString?: string) => {
    const entered = codeString || otpCode.join('');
    if (entered.length < 6) {
      toast.error(t('common.enter6DigitOtp'));
      return;
    }
    if (!otpTargetNumber) return;

    setIsVerifyingOtp(true);
    const result = await verifyOtp(otpTargetNumber.id, entered);
    setIsVerifyingOtp(false);

    if (result.success) {
      setFullScreenOtpVisible(false);
      toast.success(t('common.numberVerifiedSuccess'));
    } else {
      toast.error(result.message || t('common.enter6DigitOtp'));
    }
  };

  const handleResendOtpCode = async () => {
    if (!otpTargetNumber) return;
    setOtpTimer(60);
    const result = await resendOtp(otpTargetNumber.id);
    if (result.success) {
      toast.success(t('common.otpSentBySms'));
    } else {
      toast.error(result.message || t('common.retry'));
    }
  };

  const handleDeclareCompromisedNumber = async (item: UserSimNumber) => {
    const result = await declareCompromised(item.id);
    if (result.success) {
      toast.error(`${t('common.lineDeclaredCompromised')}: ${item.phone}`);
      router.push('/(app)/alert-whatsapp');
    } else {
      toast.error(result.message || t('common.retry'));
    }
  };

  const handleConfirmDelete = async () => {
    if (!targetActionNumber) return;
    const result = await deleteNumber(targetActionNumber.id);
    setDeleteModalVisible(false);
    if (result.success) {
      toast.info(t('common.numberDeletedSuccess'));
    } else {
      toast.error(result.message || t('common.retry'));
    }
  };

  return (
    <View className="flex-1 bg-white dark:bg-brand-darkBg">
      <StatusBar style="light" />

      <HeaderBar
        title={t('common.management')}
        subtitle={t('common.myNumbersSubtitle')}
        showBack={false}
      />

      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 110 }}
        showsVerticalScrollIndicator={false}
        className="px-4 pt-4"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refresh} colors={['#F97316']} />
        }
      >
        {loading ? (
          <SkeletonLoader>
            <View className="gap-y-3">
              <View className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-brand-cardDark p-4 justify-between">
                <View className="flex-row items-center justify-between mb-2">
                  <Skeleton width={160} height={20} borderRadius={6} />
                  <Skeleton width={20} height={20} borderRadius={4} />
                </View>
                <Skeleton width={70} height={14} borderRadius={4} />
                <View className="my-3 border-t border-slate-100 dark:border-slate-800" />
                <View className="flex-row items-center justify-between">
                  <Skeleton width={80} height={28} borderRadius={8} />
                  <Skeleton width={32} height={32} borderRadius={16} />
                </View>
              </View>
              <View className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-brand-cardDark p-4 justify-between">
                <View className="flex-row items-center justify-between mb-2">
                  <Skeleton width={160} height={20} borderRadius={6} />
                  <Skeleton width={20} height={20} borderRadius={4} />
                </View>
                <Skeleton width={70} height={14} borderRadius={4} />
                <View className="my-3 border-t border-slate-100 dark:border-slate-800" />
                <View className="flex-row items-center justify-between">
                  <Skeleton width={80} height={28} borderRadius={8} />
                  <Skeleton width={32} height={32} borderRadius={16} />
                </View>
              </View>
            </View>
          </SkeletonLoader>
        ) : numbers.length === 0 ? (
          <EmptyManagementState onAddNumber={handleOpenAddNumber} />
        ) : (
          <View className="flex-col gap-y-3.5">
            {numbers.map((item) => (
              <SimNumberCard
                key={item.id}
                item={item}
                onOpenOtp={(target) => {
                  setOtpTargetNumber(target);
                  setOtpCode(['', '', '', '', '', '']);
                  setOtpTimer(60);
                  setFullScreenOtpVisible(true);
                }}
                onDeclareCompromised={handleDeclareCompromisedNumber}
                onOpenDelete={(target) => {
                  setTargetActionNumber(target);
                  setDeleteModalVisible(true);
                }}
              />
            ))}
          </View>
        )}

        <Text className="text-sm font-semibold text-slate-400 dark:text-slate-500 mt-6 mb-2.5">
          {t('common.others')}
        </Text>

        <View className="bg-white dark:bg-brand-cardDark overflow-hidden">
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.push('/(app)/contacts')}
            className="flex-row items-center justify-between py-4 border-b border-slate-200 dark:border-slate-800"
          >
            <View className="flex-row items-center gap-3">
              <Icon name="solar:users-group-two-rounded-bold" color={isDark ? '#FFFFFF' : '#161E33'} size={22} />
              <Text className="font-semibold text-sm text-slate-900 dark:text-white">
                {t('common.myContacts')}
              </Text>
            </View>
            <Icon name="solar:alt-arrow-right-linear" color="#CBD5E1" size={18} />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.push('/(app)/report')}
            className="flex-row items-center justify-between py-4 border-b border-slate-200 dark:border-slate-800"
          >
            <View className="flex-row items-center gap-3">
              <Icon name="mage:megaphone-a-fill" color={isDark ? '#FFFFFF' : '#161E33'} size={22} />
              <Text className="font-semibold text-sm text-slate-900 dark:text-white">
                {t('common.report')}
              </Text>
            </View>
            <Icon name="solar:alt-arrow-right-linear" color="#CBD5E1" size={18} />
          </TouchableOpacity>
        </View>
      </ScrollView>

      <TouchableOpacity
        activeOpacity={0.85}
        onPress={handleOpenAddNumber}
        style={{ bottom: Math.max(insets.bottom + 72, 84) }}
        className="absolute right-5 wx-14 hx-14 rounded-full items-center justify-center bg-orange-500 shadow-lg shadow-orange-500/40 z-50"
      >
        <Icon name="solar:add-linear" color="#FFFFFF" size={28} />
      </TouchableOpacity>

      <TabBar activeTab="management" />

      <Modal visible={fullScreenAddVisible} animationType="slide">
        <View className="flex-1 bg-brand-green">
          <StatusBar style="light" />

          <HeaderBar
            title={t('common.addPhoneTitle')}
            showBack={true}
            onBack={() => setFullScreenAddVisible(false)}
          />

          <View className="flex-1 bg-slate-50 dark:bg-brand-darkBg rounded-tl-3xl p-6">
            <Text className="font-font-bold text-xl font-extrabold text-slate-900 dark:text-white mb-1.5">
              {t('common.simBindingTitle')}
            </Text>
            <Text className="font-font-regular text-xs text-slate-500 dark:text-slate-400 leading-5 mb-7">
              {t('common.simBindingSubtitle')}
            </Text>

            <View
              className={`flex-row items-center hx-13 rounded-xl border px-3 bg-white dark:bg-brand-cardDark ${
                phoneError ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'
              }`}
            >
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setCountryModalVisible(true)}
                className="flex-row items-center pr-2.5 border-r border-slate-200 dark:border-slate-700"
              >
                <CountryFlag countryCode={selectedCountry.code} size={22} className="mr-1.5" />
                <Text className="font-font-bold text-sm text-slate-900 dark:text-white mr-1">
                  {selectedCountry.callingCode}
                </Text>
                <Icon name="solar:alt-arrow-down-linear" color="#94A3B8" size={16} />
              </TouchableOpacity>

              <TextInput
                className="flex-1 px-3 font-font-semibold text-base text-slate-900 dark:text-white"
                placeholder={t('common.phonePlaceholder')}
                placeholderTextColor="#94A3B8"
                keyboardType="phone-pad"
                value={newPhoneNumber}
                onChangeText={handlePhoneChange}
                autoFocus
              />
            </View>

            {phoneError ? (
              <Text className="font-font-medium text-xs text-red-500 mt-1.5 ml-1">{phoneError}</Text>
            ) : null}

            <TouchableOpacity
              activeOpacity={0.85}
              disabled={!newPhoneNumber.trim() || isSubmittingPhone}
              onPress={handleSavePhone}
              className={`hx-13 rounded-xl items-center justify-center mt-8 ${
                newPhoneNumber.trim() ? 'bg-brand-green' : 'bg-slate-300 dark:bg-slate-700'
              }`}
            >
              {isSubmittingPhone ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text className="font-font-bold text-sm font-bold text-white">
                  {t('common.validateAndSendOtp')}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={fullScreenOtpVisible} animationType="slide">
        <View className="flex-1 bg-brand-green">
          <StatusBar style="light" />

          <HeaderBar
            title={t('common.otpVerify')}
            showBack={true}
            onBack={() => setFullScreenOtpVisible(false)}
          />

          <View className="flex-1 bg-slate-50 dark:bg-brand-darkBg rounded-tl-3xl p-6">
            <Text className="font-font-bold text-xl font-extrabold text-slate-900 dark:text-white mb-1.5">
              {t('common.verifyYourNumberTitle')}
            </Text>
            <Text className="font-font-regular text-xs text-slate-500 dark:text-slate-400 leading-5 mb-7">
              {t('common.enter6DigitCodeSentTo')}{' '}
              <Text className="font-bold text-slate-900 dark:text-white">
                {otpTargetNumber?.callingCode} {otpTargetNumber?.phone}
              </Text>
            </Text>

            <View className="flex-row justify-center items-center gap-2 my-6 w-full">
              {otpCode.map((digit, idx) => (
                <TextInput
                  key={idx}
                  className={`wx-11 hx-13 rounded-xl border-2 text-center font-font-bold text-xl font-extrabold bg-white dark:bg-brand-cardDark text-slate-900 dark:text-white ${
                    digit ? 'border-brand-green' : 'border-slate-200 dark:border-slate-700'
                  }`}
                  maxLength={1}
                  keyboardType="number-pad"
                  value={digit}
                  onChangeText={(txt) => handleOtpInput(txt, idx)}
                  autoFocus={idx === 0}
                />
              ))}
            </View>

            <View className="items-center mb-2.5">
              {otpTimer > 0 ? (
                <Text className="font-font-medium text-xs text-slate-500 dark:text-slate-400">
                  {t('common.resendCodeIn')} {otpTimer}s
                </Text>
              ) : (
                <TouchableOpacity onPress={handleResendOtpCode}>
                  <Text className="font-font-bold text-xs font-bold text-brand-green">
                    {t('common.resendNewCode')}
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            <TouchableOpacity
              activeOpacity={0.85}
              disabled={isVerifyingOtp || otpCode.some((c) => c === '')}
              onPress={() => handleConfirmOtp()}
              className={`hx-13 rounded-xl items-center justify-center mt-8 ${
                otpCode.every((c) => c !== '') ? 'bg-brand-green' : 'bg-slate-300 dark:bg-slate-700'
              }`}
            >
              {isVerifyingOtp ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text className="font-font-bold text-sm font-bold text-white">{t('common.confirmNumber')}</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={deleteModalVisible} transparent animationType="fade">
        <View className="flex-1 bg-black/60 justify-center items-center">
          <View className="mx-6 rounded-3xl p-6 w-11/12 bg-white dark:bg-brand-cardDark">
            <Icon name="solar:trash-bin-trash-bold" color="#EF4444" size={40} className="self-center mb-3" />
            <Text className="font-font-bold text-lg font-extrabold text-slate-900 dark:text-white text-center mb-2">
              {t('common.deleteLineQuestion')}
            </Text>
            <Text className="font-font-regular text-xs text-slate-500 dark:text-slate-400 text-center leading-5 mb-5">
              {t('common.deleteLineMessage')}
            </Text>

            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={() => setDeleteModalVisible(false)}
                className="flex-1 hx-12 rounded-xl border border-slate-200 dark:border-slate-700 items-center justify-center"
              >
                <Text className="font-font-bold text-sm text-slate-900 dark:text-white">{t('common.cancel')}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleConfirmDelete}
                className="flex-1 hx-12 rounded-xl bg-red-500 items-center justify-center"
              >
                <Text className="font-font-bold text-sm font-bold text-white">{t('common.delete')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <CountryPickerModal
        visible={countryModalVisible}
        onClose={() => setCountryModalVisible(false)}
        onSelect={(c) => setSelectedCountry(c)}
        selectedCode={selectedCountry.code}
      />
    </View>
  );
}
