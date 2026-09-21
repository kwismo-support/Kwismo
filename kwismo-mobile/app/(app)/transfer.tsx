import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  Linking,
  Clipboard,
  ActivityIndicator,
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
import { numbersApi } from '@/features/numbers/services/numbers.api';
import { Skeleton } from '@/shared/ui/Skeleton';
import { transferApi } from '@/features/transfer/services/transfer.api';
import { useAuthStore } from '@/shared/store/authStore';

export interface SenderNumberOption {
  id: string;
  label: string;
  phone: string;
  callingCode: string;
  operator: string;
  operator_id?: string;
}

export interface ActionOption {
  id: string;
  label: string;
  description: string;
  ussdFormat: string;
  operator_id?: string;
}

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

  const [registeredSenders, setRegisteredSenders] = useState<SenderNumberOption[]>([]);
  const [availableActions, setAvailableActions] = useState<ActionOption[]>([]);
  const [selectedSender, setSelectedSender] = useState<SenderNumberOption | null>(null);
  const [selectedAction, setSelectedAction] = useState<ActionOption | null>(null);

  const [isDataLoading, setIsDataLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [isPreparing, setIsPreparing] = useState(false);
  const [serverUssdCode, setServerUssdCode] = useState<string | null>(null);

  const [step, setStep] = useState<'form' | 'summary' | 'ussd'>('form');
  const [beneficiaryPhone, setBeneficiaryPhone] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<CountryItem>(defaultCountry);
  const [rawAmount, setRawAmount] = useState('');

  const [beneficiaryRiskStatus, setBeneficiaryRiskStatus] = useState<string>('unknown');
  const [beneficiaryOperatorName, setBeneficiaryOperatorName] = useState<string | null>(null);
  const [beneficiaryRiskScore, setBeneficiaryRiskScore] = useState<number>(0);

  const [senderModalVisible, setSenderModalVisible] = useState(false);
  const [actionModalVisible, setActionModalVisible] = useState(false);
  const [warningModalVisible, setWarningModalVisible] = useState(false);

  const [phoneError, setPhoneError] = useState('');
  const [amountError, setAmountError] = useState('');

  const fetchActionsForOperator = async (opId?: string) => {
    if (!opId) {
      setAvailableActions([]);
      setSelectedAction(null);
      return;
    }
    setIsActionLoading(true);
    try {
      const actionsRes = await transferApi.getActions(opId);
      if (actionsRes.success && actionsRes.data && actionsRes.data.length > 0) {
        const mappedActions: ActionOption[] = actionsRes.data.map((a: any) => ({
          id: a.id,
          label: a.nomAction || a.nom || 'Transfert d’argent',
          description: a.format || a.pattern_code || 'Transfert via USSD',
          ussdFormat: a.format || a.pattern_code || '*126*{montant}*{numero}#',
          operator_id: a.operatorId || a.operator_id,
        }));
        setAvailableActions(mappedActions);
        setSelectedAction(mappedActions[0]);
      } else {
        setAvailableActions([]);
        setSelectedAction(null);
      }
    } catch {
      setAvailableActions([]);
      setSelectedAction(null);
    } finally {
      setIsActionLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    const loadInitialData = async () => {
      setIsDataLoading(true);
      try {
        const phonesRes = await numbersApi.getMyNumbers();
        if (isMounted && phonesRes.success && phonesRes.data && phonesRes.data.length > 0) {
          const mappedSenders: SenderNumberOption[] = phonesRes.data.map((p, idx) => {
            const phoneVal = p.valeur || p.numero_valeur || '';
            const opName = p.operator_name || (p.country_name ? `${p.country_name}` : `SIM ${idx + 1}`);
            return {
              id: p.id,
              label: `${opName} (${phoneVal})`,
              phone: phoneVal,
              callingCode: p.country_code || selectedCountry.callingCode,
              operator: opName,
              operator_id: p.operator_id,
            };
          });
          setRegisteredSenders(mappedSenders);
          setSelectedSender(mappedSenders[0]);
          if (mappedSenders[0]?.operator_id) {
            await fetchActionsForOperator(mappedSenders[0].operator_id);
          }
        } else if (isMounted) {
          setRegisteredSenders([]);
          setSelectedSender(null);
          setAvailableActions([]);
          setSelectedAction(null);
        }
      } catch {
        if (isMounted) {
          setRegisteredSenders([]);
          setSelectedSender(null);
          setAvailableActions([]);
          setSelectedAction(null);
        }
      }

      if (isMounted) setIsDataLoading(false);
    };

    loadInitialData();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSelectSender = async (sender: SenderNumberOption) => {
    setSelectedSender(sender);
    setSenderModalVisible(false);
    await fetchActionsForOperator(sender.operator_id);
  };

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
    return (
      beneficiaryRiskStatus === 'a_signaler' ||
      beneficiaryRiskStatus === 'frauduleux' ||
      beneficiaryRiskScore >= 0.5
    );
  }, [beneficiaryRiskStatus, beneficiaryRiskScore]);

  const generatedUssdCode = useMemo(() => {
    if (serverUssdCode) return serverUssdCode;
    const cleanDest = beneficiaryPhone.replace(/\D/g, '');
    const fmt = selectedAction?.ussdFormat || '*126*{montant}*{numero}#';
    return fmt
      .replace('{dest}', cleanDest)
      .replace('{numero}', cleanDest)
      .replace('{amount}', rawAmount)
      .replace('{montant}', rawAmount);
  }, [selectedAction, beneficiaryPhone, rawAmount, serverUssdCode]);

  const handleValidateForm = async () => {
    let valid = true;
    setPhoneError('');
    setAmountError('');

    if (registeredSenders.length === 0) {
      toast.error(t('transfer.noSenderError', 'Veuillez enregistrer une puce SIM dans votre compte pour continuer.'));
      return false;
    }

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

    const fullPhone = `${selectedCountry.callingCode}${cleanPhone}`;
    try {
      const verifyRes = await numbersApi.verifyNumber(fullPhone, selectedCountry.code);
      if (verifyRes.success && verifyRes.data) {
        setBeneficiaryRiskStatus(verifyRes.data.statut || 'securise');
        setBeneficiaryRiskScore(verifyRes.data.score_risque || 0);
        if (verifyRes.data.operator_name) {
          setBeneficiaryOperatorName(verifyRes.data.operator_name);
        }
        if (verifyRes.data.operator_id) {
          await fetchActionsForOperator(verifyRes.data.operator_id);
        } else if (selectedSender?.operator_id) {
          await fetchActionsForOperator(selectedSender.operator_id);
        }
      }
    } catch {}

    setStep('summary');
    return true;
  };

  const handleProceedFromSummary = async () => {
    setIsPreparing(true);
    try {
      const cleanPhone = `${selectedCountry.callingCode}${beneficiaryPhone.replace(/\D/g, '')}`;
      const amountNum = parseFloat(rawAmount) || 0;

      const res = await transferApi.prepareTransfer({
        numero: cleanPhone,
        montant: amountNum,
        operator_id: selectedAction?.operator_id || selectedSender?.operator_id || 'op-default',
        ussd_action_id: selectedAction?.id || 'action-default',
      });

      if (res.data?.code_ussd_genere) {
        setServerUssdCode(res.data.code_ussd_genere);
      }

      const isHighRisk =
        res.data?.niveau_risque === 'eleve' ||
        res.data?.niveau_risque === 'moyen' ||
        res.data?.statut === 'frauduleux' ||
        isBeneficiarySuspect;

      if (isHighRisk) {
        setWarningModalVisible(true);
      } else {
        setStep('ussd');
      }
    } catch {
      if (isBeneficiarySuspect) {
        setWarningModalVisible(true);
      } else {
        setStep('ussd');
      }
    } finally {
      setIsPreparing(false);
    }
  };

  const handleConfirmWarning = () => {
    setWarningModalVisible(false);
    setStep('ussd');
  };

  const handleLaunchPhoneApp = async () => {
    const telUrl = `tel:${encodeURIComponent(generatedUssdCode)}`;
    try {
      const supported = await Linking.canOpenURL(telUrl);
      if (supported) {
        await Linking.openURL(telUrl);
        toast.success(t('toasts.ussdLaunched', 'Ouverture de l’application Téléphone...'));
      } else {
        await Linking.openURL(telUrl);
      }
    } catch {
      Clipboard.setString(generatedUssdCode);
      toast.info(t('toasts.ussdCopied', 'Code USSD copié dans le presse-papier !'));
    }
  };

  const handleLaunchOperatorApp = async () => {
    const opNameLower = (beneficiaryOperatorName || selectedSender?.operator || '').toLowerCase();
    let deepLink = 'tel:';
    if (opNameLower.includes('orange')) {
      deepLink = 'orange-money://';
    } else if (opNameLower.includes('mtn')) {
      deepLink = 'momo://';
    }

    try {
      const supported = await Linking.canOpenURL(deepLink);
      if (supported) {
        await Linking.openURL(deepLink);
        toast.success(t('toasts.operatorAppLaunched', 'Ouverture de l’application de transfert...'));
      } else {
        Clipboard.setString(generatedUssdCode);
        toast.info(t('toasts.ussdCopied', 'Code USSD copié dans le presse-papier !'));
      }
    } catch {
      Clipboard.setString(generatedUssdCode);
      toast.info(t('toasts.ussdCopied', 'Code USSD copié dans le presse-papier !'));
    }
  };

  const handleCopyUssd = () => {
    Clipboard.setString(generatedUssdCode);
    toast.success(t('toasts.copiedToClipboard', 'Code USSD copié dans le presse-papier !'));
  };

  const handleReset = () => {
    setBeneficiaryPhone('');
    setRawAmount('');
    setPhoneError('');
    setAmountError('');
    setBeneficiaryRiskStatus('unknown');
    setBeneficiaryOperatorName(null);
    setBeneficiaryRiskScore(0);
    setServerUssdCode(null);
    setStep('form');
  };

  return (
    <View className="flex-1 bg-slate-50 dark:bg-brand-darkBg">
      <StatusBar style={isDark ? 'light' : 'dark'} />

      <HeaderBar
        title={t('common.transfer', 'Transfert')}
        subtitle={t('common.transferSubtitle', 'Initiation de votre transaction')}
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
        {step === 'form' ? (
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
              placeholder="Ex: 5 000"
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
              {isDataLoading ? (
                <Skeleton height={56} borderRadius={12} className="w-full" />
              ) : registeredSenders.length === 0 ? (
                <View className="p-4 rounded-2xl mb-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800">
                  <View className="flex-row items-center mb-2">
                    <Icon name="solar:sim-card-bold" color="#D97706" size={24} className="mr-2" />
                    <Text className="font-font-bold text-sm font-bold text-amber-800 dark:text-amber-300">
                      {t('transfer.noSenderTitle', 'Aucun numéro SIM d’envoi disponible')}
                    </Text>
                  </View>
                  <Text className="font-font-regular text-xs text-amber-700 dark:text-amber-400 mb-3 leading-5">
                    {t(
                      'transfer.noSenderDesc',
                      'Vous n’avez enregistré aucun numéro d’expéditeur. Veuillez ajouter au moins une puce SIM dans votre compte pour effectuer des transferts.'
                    )}
                  </Text>
                  <Button
                    title={t('transfer.addSimAction', 'Ajouter un numéro SIM')}
                    onPress={() => router.push('/(app)/management')}
                    variant="outline"
                    size="sm"
                  />
                </View>
              ) : selectedSender ? (
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => setSenderModalVisible(true)}
                  className="flex-row items-center justify-between hx-14 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-brand-cardDark px-3.5"
                >
                  <View className="flex-row items-center flex-1">
                    <View className="px-2 py-1 rounded-lg mr-2.5 bg-emerald-600">
                      <Text className="font-font-bold text-xs text-white">{selectedSender.operator}</Text>
                    </View>
                    <Text className="font-font-medium text-sm text-slate-900 dark:text-white flex-1">
                      {selectedSender.callingCode} {selectedSender.phone}
                    </Text>
                  </View>
                  <Icon name="solar:alt-arrow-down-linear" color="#94A3B8" size={20} />
                </TouchableOpacity>
              ) : null}
            </View>

            <View className="mb-4">
              <Text className="font-font-bold text-sm font-semibold text-slate-900 dark:text-white mb-1.5">
                {t('transfer.actionLabel', 'Action à exécuter')}
              </Text>
              {isDataLoading || isActionLoading ? (
                <Skeleton height={56} borderRadius={12} className="w-full" />
              ) : availableActions.length > 0 && selectedAction ? (
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => setActionModalVisible(true)}
                  className="flex-row items-center justify-between hx-14 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-brand-cardDark px-3.5"
                >
                  <View className="flex-row items-center flex-1">
                    <Icon name="solar:card-transfer-linear" color="#25B876" size={20} className="mr-2.5" />
                    <Text className="font-font-medium text-sm text-slate-900 dark:text-white flex-1">
                      {selectedAction.label}
                    </Text>
                  </View>
                  <Icon name="solar:alt-arrow-down-linear" color="#94A3B8" size={20} />
                </TouchableOpacity>
              ) : registeredSenders.length > 0 ? (
                <View className="p-3.5 rounded-xl mb-4 bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex-row items-center">
                  <Icon name="solar:info-circle-linear" color="#94A3B8" size={20} className="mr-2.5" />
                  <Text className="font-font-regular text-xs text-slate-500 dark:text-slate-400 flex-1 leading-4">
                    {t('transfer.actionsPendingHint', 'Les actions USSD s’afficheront selon l’opérateur du bénéficiaire ou la SIM d’envoi.')}
                  </Text>
                </View>
              ) : null}
            </View>

            <Button
              title={t('common.continue', 'Continuer vers le récapitulatif')}
              onPress={handleValidateForm}
              variant="primary"
              size="md"
              disabled={isDataLoading || registeredSenders.length === 0}
              leftIcon={<Icon name="solar:shield-check-bold" color="#FFFFFF" size={20} />}
              style={{ marginTop: 12 }}
            />

          </View>
        ) : step === 'summary' ? (
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
                {selectedAction?.label || 'Transfert'}
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
                      'Ce destinataire présente un risque potentiel selon nos informations.'
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

              {selectedSender && (
                <>
                  <View className="h-px w-full bg-slate-100 dark:bg-slate-800 my-1" />
                  <View className="flex-row items-center justify-between py-2">
                    <Text className="font-font-medium text-xs text-slate-500 dark:text-slate-400">
                      {t('transfer.senderSim', 'SIM d’envoi')}
                    </Text>
                    <Text className="font-font-bold text-sm font-semibold text-slate-900 dark:text-white">
                      {selectedSender.label}
                    </Text>
                  </View>
                </>
              )}

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
                  isPreparing
                    ? t('common.loading', 'Analyse en cours...')
                    : isBeneficiarySuspect
                    ? t('transfer.proceedAnyway', 'Continuer malgré le risque')
                    : t('transfer.generateUssd', 'Générer le code USSD')
                }
                onPress={handleProceedFromSummary}
                disabled={isPreparing}
                variant={isBeneficiarySuspect ? 'danger' : 'primary'}
                size="md"
                style={{ flex: 1.5 }}
                leftIcon={isPreparing ? <ActivityIndicator color="#FFFFFF" size="small" /> : undefined}
              />
            </View>
          </View>
        ) : (
          <View className="w-full">
            <Text className="font-font-bold text-xl font-extrabold text-slate-900 dark:text-white mb-1">
              {t('transfer.ussdReadyTitle', 'Validation du transfert')}
            </Text>
            <Text className="font-font-regular text-xs text-slate-500 dark:text-slate-400 mb-5 leading-5">
              {t(
                'transfer.ussdReadySub',
                'Choisissez l’option de votre choix pour finaliser le transfert en saisissant votre code secret.'
              )}
            </Text>

            <View className="p-6 rounded-3xl border-2 border-brand-green bg-white dark:bg-brand-cardDark items-center justify-center mb-6">
              <Icon name="solar:phone-calling-bold" color="#25B876" size={32} className="mb-3" />

              <Text className="font-font-bold text-2xl font-extrabold text-slate-900 dark:text-white tracking-wider mb-1.5 text-center">
                {generatedUssdCode}
              </Text>
              {selectedSender && (
                <Text className="font-font-medium text-xs text-slate-500 dark:text-slate-400 mb-4">
                  {selectedSender.operator} ({selectedSender.phone})
                </Text>
              )}

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

            <View className="w-full space-y-3">
              <Button
                title={t('transfer.launchPhoneApp', 'Faire le transfert depuis votre téléphone')}
                onPress={handleLaunchPhoneApp}
                variant="primary"
                size="lg"
                leftIcon={<Icon name="solar:phone-calling-bold" color="#FFFFFF" size={22} />}
                style={{ marginBottom: 12 }}
              />

              <Button
                title={t('transfer.launchMaxIt', 'Faire le transfert sur l’application de l’opérateur')}
                onPress={handleLaunchOperatorApp}
                variant="secondary"
                size="lg"
                leftIcon={<Icon name="solar:wallet-2-bold" color="#25B876" size={22} />}
                style={{ marginBottom: 12 }}
              />

              <Button
                title={t('common.newTransfer', 'Faire un autre transfert')}
                onPress={handleReset}
                variant="outline"
                size="md"
              />
            </View>
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
                onPress={() => handleSelectSender(sender)}
                className={`flex-row items-center p-3.5 rounded-xl mb-2.5 border ${selectedSender?.id === sender.id
                  ? 'border-2 border-brand-green bg-emerald-50 dark:bg-emerald-950/30'
                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-brand-cardDark'
                  }`}
              >
                <View className="px-2 py-1 rounded-lg bg-emerald-600">
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

                {selectedSender?.id === sender.id && (
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
                className={`flex-row items-center p-3.5 rounded-xl mb-2.5 border ${selectedAction?.id === action.id
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

                {selectedAction?.id === action.id && (
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
            <View className="wx-16 hx-16 rounded-full bg-red-100 dark:bg-red-950/50 items-center justify-center mb-4">
              <Icon name="solar:shield-warning-bold" color="#DC2626" size={48} />
            </View>

            <Text className="font-font-bold text-lg font-extrabold text-slate-900 dark:text-white text-center mb-2">
              {t('transfer.warningModalTitle', 'Attention : Numéro à risque !')}
            </Text>

            <Text className="font-font-regular text-xs text-slate-600 dark:text-slate-300 text-center leading-5 mb-5">
              {t(
                'transfer.warningModalBody',
                'Le numéro destinataire ' +
                selectedCountry.callingCode +
                ' ' +
                beneficiaryPhone +
                ' présente un risque selon notre système. Continuer peut entraîner une perte de vos fonds.'
              )}
            </Text>

            <View className="w-full">
              <Button
                title={t('transfer.confirmAnyway', 'Continuer quand même')}
                onPress={handleConfirmWarning}
                variant="danger"
                size="md"
                style={{ marginBottom: 10 }}
              />
              <Button
                title={t('common.cancel', 'Annuler le transfert')}
                onPress={() => setWarningModalVisible(false)}
                variant="secondary"
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
