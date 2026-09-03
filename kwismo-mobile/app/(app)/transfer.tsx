import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  Platform,
  Linking,
  Clipboard,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useTranslation } from 'react-i18next';
import { getCountryCallingCode, CountryCode } from 'libphonenumber-js/min';
import countries from 'i18n-iso-countries';
import { Icon } from '../../src/shared/ui/Icon';
import { TabBar } from '../../src/shared/components/TabBar';
import { HeaderBar } from '../../src/shared/components/HeaderBar';
import { PhoneCountryInput } from '../../src/shared/components/PhoneCountryInput';
import { Input } from '../../src/shared/ui/Input';
import { Button } from '../../src/shared/ui/Button';
import { CountryItem } from '../../src/shared/components/CountryPickerModal';
import { toast } from '../../src/shared/store/toastStore';
import { useAppTheme } from '../../src/shared/hooks/useAppTheme';
import { colors, fonts } from '../../src/styles/tokens';
import { scaleFont } from '../../src/shared/lib/responsive';

interface SenderNumberOption {
  id: string;
  label: string;
  phone: string;
  callingCode: string;
  operator: 'Orange' | 'MTN';
}

interface ActionOption {
  id: string;
  label: string;
  description: string;
  ussdFormat: string; // Ex: '#150*1*1*{dest}*{amount}#'
}

