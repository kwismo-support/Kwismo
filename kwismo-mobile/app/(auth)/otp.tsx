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
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { Mail } from 'lucide-react-native';
import { LanguageSwitcher } from '../../src/shared/components/LanguageSwitcher';
import { colors, fonts } from '../../src/styles/tokens';

export default function OtpScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  const [step, setStep] = useState<'email' | 'code'>('email');
  const [email, setEmail] = useState('');
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(30);

  const inputRefs = useRef<Array<TextInput | null>>([]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (step === 'code' && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  const handleSendEmail = () => {
    setStep('code');
    setTimer(30);
  };

  const handleOtpChange = (text: string, index: number) => {
    const newOtp = [...otpDigits];
    newOtp[index] = text;
    setOtpDigits(newOtp);

    // Auto-advance to next box
    if (text && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleResend = () => {
    setTimer(30);
  };

  const handleValidate = () => {
    router.replace('/(app)');
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.container}>
        {/* Top Green Gradient Background matching Images 3 & 4 */}
        <LinearGradient
          colors={['#32B07F', '#248563', '#205E51', '#335056', '#FFFFFF', '#FFFFFF']}
          locations={[0, 0.25, 0.45, 0.65, 0.85, 1]}
          style={StyleSheet.absoluteFill}
        />

        {/* Top Right Language Switcher */}
        <View style={[styles.langWrapper, { top: insets.top + 16 }]}>
          <LanguageSwitcher darkTheme={true} />
        </View>

        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingTop: insets.top + 70,
              paddingBottom: insets.bottom + 24,
            },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header Title */}
          <Text style={styles.title}>{t('auth.secureAccountTitle')}</Text>

          {step === 'email' ? (
            /* STEP 1: EMAIL ENTRY (Image 3) */
            <>
              <Text style={styles.subtitle}>{t('auth.secureAccountEmailSubtitle')}</Text>

              <View style={styles.inputCard}>
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder={t('common.email')}
                  placeholderTextColor={colors.inputPlaceholder}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                <Mail color="#A0AEC0" size={20} style={{ opacity: 0.7 }} />
              </View>

              <TouchableOpacity
                activeOpacity={0.85}
                onPress={handleSendEmail}
                style={styles.submitButton}
              >
                <Text style={styles.submitButtonText}>{t('common.send')}</Text>
              </TouchableOpacity>
            </>
          ) : (
            /* STEP 2: 6-DIGIT OTP CODE ENTRY (Image 4) */
            <>
              <Text style={styles.subtitle}>{t('auth.secureAccountOtpSubtitle')}</Text>

              {/* 6 Digit Input Boxes */}
              <View style={styles.otpRow}>
                {otpDigits.map((digit, index) => (
                  <View key={`otp-${index}`} style={styles.otpBox}>
                    <TextInput
                      ref={(el) => (inputRefs.current[index] = el)}
                      style={styles.otpInput}
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

              {/* Resend Link & Timer Row */}
              <View style={styles.resendRow}>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={handleResend}
                  disabled={timer > 0}
                >
                  <Text style={styles.resendText}>
                    {t('common.alreadySent')}{' '}
                    <Text style={styles.resendLink}>{t('common.resend')}</Text>
                  </Text>
                </TouchableOpacity>

                <Text style={styles.timerText}>{timer}s</Text>
              </View>

              <TouchableOpacity
                activeOpacity={0.85}
                onPress={handleValidate}
                style={styles.submitButton}
              >
                <Text style={styles.submitButtonText}>{t('common.send')}</Text>
              </TouchableOpacity>
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
    backgroundColor: colors.white,
  },
  langWrapper: {
    position: 'absolute',
    right: 20,
    zIndex: 20,
  },
  scrollContent: {
    paddingHorizontal: 24,
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
    marginBottom: 40,
    lineHeight: 22,
  },
  inputCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    height: 54,
    borderRadius: 14,
    paddingHorizontal: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  input: {
    fontFamily: fonts.medium,
    fontSize: 15,
    color: colors.navy,
    height: '100%',
  },
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  otpBox: {
    width: 48,
    height: 54,
    borderRadius: 12,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: '#E2E8F0',
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
    fontSize: 22,
    color: colors.navy,
    textAlign: 'center',
    width: '100%',
    height: '100%',
  },
  resendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 36,
    paddingHorizontal: 4,
  },
  resendText: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.navy,
  },
  resendLink: {
    fontFamily: fonts.semiBold,
    textDecorationLine: 'underline',
  },
  timerText: {
    fontFamily: fonts.bold,
    fontSize: 14,
    color: colors.navy,
  },
  submitButton: {
    width: '100%',
    height: 52,
    backgroundColor: colors.orange,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
  submitButtonText: {
    fontFamily: fonts.medium,
    fontSize: 16,
    color: colors.white,
  },
});
