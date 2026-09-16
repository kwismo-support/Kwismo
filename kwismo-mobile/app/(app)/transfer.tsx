import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  Linking,
  Clipboard,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useTranslation } from 'react-i18next';
import { getCountryCallingCode } from 'libphonenumber-js/min';
import countries from 'i18n-iso-countries';
import { Icon } from '@/shared/ui/Icon';
import { TabBar } from '@/shared/components/TabBar';
import { HeaderBar } from '@/shared/components/HeaderBar';
import { PhoneCountryInput } from '@/shared/components/PhoneCountryInput';
import { Input } from '@/shared/ui/Input';
import { Button } from '@/shared/ui/Button';
import { CountryItem } from '@/shared/components/CountryPickerModal';
import { toast } from '@/shared/store/toastStore';
import { useAppTheme } from '@/shared/hooks/useAppTheme';

import {
  SenderNumberOption,
  ActionOption,
  MOCK_REGISTERED_SENDERS,
  MOCK_AVAILABLE_ACTIONS,
} from '@/shared/mock/transactionsMock';

export default function TransferScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { i18n, t } = useTranslation();
  const { isDark } = useAppTheme();
  const isFr = i18n.language.startsWith('fr');

  const defaultCountry: CountryItem = {
    code: 'CM',
    name: countries.getName('CM', isFr ? 'fr' : 'en') || 'Cameroun',
    callingCode: `+${getCountryCallingCode('CM')}`,
  };

  const registeredSenders: SenderNumberOption[] = MOCK_REGISTERED_SENDERS;
  const availableActions: ActionOption[] = MOCK_AVAILABLE_ACTIONS;

  const [step, setStep] = useState<'form' | 'summary' | 'ussd'>('form');
  const [beneficiaryPhone, setBeneficiaryPhone] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<CountryItem>(defaultCountry);
  const [rawAmount, setRawAmount] = useState('');
  const [selectedSender, setSelectedSender] = useState<SenderNumberOption>(registeredSenders[0]);
  const [selectedAction, setSelectedAction] = useState<ActionOption>(availableActions[0]);

  const [senderModalVisible, setSenderModalVisible] = useState(false);
  const [actionModalVisible, setActionModalVisible] = useState(false);
  const [warningModalVisible, setWarningModalVisible] = useState(false);

  const [phoneError, setPhoneError] = useState('');
  const [amountError, setAmountError] = useState('');

  const formattedAmount = useMemo(() => {
    if (!rawAmount) return '';
    const cleanDigits = rawAmount.replace(/\D/g, '');
    if (!cleanDigits) return '';
    return cleanDigits.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  }, [rawAmount]);

  const handleAmountChange = (val: string) => {
    const cleanDigits = val.replace(/\D/g, '');
    setRawAmount(cleanDigits);
    if (amountError) setAmountError('');
  };

  const isBeneficiarySuspect = useMemo(() => {
    const clean = beneficiaryPhone.replace(/\D/g, '');
    return clean.endsWith('99') || clean.endsWith('000') || clean === '690000000';
  }, [beneficiaryPhone]);

  const generatedUssdCode = useMemo(() => {
    const cleanDest = beneficiaryPhone.replace(/\D/g, '');
    return selectedAction.ussdFormat
      .replace('{dest}', cleanDest)
      .replace('{amount}', rawAmount);
  }, [selectedAction, beneficiaryPhone, rawAmount]);

  const handleValidateForm = () => {
    let valid = true;
    setPhoneError('');
    setAmountError('');

    const cleanPhone = beneficiaryPhone.replace(/\D/g, '');
    if (!cleanPhone) {
      setPhoneError(t('validation.phoneRequired', 'Veuillez saisir le numéro du bénéficiaire'));
      valid = false;
    } else if (cleanPhone.length < 8) {
      setPhoneError(t('validation.phoneNumberInvalid', 'Numéro de téléphone invalide'));
      valid = false;
    }

    if (!rawAmount || parseInt(rawAmount, 10) <= 0) {
      setAmountError(t('validation.amountRequired', 'Veuillez saisir un montant valide'));
      valid = false;
    }

    if (!valid) return false;

    setStep('summary');
    return true;
  };

  const handleProceedFromSummary = () => {
    if (isBeneficiarySuspect) {
      setWarningModalVisible(true);
    } else {
      setStep('ussd');
    }
  };

  const handleConfirmWarning = () => {
    setWarningModalVisible(false);
    setStep('ussd');
  };

  const handleLaunchUssd = async () => {
    const telUrl = `tel:${encodeURIComponent(generatedUssdCode)}`;
    try {
      const supported = await Linking.canOpenURL(telUrl);
      if (supported) {
        await Linking.openURL(telUrl);
        toast.success(t('toasts.ussdLaunched'));
      } else {
        await Linking.openURL(telUrl);
      }
    } catch {
      Clipboard.setString(generatedUssdCode);
      toast.info(t('toasts.ussdCopied'));
    }
  };

  const handleCopyUssd = () => {
    Clipboard.setString(generatedUssdCode);
    toast.success(t('toasts.copiedToClipboard'));
  };

  const handleReset = () => {
    setBeneficiaryPhone('');
    setRawAmount('');
    setPhoneError('');
    setAmountError('');
    setStep('form');
  };

  return (
    <View className="flex-1 bg-slate-50 dark:bg-brand-darkBg">
      <StatusBar style={isDark ? 'light' : 'dark'} />

      <HeaderBar
        title={t('common.transfer')}
        showBack={step !== 'form'}
        onBack={() => {
          if (step === 'summary') setStep('form');
          else if (step === 'ussd') setStep('summary');
        }}
      />

      <ScrollView
        contentContainerStyle={{
          paddingBottom: Math.max(insets.bottom + 100, 110),
          paddingHorizontal: 20,
          paddingTop: 16,
        }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {step === 'form' && (
          <View className="w-full">
            <Text className="font-font-bold text-xl font-extrabold text-slate-900 dark:text-white mb-1">
              {t('transfer.enterDetails', 'Détails du transfert')}
            </Text>
            <Text className="font-font-regular text-xs text-slate-500 dark:text-slate-400 mb-5 leading-5">
              {t('transfer.enterDetailsSub', 'Transférez des fonds en toute sécurité via USSD')}
            </Text>

            <PhoneCountryInput
              label={t('transfer.beneficiaryLabel', 'Numéro du bénéficiaire')}
              phoneNumber={beneficiaryPhone}
              onPhoneNumberChange={(val) => {
                setBeneficiaryPhone(val);
                if (phoneError) setPhoneError('');
              }}
              selectedCountry={selectedCountry}
              onCountryChange={setSelectedCountry}
              error={phoneError}
              placeholder="Ex: 6 98 44 43 88"
            />

            <Input
              label={t('transfer.amountLabel', 'Montant (en FCFA)')}
              placeholder="Ex: 5 000 000"
              value={formattedAmount}
              onChangeText={handleAmountChange}
              error={amountError}
              keyboardType="numeric"
              leftIcon={<Icon name="solar:wallet-money-linear" color="#94A3B8" size={20} />}
              rightIcon={
                formattedAmount ? (
                  <Text className="font-font-bold text-xs font-bold text-brand-green ml-1.5">FCFA</Text>
                ) : undefined
              }
            />

            <View className="mb-4">
              <Text className="font-font-bold text-sm font-semibold text-slate-900 dark:text-white mb-1.5">
                {t('transfer.senderLabel', "Numéro d'expéditeur (SIM)")}
              </Text>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setSenderModalVisible(true)}
                className="flex-row items-center justify-between h-14 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-brand-cardDark px-3.5"
              >
                <View className="flex-row items-center flex-1">
                  <View
                    className={`px-2 py-1 rounded-lg mr-2.5 ${selectedSender.operator === 'Orange' ? 'bg-orange-500' : 'bg-yellow-500'
                      }`}
                  >
                    <Text className="font-font-bold text-xs text-white">{selectedSender.operator}</Text>
                  </View>
                  <Text className="font-font-medium text-sm text-slate-900 dark:text-white flex-1">
                    {selectedSender.callingCode} {selectedSender.phone}
                  </Text>
                </View>
                <Icon name="solar:alt-arrow-down-linear" color="#94A3B8" size={20} />
              </TouchableOpacity>
            </View>

            <View className="mb-4">
              <Text className="font-font-bold text-sm font-semibold text-slate-900 dark:text-white mb-1.5">
                {t('transfer.actionLabel', 'Action à exécuter')}
              </Text>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setActionModalVisible(true)}
                className="flex-row items-center justify-between h-14 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-brand-cardDark px-3.5"
              >
                <View className="flex-row items-center flex-1">
                  <Icon name="solar:card-transfer-linear" color="#25B876" size={20} className="mr-2.5" />
                  <Text className="font-font-medium text-sm text-slate-900 dark:text-white flex-1">
                    {selectedAction.label}
                  </Text>
                </View>
                <Icon name="solar:alt-arrow-down-linear" color="#94A3B8" size={20} />
              </TouchableOpacity>
            </View>

            <Button
              title={t('common.continue', 'Continuer vers le récapitulatif')}
              onPress={handleValidateForm}
              variant="primary"
              size="md"
              leftIcon={<Icon name="solar:shield-check-bold" color="#FFFFFF" size={20} />}
              style={{ marginTop: 12 }}
            />
          </View>
        )}

        {step === 'summary' && (
          <View className="w-full">
            <Text className="font-font-bold text-xl font-extrabold text-slate-900 dark:text-white mb-1">
              {t('transfer.approveTitle', "Approuvez l'envoi")}
            </Text>
            <Text className="font-font-regular text-xs text-slate-500 dark:text-slate-400 mb-5 leading-5">
              {t('transfer.approveSub', 'Vérifiez les détails avant de générer le code USSD')}
            </Text>

            <View className="p-5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-brand-cardDark items-center justify-center mb-4">
              <Text className="font-font-bold text-3xl font-extrabold text-brand-green mb-1">
                {formattedAmount} <Text className="text-lg">FCFA</Text>
              </Text>
              <Text className="font-font-medium text-xs text-slate-500 dark:text-slate-400">
                {selectedAction.label}
              </Text>
            </View>

            {isBeneficiarySuspect ? (
              <View className="flex-row items-center p-4 rounded-2xl mb-4 bg-red-100 dark:bg-red-950/50 border border-red-300 dark:border-red-800">
                <Icon name="solar:danger-triangle-bold" color="#DC2626" size={24} className="mr-3" />
                <View className="flex-1">
                  <Text className="font-font-bold text-sm font-bold text-red-800 dark:text-red-300 mb-0.5">
                    {t('transfer.riskSuspectTitle', 'Numéro suspect détecté !')}
                  </Text>
                  <Text className="font-font-regular text-xs text-red-700 dark:text-red-400">
                    {t(
                      'transfer.riskSuspectSub',
                      'Ce destinataire a fait l’objet de plusieurs signalements récents.'
                    )}
                  </Text>
                </View>
              </View>
            ) : (
              <View className="flex-row items-center p-4 rounded-2xl mb-4 bg-emerald-100 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800">
                <Icon name="solar:verified-check-bold" color="#16A34A" size={24} className="mr-3" />
                <View className="flex-1">
                  <Text className="font-font-bold text-sm font-bold text-emerald-800 dark:text-emerald-300 mb-0.5">
                    {t('transfer.riskSafeTitle', 'Numéro vérifié et sûr')}
                  </Text>
                  <Text className="font-font-regular text-xs text-brand-green dark:text-brand-green">
                    {t(
                      'transfer.riskSafeSub',
                      'Aucune menace ou comportement suspect associé à ce numéro.'
                    )}
                  </Text>
                </View>
              </View>
            )}

            <View className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-brand-cardDark p-4 mb-6">
              <View className="flex-row items-center justify-between py-2">
                <Text className="font-font-medium text-xs text-slate-500 dark:text-slate-400">
                  {t('transfer.recipientNumber', 'Numéro destinataire')}
                </Text>
                <Text className="font-font-bold text-sm font-semibold text-slate-900 dark:text-white">
                  {selectedCountry.callingCode} {beneficiaryPhone}
                </Text>
              </View>

              <View className="h-px w-full bg-slate-100 dark:bg-slate-800 my-1" />

              <View className="flex-row items-center justify-between py-2">
                <Text className="font-font-medium text-xs text-slate-500 dark:text-slate-400">
                  {t('transfer.countryLabel', 'Pays')}
                </Text>
                <Text className="font-font-bold text-sm font-semibold text-slate-900 dark:text-white">
                  {selectedCountry.name} ({selectedCountry.callingCode})
                </Text>
              </View>

              <View className="h-px w-full bg-slate-100 dark:bg-slate-800 my-1" />

              <View className="flex-row items-center justify-between py-2">
                <Text className="font-font-medium text-xs text-slate-500 dark:text-slate-400">
                  {t('transfer.senderSim', 'SIM d’envoi')}
                </Text>
                <Text className="font-font-bold text-sm font-semibold text-slate-900 dark:text-white">
                  {selectedSender.label}
                </Text>
              </View>

              <View className="h-px w-full bg-slate-100 dark:bg-slate-800 my-1" />

              <View className="flex-row items-center justify-between py-2">
                <Text className="font-font-medium text-xs text-slate-500 dark:text-slate-400">
                  {t('common.amount', 'Montant total')}
                </Text>
                <Text className="font-font-bold text-sm font-bold text-brand-green">
                  {formattedAmount} FCFA
                </Text>
              </View>
            </View>

            <View className="flex-row gap-3">
              <Button
                title={t('common.back', 'Modifier')}
                onPress={() => setStep('form')}
                variant="outline"
                size="md"
                style={{ flex: 1 }}
              />
              <Button
                title={
                  isBeneficiarySuspect
                    ? t('transfer.proceedAnyway', 'Continuer malgré le risque')
                    : t('transfer.generateUssd', 'Générer le code USSD')
                }
                onPress={handleProceedFromSummary}
                variant={isBeneficiarySuspect ? 'danger' : 'primary'}
                size="md"
                style={{ flex: 1.5 }}
              />
            </View>
          </View>
        )}

        {step === 'ussd' && (
          <View className="w-full">
            <Text className="font-font-bold text-xl font-extrabold text-slate-900 dark:text-white mb-1">
              {t('transfer.ussdReadyTitle', 'Code USSD prêt !')}
            </Text>
            <Text className="font-font-regular text-xs text-slate-500 dark:text-slate-400 mb-5 leading-5">
              {t(
                'transfer.ussdReadySub',
                'Touchez le bouton pour lancer automatiquement l’opération sur votre téléphone.'
              )}
            </Text>

            <View className="p-6 rounded-3xl border-2 border-brand-green bg-white dark:bg-brand-cardDark items-center justify-center mb-6">
              <Icon name="solar:phone-calling-bold" color="#25B876" size={32} className="mb-3" />
              <Text className="font-font-bold text-2xl font-extrabold text-slate-900 dark:text-white tracking-wider mb-1.5 text-center">
                {generatedUssdCode}
              </Text>
              <Text className="font-font-medium text-xs text-slate-500 dark:text-slate-400 mb-4">
                {selectedSender.operator} Money ({selectedSender.callingCode} {selectedSender.phone})
              </Text>

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={handleCopyUssd}
                className="flex-row items-center px-3 py-1.5 rounded-lg bg-emerald-500/10"
              >
                <Icon name="solar:copy-bold" color="#25B876" size={16} className="mr-1.5" />
                <Text className="font-font-bold text-xs text-brand-green font-semibold">
                  {t('common.copy', 'Copier le code')}
                </Text>
              </TouchableOpacity>
            </View>

            <Button
              title={t('transfer.launchPhoneApp', 'Lancer dans l’application Téléphone')}
              onPress={handleLaunchUssd}
              variant="primary"
              size="lg"
              leftIcon={<Icon name="solar:phone-calling-linear" color="#FFFFFF" size={22} />}
              style={{ marginBottom: 14 }}
            />

            <Button
              title={t('common.newTransfer', 'Faire un autre transfert')}
              onPress={handleReset}
              variant="secondary"
              size="md"
            />
          </View>
        )}
      </ScrollView>

      <Modal
        visible={senderModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setSenderModalVisible(false)}
      >
        <View className="flex-1 bg-black/60 justify-end">
          <View className="rounded-t-3xl p-5 pb-9 bg-white dark:bg-brand-darkBg">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="font-font-bold text-base font-bold text-slate-900 dark:text-white">
                {t('transfer.selectSenderSim', "Sélectionner la SIM d'envoi")}
              </Text>
              <TouchableOpacity onPress={() => setSenderModalVisible(false)}>
                <Icon name="solar:close-circle-bold" color="#94A3B8" size={26} />
              </TouchableOpacity>
            </View>

            {registeredSenders.map((sender) => (
              <TouchableOpacity
                key={sender.id}
                activeOpacity={0.8}
                onPress={() => {
                  setSelectedSender(sender);
                  setSenderModalVisible(false);
                }}
                className={`flex-row items-center p-3.5 rounded-xl mb-2.5 border ${selectedSender.id === sender.id
                  ? 'border-2 border-brand-green bg-emerald-50 dark:bg-emerald-950/30'
                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-brand-cardDark'
                  }`}
              >
                <View
                  className={`px-2 py-1 rounded-lg ${sender.operator === 'Orange' ? 'bg-orange-500' : 'bg-yellow-500'
                    }`}
                >
                  <Text className="font-font-bold text-xs text-white">{sender.operator}</Text>
                </View>

                <View className="flex-1 ml-3">
                  <Text className="font-font-bold text-sm font-bold text-slate-900 dark:text-white">
                    {sender.label}
                  </Text>
                  <Text className="font-font-regular text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {sender.callingCode} {sender.phone}
                  </Text>
                </View>

                {selectedSender.id === sender.id && (
                  <Icon name="solar:check-circle-bold" color="#25B876" size={22} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>

      <Modal
        visible={actionModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setActionModalVisible(false)}
      >
        <View className="flex-1 bg-black/60 justify-end">
          <View className="rounded-t-3xl p-5 pb-9 bg-white dark:bg-brand-darkBg">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="font-font-bold text-base font-bold text-slate-900 dark:text-white">
                {t('transfer.selectAction', 'Sélectionner l’action')}
              </Text>
              <TouchableOpacity onPress={() => setActionModalVisible(false)}>
                <Icon name="solar:close-circle-bold" color="#94A3B8" size={26} />
              </TouchableOpacity>
            </View>

            {availableActions.map((action) => (
              <TouchableOpacity
                key={action.id}
                activeOpacity={0.8}
                onPress={() => {
                  setSelectedAction(action);
                  setActionModalVisible(false);
                }}
                className={`flex-row items-center p-3.5 rounded-xl mb-2.5 border ${selectedAction.id === action.id
                  ? 'border-2 border-brand-green bg-emerald-50 dark:bg-emerald-950/30'
                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-brand-cardDark'
                  }`}
              >
                <Icon name="solar:card-transfer-bold" color="#25B876" size={24} className="mr-3" />
                <View className="flex-1">
                  <Text className="font-font-bold text-sm font-bold text-slate-900 dark:text-white">
                    {action.label}
                  </Text>
                  <Text className="font-font-regular text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {action.description}
                  </Text>
                </View>

                {selectedAction.id === action.id && (
                  <Icon name="solar:check-circle-bold" color="#25B876" size={22} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>

      <Modal
        visible={warningModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setWarningModalVisible(false)}
      >
        <View className="flex-1 bg-black/70 items-center justify-center p-5">
          <View className="w-full rounded-3xl p-6 items-center bg-white dark:bg-brand-cardDark">
            <View className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-950/50 items-center justify-center mb-4">
              <Icon name="solar:shield-warning-bold" color="#DC2626" size={48} />
            </View>

            <Text className="font-font-bold text-lg font-extrabold text-slate-900 dark:text-white text-center mb-2">
              {t('transfer.warningModalTitle', 'Êtes-vous absolument sûr ?')}
            </Text>

            <Text className="font-font-regular text-xs text-slate-600 dark:text-slate-300 text-center leading-5 mb-5">
              {t(
                'transfer.warningModalBody',
                'Le numéro destinataire ' +
                selectedCountry.callingCode +
                ' ' +
                beneficiaryPhone +
                ' présente un risque élevé de fraude selon notre système. Continuer peut entraîner une perte définitive de vos fonds.'
              )}
            </Text>

            <View className="w-full">
              <Button
                title={t('common.cancel', 'Annuler le transfert')}
                onPress={() => setWarningModalVisible(false)}
                variant="secondary"
                size="md"
                style={{ marginBottom: 10 }}
              />
              <Button
                title={t('transfer.confirmAnyway', 'Continuer quand même')}
                onPress={handleConfirmWarning}
                variant="danger"
                size="md"
              />
            </View>
          </View>
        </View>
      </Modal>

      <TabBar activeTab="transfer" />
    </View>
  );
}

