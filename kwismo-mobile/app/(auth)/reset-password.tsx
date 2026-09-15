/// <reference types="nativewind/types" />
import React, { useState } from 'react';
import {
  View,
  Text,
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
import { validatePassword } from '@/shared/lib/validation';
import { colors } from '@/styles/tokens';
import { useResetPassword } from '@/features/auth/hooks/useForgotPassword';

export default function ResetPasswordScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ token?: string }>();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { colors: themeColors } = useAppTheme();
  const { handleResetPassword } = useResetPassword();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  const passwordAnalysis = validatePassword(newPassword);

  const validateForm = () => {
    let isValid = true;
    setPasswordError('');
    setConfirmPasswordError('');

    if (!newPassword) {
      setPasswordError(t('validation.passwordRequired'));
      isValid = false;
    } else if (!passwordAnalysis.isValid) {
      setPasswordError(t('validation.passwordCriteria'));
      isValid = false;
    }

    if (!confirmPassword) {
      setConfirmPasswordError(t('validation.required'));
      isValid = false;
    } else if (newPassword !== confirmPassword) {
      setConfirmPasswordError(t('validation.passwordsDoNotMatch'));
      isValid = false;
    }

    return isValid;
  };

  const handleResetConfirm = async () => {
    if (!validateForm()) return false;

    const token = params.token || 'demo-token';
    const res = await handleResetPassword(token, newPassword);
    if (res.success) {
      router.replace('/(auth)/login');
      return true;
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
          <Text className="font-montserrat-bold text-[34px] leading-[44px] text-white mt-5">
            {t('auth.resetTitle')}
          </Text>
          <Text className="font-medium text-base leading-[22px] text-white/95 mt-3 mb-8">
            {t('auth.resetSubtitle')}
          </Text>

          <Input
            placeholder={t('common.newPassword')}
            value={newPassword}
            onChangeText={(val) => {
              setNewPassword(val);
              if (passwordError) setPasswordError('');
            }}
            error={passwordError}
            isPassword
            leftIcon={<Icon name="solar:lock-password-linear" color={themeColors.inputPlaceholder} size={20} />}
          />

          {newPassword.length > 0 && (
            <View className="mb-4">
              <View className="flex-row gap-1.5 mb-2.5">
                {[1, 2, 3, 4, 5].map((idx) => (
                  <View
                    key={`crit-bar-${idx}`}
                    className={`flex-1 h-1 rounded-full ${
                      passwordAnalysis.score >= idx
                        ? passwordAnalysis.score === 5
                          ? 'bg-emerald-500'
                          : 'bg-amber-500'
                        : 'bg-slate-300'
                    }`}
                  />
                ))}
              </View>

              <View className="flex-row flex-wrap justify-between gap-y-2">
                <View className="flex-row items-center w-[48%]">
                  <Icon
                    name={passwordAnalysis.criteria.minLength ? 'solar:check-circle-bold' : 'solar:close-circle-linear'}
                    size={14}
                    color={passwordAnalysis.criteria.minLength ? colors.green : themeColors.inputPlaceholder}
                  />
                  <Text className={`font-medium text-xs ml-1.5 ${passwordAnalysis.criteria.minLength ? 'text-emerald-600' : 'text-slate-500'}`}>
                    {t('validation.criteriaMinLength')}
                  </Text>
                </View>

                <View className="flex-row items-center w-[48%]">
                  <Icon
                    name={passwordAnalysis.criteria.hasUppercase ? 'solar:check-circle-bold' : 'solar:close-circle-linear'}
                    size={14}
                    color={passwordAnalysis.criteria.hasUppercase ? colors.green : themeColors.inputPlaceholder}
                  />
                  <Text className={`font-medium text-xs ml-1.5 ${passwordAnalysis.criteria.hasUppercase ? 'text-emerald-600' : 'text-slate-500'}`}>
                    {t('validation.criteriaUppercase')}
                  </Text>
                </View>

                <View className="flex-row items-center w-[48%]">
                  <Icon
                    name={passwordAnalysis.criteria.hasLowercase ? 'solar:check-circle-bold' : 'solar:close-circle-linear'}
                    size={14}
                    color={passwordAnalysis.criteria.hasLowercase ? colors.green : themeColors.inputPlaceholder}
                  />
                  <Text className={`font-medium text-xs ml-1.5 ${passwordAnalysis.criteria.hasLowercase ? 'text-emerald-600' : 'text-slate-500'}`}>
                    {t('validation.criteriaLowercase')}
                  </Text>
                </View>

                <View className="flex-row items-center w-[48%]">
                  <Icon
                    name={passwordAnalysis.criteria.hasNumber ? 'solar:check-circle-bold' : 'solar:close-circle-linear'}
                    size={14}
                    color={passwordAnalysis.criteria.hasNumber ? colors.green : themeColors.inputPlaceholder}
                  />
                  <Text className={`font-medium text-xs ml-1.5 ${passwordAnalysis.criteria.hasNumber ? 'text-emerald-600' : 'text-slate-500'}`}>
                    {t('validation.criteriaNumber')}
                  </Text>
                </View>

                <View className="flex-row items-center w-[48%]">
                  <Icon
                    name={passwordAnalysis.criteria.hasSymbol ? 'solar:check-circle-bold' : 'solar:close-circle-linear'}
                    size={14}
                    color={passwordAnalysis.criteria.hasSymbol ? colors.green : themeColors.inputPlaceholder}
                  />
                  <Text className={`font-medium text-xs ml-1.5 ${passwordAnalysis.criteria.hasSymbol ? 'text-emerald-600' : 'text-slate-500'}`}>
                    {t('validation.criteriaSymbol')}
                  </Text>
                </View>
              </View>
            </View>
          )}

          <Input
            placeholder={t('common.confirmPassword')}
            value={confirmPassword}
            onChangeText={(val) => {
              setConfirmPassword(val);
              if (confirmPasswordError) setConfirmPasswordError('');
            }}
            error={confirmPasswordError}
            isPassword
            leftIcon={<Icon name="solar:lock-password-linear" color={themeColors.inputPlaceholder} size={20} />}
            containerStyle={{ marginBottom: 28 }}
          />

          <Button
            title={t('common.reset')}
            onPress={handleResetConfirm}
            variant="primary"
            size="md"
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </AuthGradientBackground>
  );
}
