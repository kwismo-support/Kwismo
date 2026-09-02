import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { Mail } from 'lucide-react-native';
import { LanguageSwitcher } from '../../src/shared/components/LanguageSwitcher';
import { colors, fonts } from '../../src/styles/tokens';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const [email, setEmail] = useState('');

  const handleReset = () => {
    router.push('/(auth)/reset-password');
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.container}>
        {/* Top Green Gradient Background matching Image 1 */}
        <LinearGradient
          colors={['#32B07F', '#248563', '#205E51', '#335056', '#FFFFFF', '#FFFFFF']}
          locations={[0, 0.25, 0.45, 0.65, 0.85, 1]}
          style={StyleSheet.absoluteFill}
        />

        {/* Top Right Language Switcher */}
        <View style={[styles.langWrapper, { top: insets.top + 16 }]}>
          <LanguageSwitcher darkTheme={true} />
        </View>

        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingTop: insets.top + 70,
              paddingBottom: insets.bottom + 24,
            },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header Title & Subtitle */}
          <Text style={styles.title}>{t('auth.forgotTitle')}</Text>
          <Text style={styles.subtitle}>{t('auth.forgotSubtitle')}</Text>

          {/* Email Input Field */}
          <View style={styles.inputCard}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder={t('common.email')}
              placeholderTextColor={colors.inputPlaceholder}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <Mail color="#A0AEC0" size={20} style={{ opacity: 0.7 }} />
          </View>

          {/* Action Button: Reset */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleReset}
            style={styles.resetButton}
          >
            <Text style={styles.resetButtonText}>{t('common.reset')}</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  langWrapper: {
    position: 'absolute',
    right: 20,
    zIndex: 20,
  },
  scrollContent: {
    paddingHorizontal: 24,
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
  inputCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    height: 54,
    borderRadius: 14,
    paddingHorizontal: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  input: {
    fontFamily: fonts.medium,
    fontSize: 15,
    color: colors.navy,
    height: '100%',
  },
  resetButton: {
    width: '100%',
    height: 52,
    backgroundColor: colors.orange,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
  resetButtonText: {
    fontFamily: fonts.medium,
    fontSize: 16,
    color: colors.white,
  },
});
