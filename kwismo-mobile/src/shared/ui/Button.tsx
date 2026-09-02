import React, { useState } from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
  View,
} from 'react-native';
import { useAppTheme } from '../hooks/useAppTheme';
import { colors, fonts } from '../../styles/tokens';
import { scaleFont } from '../lib/responsive';

export interface ButtonProps {
  title: string;
  onPress: () => Promise<boolean | void> | boolean | void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  minLoadingDuration?: number;
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
  minLoadingDuration = 1000,
  style,
  textStyle,
  leftIcon,
  rightIcon,
}) => {
  const { isDark, colors: themeColors } = useAppTheme();
  const [internalLoading, setInternalLoading] = useState(false);

  const isLoading = loading || internalLoading;
  const isDisabled = disabled || isLoading;

  const handlePress = async () => {
    if (isDisabled) return;

    const startTime = Date.now();
    setInternalLoading(true);

    try {
      // Execute press handler
      const result = await Promise.resolve(onPress());

      // If handler explicitly returned false (e.g. validation failed), stop loading immediately
      if (result === false) {
        setInternalLoading(false);
        return;
      }

      // If successful, guarantee minimum animation duration (min 1 second)
      const elapsed = Date.now() - startTime;
      if (elapsed < minLoadingDuration) {
        await new Promise((resolve) =>
          setTimeout(resolve, minLoadingDuration - elapsed)
        );
      }
    } catch (err) {
      // If error occurred, stop loading immediately
      console.error('Button press error:', err);
    } finally {
      setInternalLoading(false);
    }
  };

  // Determine button container styles based on variant
  const getVariantContainerStyle = (): ViewStyle => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: colors.orange,
          borderWidth: 0,
        };
      case 'secondary':
        return {
          backgroundColor: 'transparent',
          borderWidth: 1.5,
          borderColor: isDark ? themeColors.inputBorder : '#3B4E7A',
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          borderWidth: 1.5,
          borderColor: colors.green,
        };
      case 'danger':
        return {
          backgroundColor: '#EF4444',
          borderWidth: 0,
        };
      default:
        return {
          backgroundColor: colors.orange,
        };
    }
  };

  // Determine text styles based on variant
  const getVariantTextStyle = (): TextStyle => {
    switch (variant) {
      case 'primary':
      case 'danger':
        return {
          color: colors.white,
        };
      case 'secondary':
        return {
          color: isDark ? themeColors.textPrimary : '#3B4E7A',
        };
      case 'outline':
        return {
          color: colors.green,
        };
      default:
        return {
          color: colors.white,
        };
    }
  };

  // Height and padding based on size
  const getSizeStyle = (): ViewStyle => {
    switch (size) {
      case 'sm':
        return { height: 42, paddingHorizontal: 16, borderRadius: 21 };
      case 'lg':
        return { height: 56, paddingHorizontal: 28, borderRadius: 28 };
      case 'md':
      default:
        return { height: 52, paddingHorizontal: 24, borderRadius: 26 };
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={handlePress}
      disabled={isDisabled}
      style={[
        styles.baseButton,
        getVariantContainerStyle(),
        getSizeStyle(),
        isDisabled && styles.disabledButton,
        style,
      ]}
    >
      {isLoading ? (
        <View style={styles.loadingRow}>
          <ActivityIndicator
            size="small"
            color={variant === 'secondary' ? themeColors.textPrimary : colors.white}
          />
        </View>
      ) : (
        <View style={styles.contentRow}>
          {leftIcon ? <View style={styles.iconLeft}>{leftIcon}</View> : null}
          <Text
            style={[
              styles.baseText,
              getVariantTextStyle(),
              { fontSize: scaleFont(size === 'sm' ? 14 : size === 'lg' ? 17 : 16) },
              textStyle,
            ]}
          >
            {title}
          </Text>
          {rightIcon ? <View style={styles.iconRight}>{rightIcon}</View> : null}
        </View>
      )}
    </TouchableOpacity>
  );
};

export default Button;

const styles = StyleSheet.create({
  baseButton: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  baseText: {
    fontFamily: fonts.medium,
    fontWeight: '600',
    textAlign: 'center',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },
  disabledButton: {
    opacity: 0.65,
  },
});
