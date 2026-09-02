import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Animated,
  Easing,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useTranslation } from 'react-i18next';
import { parsePhoneNumberFromString, getCountryCallingCode, CountryCode } from 'libphonenumber-js/min';
import countries from 'i18n-iso-countries';
import { Icon } from '../../src/shared/ui/Icon';
import { HeaderBar } from '../../src/shared/components/HeaderBar';
import { CountryPickerModal, CountryItem } from '../../src/shared/components/CountryPickerModal';
import { CountryFlag } from '../../src/shared/components/CountryFlag';
import { ContactPickerModal } from '../../src/shared/components/ContactPickerModal';
import { VerificationGraphic, OperationStepSpinner } from '../../src/shared/components/VerificationGraphic';
import { useAppTheme } from '../../src/shared/hooks/useAppTheme';
import { colors, fonts } from '../../src/styles/tokens';
import { scaleFont } from '../../src/shared/lib/responsive';

interface VerificationHistoryItem {
  id: string;
  phone: string;
  countryCallingCode: string;
  date: string;
}

export default function VerifyScreen() {
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

  const [viewState, setViewState] = useState<'idle' | 'analyzing' | 'result'>('idle');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<CountryItem>(defaultCountry);
  const [phoneError, setPhoneError] = useState('');
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(1);
  const [countryModalVisible, setCountryModalVisible] = useState(false);
  const [contactModalVisible, setContactModalVisible] = useState(false);
  const [verificationHistory, setVerificationHistory] = useState<VerificationHistoryItem[]>([
    { id: '1', phone: '6 98 44 43 88', countryCallingCode: '+237', date: 'Verification de numero' },
    { id: '2', phone: '6 98 44 43 88', countryCallingCode: '+237', date: 'Verification de numero' },
    { id: '3', phone: '6 98 44 43 88', countryCallingCode: '+237', date: 'Verification de numero' },
    { id: '4', phone: '6 98 44 43 88', countryCallingCode: '+237', date: 'Verification de numero' },
    { id: '5', phone: '6 98 44 43 88', countryCallingCode: '+237', date: 'Verification de numero' },
    { id: '6', phone: '6 98 44 43 88', countryCallingCode: '+237', date: 'Verification de numero' },
    { id: '7', phone: '6 98 44 43 88', countryCallingCode: '+237', date: 'Verification de numero' },
    { id: '8', phone: '6 98 44 43 88', countryCallingCode: '+237', date: 'Verification de numero' },
  ]);

  const spinValue = useState(new Animated.Value(0))[0];

  useEffect(() => {
    // Détection automatique du pays par IP
    fetch('https://ipapi.co/json/')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.country_code) {
          const code = data.country_code as CountryCode;
          try {
            const callingCode = `+${getCountryCallingCode(code)}`;
            const name = countries.getName(code, isFr ? 'fr' : 'en') || code;
            setSelectedCountry({
              code,
              name,
              callingCode,
            });
          } catch {
            // ignore
          }
        }
      })
      .catch(() => {
        // fallback
      });
  }, [isFr]);

  useEffect(() => {
    if (viewState === 'analyzing') {
      const spin = Animated.loop(
        Animated.timing(spinValue, {
          toValue: 1,
          duration: 1200,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      );
      spin.start();
      return () => spin.stop();
    }
  }, [viewState, spinValue]);

  // Validation en temps réel avec libphonenumber-js
  const parsedPhone = parsePhoneNumberFromString(phoneNumber.trim(), selectedCountry.code);
  const isPhoneValid = Boolean(parsedPhone && parsedPhone.isValid());
  const isPhoneInvalid = Boolean(phoneNumber.trim().length > 0 && !isPhoneValid);

  const handleVerify = async () => {
    if (!isPhoneValid) {
      setPhoneError(t('validation.phoneNumberInvalid', 'Numéro de téléphone invalide'));
      return false;
    }

    setPhoneError('');
    setViewState('analyzing');
    setAnalysisStep(1);

    const newItem: VerificationHistoryItem = {
      id: Date.now().toString(),
      phone: phoneNumber,
      countryCallingCode: selectedCountry.callingCode,
      date: 'Verification de numero',
    };
    setVerificationHistory((prev) => [newItem, ...prev]);

    setTimeout(() => setAnalysisStep(2), 700);
    setTimeout(() => setAnalysisStep(3), 1500);
    setTimeout(() => setAnalysisStep(4), 2200);
    setTimeout(() => setViewState('result'), 3000);
    return true;
  };

  const handleSelectContact = (phone: string, country?: CountryItem) => {
    setPhoneNumber(phone);
    if (country) {
      setSelectedCountry(country);
    }
    if (phoneError) setPhoneError('');
  };

  const handleBack = () => {
    if (viewState !== 'idle') {
      setViewState('idle');
    } else {
      router.back();
    }
  };

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Header global unifié Kwismo */}
      <HeaderBar
        title={t('common.verifyNumber', 'Verification du numero')}
        showBack={true}
        onBack={handleBack}
      />

      {/* Feuille de contenu blanc/sombre avec bordure supérieure gauche arrondie */}
      <View
        style={[
          styles.mainCardSheet,
          { backgroundColor: themeColors.background },
        ]}
      >
        {viewState === 'idle' ? (
          <View style={styles.idleRootContainer}>
            {/* Zone fixe du haut : Input + Bouton vérifier + Titre Historique */}
            <View style={styles.topFixedSection}>
              {/* Champ de saisie du numéro */}
              <View
                style={[
                  styles.inputCard,
                  {
                    backgroundColor: themeColors.cardBg,
                    borderColor:
                      isPhoneInvalid && (isInputFocused || phoneError)
                        ? '#EF4444'
                        : isPhoneValid
                        ? colors.green
                        : isInputFocused
                        ? colors.green
                        : themeColors.inputBorder,
                    borderWidth: (isPhoneInvalid && isInputFocused) || isPhoneValid ? 1.5 : 1,
                  },
                ]}
              >
                <Icon
                  name="solar:phone-linear"
                  color={
                    isPhoneInvalid && isInputFocused
                      ? '#EF4444'
                      : isPhoneValid
                      ? colors.green
                      : themeColors.inputPlaceholder
                  }
                  size={20}
                  style={{ marginRight: 8 }}
                />

                {/* Sélecteur de pays avec drapeau circulaire, indicatif et flèche vers le bas */}
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => setCountryModalVisible(true)}
                  style={styles.countryPicker}
                >
                  <CountryFlag countryCode={selectedCountry.code} size={22} style={{ marginRight: 6 }} />
                  <Text style={[styles.countryCodeText, { color: themeColors.textPrimary }]}>
                    {selectedCountry.callingCode}
                  </Text>
                  <Icon
                    name="solar:alt-arrow-down-linear"
                    color={themeColors.textSecondary}
                    size={16}
                    style={{ marginLeft: 4 }}
                  />
                </TouchableOpacity>

                {/* Champ texte sans barre séparatrice */}
                <TextInput
                  style={[
                    styles.phoneInput,
                    { color: themeColors.textPrimary },
                    Platform.OS === 'web' ? ({ outline: 'none' } as any) : {},
                  ]}
                  placeholder={t('common.phonePlaceholder', 'Numero de telephone')}
                  placeholderTextColor={themeColors.inputPlaceholder}
                  keyboardType="phone-pad"
                  value={phoneNumber}
                  onFocus={() => setIsInputFocused(true)}
                  onBlur={() => setIsInputFocused(false)}
                  onChangeText={(val) => {
                    setPhoneNumber(val);
                    if (phoneError) setPhoneError('');
                  }}
                />

                {isPhoneValid && (
                  <Icon name="solar:check-circle-bold" color={colors.green} size={20} style={{ marginLeft: 6 }} />
                )}
              </View>

              {phoneError ? (
                <View style={styles.errorRow}>
                  <Icon name="solar:danger-circle-bold" color="#EF4444" size={14} />
                  <Text style={styles.errorText}>{phoneError}</Text>
                </View>
              ) : null}

              {/* Bouton "Vérifier" : Gris quand désactivé, Jaune/Orange Kwismo quand validé */}
              <TouchableOpacity
                activeOpacity={isPhoneValid ? 0.85 : 1}
                onPress={isPhoneValid ? handleVerify : undefined}
                disabled={!isPhoneValid}
                style={[
                  styles.verifyBtn,
                  {
                    backgroundColor: isPhoneValid
                      ? colors.orange
                      : isDark
                      ? '#334155'
                      : '#D1D5DB',
                  },
                ]}
              >
                <Text
                  style={[
                    styles.verifyBtnText,
                    {
                      color: isPhoneValid
                        ? colors.white
                        : isDark
                        ? '#94A3B8'
                        : '#64748B',
                    },
                  ]}
                >
                  {t('common.verify', 'Verifier')}
                </Text>
              </TouchableOpacity>

              {/* Titre FIXE de l'historique des vérifications */}
              <Text style={[styles.historySectionTitleFixed, { color: themeColors.textPrimary }]}>
                {t('common.verificationHistory', 'Historique des vérifications')}
              </Text>
            </View>

            {/* SEULE la liste des numéros est scrollable */}
            <ScrollView
              style={styles.historyScrollView}
              contentContainerStyle={[
                styles.historyScrollContent,
                { paddingBottom: insets.bottom + 90 },
              ]}
              showsVerticalScrollIndicator={false}
            >
              {verificationHistory.length === 0 ? (
                <View style={styles.emptyHistoryBox}>
                  <Icon name="solar:history-linear" color={themeColors.inputPlaceholder} size={36} style={{ marginBottom: 8 }} />
                  <Text style={[styles.emptyHistoryText, { color: themeColors.textSecondary }]}>
                    {t('common.noVerificationHistory', 'Aucune vérification récente pour le moment.')}
                  </Text>
                </View>
              ) : (
                <View style={styles.historyList}>
                  {verificationHistory.map((item, idx) => (
                    <TouchableOpacity
                      key={`${item.id}-${idx}`}
                      activeOpacity={0.7}
                      onPress={() => {
                        setPhoneNumber(item.phone);
                      }}
                      style={styles.historyRow}
                    >
                      <View style={styles.avatarCircle} />
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.historyPhone, { color: themeColors.textPrimary }]}>
                          {item.countryCallingCode} {item.phone}
                        </Text>
                        <Text style={[styles.historySub, { color: themeColors.textSecondary }]}>
                          {item.date}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </ScrollView>
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={[
              styles.scrollBody,
              { paddingBottom: insets.bottom + 40 },
            ]}
            showsVerticalScrollIndicator={false}
          >
            {viewState === 'analyzing' && (
              <View style={styles.analyzingContainer}>
                {/* Input lecture seule en haut */}
                <View
                  style={[
                    styles.inputCardReadonly,
                    { backgroundColor: themeColors.cardBg, borderColor: themeColors.inputBorder },
                  ]}
                >
                  <Icon name="solar:phone-linear" color={colors.green} size={20} style={{ marginRight: 8 }} />
                  <CountryFlag countryCode={selectedCountry.code} size={20} style={{ marginRight: 6 }} />
                  <Text style={[styles.countryCodeText, { color: themeColors.textPrimary, marginRight: 6 }]}>
                    {selectedCountry.callingCode}
                  </Text>
                  <Text style={[styles.phoneTextReadonly, { color: themeColors.textPrimary }]}>
                    {phoneNumber}
                  </Text>
                </View>

                {/* Graphique animé avec le bouclier, les sparkles à 4 branches et la ligne d'analyse */}
                <VerificationGraphic state="analyzing" isDark={isDark} />

                <Text style={[styles.analyzingTitle, { color: themeColors.textPrimary }]}>
                  {t('common.analyzing', 'Analyse en cours...')}
                </Text>
                <Text style={[styles.analyzingSub, { color: themeColors.textSecondary }]}>
                  {t('common.analyzingSubtitle', 'Nous vérifions ce numéro dans notre base de données et auprès de la communauté')}
                </Text>

                {/* Liste des 4 étapes avec le spinner rotatif vert et les badges de statut */}
                <View style={[styles.stepsCard, { backgroundColor: themeColors.cardBg, borderColor: themeColors.inputBorder }]}>
                  {/* Étape 1 : Analyse de la base de données */}
                  <View style={styles.stepItem}>
                    <Text style={[styles.stepText, { color: themeColors.textSecondary }, analysisStep >= 1 && { color: themeColors.textPrimary, fontWeight: '700' }]}>
                      {t('common.dbAnalysis', 'Analyse de la base de données')}
                    </Text>
                    {analysisStep > 1 ? (
                      <View style={styles.stepSuccessCircle}>
                        <Icon name="solar:check-read-linear" color="#FFFFFF" size={14} />
                      </View>
                    ) : analysisStep === 1 ? (
                      <OperationStepSpinner size={22} />
                    ) : (
                      <View style={styles.stepPendingCircle}>
                        <View style={styles.stepPendingDash} />
                      </View>
                    )}
                  </View>

                  {/* Étape 2 : Vérification des signalements */}
                  <View style={styles.stepItem}>
                    <Text style={[styles.stepText, { color: themeColors.textSecondary }, analysisStep >= 2 && { color: themeColors.textPrimary, fontWeight: '700' }]}>
                      {t('common.reportsCheck', 'Vérification des signalements')}
                    </Text>
                    {analysisStep > 2 ? (
                      <View style={styles.stepSuccessCircle}>
                        <Icon name="solar:check-read-linear" color="#FFFFFF" size={14} />
                      </View>
                    ) : analysisStep === 2 ? (
                      <OperationStepSpinner size={22} />
                    ) : (
                      <View style={styles.stepPendingCircle}>
                        <View style={styles.stepPendingDash} />
                      </View>
                    )}
                  </View>

                  {/* Étape 3 : Consultation de la communauté */}
                  <View style={styles.stepItem}>
                    <Text style={[styles.stepText, { color: themeColors.textSecondary }, analysisStep >= 3 && { color: themeColors.textPrimary, fontWeight: '700' }]}>
                      {t('common.communityCheck', 'Consultation de la communauté')}
                    </Text>
                    {analysisStep > 3 ? (
                      <View style={styles.stepSuccessCircle}>
                        <Icon name="solar:check-read-linear" color="#FFFFFF" size={14} />
                      </View>
                    ) : analysisStep === 3 ? (
                      <OperationStepSpinner size={22} />
                    ) : (
                      <View style={styles.stepPendingCircle}>
                        <View style={styles.stepPendingDash} />
                      </View>
                    )}
                  </View>

                  {/* Étape 4 : Calcul du score de risque */}
                  <View style={styles.stepItem}>
                    <Text style={[styles.stepText, { color: themeColors.textSecondary }, analysisStep >= 4 && { color: themeColors.textPrimary, fontWeight: '700' }]}>
                      {t('common.riskCalculation', 'Calcul du score de risque')}
                    </Text>
                    {analysisStep > 4 ? (
                      <View style={styles.stepSuccessCircle}>
                        <Icon name="solar:check-read-linear" color="#FFFFFF" size={14} />
                      </View>
                    ) : analysisStep === 4 ? (
                      <OperationStepSpinner size={22} />
                    ) : (
                      <View style={styles.stepPendingCircle}>
                        <View style={styles.stepPendingDash} />
                      </View>
                    )}
                  </View>
                </View>

                {/* Info bas */}
                <View style={[styles.infoCard, { backgroundColor: isDark ? '#1E293B' : '#EBF3FF' }]}>
                  <Icon name="solar:info-circle-linear" color="#3B82F6" size={20} style={{ marginRight: 10 }} />
                  <Text style={[styles.infoText, { color: isDark ? '#93C5FD' : '#1D4ED8' }]}>
                    {t('common.operationTimeInfo', 'Cette opération prend généralement quelques secondes')}
                  </Text>
                </View>
              </View>
            )}

            {viewState === 'result' && (
              <View style={styles.resultContainer}>
                {/* Bannière pilule "SÉCURISÉ" */}
                <View style={styles.statusPillBanner}>
                  <Text style={styles.statusPillText}>SÉCURISÉ</Text>
                </View>

                {/* Graphique validé avec le bouclier, les lignes, le check superposé et les checks flottants */}
                <VerificationGraphic state="result" isDark={isDark} />

                {/* Carte de score de risque */}
                <View style={styles.riskCard}>
                  <View style={styles.riskHeader}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Text style={styles.riskTitle}>{t('common.riskScore', 'Score de risque')}</Text>
                      <Icon name="solar:info-circle-linear" color="rgba(255,255,255,0.85)" size={16} style={{ marginLeft: 6 }} />
                    </View>
                    <View style={styles.riskLevelBadge}>
                      <Text style={styles.riskLevelText}>{t('common.veryLow', 'Très faible')}</Text>
                    </View>
                  </View>

                  <View style={styles.gaugeContainer}>
                    <View style={styles.gaugeLabels}>
                      <Text style={styles.gaugeVal}>0</Text>
                      <Text style={styles.gaugeVal}>100</Text>
                    </View>
                    <View style={styles.gaugeBarBackground}>
                      <View style={[styles.gaugeBarFill, { width: '8%' }]} />
                    </View>
                  </View>
                </View>

                {/* Historique communautaire */}
                <View style={styles.communitySection}>
                  <Text style={[styles.communityTitle, { color: themeColors.textPrimary }]}>
                    {t('common.communityHistory', 'Historique communautaire')}
                  </Text>

                  <View style={[styles.statRow, { borderBottomColor: themeColors.inputBorder }]}>
                    <View style={styles.iconCircleDark}>
                      <Icon name="solar:bell-bold" color={colors.white} size={16} />
                    </View>
                    <Text style={[styles.statLabel, { color: themeColors.textSecondary }]}>
                      {t('common.reportsCount', 'Signalements')}
                    </Text>
                    <Text style={[styles.statValue, { color: themeColors.textPrimary }]}>0</Text>
                  </View>

                  <View style={[styles.statRow, { borderBottomColor: themeColors.inputBorder }]}>
                    <View style={styles.iconCircleDark}>
                      <Icon name="solar:chat-dots-bold" color={colors.white} size={16} />
                    </View>
                    <Text style={[styles.statLabel, { color: themeColors.textSecondary }]}>
                      {t('common.positiveComments', 'Commentaires positifs')}
                    </Text>
                    <Text style={[styles.statValue, { color: themeColors.textPrimary }]}>24</Text>
                  </View>

                  <Text style={[styles.lastReportSub, { color: themeColors.textSecondary }]}>
                    {t('common.lastReportAgo', 'Dernier signalement il y a 8 mois')}
                  </Text>
                </View>

                {/* Deux boutons d'action du bas */}
                <View style={styles.dualActionsRow}>
                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={() => router.push('/(app)/report')}
                    style={styles.signalerBtn}
                  >
                    <Text style={styles.actionBtnText}>{t('common.report', 'Signaler')}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={() => router.push('/(app)/transfer')}
                    style={styles.transfererBtn}
                  >
                    <Text style={styles.actionBtnText}>{t('common.transfer', 'Transférer')}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </ScrollView>
        )}
      </View>

      {/* Bouton du bas "Choisi dans les contacts" conforme à la maquette (Bleu Nuit, rectangulaire arrondi) */}
      {viewState === 'idle' && (
        <View
          style={[
            styles.bottomContactsWrapper,
            { paddingBottom: Math.max(insets.bottom + 12, 20) },
          ]}
        >
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => setContactModalVisible(true)}
            style={styles.contactsBtnMaquette}
          >
            <Icon name="solar:users-group-two-rounded-bold" color={colors.white} size={22} style={{ marginRight: 10 }} />
            <Text style={styles.contactsBtnText}>{t('common.chooseFromContacts', 'Choisi dans les contacts')}</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Modale de sélection de pays */}
      <CountryPickerModal
        visible={countryModalVisible}
        onClose={() => setCountryModalVisible(false)}
        onSelect={(c) => {
          setSelectedCountry(c);
          if (phoneError) setPhoneError('');
        }}
        selectedCode={selectedCountry.code}
      />

      {/* Modale de sélection de contact */}
      <ContactPickerModal
        visible={contactModalVisible}
        onClose={() => setContactModalVisible(false)}
        onSelect={handleSelectContact}
        defaultCountryCode={selectedCountry.code}
      />
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
  idleRootContainer: {
    flex: 1,
  },
  topFixedSection: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  historyScrollView: {
    flex: 1,
  },
  historyScrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  scrollBody: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  inputCard: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    borderRadius: 14,
    paddingHorizontal: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  countryPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 10,
  },
  countryCodeText: {
    fontFamily: fonts.semiBold,
    fontSize: scaleFont(15),
  },
  phoneInput: {
    flex: 1,
    height: '100%',
    fontFamily: fonts.medium,
    fontSize: scaleFont(15),
    paddingVertical: 0,
    textAlignVertical: 'center',
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    paddingHorizontal: 4,
    gap: 6,
  },
  errorText: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: '#EF4444',
  },
  verifyBtn: {
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  verifyBtnText: {
    fontFamily: fonts.bold,
    fontSize: scaleFont(15),
  },
  historySectionTitleFixed: {
    fontFamily: fonts.headlineBold,
    fontSize: scaleFont(16),
    fontWeight: '700',
    marginBottom: 10,
  },
  emptyHistoryBox: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyHistoryText: {
    fontFamily: fonts.regular,
    fontSize: scaleFont(13),
    textAlign: 'center',
  },
  historyList: {
    gap: 16,
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  avatarCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#D1D5DB',
    marginRight: 14,
  },
  historyPhone: {
    fontFamily: fonts.bold,
    fontSize: scaleFont(15),
  },
  historySub: {
    fontFamily: fonts.regular,
    fontSize: scaleFont(12),
    color: '#94A3B8',
    marginTop: 2,
  },
  bottomContactsWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    backgroundColor: 'transparent',
  },
  contactsBtnMaquette: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 54,
    borderRadius: 14,
    backgroundColor: '#131B2E',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  contactsBtnText: {
    fontFamily: fonts.semiBold,
    fontSize: scaleFont(15),
    color: colors.white,
  },
  analyzingContainer: {
    alignItems: 'center',
    paddingTop: 10,
  },
  inputCardReadonly: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    height: 52,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 16,
    marginBottom: 28,
  },
  phoneTextReadonly: {
    fontFamily: fonts.semiBold,
    fontSize: scaleFont(15),
  },
  graphicCircleBg: {
    width: 140,
    height: 140,
    borderRadius: 70,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  innerShieldIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  analyzingTitle: {
    fontFamily: fonts.headlineBold,
    fontSize: scaleFont(20),
    fontWeight: '700',
    marginBottom: 6,
  },
  analyzingSub: {
    fontFamily: fonts.regular,
    fontSize: scaleFont(13),
    marginBottom: 24,
    textAlign: 'center',
  },
  stepsCard: {
    width: '100%',
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 16,
    marginBottom: 20,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stepText: {
    fontFamily: fonts.medium,
    fontSize: scaleFont(14),
  },
  stepSuccessCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepPendingCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepPendingDash: {
    width: 10,
    height: 2,
    borderRadius: 1,
    backgroundColor: '#94A3B8',
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    padding: 14,
    borderRadius: 12,
  },
  infoText: {
    flex: 1,
    fontFamily: fonts.medium,
    fontSize: scaleFont(12),
    lineHeight: 18,
  },
  resultContainer: {
    alignItems: 'center',
  },
  statusPillBanner: {
    borderWidth: 1.5,
    borderColor: colors.green,
    borderRadius: 30,
    paddingVertical: 10,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginBottom: 16,
    backgroundColor: 'transparent',
  },
  statusPillText: {
    fontFamily: fonts.headlineBold,
    fontSize: scaleFont(22),
    fontWeight: '800',
    color: colors.green,
    letterSpacing: 2,
  },
  riskCard: {
    width: '100%',
    backgroundColor: colors.green,
    borderRadius: 16,
    padding: 18,
    marginBottom: 24,
  },
  riskHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  riskTitle: {
    fontFamily: fonts.bold,
    fontSize: scaleFont(15),
    color: colors.white,
  },
  riskLevelBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  riskLevelText: {
    fontFamily: fonts.bold,
    fontSize: scaleFont(11),
    color: colors.white,
  },
  gaugeContainer: {
    width: '100%',
  },
  gaugeLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  gaugeVal: {
    fontFamily: fonts.medium,
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.85)',
  },
  gaugeBarBackground: {
    width: '100%',
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  gaugeBarFill: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: colors.white,
  },
  communitySection: {
    width: '100%',
    marginBottom: 28,
  },
  communityTitle: {
    fontFamily: fonts.headlineBold,
    fontSize: scaleFont(16),
    fontWeight: '700',
    marginBottom: 12,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  iconCircleDark: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.navy,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  statLabel: {
    flex: 1,
    fontFamily: fonts.medium,
    fontSize: scaleFont(14),
  },
  statValue: {
    fontFamily: fonts.bold,
    fontSize: scaleFont(15),
  },
  lastReportSub: {
    fontFamily: fonts.regular,
    fontSize: scaleFont(12),
    marginTop: 10,
  },
  dualActionsRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  signalerBtn: {
    flex: 1,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  transfererBtn: {
    flex: 1,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnText: {
    fontFamily: fonts.semiBold,
    fontSize: scaleFont(14),
    color: colors.white,
  },
});
