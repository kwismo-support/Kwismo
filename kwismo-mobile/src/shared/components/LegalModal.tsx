import React, { useMemo } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Icon } from '@/shared/ui/Icon';
import { useAppTheme } from '@/shared/hooks/useAppTheme';
import { getPrivacyPolicy, getTermsOfService, LegalDocument } from '@/shared/lib/legalContent';

interface LegalModalProps {
  visible: boolean;
  title: string;
  type?: 'privacy' | 'terms';
  content?: string;
  onClose: () => void;
}

export const LegalModal: React.FC<LegalModalProps> = ({
  visible,
  title,
  type,
  content,
  onClose,
}) => {
  const insets = useSafeAreaInsets();
  const { i18n, t } = useTranslation();
  const { colors: themeColors } = useAppTheme();

  const isTerms = useMemo(() => {
    return (
      type === 'terms' ||
      title.toLowerCase().includes('term') ||
      title.toLowerCase().includes('condition')
    );
  }, [type, title]);

  const keyPrefix = isTerms ? 'legal.terms' : 'legal.privacy';

  const docTitle = t(`${keyPrefix}.title`);
  const docLastUpdated = t(`${keyPrefix}.lastUpdated`);
  const rawSections = t(`${keyPrefix}.sections`, { returnObjects: true });
  const sections: { id: string; title: string; content: string }[] = Array.isArray(rawSections)
    ? (rawSections as { id: string; title: string; content: string }[])
    : [];

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
          <View className="flex-1 mr-3">
            <Text
              className="font-headline-bold text-base font-bold text-slate-900 dark:text-white"
              numberOfLines={1}
            >
              {docTitle || title}
            </Text>
            {docLastUpdated ? (
              <Text className="text-3xs font-medium text-slate-400 dark:text-slate-400 mt-0.5">
                {t('common.lastUpdated') || 'Dernière mise à jour'} : {docLastUpdated}
              </Text>
            ) : null}
          </View>

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
          contentContainerStyle={{ padding: 18, paddingBottom: insets.bottom + 40 }}
          showsVerticalScrollIndicator={true}
        >
          {content ? (
            <Text className="font-regular text-xs leading-5 text-slate-700 dark:text-slate-300">
              {content}
            </Text>
          ) : sections.length > 0 ? (
            <View className="gap-4">
              {sections.map((sec, idx) => (
                <View key={sec.id || idx} className="bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
                  <Text className="font-headline-bold text-xs font-bold text-slate-900 dark:text-white mb-2">
                    {sec.title}
                  </Text>
                  <Text className="font-regular text-2xs leading-4.5 text-slate-600 dark:text-slate-300">
                    {sec.content}
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            <View className="py-5">
              <Text className="font-medium text-xs leading-5 text-slate-500 dark:text-slate-400">
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
