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

  const [notificationEnabled, setNotificationEnabled] = useState(true);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);

  const [themeModalVisible, setThemeModalVisible] = useState(false);
  const [languageModalVisible, setLanguageModalVisible] = useState(false);

  const userName = user?.firstName
    ? `${user.firstName} ${user.lastName || ''}`.trim()
    : profile?.prenom
    ? `${profile.prenom} ${profile.nom || ''}`.trim()
    : 'LOREM Ipsum';

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
    <View className="flex-1 bg-white dark:bg-brand-darkBg">
      <StatusBar style="light" />

      {/* Header Bar */}
      <HeaderBar title={t('common.profile')} />

      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 95 }}
        showsVerticalScrollIndicator={false}
        className="px-4"
      >
        {/* User Card (Floating Overlap style matching mockup) */}
        {loading ? (
          <SkeletonLoader>
            <View className="flex-row items-center p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-brand-cardDark shadow-md -mt-6 mb-4">
              <SkeletonCircle size={56} />
              <View className="flex-1 ml-3.5">
                <Skeleton width={100} height={14} borderRadius={4} />
                <Skeleton width={150} height={20} borderRadius={4} style={{ marginTop: 6 }} />
              </View>
            </View>
          </SkeletonLoader>
        ) : (
          <View className="flex-row items-center p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-brand-cardDark shadow-md -mt-6 mb-4">
            {/* Avatar Circle */}
            <View className="w-14 h-14 rounded-full bg-emerald-500 items-center justify-center overflow-hidden border-2 border-white dark:border-slate-800">
              <Text className="font-bold text-xl text-white">
                {userName.charAt(0).toUpperCase()}
              </Text>
            </View>

            {/* Profile Information */}
            <View className="flex-1 ml-3.5">
              <View className="flex-row items-center gap-1.5">
                <Text className="text-xs font-semibold text-slate-900 dark:text-slate-200">
                  {t('common.welcomeUser')}
                </Text>
                <Icon name="solar:verified-check-bold" color="#25B876" size={16} />
              </View>

              <Text className="font-title text-lg font-extrabold text-slate-900 dark:text-white mt-0.5">
                {userName}
              </Text>
            </View>

            {/* Edit Profile Button */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => router.push('/(app)/edit-profile')}
              className="p-2"
            >
              <Icon name="solar:pen-new-square-linear" color="#94A3B8" size={22} />
            </TouchableOpacity>
          </View>
        )}

        {/* Section: Préférence */}
        <Text className="text-xs font-semibold text-slate-400 dark:text-slate-500 mt-3 mb-2 px-1">
          {t('common.preferenceSection')}
        </Text>

        <View className="bg-white dark:bg-brand-cardDark">
          {/* Notification */}
          <View className="flex-row items-center justify-between py-3.5 border-b border-slate-100 dark:border-slate-800">
            <View className="flex-row items-center gap-3">
              <Icon name="solar:bell-linear" color={isDark ? '#FFFFFF' : '#161E33'} size={22} />
              <Text className="font-medium text-sm text-slate-900 dark:text-white">
                {t('common.notificationItem')}
              </Text>
            </View>
            <Switch
              value={notificationEnabled}
              onValueChange={setNotificationEnabled}
              trackColor={{ false: '#E2E8F0', true: '#FF9500' }}
              thumbColor="#FFFFFF"
            />
          </View>

          {/* Langue */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setLanguageModalVisible(true)}
            className="flex-row items-center justify-between py-3.5 border-b border-slate-100 dark:border-slate-800"
          >
            <View className="flex-row items-center gap-3">
              <Icon name="solar:global-linear" color={isDark ? '#FFFFFF' : '#161E33'} size={22} />
              <Text className="font-medium text-sm text-slate-900 dark:text-white">
                {t('common.language')}
              </Text>
            </View>

            <View className="flex-row items-center gap-1.5">
              <Text className="text-xs text-slate-400 font-medium">
                {getLanguageLabel(i18n.language)}
              </Text>
              <Icon name="solar:alt-arrow-right-linear" color="#CBD5E1" size={16} />
            </View>
          </TouchableOpacity>

          {/* Thème */}
          <View className="flex-row items-center justify-between py-3.5 border-b border-slate-100 dark:border-slate-800">
            <View className="flex-row items-center gap-3">
              <Icon name="solar:moon-linear" color={isDark ? '#FFFFFF' : '#161E33'} size={22} />
              <Text className="font-medium text-sm text-slate-900 dark:text-white">
                {t('common.themeItem')}
              </Text>
            </View>
            <Switch
              value={userThemePreference === 'dark' || isDark}
              onValueChange={(val) => setTheme(val ? 'dark' : 'light')}
              trackColor={{ false: '#E2E8F0', true: '#CBD5E1' }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {/* Section: Sécurité */}
        <Text className="text-xs font-semibold text-slate-400 dark:text-slate-500 mt-6 mb-2 px-1">
          {t('common.security')}
        </Text>

        <View className="bg-white dark:bg-brand-cardDark">
          {/* Changer le mot de passe */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.push('/(app)/security')}
            className="flex-row items-center justify-between py-3.5 border-b border-slate-100 dark:border-slate-800"
          >
            <View className="flex-row items-center gap-3">
              <Icon name="solar:lock-keyhole-linear" color={isDark ? '#FFFFFF' : '#161E33'} size={22} />
              <Text className="font-medium text-sm text-slate-900 dark:text-white">
                {t('common.changePassword')}
              </Text>
            </View>
            <Icon name="solar:alt-arrow-right-linear" color="#CBD5E1" size={16} />
          </TouchableOpacity>

          {/* Authentification à 2FA */}
          <View className="flex-row items-center justify-between py-3.5 border-b border-slate-100 dark:border-slate-800">
            <View className="flex-row items-center gap-3">
              <Icon name="solar:shield-keyhole-linear" color={isDark ? '#FFFFFF' : '#161E33'} size={22} />
              <Text className="font-medium text-sm text-slate-900 dark:text-white">
                {t('common.twoFactorAuthItem')}
              </Text>
            </View>
            <Switch
              value={twoFactorEnabled}
              onValueChange={setTwoFactorEnabled}
              trackColor={{ false: '#E2E8F0', true: '#FF9500' }}
              thumbColor="#FFFFFF"
            />
          </View>

          {/* Sessions actives */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => toast.info('Sessions actives')}
            className="flex-row items-center justify-between py-3.5 border-b border-slate-100 dark:border-slate-800"
          >
            <View className="flex-row items-center gap-3">
              <Icon name="solar:devices-linear" color={isDark ? '#FFFFFF' : '#161E33'} size={22} />
              <Text className="font-medium text-sm text-slate-900 dark:text-white">
                {t('common.activeSessionsItem')}
              </Text>
            </View>
            <Icon name="solar:alt-arrow-right-linear" color="#CBD5E1" size={16} />
          </TouchableOpacity>

          {/* Supprimer le compte */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => toast.info('Suppression du compte')}
            className="flex-row items-center justify-between py-3.5"
          >
            <View className="flex-row items-center gap-3">
              <Icon name="solar:trash-bin-trash-linear" color={isDark ? '#FFFFFF' : '#161E33'} size={22} />
              <Text className="font-medium text-sm text-slate-900 dark:text-white">
                {t('common.deleteAccountItem')}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Log Out Action */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleLogout}
          className="items-center justify-center py-8 mt-4 mb-2"
        >
          <Text className="font-bold text-base text-slate-900 dark:text-white">
            {t('common.logoutAction')}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Language Picker Modal */}
      <Modal visible={languageModalVisible} transparent animationType="slide">
        <Pressable className="flex-1 bg-black/50 justify-end" onPress={() => setLanguageModalVisible(false)}>
          <Pressable className="rounded-t-3xl p-5 pb-8 bg-white dark:bg-brand-cardDark">
            <Text className="font-bold text-base text-slate-900 dark:text-white mb-4">
              {t('common.selectLanguage')}
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
                  <Text className="font-semibold text-sm text-slate-900 dark:text-white">
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
