import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  Modal,
  Pressable,
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
  const [callDetectionEnabled, setCallDetectionEnabled] = useState(true);

  // Bottom Sheet Modals
  const [themeModalVisible, setThemeModalVisible] = useState(false);
  const [languageModalVisible, setLanguageModalVisible] = useState(false);

  // Informations utilisateur (Email sous le nom)
  const userName = 'Ismaël Cesar';
  const userEmail = 'ismael.cesar@kwismo.com';

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(timer);
  }, []);

  const handleLogout = () => {
    logout();
    router.replace('/(auth)/login');
  };

  const getThemeLabel = (pref: ThemePreference) => {
    if (pref === 'light') return t('theme.light');
    if (pref === 'dark') return t('theme.dark');
    return t('theme.system');
  };

  const getLanguageLabel = (lang: string) => {
    if (lang.startsWith('en')) return 'English';
    return 'Français';
  };

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <StatusBar style="light" />

      <HeaderBar title={t('common.profile')} />

      <ScrollView
        contentContainerStyle={[
          styles.scrollBody,
          { paddingBottom: insets.bottom + 95 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <SkeletonLoader>
            <View style={[styles.userHeaderCard, { backgroundColor: themeColors.cardBg, borderColor: themeColors.inputBorder }]}>
              <SkeletonCircle size={52} />
              <View style={{ flex: 1, marginLeft: 14 }}>
                <Skeleton width={140} height={18} borderRadius={4} />
                <Skeleton width={160} height={14} borderRadius={4} style={{ marginTop: 6 }} />
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
              <Text style={[styles.userEmailText, { color: themeColors.textSecondary }]}>
                {userEmail}
              </Text>
            </View>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => router.push('/(app)/edit-profile')}
              style={styles.editPenBtn}
            >
              <Icon name="solar:pen-new-square-bold" color={colors.green} size={20} />
            </TouchableOpacity>
          </View>
        )}

        <Text style={[styles.groupSectionLabel, { color: themeColors.textSecondary }]}>
          {t('profile.accountSection')}
        </Text>

        <View style={[styles.groupCard, { backgroundColor: themeColors.cardBg, borderColor: themeColors.inputBorder }]}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.push('/(app)/edit-profile')}
            style={styles.itemRow}
          >
            <View style={styles.itemLeft}>
              <Icon name="solar:user-bold" color={isDark ? '#94A3B8' : '#1E293B'} size={20} style={{ marginRight: 12 }} />
              <Text style={[styles.itemText, { color: themeColors.textPrimary }]}>
                {t('profile.personalInfo')}
              </Text>
            </View>
            <Icon name="solar:alt-arrow-right-linear" color={themeColors.inputPlaceholder} size={18} />
          </TouchableOpacity>

          <View style={[styles.rowDivider, { backgroundColor: themeColors.divider }]} />

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.push('/(app)/security')}
            style={styles.itemRow}
          >
            <View style={styles.itemLeft}>
              <Icon name="solar:lock-keyhole-bold" color={isDark ? '#94A3B8' : '#1E293B'} size={20} style={{ marginRight: 12 }} />
              <Text style={[styles.itemText, { color: themeColors.textPrimary }]}>
                {t('profile.security')}
              </Text>
            </View>
            <Icon name="solar:alt-arrow-right-linear" color={themeColors.inputPlaceholder} size={18} />
          </TouchableOpacity>

          <View style={[styles.rowDivider, { backgroundColor: themeColors.divider }]} />

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.push('/(app)/two-factor')}
            style={styles.itemRow}
          >
            <View style={styles.itemLeft}>
              <Icon name="solar:shield-keyhole-bold" color={isDark ? '#94A3B8' : '#1E293B'} size={20} style={{ marginRight: 12 }} />
              <Text style={[styles.itemText, { color: themeColors.textPrimary }]}>
                {t('profile.twoFactor')}
              </Text>
            </View>
            <Icon name="solar:alt-arrow-right-linear" color={themeColors.inputPlaceholder} size={18} />
          </TouchableOpacity>

          <View style={[styles.rowDivider, { backgroundColor: themeColors.divider }]} />

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.push('/(app)/notifications')}
            style={styles.itemRow}
          >
            <View style={styles.itemLeft}>
              <Icon name="solar:bell-bold" color={isDark ? '#94A3B8' : '#1E293B'} size={20} style={{ marginRight: 12 }} />
              <Text style={[styles.itemText, { color: themeColors.textPrimary }]}>
                {t('common.notifications')}
              </Text>
            </View>
            <Icon name="solar:alt-arrow-right-linear" color={themeColors.inputPlaceholder} size={18} />
          </TouchableOpacity>
        </View>

        <Text style={[styles.groupSectionLabel, { color: themeColors.textSecondary, marginTop: 16 }]}>
          {t('profile.preferences')}
        </Text>

        <View style={[styles.groupCard, { backgroundColor: themeColors.cardBg, borderColor: themeColors.inputBorder }]}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setThemeModalVisible(true)}
            style={styles.itemRow}
          >
            <View style={styles.itemLeft}>
              <Icon name="solar:sun-2-bold" color={isDark ? '#94A3B8' : '#1E293B'} size={20} style={{ marginRight: 12 }} />
              <Text style={[styles.itemText, { color: themeColors.textPrimary }]}>
                {t('profile.darkMode')}
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

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setLanguageModalVisible(true)}
            style={styles.itemRow}
          >
            <View style={styles.itemLeft}>
              <Icon name="solar:global-bold" color={isDark ? '#94A3B8' : '#1E293B'} size={20} style={{ marginRight: 12 }} />
              <Text style={[styles.itemText, { color: themeColors.textPrimary }]}>
                {t('profile.language')}
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

          <View style={styles.itemRow}>
            <View style={styles.itemLeft}>
              <Icon name="solar:phone-bold" color={isDark ? '#94A3B8' : '#1E293B'} size={20} style={{ marginRight: 12 }} />
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
        </View>

        <View style={styles.bottomButtonsContainer}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => toast.info('Action de suppression temporisée.')}
            style={[styles.dangerBtn, { backgroundColor: '#DC2626' }]}
          >
            <Text style={styles.dangerBtnText}>Supprimer son compte</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleLogout}
            style={[styles.logoutDarkBtn, { backgroundColor: isDark ? '#334155' : '#0F172A' }]}
          >
            <Text style={styles.logoutDarkBtnText}>{t('auth.logout')}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* MODALE BOTTOM SHEET : THÈME */}
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

      {/* MODALE BOTTOM SHEET : LANGUE */}
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
  userEmailText: {
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
    marginTop: 36,
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

  // Bottom Sheets Thème & Langue
  modalOverlayBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
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