export default function TransferScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { i18n, t } = useTranslation();
  const { isDark, colors: themeColors } = useAppTheme();
  const isFr = i18n.language.startsWith('fr');

  const defaultCountry: CountryItem = {
    code: 'CM',
    name: countries.getName('CM', isFr ? 'fr' : 'en') || 'Cameroun',
    callingCode: `+${getCountryCallingCode('CM')}`,
  };

  // Liste des numéros enregistrés de l'utilisateur (Expéditeurs valides)
  const registeredSenders: SenderNumberOption[] = [
    {
      id: 'sim1',
      label: 'SIM 1 (Orange Money)',
      phone: '6 98 44 43 88',
      callingCode: '+237',
      operator: 'Orange',
    },
    {
      id: 'sim2',
      label: 'SIM 2 (MTN MoMo)',
      phone: '6 70 12 34 56',
      callingCode: '+237',
      operator: 'MTN',
    },
  ];

  // Actions dynamiques configurées côté backend
  const availableActions: ActionOption[] = [
    {
      id: 'transfer_momo',
      label: "Transfert d'argent Mobile Money",
      description: 'Envoi direct vers un compte Mobile Money / Orange Money',
      ussdFormat: '#150*1*1*{dest}*{amount}#',
    },
    {
      id: 'merchant_pay',
      label: 'Paiement Marchand USSD',
      description: 'Règlement chez un marchand partenaire Kwismo',
      ussdFormat: '#150*3*{dest}*{amount}#',
    },
  ];

  // États du formulaire
  const [step, setStep] = useState<'form' | 'summary' | 'ussd'>('form');
  const [beneficiaryPhone, setBeneficiaryPhone] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<CountryItem>(defaultCountry);
  const [rawAmount, setRawAmount] = useState('');
  const [selectedSender, setSelectedSender] = useState<SenderNumberOption>(registeredSenders[0]);
  const [selectedAction, setSelectedAction] = useState<ActionOption>(availableActions[0]);

  // Modales
  const [senderModalVisible, setSenderModalVisible] = useState(false);
  const [actionModalVisible, setActionModalVisible] = useState(false);
  const [warningModalVisible, setWarningModalVisible] = useState(false);

  // Erreurs
  const [phoneError, setPhoneError] = useState('');
  const [amountError, setAmountError] = useState('');

  // Formatage des milliers (ex: 5000000 -> 5 000 000)
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

  // Détection si le numéro est suspect (Simulation d'analyse de risque Kwismo)
  const isBeneficiarySuspect = useMemo(() => {
    const clean = beneficiaryPhone.replace(/\D/g, '');
    // Numéro de test réputé à risque ou se terminant par '99' ou '00'
    return clean.endsWith('99') || clean.endsWith('000') || clean === '690000000';
  }, [beneficiaryPhone]);

  // Génération du code USSD natif
  const generatedUssdCode = useMemo(() => {
    const cleanDest = beneficiaryPhone.replace(/\D/g, '');
    return selectedAction.ussdFormat
      .replace('{dest}', cleanDest)
      .replace('{amount}', rawAmount);
  }, [selectedAction, beneficiaryPhone, rawAmount]);

  // Validation du formulaire
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

    // Passage au Récapitulatif sans scroll
    setStep('summary');
    return true;
  };

  // Action sur le bouton du récapitulatif
  const handleProceedFromSummary = () => {
    if (isBeneficiarySuspect) {
      // Ouvre la modale d'avertissement
      setWarningModalVisible(true);
    } else {
      // Direct vers écran USSD
      setStep('ussd');
    }
  };

  // Confirmation après modale d'avertissement
  const handleConfirmWarning = () => {
    setWarningModalVisible(false);
    setStep('ussd');
  };

  // Lancement du code USSD dans l'application Téléphone
  const handleLaunchUssd = async () => {
    const telUrl = `tel:${encodeURIComponent(generatedUssdCode)}`;
    try {
      const supported = await Linking.canOpenURL(telUrl);
      if (supported) {
        await Linking.openURL(telUrl);
        toast.success(t('toasts.ussdLaunched', 'Code USSD envoyé au composeur natif'));
      } else {
        await Linking.openURL(telUrl);
      }
    } catch {
      // Fallback copie
      Clipboard.setString(generatedUssdCode);
      toast.info(t('toasts.ussdCopied', 'Code USSD copié dans le presse-papier'));
    }
  };

  const handleCopyUssd = () => {
    Clipboard.setString(generatedUssdCode);
    toast.success(t('toasts.copiedToClipboard', 'Code USSD copié !'));
  };

  const handleReset = () => {
    setBeneficiaryPhone('');
    setRawAmount('');
    setPhoneError('');
    setAmountError('');
    setStep('form');
  };

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <StatusBar style="light" />

      {/* Header Unifié Kwismo */}
      <HeaderBar
        title={t('common.moneyTransfer', "Transfert d'argent")}
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
        {/* ============================================================ */}
        {/* VUE 1 : FORMULAIRE DE SAISIE EN 1 PAGE (ZÉRO SCROLL FORCÉ)   */}
        {/* ============================================================ */}
        {step === 'form' && (
          <View style={styles.formSection}>
            <Text style={[styles.sectionTitle, { color: themeColors.textPrimary }]}>
              {t('transfer.enterDetails', 'Détails du transfert')}
            </Text>
            <Text style={[styles.sectionSubtitle, { color: themeColors.textSecondary }]}>
              {t('transfer.enterDetailsSub', 'Transférez des fonds en toute sécurité via USSD')}
            </Text>

            {/* Champ Unique Bénéficiaire (Drapeau + Indicatif + Numéro + Carnet Contacts) */}
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

            {/* Champ Montant avec Séparateurs de Milliers */}
            <Input
              label={t('transfer.amountLabel', 'Montant (en FCFA)')}
              placeholder="Ex: 5 000 000"
              value={formattedAmount}
              onChangeText={handleAmountChange}
              error={amountError}
              keyboardType="numeric"
              leftIcon={<Icon name="solar:wallet-money-linear" color={themeColors.inputPlaceholder} size={20} />}
              rightIcon={
                formattedAmount ? (
                  <Text style={[styles.currencySuffix, { color: colors.green }]}>FCFA</Text>
                ) : undefined
              }
            />

            {/* Sélecteur de numéro Expéditeur (SIM enregistrée) */}
            <View style={styles.selectWrapper}>
              <Text style={[styles.inputLabel, { color: themeColors.textPrimary }]}>
                {t('transfer.senderLabel', "Numéro d'expéditeur (SIM)")}
              </Text>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setSenderModalVisible(true)}
                style={[
                  styles.customSelectBox,
                  {
                    backgroundColor: themeColors.cardBg,
                    borderColor: themeColors.inputBorder,
                  },
                ]}
              >
                <View style={styles.selectLeftRow}>
                  <View
                    style={[
                      styles.operatorBadge,
                      {
                        backgroundColor:
                          selectedSender.operator === 'Orange' ? '#FF7900' : '#EAB308',
                      },
                    ]}
                  >
                    <Text style={styles.operatorBadgeText}>{selectedSender.operator}</Text>
                  </View>
                  <Text style={[styles.selectText, { color: themeColors.textPrimary }]}>
                    {selectedSender.callingCode} {selectedSender.phone}
                  </Text>
                </View>
                <Icon name="solar:alt-arrow-down-linear" color={themeColors.textSecondary} size={20} />
              </TouchableOpacity>
            </View>

            {/* Sélecteur d'action à exécuter (Configuré backend) */}
            <View style={styles.selectWrapper}>
              <Text style={[styles.inputLabel, { color: themeColors.textPrimary }]}>
                {t('transfer.actionLabel', 'Action à exécuter')}
              </Text>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setActionModalVisible(true)}
                style={[
                  styles.customSelectBox,
                  {
                    backgroundColor: themeColors.cardBg,
                    borderColor: themeColors.inputBorder,
                  },
                ]}
              >
                <View style={styles.selectLeftRow}>
                  <Icon name="solar:card-transfer-linear" color={colors.green} size={20} style={{ marginRight: 10 }} />
                  <Text style={[styles.selectText, { color: themeColors.textPrimary }]}>
                    {selectedAction.label}
                  </Text>
                </View>
                <Icon name="solar:alt-arrow-down-linear" color={themeColors.textSecondary} size={20} />
              </TouchableOpacity>
            </View>

            {/* Bouton Valider le transfert */}
            <Button
              title={t('common.continue', 'Continuer vers le récapitulatif')}
              onPress={handleValidateForm}
              variant="primary"
              size="md"
              leftIcon={<Icon name="solar:shield-check-bold" color={colors.white} size={20} />}
              style={{ marginTop: 12 }}
            />
          </View>
        )}

        {/* ============================================================ */}
        {/* VUE 2 : RÉCAPITULATIF ET ANALYSE DU RISQUE NUMÉRO            */}
        {/* ============================================================ */}
        {step === 'summary' && (
          <View style={styles.summarySection}>
            <Text style={[styles.sectionTitle, { color: themeColors.textPrimary }]}>
              {t('transfer.approveTitle', "Approuvez l'envoi")}
            </Text>
            <Text style={[styles.sectionSubtitle, { color: themeColors.textSecondary }]}>
              {t('transfer.approveSub', 'Vérifiez les détails avant de générer le code USSD')}
            </Text>

            {/* Carte de Montant Principal */}
            <View
              style={[
                styles.amountHeroCard,
                {
                  backgroundColor: themeColors.cardBg,
                  borderColor: themeColors.inputBorder,
                },
              ]}
            >
              <Text style={[styles.heroAmountText, { color: colors.green }]}>
                {formattedAmount} <Text style={{ fontSize: scaleFont(18) }}>FCFA</Text>
              </Text>
              <Text style={[styles.heroSubText, { color: themeColors.textSecondary }]}>
                {selectedAction.label}
              </Text>
            </View>

            {/* Badge d'Analyse du Risque Kwismo */}
            {isBeneficiarySuspect ? (
              <View style={[styles.riskBadgeCard, styles.riskSuspectBg]}>
                <Icon name="solar:danger-triangle-bold" color="#DC2626" size={24} style={{ marginRight: 12 }} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.riskSuspectTitle}>
                    {t('transfer.riskSuspectTitle', 'Numéro suspect détecté !')}
                  </Text>
                  <Text style={styles.riskSuspectSub}>
                    {t(
                      'transfer.riskSuspectSub',
                      'Ce destinataire a fait l’objet de plusieurs signalements récents.'
                    )}
                  </Text>
                </View>
              </View>
            ) : (
              <View style={[styles.riskBadgeCard, styles.riskSafeBg]}>
                <Icon name="solar:verified-check-bold" color="#16A34A" size={24} style={{ marginRight: 12 }} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.riskSafeTitle}>
                    {t('transfer.riskSafeTitle', 'Numéro vérifié et sûr')}
                  </Text>
                  <Text style={styles.riskSafeSub}>
                    {t(
                      'transfer.riskSafeSub',
                      'Aucune menace ou comportement suspect associé à ce numéro.'
                    )}
                  </Text>
                </View>
              </View>
            )}

            {/* Tableau récapitulatif avec affichage du NUMÉRO (sans nom) */}
            <View
              style={[
                styles.detailsCard,
                {
                  backgroundColor: themeColors.cardBg,
                  borderColor: themeColors.inputBorder,
                },
              ]}
            >
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: themeColors.textSecondary }]}>
                  {t('transfer.recipientNumber', 'Numéro destinataire')}
                </Text>
                <Text style={[styles.detailValue, { color: themeColors.textPrimary }]}>
                  {selectedCountry.callingCode} {beneficiaryPhone}
                </Text>
              </View>

              <View style={[styles.detailDivider, { backgroundColor: themeColors.divider }]} />

              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: themeColors.textSecondary }]}>
                  {t('transfer.countryLabel', 'Pays')}
                </Text>
                <Text style={[styles.detailValue, { color: themeColors.textPrimary }]}>
                  {selectedCountry.name} ({selectedCountry.callingCode})
                </Text>
              </View>

              <View style={[styles.detailDivider, { backgroundColor: themeColors.divider }]} />

              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: themeColors.textSecondary }]}>
                  {t('transfer.senderSim', 'SIM d’envoi')}
                </Text>
                <Text style={[styles.detailValue, { color: themeColors.textPrimary }]}>
                  {selectedSender.label}
                </Text>
              </View>

              <View style={[styles.detailDivider, { backgroundColor: themeColors.divider }]} />

              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: themeColors.textSecondary }]}>
                  {t('common.amount', 'Montant total')}
                </Text>
                <Text style={[styles.detailValue, { color: colors.green, fontFamily: fonts.bold }]}>
                  {formattedAmount} FCFA
                </Text>
              </View>
            </View>

            {/* Boutons d'Action */}
            <View style={styles.btnRow}>
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

        {/* ============================================================ */}
        {/* VUE 3 : ÉCRAN CODE USSD GÉNÉRÉ & LANCEMENT DANS TÉLÉPHONE    */}
        {/* ============================================================ */}
        {step === 'ussd' && (
          <View style={styles.ussdSection}>
            <Text style={[styles.sectionTitle, { color: themeColors.textPrimary }]}>
              {t('transfer.ussdReadyTitle', 'Code USSD prêt !')}
            </Text>
            <Text style={[styles.sectionSubtitle, { color: themeColors.textSecondary }]}>
              {t(
                'transfer.ussdReadySub',
                'Touchez le bouton pour lancer automatiquement l’opération sur votre téléphone.'
              )}
            </Text>

            {/* Carte du Code USSD */}
            <View
              style={[
                styles.ussdDisplayCard,
                {
                  backgroundColor: isDark ? '#1E293B' : '#F8FAFC',
                  borderColor: colors.green,
                },
              ]}
            >
              <Icon name="solar:phone-calling-bold" color={colors.green} size={32} style={{ marginBottom: 12 }} />
              <Text style={[styles.ussdCodeText, { color: themeColors.textPrimary }]}>
                {generatedUssdCode}
              </Text>
              <Text style={[styles.ussdHintText, { color: themeColors.textSecondary }]}>
                {selectedSender.operator} Money ({selectedSender.callingCode} {selectedSender.phone})
              </Text>

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={handleCopyUssd}
                style={styles.copyBtn}
              >
                <Icon name="solar:copy-bold" color={colors.green} size={16} style={{ marginRight: 6 }} />
                <Text style={styles.copyBtnText}>{t('common.copy', 'Copier le code')}</Text>
              </TouchableOpacity>
            </View>

            {/* Bouton Principal : Lancer dans l'application Téléphone */}
            <Button
              title={t('transfer.launchPhoneApp', 'Lancer dans l’application Téléphone')}
              onPress={handleLaunchUssd}
              variant="primary"
              size="lg"
              leftIcon={<Icon name="solar:phone-calling-linear" color={colors.white} size={22} />}
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

      {/* ============================================================ */}
      {/* MODALE 1 : SÉLECTION DE LA SIM EXPÉDITRICE                      */}
      {/* ============================================================ */}
      <Modal
        visible={senderModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setSenderModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalSheet, { backgroundColor: themeColors.background }]}>
            <View style={styles.modalHeaderRow}>
              <Text style={[styles.modalTitle, { color: themeColors.textPrimary }]}>
                {t('transfer.selectSenderSim', "Sélectionner la SIM d'envoi")}
              </Text>
              <TouchableOpacity onPress={() => setSenderModalVisible(false)}>
                <Icon name="solar:close-circle-bold" color={themeColors.textSecondary} size={26} />
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
                style={[
                  styles.optionCard,
                  {
                    backgroundColor: themeColors.cardBg,
                    borderColor:
                      selectedSender.id === sender.id ? colors.green : themeColors.inputBorder,
                    borderWidth: selectedSender.id === sender.id ? 2 : 1,
                  },
                ]}
              >
                <View
                  style={[
                    styles.operatorBadge,
                    {
                      backgroundColor: sender.operator === 'Orange' ? '#FF7900' : '#EAB308',
                    },
                  ]}
                >
                  <Text style={styles.operatorBadgeText}>{sender.operator}</Text>
                </View>

                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={[styles.optionTitle, { color: themeColors.textPrimary }]}>
                    {sender.label}
                  </Text>
                  <Text style={[styles.optionSub, { color: themeColors.textSecondary }]}>
                    {sender.callingCode} {sender.phone}
                  </Text>
                </View>

                {selectedSender.id === sender.id && (
                  <Icon name="solar:check-circle-bold" color={colors.green} size={22} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>

      {/* ============================================================ */}
      {/* MODALE 2 : SÉLECTION DE L'ACTION À EXÉCUTER                  */}
      {/* ============================================================ */}
      <Modal
        visible={actionModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setActionModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalSheet, { backgroundColor: themeColors.background }]}>
            <View style={styles.modalHeaderRow}>
              <Text style={[styles.modalTitle, { color: themeColors.textPrimary }]}>
                {t('transfer.selectAction', 'Sélectionner l’action')}
              </Text>
              <TouchableOpacity onPress={() => setActionModalVisible(false)}>
                <Icon name="solar:close-circle-bold" color={themeColors.textSecondary} size={26} />
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
                style={[
                  styles.optionCard,
                  {
                    backgroundColor: themeColors.cardBg,
                    borderColor:
                      selectedAction.id === action.id ? colors.green : themeColors.inputBorder,
                    borderWidth: selectedAction.id === action.id ? 2 : 1,
                  },
                ]}
              >
                <Icon name="solar:card-transfer-bold" color={colors.green} size={24} style={{ marginRight: 12 }} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.optionTitle, { color: themeColors.textPrimary }]}>
                    {action.label}
                  </Text>
                  <Text style={[styles.optionSub, { color: themeColors.textSecondary }]}>
                    {action.description}
                  </Text>
                </View>

                {selectedAction.id === action.id && (
                  <Icon name="solar:check-circle-bold" color={colors.green} size={22} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>

      {/* ============================================================ */}
      {/* MODALE 3 : AVERTISSEMENT SÉCURITÉ POUR NUMÉRO SUSPECT        */}
      {/* ============================================================ */}
      <Modal
        visible={warningModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setWarningModalVisible(false)}
      >
        <View style={styles.modalOverlayCenter}>
          <View style={[styles.warningDialog, { backgroundColor: themeColors.background }]}>
            <View style={styles.warningIconWrapper}>
              <Icon name="solar:shield-warning-bold" color="#DC2626" size={48} />
            </View>

            <Text style={[styles.warningDialogTitle, { color: themeColors.textPrimary }]}>
              {t('transfer.warningModalTitle', 'Êtes-vous absolument sûr ?')}
            </Text>

            <Text style={[styles.warningDialogSub, { color: themeColors.textSecondary }]}>
              {t(
                'transfer.warningModalBody',
                'Le numéro destinataire ' +
                  selectedCountry.callingCode +
                  ' ' +
                  beneficiaryPhone +
                  ' présente un risque élevé de fraude selon notre système. Continuer peut entraîner une perte définitive de vos fonds.'
              )}
            </Text>

            <View style={styles.warningBtnColumn}>
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

      {/* Navigation TabBar du bas */}
      <TabBar activeTab="transfer" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  formSection: {
    width: '100%',
  },
  summarySection: {
    width: '100%',
  },
  ussdSection: {
    width: '100%',
  },
  sectionTitle: {
    fontFamily: fonts.h6,
    fontSize: scaleFont(20),
    fontWeight: '800',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontFamily: fonts.regular,
    fontSize: scaleFont(13),
    marginBottom: 20,
    lineHeight: 18,
  },
  currencySuffix: {
    fontFamily: fonts.bold,
    fontSize: scaleFont(13),
    marginLeft: 6,
  },
  selectWrapper: {
    marginBottom: 16,
  },
  inputLabel: {
    fontFamily: fonts.semiBold,
    fontSize: scaleFont(14),
    marginBottom: 6,
  },
  customSelectBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 54,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
  },
  selectLeftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  operatorBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 10,
  },
  operatorBadgeText: {
    fontFamily: fonts.bold,
    fontSize: scaleFont(11),
    color: colors.white,
  },
  selectText: {
    fontFamily: fonts.medium,
    fontSize: scaleFont(14),
    flex: 1,
  },
  amountHeroCard: {
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  heroAmountText: {
    fontFamily: fonts.headlineBold,
    fontSize: scaleFont(32),
    fontWeight: '800',
    marginBottom: 4,
  },
  heroSubText: {
    fontFamily: fonts.medium,
    fontSize: scaleFont(13),
  },
  riskBadgeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
  },
  riskSuspectBg: {
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  riskSuspectTitle: {
    fontFamily: fonts.bold,
    fontSize: scaleFont(14),
    color: '#991B1B',
    marginBottom: 2,
  },
  riskSuspectSub: {
    fontFamily: fonts.regular,
    fontSize: scaleFont(12),
    color: '#7F1D1D',
    lineHeight: 16,
  },
  riskSafeBg: {
    backgroundColor: '#DCFCE7',
    borderWidth: 1,
    borderColor: '#86EFAC',
  },
  riskSafeTitle: {
    fontFamily: fonts.bold,
    fontSize: scaleFont(14),
    color: '#166534',
    marginBottom: 2,
  },
  riskSafeSub: {
    fontFamily: fonts.regular,
    fontSize: scaleFont(12),
    color: '#14532D',
    lineHeight: 16,
  },
  detailsCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    marginBottom: 24,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  detailLabel: {
    fontFamily: fonts.medium,
    fontSize: scaleFont(13),
  },
  detailValue: {
    fontFamily: fonts.semiBold,
    fontSize: scaleFont(14),
  },
  detailDivider: {
    height: 1,
    width: '100%',
    marginVertical: 4,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 12,
  },
  ussdDisplayCard: {
    padding: 24,
    borderRadius: 24,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  ussdCodeText: {
    fontFamily: fonts.headlineBold,
    fontSize: scaleFont(24),
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 6,
    textAlign: 'center',
  },
  ussdHintText: {
    fontFamily: fonts.medium,
    fontSize: scaleFont(13),
    marginBottom: 16,
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(37, 184, 118, 0.1)',
  },
  copyBtnText: {
    fontFamily: fonts.semiBold,
    fontSize: scaleFont(12),
    color: colors.green,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 36,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  modalTitle: {
    fontFamily: fonts.h6,
    fontSize: scaleFont(17),
    fontWeight: '700',
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    marginBottom: 10,
  },
  optionTitle: {
    fontFamily: fonts.bold,
    fontSize: scaleFont(14),
  },
  optionSub: {
    fontFamily: fonts.regular,
    fontSize: scaleFont(12),
    marginTop: 2,
  },
  modalOverlayCenter: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  warningDialog: {
    width: '100%',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
  },
  warningIconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  warningDialogTitle: {
    fontFamily: fonts.h6,
    fontSize: scaleFont(18),
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 8,
  },
  warningDialogSub: {
    fontFamily: fonts.regular,
    fontSize: scaleFont(13),
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 20,
  },
  warningBtnColumn: {
    width: '100%',
  },
});
