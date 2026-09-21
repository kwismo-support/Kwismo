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

const TOAST_THEMES: Record<
  ToastType,
  {
    badgeBgLight: string;
    badgeBgDark: string;
    iconName: string;
    iconColor: string;
  }
> = {
  success: {
    badgeBgLight: 'bg-emerald-100/80',
    badgeBgDark: 'dark:bg-emerald-950/60',
    iconName: 'solar:check-circle-bold',
    iconColor: '#25B876',
  },
  error: {
    badgeBgLight: 'bg-red-100/80',
    badgeBgDark: 'dark:bg-red-950/60',
    iconName: 'solar:close-circle-bold',
    iconColor: '#EF4444',
  },
  warning: {
    badgeBgLight: 'bg-amber-100/80',
    badgeBgDark: 'dark:bg-amber-950/60',
    iconName: 'solar:danger-triangle-bold',
    iconColor: '#F59E0B',
  },
  info: {
    badgeBgLight: 'bg-blue-100/80',
    badgeBgDark: 'dark:bg-blue-950/60',
    iconName: 'solar:info-circle-bold',
    iconColor: '#3B82F6',
  },
};

const ToastItem: React.FC<{ toast: ToastMessage }> = ({ toast }) => {
  const dismiss = useToastStore((state) => state.dismiss);
  const translateY = useRef(new Animated.Value(-80)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const theme = TOAST_THEMES[toast.type] || TOAST_THEMES.info;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        friction: 8,
        tension: 80,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 250,
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
        toValue: -80,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start(() => {
      dismiss(toast.id);
    });
  };

  return (
    <Animated.View
      style={[
        {
          transform: [{ translateY }],
          opacity,
        },
      ]}
      className="w-full max-w-sm px-4"
    >
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={handleDismiss}
        className="flex-row items-center p-4 rounded-3xl bg-white dark:bg-brand-cardDark border border-slate-100 dark:border-slate-800/80 shadow-2xl shadow-black/15 elevation-10 gap-3.5"
      >
        <View className={`w-12 h-12 rounded-full items-center justify-center ${theme.badgeBgLight} ${theme.badgeBgDark}`}>
          <Icon name={theme.iconName} color={theme.iconColor} size={28} />
        </View>

        <View className="flex-1 justify-center">
          {toast.title && (
            <Text className="font-extrabold text-sm text-slate-900 dark:text-white mb-0.5 font-title">
              {toast.title}
            </Text>
          )}
          <Text className="font-semibold text-xs leading-5 text-slate-800 dark:text-slate-100 font-body">
            {toast.message}
          </Text>
        </View>
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
      className="absolute left-0 right-0 z-50 items-center gap-2"
      style={[
        {
          top: Math.max(insets.top + 6, Platform.OS === 'web' ? 16 : 20),
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
