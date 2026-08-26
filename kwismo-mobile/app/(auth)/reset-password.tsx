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
import { Eye, EyeOff } from 'lucide-react-native';
import { LanguageSwitcher } from '../../src/shared/components/LanguageSwitcher';
import { colors, fonts } from '../../src/styles/tokens';

export default function ResetPasswordScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showEmailIcon, setShowEmailIcon] = useState(false);
  const [showPasswordIcon, setShowPasswordIcon] = useState(false);

  const handleResetConfirm = () => {
    router.replace('/(auth)/otp');
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.container}>
        {/* Top Green Gradient Background matching Image 2 */}
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
          <Text style={styles.title}>{t('auth.resetTitle')}</Text>
          <Text style={styles.subtitle}>{t('auth.resetSubtitle')}</Text>

          {/* Input 1: Email */}
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
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setShowEmailIcon(!showEmailIcon)}
              style={styles.eyeIcon}
            >
              {showEmailIcon ? (
                <EyeOff color="#A0AEC0" size={22} />
              ) : (
                <Eye color="#A0AEC0" size={22} />
              )}
            </TouchableOpacity>
          </View>

          {/* Input 2: Password */}
          <View style={styles.inputCard}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder={t('common.password')}
              placeholderTextColor={colors.inputPlaceholder}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPasswordIcon}
            />
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setShowPasswordIcon(!showPasswordIcon)}
              style={styles.eyeIcon}
            >
              {showPasswordIcon ? (
                <EyeOff color="#A0AEC0" size={22} />
              ) : (
                <Eye color="#A0AEC0" size={22} />
              )}
            </TouchableOpacity>
          </View>

          {/* Password Strength Requirement & Strength Bars */}
          <View style={styles.strengthRow}>
            <Text style={styles.strengthText}>{t('common.minCharRequirement')}</Text>
            <View style={styles.barsContainer}>
              {[1, 2, 3, 4, 5, 6].map((bar) => (
                <View
                  key={`bar-${bar}`}
                  style={[
                    styles.strengthBar,
                    password.length >= bar * 1.5 && styles.strengthBarActive,
                  ]}
                />
              ))}
            </View>
          </View>

          {/* Action Button: Sign Up / Valider */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleResetConfirm}
            style={styles.submitButton}
          >
            <Text style={styles.submitButtonText}>{t('common.signUp')}</Text>
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
    marginBottom: 16,
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
  eyeIcon: {
    padding: 6,
  },
  strengthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 36,
    marginTop: 4,
  },
  strengthText: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: '#4A5568',
  },
  barsContainer: {
    flexDirection: 'row',
    gap: 4,
  },
  strengthBar: {
    width: 14,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E2E8F0',
  },
  strengthBarActive: {
    backgroundColor: colors.green,
  },
  submitButton: {
    width: '100%',
    height: 52,
    backgroundColor: colors.orange,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
  submitButtonText: {
    fontFamily: fonts.medium,
    fontSize: 16,
    color: colors.white,
  },
});
