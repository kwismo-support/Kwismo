import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useTranslation } from 'react-i18next';
import { Icon } from '../../src/shared/ui/Icon';
import { Input } from '../../src/shared/ui/Input';
import { HeaderBar } from '../../src/shared/components/HeaderBar';
import { useAppTheme } from '../../src/shared/hooks/useAppTheme';
import { toast } from '../../src/shared/store/toastStore';
import { colors, fonts } from '../../src/styles/tokens';
import { scaleFont } from '../../src/shared/lib/responsive';

export default function SecurityScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { isDark, colors: themeColors } = useAppTheme();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [currentPasswordError, setCurrentPasswordError] = useState('');
  const [newPasswordError, setNewPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  const [rememberMe, setRememberMe] = useState(true);
  const [biometricsEnabled, setBiometricsEnabled] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  // Critères de robustesse du mot de passe (Maquette Inscription)
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

  const handleUpdatePassword = () => {
    let valid = true;
    setCurrentPasswordError('');
    setNewPasswordError('');
    setConfirmPasswordError('');

    if (!currentPassword.trim()) {
      setCurrentPasswordError(t('validation.required', 'Veuillez saisir votre mot de passe actuel.'));
      valid = false;
    }

    if (!isPasswordStrong) {
      setNewPasswordError(
        t('validation.passwordCriteria', 'Le nouveau mot de passe doit respecter tous les critères de sécurité.')
      );
      valid = false;
    }

    if (newPassword !== confirmPassword) {
      setConfirmPasswordError(t('validation.passwordsDoNotMatch', 'Les mots de passe ne correspondent pas.'));
      valid = false;
    }

    if (!valid) return;

    setIsUpdating(true);
    setTimeout(() => {
      setIsUpdating(false);
      toast.success(t('toasts.passwordResetSuccess', 'Mot de passe mis à jour avec succès !'));
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }, 600);
  };

  const handleToggleBiometrics = (value: boolean) => {
    if (!value) {
      // Pour désactiver la biométrie, exige la saisie du code PIN à 6 chiffres
      toast.info(t('common.securityCheck', 'Code PIN à 6 chiffres requis pour désactiver la biométrie.'));
      router.push('/(app)/pin-setup');
    } else {
      setBiometricsEnabled(true);
      toast.success('Déverrouillage par biométrie activé avec succès.');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <StatusBar style="light" />

      {/* Header unifié de page secondaire sans cloche */}
      <HeaderBar title={t('profile.security', 'Sécurité & mot de passe')} showBack={true} />

      <ScrollView
        contentContainerStyle={[
          styles.scrollBody,
          { paddingBottom: insets.bottom + 40 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.sectionTitle, { color: themeColors.textPrimary }]}>
          Modifier mon mot de passe
        </Text>

        {/* Input Standardisé : Mot de passe actuel */}
        <View style={{ marginTop: 12 }}>
          <Input
            label={t('common.currentPassword', 'Mot de passe actuel')}
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

        {/* Input Standardisé : Nouveau mot de passe */}
        <View style={{ marginTop: 12 }}>
          <Input
            label={t('common.newPassword', 'Nouveau mot de passe')}
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

        {/* Indicateurs de robustesse du mot de passe (Maquette d'inscription) */}
        <View style={styles.criteriaContainer}>
          <Text style={[styles.criteriaTitle, { color: themeColors.textSecondary }]}>
            Critères de robustesse du mot de passe :
          </Text>
          <View style={styles.criteriaGrid}>
            {[
              { key: 'minLength', label: t('validation.criteriaMinLength', 'Au moins 8 caractères'), valid: passwordCriteria.minLength },
              { key: 'hasUppercase', label: t('validation.criteriaUppercase', '1 lettre majuscule'), valid: passwordCriteria.hasUppercase },
              { key: 'hasLowercase', label: t('validation.criteriaLowercase', '1 lettre minuscule'), valid: passwordCriteria.hasLowercase },
              { key: 'hasNumber', label: t('validation.criteriaNumber', '1 chiffre'), valid: passwordCriteria.hasNumber },
              { key: 'hasSymbol', label: t('validation.criteriaSymbol', '1 symbole spécial (!@#$)'), valid: passwordCriteria.hasSymbol },
            ].map((crit) => (
              <View key={crit.key} style={styles.criteriaRow}>
                <Icon
                  name={crit.valid ? 'solar:check-circle-bold' : 'solar:close-circle-linear'}
                  color={crit.valid ? colors.green : themeColors.inputPlaceholder}
                  size={15}
                  style={{ marginRight: 6 }}
                />
                <Text
                  style={[
                    styles.criteriaText,
                    {
                      color: crit.valid ? colors.green : themeColors.textSecondary,
                      fontWeight: crit.valid ? '700' : '400',
                    },
                  ]}
                >
                  {crit.label}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Input Standardisé : Confirmation mot de passe */}
        <View style={{ marginTop: 12 }}>
          <Input
            label={t('common.confirmPassword', 'Confirmer le nouveau mot de passe')}
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

        <TouchableOpacity
          activeOpacity={0.85}
          disabled={isUpdating}
          onPress={handleUpdatePassword}
          style={[styles.saveBtn, { backgroundColor: colors.green, marginTop: 24 }]}
        >
          {isUpdating ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={styles.saveBtnText}>
              {t('common.saveChanges', 'Mettre à jour le mot de passe')}
            </Text>
          )}
        </TouchableOpacity>

        {/* Protection par Biométrie & Code PIN (Secours obligatoire à 6 chiffres) */}
        <Text style={[styles.sectionTitle, { color: themeColors.textPrimary, marginTop: 32 }]}>
          Déverrouillage de l'application & PIN
        </Text>

        <View style={[styles.optionsCard, { backgroundColor: themeColors.cardBg, borderColor: themeColors.inputBorder }]}>
          {/* Configuration du Code PIN de secours à 6 chiffres */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push('/(app)/pin-setup')}
            style={styles.optionRow}
          >
            <View style={{ flex: 1, paddingRight: 10 }}>
              <Text style={[styles.optionTitle, { color: themeColors.textPrimary }]}>
                Code PIN à 6 chiffres (Secours)
              </Text>
              <Text style={[styles.optionSub, { color: themeColors.textSecondary }]}>
                Définir ou modifier le code PIN exigé en cas d'échec biométrique
              </Text>
            </View>
            <Icon name="solar:alt-arrow-right-linear" color={colors.green} size={20} />
          </TouchableOpacity>

          <View style={[styles.rowDivider, { backgroundColor: themeColors.divider }]} />

          {/* Switch Biométrie */}
          <View style={styles.optionRow}>
            <View style={{ flex: 1, paddingRight: 10 }}>
              <Text style={[styles.optionTitle, { color: themeColors.textPrimary }]}>
                Verrouillage Face ID / Empreinte
              </Text>
              <Text style={[styles.optionSub, { color: themeColors.textSecondary }]}>
                Exige un code PIN pour la désactivation
              </Text>
            </View>
            <Switch
              value={biometricsEnabled}
              onValueChange={handleToggleBiometrics}
              trackColor={{ false: '#CBD5E1', true: colors.green }}
              thumbColor={colors.white}
            />
          </View>

          <View style={[styles.rowDivider, { backgroundColor: themeColors.divider }]} />

          {/* Switch Se souvenir de moi */}
          <View style={styles.optionRow}>
            <View style={{ flex: 1, paddingRight: 10 }}>
              <Text style={[styles.optionTitle, { color: themeColors.textPrimary }]}>
                {t('common.rememberMe', 'Se souvenir de moi')}
              </Text>
              <Text style={[styles.optionSub, { color: themeColors.textSecondary }]}>
                Rester connecté automatiquement sur cet appareil
              </Text>
            </View>
            <Switch
              value={rememberMe}
              onValueChange={setRememberMe}
              trackColor={{ false: '#CBD5E1', true: colors.green }}
              thumbColor={colors.white}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollBody: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  sectionTitle: {
    fontFamily: fonts.headlineBold,
    fontSize: scaleFont(16),
    fontWeight: '800',
  },
  criteriaContainer: {
    marginTop: 10,
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
  },
  criteriaTitle: {
    fontFamily: fonts.headlineBold,
    fontSize: scaleFont(12),
    marginBottom: 6,
  },
  criteriaGrid: {
    gap: 4,
  },
  criteriaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  criteriaText: {
    fontFamily: fonts.regular,
    fontSize: scaleFont(11),
  },
  saveBtn: {
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnText: {
    fontFamily: fonts.headlineBold,
    fontSize: scaleFont(15),
    fontWeight: '700',
    color: colors.white,
  },
  optionsCard: {
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 16,
    marginTop: 12,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  optionTitle: {
    fontFamily: fonts.headlineBold,
    fontSize: scaleFont(14),
    fontWeight: '700',
  },
  optionSub: {
    fontFamily: fonts.regular,
    fontSize: scaleFont(12),
    marginTop: 2,
  },
  rowDivider: {
    height: 1,
  },
});
