import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useTranslation } from 'react-i18next';
import { Icon } from '@/shared/ui/Icon';
import { HeaderBar } from '@/shared/components/HeaderBar';
import { useAppTheme } from '@/shared/hooks/useAppTheme';
import { useActiveSessions } from '@/features/profile/hooks/useActiveSessions';
import { SessionsSkeleton } from '@/features/profile/components/ProfileSkeleton';

export default function ActiveSessionsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { isDark } = useAppTheme();
  const { sessions, loading, revokeSession, revokeAllOthers } = useActiveSessions();

  const [confirmModal, setConfirmModal] = useState<{
    visible: boolean;
    title: string;
    message: string;
    confirmText: string;
    onConfirm: () => void;
  }>({
    visible: false,
    title: '',
    message: '',
    confirmText: t('common.disconnect'),
    onConfirm: () => {},
  });

  const handleRevokeSession = (sessionId: string, deviceName: string) => {
    setConfirmModal({
      visible: true,
      title: t('security.sessionRevokeTitle'),
      message: t('security.sessionRevokeConfirm', { device: deviceName }),
      confirmText: t('common.disconnect'),
      onConfirm: () => revokeSession(sessionId, deviceName),
    });
  };

  const handleRevokeAllOthers = () => {
    setConfirmModal({
      visible: true,
      title: t('security.revokeAllTitle'),
      message: t('security.revokeAllConfirm'),
      confirmText: t('security.revokeAllAction'),
      onConfirm: () => revokeAllOthers(),
    });
  };

  const otherSessionsCount = sessions.filter((s) => !s.is_current).length;

  return (
    <View className="flex-1 bg-brand-green">
      <StatusBar style="light" />

      <HeaderBar
        title={t('common.activeSessionsItem')}
        showBack={true}
        onBack={() => router.back()}
      />

      <View className="flex-1 bg-white dark:bg-brand-darkBg rounded-t-[28px] overflow-hidden pt-5 px-5">
        <ScrollView
          contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
          showsVerticalScrollIndicator={false}
          className="gap-y-4"
        >
          {otherSessionsCount > 0 && (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleRevokeAllOthers}
              className="flex-row items-center justify-between p-4 rounded-2xl border border-red-200 dark:border-red-950 bg-red-50 dark:bg-red-950/20"
            >
              <View className="flex-row items-center flex-1 pr-2">
                <Icon name="solar:logout-3-bold" color="#EF4444" size={22} className="mr-3" />
                <Text className="font-montserrat-bold text-sm font-bold text-red-600 dark:text-red-400">
                  {t('security.revokeAllOtherCount', { count: otherSessionsCount })}
                </Text>
              </View>
              <Icon name="solar:alt-arrow-right-linear" color="#EF4444" size={18} />
            </TouchableOpacity>
          )}

          {loading ? (
            <SessionsSkeleton />
          ) : sessions.length === 0 ? (
            <View className="items-center justify-center py-12 px-4">
              <Icon name="solar:smartphone-line-duotone" size={48} color="#94A3B8" />
              <Text className="font-bold text-base text-slate-700 dark:text-slate-300 mt-4 text-center">
                {t('security.noSessionsTitle')}
              </Text>
              <Text className="text-xs text-slate-400 dark:text-slate-500 mt-1 text-center">
                {t('security.noSessionsDesc')}
              </Text>
            </View>
          ) : (
            <View className="gap-y-3 mt-2">
              {sessions.map((session) => (
                <View
                  key={session.id}
                  className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-brand-cardDark"
                >
                  <View className="flex-row items-center justify-between mb-2">
                    <View className="flex-row items-center flex-1 pr-2">
                      <View className="wx-10 hx-10 rounded-xl bg-white dark:bg-slate-800 items-center justify-center mr-3 border border-slate-200 dark:border-slate-700">
                        <Icon
                          name={
                            session.device_type === 'desktop'
                              ? 'solar:laptop-minimalistic-bold'
                              : 'solar:smartphone-bold'
                          }
                          color={session.is_current ? '#25B876' : isDark ? '#94A3B8' : '#64748B'}
                          size={22}
                        />
                      </View>
                      <View className="flex-1">
                        <View className="flex-row items-center gap-2">
                          <Text className="font-montserrat-bold text-sm font-bold text-slate-900 dark:text-white">
                            {session.device_name}
                          </Text>
                        </View>
                        <Text className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          {session.location} • {session.ip_address}
                        </Text>
                      </View>
                    </View>

                    {session.is_current ? (
                      <View className="px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800">
                        <Text className="text-2xs font-bold text-emerald-600 dark:text-emerald-400">
                          {t('security.currentDevice')}
                        </Text>
                      </View>
                    ) : (
                      <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => handleRevokeSession(session.id, session.device_name)}
                        className="px-3 py-1.5 rounded-xl bg-red-100 dark:bg-red-950/40 border border-red-200 dark:border-red-900"
                      >
                        <Text className="text-xs font-bold text-red-600 dark:text-red-400">
                          {t('common.disconnect')}
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>

                  <View className="flex-row items-center justify-between pt-2 border-t border-slate-200/60 dark:border-slate-800/60 mt-1">
                    <Text className="text-2xs text-slate-400 dark:text-slate-500">
                      {t('security.lastActive')}
                    </Text>
                    <Text className="text-2xs font-medium text-slate-600 dark:text-slate-400">
                      {session.last_active}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      </View>

      <Modal visible={confirmModal.visible} transparent animationType="fade">
        <Pressable
          className="flex-1 justify-center items-center bg-black/60 px-5"
          onPress={() => setConfirmModal((prev) => ({ ...prev, visible: false }))}
        >
          <Pressable
            className="w-full max-w-sm rounded-3xl p-6 bg-white dark:bg-brand-cardDark border border-slate-100 dark:border-slate-800 shadow-2xl"
            onPress={(e) => e.stopPropagation()}
          >
            <View className="wx-12 hx-12 rounded-full bg-red-100 dark:bg-red-950/40 items-center justify-center mb-4 self-center">
              <Icon name="solar:logout-3-bold" color="#EF4444" size={28} />
            </View>

            <Text className="font-montserrat-bold text-lg font-bold text-slate-900 dark:text-white text-center mb-2">
              {confirmModal.title}
            </Text>

            <Text className="text-xs text-slate-500 dark:text-slate-400 text-center leading-5 mb-6">
              {confirmModal.message}
            </Text>

            <View className="flex-row gap-3">
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setConfirmModal((prev) => ({ ...prev, visible: false }))}
                className="flex-1 h-11 rounded-xl bg-slate-100 dark:bg-slate-800 items-center justify-center"
              >
                <Text className="font-bold text-xs text-slate-700 dark:text-slate-300">
                  {t('common.cancel')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => {
                  setConfirmModal((prev) => ({ ...prev, visible: false }));
                  confirmModal.onConfirm();
                }}
                className="flex-1 h-11 rounded-xl bg-red-500 items-center justify-center"
              >
                <Text className="font-bold text-xs text-white">
                  {confirmModal.confirmText}
                </Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
