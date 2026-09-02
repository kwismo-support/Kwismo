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
import { Eye, EyeOff, Check } from 'lucide-react-native';
import { LanguageSwitcher } from '../../src/shared/components/LanguageSwitcher';
import { colors, fonts } from '../../src/styles/tokens';

export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleLogin = () => {
    router.replace('/(app)');
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <View style={styles.container}>
        <LinearGradient
          colors={[
            '#2CB677',
            '#206E57',
            '#1B2E3D',
            '#687D92',
            '#C4CED8',
            '#FFFFFF',
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0.85, y: 0.55 }}
          style={styles.gradientHeader}
        />

        <View style={[styles.langWrapper, { top: Math.max(insets.top + 16, 20) }]}>
          <LanguageSwitcher darkTheme={true} />
        </View>

        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingTop: Math.max(insets.top + 40, 60),
              paddingBottom: Math.max(insets.bottom + 40, 60),
            },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.title}>
            Accédez à{'\n'}votre compte
          </Text>
          <Text style={styles.subtitle}>
            Saisissez vos identifiants de connexion pour accéder à votre espace compte.
          </Text>

          <View style={styles.formContainer}>
            <View style={styles.inputCard}>
              <TextInput
                style={styles.input}
                placeholder="Adresse email"
                placeholderTextColor="#A0AEC0"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputCard}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="Mot de passe"
                placeholderTextColor="#A0AEC0"
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

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => router.push('/(auth)/forgot-password')}
              style={styles.forgotWrapper}
            >
              <Text style={styles.forgotText}>Mot de passe oublier ? changer</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setRememberMe(!rememberMe)}
              style={styles.checkboxRow}
            >
              <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
                {rememberMe && <Check color={colors.white} size={14} strokeWidth={3} />}
              </View>
              <Text style={styles.checkboxLabel}>{t('common.rememberMe')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleLogin}
              style={styles.loginButton}
            >
              <Text style={styles.loginButtonText}>{t('common.login')}</Text>
            </TouchableOpacity>

            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>{t('common.or')}</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => router.push('/(auth)/register')}
              style={styles.registerButton}
            >
              <Text style={styles.registerButtonText}>{t('common.register')}</Text>
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
    backgroundColor: '#FFFFFF',
  },
  gradientHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '52%',
  },
  langWrapper: {
    position: 'absolute',
    right: 20,
    zIndex: 20,
  },
  scrollContent: {
    paddingHorizontal: 24,
    flexGrow: 1,
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
  inputCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    height: 52,
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
    width: '100%',
  },
  eyeIcon: {
    padding: 6,
  },
  forgotWrapper: {
    alignSelf: 'flex-start',
    marginBottom: 18,
    marginTop: -4,
  },
  forgotText: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: '#4A5568',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#1D2A44',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  checkboxChecked: {
    backgroundColor: '#1D2A44',
  },
  checkboxLabel: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: '#1D2A44',
  },
  loginButton: {
    width: '100%',
    height: 52,
    backgroundColor: colors.orange,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    elevation: 2,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
  },
  loginButtonText: {
    fontFamily: fonts.medium,
    fontSize: 16,
    color: colors.white,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
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
  registerButton: {
    width: '100%',
    height: 52,
    backgroundColor: 'transparent',
    borderRadius: 26,
    borderWidth: 1.5,
    borderColor: '#1D2A44',
    alignItems: 'center',
    justifyContent: 'center',
  },
  registerButtonText: {
    fontFamily: fonts.medium,
    fontSize: 16,
    color: '#1D2A44',
  },
});
