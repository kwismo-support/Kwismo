import React, { useState } from 'react';
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
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useTranslation } from 'react-i18next';
import { Icon } from '../../src/shared/ui/Icon';
import { HeaderBar } from '../../src/shared/components/HeaderBar';
import { useAppTheme } from '../../src/shared/hooks/useAppTheme';
import { toast } from '../../src/shared/store/toastStore';
import { colors, fonts } from '../../src/styles/tokens';
import { scaleFont } from '../../src/shared/lib/responsive';

// Motifs de signalement issus du cahier des charges (§9.7)
const REPORT_REASONS = [
  { id: 'scam', labelKey: 'report.reasonScam', label: "Tentative d'arnaque / Fraude", icon: 'solar:danger-triangle-bold' },
  { id: 'fake_agent', labelKey: 'report.reasonFakeAgent', label: "Faux agent d'opérateur (Orange / MTN)", icon: 'solar:user-cross-bold' },
  { id: 'phishing', labelKey: 'report.reasonPhishing', label: 'Message frauduleux / Phishing', icon: 'solar:link-broken-bold' },
  { id: 'harassment', labelKey: 'report.reasonHarassment', label: 'Appels répétés suspects / Harcèlement', icon: 'solar:phone-calling-rounded-bold' },
  { id: 'wrong_transfer', labelKey: 'report.reasonWrongTransfer', label: 'Faux transfert ou demande de remboursement', icon: 'solar:card-transfer-bold' },
];

// Historique des appels récents reçus sur l'appareil (simulés issus de l'analyse d'appels §9.6)
const RECENT_CALLS_HISTORY = [
  { phone: '+237 6 55 98 76 54', raw: '655987654', date: "Aujourd'hui à 11:42", duration: '18s', type: 'incoming' },
  { phone: '+237 6 70 88 99 00', raw: '670889900', date: 'Hier à 16:15', duration: '45s', type: 'incoming' },
  { phone: '+237 6 98 44 43 88', raw: '698444388', date: 'Il y a 3 jours', duration: '2m 10s', type: 'incoming' },
];

