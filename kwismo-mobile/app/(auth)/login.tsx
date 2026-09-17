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
  const { colors: themeColors } = useAppTheme();
  const { handleLogin: loginApiCall } = useLogin();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

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

    const res = await loginApiCall(email, password, rememberMe);
    if (res.success) {
      router.replace('/(app)');
      return true;
    } else if (res.requiresDeviceVerification || res.requiresEmailVerification) {
      router.push({ pathname: '/(auth)/otp', params: { email: email.trim() } });
      return false;
    }
    return false;
  };

  return (
    <AuthGradientBackground>
      <StatusBar style="light" />

      <KeyboardAvoidingView
        className="flex-1"
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
          <Text className="font-montserrat-bold text-3xl text-white mt-2.5">
            {t('auth.loginTitle')}
          </Text>
          <Text className="font-medium text-base text-white/95 mt-3 mb-8">
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
              <Text className="font-caption text-xs text-slate-700 dark:text-slate-200">
                {t('auth.forgotPasswordLink')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setRememberMe(!rememberMe)}
              className="flex-row items-center mb-16"
            >
              <View
                className={`wx-5 hx-5 rounded border-2 items-center justify-center mr-3 ${
                  rememberMe
                    ? 'bg-brand-green dark:bg-brand-green border-brand-green dark:border-brand-green'
                    : 'border-slate-400 dark:border-slate-600'
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
              <Text className="font-medium text-base text-slate-800 dark:text-slate-200">
                {t('common.rememberMe')}
              </Text>
            </TouchableOpacity>

            <View className="mb-5">
              <Button
                title={t('common.login')}
                onPress={handleLogin}
                variant="primary"
                size="md"
              />
            </View>

            <View className="flex-row items-center mb-5">
              <View className="flex-1 h-[1px] bg-slate-300/80 dark:bg-slate-700" />
              <Text className="font-medium text-base text-slate-600 dark:text-slate-400 mx-4">
                {t('common.or')}
              </Text>
              <View className="flex-1 h-[1px] bg-slate-300/80 dark:bg-slate-700" />
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
