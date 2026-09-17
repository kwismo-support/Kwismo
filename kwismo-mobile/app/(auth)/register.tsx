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
import { Input } from '@/shared/ui/Input';
import { Button } from '@/shared/ui/Button';
import { LegalModal } from '@/shared/components/LegalModal';
import { validateEmail, validatePassword } from '@/shared/lib/validation';
import { colors } from '@/styles/tokens';
import { useRegister } from '@/features/auth/hooks/useRegister';

export default function RegisterScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { colors: themeColors } = useAppTheme();
  const { handleRegister: registerApiCall } = useRegister();

  const [lastName, setLastName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptPrivacy, setAcceptPrivacy] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);

  const [legalModal, setLegalModal] = useState<{ visible: boolean; title: string }>({
    visible: false,
    title: '',
  });

  const [lastNameError, setLastNameError] = useState('');
  const [firstNameError, setFirstNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [privacyError, setPrivacyError] = useState('');
  const [termsError, setTermsError] = useState('');

  const passwordAnalysis = validatePassword(password);

  const validateForm = () => {
    let isValid = true;
    setLastNameError('');
    setFirstNameError('');
    setEmailError('');
    setPasswordError('');
    setConfirmPasswordError('');
    setPrivacyError('');
    setTermsError('');

    if (!lastName.trim()) {
      setLastNameError(t('validation.lastNameRequired'));
      isValid = false;
    }

    if (!firstName.trim()) {
      setFirstNameError(t('validation.firstNameRequired'));
      isValid = false;
    }

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
    } else if (!passwordAnalysis.isValid) {
      setPasswordError(t('validation.passwordCriteria'));
      isValid = false;
    }

    if (!confirmPassword) {
      setConfirmPasswordError(t('validation.required'));
      isValid = false;
    } else if (password !== confirmPassword) {
      setConfirmPasswordError(t('validation.passwordsDoNotMatch'));
      isValid = false;
    }

    if (!acceptPrivacy) {
      setPrivacyError(t('validation.privacyRequired'));
      isValid = false;
    }

    if (!acceptTerms) {
      setTermsError(t('validation.termsRequired'));
      isValid = false;
    }

    return isValid;
  };

  const handleRegister = async () => {
    if (!validateForm()) return false;

    const res = await registerApiCall({
      nom: lastName.trim(),
      prenom: firstName.trim(),
      email: email.trim(),
      mot_de_passe: password,
    });

    if (res.success) {
      router.push({ pathname: '/(auth)/otp', params: { email: email.trim() } });
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
            {t('auth.registerTitle')}
          </Text>
          <Text className="font-medium text-base text-white/95 mt-3 mb-8">
            {t('auth.registerSubtitle')}
          </Text>

          <View className="w-full">
            <View className="flex-row gap-3">
              <View className="flex-1">
                <Input
                  placeholder={t('common.lastName')}
                  value={lastName}
                  onChangeText={(val) => {
                    setLastName(val);
                    if (lastNameError) setLastNameError('');
                  }}
                  error={lastNameError}
                  leftIcon={<Icon name="solar:user-linear" color={themeColors.inputPlaceholder} size={18} />}
                />
              </View>

              <View className="flex-1">
                <Input
                  placeholder={t('common.firstName')}
                  value={firstName}
                  onChangeText={(val) => {
                    setFirstName(val);
                    if (firstNameError) setFirstNameError('');
                  }}
                  error={firstNameError}
                  leftIcon={<Icon name="solar:user-linear" color={themeColors.inputPlaceholder} size={18} />}
                />
              </View>
            </View>

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

            {password.length > 0 && (
              <View className="mb-4">
                <View className="flex-row gap-1.5 mb-2.5">
                  {[1, 2, 3, 4, 5].map((idx) => (
                    <View
                      key={`crit-bar-${idx}`}
                      className={`flex-1 hx-1 rounded-full ${passwordAnalysis.score >= idx
                        ? passwordAnalysis.score === 5
                          ? 'bg-emerald-500'
                          : 'bg-amber-500'
                        : 'bg-slate-300 dark:bg-slate-700'
                        }`}
                    />
                  ))}
                </View>

                <View className="flex-row flex-wrap justify-between gap-y-2">
                  <View className="flex-row items-center w-1/2 pr-1">
                    <Icon
                      name={passwordAnalysis.criteria.minLength ? 'solar:check-circle-bold' : 'solar:close-circle-linear'}
                      size={14}
                      color={passwordAnalysis.criteria.minLength ? colors.green : themeColors.inputPlaceholder}
                    />
                    <Text className={`font-medium text-xs ml-1.5 ${passwordAnalysis.criteria.minLength ? 'text-emerald-600 dark:text-brand-green' : 'text-slate-500 dark:text-slate-400'}`}>
                      {t('validation.criteriaMinLength')}
                    </Text>
                  </View>

                  <View className="flex-row items-center w-1/2 pl-1">
                    <Icon
                      name={passwordAnalysis.criteria.hasUppercase ? 'solar:check-circle-bold' : 'solar:close-circle-linear'}
                      size={14}
                      color={passwordAnalysis.criteria.hasUppercase ? colors.green : themeColors.inputPlaceholder}
                    />
                    <Text className={`font-medium text-xs ml-1.5 ${passwordAnalysis.criteria.hasUppercase ? 'text-emerald-600 dark:text-brand-green' : 'text-slate-500 dark:text-slate-400'}`}>
                      {t('validation.criteriaUppercase')}
                    </Text>
                  </View>

                  <View className="flex-row items-center w-1/2 pr-1">
                    <Icon
                      name={passwordAnalysis.criteria.hasLowercase ? 'solar:check-circle-bold' : 'solar:close-circle-linear'}
                      size={14}
                      color={passwordAnalysis.criteria.hasLowercase ? colors.green : themeColors.inputPlaceholder}
                    />
                    <Text className={`font-medium text-xs ml-1.5 ${passwordAnalysis.criteria.hasLowercase ? 'text-emerald-600 dark:text-brand-green' : 'text-slate-500 dark:text-slate-400'}`}>
                      {t('validation.criteriaLowercase')}
                    </Text>
                  </View>

                  <View className="flex-row items-center w-1/2 pl-1">
                    <Icon
                      name={passwordAnalysis.criteria.hasNumber ? 'solar:check-circle-bold' : 'solar:close-circle-linear'}
                      size={14}
                      color={passwordAnalysis.criteria.hasNumber ? colors.green : themeColors.inputPlaceholder}
                    />
                    <Text className={`font-medium text-xs ml-1.5 ${passwordAnalysis.criteria.hasNumber ? 'text-emerald-600 dark:text-brand-green' : 'text-slate-500 dark:text-slate-400'}`}>
                      {t('validation.criteriaNumber')}
                    </Text>
                  </View>

                  <View className="flex-row items-center w-1/2 pr-1">
                    <Icon
                      name={passwordAnalysis.criteria.hasSymbol ? 'solar:check-circle-bold' : 'solar:close-circle-linear'}
                      size={14}
                      color={passwordAnalysis.criteria.hasSymbol ? colors.green : themeColors.inputPlaceholder}
                    />
                    <Text className={`font-medium text-xs ml-1.5 ${passwordAnalysis.criteria.hasSymbol ? 'text-emerald-600 dark:text-brand-green' : 'text-slate-500 dark:text-slate-400'}`}>
                      {t('validation.criteriaSymbol')}
                    </Text>
                  </View>
                </View>
              </View>
            )}

            <View className="mb-4">
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
              />
            </View>

            <View className="mb-4">
              <View className="flex-row items-start my-1">
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => {
                    setAcceptPrivacy(!acceptPrivacy);
                    if (privacyError) setPrivacyError('');
                  }}
                  className={`wx-5 hx-5 rounded border-2 items-center justify-center mr-3 mt-0.5 ${acceptPrivacy ? 'bg-brand-green border-brand-green' : privacyError ? 'border-red-500' : 'border-slate-400 dark:border-slate-600'
                    }`}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  {acceptPrivacy && <Icon name="solar:check-read-linear" size={13} color={colors.white} />}
                </TouchableOpacity>

                <Text className="text-sm text-slate-800 dark:text-slate-200 flex-1 leading-5">
                  {t('auth.acceptPrivacyPrefix')}{' '}
                  <Text
                    onPress={() =>
                      setLegalModal({
                        visible: true,
                        title: t('auth.privacyPolicyTitle'),
                      })
                    }
                    className="font-semibold text-brand-green dark:text-brand-green underline"
                  >
                    {t('auth.privacyPolicyLink')}
                  </Text>{' '}
                  <Text className="text-red-500">*</Text>
                </Text>
              </View>
              {privacyError ? (
                <View className="flex-row items-center mt-1 pl-8 gap-1.5">
                  <Icon name="solar:danger-circle-bold" size={13} color="#EF4444" />
                  <Text className="font-medium text-xs text-red-500">{privacyError}</Text>
                </View>
              ) : null}

              <View className="flex-row items-start mt-3.5 mb-1">
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => {
                    setAcceptTerms(!acceptTerms);
                    if (termsError) setTermsError('');
                  }}
                  className={`wx-5 hx-5 rounded border-2 items-center justify-center mr-3 mt-0.5 ${acceptTerms ? 'bg-brand-green border-brand-green' : termsError ? 'border-red-500' : 'border-slate-400 dark:border-slate-600'
                    }`}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  {acceptTerms && <Icon name="solar:check-read-linear" size={13} color={colors.white} />}
                </TouchableOpacity>

                <Text className="text-sm text-slate-800 dark:text-slate-200 flex-1 leading-5">
                  {t('auth.acceptTermsPrefix')}{' '}
                  <Text
                    onPress={() =>
                      setLegalModal({
                        visible: true,
                        title: t('auth.termsTitle'),
                      })
                    }
                    className="font-semibold text-brand-green dark:text-brand-green underline"
                  >
                    {t('auth.termsOfServiceLink')}
                  </Text>{' '}
                  <Text className="text-red-500">*</Text>
                </Text>
              </View>
              {termsError ? (
                <View className="flex-row items-center mt-1 pl-8 gap-1.5">
                  <Icon name="solar:danger-circle-bold" size={13} color="#EF4444" />
                  <Text className="font-medium text-xs text-red-500">{termsError}</Text>
                </View>
              ) : null}
            </View>

            <View className="mt-5 mb-5">
              <Button
                title={t('common.registerButton')}
                onPress={handleRegister}
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
              title={t('common.login')}
              onPress={() => router.push('/(auth)/login')}
              variant="secondary"
              size="md"
              minLoadingDuration={0}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <LegalModal
        visible={legalModal.visible}
        title={legalModal.title}
        onClose={() => setLegalModal({ visible: false, title: '' })}
      />
    </AuthGradientBackground>
  );
}
