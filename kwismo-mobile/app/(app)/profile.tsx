import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  Modal,
  TextInput,
  Pressable,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useTranslation } from 'react-i18next';
import { Icon } from '../../src/shared/ui/Icon';
import { TabBar } from '../../src/shared/components/TabBar';
import { HeaderBar } from '../../src/shared/components/HeaderBar';
import { Skeleton, SkeletonCircle, SkeletonLoader } from '../../src/shared/ui/Skeleton';
import { useAppTheme } from '../../src/shared/hooks/useAppTheme';
import { useThemeStore, ThemePreference } from '../../src/shared/store/themeStore';
import { useAuthStore } from '../../src/shared/store/authStore';
import { toast } from '../../src/shared/store/toastStore';
import { colors, fonts } from '../../src/styles/tokens';
import { scaleFont } from '../../src/shared/lib/responsive';

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t, i18n } = useTranslation();
  const { isDark, colors: themeColors } = useAppTheme();
  const { userThemePreference, setTheme } = useThemeStore();
  const logout = useAuthStore((state) => state.logout);

  const [loading, setLoading] = useState(true);

  // Équivalents des switches de réglages (Maquette Designer)
  const [callDetectionEnabled, setCallDetectionEnabled] = useState(true);
  const [pushNotificationEnabled, setPushNotificationEnabled] = useState(true);
  const [rememberMeEnabled, setRememberMeEnabled] = useState(true);
  const [biometricsEnabled, setBiometricsEnabled] = useState(true);

  // Modales
  const [editProfileModalVisible, setEditProfileModalVisible] = useState(false);
  const [themeModalVisible, setThemeModalVisible] = useState(false);
  const [languageModalVisible, setLanguageModalVisible] = useState(false);

  // Édition profil
  const [userName, setUserName] = useState('Ismaël Cesar');
  const [userCountry, setUserCountry] = useState('Cameroun');
  const [userPhone, setUserPhone] = useState('+237 6 98 44 43 88');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 350);
    return () => clearTimeout(timer);
  }, []);

  const handleLogout = () => {
    logout();
    router.replace('/(auth)/login');
  };

  const handleSaveProfile = () => {
    setIsSavingProfile(true);
    setTimeout(() => {
      setIsSavingProfile(false);
      setEditProfileModalVisible(false);
      toast.success(t('toasts.generalSuccess', 'Profil mis à jour avec succès !'));
    }, 500);
  };

  const getThemeLabel = (pref: ThemePreference) => {
    if (pref === 'light') return t('theme.light', 'Clair');
    if (pref === 'dark') return t('theme.dark', 'Sombre');
    return t('theme.system', 'Système');
  };

  const getLanguageLabel = (lang: string) => {
    if (lang.startsWith('en')) return 'English';
    return 'Français';
  };

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <StatusBar style="light" />

      {/* En-tête global "Profil & Sécurité" identique à la maquette designer */}
      <HeaderBar title={t('common.profile', 'Profil & Sécurité')} />

      <ScrollView
        contentContainerStyle={[
          styles.scrollBody,
          { paddingBottom: insets.bottom + 95 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* CARTE UTILISATEUR (En-tête de profil) */}
        {loading ? (
          <SkeletonLoader>
            <View style={[styles.userHeaderCard, { backgroundColor: themeColors.cardBg, borderColor: themeColors.inputBorder }]}>
              <SkeletonCircle size={56} />
              <View style={{ flex: 1, marginLeft: 14 }}>
                <Skeleton width={140} height={18} borderRadius={4} />
                <Skeleton width={130} height={14} borderRadius={4} style={{ marginTop: 6 }} />
              </View>
            </View>
          </SkeletonLoader>
        ) : (
          <View style={[styles.userHeaderCard, { backgroundColor: themeColors.cardBg, borderColor: themeColors.inputBorder }]}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarInitialText}>
                {userName.charAt(0).toUpperCase()}
              </Text>
            </View>

            <View style={styles.userTextInfo}>
              <Text style={[styles.userNameText, { color: themeColors.textPrimary }]}>
                {userName}
              </Text>
              <Text style={[styles.userPhoneText, { color: themeColors.textSecondary }]}>
                {userPhone}
              </Text>
            </View>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setEditProfileModalVisible(true)}
              style={styles.editPenBtn}
            >
              <Icon name="solar:pen-new-square-bold" color={colors.green} size={20} />
            </TouchableOpacity>
          </View>
        )}

        {/* SECTION 1 : COMPTE */}
        <Text style={[styles.groupSectionLabel, { color: themeColors.textSecondary }]}>
          {t('profile.accountSection', 'Compte')}
        </Text>

        <View style={[styles.groupCard, { backgroundColor: themeColors.cardBg, borderColor: themeColors.inputBorder }]}>
          {/* Éditer le profil */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setEditProfileModalVisible(true)}
            style={styles.itemRow}
          >
            <View style={styles.itemLeft}>
              <Icon name="solar:user-bold" color={colors.green} size={20} style={{ marginRight: 12 }} />
              <Text style={[styles.itemText, { color: themeColors.textPrimary }]}>
                {t('profile.personalInfo', 'Éditer le profil')}
              </Text>
            </View>
            <Icon name="solar:alt-arrow-right-linear" color={themeColors.inputPlaceholder} size={18} />
          </TouchableOpacity>

          <View style={[styles.rowDivider, { backgroundColor: themeColors.divider }]} />

          {/* Mot de passe sécurité */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setEditProfileModalVisible(true)}
            style={styles.itemRow}
          >
            <View style={styles.itemLeft}>
              <Icon name="solar:lock-keyhole-bold" color={colors.green} size={20} style={{ marginRight: 12 }} />
              <Text style={[styles.itemText, { color: themeColors.textPrimary }]}>
                {t('profile.security', 'Mot de passe sécurité')}
              </Text>
            </View>
            <Icon name="solar:alt-arrow-right-linear" color={themeColors.inputPlaceholder} size={18} />
          </TouchableOpacity>

          <View style={[styles.rowDivider, { backgroundColor: themeColors.divider }]} />

          {/* Notifications */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.push('/(app)/alert-whatsapp')}
            style={styles.itemRow}
          >
            <View style={styles.itemLeft}>
              <Icon name="solar:bell-bold" color={colors.green} size={20} style={{ marginRight: 12 }} />
              <Text style={[styles.itemText, { color: themeColors.textPrimary }]}>
                {t('common.notifications', 'Notifications')}
              </Text>
            </View>
            <Icon name="solar:alt-arrow-right-linear" color={themeColors.inputPlaceholder} size={18} />
          </TouchableOpacity>
        </View>

        {/* SECTION 2 : PRÉFÉRENCES */}
        <Text style={[styles.groupSectionLabel, { color: themeColors.textSecondary, marginTop: 16 }]}>
          {t('profile.preferences', 'Préférences')}
        </Text>

        <View style={[styles.groupCard, { backgroundColor: themeColors.cardBg, borderColor: themeColors.inputBorder }]}>
          {/* Thème */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setThemeModalVisible(true)}
            style={styles.itemRow}
          >
            <View style={styles.itemLeft}>
              <Icon name="solar:sun-2-bold" color={colors.green} size={20} style={{ marginRight: 12 }} />
              <Text style={[styles.itemText, { color: themeColors.textPrimary }]}>
                {t('profile.darkMode', 'Thème')}
              </Text>
            </View>

            <View style={styles.itemRightRow}>
              <Text style={[styles.itemValueText, { color: themeColors.textSecondary }]}>
                {getThemeLabel(userThemePreference)}
              </Text>
              <Icon name="solar:alt-arrow-right-linear" color={themeColors.inputPlaceholder} size={18} style={{ marginLeft: 6 }} />
            </View>
          </TouchableOpacity>

          <View style={[styles.rowDivider, { backgroundColor: themeColors.divider }]} />

          {/* Langues */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setLanguageModalVisible(true)}
            style={styles.itemRow}
          >
            <View style={styles.itemLeft}>
              <Icon name="solar:global-bold" color={colors.green} size={20} style={{ marginRight: 12 }} />
              <Text style={[styles.itemText, { color: themeColors.textPrimary }]}>
                {t('profile.language', 'Langues')}
              </Text>
            </View>

            <View style={styles.itemRightRow}>
              <Text style={[styles.itemValueText, { color: themeColors.textSecondary }]}>
                {getLanguageLabel(i18n.language)}
              </Text>
              <Icon name="solar:alt-arrow-right-linear" color={themeColors.inputPlaceholder} size={18} style={{ marginLeft: 6 }} />
            </View>
          </TouchableOpacity>

          <View style={[styles.rowDivider, { backgroundColor: themeColors.divider }]} />

          {/* Détection d'appel (Switch) */}
          <View style={styles.itemRow}>
            <View style={styles.itemLeft}>
              <Icon name="solar:phone-bold" color={colors.green} size={20} style={{ marginRight: 12 }} />
              <Text style={[styles.itemText, { color: themeColors.textPrimary }]}>
                Détection d'appel
              </Text>
            </View>
            <Switch
              value={callDetectionEnabled}
              onValueChange={setCallDetectionEnabled}
              trackColor={{ false: '#CBD5E1', true: colors.green }}
              thumbColor={colors.white}
            />
          </View>

          <View style={[styles.rowDivider, { backgroundColor: themeColors.divider }]} />

          {/* Notification Push (Switch) */}
          <View style={styles.itemRow}>
            <View style={styles.itemLeft}>
              <Icon name="solar:bell-linear" color={colors.green} size={20} style={{ marginRight: 12 }} />
              <Text style={[styles.itemText, { color: themeColors.textPrimary }]}>
                Notification Push
              </Text>
            </View>
            <Switch
              value={pushNotificationEnabled}
              onValueChange={setPushNotificationEnabled}
              trackColor={{ false: '#CBD5E1', true: colors.green }}
              thumbColor={colors.white}
            />
          </View>
        </View>

        {/* SECTION 3 : SÉCURITÉ */}
        <Text style={[styles.groupSectionLabel, { color: themeColors.textSecondary, marginTop: 16 }]}>
          {t('common.security', 'Sécurité')}
        </Text>

        <View style={[styles.groupCard, { backgroundColor: themeColors.cardBg, borderColor: themeColors.inputBorder }]}>
          {/* Modifier le mot de passe */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setEditProfileModalVisible(true)}
            style={styles.itemRow}
          >
            <View style={styles.itemLeft}>
              <Icon name="solar:key-bold" color={colors.green} size={20} style={{ marginRight: 12 }} />
              <Text style={[styles.itemText, { color: themeColors.textPrimary }]}>
                {t('auth.forgotPasswordLink', 'Modifier le mot de passe')}
              </Text>
            </View>
            <Icon name="solar:alt-arrow-right-linear" color={themeColors.inputPlaceholder} size={18} />
          </TouchableOpacity>

          <View style={[styles.rowDivider, { backgroundColor: themeColors.divider }]} />

          {/* Se souvenir de moi (Switch) */}
          <View style={styles.itemRow}>
            <View style={styles.itemLeft}>
              <Icon name="solar:user-block-bold" color={colors.green} size={20} style={{ marginRight: 12 }} />
              <Text style={[styles.itemText, { color: themeColors.textPrimary }]}>
                {t('common.rememberMe', 'Se souvenir de moi')}
              </Text>
            </View>
            <Switch
              value={rememberMeEnabled}
              onValueChange={setRememberMeEnabled}
              trackColor={{ false: '#CBD5E1', true: colors.green }}
              thumbColor={colors.white}
            />
          </View>

          <View style={[styles.rowDivider, { backgroundColor: themeColors.divider }]} />

          {/* Verrouillage Face ID / Empreinte (Switch) */}
          <View style={styles.itemRow}>
            <View style={styles.itemLeft}>
              <Icon name="solar:shield-keyhole-bold" color={colors.green} size={20} style={{ marginRight: 12 }} />
              <Text style={[styles.itemText, { color: themeColors.textPrimary }]}>
                Verrouillage Face ID / Empreinte
              </Text>
            </View>
            <Switch
              value={biometricsEnabled}
              onValueChange={setBiometricsEnabled}
              trackColor={{ false: '#CBD5E1', true: colors.green }}
              thumbColor={colors.white}
            />
          </View>
        </View>

        {/* BOUTONS D'ACTION DU BAS (Design Designer) */}
        <View style={styles.bottomButtonsContainer}>
          {/* Supprimer son compte (Bouton Rouge) */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => toast.info('Action de suppression temporisée.')}
            style={[styles.dangerBtn, { backgroundColor: '#DC2626' }]}
          >
            <Text style={styles.dangerBtnText}>Supprimer son compte</Text>
          </TouchableOpacity>

          {/* Se Déconnecter (Bouton Sombre) */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleLogout}
            style={[styles.logoutDarkBtn, { backgroundColor: isDark ? '#334155' : '#0F172A' }]}
          >
            <Text style={styles.logoutDarkBtnText}>{t('auth.logout', 'Se Déconnecter')}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* MODALE 1 : ÉDITER LE PROFIL (Écran 2 Maquette) */}
      <Modal visible={editProfileModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlayBackdrop}>
          <View style={[styles.editModalSheet, { backgroundColor: themeColors.cardBg }]}>
            <View style={styles.modalHeaderRow}>
              <TouchableOpacity onPress={() => setEditProfileModalVisible(false)}>
                <Icon name="solar:arrow-left-bold" color={themeColors.textPrimary} size={22} />
              </TouchableOpacity>
              <Text style={[styles.modalHeaderTitle, { color: themeColors.textPrimary }]}>
                {t('common.profile', 'Profil')}
              </Text>
              <View style={{ width: 22 }} />
            </View>

            {/* Avatar avec icône appareil photo */}
            <View style={styles.modalAvatarContainer}>
              <View style={[styles.modalAvatarBigCircle, { backgroundColor: isDark ? '#334155' : '#CBD5E1' }]}>
                <Icon name="solar:user-bold" color={themeColors.textPrimary} size={36} />
              </View>

              <TouchableOpacity style={styles.cameraBadgeBtn}>
                <Icon name="solar:camera-bold" color={colors.white} size={14} />
              </TouchableOpacity>
            </View>

            {/* Champ Nom Complet */}
            <Text style={[styles.modalInputLabel, { color: themeColors.textPrimary }]}>
              Nom Complet
            </Text>
            <View style={[styles.modalInputWrapper, { backgroundColor: themeColors.inputBg, borderColor: themeColors.inputBorder }]}>
              <TextInput
                style={[styles.modalTextInput, { color: themeColors.textPrimary }]}
                value={userName}
                onChangeText={setUserName}
                placeholder="Lorem ipsum"
                placeholderTextColor={themeColors.inputPlaceholder}
              />
            </View>

            {/* Champ Pays */}
            <Text style={[styles.modalInputLabel, { color: themeColors.textPrimary, marginTop: 14 }]}>
              Pays
            </Text>
            <View style={[styles.modalInputWrapper, { backgroundColor: themeColors.inputBg, borderColor: themeColors.inputBorder }]}>
              <TextInput
                style={[styles.modalTextInput, { color: themeColors.textPrimary }]}
                value={userCountry}
                onChangeText={setUserCountry}
                placeholder="Cameroun"
                placeholderTextColor={themeColors.inputPlaceholder}
              />
            </View>

            {/* Bouton d'enregistrement Orange/Vert */}
            <TouchableOpacity
              activeOpacity={0.85}
              disabled={isSavingProfile}
              onPress={handleSaveProfile}
              style={[styles.saveProfileBtn, { backgroundColor: colors.orange, marginTop: 24 }]}
            >
              {isSavingProfile ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text style={styles.saveProfileBtnText}>Enregistrer les modifications</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* MODALE 2 : BOTTOM SHEET SELECTION DE THÈME (Écran 4 Maquette) */}
      <Modal visible={themeModalVisible} transparent animationType="fade">
        <Pressable style={styles.modalOverlayBackdrop} onPress={() => setThemeModalVisible(false)}>
          <Pressable style={[styles.bottomSheetModalCard, { backgroundColor: themeColors.cardBg }]}>
            <Text style={[styles.sheetTitle, { color: themeColors.textPrimary }]}>
              {t('profile.darkMode', 'Thème')}
            </Text>

            {(['light', 'dark', 'system'] as ThemePreference[]).map((mode) => {
              const isSelected = userThemePreference === mode;
              return (
                <TouchableOpacity
                  key={mode}
                  activeOpacity={0.7}
                  onPress={() => {
                    setTheme(mode);
                    setThemeModalVisible(false);
                  }}
                  style={styles.sheetOptionRow}
                >
                  <Text style={[styles.sheetOptionText, { color: themeColors.textPrimary }]}>
                    {getThemeLabel(mode)}
                  </Text>
                  <View style={[styles.radioCircleOut, { borderColor: isSelected ? colors.green : themeColors.inputBorder }]}>
                    {isSelected && <View style={styles.radioCircleIn} />}
                  </View>
                </TouchableOpacity>
              );
            })}
          </Pressable>
        </Pressable>
      </Modal>

      {/* MODALE 3 : BOTTOM SHEET SELECTION DE LANGUE (Écran 3 Maquette) */}
      <Modal visible={languageModalVisible} transparent animationType="fade">
        <Pressable style={styles.modalOverlayBackdrop} onPress={() => setLanguageModalVisible(false)}>
          <Pressable style={[styles.bottomSheetModalCard, { backgroundColor: themeColors.cardBg }]}>
            <Text style={[styles.sheetTitle, { color: themeColors.textPrimary }]}>
              {t('profile.language', 'Langue')}
            </Text>

            {[
              { code: 'fr', label: 'Français' },
              { code: 'en', label: 'English' },
            ].map((lang) => {
              const isSelected = i18n.language.startsWith(lang.code);
              return (
                <TouchableOpacity
                  key={lang.code}
                  activeOpacity={0.7}
                  onPress={() => {
                    i18n.changeLanguage(lang.code);
                    setLanguageModalVisible(false);
                  }}
                  style={styles.sheetOptionRow}
                >
                  <Text style={[styles.sheetOptionText, { color: themeColors.textPrimary }]}>
                    {lang.label}
                  </Text>
                  <View style={[styles.radioCircleOut, { borderColor: isSelected ? colors.green : themeColors.inputBorder }]}>
                    {isSelected && <View style={styles.radioCircleIn} />}
                  </View>
                </TouchableOpacity>
              );
            })}
          </Pressable>
        </Pressable>
      </Modal>

      <TabBar activeTab="profile" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollBody: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  userHeaderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 16,
  },
  avatarCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitialText: {
    fontFamily: fonts.headlineBold,
    fontSize: scaleFont(20),
    fontWeight: '800',
    color: '#0F172A',
  },
  userTextInfo: {
    flex: 1,
    marginLeft: 14,
  },
  userNameText: {
    fontFamily: fonts.headlineBold,
    fontSize: scaleFont(16),
    fontWeight: '800',
  },
  userPhoneText: {
    fontFamily: fonts.regular,
    fontSize: scaleFont(12),
    marginTop: 2,
  },
  editPenBtn: {
    padding: 6,
  },
  groupSectionLabel: {
    fontFamily: fonts.headlineBold,
    fontSize: scaleFont(12),
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  groupCard: {
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemText: {
    fontFamily: fonts.headlineBold,
    fontSize: scaleFont(14),
    fontWeight: '600',
  },
  itemRightRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemValueText: {
    fontFamily: fonts.regular,
    fontSize: scaleFont(13),
  },
  rowDivider: {
    height: 1,
  },
  bottomButtonsContainer: {
    gap: 10,
    marginTop: 12,
    marginBottom: 16,
  },
  dangerBtn: {
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dangerBtnText: {
    fontFamily: fonts.headlineBold,
    fontSize: scaleFont(14),
    fontWeight: '700',
    color: colors.white,
  },
  logoutDarkBtn: {
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutDarkBtnText: {
    fontFamily: fonts.headlineBold,
    fontSize: scaleFont(14),
    fontWeight: '700',
    color: colors.white,
  },

  // Modal Édition profil
  modalOverlayBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  editModalSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 34,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  modalHeaderTitle: {
    fontFamily: fonts.headlineBold,
    fontSize: scaleFont(17),
    fontWeight: '800',
  },
  modalAvatarContainer: {
    alignSelf: 'center',
    position: 'relative',
    marginBottom: 20,
  },
  modalAvatarBigCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraBadgeBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.green,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.white,
  },
  modalInputLabel: {
    fontFamily: fonts.headlineBold,
    fontSize: scaleFont(13),
    fontWeight: '600',
    marginBottom: 6,
  },
  modalInputWrapper: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    justifyContent: 'center',
  },
  modalTextInput: {
    fontFamily: fonts.regular,
    fontSize: scaleFont(14),
  },
  saveProfileBtn: {
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveProfileBtnText: {
    fontFamily: fonts.headlineBold,
    fontSize: scaleFont(15),
    fontWeight: '700',
    color: colors.white,
  },

  // Bottom Sheets Thème & Langue
  bottomSheetModalCard: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 30,
  },
  sheetTitle: {
    fontFamily: fonts.headlineBold,
    fontSize: scaleFont(16),
    fontWeight: '800',
    marginBottom: 16,
  },
  sheetOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  sheetOptionText: {
    fontFamily: fonts.headlineBold,
    fontSize: scaleFont(14),
    fontWeight: '600',
  },
  radioCircleOut: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleIn: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.green,
  },
});
