import React, { useState } from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  View,
} from 'react-native';
import { useAppTheme } from '@/shared/hooks/useAppTheme';
import { colors } from '@/styles/tokens';

export interface ButtonProps {
  title: string;
  onPress: () => Promise<boolean | void> | boolean | void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  minLoadingDuration?: number;
  className?: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  minLoadingDuration = 0,
  className = '',
  style,
  textStyle,
  leftIcon,
  rightIcon,
}) => {
  const { colors: themeColors } = useAppTheme();
  const [internalLoading, setInternalLoading] = useState(false);

  const isLoading = loading || internalLoading;
  const isDisabled = disabled || isLoading;

  const handlePress = async () => {
    if (isDisabled) return;

    const startTime = Date.now();
    setInternalLoading(true);

    try {
      const result = await Promise.resolve(onPress());

      if (result === false) {
        setInternalLoading(false);
        return;
      }

      const elapsed = Date.now() - startTime;
      if (elapsed < minLoadingDuration) {
        await new Promise((resolve) =>
          setTimeout(resolve, minLoadingDuration - elapsed)
        );
      }
    } catch (err) {
      console.error('Button press error:', err);
    } finally {
      setInternalLoading(false);
    }
  };

  const getVariantContainerClasses = () => {
    switch (variant) {
      case 'primary':
        return 'bg-brand-orange border-0';
      case 'secondary':
        return 'bg-white dark:bg-brand-darkBg border-2 border-brand-navy dark:border-white/70';
      case 'outline':
        return 'bg-transparent border-2 border-brand-green';
      case 'danger':
        return 'bg-red-600 border-0';
      default:
        return 'bg-brand-orange border-0';
    }
  };

  const getVariantTextClasses = () => {
    switch (variant) {
      case 'primary':
      case 'danger':
        return 'text-white';
      case 'secondary':
        return 'text-brand-navy dark:text-white';
      case 'outline':
        return 'text-brand-green';
      default:
        return 'text-white';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'hx-10 px-4 rounded-xl';
      case 'lg':
        return 'hx-14 px-7 rounded-2xl';
      case 'md':
      default:
        return 'hx-13 px-6 rounded-xl';
    }
  };

  const getTextSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'text-sm';
      case 'lg':
        return 'text-lg';
      case 'md':
      default:
        return 'text-base';
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={handlePress}
      disabled={isDisabled}
      style={style}
      className={`w-full items-center justify-center shadow-sm elevation-2 ${getVariantContainerClasses()} ${getSizeClasses()} ${
        isDisabled ? 'opacity-60' : ''
      } ${className}`}
    >
      {isLoading ? (
        <View className="flex-row items-center justify-center">
          <ActivityIndicator
            size="small"
            color={variant === 'secondary' ? themeColors.textPrimary : colors.white}
          />
        </View>
      ) : (
        <View className="flex-row items-center justify-center">
          {leftIcon ? <View className="mr-2">{leftIcon}</View> : null}
          <Text
            style={textStyle}
            className={`font-semibold text-center ${getVariantTextClasses()} ${getTextSizeClasses()}`}
          >
            {title}
          </Text>
          {rightIcon ? <View className="ml-2">{rightIcon}</View> : null}
        </View>
      )}
    </TouchableOpacity>
  );
};

export default Button;
