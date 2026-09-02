import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  TextStyle,
  Platform,
} from 'react-native';
import { Icon } from './Icon';
import { useAppTheme } from '../hooks/useAppTheme';
import { fonts, colors } from '../../styles/tokens';
import { scaleFont } from '../lib/responsive';

export interface InputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  error?: string;
  isPassword?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  hint?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  isPassword = false,
  leftIcon,
  rightIcon,
  containerStyle,
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
  const { isDark, colors: themeColors } = useAppTheme();
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

  let borderColor = themeColors.inputBorder;
  if (error) {
    borderColor = '#EF4444';
  }

  const hasValue = value && value.length > 0;
  const isDisplayingMaskedPassword = isSecured && hasValue;

  const textInputDynamicStyle: TextStyle = isDisplayingMaskedPassword
    ? {
        fontSize: scaleFont(18),
        letterSpacing: Platform.OS === 'ios' ? 4 : 3,
        fontWeight: 'bold',
      }
    : {
        fontSize: scaleFont(15),
        letterSpacing: 0,
        fontWeight: 'normal',
      };

  return (
    <View style={[styles.wrapper, containerStyle]}>
      {label ? (
        <Text style={[styles.label, { color: themeColors.textPrimary }]}>
          {label}
        </Text>
      ) : null}

      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: themeColors.cardBg,
            borderColor,
            borderWidth: 1,
          },
        ]}
      >
        {leftIcon ? <View style={styles.leftIconWrapper}>{leftIcon}</View> : null}

        <TextInput
          style={[
            styles.textInput,
            {
              color: themeColors.textPrimary,
              fontFamily: fonts.medium,
            },
            Platform.OS === 'web' ? ({ outline: 'none', outlineStyle: 'none' } as any) : {},
            textInputDynamicStyle,
            inputStyle,
          ]}
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
            style={styles.rightIconButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            {isPasswordVisible ? (
              <Icon name="solar:eye-closed-linear" color={themeColors.inputPlaceholder} size={22} />
            ) : (
              <Icon name="solar:eye-linear" color={themeColors.inputPlaceholder} size={22} />
            )}
          </TouchableOpacity>
        ) : rightIcon ? (
          <View style={styles.rightIconWrapper}>{rightIcon}</View>
        ) : null}
      </View>

      {error ? (
        <View style={styles.errorRow}>
          <Icon name="solar:danger-circle-bold" color="#EF4444" size={14} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : hint ? (
        <Text style={[styles.hintText, { color: themeColors.textSecondary }]}>
          {hint}
        </Text>
      ) : null}
    </View>
  );
};

export default Input;

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    marginBottom: 16,
  },
  label: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    marginBottom: 6,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 54,
    borderRadius: 14,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  leftIconWrapper: {
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textInput: {
    flex: 1,
    height: '100%',
    paddingVertical: 0,
    textAlignVertical: 'center',
  },
  rightIconButton: {
    padding: 6,
    marginLeft: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rightIconWrapper: {
    marginLeft: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    paddingHorizontal: 4,
    gap: 6,
  },
  errorText: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: '#EF4444',
    flex: 1,
    lineHeight: 16,
  },
  hintText: {
    fontFamily: fonts.regular,
    fontSize: 12,
    marginTop: 4,
    paddingHorizontal: 4,
  },
});
