import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Icon } from '../ui/Icon';
import { useAppTheme } from '../hooks/useAppTheme';
import { colors } from '../../styles/tokens';

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
  const { colors: themeColors } = useAppTheme();

  const handleBack = () => {
    if (onGoBack) onGoBack();
    else router.back();
  };

  return (
    <View
      className="flex-1 items-center justify-center px-6"
      style={{ backgroundColor: themeColors.background }}
    >
      <View className="items-center p-7 rounded-3xl w-full">
        <View className="w-18 h-18 rounded-full bg-amber-500/10 items-center justify-center mb-4">
          <Icon name="solar:lock-keyhole-minimalistic-bold" size={42} color={colors.orange} />
        </View>

        <Text
          className="font-montserrat-bold text-lg text-center font-bold"
          style={{ color: themeColors.textPrimary }}
        >
          {title || t('errors.forbiddenTitle')}
        </Text>

        <Text
          className="font-regular text-sm text-center mt-2 leading-5"
          style={{ color: themeColors.textSecondary }}
        >
          {message || t('errors.forbiddenMessage')}
        </Text>

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handleBack}
          className="flex-row items-center h-11 px-6 rounded-xl mt-5 bg-brand-green"
        >
          <Icon name="solar:arrow-left-linear" size={18} color={colors.white} style={{ marginRight: 6 }} />
          <Text className="font-montserrat-bold text-sm text-white font-bold">{t('common.goBack')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

