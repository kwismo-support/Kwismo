import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
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

export default function EditProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { isDark, colors: themeColors } = useAppTheme();

  const [fullName, setFullName] = useState('Ismaël Cesar');
  const [email, setEmail] = useState('ismael.cesar@kwismo.com');
  const [country, setCountry] = useState('Cameroun');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast.success(t('toasts.generalSuccess', 'Profil mis à jour avec succès !'));
      router.back();
    }, 600);
  };

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <StatusBar style="light" />

      {/* Header unifié de page secondaire */}
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
          <TouchableOpacity style={styles.cameraBadgeBtn} activeOpacity={0.8}>
            <Icon name="solar:camera-bold" color={colors.white} size={16} />
          </TouchableOpacity>
        </View>

        {/* Formulaire des informations personnelles */}
        <Text style={[styles.fieldLabel, { color: themeColors.textPrimary }]}>
          {t('common.fullName', 'Nom Complet')}
        </Text>
        <View
          style={[
            styles.inputWrapper,
            {
              backgroundColor: themeColors.inputBg,
              borderColor: themeColors.inputBorder,
            },
          ]}
        >
          <Icon name="solar:user-linear" color={colors.green} size={20} style={{ marginRight: 10 }} />
          <TextInput
            style={[
              styles.textInput,
              { color: themeColors.textPrimary },
              Platform.OS === 'web' ? ({ outline: 'none' } as any) : {},
            ]}
            value={fullName}
            onChangeText={setFullName}
            placeholder="Lorem Ipsum"
            placeholderTextColor={themeColors.inputPlaceholder}
          />
        </View>

        <Text style={[styles.fieldLabel, { color: themeColors.textPrimary, marginTop: 16 }]}>
          {t('common.email', 'Adresse email')}
        </Text>
        <View
          style={[
            styles.inputWrapper,
            {
              backgroundColor: themeColors.inputBg,
              borderColor: themeColors.inputBorder,
            },
          ]}
        >
          <Icon name="solar:letter-linear" color={colors.green} size={20} style={{ marginRight: 10 }} />
          <TextInput
            style={[
              styles.textInput,
              { color: themeColors.textPrimary },
              Platform.OS === 'web' ? ({ outline: 'none' } as any) : {},
            ]}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            placeholder="ismael.cesar@kwismo.com"
            placeholderTextColor={themeColors.inputPlaceholder}
          />
        </View>

        <Text style={[styles.fieldLabel, { color: themeColors.textPrimary, marginTop: 16 }]}>
          {t('common.country', 'Pays')}
        </Text>
        <View
          style={[
            styles.inputWrapper,
            {
              backgroundColor: themeColors.inputBg,
              borderColor: themeColors.inputBorder,
            },
          ]}
        >
          <Icon name="solar:global-linear" color={colors.green} size={20} style={{ marginRight: 10 }} />
          <TextInput
            style={[
              styles.textInput,
              { color: themeColors.textPrimary },
              Platform.OS === 'web' ? ({ outline: 'none' } as any) : {},
            ]}
            value={country}
            onChangeText={setCountry}
            placeholder="Cameroun"
            placeholderTextColor={themeColors.inputPlaceholder}
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
  fieldLabel: {
    fontFamily: fonts.headlineBold,
    fontSize: scaleFont(14),
    fontWeight: '700',
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
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
