import React, { useState } from 'react';
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useTranslation } from 'react-i18next';
import { Icon } from '@/shared/ui/Icon';
import { useAppTheme } from '@/shared/hooks/useAppTheme';
import { AuthGradientBackground } from '@/shared/components/AuthGradientBackground';
import { Input } from '@/shared/ui/Input';
import { Button } from '@/shared/ui/Button';
import { validateEmail } from '@/shared/lib/validation';
import { useForgotPassword } from '@/features/auth/hooks/useForgotPassword';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { colors: themeColors } = useAppTheme();
  const { handleForgotPassword } = useForgotPassword();
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');

  const handleReset = async () => {
    setEmailError('');
    if (!email.trim()) {
      setEmailError(t('validation.emailRequired'));
      return false;
    }
    if (!validateEmail(email)) {
      setEmailError(t('validation.emailInvalid'));
      return false;
    }

    const res = await handleForgotPassword(email);
    if (res.success) {
      router.push({ pathname: '/(auth)/reset-password', params: { email: email.trim() } });
      return true;
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
          <Text className="font-montserrat-bold text-3xl text-white mt-5">
            {t('auth.forgotTitle')}
          </Text>
          <Text className="font-medium text-base text-white/95 mt-3 mb-10">
            {t('auth.forgotSubtitle')}
          </Text>

          <View className="mb-6">
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
          </View>

          <Button
            title={t('common.reset')}
            onPress={handleReset}
            variant="primary"
            size="md"
          />

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.back()}
            className="mt-4 items-center py-2.5"
          >
            <Text className="font-semibold text-sm text-slate-700 dark:text-slate-300">
              {t('common.back')}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </AuthGradientBackground>
  );
}
