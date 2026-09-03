import React from 'react';
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

  const handleLogout = () => {
    logout();
    router.replace('/(auth)/login');
  };

  const isDarkModeActive = userThemePreference === 'dark' || (userThemePreference === 'system' && isDark);

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <StatusBar style="light" />

      {/* Header unifié pour la page principale : Titre à gauche, Actions à droite */}
      <HeaderBar title={t('common.profile', 'Profil')} />

      <ScrollView
        contentContainerStyle={{ paddingBottom: 110 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {/* Carte de profil utilisateur */}
          <View style={[styles.userProfileCard, { backgroundColor: themeColors.cardBg, borderColor: themeColors.inputBorder }]}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>L</Text>
            </View>
            <View style={styles.userInfo}>
              <Text style={[styles.userName, { color: themeColors.textPrimary }]}>Lorem Ipsum</Text>
              <Text style={[styles.userEmail, { color: themeColors.textSecondary }]}>lorem.ipsum@kwismo.com</Text>
            </View>
          </View>
          <Text style={[styles.sectionTitle, { color: themeColors.textSecondary }]}>
            {t('profile.preferences')}
          </Text>

          <View style={[styles.card, { backgroundColor: themeColors.cardBg, borderColor: themeColors.inputBorder }]}>
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <Icon name="solar:moon-linear" color={colors.green} size={20} style={{ marginRight: 12 }} />
                <Text style={[styles.settingLabel, { color: themeColors.textPrimary }]}>
                  {t('profile.darkMode')}
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

            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <Icon name="solar:global-linear" color={colors.green} size={20} style={{ marginRight: 12 }} />
                <Text style={[styles.settingLabel, { color: themeColors.textPrimary }]}>
                  {t('profile.language')}
                </Text>
              </View>
              <LanguageSwitcher />
            </View>
          </View>

          <Text style={[styles.sectionTitle, { color: themeColors.textSecondary }]}>
            {t('common.security')}
          </Text>

          <View style={[styles.card, { backgroundColor: themeColors.cardBg, borderColor: themeColors.inputBorder }]}>
            <TouchableOpacity activeOpacity={0.7} style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <Icon name="solar:shield-check-linear" color={colors.green} size={20} style={{ marginRight: 12 }} />
                <Text style={[styles.settingLabel, { color: themeColors.textPrimary }]}>
                  {t('common.securityCheck')}
                </Text>
              </View>
              <Icon name="solar:alt-arrow-right-linear" color={themeColors.inputPlaceholder} size={18} />
            </TouchableOpacity>

            <View style={[styles.divider, { backgroundColor: themeColors.inputBorder }]} />

            <TouchableOpacity activeOpacity={0.7} style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <Icon name="solar:bell-linear" color={colors.green} size={20} style={{ marginRight: 12 }} />
                <Text style={[styles.settingLabel, { color: themeColors.textPrimary }]}>
                  {t('common.notifications')}
                </Text>
              </View>
              <Icon name="solar:alt-arrow-right-linear" color={themeColors.inputPlaceholder} size={18} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleLogout}
            style={[styles.logoutBtn, { borderColor: '#EF4444' }]}
          >
            <Icon name="solar:logout-2-linear" color="#EF4444" size={20} style={{ marginRight: 8 }} />
            <Text style={styles.logoutText}>{t('auth.logout')}</Text>
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
  headerCard: {
    backgroundColor: colors.green,
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FF9900',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  avatarText: {
    fontFamily: fonts.bold,
    fontSize: 24,
    color: colors.white,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontFamily: fonts.h6,
    fontSize: scaleFont(20),
    fontWeight: '700',
    color: colors.white,
  },
  userEmail: {
    fontFamily: fonts.regular,
    fontSize: scaleFont(13),
    color: 'rgba(255, 255, 255, 0.85)',
    marginTop: 2,
  },
  userProfileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  sectionTitle: {
    fontFamily: fonts.bold,
    fontSize: scaleFont(13),
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
    marginLeft: 4,
  },
  card: {
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
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
    fontFamily: fonts.medium,
    fontSize: scaleFont(15),
  },
  divider: {
    height: 1,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    borderRadius: 14,
    borderWidth: 1.5,
    marginTop: 10,
  },
  logoutText: {
    fontFamily: fonts.bold,
    fontSize: scaleFont(15),
    color: '#EF4444',
  },
});

