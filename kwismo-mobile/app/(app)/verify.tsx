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
import { Button } from '../../src/shared/ui/Button';
import { HeaderActions } from '../../src/shared/components/HeaderActions';
import { CountryPickerModal, CountryItem, getCountryFlag } from '../../src/shared/components/CountryPickerModal';
import { ContactPickerModal } from '../../src/shared/components/ContactPickerModal';
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
    flag: getCountryFlag('CM'),
  };

  const [viewState, setViewState] = useState<'idle' | 'analyzing' | 'result'>('idle');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<CountryItem>(defaultCountry);
  const [phoneError, setPhoneError] = useState('');
  const [analysisStep, setAnalysisStep] = useState(1);
  const [countryModalVisible, setCountryModalVisible] = useState(false);
  const [contactModalVisible, setContactModalVisible] = useState(false);
  const [verificationHistory, setVerificationHistory] = useState<VerificationHistoryItem[]>([
    { id: '1', phone: '6 98 44 43 88', countryCallingCode: '+237', date: 'hier, 21:47' },
    { id: '2', phone: '6 77 12 34 56', countryCallingCode: '+237', date: '28 août, 14:12' },
  ]);

  const spinValue = useState(new Animated.Value(0))[0];

  useEffect(() => {
    // Détection automatique du pays par IP via service public léger
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
              flag: getCountryFlag(code),
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

  const handleVerify = async () => {
    setPhoneError('');
    if (!isPhoneValid) {
      setPhoneError(t('validation.phoneNumberInvalid', 'Numéro de téléphone invalide pour ce pays'));
      return false;
    }

    setViewState('analyzing');
    setAnalysisStep(1);

    const newItem: VerificationHistoryItem = {
      id: Date.now().toString(),
      phone: phoneNumber,
      countryCallingCode: selectedCountry.callingCode,
      date: t('common.now', 'À l’instant'),
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

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Header vert Kwismo */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top + 10, 20) }]}>
        <View style={styles.headerContent}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => {
              if (viewState !== 'idle') {
                setViewState('idle');
              } else {
                router.back();
              }
            }}
            style={styles.backBtn}
          >
            <Icon name="solar:arrow-left-linear" color={colors.white} size={22} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('common.verifyNumber')}</Text>
          <HeaderActions iconColor={colors.white} />
        </View>
      </View>

      {/* Feuille de contenu avec bordure supérieure gauche arrondie */}
      <View
        style={[
          styles.mainCardSheet,
          { backgroundColor: themeColors.background },
        ]}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollBody,
            { paddingBottom: insets.bottom + 110 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {viewState === 'idle' && (
            <View style={styles.idleContainer}>
              {/* Carte de saisie de numéro sans séparateur vertical */}
              <View
                style={[
                  styles.inputCard,
                  {
                    backgroundColor: themeColors.cardBg,
                    borderColor: phoneError
                      ? '#EF4444'
                      : isPhoneValid
                      ? colors.green
                      : themeColors.inputBorder,
                  },
                ]}
              >
                <Icon
                  name="solar:phone-linear"
                  color={isPhoneValid ? colors.green : themeColors.inputPlaceholder}
                  size={20}
                  style={{ marginRight: 8 }}
                />

                {/* Sélecteur de pays avec drapeau et indicatif */}
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => setCountryModalVisible(true)}
                  style={styles.countryPicker}
                >
                  <Text style={styles.flagEmoji}>{selectedCountry.flag}</Text>
                  <Text style={[styles.countryCodeText, { color: themeColors.textPrimary }]}>
                    {selectedCountry.callingCode}
                  </Text>
                  <Icon name="solar:alt-arrow-down-linear" color={themeColors.inputPlaceholder} size={14} />
                </TouchableOpacity>

                <TextInput
                  style={[
                    styles.phoneInput,
                    { color: themeColors.textPrimary },
                    Platform.OS === 'web' ? ({ outline: 'none' } as any) : {},
                  ]}
                  placeholder={t('common.phonePlaceholder')}
                  placeholderTextColor={themeColors.inputPlaceholder}
                  keyboardType="phone-pad"
                  value={phoneNumber}
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

              {/* Bouton de vérification désactivé tant que le numéro n'est pas valide */}
              <Button
                title={t('common.verify')}
                onPress={handleVerify}
                disabled={!isPhoneValid}
                variant="primary"
                size="md"
                style={{ marginTop: 18, marginBottom: 26 }}
              />

              {/* Historique des vérifications */}
              <View style={styles.historySection}>
                <Text style={[styles.historySectionTitle, { color: themeColors.textPrimary }]}>
                  {t('common.verificationHistory', 'Historique des vérifications')}
                </Text>

                {verificationHistory.length === 0 ? (
                  <View style={styles.emptyHistoryBox}>
                    <Icon name="solar:history-linear" color={themeColors.inputPlaceholder} size={36} style={{ marginBottom: 8 }} />
                    <Text style={[styles.emptyHistoryText, { color: themeColors.textSecondary }]}>
                      {t('common.noVerificationHistory', 'Aucune vérification récente pour le moment.')}
                    </Text>
                  </View>
                ) : (
                  <View style={styles.historyList}>
                    {verificationHistory.map((item) => (
                      <TouchableOpacity
                        key={item.id}
                        activeOpacity={0.7}
                        onPress={() => {
                          setPhoneNumber(item.phone);
                        }}
                        style={[
                          styles.historyRow,
                          {
                            backgroundColor: themeColors.cardBg,
                            borderColor: themeColors.inputBorder,
                            borderWidth: isDark ? 1 : 0,
                          },
                        ]}
                      >
                        <View style={styles.avatarCircle}>
                          <Icon name="solar:user-linear" color={colors.white} size={18} />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.historyPhone, { color: themeColors.textPrimary }]}>
                            {item.countryCallingCode} {item.phone}
                          </Text>
                          <Text style={[styles.historySub, { color: themeColors.textSecondary }]}>
                            {t('common.verifiedOn', 'Vérifié')} • {item.date}
                          </Text>
                        </View>
                        <Icon name="solar:alt-arrow-right-linear" color={themeColors.inputPlaceholder} size={18} />
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            </View>
          )}

          {viewState === 'analyzing' && (
            <View style={styles.analyzingContainer}>
              <View
                style={[
                  styles.inputCardReadonly,
                  { backgroundColor: themeColors.cardBg, borderColor: themeColors.inputBorder },
                ]}
              >
                <Icon name="solar:phone-linear" color={colors.green} size={20} style={{ marginRight: 8 }} />
                <Text style={styles.flagEmoji}>{selectedCountry.flag}</Text>
                <Text style={[styles.countryCodeText, { color: themeColors.textPrimary, marginRight: 6 }]}>
                  {selectedCountry.callingCode}
                </Text>
                <Text style={[styles.phoneTextReadonly, { color: themeColors.textPrimary }]}>
                  {phoneNumber}
                </Text>
              </View>

              <View style={[styles.graphicCircleBg, { backgroundColor: isDark ? '#1E293B' : '#E6F7F0' }]}>
                <View style={[styles.innerShieldIcon, { backgroundColor: isDark ? '#0F172A' : '#FFFFFF' }]}>
                  <Icon name="solar:shield-check-bold" color={colors.green} size={64} />
                </View>
              </View>

              <Text style={[styles.analyzingTitle, { color: themeColors.textPrimary }]}>
                {t('common.analyzing')}
              </Text>
              <Text style={[styles.analyzingSub, { color: themeColors.textSecondary }]}>
                {t('common.analyzingSubtitle')}
              </Text>

              <View style={[styles.stepsCard, { backgroundColor: themeColors.cardBg, borderColor: themeColors.inputBorder }]}>
                <View style={styles.stepItem}>
                  <Text style={[styles.stepText, { color: themeColors.textSecondary }, analysisStep >= 1 && { color: themeColors.textPrimary, fontWeight: '700' }]}>
                    {t('common.dbAnalysis')}
                  </Text>
                  {analysisStep > 1 ? (
                    <Icon name="solar:check-circle-bold" color={colors.green} size={22} />
                  ) : analysisStep === 1 ? (
                    <Animated.View style={{ transform: [{ rotate: spin }] }}>
                      <Icon name="solar:restart-circle-linear" color={colors.green} size={22} />
                    </Animated.View>
                  ) : (
                    <Icon name="solar:minus-circle-linear" color="#CBD5E0" size={22} />
                  )}
                </View>

                <View style={styles.stepItem}>
                  <Text style={[styles.stepText, { color: themeColors.textSecondary }, analysisStep >= 2 && { color: themeColors.textPrimary, fontWeight: '700' }]}>
                    {t('common.reportsCheck')}
                  </Text>
                  {analysisStep > 2 ? (
                    <Icon name="solar:check-circle-bold" color={colors.green} size={22} />
                  ) : analysisStep === 2 ? (
                    <Animated.View style={{ transform: [{ rotate: spin }] }}>
                      <Icon name="solar:restart-circle-linear" color={colors.green} size={22} />
                    </Animated.View>
                  ) : (
                    <Icon name="solar:minus-circle-linear" color="#CBD5E0" size={22} />
                  )}
                </View>

                <View style={styles.stepItem}>
                  <Text style={[styles.stepText, { color: themeColors.textSecondary }, analysisStep >= 3 && { color: themeColors.textPrimary, fontWeight: '700' }]}>
                    {t('common.communityCheck')}
                  </Text>
                  {analysisStep > 3 ? (
                    <Icon name="solar:check-circle-bold" color={colors.green} size={22} />
                  ) : analysisStep === 3 ? (
                    <Animated.View style={{ transform: [{ rotate: spin }] }}>
                      <Icon name="solar:restart-circle-linear" color={colors.green} size={22} />
                    </Animated.View>
                  ) : (
                    <Icon name="solar:minus-circle-linear" color="#CBD5E0" size={22} />
                  )}
                </View>

                <View style={styles.stepItem}>
                  <Text style={[styles.stepText, { color: themeColors.textSecondary }, analysisStep >= 4 && { color: themeColors.textPrimary, fontWeight: '700' }]}>
                    {t('common.riskCalculation')}
                  </Text>
                  {analysisStep > 4 ? (
                    <Icon name="solar:check-circle-bold" color={colors.green} size={22} />
                  ) : analysisStep === 4 ? (
                    <Animated.View style={{ transform: [{ rotate: spin }] }}>
                      <Icon name="solar:restart-circle-linear" color={colors.green} size={22} />
                    </Animated.View>
                  ) : (
                    <Icon name="solar:minus-circle-linear" color="#CBD5E0" size={22} />
                  )}
                </View>
              </View>

              <View style={[styles.infoCard, { backgroundColor: isDark ? '#1E293B' : '#EBF3FF' }]}>
                <Icon name="solar:info-circle-linear" color="#3B82F6" size={20} style={{ marginRight: 10 }} />
                <Text style={[styles.infoText, { color: isDark ? '#93C5FD' : '#1D4ED8' }]}>
                  {t('common.operationTimeInfo')}
                </Text>
              </View>
            </View>
          )}

          {viewState === 'result' && (
            <View style={styles.resultContainer}>
              <View style={styles.statusPillBanner}>
                <Text style={styles.statusPillText}>{t('common.secured')}</Text>
              </View>

              <View style={[styles.graphicCircleBg, { backgroundColor: isDark ? '#1E293B' : '#E6F7F0' }]}>
                <View style={[styles.innerShieldIcon, { backgroundColor: isDark ? '#0F172A' : '#FFFFFF' }]}>
                  <Icon name="solar:shield-check-bold" color={colors.green} size={64} />
                </View>
              </View>

              <View style={styles.riskCard}>
                <View style={styles.riskHeader}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={styles.riskTitle}>{t('common.riskScore')}</Text>
                    <Icon name="solar:info-circle-linear" color="rgba(255,255,255,0.8)" size={14} style={{ marginLeft: 4 }} />
                  </View>
                  <View style={styles.riskLevelBadge}>
                    <Text style={styles.riskLevelText}>{t('common.veryLow')}</Text>
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

              <View style={styles.communitySection}>
                <Text style={[styles.communityTitle, { color: themeColors.textPrimary }]}>
                  {t('common.communityHistory')}
                </Text>

                <View style={[styles.statRow, { borderBottomColor: themeColors.inputBorder }]}>
                  <View style={styles.iconCircleDark}>
                    <Icon name="solar:bell-bold" color={colors.white} size={16} />
                  </View>
                  <Text style={[styles.statLabel, { color: themeColors.textSecondary }]}>
                    {t('common.reportsCount')}
                  </Text>
                  <Text style={[styles.statValue, { color: themeColors.textPrimary }]}>0</Text>
                </View>

                <View style={[styles.statRow, { borderBottomColor: themeColors.inputBorder }]}>
                  <View style={styles.iconCircleDark}>
                    <Icon name="solar:chat-dots-bold" color={colors.white} size={16} />
                  </View>
                  <Text style={[styles.statLabel, { color: themeColors.textSecondary }]}>
                    {t('common.positiveComments')}
                  </Text>
                  <Text style={[styles.statValue, { color: themeColors.textPrimary }]}>24</Text>
                </View>

                <Text style={[styles.lastReportSub, { color: themeColors.textSecondary }]}>
                  {t('common.lastReportAgo')}
                </Text>
              </View>

              <View style={styles.dualActionsRow}>
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => router.push('/(app)/report')}
                  style={styles.signalerBtn}
                >
                  <Text style={styles.actionBtnText}>{t('common.report')}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => router.push('/(app)/transfer')}
                  style={styles.transfererBtn}
                >
                  <Text style={styles.actionBtnText}>{t('common.transfer')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </ScrollView>
      </View>

      {/* Bouton fixe "Choisir dans contacts" */}
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
            style={styles.contactsBtn}
          >
            <Icon name="solar:users-group-two-rounded-bold" color={colors.white} size={20} style={{ marginRight: 10 }} />
            <Text style={styles.contactsBtnText}>{t('common.chooseFromContacts')}</Text>
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
  header: {
    backgroundColor: colors.green,
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: {
    padding: 6,
  },
  headerTitle: {
    fontFamily: fonts.h6,
    fontSize: scaleFont(18),
    fontWeight: '700',
    color: colors.white,
  },
  mainCardSheet: {
    flex: 1,
    borderTopLeftRadius: 36,
    borderTopRightRadius: 0,
    overflow: 'hidden',
  },
  scrollBody: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  idleContainer: {
    flex: 1,
  },
  inputCard: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 54,
    borderRadius: 14,
    borderWidth: 1.5,
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
    gap: 4,
  },
  flagEmoji: {
    fontSize: 18,
    marginRight: 2,
  },
  countryCodeText: {
    fontFamily: fonts.bold,
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
  historySection: {
    marginTop: 8,
  },
  historySectionTitle: {
    fontFamily: fonts.headlineBold,
    fontSize: scaleFont(16),
    fontWeight: '700',
    marginBottom: 14,
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
    gap: 8,
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  avatarCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#94A3B8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  historyPhone: {
    fontFamily: fonts.semiBold,
    fontSize: scaleFont(14),
  },
  historySub: {
    fontFamily: fonts.regular,
    fontSize: scaleFont(11),
    marginTop: 2,
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
    backgroundColor: '#E6F7F0',
    paddingHorizontal: 18,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 20,
  },
  statusPillText: {
    fontFamily: fonts.bold,
    fontSize: scaleFont(13),
    color: colors.green,
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
  bottomContactsWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
  },
  contactsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.orange,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  contactsBtnText: {
    fontFamily: fonts.semiBold,
    fontSize: scaleFont(15),
    color: colors.white,
  },
});
