import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
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
import { validatePassword } from '../../src/shared/lib/validation';
import { colors, fonts } from '../../src/styles/tokens';

export default function ResetPasswordScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { isDark, colors: themeColors } = useAppTheme();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Inline errors state
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

    toast.success(t('toasts.passwordResetSuccess'));
    router.replace('/(auth)/login');
    return true;
  };

  const headerGradientColors: readonly [string, string, ...string[]] = isDark
    ? ['#2BB673', '#249460', '#1B2E3D', '#162035', '#0F1626', '#0F1626']
    : ['#2BB673', '#28A86B', '#249460', '#213E35', '#23303B', '#3C4A56', '#60707F', '#98A8B8', '#D8E2EC', '#FFFFFF', '#FFFFFF'];

  const headerGradientLocations: readonly [number, number, ...number[]] = isDark
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
          <Text style={styles.title}>{t('auth.resetTitle')}</Text>
          <Text style={styles.subtitle}>{t('auth.resetSubtitle')}</Text>

          {/* Nouveau mot de passe */}
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

          {/* Indicateur de force & 5 critères du mot de passe */}
          {newPassword.length > 0 && (
            <View style={styles.criteriaContainer}>
              <View style={styles.criteriaBarsRow}>
                {[1, 2, 3, 4, 5].map((idx) => (
                  <View
                    key={`crit-bar-${idx}`}
                    style={[
                      styles.criteriaBar,
                      {
                        backgroundColor:
                          passwordAnalysis.score >= idx
                            ? passwordAnalysis.score === 5
                              ? colors.green
                              : '#F59E0B'
                            : themeColors.inputBorder,
                      },
                    ]}
                  />
                ))}
              </View>

              <View style={styles.criteriaGrid}>
                <View style={styles.criteriaItem}>
                  <Icon
                    name={passwordAnalysis.criteria.minLength ? "solar:check-circle-bold" : "solar:close-circle-linear"}
                    size={14}
                    color={passwordAnalysis.criteria.minLength ? colors.green : themeColors.inputPlaceholder}
                  />
                  <Text
                    style={[
                      styles.criteriaText,
                      {
                        color: passwordAnalysis.criteria.minLength
                          ? colors.green
                          : themeColors.textSecondary,
                      },
                    ]}
                  >
                    {t('validation.criteriaMinLength')}
                  </Text>
                </View>

                <View style={styles.criteriaItem}>
                  <Icon
                    name={passwordAnalysis.criteria.hasUppercase ? "solar:check-circle-bold" : "solar:close-circle-linear"}
                    size={14}
                    color={passwordAnalysis.criteria.hasUppercase ? colors.green : themeColors.inputPlaceholder}
                  />
                  <Text
                    style={[
                      styles.criteriaText,
                      {
                        color: passwordAnalysis.criteria.hasUppercase
                          ? colors.green
                          : themeColors.textSecondary,
                      },
                    ]}
                  >
                    {t('validation.criteriaUppercase')}
                  </Text>
                </View>

                <View style={styles.criteriaItem}>
                  <Icon
                    name={passwordAnalysis.criteria.hasLowercase ? "solar:check-circle-bold" : "solar:close-circle-linear"}
                    size={14}
                    color={passwordAnalysis.criteria.hasLowercase ? colors.green : themeColors.inputPlaceholder}
                  />
                  <Text
                    style={[
                      styles.criteriaText,
                      {
                        color: passwordAnalysis.criteria.hasLowercase
                          ? colors.green
                          : themeColors.textSecondary,
                      },
                    ]}
                  >
                    {t('validation.criteriaLowercase')}
                  </Text>
                </View>

                <View style={styles.criteriaItem}>
                  <Icon
                    name={passwordAnalysis.criteria.hasNumber ? "solar:check-circle-bold" : "solar:close-circle-linear"}
                    size={14}
                    color={passwordAnalysis.criteria.hasNumber ? colors.green : themeColors.inputPlaceholder}
                  />
                  <Text
                    style={[
                      styles.criteriaText,
                      {
                        color: passwordAnalysis.criteria.hasNumber
                          ? colors.green
                          : themeColors.textSecondary,
                      },
                    ]}
                  >
                    {t('validation.criteriaNumber')}
                  </Text>
                </View>

                <View style={styles.criteriaItem}>
                  <Icon
                    name={passwordAnalysis.criteria.hasSymbol ? "solar:check-circle-bold" : "solar:close-circle-linear"}
                    size={14}
                    color={passwordAnalysis.criteria.hasSymbol ? colors.green : themeColors.inputPlaceholder}
                  />
                  <Text
                    style={[
                      styles.criteriaText,
                      {
                        color: passwordAnalysis.criteria.hasSymbol
                          ? colors.green
                          : themeColors.textSecondary,
                      },
                    ]}
                  >
                    {t('validation.criteriaSymbol')}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Confirmation mot de passe */}
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
            title={t('common.signUp')}
            onPress={handleResetConfirm}
            variant="primary"
            size="md"
          />
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
    marginBottom: 32,
    lineHeight: 22,
  },
  criteriaContainer: {
    marginTop: -8,
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  criteriaBarsRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 10,
  },
  criteriaBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  criteriaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  criteriaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginRight: 10,
  },
  criteriaText: {
    fontFamily: fonts.medium,
    fontSize: 11,
  },
});
