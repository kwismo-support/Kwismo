import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
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
import { validateEmail } from '../../src/shared/lib/validation';
import { colors, fonts } from '../../src/styles/tokens';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { isDark, colors: themeColors } = useAppTheme();
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

    router.push('/(auth)/reset-password');
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
          <Text style={styles.title}>{t('auth.forgotTitle')}</Text>
          <Text style={styles.subtitle}>{t('auth.forgotSubtitle')}</Text>

          {/* Email Input */}
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
            title={t('common.reset')}
            onPress={handleReset}
            variant="primary"
            size="md"
          />

          {/* Bouton de retour vers la connexion */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.back()}
            style={{ marginTop: 16, alignItems: 'center', paddingVertical: 10 }}
          >
            <Text style={{ fontFamily: fonts.headlineBold, fontSize: 14, color: themeColors.textSecondary }}>
              ← Retour à la connexion
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backButton: {
    position: 'absolute',
    left: 20,
    zIndex: 20,
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
    marginBottom: 40,
    lineHeight: 22,
  },
});

