import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useTranslation } from 'react-i18next';
import { KwismoLogo } from '@/shared/components/KwismoLogo';
import { BrandGradientBackground } from '@/shared/components/BrandGradientBackground';
import { useAppTheme } from '@/shared/hooks/useAppTheme';

export default function AuthWelcomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { isDark } = useAppTheme();

  return (
    <BrandGradientBackground>
      <View className="flex-1 w-full h-full justify-between">
        <StatusBar style="light" />

        <View className="flex-1 w-full items-center justify-center z-10">
          <KwismoLogo size={200} variant="white" />
        </View>

        <View
          className="w-full px-6 gap-3.5 z-10"
          style={{ paddingBottom: Math.max(insets.bottom + 24, 36) }}
        >
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => router.push('/(auth)/login')}
            className="w-full h-13 bg-orange-500 rounded-xl items-center justify-center shadow-md"
          >
            <Text className="font-font-bold text-base font-bold text-white">
              {t('common.login')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => router.push('/(auth)/register')}
            className="w-full h-13 bg-transparent dark:bg-transparent rounded-xl border-2 border-brand-navy dark:border-white/80 items-center justify-center"
          >
            <Text className="font-font-bold text-base font-bold text-brand-navy dark:text-white">
              {t('common.register')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </BrandGradientBackground>
  );
}
