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
import { CountryFlag } from '../../src/shared/components/CountryFlag';
import { CountryPickerModal, CountryItem } from '../../src/shared/components/CountryPickerModal';
import { useAppTheme } from '../../src/shared/hooks/useAppTheme';
import { toast } from '../../src/shared/store/toastStore';
import { colors, fonts } from '../../src/styles/tokens';
import { scaleFont } from '../../src/shared/lib/responsive';

// Définition d'un numéro rattaché au compte multi-SIM
export interface UserSimNumber {
  id: string;
  countryCode: string;
  callingCode: string;
  phone: string;
  operator: 'Orange' | 'MTN' | 'Camtel' | 'Autre';
  status: 'verified' | 'pending' | 'compromised';
  addedDate: string;
}

export default function ManagementScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { isDark, colors: themeColors } = useAppTheme();

  // Liste des numéros de l'utilisateur
  const [numbers, setNumbers] = useState<UserSimNumber[]>([
    {
      id: 'num-1',
      countryCode: 'CM',
      callingCode: '+237',
      phone: '6 98 44 43 88',
      operator: 'Orange',
      status: 'verified',
      addedDate: '12 Août 2026',
    },
    {
      id: 'num-2',
      countryCode: 'CM',
      callingCode: '+237',
      phone: '6 77 12 34 56',
      operator: 'MTN',
      status: 'pending',
      addedDate: '28 Août 2026',
    },
  ]);

  // États pour l'ajout d'un nouveau numéro
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [countryModalVisible, setCountryModalVisible] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<CountryItem>({
    code: 'CM',
    name: 'Cameroun',
    callingCode: '+237',
  });
  const [newPhoneNumber, setNewPhoneNumber] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [isSubmittingPhone, setIsSubmittingPhone] = useState(false);

  // États pour la validation OTP par SMS
  const [otpModalVisible, setOtpModalVisible] = useState(false);
  const [otpTargetNumber, setOtpTargetNumber] = useState<UserSimNumber | null>(null);
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);
  const [otpTimer, setOtpTimer] = useState(60);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);

  // États pour la confirmation de suppression ou déclaration de compromission
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [targetActionNumber, setTargetActionNumber] = useState<UserSimNumber | null>(null);

  // Compte à rebours OTP
  useEffect(() => {
    let interval: any;
    if (otpModalVisible && otpTimer > 0) {
      interval = setInterval(() => setOtpTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [otpModalVisible, otpTimer]);

  // Détection de l'opérateur local (Cameroun & générique)
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

  // Gestion du formatage progressif
  const handlePhoneChange = (text: string) => {
    const cleanDigits = text.replace(/[^0-9]/g, '');
    const formatter = new AsYouType(selectedCountry.code as any);
    const formatted = formatter.input(cleanDigits);
    setNewPhoneNumber(formatted);

    if (phoneError) setPhoneError('');
  };

  // Validation et envoi OTP pour rattacher un numéro
  const handleStartAddNumber = () => {
    const fullNumber = `${selectedCountry.callingCode}${newPhoneNumber.replace(/\s+/g, '')}`;
    const isValid = isValidPhoneNumber(fullNumber, selectedCountry.code as any);

    if (!isValid) {
      setPhoneError(`Numéro invalide pour ${selectedCountry.name}`);
      return;
    }

    // Contrôle d'unicité locale
    const alreadyExists = numbers.some(
      (n) => n.phone.replace(/\s+/g, '') === newPhoneNumber.replace(/\s+/g, '')
    );
    if (alreadyExists) {
      setPhoneError('Ce numéro est déjà rattaché à votre compte.');
      return;
    }

    setIsSubmittingPhone(true);
    setTimeout(() => {
      setIsSubmittingPhone(false);
      const newSim: UserSimNumber = {
        id: `num-${Date.now()}`,
        countryCode: selectedCountry.code,
        callingCode: selectedCountry.callingCode,
        phone: newPhoneNumber,
        operator: detectOperator(newPhoneNumber),
        status: 'pending',
        addedDate: "Aujourd'hui",
      };

      setNumbers((prev) => [...prev, newSim]);
      setAddModalVisible(false);
      setNewPhoneNumber('');

      // Ouvrir immédiatement l'écran OTP SMS pour ce numéro
      setOtpTargetNumber(newSim);
      setOtpCode(['', '', '', '', '', '']);
      setOtpTimer(60);
      setOtpModalVisible(true);
      toast.success('Code OTP envoyé par SMS');
    }, 800);
  };

  // Saisie du code OTP
  const handleOtpInput = (text: string, index: number) => {
    const digit = text.slice(-1);
    const newCode = [...otpCode];
    newCode[index] = digit;
    setOtpCode(newCode);

    // Auto-soumission si les 6 cases sont remplies
    if (digit && index === 5 && newCode.every((c) => c !== '')) {
      handleConfirmOtp(newCode.join(''));
    }
  };

  // Validation définitive de l'OTP SMS
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
      setOtpModalVisible(false);
      toast.success('Numéro vérifié et protégé avec succès !');
    }, 900);
  };

  // Déclarer un numéro compromis
  const handleDeclareCompromised = (item: UserSimNumber) => {
    setNumbers((prev) =>
      prev.map((n) => (n.id === item.id ? { ...n, status: 'compromised' } : n))
    );
    toast.error(`La ligne ${item.phone} a été déclarée compromise.`);
  };

  // Suppression d'un numéro
  const handleConfirmDelete = () => {
    if (!targetActionNumber) return;
    setNumbers((prev) => prev.filter((n) => n.id !== targetActionNumber.id));
    setDeleteModalVisible(false);
    toast.info('Le numéro a été retiré de votre compte.');
  };

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <StatusBar style="light" />

      {/* Header global unifié de page principale : Titre à gauche, Actions à droite */}
      <HeaderBar title={t('common.management', 'Gestion')} showBack={false} />

      <ScrollView
        contentContainerStyle={[
          styles.scrollBody,
          { paddingBottom: insets.bottom + 110 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* En-tête de section : Mes numéros (Gestion Multi-SIM) */}
        <View style={styles.sectionHeaderRow}>
          <View>
            <Text style={[styles.sectionTitle, { color: themeColors.textPrimary }]}>
              Mes numéros
            </Text>
            <Text style={[styles.sectionSub, { color: themeColors.textSecondary }]}>
              Rattachez et sécurisez toutes vos cartes SIM
            </Text>
          </View>
          <View style={styles.countBadge}>
            <Text style={styles.countBadgeText}>{numbers.length}</Text>
          </View>
        </View>

        {/* Liste des numéros du compte */}
        <View style={styles.numbersList}>
          {numbers.map((item) => {
            const isVerified = item.status === 'verified';
            const isPending = item.status === 'pending';
            const isCompromised = item.status === 'compromised';

            return (
              <View
                key={item.id}
                style={[
                  styles.numberCard,
                  {
                    backgroundColor: themeColors.cardBg,
                    borderColor: isCompromised
                      ? '#EF4444'
                      : themeColors.inputBorder,
                  },
                ]}
              >
                {/* Ligne principale du numéro */}
                <View style={styles.cardTopRow}>
                  <View style={styles.cardPhoneInfo}>
                    <CountryFlag countryCode={item.countryCode} size={24} style={{ marginRight: 8 }} />
                    <View>
                      <Text style={[styles.phoneNumberText, { color: themeColors.textPrimary }]}>
                        {item.callingCode} {item.phone}
                      </Text>
                      <View style={styles.metaRow}>
                        <View style={styles.operatorBadge}>
                          <Text style={styles.operatorBadgeText}>{item.operator}</Text>
                        </View>
                        <Text style={[styles.addedDateText, { color: themeColors.textSecondary }]}>
                          Ajouté le {item.addedDate}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Badge de statut */}
                  <View
                    style={[
                      styles.statusBadge,
                      isVerified && styles.statusBadgeVerified,
                      isPending && styles.statusBadgePending,
                      isCompromised && styles.statusBadgeCompromised,
                    ]}
                  >
                    <Icon
                      name={
                        isVerified
                          ? 'solar:shield-check-bold'
                          : isPending
                          ? 'solar:clock-circle-bold'
                          : 'solar:danger-triangle-bold'
                      }
                      size={14}
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
                        styles.statusBadgeLabel,
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
                        ? 'Vérifié'
                        : isPending
                        ? 'En attente'
                        : 'Compromis'}
                    </Text>
                  </View>
                </View>

                {/* Actions sur la ligne */}
                <View style={[styles.cardActionsRow, { borderTopColor: themeColors.divider }]}>
                  {isPending && (
                    <TouchableOpacity
                      activeOpacity={0.75}
                      onPress={() => {
                        setOtpTargetNumber(item);
                        setOtpCode(['', '', '', '', '', '']);
                        setOtpTimer(60);
                        setOtpModalVisible(true);
                      }}
                      style={[styles.actionChip, { backgroundColor: colors.orange }]}
                    >
                      <Icon name="solar:check-circle-bold" color={colors.white} size={14} style={{ marginRight: 4 }} />
                      <Text style={styles.actionChipText}>Finaliser la vérification</Text>
                    </TouchableOpacity>
                  )}

                  {isVerified && (
                    <TouchableOpacity
                      activeOpacity={0.75}
                      onPress={() => handleDeclareCompromised(item)}
                      style={[styles.actionChipOutline, { borderColor: '#EF4444' }]}
                    >
                      <Icon name="solar:danger-triangle-linear" color="#EF4444" size={14} style={{ marginRight: 4 }} />
                      <Text style={[styles.actionChipOutlineText, { color: '#EF4444' }]}>
                        Déclarer compromis
                      </Text>
                    </TouchableOpacity>
                  )}

                  {isCompromised && (
                    <TouchableOpacity
                      activeOpacity={0.75}
                      onPress={() => router.push('/(app)/alert-whatsapp')}
                      style={[styles.actionChip, { backgroundColor: '#25D366' }]}
                    >
                      <Icon name="ic:baseline-whatsapp" color={colors.white} size={16} style={{ marginRight: 4 }} />
                      <Text style={styles.actionChipText}>Alerter mes contacts</Text>
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => {
                      setTargetActionNumber(item);
                      setDeleteModalVisible(true);
                    }}
                    style={styles.deleteIconBtn}
                  >
                    <Icon name="solar:trash-bin-trash-linear" color={themeColors.textSecondary} size={18} />
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </View>

        {/* Bouton principal : Ajouter un numéro */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => setAddModalVisible(true)}
          style={[styles.addNumberBtn, { backgroundColor: colors.green }]}
        >
          <Icon name="solar:add-circle-bold" color={colors.white} size={22} style={{ marginRight: 8 }} />
          <Text style={styles.addNumberBtnText}>Ajouter un numéro</Text>
        </TouchableOpacity>

        {/* Section Sécurité & Services complémentaires du cahier des charges */}
        <Text style={[styles.sectionTitle, { color: themeColors.textPrimary, marginTop: 32 }]}>
          Actions de sécurité
        </Text>

        <View style={styles.servicesGrid}>
          {/* Signalement de fraude */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push('/(app)/report')}
            style={[styles.serviceCard, { backgroundColor: themeColors.cardBg, borderColor: themeColors.inputBorder }]}
          >
            <View style={[styles.serviceIconWrap, { backgroundColor: '#FEF3C7' }]}>
              <Icon name="heroicons:signal-16-solid" color={colors.orange} size={24} />
            </View>
            <Text style={[styles.serviceTitle, { color: themeColors.textPrimary }]}>
              Signaler une fraude
            </Text>
            <Text style={[styles.serviceDesc, { color: themeColors.textSecondary }]}>
              Déclarez un numéro suspect vous ayant contacté
            </Text>
          </TouchableOpacity>

          {/* Alerte WhatsApp */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push('/(app)/alert-whatsapp')}
            style={[styles.serviceCard, { backgroundColor: themeColors.cardBg, borderColor: themeColors.inputBorder }]}
          >
            <View style={[styles.serviceIconWrap, { backgroundColor: '#DCFCE7' }]}>
              <Icon name="ic:baseline-whatsapp" color="#16A34A" size={24} />
            </View>
            <Text style={[styles.serviceTitle, { color: themeColors.textPrimary }]}>
              Alerte WhatsApp
            </Text>
            <Text style={[styles.serviceDesc, { color: themeColors.textSecondary }]}>
              Prévenez vos proches en cas de ligne piratée
            </Text>
          </TouchableOpacity>
        </View>

        {/* Accès à la liste des contacts du carnet d'adresses (§9.4) */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => router.push('/(app)/contacts')}
          style={[
            styles.contactsBanner,
            { backgroundColor: themeColors.cardBg, borderColor: themeColors.inputBorder },
          ]}
        >
          <View style={styles.contactsBannerLeft}>
            <Icon name="solar:users-group-two-rounded-bold" color={colors.green} size={24} style={{ marginRight: 12 }} />
            <View>
              <Text style={[styles.contactsBannerTitle, { color: themeColors.textPrimary }]}>
                Répertoire & Insignes de confiance
              </Text>
              <Text style={[styles.contactsBannerSub, { color: themeColors.textSecondary }]}>
                Consultez le statut de vos contacts enregistrés
              </Text>
            </View>
          </View>
          <Icon name="solar:alt-arrow-right-linear" color={themeColors.textSecondary} size={20} />
        </TouchableOpacity>
      </ScrollView>

      {/* TabBar en bas sur les 4 pages principales */}
      <TabBar activeTab="management" />

      {/* ========================================================================= */}
      {/* MODALE D'AJOUT D'UN NUMÉRO */}
      {/* ========================================================================= */}
      <Modal visible={addModalVisible} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalSheet, { backgroundColor: themeColors.cardBg }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: themeColors.textPrimary }]}>
                Ajouter un numéro à votre compte
              </Text>
              <TouchableOpacity onPress={() => setAddModalVisible(false)}>
                <Icon name="solar:close-circle-bold" color={themeColors.textSecondary} size={26} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.modalHelpText, { color: themeColors.textSecondary }]}>
              Chaque numéro rattaché est protégé et surveillé par Kwismo après validation par OTP SMS.
            </Text>

            {/* Champ de saisie avec sélecteur de pays */}
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
              onPress={handleStartAddNumber}
              style={[
                styles.submitAddBtn,
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
                <Text style={styles.submitAddBtnText}>Continuer</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ========================================================================= */}
      {/* MODALE DE VÉRIFICATION OTP SMS (§8.3) */}
      {/* ========================================================================= */}
      <Modal visible={otpModalVisible} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalSheet, { backgroundColor: themeColors.cardBg }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: themeColors.textPrimary }]}>
                Vérifiez votre numéro
              </Text>
              <TouchableOpacity onPress={() => setOtpModalVisible(false)}>
                <Icon name="solar:close-circle-bold" color={themeColors.textSecondary} size={26} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.modalHelpText, { color: themeColors.textSecondary }]}>
              Saisissez le code à 6 chiffres envoyé par SMS au{' '}
              <Text style={{ fontWeight: '700', color: themeColors.textPrimary }}>
                {otpTargetNumber?.callingCode} {otpTargetNumber?.phone}
              </Text>
            </Text>

            {/* Cases OTP */}
            <View style={styles.otpBoxesRow}>
              {otpCode.map((digit, idx) => (
                <TextInput
                  key={idx}
                  style={[
                    styles.otpBox,
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
                styles.submitAddBtn,
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
                <Text style={styles.submitAddBtnText}>Confirmer le numéro</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ========================================================================= */}
      {/* MODALE DE CONFIRMATION DE SUPPRESSION */}
      {/* ========================================================================= */}
      <Modal visible={deleteModalVisible} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={[styles.confirmCard, { backgroundColor: themeColors.cardBg }]}>
            <Icon name="solar:trash-bin-trash-bold" color="#EF4444" size={40} style={{ alignSelf: 'center', marginBottom: 12 }} />
            <Text style={[styles.confirmTitle, { color: themeColors.textPrimary }]}>
              Supprimer cette ligne ?
            </Text>
            <Text style={[styles.confirmSub, { color: themeColors.textSecondary }]}>
              Le numéro {targetActionNumber?.callingCode} {targetActionNumber?.phone} ne sera plus surveillé ni protégé au titre de votre compte Kwismo.
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

      {/* Sélecteur de pays */}
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
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  sectionTitle: {
    fontFamily: fonts.headlineBold,
    fontSize: scaleFont(20),
    fontWeight: '800',
  },
  sectionSub: {
    fontFamily: fonts.regular,
    fontSize: scaleFont(13),
    marginTop: 2,
  },
  countBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#E6F7F0',
  },
  countBadgeText: {
    fontFamily: fonts.bold,
    fontSize: scaleFont(14),
    color: colors.green,
    fontWeight: '700',
  },
  numbersList: {
    gap: 14,
    marginBottom: 16,
  },
  numberCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardPhoneInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  phoneNumberText: {
    fontFamily: fonts.headlineBold,
    fontSize: scaleFont(16),
    fontWeight: '700',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 8,
  },
  operatorBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: '#F3F4F6',
  },
  operatorBadgeText: {
    fontFamily: fonts.bold,
    fontSize: scaleFont(11),
    color: '#374151',
    fontWeight: '700',
  },
  addedDateText: {
    fontFamily: fonts.regular,
    fontSize: scaleFont(12),
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  statusBadgeVerified: {
    backgroundColor: '#E6F7F0',
  },
  statusBadgePending: {
    backgroundColor: '#FEF3C7',
  },
  statusBadgeCompromised: {
    backgroundColor: '#FEE2E2',
  },
  statusBadgeLabel: {
    fontFamily: fonts.bold,
    fontSize: scaleFont(11),
    fontWeight: '700',
  },
  cardActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  actionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  actionChipText: {
    fontFamily: fonts.bold,
    fontSize: scaleFont(12),
    color: colors.white,
    fontWeight: '700',
  },
  actionChipOutline: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
  },
  actionChipOutlineText: {
    fontFamily: fonts.bold,
    fontSize: scaleFont(12),
    fontWeight: '700',
  },
  deleteIconBtn: {
    padding: 6,
  },
  addNumberBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    borderRadius: 14,
    shadowColor: colors.green,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  addNumberBtnText: {
    fontFamily: fonts.headlineBold,
    fontSize: scaleFont(15),
    fontWeight: '700',
    color: colors.white,
  },
  servicesGrid: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 14,
    marginBottom: 20,
  },
  serviceCard: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
  },
  serviceIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  serviceTitle: {
    fontFamily: fonts.headlineBold,
    fontSize: scaleFont(14),
    fontWeight: '700',
    marginBottom: 4,
  },
  serviceDesc: {
    fontFamily: fonts.regular,
    fontSize: scaleFont(11),
    lineHeight: 16,
  },
  contactsBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
  },
  contactsBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  contactsBannerTitle: {
    fontFamily: fonts.headlineBold,
    fontSize: scaleFont(14),
    fontWeight: '700',
  },
  contactsBannerSub: {
    fontFamily: fonts.regular,
    fontSize: scaleFont(12),
    marginTop: 2,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingBottom: 36,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  modalTitle: {
    fontFamily: fonts.headlineBold,
    fontSize: scaleFont(18),
    fontWeight: '800',
  },
  modalHelpText: {
    fontFamily: fonts.regular,
    fontSize: scaleFont(13),
    lineHeight: 19,
    marginBottom: 20,
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
  submitAddBtn: {
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },
  submitAddBtnText: {
    fontFamily: fonts.headlineBold,
    fontSize: scaleFont(15),
    fontWeight: '700',
    color: colors.white,
  },
  otpBoxesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 20,
    gap: 8,
  },
  otpBox: {
    flex: 1,
    height: 54,
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
  confirmCard: {
    marginHorizontal: 24,
    borderRadius: 24,
    padding: 24,
    alignSelf: 'center',
    width: '90%',
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
});
