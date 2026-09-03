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
import { useAuthStore } from '../../src/shared/store/authStore';
import { Input } from '../../src/shared/ui/Input';
import { Button } from '../../src/shared/ui/Button';
import { toast } from '../../src/shared/store/toastStore';
import { validateEmail } from '../../src/shared/lib/validation';
import { colors, fonts } from '../../src/styles/tokens';

export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { isDark, colors: themeColors } = useAppTheme();
  const loginStoreAction = useAuthStore((state) => state.login);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  // Inline errors state
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

    // Simulate authentication with guaranteed minimum loading on success
    loginStoreAction(
      { id: '1', email: email.trim() },
      'sample-jwt-token'
    );

    toast.success(t('toasts.loginSuccess'));
    router.replace('/(auth)/otp-success?mode=login');
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
          <Text style={styles.title}>{t('auth.loginTitle')}</Text>
          <Text style={styles.subtitle}>{t('auth.loginSubtitle')}</Text>

          <View style={styles.formContainer}>
            {/* Champ Email */}
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

            {/* Champ Mot de passe */}
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
              style={styles.forgotWrapper}
            >
              <Text style={[styles.forgotText, { color: themeColors.textSecondary }]}>
                {t('auth.forgotPasswordLink')}
              </Text>
            </TouchableOpacity>

            {/* Remember Me Checkbox */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setRememberMe(!rememberMe)}
              style={styles.checkboxRow}
            >
              <View
                style={[
                  styles.checkbox,
                  { borderColor: themeColors.textPrimary },
                  rememberMe && { backgroundColor: themeColors.textPrimary },
                ]}
              >
                {rememberMe && (
                  <Icon
                    name="solar:check-read-linear"
                    color={isDark ? themeColors.background : colors.white}
                    size={14}
                  />
                )}
              </View>
              <Text style={[styles.checkboxLabel, { color: themeColors.textPrimary }]}>
                {t('common.rememberMe')}
              </Text>
            </TouchableOpacity>

            {/* Bouton de Connexion avec 2s min de chargement */}
            <Button
              title={t('common.login')}
              onPress={handleLogin}
              variant="primary"
              size="md"
              style={{ marginBottom: 20 }}
            />

            <View style={styles.dividerRow}>
              <View style={[styles.dividerLine, { backgroundColor: themeColors.divider }]} />
              <Text style={[styles.dividerText, { color: themeColors.textSecondary }]}>
                {t('common.or')}
              </Text>
              <View style={[styles.dividerLine, { backgroundColor: themeColors.divider }]} />
            </View>

            {/* Bouton Créer un compte */}
            <Button
              title={t('common.register')}
              onPress={() => router.push('/(auth)/register')}
              variant="secondary"
              size="md"
              minLoadingDuration={0}
            />
          </View>
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
    flexGrow: 1,
    zIndex: 10,
  },
  title: {
    fontFamily: fonts.h2,
    fontSize: 32,
    fontWeight: '700',
    color: colors.white,
    marginTop: 10,
    lineHeight: 40,
  },
  subtitle: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.white,
    opacity: 0.95,
    marginTop: 12,
    marginBottom: 32,
    lineHeight: 20,
  },
  formContainer: {
    width: '100%',
  },
  forgotWrapper: {
    alignSelf: 'flex-start',
    marginBottom: 24,
    marginTop: -2,
  },
  forgotText: {
    fontFamily: fonts.medium,
    fontSize: 13,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 64,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  checkboxLabel: {
    fontFamily: fonts.medium,
    fontSize: 14,
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
});