export default function ReportScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ phone?: string }>();
  const { t } = useTranslation();
  const { isDark, colors: themeColors } = useAppTheme();

  // État du formulaire
  const [targetPhone, setTargetPhone] = useState(params.phone || '');
  const [selectedReason, setSelectedReason] = useState<string>('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCallPickerModal, setShowCallPickerModal] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [successModalVisible, setSuccessModalVisible] = useState(false);

  // Règle d'or : On ne peut signaler qu'un numéro qui nous a appelé
  const verifyCallerInHistory = (inputPhone: string): boolean => {
    const clean = inputPhone.replace(/[^0-9]/g, '');
    if (!clean) return false;
    return RECENT_CALLS_HISTORY.some((call) => {
      const callClean = call.phone.replace(/[^0-9]/g, '');
      return callClean.includes(clean) || clean.includes(call.raw);
    });
  };

  const handleSelectRecentCall = (phone: string) => {
    setTargetPhone(phone);
    setValidationError('');
    setShowCallPickerModal(false);
  };

  const handleSubmitReport = () => {
    setValidationError('');

    if (!targetPhone.trim()) {
      setValidationError(t('report.selectPhoneError', 'Veuillez sélectionner ou indiquer un numéro.'));
      return;
    }

    // Vérification de la règle d'appel entrant
    const wasCalled = verifyCallerInHistory(targetPhone);
    if (!wasCalled) {
      setValidationError(
        t(
          'report.callerNotInHistoryError',
          "Ce numéro ne figure pas dans vos appels reçus récents. Conformément aux règles de sécurité Kwismo, vous ne pouvez signaler qu'un numéro qui vous a contacté."
        )
      );
      return;
    }

    if (!selectedReason) {
      setValidationError(t('report.selectReasonError', 'Veuillez sélectionner un motif de signalement.'));
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSuccessModalVisible(true);
    }, 1000);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Header unifié de page secondaire */}
      <HeaderBar
        title={t('common.report', 'Signaler')}
        showBack={true}
      />

      {/* Feuille de contenu avec bordure supérieure gauche arrondie */}
      <View style={[styles.mainCardSheet, { backgroundColor: themeColors.background }]}>
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + 40 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* Bannière explicative de la règle de sécurité */}
          <View style={[styles.ruleNoticeCard, { backgroundColor: isDark ? '#1E293B' : '#FEF3C7' }]}>
            <Icon name="solar:shield-warning-bold" color={colors.orange} size={22} style={{ marginRight: 10 }} />
            <Text style={[styles.ruleNoticeText, { color: isDark ? '#FDE68A' : '#92400E' }]}>
              {t('report.ruleNotice', "Règle communautaire : Vous ne pouvez signaler qu'un numéro suspect vous ayant réellement contacté ou appelé.")}
            </Text>
          </View>

          {/* 1. Sélection du numéro concerné */}
          <Text style={[styles.inputLabel, { color: themeColors.textPrimary }]}>
            {t('report.phoneLabel', 'Numéro concerné')}
          </Text>

          <View
            style={[
              styles.phoneInputRow,
              {
                backgroundColor: themeColors.inputBg,
                borderColor: validationError ? '#EF4444' : themeColors.inputBorder,
              },
            ]}
          >
            <Icon name="solar:phone-calling-rounded-linear" color={colors.green} size={20} style={{ marginRight: 10 }} />
            <TextInput
              style={[
                styles.phoneInputField,
                { color: themeColors.textPrimary },
                Platform.OS === 'web' ? ({ outline: 'none' } as any) : {},
              ]}
              placeholder="+237 6 55 98 76 54"
              placeholderTextColor={themeColors.inputPlaceholder}
              value={targetPhone}
              onChangeText={(text) => {
                setTargetPhone(text);
                if (validationError) setValidationError('');
              }}
            />
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setShowCallPickerModal(true)}
              style={styles.recentCallTriggerBtn}
            >
              <Icon name="solar:history-bold" color={colors.green} size={18} style={{ marginRight: 4 }} />
              <Text style={styles.recentCallTriggerText}>{t('report.recentCalls', 'Appels récents')}</Text>
            </TouchableOpacity>
          </View>

          {/* Message d'erreur de validation si le numéro ne nous a pas appelé */}
          {validationError ? (
            <View style={styles.errorBox}>
              <Icon name="solar:danger-triangle-bold" color="#EF4444" size={16} style={{ marginRight: 6 }} />
              <Text style={styles.errorBoxText}>{validationError}</Text>
            </View>
          ) : null}

          {/* 2. Motif du signalement */}
          <Text style={[styles.inputLabel, { color: themeColors.textPrimary, marginTop: 24 }]}>
            {t('report.reasonLabel', 'Motif du signalement')}
          </Text>

          <View style={styles.reasonsList}>
            {REPORT_REASONS.map((reason) => {
              const isSelected = selectedReason === reason.id;
              return (
                <TouchableOpacity
                  key={reason.id}
                  activeOpacity={0.75}
                  onPress={() => setSelectedReason(reason.id)}
                  style={[
                    styles.reasonItem,
                    {
                      backgroundColor: isSelected
                        ? isDark ? '#1E3A2F' : '#E6F7F0'
                        : themeColors.cardBg,
                      borderColor: isSelected
                        ? colors.green
                        : themeColors.inputBorder,
                    },
                  ]}
                >
                  <View style={styles.reasonLeft}>
                    <Icon
                      name={reason.icon}
                      size={20}
                      color={isSelected ? colors.green : themeColors.textSecondary}
                      style={{ marginRight: 12 }}
                    />
                    <Text
                      style={[
                        styles.reasonLabel,
                        {
                          color: isSelected ? colors.green : themeColors.textPrimary,
                          fontWeight: isSelected ? '700' : '500',
                        },
                      ]}
                    >
                      {t(reason.labelKey, reason.label)}
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.radioCircle,
                      {
                        borderColor: isSelected ? colors.green : themeColors.inputBorder,
                        backgroundColor: isSelected ? colors.green : 'transparent',
                      },
                    ]}
                  >
                    {isSelected && <View style={styles.radioInnerDot} />}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* 3. Description libre (optionnelle) */}
          <Text style={[styles.inputLabel, { color: themeColors.textPrimary, marginTop: 24 }]}>
            {t('report.detailsLabel', 'Description ou détails (optionnel)')}
          </Text>

          <TextInput
            style={[
              styles.textAreaField,
              {
                backgroundColor: themeColors.inputBg,
                borderColor: themeColors.inputBorder,
                color: themeColors.textPrimary,
              },
              Platform.OS === 'web' ? ({ outline: 'none' } as any) : {},
            ]}
            placeholder={t('report.detailsPlaceholder', "Décrivez brièvement la tentative...")}
            placeholderTextColor={themeColors.inputPlaceholder}
            multiline
            numberOfLines={4}
            value={description}
            onChangeText={setDescription}
          />

          {/* Bouton de soumission officiel */}
          <TouchableOpacity
            activeOpacity={0.85}
            disabled={isSubmitting || !targetPhone.trim() || !selectedReason}
            onPress={handleSubmitReport}
            style={[
              styles.submitBtn,
              {
                backgroundColor: targetPhone.trim() && selectedReason
                  ? colors.orange
                  : themeColors.disabled,
              },
            ]}
          >
            {isSubmitting ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <>
                <Icon name="heroicons:signal-16-solid" color={colors.white} size={20} style={{ marginRight: 8 }} />
                <Text style={styles.submitBtnText}>{t('report.submitReport', 'Envoyer le signalement')}</Text>
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Modale de sélection parmi les appels récents reçus */}
      <Modal visible={showCallPickerModal} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalSheet, { backgroundColor: themeColors.cardBg }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: themeColors.textPrimary }]}>
                Sélectionner un appel reçu
              </Text>
              <TouchableOpacity onPress={() => setShowCallPickerModal(false)}>
                <Icon name="solar:close-circle-bold" color={themeColors.textSecondary} size={26} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.modalHelpText, { color: themeColors.textSecondary }]}>
              Voici la liste des derniers numéros ayant contacté votre appareil :
            </Text>

            <View style={styles.callsList}>
              {RECENT_CALLS_HISTORY.map((call, idx) => (
                <TouchableOpacity
                  key={idx}
                  activeOpacity={0.7}
                  onPress={() => handleSelectRecentCall(call.phone)}
                  style={[styles.callRow, { borderBottomColor: themeColors.divider }]}
                >
                  <View style={styles.callIconBox}>
                    <Icon name="solar:phone-calling-rounded-bold" color={colors.green} size={20} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.callPhone, { color: themeColors.textPrimary }]}>
                      {call.phone}
                    </Text>
                    <Text style={[styles.callDate, { color: themeColors.textSecondary }]}>
                      {call.date} · Durée : {call.duration}
                    </Text>
                  </View>
                  <Icon name="solar:alt-arrow-right-linear" color={themeColors.textSecondary} size={18} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>

      {/* Modale de confirmation de succès du signalement */}
      <Modal visible={successModalVisible} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={[styles.successCard, { backgroundColor: themeColors.cardBg }]}>
            <View style={styles.successIconCircle}>
              <Icon name="solar:check-circle-bold" color={colors.green} size={50} />
            </View>

            <Text style={[styles.successTitle, { color: themeColors.textPrimary }]}>
              Signalement enregistré !
            </Text>
            <Text style={[styles.successSub, { color: themeColors.textSecondary }]}>
              Merci pour votre vigilance. Ce signalement a été transmis à la communauté Kwismo et aide à protéger des milliers d'utilisateurs.
            </Text>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => {
                setSuccessModalVisible(false);
                router.back();
              }}
              style={[styles.finishBtn, { backgroundColor: colors.green }]}
            >
              <Text style={styles.finishBtnText}>Terminer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.green,
  },
  mainCardSheet: {
    flex: 1,
    borderTopLeftRadius: 36,
    borderTopRightRadius: 0,
    overflow: 'hidden',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  ruleNoticeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    marginBottom: 20,
  },
  ruleNoticeText: {
    flex: 1,
    fontFamily: fonts.medium,
    fontSize: scaleFont(12),
    lineHeight: 18,
  },
  inputLabel: {
    fontFamily: fonts.headlineBold,
    fontSize: scaleFont(14),
    fontWeight: '700',
    marginBottom: 8,
  },
  phoneInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
  },
  phoneInputField: {
    flex: 1,
    fontFamily: fonts.semiBold,
    fontSize: scaleFont(15),
  },
  recentCallTriggerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#E6F7F0',
  },
  recentCallTriggerText: {
    fontFamily: fonts.bold,
    fontSize: scaleFont(11),
    color: colors.green,
    fontWeight: '700',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingHorizontal: 4,
  },
  errorBoxText: {
    flex: 1,
    fontFamily: fonts.medium,
    fontSize: scaleFont(12),
    color: '#EF4444',
    lineHeight: 16,
  },
  reasonsList: {
    gap: 10,
  },
  reasonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  reasonLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: 10,
  },
  reasonLabel: {
    fontFamily: fonts.medium,
    fontSize: scaleFont(13),
    flex: 1,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInnerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.white,
  },
  textAreaField: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    fontFamily: fonts.regular,
    fontSize: scaleFont(13),
    lineHeight: 20,
    minHeight: 90,
    textAlignVertical: 'top',
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 54,
    borderRadius: 14,
    marginTop: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  submitBtnText: {
    fontFamily: fonts.headlineBold,
    fontSize: scaleFont(16),
    fontWeight: '700',
    color: colors.white,
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
    marginBottom: 16,
  },
  callsList: {
    gap: 4,
  },
  callRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  callIconBox: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#E6F7F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  callPhone: {
    fontFamily: fonts.bold,
    fontSize: scaleFont(15),
    fontWeight: '700',
  },
  callDate: {
    fontFamily: fonts.regular,
    fontSize: scaleFont(12),
    marginTop: 2,
  },
  successCard: {
    marginHorizontal: 24,
    borderRadius: 24,
    padding: 24,
    alignSelf: 'center',
    width: '90%',
    alignItems: 'center',
  },
  successIconCircle: {
    marginBottom: 14,
  },
  successTitle: {
    fontFamily: fonts.headlineBold,
    fontSize: scaleFont(20),
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 8,
  },
  successSub: {
    fontFamily: fonts.regular,
    fontSize: scaleFont(13),
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 24,
  },
  finishBtn: {
    height: 50,
    borderRadius: 14,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  finishBtnText: {
    fontFamily: fonts.headlineBold,
    fontSize: scaleFont(15),
    fontWeight: '700',
    color: colors.white,
  },
});
