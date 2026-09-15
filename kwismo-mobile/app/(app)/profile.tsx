import React, { useState } from 'react';
import {
  View,
  Text,
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
import { Icon } from '@/shared/ui/Icon';
import { TabBar } from '@/shared/components/TabBar';
import { HeaderBar } from '@/shared/components/HeaderBar';
import { Skeleton, SkeletonCircle, SkeletonLoader } from '@/shared/ui/Skeleton';
import { useAppTheme } from '@/shared/hooks/useAppTheme';
import { useThemeStore, ThemePreference } from '@/shared/store/themeStore';
import { useAuthStore } from '@/shared/store/authStore';
import { useProfile } from '@/features/profile/hooks/useProfile';
import { toast } from '@/shared/store/toastStore';

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t, i18n } = useTranslation();
  const { isDark } = useAppTheme();
  const { userThemePreference, setTheme } = useThemeStore();
  const { user } = useAuthStore();
  const { profile, loading } = useProfile();
  const logout = useAuthStore((state) => state.logout);

  const [callDetectionEnabled, setCallDetectionEnabled] = useState(true);

  const [themeModalVisible, setThemeModalVisible] = useState(false);
  const [languageModalVisible, setLanguageModalVisible] = useState(false);

  const userName = user?.firstName
    ? `${user.firstName} ${user.lastName || ''}`.trim()
    : profile?.prenom
    ? `${profile.prenom} ${profile.nom || ''}`.trim()
    : user?.email
    ? user.email.split('@')[0]
    : 'Utilisateur KWISMO';

  const userEmail = user?.email || profile?.email || '';

  const handleLogout = async () => {
    await logout();
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
    <View className="flex-1 bg-slate-50 dark:bg-brand-darkBg">
      <StatusBar style={isDark ? 'light' : 'dark'} />

      <HeaderBar title={t('common.profile')} />

      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 95 }}
        showsVerticalScrollIndicator={false}
        className="px-4 pt-4"
      >
        {loading ? (
          <SkeletonLoader>
            <View className="flex-row items-center p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-brand-cardDark mb-4">
              <SkeletonCircle size={52} />
              <View className="flex-1 ml-3.5">
                <Skeleton width={140} height={18} borderRadius={4} />
                <Skeleton width={160} height={14} borderRadius={4} style={{ marginTop: 6 }} />
              </View>
            </View>
          </SkeletonLoader>
        ) : (
          <View className="flex-row items-center p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-brand-cardDark mb-4">
            <View className="w-13 h-13 rounded-full bg-slate-300 dark:bg-slate-700 items-center justify-center">
              <Text className="font-font-bold text-xl font-extrabold text-slate-900 dark:text-white">
                {userName.charAt(0).toUpperCase()}
              </Text>
            </View>

            <View className="flex-1 ml-3.5">
              <Text className="font-font-bold text-base font-bold text-slate-900 dark:text-white">
                {userName}
              </Text>
              <Text className="font-font-regular text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {userEmail}
              </Text>
            </View>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => router.push('/(app)/edit-profile')}
              className="p-1.5"
            >
              <Icon name="solar:pen-new-square-bold" color="#25B876" size={20} />
            </TouchableOpacity>
          </View>
        )}

        <Text className="font-font-bold text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
          {t('profile.accountSection')}
        </Text>

        <View className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-brand-cardDark px-4 mb-3">
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.push('/(app)/edit-profile')}
            className="flex-row items-center justify-between py-3.5"
          >
            <View className="flex-row items-center">
              <Icon name="solar:user-bold" color={isDark ? '#94A3B8' : '#1E293B'} size={20} className="mr-3" />
              <Text className="font-font-bold text-sm font-semibold text-slate-900 dark:text-white">
                {t('profile.personalInfo')}
              </Text>
            </View>
            <Icon name="solar:alt-arrow-right-linear" color="#94A3B8" size={18} />
          </TouchableOpacity>

          <View className="h-px bg-slate-100 dark:bg-slate-800" />

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.push('/(app)/security')}
            className="flex-row items-center justify-between py-3.5"
          >
            <View className="flex-row items-center">
              <Icon name="solar:lock-keyhole-bold" color={isDark ? '#94A3B8' : '#1E293B'} size={20} className="mr-3" />
              <Text className="font-font-bold text-sm font-semibold text-slate-900 dark:text-white">
                {t('profile.security')}
              </Text>
            </View>
            <Icon name="solar:alt-arrow-right-linear" color="#94A3B8" size={18} />
          </TouchableOpacity>

          <View className="h-px bg-slate-100 dark:bg-slate-800" />

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.push('/(app)/two-factor')}
            className="flex-row items-center justify-between py-3.5"
          >
            <View className="flex-row items-center">
              <Icon name="solar:shield-keyhole-bold" color={isDark ? '#94A3B8' : '#1E293B'} size={20} className="mr-3" />
              <Text className="font-font-bold text-sm font-semibold text-slate-900 dark:text-white">
                {t('profile.twoFactor')}
              </Text>
            </View>
            <Icon name="solar:alt-arrow-right-linear" color="#94A3B8" size={18} />
          </TouchableOpacity>

          <View className="h-px bg-slate-100 dark:bg-slate-800" />

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.push('/(app)/notifications')}
            className="flex-row items-center justify-between py-3.5"
          >
            <View className="flex-row items-center">
              <Icon name="solar:bell-bold" color={isDark ? '#94A3B8' : '#1E293B'} size={20} className="mr-3" />
              <Text className="font-font-bold text-sm font-semibold text-slate-900 dark:text-white">
                {t('common.notifications')}
              </Text>
            </View>
            <Icon name="solar:alt-arrow-right-linear" color="#94A3B8" size={18} />
          </TouchableOpacity>
        </View>

        <Text className="font-font-bold text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mt-4 mb-2">
          {t('profile.preferences')}
        </Text>

        <View className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-brand-cardDark px-4 mb-3">
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setThemeModalVisible(true)}
            className="flex-row items-center justify-between py-3.5"
          >
            <View className="flex-row items-center">
              <Icon name="solar:sun-2-bold" color={isDark ? '#94A3B8' : '#1E293B'} size={20} className="mr-3" />
              <Text className="font-font-bold text-sm font-semibold text-slate-900 dark:text-white">
                {t('profile.darkMode')}
              </Text>
            </View>

            <View className="flex-row items-center">
              <Text className="font-font-regular text-xs text-slate-500 dark:text-slate-400">
                {getThemeLabel(userThemePreference)}
              </Text>
              <Icon name="solar:alt-arrow-right-linear" color="#94A3B8" size={18} className="ml-1.5" />
            </View>
          </TouchableOpacity>

          <View className="h-px bg-slate-100 dark:bg-slate-800" />

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setLanguageModalVisible(true)}
            className="flex-row items-center justify-between py-3.5"
          >
            <View className="flex-row items-center">
              <Icon name="solar:global-bold" color={isDark ? '#94A3B8' : '#1E293B'} size={20} className="mr-3" />
              <Text className="font-font-bold text-sm font-semibold text-slate-900 dark:text-white">
                {t('profile.language')}
              </Text>
            </View>

            <View className="flex-row items-center">
              <Text className="font-font-regular text-xs text-slate-500 dark:text-slate-400">
                {getLanguageLabel(i18n.language)}
              </Text>
              <Icon name="solar:alt-arrow-right-linear" color="#94A3B8" size={18} className="ml-1.5" />
            </View>
          </TouchableOpacity>

          <View className="h-px bg-slate-100 dark:bg-slate-800" />

          <View className="flex-row items-center justify-between py-3.5">
            <View className="flex-row items-center">
              <Icon name="solar:phone-bold" color={isDark ? '#94A3B8' : '#1E293B'} size={20} className="mr-3" />
              <Text className="font-font-bold text-sm font-semibold text-slate-900 dark:text-white">
                Détection d'appel
              </Text>
            </View>
            <Switch
              value={callDetectionEnabled}
              onValueChange={setCallDetectionEnabled}
              trackColor={{ false: '#CBD5E1', true: '#25B876' }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        <View className="gap-2.5 mt-9 mb-4">
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => toast.info('Action de suppression temporisée.')}
            className="h-12 rounded-xl items-center justify-center bg-red-600"
          >
            <Text className="font-font-bold text-sm font-bold text-white">Supprimer son compte</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleLogout}
            className="h-12 rounded-xl items-center justify-center bg-slate-900 dark:bg-slate-800"
          >
            <Text className="font-font-bold text-sm font-bold text-white">{t('auth.logout')}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal visible={themeModalVisible} transparent animationType="fade">
        <Pressable className="flex-1 bg-black/50 justify-end" onPress={() => setThemeModalVisible(false)}>
          <Pressable className="rounded-t-3xl p-5 pb-8 bg-white dark:bg-brand-cardDark">
            <Text className="font-font-bold text-base font-extrabold text-slate-900 dark:text-white mb-4">
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
                  className="flex-row items-center justify-between py-3"
                >
                  <Text className="font-font-bold text-sm font-semibold text-slate-900 dark:text-white">
                    {getThemeLabel(mode)}
                  </Text>
                  <View
                    className={`w-5 h-5 rounded-full border-2 items-center justify-center ${
                      isSelected ? 'border-brand-green' : 'border-slate-300 dark:border-slate-600'
                    }`}
                  >
                    {isSelected && <View className="w-2.5 h-2.5 rounded-full bg-brand-green" />}
                  </View>
                </TouchableOpacity>
              );
            })}
          </Pressable>
        </Pressable>
      </Modal>

      <Modal visible={languageModalVisible} transparent animationType="fade">
        <Pressable className="flex-1 bg-black/50 justify-end" onPress={() => setLanguageModalVisible(false)}>
          <Pressable className="rounded-t-3xl p-5 pb-8 bg-white dark:bg-brand-cardDark">
            <Text className="font-font-bold text-base font-extrabold text-slate-900 dark:text-white mb-4">
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
                  className="flex-row items-center justify-between py-3"
                >
                  <Text className="font-font-bold text-sm font-semibold text-slate-900 dark:text-white">
                    {lang.label}
                  </Text>
                  <View
                    className={`w-5 h-5 rounded-full border-2 items-center justify-center ${
                      isSelected ? 'border-brand-green' : 'border-slate-300 dark:border-slate-600'
                    }`}
                  >
                    {isSelected && <View className="w-2.5 h-2.5 rounded-full bg-brand-green" />}
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

