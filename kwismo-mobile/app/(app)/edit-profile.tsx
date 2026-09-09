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
import { useAuthStore } from '../../src/shared/store/authStore';
import { useProfile } from '../../src/features/profile/hooks/useProfile';
import { toast } from '../../src/shared/store/toastStore';
import { colors, fonts } from '../../src/styles/tokens';
import { scaleFont } from '../../src/shared/lib/responsive';

export default function EditProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { isDark, colors: themeColors } = useAppTheme();

  const { user } = useAuthStore();
  const { updateProfile, loading: isSaving } = useProfile();

  const [lastName, setLastName] = useState(user?.lastName || '');
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [email] = useState(user?.email || '');
  const [countryName, setCountryName] = useState('Cameroun');
  const [countryCode, setCountryCode] = useState('CM');
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [isPhotoPickerOpen, setIsPhotoPickerOpen] = useState(false);

  const [nameError, setNameError] = useState('');

  const handleSave = async () => {
    if (!firstName.trim() && !lastName.trim()) {
      setNameError(t('validation.required', 'Le nom ou prénom est obligatoire.'));
      return;
    }

    const res = await updateProfile({
      nom: lastName.trim(),
      prenom: firstName.trim(),
    });

    if (res.success) {
      router.back();
    }
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
              {(firstName || lastName || 'K').charAt(0).toUpperCase()}
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

        {/* Input Prénom */}
        <Input
          label={t('common.firstName', 'Prénom')}
          value={firstName}
          onChangeText={(val) => {
            setFirstName(val);
            if (nameError) setNameError('');
          }}
          placeholder="Ismaël"
          error={nameError}
          iconLeft="solar:user-linear"
        />

        {/* Input Nom */}
        <View style={{ marginTop: 12 }}>
          <Input
            label={t('common.lastName', 'Nom')}
            value={lastName}
            onChangeText={(val) => {
              setLastName(val);
              if (nameError) setNameError('');
            }}
            placeholder="Cesar"
            iconLeft="solar:user-linear"
          />
        </View>

        {/* Input Email (Lecture seule ou info) */}
        <View style={{ marginTop: 12 }}>
          <Input
            label={t('common.email', 'Adresse email')}
            value={email}
            editable={false}
            keyboardType="email-address"
            placeholder="votre.email@kwismo.com"
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
