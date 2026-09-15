import React, { useState, useEffect } from 'react';
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

import { UserSimNumber, MOCK_SIM_NUMBERS } from '@/shared/mock/simNumbersMock';

export default function ManagementScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { isDark } = useAppTheme();

  const [loading, setLoading] = useState(true);
  const [numbers, setNumbers] = useState<UserSimNumber[]>(MOCK_SIM_NUMBERS);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(t);
  }, []);

  const [fullScreenAddVisible, setFullScreenAddVisible] = useState(false);
  const [editingNumberId, setEditingNumberId] = useState<string | null>(null);
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
  const [restoreSecurityModalVisible, setRestoreSecurityModalVisible] = useState(false);
  const [targetActionNumber, setTargetActionNumber] = useState<UserSimNumber | null>(null);

  useEffect(() => {
    let interval: any;
    if (fullScreenOtpVisible && otpTimer > 0) {
      interval = setInterval(() => setOtpTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [fullScreenOtpVisible, otpTimer]);

  const detectOperator = (cleanPhone: string): 'Orange' | 'MTN' | 'Camtel' | 'Autre' => {
    const raw = cleanPhone.replace(/\s+/g, '');
    if (raw.startsWith('69') || raw.startsWith('655') || raw.startsWith('656') || raw.startsWith('657')) {
      return 'Orange';
    }
    if (raw.startsWith('67') || raw.startsWith('68') || raw.startsWith('650') || raw.startsWith('651') || raw.startsWith('652')) {
      return 'MTN';
    }
    if (raw.startsWith('62') || raw.startsWith('242')) {
      return 'Camtel';
    }
    return 'Autre';
  };

  const handlePhoneChange = (text: string) => {
    const cleanDigits = text.replace(/[^0-9]/g, '');
    const formatter = new AsYouType(selectedCountry.code as any);
    const formatted = formatter.input(cleanDigits);
    setNewPhoneNumber(formatted);
    if (phoneError) setPhoneError('');
  };

  const handleOpenAddNumber = () => {
    setEditingNumberId(null);
    setNewPhoneNumber('');
    setPhoneError('');
    setFullScreenAddVisible(true);
  };

  const handleOpenEditNumber = (item: UserSimNumber) => {
    setEditingNumberId(item.id);
    setNewPhoneNumber(item.phone);
    setSelectedCountry({
      code: item.countryCode as any,
      name: item.countryCode === 'CM' ? 'Cameroun' : item.countryCode,
      callingCode: item.callingCode,
    });
    setPhoneError('');
    setFullScreenAddVisible(true);
  };

  const handleSavePhone = () => {
    const fullNumber = `${selectedCountry.callingCode}${newPhoneNumber.replace(/\s+/g, '')}`;
    const isValid = isValidPhoneNumber(fullNumber, selectedCountry.code as any);

    if (!isValid) {
      setPhoneError(`Numéro invalide pour ${selectedCountry.name}`);
      return;
    }

    const cleanInput = newPhoneNumber.replace(/\s+/g, '');
    const duplicate = numbers.find(
      (n) => n.id !== editingNumberId && n.phone.replace(/\s+/g, '') === cleanInput
    );
    if (duplicate) {
      setPhoneError('Ce numéro est déjà rattaché à votre compte.');
      return;
    }

    setIsSubmittingPhone(true);
    setTimeout(() => {
      setIsSubmittingPhone(false);
      let targetSim: UserSimNumber;

      if (editingNumberId) {
        targetSim = {
          id: editingNumberId,
          countryCode: selectedCountry.code,
          callingCode: selectedCountry.callingCode,
          phone: newPhoneNumber,
          operator: detectOperator(newPhoneNumber),
          status: 'pending',
          addedDate: 'Modifié',
        };
        setNumbers((prev) =>
          prev.map((n) => (n.id === editingNumberId ? targetSim : n))
        );
      } else {
        targetSim = {
          id: `num-${Date.now()}`,
          countryCode: selectedCountry.code,
          callingCode: selectedCountry.callingCode,
          phone: newPhoneNumber,
          operator: detectOperator(newPhoneNumber),
          status: 'pending',
          addedDate: "Aujourd'hui",
        };
        setNumbers((prev) => [...prev, targetSim]);
      }

      setFullScreenAddVisible(false);
      setNewPhoneNumber('');

      setOtpTargetNumber(targetSim);
      setOtpCode(['', '', '', '', '', '']);
      setOtpTimer(60);
      setFullScreenOtpVisible(true);
      toast.success('Code OTP envoyé par SMS');
    }, 800);
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

  const handleConfirmOtp = (codeString?: string) => {
    const entered = codeString || otpCode.join('');
    if (entered.length < 6) {
      toast.error('Veuillez saisir les 6 chiffres du code SMS');
      return;
    }

    setIsVerifyingOtp(true);
    setTimeout(() => {
      setIsVerifyingOtp(false);
      if (otpTargetNumber) {
        setNumbers((prev) =>
          prev.map((item) =>
            item.id === otpTargetNumber.id ? { ...item, status: 'verified' } : item
          )
        );
      }
      setFullScreenOtpVisible(false);
      toast.success('Numéro vérifié et protégé avec succès !');
    }, 900);
  };

  const handleDeclareCompromised = (item: UserSimNumber) => {
    setNumbers((prev) =>
      prev.map((n) => (n.id === item.id ? { ...n, status: 'compromised' } : n))
    );
    toast.error(`Ligne ${item.phone} déclarée compromise`);
    router.push('/(app)/alert-whatsapp');
  };

  const handleRestoreSecurity = () => {
    if (!targetActionNumber) return;
    setNumbers((prev) =>
      prev.map((n) => (n.id === targetActionNumber.id ? { ...n, status: 'verified' } : n))
    );
    setRestoreSecurityModalVisible(false);
    toast.success('Sécurité rétablie avec succès.');
  };

  const handleConfirmDelete = () => {
    if (!targetActionNumber) return;
    setNumbers((prev) => prev.filter((n) => n.id !== targetActionNumber.id));
    setDeleteModalVisible(false);
    toast.info('Numéro supprimé du compte.');
  };

  return (
    <View className="flex-1 bg-slate-50 dark:bg-brand-darkBg">
      <StatusBar style={isDark ? 'light' : 'dark'} />

      <HeaderBar title={t('common.management', 'Gestion')} showBack={false} />

      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 110 }}
        showsVerticalScrollIndicator={false}
        className="px-4 pt-4"
      >
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-1">
            <Text className="font-font-bold text-lg font-extrabold text-slate-900 dark:text-white">
              {t('management.title', 'Mes numéros')} ({numbers.length})
            </Text>
            <Text className="font-font-regular text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {t('management.subtitle', 'Gérez et sécurisez vos cartes SIM et numéros associés')}
            </Text>
          </View>
        </View>

        {loading ? (
          <SkeletonLoader>
            <View className="flex-row flex-wrap justify-between gap-y-3">
              <View className="w-[48.5%] rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-brand-cardDark p-3 justify-between">
                <Skeleton width={70} height={16} borderRadius={4} />
                <Skeleton width={110} height={20} borderRadius={6} style={{ marginVertical: 10 }} />
                <Skeleton width={80} height={14} borderRadius={4} />
              </View>
              <View className="w-[48.5%] rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-brand-cardDark p-3 justify-between">
                <Skeleton width={70} height={16} borderRadius={4} />
                <Skeleton width={110} height={20} borderRadius={6} style={{ marginVertical: 10 }} />
                <Skeleton width={80} height={14} borderRadius={4} />
              </View>
            </View>
          </SkeletonLoader>
        ) : (
          <View className="flex-row flex-wrap justify-between gap-y-3">
            {numbers.map((item) => {
              const isVerified = item.status === 'verified';
              const isPending = item.status === 'pending';
              const isCompromised = item.status === 'compromised';

              return (
                <View
                  key={item.id}
                  className={`w-[48.5%] rounded-2xl border bg-white dark:bg-brand-cardDark p-3 justify-between shadow-sm ${
                    isCompromised ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <View className="flex-row items-center justify-between mb-2">
                    <View className="flex-row items-center">
                      <CountryFlag countryCode={item.countryCode} size={20} className="mr-1.5" />
                      <Text className="font-font-bold text-xs font-bold text-slate-900 dark:text-white">
                        {item.operator}
                      </Text>
                    </View>

                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => handleOpenEditNumber(item)}
                      className="p-0.5"
                    >
                      <Icon name="solar:pen-new-square-linear" color="#94A3B8" size={16} />
                    </TouchableOpacity>
                  </View>

                  <Text
                    numberOfLines={1}
                    className="font-font-bold text-sm font-bold text-slate-900 dark:text-white mb-2"
                  >
                    {item.phone}
                  </Text>

                  <View className="flex-row items-center mb-3">
                    <Icon
                      name={
                        isVerified
                          ? 'solar:shield-check-bold'
                          : isPending
                          ? 'solar:clock-circle-bold'
                          : 'solar:danger-triangle-bold'
                      }
                      size={15}
                      color={
                        isVerified
                          ? '#25B876'
                          : isPending
                          ? '#F97316'
                          : '#EF4444'
                      }
                      className="mr-1"
                    />
                    <Text
                      className={`font-font-bold text-xs font-bold ${
                        isVerified
                          ? 'text-brand-green'
                          : isPending
                          ? 'text-orange-500'
                          : 'text-red-500'
                      }`}
                    >
                      {isVerified
                        ? t('common.statusVerified', 'Vérifié')
                        : isPending
                        ? t('common.statusPending', 'En attente')
                        : t('common.statusCompromised', 'Compromis')}
                    </Text>
                  </View>

                  <View className="flex-row items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                    {isPending && (
                      <TouchableOpacity
                        activeOpacity={0.75}
                        onPress={() => {
                          setOtpTargetNumber(item);
                          setOtpCode(['', '', '', '', '', '']);
                          setOtpTimer(60);
                          setFullScreenOtpVisible(true);
                        }}
                        className="px-2 py-1 rounded-lg bg-orange-500"
                      >
                        <Text className="font-font-bold text-xs font-bold text-white">
                          {t('common.validate', 'Valider OTP')}
                        </Text>
                      </TouchableOpacity>
                    )}

                    {isVerified && (
                      <TouchableOpacity
                        activeOpacity={0.75}
                        onPress={() => handleDeclareCompromised(item)}
                        className="px-2 py-1 rounded-lg border border-red-500"
                      >
                        <Text className="font-font-bold text-xs font-bold text-red-500">
                          {t('common.statusCompromised', 'Compromis')}
                        </Text>
                      </TouchableOpacity>
                    )}

                    {isCompromised && (
                      <TouchableOpacity
                        activeOpacity={0.75}
                        onPress={() => {
                          setTargetActionNumber(item);
                          setRestoreSecurityModalVisible(true);
                        }}
                        className="px-2 py-1 rounded-lg bg-brand-green"
                      >
                        <Text className="font-font-bold text-xs font-bold text-white">
                          {t('common.reset', 'Rétablir')}
                        </Text>
                      </TouchableOpacity>
                    )}

                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => {
                        setTargetActionNumber(item);
                        setDeleteModalVisible(true);
                      }}
                      className="p-1"
                    >
                      <Icon name="solar:trash-bin-trash-linear" color="#94A3B8" size={16} />
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        <Text className="font-font-bold text-lg font-extrabold text-slate-900 dark:text-white mt-7 mb-3">
          Actions de sécurité
        </Text>

        <View className="gap-2.5">
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push('/(app)/report')}
            className="flex-row items-center rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-brand-cardDark p-4"
          >
            <Icon name="heroicons:signal-16-solid" color="#F97316" size={24} className="mr-3.5" />
            <View className="flex-1">
              <Text className="font-font-bold text-sm font-bold text-slate-900 dark:text-white">
                Signaler une fraude
              </Text>
              <Text className="font-font-regular text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Signalez un numéro suspect vous ayant contacté
              </Text>
            </View>
            <Icon name="solar:alt-arrow-right-linear" color="#94A3B8" size={18} />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push('/(app)/contacts')}
            className="flex-row items-center rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-brand-cardDark p-4"
          >
            <Icon name="solar:users-group-two-rounded-bold" color="#25B876" size={24} className="mr-3.5" />
            <View className="flex-1">
              <Text className="font-font-bold text-sm font-bold text-slate-900 dark:text-white">
                Répertoire de contacts
              </Text>
              <Text className="font-font-regular text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Consultez vos contacts et leurs insignes de confiance
              </Text>
            </View>
            <Icon name="solar:alt-arrow-right-linear" color="#94A3B8" size={18} />
          </TouchableOpacity>
        </View>
      </ScrollView>

      <TouchableOpacity
        activeOpacity={0.85}
        onPress={handleOpenAddNumber}
        style={{ bottom: Math.max(insets.bottom + 72, 84) }}
        className="absolute right-5 w-14 h-14 rounded-full items-center justify-center bg-brand-green shadow-lg z-50"
      >
        <Icon name="solar:add-circle-bold" color="#FFFFFF" size={28} />
      </TouchableOpacity>

      <TabBar activeTab="management" />

      <Modal visible={fullScreenAddVisible} animationType="slide">
        <View className="flex-1 bg-brand-green">
          <StatusBar style="light" />

          <HeaderBar
            title={editingNumberId ? 'Modifier le numéro' : 'Ajouter un numéro'}
            showBack={true}
            onBack={() => setFullScreenAddVisible(false)}
          />

          <View className="flex-1 bg-slate-50 dark:bg-brand-darkBg rounded-tl-3xl p-6">
            <Text className="font-font-bold text-xl font-extrabold text-slate-900 dark:text-white mb-1.5">
              Rattachement d'une ligne SIM
            </Text>
            <Text className="font-font-regular text-xs text-slate-500 dark:text-slate-400 leading-5 mb-7">
              Un code de validation OTP par SMS sera envoyé sur ce numéro pour certifier votre détention de la ligne.
            </Text>

            <View
              className={`flex-row items-center h-13 rounded-xl border px-3 bg-white dark:bg-brand-cardDark ${
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
                placeholder="6 98 44 43 88"
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
              className={`h-13 rounded-xl items-center justify-center mt-8 ${
                newPhoneNumber.trim()
                  ? 'bg-brand-green'
                  : 'bg-slate-300 dark:bg-slate-700'
              }`}
            >
              {isSubmittingPhone ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text className="font-font-bold text-sm font-bold text-white">
                  {editingNumberId ? 'Valider et envoyer OTP' : 'Continuer'}
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
            title="Validation OTP"
            showBack={true}
            onBack={() => setFullScreenOtpVisible(false)}
          />

          <View className="flex-1 bg-slate-50 dark:bg-brand-darkBg rounded-tl-3xl p-6">
            <Text className="font-font-bold text-xl font-extrabold text-slate-900 dark:text-white mb-1.5">
              Vérifiez votre numéro
            </Text>
            <Text className="font-font-regular text-xs text-slate-500 dark:text-slate-400 leading-5 mb-7">
              Saisissez le code à 6 chiffres envoyé par SMS au{' '}
              <Text className="font-bold text-slate-900 dark:text-white">
                {otpTargetNumber?.callingCode} {otpTargetNumber?.phone}
              </Text>
            </Text>

            <View className="flex-row justify-center items-center gap-2 my-6 w-full">
              {otpCode.map((digit, idx) => (
                <TextInput
                  key={idx}
                  className={`w-11 h-13 rounded-xl border-2 text-center font-font-bold text-xl font-extrabold bg-white dark:bg-brand-cardDark text-slate-900 dark:text-white ${
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
                  Renvoyer le code dans {otpTimer}s
                </Text>
              ) : (
                <TouchableOpacity onPress={() => setOtpTimer(60)}>
                  <Text className="font-font-bold text-xs font-bold text-brand-green">
                    Renvoyer un nouveau code
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            <TouchableOpacity
              activeOpacity={0.85}
              disabled={isVerifyingOtp || otpCode.some((c) => c === '')}
              onPress={() => handleConfirmOtp()}
              className={`h-13 rounded-xl items-center justify-center mt-8 ${
                otpCode.every((c) => c !== '')
                  ? 'bg-brand-green'
                  : 'bg-slate-300 dark:bg-slate-700'
              }`}
            >
              {isVerifyingOtp ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text className="font-font-bold text-sm font-bold text-white">Confirmer le numéro</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={restoreSecurityModalVisible} transparent animationType="fade">
        <View className="flex-1 bg-black/60 justify-center items-center">
          <View className="mx-6 rounded-3xl p-6 w-11/12 bg-white dark:bg-brand-cardDark">
            <Icon name="solar:shield-check-bold" color="#25B876" size={42} className="self-center mb-3" />
            <Text className="font-font-bold text-lg font-extrabold text-slate-900 dark:text-white text-center mb-2">
              Rétablir la sécurité de la ligne ?
            </Text>
            <Text className="font-font-regular text-xs text-slate-500 dark:text-slate-400 text-center leading-5 mb-5">
              Confirmez que vous avez repris le contrôle total de la ligne {targetActionNumber?.callingCode} {targetActionNumber?.phone}.
            </Text>

            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={() => setRestoreSecurityModalVisible(false)}
                className="flex-1 h-12 rounded-xl border border-slate-200 dark:border-slate-700 items-center justify-center"
              >
                <Text className="font-font-bold text-sm text-slate-900 dark:text-white">Annuler</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleRestoreSecurity}
                className="flex-1 h-12 rounded-xl bg-brand-green items-center justify-center"
              >
                <Text className="font-font-bold text-sm font-bold text-white">Rétablir</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={deleteModalVisible} transparent animationType="fade">
        <View className="flex-1 bg-black/60 justify-center items-center">
          <View className="mx-6 rounded-3xl p-6 w-11/12 bg-white dark:bg-brand-cardDark">
            <Icon name="solar:trash-bin-trash-bold" color="#EF4444" size={40} className="self-center mb-3" />
            <Text className="font-font-bold text-lg font-extrabold text-slate-900 dark:text-white text-center mb-2">
              Supprimer cette ligne ?
            </Text>
            <Text className="font-font-regular text-xs text-slate-500 dark:text-slate-400 text-center leading-5 mb-5">
              Le numéro {targetActionNumber?.callingCode} {targetActionNumber?.phone} ne sera plus surveillé au titre de votre compte.
            </Text>

            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={() => setDeleteModalVisible(false)}
                className="flex-1 h-12 rounded-xl border border-slate-200 dark:border-slate-700 items-center justify-center"
              >
                <Text className="font-font-bold text-sm text-slate-900 dark:text-white">Annuler</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleConfirmDelete}
                className="flex-1 h-12 rounded-xl bg-red-500 items-center justify-center"
              >
                <Text className="font-font-bold text-sm font-bold text-white">Supprimer</Text>
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
