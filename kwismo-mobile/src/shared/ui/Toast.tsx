import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from './Icon';
import { useToastStore, ToastMessage, ToastType } from '../store/toastStore';
import { fonts } from '../../styles/tokens';

const TOAST_THEMES: Record<
  ToastType,
  { bg: string; border: string; iconColor: string; textColor: string }
> = {
  success: {
    bg: '#0F2E24',
    border: '#32B07F',
    iconColor: '#32B07F',
    textColor: '#FFFFFF',
  },
  error: {
    bg: '#33161A',
    border: '#EF4444',
    iconColor: '#EF4444',
    textColor: '#FFFFFF',
  },
  warning: {
    bg: '#332712',
    border: '#F59E0B',
    iconColor: '#F59E0B',
    textColor: '#FFFFFF',
  },
  info: {
    bg: '#14233D',
    border: '#3B82F6',
    iconColor: '#60A5FA',
    textColor: '#FFFFFF',
  },
};

const ToastItem: React.FC<{ toast: ToastMessage }> = ({ toast }) => {
  const dismiss = useToastStore((state) => state.dismiss);
  const translateY = useRef(new Animated.Value(-60)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const theme = TOAST_THEMES[toast.type] || TOAST_THEMES.info;

  useEffect(() => {
    // Slide in & Fade in
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto dismiss timer
    const timer = setTimeout(() => {
      handleDismiss();
    }, toast.duration || 3500);

    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -60,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      dismiss(toast.id);
    });
  };

  const renderIcon = () => {
    switch (toast.type) {
      case 'success':
        return <Icon name="solar:check-circle-bold" color={theme.iconColor} size={20} />;
      case 'error':
        return <Icon name="solar:danger-circle-bold" color={theme.iconColor} size={20} />;
      case 'warning':
        return <Icon name="solar:danger-triangle-bold" color={theme.iconColor} size={20} />;
      default:
        return <Icon name="solar:info-circle-bold" color={theme.iconColor} size={20} />;
    }
  };

  return (
    <Animated.View
      style={[
        styles.toastCard,
        {
          backgroundColor: theme.bg,
          borderColor: theme.border,
          transform: [{ translateY }],
          opacity,
        },
      ]}
    >
      <View style={styles.iconContainer}>{renderIcon()}</View>

      <View style={styles.textContainer}>
        {toast.title && <Text style={styles.titleText}>{toast.title}</Text>}
        <Text style={[styles.messageText, { color: theme.textColor }]}>
          {toast.message}
        </Text>
      </View>

      <TouchableOpacity
        activeOpacity={0.7}
        onPress={handleDismiss}
        style={styles.closeBtn}
      >
        <Icon name="solar:close-circle-bold" color="#94A3B8" size={16} />
      </TouchableOpacity>
    </Animated.View>
  );
};

export const ToastContainer: React.FC = () => {
  const toasts = useToastStore((state) => state.toasts);
  const insets = useSafeAreaInsets();

  if (toasts.length === 0) return null;

  return (
    <View
      pointerEvents="box-none"
      style={[
        styles.container,
        {
          top: Math.max(insets.top + 8, Platform.OS === 'web' ? 16 : 24),
        },
      ]}
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </View>
  );
};

export default ToastContainer;

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 9999,
    alignItems: 'center',
    gap: 8,
  },
  toastCard: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    maxWidth: 440,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
  },
  iconContainer: {
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  titleText: {
    fontFamily: fonts.bold,
    fontSize: 14,
    color: '#FFFFFF',
    marginBottom: 2,
  },
  messageText: {
    fontFamily: fonts.medium,
    fontSize: 13,
    lineHeight: 18,
  },
  closeBtn: {
    padding: 4,
    marginLeft: 8,
  },
});
