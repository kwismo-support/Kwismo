import React from 'react';
import { View, Text, Modal, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Icon } from '@/shared/ui/Icon';
import { useAppTheme } from '@/shared/hooks/useAppTheme';

interface PermissionModalProps {
  visible: boolean;
  title: string;
  description: string;
  iconName: string;
  iconColor?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const PermissionModal: React.FC<PermissionModalProps> = ({
  visible,
  title,
  description,
  iconName,
  iconColor = '#25B46E',
  confirmText,
  cancelText,
  onConfirm,
  onCancel,
}) => {
  const { t } = useTranslation();
  const { colors: themeColors } = useAppTheme();

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View className="flex-1 bg-black/65 justify-center items-center px-5">
        <View className="w-full max-w-xs rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-brand-cardDark p-6 items-center shadow-xl elevation-10">
          <View className="w-16 h-16 rounded-full bg-brand-green/15 justify-center items-center mb-4">
            <Icon name={iconName} size={36} color={iconColor} />
          </View>

          <Text className="text-base font-headline-bold font-extrabold text-center mb-2 text-slate-900 dark:text-white">
            {title}
          </Text>
          <Text className="text-xs font-regular text-center leading-4.5 mb-6 text-slate-500 dark:text-slate-400">
            {description}
          </Text>

          <View className="flex-row gap-3 w-full">
            <TouchableOpacity
              className="flex-1 h-11 rounded-xl border border-slate-200 dark:border-slate-700 justify-center items-center"
              onPress={onCancel}
              activeOpacity={0.7}
            >
              <Text className="text-sm font-headline-bold font-semibold text-slate-900 dark:text-white">
                {cancelText || t('common.cancel', 'Refuser')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-1 h-11 rounded-xl bg-brand-green justify-center items-center"
              onPress={onConfirm}
              activeOpacity={0.85}
            >
              <Text className="text-sm font-headline-bold font-bold text-white">
                {confirmText || t('common.allow', 'Autoriser')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default PermissionModal;
