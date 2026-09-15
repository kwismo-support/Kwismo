import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Icon } from '@/shared/ui/Icon';

interface ForbiddenScreenProps {
  title?: string;
  message?: string;
  onGoBack?: () => void;
}

export const ForbiddenScreen: React.FC<ForbiddenScreenProps> = ({
  title,
  message,
  onGoBack,
}) => {
  const router = useRouter();
  const { t } = useTranslation();

  const handleBack = () => {
    if (onGoBack) onGoBack();
    else router.back();
  };

  return (
    <View className="flex-1 items-center justify-center px-6 bg-white dark:bg-brand-darkBg">
      <View className="items-center p-7 rounded-3xl w-full">
        <View className="w-18 h-18 rounded-full bg-amber-500/10 items-center justify-center mb-4">
          <Icon name="solar:lock-keyhole-minimalistic-bold" size={42} color="#FF9900" />
        </View>

        <Text className="font-montserrat-bold text-lg text-center font-bold text-slate-900 dark:text-white">
          {title || t('errors.forbiddenTitle')}
        </Text>

        <Text className="font-regular text-sm text-center mt-2 leading-5 text-slate-500 dark:text-slate-400">
          {message || t('errors.forbiddenMessage')}
        </Text>

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handleBack}
          className="flex-row items-center h-11 px-6 rounded-xl mt-5 bg-brand-green"
        >
          <Icon name="solar:arrow-left-linear" size={18} color="#FFFFFF" className="mr-1.5" />
          <Text className="font-montserrat-bold text-sm text-white font-bold">{t('common.goBack')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ForbiddenScreen;
