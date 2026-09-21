import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Icon } from '@/shared/ui/Icon';
import { useAppTheme } from '@/shared/hooks/useAppTheme';

interface ErrorScreenProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export const ErrorScreen: React.FC<ErrorScreenProps> = ({
  title,
  message,
  onRetry,
}) => {
  const { t } = useTranslation();
  const { colors: themeColors } = useAppTheme();

  return (
    <View className="flex-1 items-center justify-center px-6 bg-white dark:bg-brand-darkBg">
      <View className="items-center p-7 rounded-3xl w-full">
        <View className="w-18 h-18 rounded-full bg-red-500/10 items-center justify-center mb-4">
          <Icon name="solar:danger-triangle-bold" size={42} color="#EF4444" />
        </View>

        <Text className="font-montserrat-bold text-lg text-center font-extrabold text-slate-900 dark:text-white">
          {title || t('errors.generalTitle')}
        </Text>

        <Text className="font-regular text-xs text-center mt-2 leading-5 text-slate-500 dark:text-slate-400">
          {message || t('errors.generalMessage')}
        </Text>

        {onRetry && (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onRetry}
            className="flex-row items-center h-12 px-6 rounded-xl mt-5 bg-brand-green"
          >
            <Icon name="solar:restart-bold" size={18} color="#FFFFFF" className="mr-1.5" />
            <Text className="font-montserrat-bold text-sm text-white font-bold">
              {t('common.retry')}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default ErrorScreen;
