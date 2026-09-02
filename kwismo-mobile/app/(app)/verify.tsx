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
import { Icon } from '../../src/shared/ui/Icon';
import { Button } from '../../src/shared/ui/Button';
import { HeaderActions } from '../../src/shared/components/HeaderActions';
import { useAppTheme } from '../../src/shared/hooks/useAppTheme';
import { colors, fonts } from '../../src/styles/tokens';
import { scaleFont } from '../../src/shared/lib/responsive';

export default function VerifyScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { isDark, colors: themeColors } = useAppTheme();

  const [viewState, setViewState] = useState<'idle' | 'analyzing' | 'result'>('idle');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode, setCountryCode] = useState('+237');
  const [phoneError, setPhoneError] = useState('');
  const [analysisStep, setAnalysisStep] = useState(1);
  const spinValue = useState(new Animated.Value(0))[0];

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

  const handleVerify = async () => {
    setPhoneError('');
    if (!phoneNumber.trim()) {
      setPhoneError(t('validation.required'));
      return false;
    }
    if (phoneNumber.trim().length < 6) {
      setPhoneError(t('validation.phoneNumberInvalid'));
      return false;
    }

    setViewState('analyzing');
    setAnalysisStep(1);

    setTimeout(() => setAnalysisStep(2), 700);
    setTimeout(() => setAnalysisStep(3), 1500);
    setTimeout(() => setAnalysisStep(4), 2200);
    setTimeout(() => setViewState('result'), 3000);
    return true;
  };

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <StatusBar style="light" />

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
              <View
                style={[
                  styles.inputCard,
                  {
                    backgroundColor: themeColors.cardBg,
                    borderColor: phoneError ? '#EF4444' : themeColors.inputBorder,
                  },
                ]}
              >
                <Icon name="solar:phone-linear" color={themeColors.inputPlaceholder} size={20} style={{ marginRight: 8 }} />
                <TouchableOpacity activeOpacity={0.7} style={styles.countryPicker}>
                  <Text style={[styles.countryCodeText, { color: themeColors.textPrimary }]}>
                    {countryCode}
                  </Text>
                  <Icon name="solar:alt-arrow-down-linear" color={themeColors.inputPlaceholder} size={16} />
                </TouchableOpacity>
                <View style={[styles.inputDivider, { backgroundColor: themeColors.inputBorder }]} />
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
              </View>

              {phoneError ? (
                <View style={styles.errorRow}>
                  <Icon name="solar:danger-circle-bold" color="#EF4444" size={14} />
                  <Text style={styles.errorText}>{phoneError}</Text>
                </View>
              ) : null}

              <Button
                title={t('common.verify')}
                onPress={handleVerify}
                variant="primary"
                size="md"
                style={{ marginTop: 16, marginBottom: 24 }}
              />

              <View style={styles.historyList}>
                {Array.from({ length: 9 }).map((_, idx) => (
                  <View key={`history-${idx}`} style={styles.historyRow}>
                    <View style={styles.avatarCircle} />
                    <View>
                      <Text style={[styles.historyPhone, { color: themeColors.textPrimary }]}>
                        +237 6 98 44 43 88
                      </Text>
                      <Text style={[styles.historySub, { color: themeColors.textSecondary }]}>
                        {t('common.verifyNumber')}
                      </Text>
                    </View>
                  </View>
                ))}
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
                <Icon name="solar:phone-linear" color={themeColors.inputPlaceholder} size={20} style={{ marginRight: 8 }} />
                <Text style={[styles.countryCodeText, { color: themeColors.textPrimary }]}>
                  {countryCode}
                </Text>
                <Icon name="solar:alt-arrow-down-linear" color={themeColors.inputPlaceholder} size={16} style={{ marginRight: 12 }} />
                <Text style={[styles.phoneTextReadonly, { color: themeColors.textPrimary }]}>
                  {phoneNumber}
                </Text>
              </View>

              <View style={styles.graphicCircleBg}>
                <View style={styles.innerShieldIcon}>
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

              <View style={styles.graphicCircleBg}>
                <View style={styles.innerShieldIcon}>
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

      {viewState === 'idle' && (
        <View
          style={[
            styles.bottomContactsWrapper,
            { paddingBottom: Math.max(insets.bottom + 12, 20) },
          ]}
        >
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => router.push('/(app)/contacts')}
            style={styles.contactsBtn}
          >
            <Icon name="solar:users-group-two-rounded-bold" color={colors.white} size={20} style={{ marginRight: 10 }} />
            <Text style={styles.contactsBtnText}>{t('common.chooseFromContacts')}</Text>
          </TouchableOpacity>
        </View>
      )}
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
  moreBtn: {
    padding: 6,
  },
  mainCardSheet: {
    flex: 1,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
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
    borderWidth: 1,
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
    paddingRight: 8,
  },
  countryCodeText: {
    fontFamily: fonts.bold,
    fontSize: scaleFont(15),
    marginRight: 4,
  },
  inputDivider: {
    width: 1,
    height: 24,
    marginHorizontal: 8,
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
  historyList: {
    marginTop: 10,
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
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
    paddingHorizontal: 14,
    marginBottom: 28,
  },
  phoneTextReadonly: {
    fontFamily: fonts.bold,
    fontSize: scaleFont(15),
  },
  graphicCircleBg: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#E6F7F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  innerShieldIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  analyzingTitle: {
    fontFamily: fonts.h6,
    fontSize: scaleFont(20),
    fontWeight: '700',
    marginBottom: 6,
  },
  analyzingSub: {
    fontFamily: fonts.regular,
    fontSize: scaleFont(13),
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 24,
    paddingHorizontal: 10,
  },
  stepsCard: {
    width: '100%',
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    marginBottom: 20,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
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
    fontFamily: fonts.regular,
    fontSize: scaleFont(12),
    lineHeight: 18,
  },
  resultContainer: {
    alignItems: 'center',
  },
  statusPillBanner: {
    width: '100%',
    height: 48,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: colors.green,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  statusPillText: {
    fontFamily: fonts.bold,
    fontSize: scaleFont(18),
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
    fontSize: scaleFont(14),
    color: colors.white,
  },
  riskLevelBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  riskLevelText: {
    fontFamily: fonts.medium,
    fontSize: 11,
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
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.85)',
  },
  gaugeBarBackground: {
    width: '100%',
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    overflow: 'hidden',
  },
  gaugeBarFill: {
    height: '100%',
    backgroundColor: colors.white,
    borderRadius: 4,
  },
  communitySection: {
    width: '100%',
    marginBottom: 24,
  },
  communityTitle: {
    fontFamily: fonts.bold,
    fontSize: scaleFont(15),
    marginBottom: 14,
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
    backgroundColor: '#1E293B',
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
    height: 52,
    backgroundColor: colors.orange,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  transfererBtn: {
    flex: 1,
    height: 52,
    backgroundColor: '#1E293B',
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnText: {
    fontFamily: fonts.bold,
    fontSize: scaleFont(15),
    color: colors.white,
  },
  bottomContactsWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  contactsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    backgroundColor: '#1E293B',
    borderRadius: 14,
  },
  contactsBtnText: {
    fontFamily: fonts.bold,
    fontSize: scaleFont(15),
    color: colors.white,
  },
});
