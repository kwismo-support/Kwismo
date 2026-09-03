import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useTranslation } from 'react-i18next';
import { Icon } from '../../src/shared/ui/Icon';
import { TabBar } from '../../src/shared/components/TabBar';
import { HeaderBar } from '../../src/shared/components/HeaderBar';
import { LanguageSwitcher } from '../../src/shared/components/LanguageSwitcher';
import { Skeleton, SkeletonCircle, SkeletonLoader } from '../../src/shared/ui/Skeleton';
import { useAppTheme } from '../../src/shared/hooks/useAppTheme';
import { useThemeStore } from '../../src/shared/store/themeStore';
import { useAuthStore } from '../../src/shared/store/authStore';
import { colors, fonts } from '../../src/styles/tokens';
import { scaleFont } from '../../src/shared/lib/responsive';

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { isDark, colors: themeColors } = useAppTheme();
  const { userThemePreference, setTheme } = useThemeStore();
  const logout = useAuthStore((state) => state.logout);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(timer);
  }, []);

  const handleLogout = () => {
    logout();
    router.replace('/(auth)/login');
  };

  const isDarkModeActive = userThemePreference === 'dark' || (userThemePreference === 'system' && isDark);

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <StatusBar style="light" />

      {/* Header global unifié */}
      <HeaderBar title={t('common.profile', 'Profil')} />

      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {/* Carte de profil utilisateur */}
          {loading ? (
            <SkeletonLoader>
              <View style={[styles.userProfileCard, { backgroundColor: themeColors.cardBg, borderColor: themeColors.inputBorder }]}>
                <SkeletonCircle size={56} />
                <View style={{ flex: 1, marginLeft: 14 }}>
                  <Skeleton width={140} height={18} borderRadius={4} />
                  <Skeleton width={180} height={14} borderRadius={4} style={{ marginTop: 6 }} />
                </View>
              </View>
            </SkeletonLoader>
          ) : (
            <View style={[styles.userProfileCard, { backgroundColor: themeColors.cardBg, borderColor: themeColors.inputBorder }]}>
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarText}>A</Text>
              </View>
              <View style={styles.userInfo}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={[styles.userName, { color: themeColors.textPrimary }]}>Alain NANA</Text>
                  <Icon name="solar:shield-check-bold" color={colors.green} size={18} style={{ marginLeft: 6 }} />
                </View>
                <Text style={[styles.userEmail, { color: themeColors.textSecondary }]}>alain.nana@kwismo.com</Text>
                <View style={[styles.verifiedBadge, { backgroundColor: isDark ? '#143324' : '#DCFCE7' }]}>
                  <Text style={[styles.verifiedBadgeText, { color: colors.green }]}>
                    {t('profile.verifiedUser', 'Compte utilisateur vérifié')}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Section 1 : PRÉFÉRENCES */}
          <Text style={[styles.sectionTitle, { color: themeColors.textSecondary }]}>
            {t('profile.preferences', 'Préférences')}
          </Text>

          <View style={[styles.card, { backgroundColor: themeColors.cardBg, borderColor: themeColors.inputBorder }]}>
            {/* Mode Sombre */}
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <Icon name="solar:moon-linear" color={colors.green} size={20} style={{ marginRight: 12 }} />
                <Text style={[styles.settingLabel, { color: themeColors.textPrimary }]}>
                  {t('profile.darkMode', 'Thème sombre')}
                </Text>
              </View>
              <Switch
                value={isDarkModeActive}
                onValueChange={(val) => setTheme(val ? 'dark' : 'light')}
                trackColor={{ false: '#CBD5E1', true: colors.green }}
                thumbColor={colors.white}
              />
            </View>

            <View style={[styles.divider, { backgroundColor: themeColors.inputBorder }]} />

            {/* Langue */}
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <Icon name="solar:global-linear" color={colors.green} size={20} style={{ marginRight: 12 }} />
                <Text style={[styles.settingLabel, { color: themeColors.textPrimary }]}>
                  {t('profile.language', 'Langue')}
                </Text>
              </View>
              <LanguageSwitcher />
            </View>
          </View>

          {/* Section 2 : SÉCURITÉ & SESSIONS */}
          <Text style={[styles.sectionTitle, { color: themeColors.textSecondary }]}>
            {t('common.security', 'Sécurité')}
          </Text>

          <View style={[styles.card, { backgroundColor: themeColors.cardBg, borderColor: themeColors.inputBorder }]}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => router.push('/(app)/management')}
              style={styles.settingRow}
            >
              <View style={styles.settingLeft}>
                <Icon name="solar:phone-calling-linear" color={colors.green} size={20} style={{ marginRight: 12 }} />
                <Text style={[styles.settingLabel, { color: themeColors.textPrimary }]}>
                  {t('common.myNumbers', 'Mes numéros enregistrés')}
                </Text>
              </View>
              <Icon name="solar:alt-arrow-right-linear" color={themeColors.inputPlaceholder} size={18} />
            </TouchableOpacity>

            <View style={[styles.divider, { backgroundColor: themeColors.inputBorder }]} />

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => router.push('/(app)/alert-whatsapp')}
              style={styles.settingRow}
            >
              <View style={styles.settingLeft}>
                <Icon name="ic:baseline-whatsapp" color="#25D366" size={20} style={{ marginRight: 12 }} />
                <Text style={[styles.settingLabel, { color: themeColors.textPrimary }]}>
                  {t('common.whatsappAlert', 'Alerte WhatsApp')}
                </Text>
              </View>
              <Icon name="solar:alt-arrow-right-linear" color={themeColors.inputPlaceholder} size={18} />
            </TouchableOpacity>

            <View style={[styles.divider, { backgroundColor: themeColors.inputBorder }]} />

            <TouchableOpacity activeOpacity={0.7} style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <Icon name="solar:shield-check-linear" color={colors.green} size={20} style={{ marginRight: 12 }} />
                <Text style={[styles.settingLabel, { color: themeColors.textPrimary }]}>
                  {t('common.securityCheck', 'Vérification de sécurité')}
                </Text>
              </View>
              <Icon name="solar:alt-arrow-right-linear" color={themeColors.inputPlaceholder} size={18} />
            </TouchableOpacity>
          </View>

          {/* Section 3 : À PROPOS */}
          <Text style={[styles.sectionTitle, { color: themeColors.textSecondary }]}>
            {t('profile.aboutSection', 'À propos')}
          </Text>

          <View style={[styles.card, { backgroundColor: themeColors.cardBg, borderColor: themeColors.inputBorder }]}>
            <TouchableOpacity activeOpacity={0.7} style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <Icon name="solar:document-text-linear" color={colors.green} size={20} style={{ marginRight: 12 }} />
                <Text style={[styles.settingLabel, { color: themeColors.textPrimary }]}>
                  {t('profile.privacyPolicy', 'Politique de confidentialité')}
                </Text>
              </View>
              <Icon name="solar:alt-arrow-right-linear" color={themeColors.inputPlaceholder} size={18} />
            </TouchableOpacity>

            <View style={[styles.divider, { backgroundColor: themeColors.inputBorder }]} />

            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <Icon name="solar:info-circle-linear" color={colors.green} size={20} style={{ marginRight: 12 }} />
                <Text style={[styles.settingLabel, { color: themeColors.textPrimary }]}>
                  {t('profile.appVersion', 'Version de l’application')}
                </Text>
              </View>
              <Text style={[styles.versionText, { color: themeColors.textSecondary }]}>v1.0.0</Text>
            </View>
          </View>

          {/* Bouton de déconnexion */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleLogout}
            style={[styles.logoutBtn, { borderColor: '#EF4444' }]}
          >
            <Icon name="solar:logout-2-linear" color="#EF4444" size={20} style={{ marginRight: 8 }} />
            <Text style={styles.logoutText}>{t('profile.logout', 'Se déconnecter')}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <TabBar activeTab="profile" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  userProfileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  avatarCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: fonts.headlineBold,
    fontSize: scaleFont(22),
    fontWeight: '800',
    color: colors.white,
  },
  userInfo: {
    flex: 1,
    marginLeft: 14,
  },
  userName: {
    fontFamily: fonts.headlineBold,
    fontSize: scaleFont(17),
    fontWeight: '800',
  },
  userEmail: {
    fontFamily: fonts.regular,
    fontSize: scaleFont(12),
    marginTop: 2,
  },
  verifiedBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginTop: 6,
  },
  verifiedBadgeText: {
    fontFamily: fonts.headlineBold,
    fontSize: scaleFont(10),
    fontWeight: '700',
  },
  sectionTitle: {
    fontFamily: fonts.headlineBold,
    fontSize: scaleFont(13),
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
    marginTop: 8,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingLabel: {
    fontFamily: fonts.headlineBold,
    fontSize: scaleFont(14),
    fontWeight: '600',
  },
  versionText: {
    fontFamily: fonts.regular,
    fontSize: scaleFont(13),
  },
  divider: {
    height: 1,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    borderRadius: 16,
    borderWidth: 1.5,
    marginTop: 10,
    marginBottom: 20,
  },
  logoutText: {
    fontFamily: fonts.headlineBold,
    fontSize: scaleFont(15),
    fontWeight: '700',
    color: '#EF4444',
  },
});
