import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
  Platform,
} from 'react-native';
import { Icon } from '@/shared/ui/Icon';
import { useAppTheme } from '@/shared/hooks/useAppTheme';
import { colors } from '@/styles/tokens';

export interface InputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  error?: string;
  isPassword?: boolean;
  leftIcon?: React.ReactNode;
  iconLeft?: string;
  rightIcon?: React.ReactNode;
  containerStyle?: ViewStyle;
  className?: string;
  inputStyle?: TextStyle;
  hint?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  isPassword = false,
  leftIcon,
  iconLeft,
  rightIcon,
  containerStyle,
  className = '',
  inputStyle,
  hint,
  placeholder,
  value,
  onChangeText,
  onFocus,
  onBlur,
  secureTextEntry,
  ...rest
}) => {
  const { colors: themeColors } = useAppTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const isSecured = isPassword ? !isPasswordVisible : secureTextEntry;

  const handleFocus = (e: any) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  let activeIconColor = themeColors.inputPlaceholder;
  if (error) {
    activeIconColor = '#EF4444';
  } else if (isFocused) {
    activeIconColor = colors.green;
  }

  const hasValue = value && value.length > 0;
  const isDisplayingMaskedPassword = isSecured && hasValue;

  const textInputDynamicStyle: TextStyle = isDisplayingMaskedPassword
    ? {
        fontSize: 18,
        letterSpacing: Platform.OS === 'ios' ? 4 : 3,
        fontWeight: 'bold',
      }
    : {
        fontSize: 14,
        lineHeight: 20,
        letterSpacing: 0,
      };

  const renderedLeftIcon = iconLeft ? (
    <Icon name={iconLeft} size={20} color={activeIconColor} className="mr-2.5" />
  ) : React.isValidElement(leftIcon) ? (
    React.cloneElement(leftIcon as React.ReactElement<any>, {
      color: activeIconColor,
    })
  ) : (
    leftIcon
  );

  return (
    <View style={containerStyle} className={`w-full mb-4 ${className}`}>
      {label ? (
        <Text className="font-caption text-sm text-slate-800 dark:text-slate-200 mb-1.5">
          {label}
        </Text>
      ) : null}

      <View
        className={`flex-row items-center h-13 rounded-xl px-4 bg-white dark:bg-brand-cardDark border ${
          error
            ? 'border-red-500 border-2'
            : isFocused
            ? 'border-brand-green border-2'
            : 'border-slate-200 dark:border-slate-700'
        }`}
      >
        {renderedLeftIcon ? <View className="mr-3 items-center justify-center">{renderedLeftIcon}</View> : null}

        <TextInput
          style={[
            Platform.OS === 'web' ? ({ outline: 'none', outlineStyle: 'none' } as any) : {},
            textInputDynamicStyle,
            inputStyle,
          ]}
          className="flex-1 h-full font-medium text-slate-900 dark:text-white bg-transparent py-0"
          selectionColor={colors.green}
          cursorColor={colors.green}
          placeholder={placeholder}
          placeholderTextColor={themeColors.inputPlaceholder}
          value={value}
          onChangeText={onChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          secureTextEntry={isSecured}
          autoCapitalize={isPassword ? 'none' : rest.autoCapitalize}
          autoCorrect={!isPassword}
          {...rest}
        />

        {isPassword ? (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
            className="p-1.5 ml-2 items-center justify-center"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            {isPasswordVisible ? (
              <Icon name="solar:eye-closed-linear" color={themeColors.inputPlaceholder} size={22} />
            ) : (
              <Icon name="solar:eye-linear" color={themeColors.inputPlaceholder} size={22} />
            )}
          </TouchableOpacity>
        ) : rightIcon ? (
          <View className="ml-2 items-center justify-center">{rightIcon}</View>
        ) : null}
      </View>

      {error ? (
        <View className="flex-row items-center mt-1.5 px-1 gap-1.5">
          <Icon name="solar:danger-circle-bold" color="#EF4444" size={14} />
          <Text className="font-medium text-xs text-red-500 flex-1 leading-4">{error}</Text>
        </View>
      ) : hint ? (
        <Text className="font-regular text-xs text-slate-500 dark:text-slate-400 mt-1 px-1">
          {hint}
        </Text>
      ) : null}
    </View>
  );
};

export default Input;
