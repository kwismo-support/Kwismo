import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
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
import { LegalModal } from '../../src/shared/components/LegalModal';
import { toast } from '../../src/shared/store/toastStore';
import { validateEmail, validatePassword } from '../../src/shared/lib/validation';
import { colors, fonts } from '../../src/styles/tokens';
import { scaleFont } from '../../src/shared/lib/responsive';

export default function RegisterScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { isDark, colors: themeColors } = useAppTheme();

  const [lastName, setLastName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptPrivacy, setAcceptPrivacy] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);

  // Legal modal state
  const [legalModal, setLegalModal] = useState<{ visible: boolean; title: string }>({
    visible: false,
    title: '',
  });

  // Inline errors state
  const [lastNameError, setLastNameError] = useState('');
  const [firstNameError, setFirstNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [privacyError, setPrivacyError] = useState('');
  const [termsError, setTermsError] = useState('');

  // Password validation analysis
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

    toast.success(t('toasts.registerSuccess'));
    router.replace('/(auth)/otp');
    return true;
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
          <Text style={styles.title}>{t('auth.registerTitle')}</Text>
          <Text style={styles.subtitle}>{t('auth.registerSubtitle')}</Text>

          <View style={styles.formContainer}>
            {/* Nom & Prénom */}
            <View style={styles.row}>
              <View style={styles.halfCard}>
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

              <View style={styles.halfCard}>
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

            {/* Email */}
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

            {/* Mot de passe */}
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

            {/* Indicateurs visuels des 5 critères du mot de passe */}
            {password.length > 0 && (
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

            {/* Confirmation du mot de passe */}
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
              containerStyle={{ marginBottom: 16 }}
            />

            {/* Cases obligatoires : Politique de confidentialité & Conditions d'utilisation */}
            <View style={styles.checkboxGroup}>
              <View style={styles.checkboxRow}>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => {
                    setAcceptPrivacy(!acceptPrivacy);
                    if (privacyError) setPrivacyError('');
                  }}
                  style={[
                    styles.checkboxBox,
                    {
                      borderColor: privacyError ? '#EF4444' : acceptPrivacy ? colors.green : themeColors.inputBorder,
                      backgroundColor: acceptPrivacy ? colors.green : 'transparent',
                    },
                  ]}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  {acceptPrivacy && <Icon name="solar:check-read-linear" size={13} color={colors.white} />}
                </TouchableOpacity>

                <Text style={[styles.checkboxLabel, { color: themeColors.textPrimary }]}>
                  {t('auth.acceptPrivacyPrefix')}{' '}
                  <Text
                    onPress={() =>
                      setLegalModal({
                        visible: true,
                        title: t('auth.privacyPolicyTitle'),
                      })
                    }
                    style={styles.legalLink}
                  >
                    {t('auth.privacyPolicyLink')}
                  </Text>{' '}
                  <Text style={{ color: '#EF4444' }}>*</Text>
                </Text>
              </View>
              {privacyError ? (
                <View style={styles.checkboxErrorRow}>
                  <Icon name="solar:danger-circle-bold" size={13} color="#EF4444" />
                  <Text style={styles.checkboxErrorText}>{privacyError}</Text>
                </View>
              ) : null}

              <View style={[styles.checkboxRow, { marginTop: 14 }]}>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => {
                    setAcceptTerms(!acceptTerms);
                    if (termsError) setTermsError('');
                  }}
                  style={[
                    styles.checkboxBox,
                    {
                      borderColor: termsError ? '#EF4444' : acceptTerms ? colors.green : themeColors.inputBorder,
                      backgroundColor: acceptTerms ? colors.green : 'transparent',
                    },
                  ]}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  {acceptTerms && <Icon name="solar:check-read-linear" size={13} color={colors.white} />}
                </TouchableOpacity>

                <Text style={[styles.checkboxLabel, { color: themeColors.textPrimary }]}>
                  {t('auth.acceptTermsPrefix')}{' '}
                  <Text
                    onPress={() =>
                      setLegalModal({
                        visible: true,
                        title: t('auth.termsTitle'),
                      })
                    }
                    style={styles.legalLink}
                  >
                    {t('auth.termsOfServiceLink')}
                  </Text>{' '}
                  <Text style={{ color: '#EF4444' }}>*</Text>
                </Text>
              </View>
              {termsError ? (
                <View style={styles.checkboxErrorRow}>
                  <Icon name="solar:danger-circle-bold" size={13} color="#EF4444" />
                  <Text style={styles.checkboxErrorText}>{termsError}</Text>
                </View>
              ) : null}
            </View>

            {/* Bouton Créer mon compte avec 2s min de chargement */}
            <Button
              title={t('common.registerButton')}
              onPress={handleRegister}
              variant="primary"
              size="md"
              style={{ marginTop: 22, marginBottom: 20 }}
            />

            <View style={styles.dividerRow}>
              <View style={[styles.dividerLine, { backgroundColor: themeColors.divider }]} />
              <Text style={[styles.dividerText, { color: themeColors.textSecondary }]}>
                {t('common.or')}
              </Text>
              <View style={[styles.dividerLine, { backgroundColor: themeColors.divider }]} />
            </View>

            {/* Bouton Se connecter */}
            <Button
              title={t('common.login')}
              onPress={() => router.push('/(auth)/login')}
              variant="secondary"
              size="md"
              minLoadingDuration={0}
            />
          </View>
        </ScrollView>

        {/* Modale d'affichage de la Politique ou des CGU */}
        <LegalModal
          visible={legalModal.visible}
          title={legalModal.title}
          onClose={() => setLegalModal({ visible: false, title: '' })}
        />
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
    marginBottom: 28,
    lineHeight: 22,
  },
  formContainer: {
    width: '100%',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  halfCard: {
    flex: 1,
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
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    fontFamily: fonts.medium,
    fontSize: 14,
    marginHorizontal: 16,
  },
  checkboxGroup: {
    marginBottom: 8,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  checkboxBox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxLabel: {
    fontFamily: fonts.medium,
    fontSize: scaleFont(13),
    flex: 1,
  },
  legalLink: {
    fontFamily: fonts.semiBold,
    color: colors.green,
    textDecorationLine: 'underline',
  },
  checkboxErrorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
    paddingLeft: 30,
  },
  checkboxErrorText: {
    fontFamily: fonts.medium,
    fontSize: scaleFont(11),
    color: '#EF4444',
  },
});

