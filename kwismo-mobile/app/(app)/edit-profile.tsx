import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useTranslation } from 'react-i18next';
import { Icon } from '../../src/shared/ui/Icon';
import { Input } from '../../src/shared/ui/Input';
import { HeaderBar } from '../../src/shared/components/HeaderBar';
import { CountrySelectInput } from '../../src/shared/components/CountrySelectInput';
import { ProfilePhotoPickerModal } from '../../src/shared/components/ProfilePhotoPickerModal';
import { useAppTheme } from '../../src/shared/hooks/useAppTheme';
import { toast } from '../../src/shared/store/toastStore';
import { colors, fonts } from '../../src/styles/tokens';
import { scaleFont } from '../../src/shared/lib/responsive';

export default function EditProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { isDark, colors: themeColors } = useAppTheme();

  const initialEmail = 'ismael.cesar@kwismo.com';
  const [fullName, setFullName] = useState('Ismaël Cesar');
  const [email, setEmail] = useState(initialEmail);
  const [countryName, setCountryName] = useState('Cameroun');
  const [countryCode, setCountryCode] = useState('CM');
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);

  const [fullNameError, setFullNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isPhotoPickerOpen, setIsPhotoPickerOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    let valid = true;
    setFullNameError('');
    setEmailError('');

    if (!fullName.trim()) {
      setFullNameError(t('validation.required', 'Le nom complet est obligatoire.'));
      valid = false;
    }

    if (!email.trim() || !email.includes('@')) {
      setEmailError(t('validation.emailInvalid', 'Veuillez saisir une adresse email valide.'));
      valid = false;
    }

    if (!valid) return;

    const hasEmailChanged = email.trim().toLowerCase() !== initialEmail.toLowerCase();

    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      if (hasEmailChanged) {
        toast.info(t('toasts.otpSent', 'Un code OTP a été envoyé pour valider votre nouvel e-mail.'));
        router.push('/(auth)/otp');
      } else {
        toast.success(t('toasts.generalSuccess', 'Profil mis à jour avec succès !'));
        router.back();
      }
    }, 600);
  };

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <StatusBar style="light" />

      {/* Header unifié de page secondaire sans cloche */}
      <HeaderBar title={t('profile.personalInfo', 'Éditer le profil')} showBack={true} />

      <ScrollView
        contentContainerStyle={[
          styles.scrollBody,
          { paddingBottom: insets.bottom + 40 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Photo de profil avec icône appareil photo */}
        <View style={styles.avatarSection}>
          <View style={[styles.avatarBigCircle, { backgroundColor: isDark ? '#334155' : '#CBD5E1' }]}>
            <Text style={styles.avatarInitial}>
              {fullName.charAt(0).toUpperCase()}
            </Text>
          </View>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => setIsPhotoPickerOpen(true)}
            style={styles.cameraBadgeBtn}
          >
            <Icon name="solar:camera-bold" color={colors.white} size={16} />
          </TouchableOpacity>
        </View>

        {/* Input Standardisé : Nom Complet (avec focus et gestion d'erreur comme sur l'auth) */}
        <Input
          label={t('common.fullName', 'Nom Complet')}
          value={fullName}
          onChangeText={(val) => {
            setFullName(val);
            if (fullNameError) setFullNameError('');
          }}
          placeholder="Ismaël Cesar"
          error={fullNameError}
          iconLeft="solar:user-linear"
        />

        {/* Input Standardisé : Email (avec focus et validation) */}
        <View style={{ marginTop: 12 }}>
          <Input
            label={t('common.email', 'Adresse email')}
            value={email}
            onChangeText={(val) => {
              setEmail(val);
              if (emailError) setEmailError('');
            }}
            keyboardType="email-address"
            placeholder="ismael.cesar@kwismo.com"
            error={emailError}
            iconLeft="solar:letter-linear"
          />
        </View>

        {/* Input Sélection de Pays du Monde (Composant dédié i18n-iso-countries) */}
        <View style={{ marginTop: 12 }}>
          <CountrySelectInput
            label={t('common.country', 'Pays')}
            value={countryName}
            countryCode={countryCode}
            onSelectCountry={(name, code) => {
              setCountryName(name);
              setCountryCode(code);
            }}
          />
        </View>

        {/* Bouton d'enregistrement principal */}
        <TouchableOpacity
          activeOpacity={0.85}
          disabled={isSaving}
          onPress={handleSave}
          style={[styles.saveBtn, { backgroundColor: colors.orange, marginTop: 32 }]}
        >
          {isSaving ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={styles.saveBtnText}>
              {t('common.saveChanges', 'Enregistrer les modifications')}
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* Modale de changement de photo (Caméra / Galerie) */}
      <ProfilePhotoPickerModal
        visible={isPhotoPickerOpen}
        onClose={() => setIsPhotoPickerOpen(false)}
        onSelectPhoto={(url) => setProfilePhoto(url)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollBody: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  avatarSection: {
    alignSelf: 'center',
    position: 'relative',
    marginBottom: 24,
  },
  avatarBigCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontFamily: fonts.headlineBold,
    fontSize: scaleFont(32),
    fontWeight: '800',
    color: '#0F172A',
  },
  cameraBadgeBtn: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.green,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.white,
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
});
