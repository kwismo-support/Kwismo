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
import { Eye, EyeOff, Mail } from 'lucide-react-native';
import { LanguageSwitcher } from '../../src/shared/components/LanguageSwitcher';
import { colors, fonts } from '../../src/styles/tokens';

export default function RegisterScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  const [lastName, setLastName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleRegister = () => {
    router.replace('/(auth)/otp');
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.container}>
        {/* Top Green to Light Background Gradient matching Image 4 */}
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
          <Text style={styles.title}>{t('auth.registerTitle')}</Text>
          <Text style={styles.subtitle}>{t('auth.registerSubtitle')}</Text>

          {/* Form Inputs matching Image 4 */}
          <View style={styles.formContainer}>
            {/* Row 1: Nom & Prénom half-width inputs */}
            <View style={styles.row}>
              <View style={[styles.inputCard, styles.halfCard]}>
                <TextInput
                  style={styles.input}
                  placeholder={t('common.lastName')}
                  placeholderTextColor={colors.inputPlaceholder}
                  value={lastName}
                  onChangeText={setLastName}
                />
              </View>
              <View style={[styles.inputCard, styles.halfCard]}>
                <TextInput
                  style={styles.input}
                  placeholder={t('common.firstName')}
                  placeholderTextColor={colors.inputPlaceholder}
                  value={firstName}
                  onChangeText={setFirstName}
                />
              </View>
            </View>

            {/* Email Field with Mail Icon */}
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

            {/* Password Field with Eye Toggle Icon */}
            <View style={styles.inputCard}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder={t('common.password')}
                placeholderTextColor={colors.inputPlaceholder}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
              >
                {showPassword ? (
                  <EyeOff color="#A0AEC0" size={22} />
                ) : (
                  <Eye color="#A0AEC0" size={22} />
                )}
              </TouchableOpacity>
            </View>

            {/* Confirm Password Field with Eye Toggle Icon */}
            <View style={styles.inputCard}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder={t('common.confirmPassword')}
                placeholderTextColor={colors.inputPlaceholder}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
              />
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                style={styles.eyeIcon}
              >
                {showConfirmPassword ? (
                  <EyeOff color="#A0AEC0" size={22} />
                ) : (
                  <Eye color="#A0AEC0" size={22} />
                )}
              </TouchableOpacity>
            </View>

            {/* Primary Button: Créer mon compte */}
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleRegister}
              style={styles.registerButton}
            >
              <Text style={styles.registerButtonText}>{t('common.registerButton')}</Text>
            </TouchableOpacity>

            {/* Divider OU */}
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>{t('common.or')}</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Secondary Button: Se connecter */}
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => router.push('/(auth)/login')}
              style={styles.loginButton}
            >
              <Text style={styles.loginButtonText}>{t('common.login')}</Text>
            </TouchableOpacity>
          </View>
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
    marginBottom: 32,
    lineHeight: 22,
  },
  formContainer: {
    width: '100%',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  halfCard: {
    width: '48%',
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
  registerButton: {
    width: '100%',
    height: 52,
    backgroundColor: colors.orange,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 24,
    elevation: 2,
  },
  registerButtonText: {
    fontFamily: fonts.medium,
    fontSize: 16,
    color: colors.white,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#CBD5E0',
  },
  dividerText: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: '#4A5568',
    marginHorizontal: 16,
  },
  loginButton: {
    width: '100%',
    height: 52,
    backgroundColor: 'transparent',
    borderRadius: 26,
    borderWidth: 1.5,
    borderColor: colors.navy,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginButtonText: {
    fontFamily: fonts.medium,
    fontSize: 16,
    color: colors.navy,
  },
});
