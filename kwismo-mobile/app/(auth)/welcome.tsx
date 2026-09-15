/// <reference types="nativewind/types" />
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useTranslation } from 'react-i18next';
import { KwismoLogo } from '@/shared/components/KwismoLogo';
import { AuthGradientBackground } from '@/shared/components/AuthGradientBackground';

export default function AuthWelcomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  return (
    <AuthGradientBackground variant="mirror">
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
            className="w-full bg-brand-orange rounded-xl items-center justify-center shadow-md shadow-black/15 elevation-2"
            style={{ height: 52 }}
          >
            <Text className="font-semibold text-body-lg text-white">
              {t('common.login')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => router.push('/(auth)/register')}
            className="w-full bg-transparent rounded-xl border-[1.5px] border-[#1E293B] items-center justify-center"
            style={{ height: 52 }}
          >
            <Text className="font-semibold text-body-lg text-[#1E293B]">
              {t('common.register')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </AuthGradientBackground>
  );
}