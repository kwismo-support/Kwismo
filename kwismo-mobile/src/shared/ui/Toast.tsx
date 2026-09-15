import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Animated,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from '@/shared/ui/Icon';
import { useToastStore, ToastMessage, ToastType } from '@/shared/store/toastStore';
import { colors } from '@/styles/tokens';

const TOAST_THEMES: Record<
  ToastType,
  { bgClass: string; borderClass: string; iconColor: string }
> = {
  success: {
    bgClass: 'bg-emerald-950 dark:bg-emerald-950',
    borderClass: 'border-emerald-500',
    iconColor: colors.green,
  },
  error: {
    bgClass: 'bg-rose-950 dark:bg-rose-950',
    borderClass: 'border-red-500',
    iconColor: '#EF4444',
  },
  warning: {
    bgClass: 'bg-amber-950 dark:bg-amber-950',
    borderClass: 'border-amber-500',
    iconColor: colors.orange,
  },
  info: {
    bgClass: 'bg-slate-900 dark:bg-slate-900',
    borderClass: 'border-blue-500',
    iconColor: colors.blue,
  },
};

const ToastItem: React.FC<{ toast: ToastMessage }> = ({ toast }) => {
  const dismiss = useToastStore((state) => state.dismiss);
  const translateY = useRef(new Animated.Value(-60)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const theme = TOAST_THEMES[toast.type] || TOAST_THEMES.info;

  useEffect(() => {
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
      className={`flex-row items-center w-full max-w-md px-4 py-3 rounded-xl border-2 shadow-lg elevation-8 ${theme.bgClass} ${theme.borderClass}`}
      style={[
        {
          transform: [{ translateY }],
          opacity,
        },
      ]}
    >
      <View className="mr-3">{renderIcon()}</View>

      <View className="flex-1">
        {toast.title && <Text className="font-bold text-sm text-white mb-0.5">{toast.title}</Text>}
        <Text className="font-medium text-xs leading-4.5 text-white">
          {toast.message}
        </Text>
      </View>

      <TouchableOpacity
        activeOpacity={0.7}
        onPress={handleDismiss}
        className="p-1 ml-2"
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
      className="absolute left-4 right-4 z-50 items-center gap-2"
      style={[
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
