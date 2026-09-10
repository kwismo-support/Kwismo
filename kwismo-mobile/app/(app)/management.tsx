import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
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
import { Icon } from '../../src/shared/ui/Icon';
import { HeaderBar } from '../../src/shared/components/HeaderBar';
import { TabBar } from '../../src/shared/components/TabBar';
import { Skeleton, SkeletonCircle, SkeletonLoader } from '../../src/shared/ui/Skeleton';
import { CountryFlag } from '../../src/shared/components/CountryFlag';
import { CountryPickerModal, CountryItem } from '../../src/shared/components/CountryPickerModal';
import { useAppTheme } from '../../src/shared/hooks/useAppTheme';
import { toast } from '../../src/shared/store/toastStore';
import { colors, fonts } from '../../src/styles/tokens';
import { scaleFont } from '../../src/shared/lib/responsive';

import { UserSimNumber, MOCK_SIM_NUMBERS } from '../../src/shared/mock/simNumbersMock';

export default function ManagementScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { isDark, colors: themeColors } = useAppTheme();

  const [loading, setLoading] = useState(true);
  const [numbers, setNumbers] = useState<UserSimNumber[]>(MOCK_SIM_NUMBERS);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(t);
  }, []);

  // États pour l'ajout / modification d'un numéro
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

  // États pour la validation OTP par SMS (Plein écran)
  const [fullScreenOtpVisible, setFullScreenOtpVisible] = useState(false);
  const [otpTargetNumber, setOtpTargetNumber] = useState<UserSimNumber | null>(null);
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);
  const [otpTimer, setOtpTimer] = useState(60);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);

  // Modales d'actions
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [restoreSecurityModalVisible, setRestoreSecurityModalVisible] = useState(false);
  const [targetActionNumber, setTargetActionNumber] = useState<UserSimNumber | null>(null);

  // Compte à rebours OTP
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

  // Ouverture du formulaire d'ajout
  const handleOpenAddNumber = () => {
    setEditingNumberId(null);
    setNewPhoneNumber('');
    setPhoneError('');
    setFullScreenAddVisible(true);
  };

  // Ouverture du formulaire de modification
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

  // Envoi de la saisie (Ajout ou Modification)
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

      // Ouvrir immédiatement l'écran OTP SMS pour valider ce numéro
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

  // Déclarer compromis -> propose d'alerter les contacts
  const handleDeclareCompromised = (item: UserSimNumber) => {
    setNumbers((prev) =>
      prev.map((n) => (n.id === item.id ? { ...n, status: 'compromised' } : n))
    );
    toast.error(`Ligne ${item.phone} déclarée compromise`);
    router.push('/(app)/alert-whatsapp');
  };

  // Rétablir la sécurité (désactiver l'état compromis)
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
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <StatusBar style="light" />

      {/* Header global unifié : Titre à gauche, Actions à droite */}
      <HeaderBar title={t('common.management', 'Gestion')} showBack={false} />

      <ScrollView
        contentContainerStyle={[
          styles.scrollBody,
          { paddingBottom: insets.bottom + 110 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* En-tête : Titre et description des numéros */}
        <View style={styles.topSectionRow}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.sectionTitle, { color: themeColors.textPrimary }]}>
              {t('management.title', 'Mes numéros')} ({numbers.length})
            </Text>
            <Text style={[styles.sectionSub, { color: themeColors.textSecondary }]}>
              {t('management.subtitle', 'Gérez et sécurisez vos cartes SIM et numéros associés')}
            </Text>
          </View>
        </View>

        {/* Grille : Exactement 2 numéros par ligne pour un affichage dense et sans scroll */}
        {loading ? (
          <SkeletonLoader>
            <View style={styles.gridContainer}>
              <View style={[styles.gridCard, { backgroundColor: themeColors.cardBg, borderColor: themeColors.inputBorder }]}>
                <Skeleton width={70} height={16} borderRadius={4} />
                <Skeleton width={110} height={20} borderRadius={6} style={{ marginVertical: 10 }} />
                <Skeleton width={80} height={14} borderRadius={4} />
              </View>
              <View style={[styles.gridCard, { backgroundColor: themeColors.cardBg, borderColor: themeColors.inputBorder }]}>
                <Skeleton width={70} height={16} borderRadius={4} />
                <Skeleton width={110} height={20} borderRadius={6} style={{ marginVertical: 10 }} />
                <Skeleton width={80} height={14} borderRadius={4} />
              </View>
            </View>
          </SkeletonLoader>
        ) : (
          <View style={styles.gridContainer}>
            {numbers.map((item) => {
              const isVerified = item.status === 'verified';
              const isPending = item.status === 'pending';
              const isCompromised = item.status === 'compromised';

            return (
              <View
                key={item.id}
                style={[
                  styles.gridCard,
                  {
                    backgroundColor: themeColors.cardBg,
                    borderColor: isCompromised ? '#EF4444' : themeColors.inputBorder,
                  },
                ]}
              >
                {/* Ligne haute : Drapeau + Opérateur + Action Modifier */}
                <View style={styles.cardHeaderRow}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <CountryFlag countryCode={item.countryCode} size={20} style={{ marginRight: 6 }} />
                    <Text style={[styles.operatorText, { color: themeColors.textPrimary }]}>
                      {item.operator}
                    </Text>
                  </View>

                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => handleOpenEditNumber(item)}
                    style={styles.cardMenuBtn}
                  >
                    <Icon name="solar:pen-new-square-linear" color={themeColors.textSecondary} size={16} />
                  </TouchableOpacity>
                </View>

                {/* Numéro formaté */}
                <Text
                  numberOfLines={1}
                  style={[styles.cardNumberText, { color: themeColors.textPrimary }]}
                >
                  {item.phone}
                </Text>

                {/* Badge de statut compact */}
                <View style={styles.badgeRow}>
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
                        ? colors.green
                        : isPending
                        ? colors.orange
                        : '#EF4444'
                    }
                    style={{ marginRight: 4 }}
                  />
                  <Text
                    style={[
                      styles.statusText,
                      {
                        color: isVerified
                          ? colors.green
                          : isPending
                          ? colors.orange
                          : '#EF4444',
                      },
                    ]}
                  >
                    {isVerified
                      ? t('common.statusVerified', 'Vérifié')
                      : isPending
                      ? t('common.statusPending', 'En attente')
                      : t('common.statusCompromised', 'Compromis')}
                  </Text>
                </View>

                {/* Actions contextuelles selon l'état */}
                <View style={[styles.bottomActionsRow, { borderTopColor: themeColors.divider }]}>
                  {isPending && (
                    <TouchableOpacity
                      activeOpacity={0.75}
                      onPress={() => {
                        setOtpTargetNumber(item);
                        setOtpCode(['', '', '', '', '', '']);
                        setOtpTimer(60);
                        setFullScreenOtpVisible(true);
                      }}
                      style={[styles.smallActionBtn, { backgroundColor: colors.orange }]}
                    >
                      <Text style={styles.smallActionBtnText}>{t('common.validate', 'Valider OTP')}</Text>
                    </TouchableOpacity>
                  )}

                  {isVerified && (
                    <TouchableOpacity
                      activeOpacity={0.75}
                      onPress={() => handleDeclareCompromised(item)}
                      style={[styles.smallActionOutlineBtn, { borderColor: '#EF4444' }]}
                    >
                      <Text style={[styles.smallActionOutlineBtnText, { color: '#EF4444' }]}>
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
                      style={[styles.smallActionBtn, { backgroundColor: colors.green }]}
                    >
                      <Text style={styles.smallActionBtnText}>{t('common.reset', 'Rétablir')}</Text>
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => {
                      setTargetActionNumber(item);
                      setDeleteModalVisible(true);
                    }}
                    style={styles.cardDeleteBtn}
                  >
                    <Icon name="solar:trash-bin-trash-linear" color={themeColors.disabledText} size={16} />
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </View>
      )}

        {/* Section Actions de sécurité : Icônes pleines sans fond */}
        <Text style={[styles.sectionTitle, { color: themeColors.textPrimary, marginTop: 28 }]}>
          Actions de sécurité
        </Text>

        <View style={styles.securityActionsColumn}>
          {/* Signalement de fraude */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push('/(app)/report')}
            style={[styles.cleanActionCard, { backgroundColor: themeColors.cardBg, borderColor: themeColors.inputBorder }]}
          >
            <Icon name="heroicons:signal-16-solid" color={colors.orange} size={24} style={{ marginRight: 14 }} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.cleanActionTitle, { color: themeColors.textPrimary }]}>
                Signaler une fraude
              </Text>
              <Text style={[styles.cleanActionSub, { color: themeColors.textSecondary }]}>
                Signalez un numéro suspect vous ayant contacté
              </Text>
            </View>
            <Icon name="solar:alt-arrow-right-linear" color={themeColors.textSecondary} size={18} />
          </TouchableOpacity>

          {/* Répertoire & Insignes de confiance */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push('/(app)/contacts')}
            style={[styles.cleanActionCard, { backgroundColor: themeColors.cardBg, borderColor: themeColors.inputBorder }]}
          >
            <Icon name="solar:users-group-two-rounded-bold" color={colors.green} size={24} style={{ marginRight: 14 }} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.cleanActionTitle, { color: themeColors.textPrimary }]}>
                Répertoire de contacts
              </Text>
              <Text style={[styles.cleanActionSub, { color: themeColors.textSecondary }]}>
                Consultez vos contacts et leurs insignes de confiance
              </Text>
            </View>
            <Icon name="solar:alt-arrow-right-linear" color={themeColors.textSecondary} size={18} />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Bouton flottant (FAB) d'ajout de numéro style WhatsApp */}
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={handleOpenAddNumber}
        style={[
          styles.fabButton,
          {
            bottom: Math.max(insets.bottom + 72, 84),
            backgroundColor: colors.green,
          },
        ]}
      >
        <Icon name="solar:add-circle-bold" color={colors.white} size={28} />
      </TouchableOpacity>

      {/* Navigation TabBar basse */}
      <TabBar activeTab="management" />

      {/* ========================================================================= */}
      {/* FORMULAIRE PLEIN ÉCRAN : AJOUT / MODIFICATION D'UN NUMÉRO */}
      {/* ========================================================================= */}
      <Modal visible={fullScreenAddVisible} animationType="slide">
        <View style={[styles.fullScreenContainer, { backgroundColor: colors.green }]}>
          <StatusBar style="light" />

          {/* Header plein écran avec retour */}
          <HeaderBar
            title={editingNumberId ? 'Modifier le numéro' : 'Ajouter un numéro'}
            showBack={true}
            onBack={() => setFullScreenAddVisible(false)}
          />

          <View style={[styles.fullScreenContentCard, { backgroundColor: themeColors.background }]}>
            <Text style={[styles.fullScreenFormTitle, { color: themeColors.textPrimary }]}>
              Rattachement d'une ligne SIM
            </Text>
            <Text style={[styles.fullScreenFormSub, { color: themeColors.textSecondary }]}>
              Un code de validation OTP par SMS sera envoyé sur ce numéro pour certifier votre détention de la ligne.
            </Text>

            {/* Input avec sélecteur de pays */}
            <View
              style={[
                styles.phoneInputRow,
                {
                  backgroundColor: themeColors.inputBg,
                  borderColor: phoneError ? '#EF4444' : themeColors.inputBorder,
                },
              ]}
            >
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setCountryModalVisible(true)}
                style={styles.countryTrigger}
              >
                <CountryFlag countryCode={selectedCountry.code} size={22} style={{ marginRight: 6 }} />
                <Text style={[styles.countryTriggerCode, { color: themeColors.textPrimary }]}>
                  {selectedCountry.callingCode}
                </Text>
                <Icon name="solar:alt-arrow-down-linear" color={themeColors.textSecondary} size={16} />
              </TouchableOpacity>

              <TextInput
                style={[
                  styles.phoneInputField,
                  { color: themeColors.textPrimary },
                  Platform.OS === 'web' ? ({ outline: 'none' } as any) : {},
                ]}
                placeholder="6 98 44 43 88"
                placeholderTextColor={themeColors.inputPlaceholder}
                keyboardType="phone-pad"
                value={newPhoneNumber}
                onChangeText={handlePhoneChange}
                autoFocus
              />
            </View>

            {phoneError ? (
              <Text style={styles.errorText}>{phoneError}</Text>
            ) : null}

            <TouchableOpacity
              activeOpacity={0.85}
              disabled={!newPhoneNumber.trim() || isSubmittingPhone}
              onPress={handleSavePhone}
              style={[
                styles.primarySubmitBtn,
                {
                  backgroundColor: newPhoneNumber.trim()
                    ? colors.green
                    : themeColors.disabled,
                },
              ]}
            >
              {isSubmittingPhone ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text style={styles.primarySubmitBtnText}>
                  {editingNumberId ? 'Valider et envoyer OTP' : 'Continuer'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ========================================================================= */}
      {/* FORMULAIRE PLEIN ÉCRAN : VALIDATION OTP PAR SMS */}
      {/* ========================================================================= */}
      <Modal visible={fullScreenOtpVisible} animationType="slide">
        <View style={[styles.fullScreenContainer, { backgroundColor: colors.green }]}>
          <StatusBar style="light" />

          <HeaderBar
            title="Validation OTP"
            showBack={true}
            onBack={() => setFullScreenOtpVisible(false)}
          />

          <View style={[styles.fullScreenContentCard, { backgroundColor: themeColors.background }]}>
            <Text style={[styles.fullScreenFormTitle, { color: themeColors.textPrimary }]}>
              Vérifiez votre numéro
            </Text>
            <Text style={[styles.fullScreenFormSub, { color: themeColors.textSecondary }]}>
              Saisissez le code à 6 chiffres envoyé par SMS au{' '}
              <Text style={{ fontWeight: '700', color: themeColors.textPrimary }}>
                {otpTargetNumber?.callingCode} {otpTargetNumber?.phone}
              </Text>
            </Text>

            {/* Cases OTP contenues strictement dans la largeur de l'écran */}
            <View style={styles.otpBoxesContainer}>
              {otpCode.map((digit, idx) => (
                <TextInput
                  key={idx}
                  style={[
                    styles.otpBoxResponsive,
                    {
                      backgroundColor: themeColors.inputBg,
                      borderColor: digit ? colors.green : themeColors.inputBorder,
                      color: themeColors.textPrimary,
                    },
                    Platform.OS === 'web' ? ({ outline: 'none' } as any) : {},
                  ]}
                  maxLength={1}
                  keyboardType="number-pad"
                  value={digit}
                  onChangeText={(txt) => handleOtpInput(txt, idx)}
                  autoFocus={idx === 0}
                />
              ))}
            </View>

            {/* Minuteur & Renvoi */}
            <View style={styles.resendRow}>
              {otpTimer > 0 ? (
                <Text style={[styles.timerText, { color: themeColors.textSecondary }]}>
                  Renvoyer le code dans {otpTimer}s
                </Text>
              ) : (
                <TouchableOpacity onPress={() => setOtpTimer(60)}>
                  <Text style={[styles.resendBtnText, { color: colors.green }]}>
                    Renvoyer un nouveau code
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            <TouchableOpacity
              activeOpacity={0.85}
              disabled={isVerifyingOtp || otpCode.some((c) => c === '')}
              onPress={() => handleConfirmOtp()}
              style={[
                styles.primarySubmitBtn,
                {
                  backgroundColor: otpCode.every((c) => c !== '')
                    ? colors.green
                    : themeColors.disabled,
                },
              ]}
            >
              {isVerifyingOtp ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text style={styles.primarySubmitBtnText}>Confirmer le numéro</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ========================================================================= */}
      {/* MODALE DE SÉCURITÉ : Rétablir un numéro compromis */}
      {/* ========================================================================= */}
      <Modal visible={restoreSecurityModalVisible} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={[styles.confirmCard, { backgroundColor: themeColors.cardBg }]}>
            <Icon name="solar:shield-check-bold" color={colors.green} size={42} style={{ alignSelf: 'center', marginBottom: 12 }} />
            <Text style={[styles.confirmTitle, { color: themeColors.textPrimary }]}>
              Rétablir la sécurité de la ligne ?
            </Text>
            <Text style={[styles.confirmSub, { color: themeColors.textSecondary }]}>
              Confirmez que vous avez repris le contrôle total de la ligne {targetActionNumber?.callingCode} {targetActionNumber?.phone}.
            </Text>

            <View style={styles.confirmButtonsRow}>
              <TouchableOpacity
                onPress={() => setRestoreSecurityModalVisible(false)}
                style={[styles.cancelBtn, { borderColor: themeColors.inputBorder }]}
              >
                <Text style={[styles.cancelBtnText, { color: themeColors.textPrimary }]}>Annuler</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleRestoreSecurity}
                style={[styles.confirmSaveBtn, { backgroundColor: colors.green }]}
              >
                <Text style={styles.confirmSaveBtnText}>Rétablir</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* MODALE DE CONFIRMATION DE SUPPRESSION */}
      <Modal visible={deleteModalVisible} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={[styles.confirmCard, { backgroundColor: themeColors.cardBg }]}>
            <Icon name="solar:trash-bin-trash-bold" color="#EF4444" size={40} style={{ alignSelf: 'center', marginBottom: 12 }} />
            <Text style={[styles.confirmTitle, { color: themeColors.textPrimary }]}>
              Supprimer cette ligne ?
            </Text>
            <Text style={[styles.confirmSub, { color: themeColors.textSecondary }]}>
              Le numéro {targetActionNumber?.callingCode} {targetActionNumber?.phone} ne sera plus surveillé au titre de votre compte.
            </Text>

            <View style={styles.confirmButtonsRow}>
              <TouchableOpacity
                onPress={() => setDeleteModalVisible(false)}
                style={[styles.cancelBtn, { borderColor: themeColors.inputBorder }]}
              >
                <Text style={[styles.cancelBtnText, { color: themeColors.textPrimary }]}>Annuler</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleConfirmDelete}
                style={[styles.confirmDeleteBtn, { backgroundColor: '#EF4444' }]}
              >
                <Text style={styles.confirmDeleteBtnText}>Supprimer</Text>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollBody: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  topSectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sectionTitle: {
    fontFamily: fonts.headlineBold,
    fontSize: scaleFont(18),
    fontWeight: '800',
  },
  sectionSub: {
    fontFamily: fonts.regular,
    fontSize: scaleFont(12),
    marginTop: 2,
  },
  addTopBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  addTopBtnText: {
    fontFamily: fonts.headlineBold,
    fontSize: scaleFont(13),
    fontWeight: '700',
    color: colors.white,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 12,
  },
  gridCard: {
    width: '48.5%',
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  operatorText: {
    fontFamily: fonts.bold,
    fontSize: scaleFont(12),
    fontWeight: '700',
  },
  cardMenuBtn: {
    padding: 2,
  },
  cardNumberText: {
    fontFamily: fonts.headlineBold,
    fontSize: scaleFont(14),
    fontWeight: '700',
    marginBottom: 8,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusText: {
    fontFamily: fonts.bold,
    fontSize: scaleFont(11),
    fontWeight: '700',
  },
  bottomActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
  },
  smallActionBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  smallActionBtnText: {
    fontFamily: fonts.bold,
    fontSize: scaleFont(10),
    fontWeight: '700',
    color: colors.white,
  },
  smallActionOutlineBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  smallActionOutlineBtnText: {
    fontFamily: fonts.bold,
    fontSize: scaleFont(10),
    fontWeight: '700',
  },
  cardDeleteBtn: {
    padding: 4,
  },
  securityActionsColumn: {
    gap: 10,
    marginTop: 12,
  },
  cleanActionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
  },
  cleanActionTitle: {
    fontFamily: fonts.headlineBold,
    fontSize: scaleFont(14),
    fontWeight: '700',
  },
  cleanActionSub: {
    fontFamily: fonts.regular,
    fontSize: scaleFont(12),
    marginTop: 2,
  },
  fullScreenContainer: {
    flex: 1,
  },
  fullScreenContentCard: {
    flex: 1,
    borderTopLeftRadius: 36,
    borderTopRightRadius: 0,
    padding: 24,
  },
  fullScreenFormTitle: {
    fontFamily: fonts.headlineBold,
    fontSize: scaleFont(20),
    fontWeight: '800',
    marginBottom: 6,
  },
  fullScreenFormSub: {
    fontFamily: fonts.regular,
    fontSize: scaleFont(13),
    lineHeight: 20,
    marginBottom: 28,
  },
  phoneInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 54,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 12,
  },
  countryTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 10,
    borderRightWidth: 1,
    borderRightColor: '#E2E8F0',
  },
  countryTriggerCode: {
    fontFamily: fonts.bold,
    fontSize: scaleFont(14),
    marginRight: 4,
  },
  phoneInputField: {
    flex: 1,
    paddingHorizontal: 12,
    fontFamily: fonts.semiBold,
    fontSize: scaleFont(15),
  },
  errorText: {
    fontFamily: fonts.medium,
    fontSize: scaleFont(12),
    color: '#EF4444',
    marginTop: 6,
    marginLeft: 4,
  },
  primarySubmitBtn: {
    height: 54,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 32,
  },
  primarySubmitBtnText: {
    fontFamily: fonts.headlineBold,
    fontSize: scaleFont(15),
    fontWeight: '700',
    color: colors.white,
  },
  otpBoxesContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginVertical: 24,
    width: '100%',
  },
  otpBoxResponsive: {
    width: 44,
    height: 52,
    borderRadius: 12,
    borderWidth: 1.5,
    textAlign: 'center',
    fontFamily: fonts.headlineBold,
    fontSize: scaleFont(20),
    fontWeight: '800',
  },
  resendRow: {
    alignItems: 'center',
    marginBottom: 10,
  },
  timerText: {
    fontFamily: fonts.medium,
    fontSize: scaleFont(13),
  },
  resendBtnText: {
    fontFamily: fonts.bold,
    fontSize: scaleFont(13),
    fontWeight: '700',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmCard: {
    marginHorizontal: 24,
    borderRadius: 24,
    padding: 24,
    width: '88%',
  },
  confirmTitle: {
    fontFamily: fonts.headlineBold,
    fontSize: scaleFont(18),
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 8,
  },
  confirmSub: {
    fontFamily: fonts.regular,
    fontSize: scaleFont(13),
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 20,
  },
  confirmButtonsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    fontFamily: fonts.bold,
    fontSize: scaleFont(14),
  },
  confirmSaveBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmSaveBtnText: {
    fontFamily: fonts.bold,
    fontSize: scaleFont(14),
    color: colors.white,
  },
  confirmDeleteBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmDeleteBtnText: {
    fontFamily: fonts.bold,
    fontSize: scaleFont(14),
    color: colors.white,
  },
  fabButton: {
    position: 'absolute',
    right: 20,
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
    zIndex: 99,
  },
});
