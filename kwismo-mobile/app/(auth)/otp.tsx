/// <reference types="nativewind/types" />
import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useTranslation } from 'react-i18next';
import { Icon } from '@/shared/ui/Icon';
import { useAppTheme } from '@/shared/hooks/useAppTheme';
import { AuthGradientBackground } from '@/shared/components/AuthGradientBackground';
import { Input } from '@/shared/ui/Input';
import { Button } from '@/shared/ui/Button';
import { toast } from '@/shared/store/toastStore';
import { validateEmail } from '@/shared/lib/validation';
import { colors } from '@/styles/tokens';
import { useOtp } from '@/features/auth/hooks/useOtp';

export default function OtpScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ email?: string }>();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { colors: themeColors } = useAppTheme();

  const initialEmailParam = (params.email || '').trim();
  const [step, setStep] = useState<'email' | 'code'>(initialEmailParam ? 'code' : 'email');
  const [email, setEmail] = useState(initialEmailParam);
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);

  const { verifyOtp: verifyOtpCall, resendOtp: resendOtpCall, resendTimer, canResend } = useOtp(email);
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

  return (
    <AuthGradientBackground>
      <StatusBar style="light" />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          className="flex-1 px-6 z-10"
          contentContainerStyle={{
            paddingTop: Math.max(insets.top + 40, 60),
            paddingBottom: Math.max(insets.bottom + 40, 60),
            flexGrow: 1,
          }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          automaticallyAdjustKeyboardInsets={true}
        >
          <Text className="font-montserrat-bold text-[34px] leading-[44px] text-white mt-5">
            {t('auth.secureAccountTitle')}
          </Text>

          {step === 'email' ? (
            <>
              <Text className="font-medium text-base leading-[22px] text-white/95 mt-3 mb-9">
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
              <Text className="font-medium text-base leading-[22px] text-white/95 mt-3 mb-6">
                {t('auth.secureAccountOtpSubtitle')}
              </Text>

              <Text className="font-medium text-body-md text-slate-700 mb-6 text-center">
                {email}
              </Text>

              <View className="flex-row justify-between mb-4 gap-2">
                {otpDigits.map((digit, index) => (
                  <View
                    key={`otp-${index}`}
                    className={`flex-1 h-14 max-w-[52px] rounded-xl border-[1.5px] items-center justify-center bg-white ${
                      otpError
                        ? 'border-red-500'
                        : digit
                        ? 'border-emerald-500'
                        : 'border-slate-300'
                    }`}
                  >
                    <TextInput
                      ref={(el) => { inputRefs.current[index] = el; }}
                      className="font-bold text-center text-slate-900 w-full h-full text-xl"
                      style={Platform.OS === 'web' ? ({ outline: 'none', outlineStyle: 'none' } as any) : {}}
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

              {otpError ? (
                <View className="flex-row items-center justify-center mb-6 gap-1.5">
                  <Icon name="solar:danger-circle-bold" size={14} color="#EF4444" />
                  <Text className="font-medium text-xs text-red-500">{otpError}</Text>
                </View>
              ) : null}

              <View className="flex-row items-center justify-between mb-8">
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={handleResend}
                  disabled={resendTimer > 0}
                >
                  <Text
                    className={`font-semibold text-sm ${
                      resendTimer > 0 ? 'text-slate-400' : 'text-emerald-700 underline'
                    }`}
                  >
                    {t('auth.alreadySentQuestion')} {t('auth.resendCode')}
                  </Text>
                </TouchableOpacity>

                <Text className="font-bold text-sm text-slate-800">
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
      </KeyboardAvoidingView>
    </AuthGradientBackground>
  );
}
