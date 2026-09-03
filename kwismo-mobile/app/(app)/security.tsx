import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Switch,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useTranslation } from 'react-i18next';
import { Icon } from '../../src/shared/ui/Icon';
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
  const [showPasswords, setShowPasswords] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [biometrics, setBiometrics] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdatePassword = () => {
    if (!currentPassword.trim() || !newPassword.trim()) {
      toast.error(t('validation.required', 'Veuillez remplir tous les champs obligatoires.'));
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error(t('validation.passwordsDoNotMatch', 'Les mots de passe ne correspondent pas.'));
      return;
    }

    setIsUpdating(true);
    setTimeout(() => {
      setIsUpdating(false);
      toast.success(t('toasts.passwordResetSuccess', 'Mot de passe mis à jour avec succès !'));
      router.back();
    }, 600);
  };

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <StatusBar style="light" />

      {/* Header unifié de page secondaire */}
      <HeaderBar title={t('profile.security', 'Sécurité & mot de passe')} showBack={true} />

      <ScrollView
        contentContainerStyle={[
          styles.scrollBody,
          { paddingBottom: insets.bottom + 40 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Formulaire de modification du mot de passe */}
        <Text style={[styles.sectionTitle, { color: themeColors.textPrimary }]}>
          Modifier mon mot de passe
        </Text>

        <Text style={[styles.fieldLabel, { color: themeColors.textPrimary, marginTop: 14 }]}>
          Mot de passe actuel
        </Text>
        <View style={[styles.inputWrapper, { backgroundColor: themeColors.inputBg, borderColor: themeColors.inputBorder }]}>
          <Icon name="solar:lock-keyhole-linear" color={colors.green} size={20} style={{ marginRight: 10 }} />
          <TextInput
            style={[
              styles.textInput,
              { color: themeColors.textPrimary },
              Platform.OS === 'web' ? ({ outline: 'none' } as any) : {},
            ]}
            secureTextEntry={!showPasswords}
            value={currentPassword}
            onChangeText={setCurrentPassword}
            placeholder="••••••••"
            placeholderTextColor={themeColors.inputPlaceholder}
          />
          <TouchableOpacity onPress={() => setShowPasswords(!showPasswords)} style={{ padding: 4 }}>
            <Icon
              name={showPasswords ? 'solar:eye-bold' : 'solar:eye-closed-bold'}
              color={themeColors.inputPlaceholder}
              size={18}
            />
          </TouchableOpacity>
        </View>

        <Text style={[styles.fieldLabel, { color: themeColors.textPrimary, marginTop: 14 }]}>
          Nouveau mot de passe
        </Text>
        <View style={[styles.inputWrapper, { backgroundColor: themeColors.inputBg, borderColor: themeColors.inputBorder }]}>
          <Icon name="solar:key-linear" color={colors.green} size={20} style={{ marginRight: 10 }} />
          <TextInput
            style={[
              styles.textInput,
              { color: themeColors.textPrimary },
              Platform.OS === 'web' ? ({ outline: 'none' } as any) : {},
            ]}
            secureTextEntry={!showPasswords}
            value={newPassword}
            onChangeText={setNewPassword}
            placeholder="••••••••"
            placeholderTextColor={themeColors.inputPlaceholder}
          />
        </View>

        <Text style={[styles.fieldLabel, { color: themeColors.textPrimary, marginTop: 14 }]}>
          Confirmer le nouveau mot de passe
        </Text>
        <View style={[styles.inputWrapper, { backgroundColor: themeColors.inputBg, borderColor: themeColors.inputBorder }]}>
          <Icon name="solar:key-bold" color={colors.green} size={20} style={{ marginRight: 10 }} />
          <TextInput
            style={[
              styles.textInput,
              { color: themeColors.textPrimary },
              Platform.OS === 'web' ? ({ outline: 'none' } as any) : {},
            ]}
            secureTextEntry={!showPasswords}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="••••••••"
            placeholderTextColor={themeColors.inputPlaceholder}
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
            <Text style={styles.saveBtnText}>Mettre à jour le mot de passe</Text>
          )}
        </TouchableOpacity>

        {/* Options de sécurité avancées */}
        <Text style={[styles.sectionTitle, { color: themeColors.textPrimary, marginTop: 32 }]}>
          Options de sécurité
        </Text>

        <View style={[styles.optionsCard, { backgroundColor: themeColors.cardBg, borderColor: themeColors.inputBorder }]}>
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

          <View style={[styles.rowDivider, { backgroundColor: themeColors.divider }]} />

          <View style={styles.optionRow}>
            <View style={{ flex: 1, paddingRight: 10 }}>
              <Text style={[styles.optionTitle, { color: themeColors.textPrimary }]}>
                Verrouillage Face ID / Empreinte
              </Text>
              <Text style={[styles.optionSub, { color: themeColors.textSecondary }]}>
                Exiger la biométrie à l'ouverture de Kwismo
              </Text>
            </View>
            <Switch
              value={biometrics}
              onValueChange={setBiometrics}
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
  fieldLabel: {
    fontFamily: fonts.headlineBold,
    fontSize: scaleFont(13),
    fontWeight: '600',
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
    borderRadius: 14,
    borderWidth: 1.5,
    paddingHorizontal: 14,
  },
  textInput: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: scaleFont(14),
  },
  saveBtn: {
    height: 50,
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
