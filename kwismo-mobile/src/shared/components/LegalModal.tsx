import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from '@/shared/ui/Icon';
import { useAppTheme } from '@/shared/hooks/useAppTheme';

interface LegalModalProps {
  visible: boolean;
  title: string;
  content?: string;
  onClose: () => void;
}

export const LegalModal: React.FC<LegalModalProps> = ({
  visible,
  title,
  content,
  onClose,
}) => {
  const insets = useSafeAreaInsets();
  const { colors: themeColors } = useAppTheme();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView
        className="flex-1 bg-white dark:bg-brand-darkBg"
        style={{ paddingTop: insets.top }}
      >
        <View className="flex-row items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-700/60 bg-white dark:bg-brand-cardDark">
          <Text
            className="font-headline-bold text-lg font-bold text-slate-900 dark:text-white flex-1 mr-3"
            numberOfLines={1}
          >
            {title}
          </Text>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={onClose}
            className="p-1"
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Icon
              name="solar:close-circle-bold"
              size={26}
              color={themeColors.inputPlaceholder}
            />
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 32 }}
          showsVerticalScrollIndicator={false}
        >
          {content ? (
            <Text className="font-regular text-sm leading-6 text-slate-900 dark:text-white">
              {content}
            </Text>
          ) : (
            <View className="py-5">
              <Text className="font-medium text-sm leading-6 text-slate-500 dark:text-slate-400">
                {title}
              </Text>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

export default LegalModal;
