/// <reference types="nativewind/types" />
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useTranslation } from 'react-i18next';
import { Icon } from '@/shared/ui/Icon';
import { useAppTheme } from '@/shared/hooks/useAppTheme';
import { AuthGradientBackground } from '@/shared/components/AuthGradientBackground';
import { useLogin } from '@/features/auth/hooks/useLogin';
import { Input } from '@/shared/ui/Input';
import { Button } from '@/shared/ui/Button';
import { validateEmail } from '@/shared/lib/validation';
import { colors } from '@/styles/tokens';

export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { isDark, colors: themeColors } = useAppTheme();
  const { handleLogin: loginApiCall } = useLogin();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const validateForm = () => {
    let isValid = true;
    setEmailError('');
    setPasswordError('');

    if (!email.trim()) {
      setEmailError(t('validation.emailRequired'));
      isValid = false;
    } else if (!validateEmail(email)) {
      setEmailError(t('validation.emailInvalid'));
      isValid = false;
    }

    if (!password) {
      setPasswordError(t('validation.passwordRequired'));
      isValid = false;
    }

    return isValid;
  };

  const handleLogin = async () => {
    if (!validateForm()) return false;

    const res = await loginApiCall(email, password);
    if (res.success) {
      router.replace('/(app)');
      return true;
    } else if (res.requiresDeviceVerification) {
      router.push({ pathname: '/(auth)/otp', params: { email: email.trim() } });
      return false;
    }
    return false;
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
          <Text className="font-montserrat-bold text-[32px] leading-[40px] text-white mt-2.5">
            {t('auth.loginTitle')}
          </Text>
          <Text className="font-medium text-body-md text-white/95 mt-3 mb-8">
            {t('auth.loginSubtitle')}
          </Text>

          <View className="w-full">
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
            />

            <Input
              placeholder={t('common.password')}
              value={password}
              onChangeText={(val) => {
                setPassword(val);
                if (passwordError) setPasswordError('');
              }}
              error={passwordError}
              isPassword
              leftIcon={<Icon name="solar:lock-password-linear" color={themeColors.inputPlaceholder} size={20} />}
            />

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => router.push('/(auth)/forgot-password')}
              className="self-start -mt-0.5 mb-6"
            >
              <Text className="font-caption text-caption text-slate-700">
                {t('auth.forgotPasswordLink')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setRememberMe(!rememberMe)}
              className="flex-row items-center mb-16"
            >
              <View
                className={`w-5 h-5 rounded border-[1.5px] items-center justify-center mr-3 ${
                  rememberMe ? 'bg-slate-900 border-slate-900' : 'border-slate-800'
                }`}
              >
                {rememberMe && (
                  <Icon
                    name="solar:check-read-linear"
                    color={colors.white}
                    size={14}
                  />
                )}
              </View>
              <Text className="font-medium text-body-md text-slate-800">
                {t('common.rememberMe')}
              </Text>
            </TouchableOpacity>

            <Button
              title={t('common.login')}
              onPress={handleLogin}
              variant="primary"
              size="md"
              style={{ marginBottom: 20 }}
            />

            <View className="flex-row items-center mb-5">
              <View className="flex-1 h-[1px] bg-slate-300/80" />
              <Text className="font-medium text-body-md text-slate-600 mx-4">
                {t('common.or')}
              </Text>
              <View className="flex-1 h-[1px] bg-slate-300/80" />
            </View>

            <Button
              title={t('common.register')}
              onPress={() => router.push('/(auth)/register')}
              variant="secondary"
              size="md"
              minLoadingDuration={0}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </AuthGradientBackground>
  );
}
