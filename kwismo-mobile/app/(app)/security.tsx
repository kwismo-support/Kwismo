import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useTranslation } from 'react-i18next';
import { Icon } from '@/shared/ui/Icon';
import { Input } from '@/shared/ui/Input';
import { HeaderBar } from '@/shared/components/HeaderBar';
import { useSecurity } from '@/features/profile/hooks/useSecurity';
import { colors } from '@/styles/tokens';

export default function SecurityScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { changePassword, loading: isUpdating } = useSecurity();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [currentPasswordError, setCurrentPasswordError] = useState('');
  const [newPasswordError, setNewPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  const passwordCriteria = {
    minLength: newPassword.length >= 8,
    hasUppercase: /[A-Z]/.test(newPassword),
    hasLowercase: /[a-z]/.test(newPassword),
    hasNumber: /[0-9]/.test(newPassword),
    hasSymbol: /[^A-Za-z0-9]/.test(newPassword),
  };

  const isPasswordStrong =
    passwordCriteria.minLength &&
    passwordCriteria.hasUppercase &&
    passwordCriteria.hasLowercase &&
    passwordCriteria.hasNumber &&
    passwordCriteria.hasSymbol;

  const handleUpdatePassword = async () => {
    let valid = true;
    setCurrentPasswordError('');
    setNewPasswordError('');
    setConfirmPasswordError('');

    if (!currentPassword.trim()) {
      setCurrentPasswordError(t('validation.required'));
      valid = false;
    }

    if (!isPasswordStrong) {
      setNewPasswordError(t('validation.passwordCriteria'));
      valid = false;
    }

    if (newPassword !== confirmPassword) {
      setConfirmPasswordError(t('validation.passwordsDoNotMatch'));
      valid = false;
    }

    if (!valid) return;

    const res = await changePassword({
      ancien_mot_de_passe: currentPassword,
      nouveau_mot_de_passe: newPassword,
    });

    if (res.success) {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      router.back();
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-white dark:bg-brand-darkBg"
    >
      <StatusBar style="light" />

      <HeaderBar
        title={t('profile.security')}
        showBack={true}
        onBack={() => router.back()}
        rightAction={
          <TouchableOpacity
            activeOpacity={0.7}
            disabled={isUpdating}
            onPress={handleUpdatePassword}
            className="p-1"
          >
            {isUpdating ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Icon name="gravity-ui:check" color="#FFFFFF" size={24} />
            )}
          </TouchableOpacity>
        }
      />

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 20,
          paddingBottom: insets.bottom + 80,
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="mt-3">
          <Input
            label={t('common.currentPassword')}
            value={currentPassword}
            onChangeText={(val) => {
              setCurrentPassword(val);
              if (currentPasswordError) setCurrentPasswordError('');
            }}
            isPassword
            placeholder="••••••••"
            error={currentPasswordError}
            iconLeft="solar:lock-keyhole-linear"
          />
        </View>

        <View className="mt-3">
          <Input
            label={t('common.newPassword')}
            value={newPassword}
            onChangeText={(val) => {
              setNewPassword(val);
              if (newPasswordError) setNewPasswordError('');
            }}
            isPassword
            placeholder="••••••••"
            error={newPasswordError}
            iconLeft="solar:key-linear"
          />
        </View>

        <View className="mt-2.5 p-3 rounded-xl bg-slate-100 dark:bg-white/5">
          <Text className="font-bold text-2xs mb-1.5 text-slate-600 dark:text-slate-400">
            {t('validation.passwordCriteriaTitle')}
          </Text>
          <View className="gap-1">
            {[
              { key: 'minLength', label: t('validation.criteriaMinLength'), valid: passwordCriteria.minLength },
              { key: 'hasUppercase', label: t('validation.criteriaUppercase'), valid: passwordCriteria.hasUppercase },
              { key: 'hasLowercase', label: t('validation.criteriaLowercase'), valid: passwordCriteria.hasLowercase },
              { key: 'hasNumber', label: t('validation.criteriaNumber'), valid: passwordCriteria.hasNumber },
              { key: 'hasSymbol', label: t('validation.criteriaSymbol'), valid: passwordCriteria.hasSymbol },
            ].map((crit) => (
              <View key={crit.key} className="flex-row items-center">
                <Icon
                  name={crit.valid ? 'solar:check-circle-bold' : 'solar:close-circle-linear'}
                  color={crit.valid ? colors.green : '#94A3B8'}
                  size={15}
                  style={{ marginRight: 6 }}
                />
                <Text
                  className={`text-2xs ${
                    crit.valid ? 'text-brand-green font-bold' : 'text-slate-500 dark:text-slate-400 font-normal'
                  }`}
                >
                  {crit.label}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View className="mt-3">
          <Input
            label={t('common.confirmPassword')}
            value={confirmPassword}
            onChangeText={(val) => {
              setConfirmPassword(val);
              if (confirmPasswordError) setConfirmPasswordError('');
            }}
            isPassword
            placeholder="••••••••"
            error={confirmPasswordError}
            iconLeft="solar:key-bold"
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

