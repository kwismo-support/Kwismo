import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  Pressable,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useTranslation } from 'react-i18next';
import { Icon } from '@/shared/ui/Icon';
import { TabBar } from '@/shared/components/TabBar';
import { HeaderBar } from '@/shared/components/HeaderBar';
import { CustomSwitch } from '@/shared/ui/CustomSwitch';
import { ProfileSkeleton } from '@/features/profile/components/ProfileSkeleton';
import { useAppTheme } from '@/shared/hooks/useAppTheme';
import { useThemeStore, ThemePreference } from '@/shared/store/themeStore';
import { useAuthStore } from '@/shared/store/authStore';
import { useProfile } from '@/features/profile/hooks/useProfile';
import { useNotificationSettings } from '@/features/profile/hooks/useNotificationSettings';

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t, i18n } = useTranslation();
  const { isDark } = useAppTheme();
  const { userThemePreference, setTheme } = useThemeStore();
  const { user } = useAuthStore();
  const { profile, loading, logout, updateProfile } = useProfile();
  const { preferences, updatePreference } = useNotificationSettings();

  const [languageModalVisible, setLanguageModalVisible] = useState(false);
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);

  const userName = user?.firstName
    ? `${user.firstName} ${user.lastName || ''}`.trim()
    : profile?.prenom
    ? `${profile.prenom} ${profile.nom || ''}`.trim()
    : profile?.email || '';

  const handleLogoutConfirm = async () => {
    setLogoutModalVisible(false);
    await logout();
    router.replace('/(auth)/login');
  };

  const getLanguageLabel = (lang: string) => {
    if (lang.startsWith('en')) return t('common.english');
    return t('common.french');
  };

  const avatarPhoto = user?.avatarUrl || profile?.photo_url;

  return (
    <View className="flex-1 bg-white dark:bg-brand-darkBg">
      <StatusBar style="light" />

      <HeaderBar title={t('common.profile')} />

      <View className="px-4">
        {loading ? (
          <View className="-mt-10">
            <ProfileSkeleton />
          </View>
        ) : (
          <View className="flex-row items-center p-4 rounded-2xl shadow-xl shadow-black elevation-4 border border-slate-100 dark:border-slate-800 bg-white dark:bg-brand-cardDark -mt-10 mb-4">
            <View className="wx-13 hx-13 rounded-full bg-emerald-100 dark:bg-emerald-900/40 items-center justify-center overflow-hidden border border-brand-green/30">
              {avatarPhoto ? (
                <Image source={{ uri: avatarPhoto }} className="w-full h-full" resizeMode="cover" />
              ) : (
                <Text className="font-headline-bold text-xl font-extrabold text-brand-green dark:text-emerald-400">
                  {(userName || 'K').charAt(0).toUpperCase()}
                </Text>
              )}
            </View>

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

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => router.push('/(app)/edit-profile')}
              className="p-2"
            >
              <Icon name="basil:edit-outline" color="#94A3B8" size={24} />
            </TouchableOpacity>
          </View>
        )}
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 95 }}
        showsVerticalScrollIndicator={false}
        className="px-4"
      >
        <Text className="text-xs font-semibold text-slate-400 dark:text-slate-500 mt-3 mb-2 px-1">
          {t('common.preferenceSection')}
        </Text>

        <View className="bg-white dark:bg-brand-cardDark">
          <View className="flex-row items-center justify-between py-3.5 dark:bg-brand-darkBg border-b border-slate-100 dark:border-slate-800">
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => router.push('/(app)/notifications')}
              className="flex-row items-center gap-3 ml-1 flex-1"
            >
              <Icon name="ph:bell-ringing" color={isDark ? '#FFFFFF' : '#161E33'} size={22} />
              <Text className="font-medium text-sm text-slate-900 dark:text-white">
                {t('common.notificationItem')}
              </Text>
            </TouchableOpacity>
            <CustomSwitch
              value={preferences.push_enabled}
              onValueChange={(val) => updatePreference('push_enabled', val)}
              activeColor="#FF9500"
            />
          </View>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setLanguageModalVisible(true)}
            className="flex-row items-center justify-between py-3.5 dark:bg-brand-darkBg border-b border-slate-100 dark:border-slate-800"
          >
            <View className="flex-row items-center gap-3 ml-1">
              <Icon name="fontisto:world-o" color={isDark ? '#FFFFFF' : '#161E33'} size={22} />
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

          <View className="flex-row items-center justify-between py-3.5 dark:bg-brand-darkBg">
            <View className="flex-row items-center gap-3 ml-1">
              <Icon name="ant-design:moon-outlined" color={isDark ? '#FFFFFF' : '#161E33'} size={22} />
              <Text className="font-medium text-sm text-slate-900 dark:text-white">
                {t('common.themeItem')}
              </Text>
            </View>
            <CustomSwitch
              value={userThemePreference === 'dark' || isDark}
              onValueChange={(val) => setTheme(val ? 'dark' : 'light')}
              activeColor="#FF9500"
            />
          </View>
        </View>

        <Text className="text-xs font-semibold text-slate-400 dark:text-slate-500 mt-6 mb-2 px-1">
          {t('common.security')}
        </Text>

        <View className="bg-white dark:bg-brand-cardDark">
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.push('/(app)/security')}
            className="flex-row items-center justify-between py-3.5 dark:bg-brand-darkBg border-b border-slate-100 dark:border-slate-800"
          >
            <View className="flex-row items-center gap-3 ml-1">
              <Icon name="basil:lock-outline" color={isDark ? '#FFFFFF' : '#161E33'} size={22} />
              <Text className="font-medium text-sm text-slate-900 dark:text-white">
                {t('common.changePassword')}
              </Text>
            </View>
            <Icon name="solar:alt-arrow-right-linear" color="#CBD5E1" size={16} />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.push('/(app)/two-factor')}
            className="flex-row items-center justify-between py-3.5 dark:bg-brand-darkBg border-b border-slate-100 dark:border-slate-800"
          >
            <View className="flex-row items-center gap-3 ml-1">
              <Icon name="dashicons:shield" color={isDark ? '#FFFFFF' : '#161E33'} size={22} />
              <Text className="font-medium text-sm text-slate-900 dark:text-white">
                {t('common.twoFactorAuthItem')}
              </Text>
            </View>
            <Icon name="solar:alt-arrow-right-linear" color="#CBD5E1" size={16} />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.push('/(app)/active-sessions')}
            className="flex-row items-center justify-between py-3.5 dark:bg-brand-darkBg border-b border-slate-100 dark:border-slate-800"
          >
            <View className="flex-row items-center gap-3 ml-1">
              <Icon name="fluent:phone-desktop-24-regular" color={isDark ? '#FFFFFF' : '#161E33'} size={22} />
              <Text className="font-medium text-sm text-slate-900 dark:text-white">
                {t('common.activeSessionsItem')}
              </Text>
            </View>
            <Icon name="solar:alt-arrow-right-linear" color="#CBD5E1" size={16} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => setLogoutModalVisible(true)}
          className="items-center justify-center py-8 mb-2"
        >
          <Text className="font-bold text-base text-red-500 dark:text-red-400">
            {t('common.logoutAction')}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal visible={languageModalVisible} transparent animationType="slide">
        <Pressable className="flex-1 justify-end bg-black/50" onPress={() => setLanguageModalVisible(false)}>
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
                  onPress={async () => {
                    i18n.changeLanguage(lang.code);
                    setLanguageModalVisible(false);
                    await updateProfile({ langue: lang.code });
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

      <Modal visible={logoutModalVisible} transparent animationType="fade">
        <Pressable className="flex-1 justify-center items-center bg-black/60 px-5" onPress={() => setLogoutModalVisible(false)}>
          <Pressable className="w-full max-w-sm rounded-3xl p-6 bg-white dark:bg-brand-cardDark border border-slate-100 dark:border-slate-800 shadow-2xl">
            <View className="wx-12 hx-12 rounded-full bg-red-100 dark:bg-red-950/40 items-center justify-center mb-4 self-center">
              <Icon name="solar:logout-3-bold" color="#EF4444" size={28} />
            </View>

            <Text className="font-montserrat-bold text-lg font-bold text-slate-900 dark:text-white text-center mb-2">
              {t('common.logoutConfirmTitle')}
            </Text>

            <Text className="text-xs text-slate-500 dark:text-slate-400 text-center leading-5 mb-6">
              {t('common.logoutConfirmMessage')}
            </Text>

            <View className="flex-row gap-3">
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setLogoutModalVisible(false)}
                className="flex-1 h-11 rounded-xl bg-slate-100 dark:bg-slate-800 items-center justify-center"
              >
                <Text className="font-bold text-xs text-slate-700 dark:text-slate-300">
                  {t('common.cancel')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleLogoutConfirm}
                className="flex-1 h-11 rounded-xl bg-red-500 items-center justify-center"
              >
                <Text className="font-bold text-xs text-white">
                  {t('common.logoutAction')}
                </Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      <TabBar activeTab="profile" />
    </View>
  );
}
