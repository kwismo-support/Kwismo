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
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft,
  Phone,
  ChevronDown,
  Users,
  CheckCircle2,
  MinusCircle,
  Loader2,
  Info,
  ShieldCheck,
  Bell,
  MessageSquare,
  MoreVertical,
} from 'lucide-react-native';
import { SkeletonItem } from '../../src/shared/components/SkeletonItem';
import { colors, fonts } from '../../src/styles/tokens';

export default function VerifyScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  // Screen State: 'idle' (Image 2) | 'analyzing' (Image 3) | 'result' (Image 4)
  const [viewState, setViewState] = useState<'idle' | 'analyzing' | 'result'>('idle');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode, setCountryCode] = useState('+237');
  const [analysisStep, setAnalysisStep] = useState(1); // 1 to 4
  const spinValue = useState(new Animated.Value(0))[0];

  // Animated Spinner
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

  // Handle Verification Action
  const handleVerify = () => {
    setViewState('analyzing');
    setAnalysisStep(1);

    // Step by step analysis progress simulation
    setTimeout(() => setAnalysisStep(2), 700);
    setTimeout(() => setAnalysisStep(3), 1500);
    setTimeout(() => setAnalysisStep(4), 2200);
    setTimeout(() => setViewState('result'), 3000);
  };

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      {/* Top Green Header matching Images 2, 3, 4 */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
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
            <ArrowLeft color={colors.white} size={22} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('common.verifyNumber')}</Text>
          <TouchableOpacity activeOpacity={0.7} style={styles.moreBtn}>
            <MoreVertical color={colors.white} size={22} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Content View based on current viewState */}
      <ScrollView
        contentContainerStyle={[
          styles.scrollBody,
          { paddingBottom: insets.bottom + 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* State 1: IDLE / INPUT (Image 2) */}
        {viewState === 'idle' && (
          <View style={styles.idleContainer}>
            {/* Phone Input Card */}
            <View style={styles.inputCard}>
              <Phone color="#94A3B8" size={20} style={{ marginRight: 8 }} />
              <TouchableOpacity activeOpacity={0.7} style={styles.countryPicker}>
                <Text style={styles.countryCodeText}>{countryCode}</Text>
                <ChevronDown color="#94A3B8" size={16} />
              </TouchableOpacity>
              <View style={styles.inputDivider} />
              <TextInput
                style={styles.phoneInput}
                placeholder={t('common.phoneNumber')}
                placeholderTextColor="#A0AEC0"
                keyboardType="phone-pad"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
              />
            </View>

            {/* Verify Action Button */}
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleVerify}
              style={styles.verifyBtn}
            >
              <Text style={styles.verifyBtnText}>{t('common.verify')}</Text>
            </TouchableOpacity>

            {/* History List */}
            <View style={styles.historyList}>
              {Array.from({ length: 9 }).map((_, idx) => (
                <View key={`history-${idx}`} style={styles.historyRow}>
                  <View style={styles.avatarCircle} />
                  <View>
                    <Text style={styles.historyPhone}>+237 6 98 44 43 88</Text>
                    <Text style={styles.historySub}>Verification de numero</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* State 2: ANALYZING (Image 3) */}
        {viewState === 'analyzing' && (
          <View style={styles.analyzingContainer}>
            {/* Number Bar */}
            <View style={styles.inputCardReadonly}>
              <Phone color="#94A3B8" size={20} style={{ marginRight: 8 }} />
              <Text style={styles.countryCodeText}>{countryCode}</Text>
              <ChevronDown color="#94A3B8" size={16} style={{ marginRight: 12 }} />
              <Text style={styles.phoneTextReadonly}>
                {phoneNumber || '698 44 43 88'}
              </Text>
            </View>

            {/* Center Animated Shield Graphic */}
            <View style={styles.graphicCircleBg}>
              <View style={styles.innerShieldIcon}>
                <ShieldCheck color={colors.green} size={64} />
              </View>
            </View>

            <Text style={styles.analyzingTitle}>{t('common.analyzing')}</Text>
            <Text style={styles.analyzingSub}>{t('common.analyzingSubtitle')}</Text>

            {/* Animated Step Progress Checklist matching Image 3 */}
            <View style={styles.stepsCard}>
              {/* Step 1 */}
              <View style={styles.stepItem}>
                <Text
                  style={[
                    styles.stepText,
                    analysisStep >= 1 && styles.stepTextActive,
                  ]}
                >
                  {t('common.dbAnalysis')}
                </Text>
                {analysisStep > 1 ? (
                  <CheckCircle2 color={colors.green} size={22} />
                ) : analysisStep === 1 ? (
                  <Animated.View style={{ transform: [{ rotate: spin }] }}>
                    <Loader2 color={colors.green} size={22} />
                  </Animated.View>
                ) : (
                  <MinusCircle color="#CBD5E0" size={22} />
                )}
              </View>

              {/* Step 2 */}
              <View style={styles.stepItem}>
                <Text
                  style={[
                    styles.stepText,
                    analysisStep >= 2 && styles.stepTextActive,
                  ]}
                >
                  {t('common.reportsCheck')}
                </Text>
                {analysisStep > 2 ? (
                  <CheckCircle2 color={colors.green} size={22} />
                ) : analysisStep === 2 ? (
                  <Animated.View style={{ transform: [{ rotate: spin }] }}>
                    <Loader2 color={colors.green} size={22} />
                  </Animated.View>
                ) : (
                  <MinusCircle color="#CBD5E0" size={22} />
                )}
              </View>

              {/* Step 3 */}
              <View style={styles.stepItem}>
                <Text
                  style={[
                    styles.stepText,
                    analysisStep >= 3 && styles.stepTextActive,
                  ]}
                >
                  {t('common.communityCheck')}
                </Text>
                {analysisStep > 3 ? (
                  <CheckCircle2 color={colors.green} size={22} />
                ) : analysisStep === 3 ? (
                  <Animated.View style={{ transform: [{ rotate: spin }] }}>
                    <Loader2 color={colors.green} size={22} />
                  </Animated.View>
                ) : (
                  <MinusCircle color="#CBD5E0" size={22} />
                )}
              </View>

              {/* Step 4 */}
              <View style={styles.stepItem}>
                <Text
                  style={[
                    styles.stepText,
                    analysisStep >= 4 && styles.stepTextActive,
                  ]}
                >
                  {t('common.riskCalculation')}
                </Text>
                {analysisStep > 4 ? (
                  <CheckCircle2 color={colors.green} size={22} />
                ) : analysisStep === 4 ? (
                  <Animated.View style={{ transform: [{ rotate: spin }] }}>
                    <Loader2 color={colors.green} size={22} />
                  </Animated.View>
                ) : (
                  <MinusCircle color="#CBD5E0" size={22} />
                )}
              </View>
            </View>

            {/* Info Box */}
            <View style={styles.infoCard}>
              <Info color="#3B82F6" size={20} style={{ marginRight: 10 }} />
              <Text style={styles.infoText}>{t('common.operationTimeInfo')}</Text>
            </View>
          </View>
        )}

        {/* State 3: RESULT (Image 4) */}
        {viewState === 'result' && (
          <View style={styles.resultContainer}>
            {/* Status Pill Banner */}
            <View style={styles.statusPillBanner}>
              <Text style={styles.statusPillText}>{t('common.secured')}</Text>
            </View>

            {/* Center Verified Shield Graphic */}
            <View style={styles.graphicCircleBg}>
              <View style={styles.innerShieldIcon}>
                <ShieldCheck color={colors.green} size={64} />
              </View>
            </View>

            {/* Risk Score Card */}
            <View style={styles.riskCard}>
              <View style={styles.riskHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={styles.riskTitle}>{t('common.riskScore')}</Text>
                  <Info color="rgba(255,255,255,0.8)" size={14} style={{ marginLeft: 4 }} />
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

            {/* Community History Section */}
            <View style={styles.communitySection}>
              <Text style={styles.communityTitle}>{t('common.communityHistory')}</Text>

              <View style={styles.statRow}>
                <View style={styles.iconCircleDark}>
                  <Bell color={colors.white} size={16} />
                </View>
                <Text style={styles.statLabel}>{t('common.reportsCount')}</Text>
                <Text style={styles.statValue}>0</Text>
              </View>

              <View style={styles.statRow}>
                <View style={styles.iconCircleDark}>
                  <MessageSquare color={colors.white} size={16} />
                </View>
                <Text style={styles.statLabel}>{t('common.positiveComments')}</Text>
                <Text style={styles.statValue}>24</Text>
              </View>

              <Text style={styles.lastReportSub}>{t('common.lastReportAgo')}</Text>
            </View>

            {/* Dual Action Buttons matching Image 4 */}
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

      {/* Bottom Fixed Button: Choose from contacts (Only in Idle State) */}
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
            <Users color={colors.white} size={20} style={{ marginRight: 10 }} />
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
    backgroundColor: colors.white,
  },
  header: {
    backgroundColor: colors.green,
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
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
    fontSize: 18,
    fontWeight: '700',
    color: colors.white,
  },
  moreBtn: {
    padding: 6,
  },
  scrollBody: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  idleContainer: {
    width: '100%',
  },
  inputCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    height: 52,
    borderRadius: 14,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
    elevation: 1,
  },
  countryPicker: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  countryCodeText: {
    fontFamily: fonts.bold,
    fontSize: 15,
    color: colors.navy,
    marginRight: 4,
  },
  inputDivider: {
    width: 1,
    height: 20,
    backgroundColor: '#CBD5E0',
    marginHorizontal: 12,
  },
  phoneInput: {
    flex: 1,
    fontFamily: fonts.medium,
    fontSize: 15,
    color: colors.navy,
  },
  verifyBtn: {
    width: '100%',
    height: 52,
    backgroundColor: colors.orange,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    elevation: 2,
  },
  verifyBtnText: {
    fontFamily: fonts.medium,
    fontSize: 16,
    color: colors.white,
  },
  historyList: {
    width: '100%',
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E2E8F0',
    marginRight: 14,
  },
  historyPhone: {
    fontFamily: fonts.bold,
    fontSize: 15,
    color: colors.navy,
  },
  historySub: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
  bottomContactsWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(255,255,255,0.95)',
  },
  contactsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: 52,
    backgroundColor: colors.navy,
    borderRadius: 14,
  },
  contactsBtnText: {
    fontFamily: fonts.medium,
    fontSize: 15,
    color: colors.white,
  },
  // Analyzing State Styles
  analyzingContainer: {
    alignItems: 'center',
  },
  inputCardReadonly: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    height: 52,
    borderRadius: 14,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    width: '100%',
    marginBottom: 32,
  },
  phoneTextReadonly: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: colors.navy,
  },
  graphicCircleBg: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#E6F7F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  innerShieldIcon: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#C6EFE0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  analyzingTitle: {
    fontFamily: fonts.h3,
    fontSize: 22,
    fontWeight: '700',
    color: colors.navy,
    marginBottom: 8,
  },
  analyzingSub: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 28,
    paddingHorizontal: 16,
  },
  stepsCard: {
    width: '100%',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    marginBottom: 24,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  stepText: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: '#94A3B8',
  },
  stepTextActive: {
    color: colors.navy,
    fontFamily: fonts.bold,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    padding: 14,
    borderRadius: 14,
    width: '100%',
  },
  infoText: {
    flex: 1,
    fontFamily: fonts.medium,
    fontSize: 13,
    color: '#3B82F6',
    lineHeight: 18,
  },
  // Result State Styles
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
    marginBottom: 24,
  },
  statusPillText: {
    fontFamily: fonts.bold,
    fontSize: 20,
    color: colors.green,
    letterSpacing: 1,
  },
  riskCard: {
    width: '100%',
    backgroundColor: colors.green,
    borderRadius: 20,
    padding: 20,
    marginBottom: 28,
  },
  riskHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  riskTitle: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: colors.white,
  },
  riskLevelBadge: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  riskLevelText: {
    fontFamily: fonts.medium,
    fontSize: 12,
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
    color: colors.white,
  },
  gaugeBarBackground: {
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.4)',
    width: '100%',
    overflow: 'hidden',
  },
  gaugeBarFill: {
    height: '100%',
    backgroundColor: colors.white,
    borderRadius: 3,
  },
  communitySection: {
    width: '100%',
    marginBottom: 28,
  },
  communityTitle: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: colors.navy,
    marginBottom: 16,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
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
    fontSize: 14,
    color: colors.navy,
  },
  statValue: {
    fontFamily: fonts.bold,
    fontSize: 15,
    color: colors.navy,
  },
  lastReportSub: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 14,
  },
  dualActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: 14,
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
    backgroundColor: colors.navy,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnText: {
    fontFamily: fonts.medium,
    fontSize: 15,
    color: colors.white,
  },
});
