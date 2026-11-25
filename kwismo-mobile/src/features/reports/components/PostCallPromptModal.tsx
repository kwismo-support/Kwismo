import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Icon } from '@/shared/ui/Icon';

export interface PostCallPromptModalProps {
  visible: boolean;
  phoneNumber: string;
  onReport: (phone: string) => void;
  onDismiss: () => void;
}

export function PostCallPromptModal({
  visible,
  phoneNumber,
  onReport,
  onDismiss,
}: PostCallPromptModalProps) {
  const { t } = useTranslation();
  const slideAnim = useRef(new Animated.Value(300)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          damping: 20,
          stiffness: 180,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 300,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, fadeAnim, slideAnim]);

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.absoluteContainer,
        {
          opacity: fadeAnim,
        },
      ]}
      pointerEvents={visible ? 'auto' : 'none'}
    >
      <Pressable style={styles.backdrop} onPress={onDismiss} />

      <Animated.View
        style={[
          styles.sheetContainer,
          {
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <View className="rounded-t-3xl p-6 pb-9 bg-white dark:bg-brand-darkBg border-t border-slate-200 dark:border-slate-800 shadow-2xl">
          <View className="flex-row items-center justify-between mb-3">
            <View className="flex-row items-center">
              <View className="w-10 h-10 rounded-full bg-amber-100 dark:bg-slate-800 items-center justify-center mr-3">
                <Icon name="solar:phone-calling-rounded-bold" color="#F97316" size={22} />
              </View>
              <Text className="font-bold text-base text-slate-900 dark:text-white">
                {t('postCall.title')}
              </Text>
            </View>
            <TouchableOpacity onPress={onDismiss} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Icon name="solar:close-circle-bold" color="#94A3B8" size={24} />
            </TouchableOpacity>
          </View>

          <Text className="text-xs text-slate-500 dark:text-slate-400 mb-5 leading-5">
            {t('postCall.promptMessage', { phone: phoneNumber })}
          </Text>

          <View className="flex-row gap-3">
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={onDismiss}
              className="flex-1 h-12 rounded-xl border border-slate-200 dark:border-slate-700 items-center justify-center bg-slate-50 dark:bg-brand-cardDark"
            >
              <Text className="font-bold text-sm text-slate-700 dark:text-slate-300">
                {t('postCall.ignore')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.88}
              onPress={() => onReport(phoneNumber)}
              className="flex-1 h-12 rounded-xl bg-orange-500 items-center justify-center shadow-md shadow-orange-500/30"
            >
              <Text className="font-bold text-sm text-white">{t('postCall.reportCall')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  absoluteContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999999,
    elevation: 999999,
    justifyContent: 'flex-end',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
  },
  sheetContainer: {
    width: '100%',
    zIndex: 1000000,
  },
});

