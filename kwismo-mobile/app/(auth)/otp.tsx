import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { Icon } from '../../src/shared/ui/Icon';
import { LanguageSwitcher } from '../../src/shared/components/LanguageSwitcher';
import { useAppTheme } from '../../src/shared/hooks/useAppTheme';
import { Input } from '../../src/shared/ui/Input';
import { Button } from '../../src/shared/ui/Button';
import { toast } from '../../src/shared/store/toastStore';
import { validateEmail } from '../../src/shared/lib/validation';
import { colors, fonts } from '../../src/styles/tokens';
import { scaleFont } from '../../src/shared/lib/responsive';

import { useLocalSearchParams } from 'expo-router';
import { useOtp } from '../../src/features/auth/hooks/useOtp';

export default function OtpScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ email?: string }>();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { isDark, colors: themeColors } = useAppTheme();

  const initialEmailParam = (params.email || '').trim();
  const [step, setStep] = useState<'email' | 'code'>(initialEmailParam ? 'code' : 'email');
  const [email, setEmail] = useState(initialEmailParam);
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);

  const { verifyOtp: verifyOtpCall, resendOtp: resendOtpCall, loading, resendTimer, canResend } = useOtp(email);
  const [emailError, setEmailError] = useState('');
  const [otpError, setOtpError] = useState('');

  const inputRefs = useRef<Array<TextInput | null>>([]);

  const handleSendEmail = async () => {
    setEmailError('');
    if (!email.trim()) {
      setEmailError(t('validation.emailRequired'));
      return false;
    }
    if (!validateEmail(email)) {
      setEmailError(t('validation.emailInvalid'));
      return false;
    }

    setStep('code');
    toast.info(t('toasts.otpSent'));
    return true;
  };

  const handleOtpChange = (text: string, index: number) => {
    if (otpError) setOtpError('');
    const newOtp = [...otpDigits];
    newOtp[index] = text;
    setOtpDigits(newOtp);

    if (text && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleResend = async () => {
    setOtpDigits(['', '', '', '', '', '']);
    inputRefs.current[0]?.focus();
    await resendOtpCall(email);
  };

  const handleValidate = async () => {
    setOtpError('');
    const enteredCode = otpDigits.join('');
    if (enteredCode.length < 6) {
      setOtpError(t('validation.otpIncomplete'));
      return false;
    }

    const res = await verifyOtpCall(enteredCode, email);
    if (res.success) {
      router.replace('/(app)');
      return true;
    } else {
      setOtpError(res.message || t('errors.generalMessage'));
      return false;
    }
  };


  const headerGradientColors = isDark
    ? ['#2BB673', '#249460', '#1B2E3D', '#162035', '#0F1626', '#0F1626']
    : ['#2BB673', '#28A86B', '#249460', '#213E35', '#23303B', '#3C4A56', '#60707F', '#98A8B8', '#D8E2EC', '#FFFFFF', '#FFFFFF'];

  const headerGradientLocations = isDark
    ? [0, 0.25, 0.5, 0.7, 0.85, 1.0]
    : [0, 0.10, 0.20, 0.30, 0.38, 0.46, 0.53, 0.60, 0.66, 0.72, 0.76, 1.0];

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.container, { backgroundColor: themeColors.background }]}>
        <StatusBar style="light" />

        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          <LinearGradient
            colors={headerGradientColors}
            locations={headerGradientLocations}
            style={StyleSheet.absoluteFill}
          />
        </View>

        <View style={[styles.langWrapper, { top: Math.max(insets.top + 16, 20) }]}>
          <LanguageSwitcher darkTheme={true} />
        </View>

        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingTop: Math.max(insets.top + 50, 70),
              paddingBottom: Math.max(insets.bottom + 30, 40),
            },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.title}>{t('auth.secureAccountTitle')}</Text>

          {step === 'email' ? (
            <>
              <Text style={styles.subtitle}>
                {t('auth.secureAccountEmailSubtitle')}
              </Text>

              <Input
                placeholder={t('common.email')}
                value={email}
                onChangeText={(val) => {
                  setEmail(val);
                  if (emailError) setEmailError('');
                }}
                error={emailError}
                keyboardType="email-address"
                autoCapitalize="none"
                leftIcon={<Icon name="solar:letter-linear" color={themeColors.inputPlaceholder} size={20} />}
                containerStyle={{ marginBottom: 24 }}
              />

              <Button
                title={t('common.send')}
                onPress={handleSendEmail}
                variant="primary"
                size="md"
              />
            </>
          ) : (
            <>
              <Text style={styles.subtitle}>
                {t('auth.secureAccountOtpSubtitle')}
              </Text>

              <View style={styles.otpRow}>
                {otpDigits.map((digit, index) => (
                  <View
                    key={`otp-${index}`}
                    style={[
                      styles.otpBox,
                      {
                        backgroundColor: themeColors.cardBg,
                        borderColor: otpError
                          ? '#EF4444'
                          : digit
                          ? colors.green
                          : themeColors.inputBorder,
                      },
                    ]}
                  >
                    <TextInput
                      ref={(el) => (inputRefs.current[index] = el)}
                      style={[
                        styles.otpInput,
                        {
                          color: themeColors.textPrimary,
                          fontSize: scaleFont(22),
                        },
                        Platform.OS === 'web' ? ({ outline: 'none', outlineStyle: 'none' } as any) : {},
                      ]}
                      keyboardType="number-pad"
                      maxLength={1}
                      value={digit}
                      onChangeText={(text) => handleOtpChange(text, index)}
                      onKeyPress={(e) => handleKeyPress(e, index)}
                      selectTextOnFocus
                    />
                  </View>
                ))}
              </View>

              {/* Message d'erreur OTP inline */}
              {otpError ? (
                <View style={styles.otpErrorRow}>
                  <Icon name="solar:danger-circle-bold" color="#EF4444" size={14} />
                  <Text style={styles.otpErrorText}>{otpError}</Text>
                </View>
              ) : null}

              <View style={styles.resendRow}>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={handleResend}
                  disabled={!canResend}
                >
                  <Text style={[styles.resendText, { color: themeColors.textPrimary }]}>
                    {t('auth.alreadySentQuestion')}{' '}
                    <Text
                      style={[
                        styles.resendLink,
                        { color: !canResend ? themeColors.textSecondary : colors.green },
                      ]}
                    >
                      {t('auth.resendCode')}
                    </Text>
                  </Text>
                </TouchableOpacity>

                <Text style={[styles.timerText, { color: themeColors.textPrimary }]}>
                  {resendTimer}s
                </Text>
              </View>

              <Button
                title={t('common.validate')}
                onPress={handleValidate}
                variant="primary"
                size="md"
              />
            </>
          )}
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  langWrapper: {
    position: 'absolute',
    right: 20,
    zIndex: 20,
  },
  scrollContent: {
    paddingHorizontal: 24,
    zIndex: 10,
  },
  title: {
    fontFamily: fonts.h2,
    fontSize: 34,
    fontWeight: '700',
    color: colors.white,
    marginTop: 20,
    lineHeight: 44,
  },
  subtitle: {
    fontFamily: fonts.medium,
    fontSize: 15,
    color: colors.white,
    opacity: 0.95,
    marginTop: 12,
    marginBottom: 36,
    lineHeight: 22,
  },
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 8,
  },
  otpBox: {
    flex: 1,
    height: 56,
    maxWidth: 52,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  otpInput: {
    fontFamily: fonts.bold,
    textAlign: 'center',
    width: '100%',
    height: '100%',
  },
  otpErrorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  otpErrorText: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: '#EF4444',
  },
  resendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 32,
    paddingHorizontal: 4,
  },
  resendText: {
    fontFamily: fonts.medium,
    fontSize: 13,
  },
  resendLink: {
    fontFamily: fonts.semiBold,
    textDecorationLine: 'underline',
  },
  timerText: {
    fontFamily: fonts.bold,
    fontSize: 14,
  },
});

