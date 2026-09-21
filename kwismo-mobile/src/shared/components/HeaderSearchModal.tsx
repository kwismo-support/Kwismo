import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
  Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from '@/shared/ui/Icon';
import { useAppTheme } from '@/shared/hooks/useAppTheme';

interface HeaderSearchModalProps {
  visible: boolean;
  onClose: () => void;
}

interface SearchItem {
  id: string;
  category: 'feature' | 'sim' | 'contact';
  title: string;
  subtitle: string;
  icon: string;
  route: string;
}

export const HeaderSearchModal: React.FC<HeaderSearchModalProps> = ({
  visible,
  onClose,
}) => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { colors: themeColors } = useAppTheme();
  const [query, setQuery] = useState('');

  const searchIndex: SearchItem[] = useMemo(
    () => [
      {
        id: 'f-1',
        category: 'feature',
        title: t('common.searchTransferTitle'),
        subtitle: t('common.searchTransferSub'),
        icon: 'solar:card-send-bold',
        route: '/(app)/transfer',
      },
      {
        id: 'f-2',
        category: 'feature',
        title: t('common.searchReportTitle'),
        subtitle: t('common.searchReportSub'),
        icon: 'solar:danger-triangle-bold',
        route: '/(app)/report',
      },
      {
        id: 'f-3',
        category: 'feature',
        title: t('common.searchWhatsappTitle'),
        subtitle: t('common.searchWhatsappSub'),
        icon: 'solar:chat-round-dots-bold',
        route: '/(app)/alert-whatsapp',
      },
      {
        id: 'f-4',
        category: 'feature',
        title: t('common.searchContactsTitle'),
        subtitle: t('common.searchContactsSub'),
        icon: 'solar:users-group-two-rounded-bold',
        route: '/(app)/contacts',
      },
      {
        id: 'f-5',
        category: 'feature',
        title: t('common.searchSimTitle'),
        subtitle: t('common.searchSimSub'),
        icon: 'solar:sim-cards-bold',
        route: '/(app)/management',
      },
      {
        id: 'f-6',
        category: 'feature',
        title: t('common.searchSecurityTitle'),
        subtitle: t('common.searchSecuritySub'),
        icon: 'solar:shield-keyhole-bold',
        route: '/(app)/two-factor',
      },
      {
        id: 's-1',
        category: 'sim',
        title: `+237 6 98 44 43 88 (${t('common.verifiedNumber')})`,
        subtitle: t('common.verifiedNumber'),
        icon: 'solar:phone-bold',
        route: '/(app)/management',
      },
      {
        id: 's-2',
        category: 'sim',
        title: `+237 6 77 12 34 56 (${t('common.statusPending')})`,
        subtitle: t('common.statusPending'),
        icon: 'solar:phone-bold',
        route: '/(app)/management',
      },
    ],
    [t]
  );

  const filteredResults = useMemo(() => {
    if (!query.trim()) return searchIndex.slice(0, 5);
    const q = query.toLowerCase().trim();
    return searchIndex.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.subtitle.toLowerCase().includes(q)
    );
  }, [query, searchIndex]);

  const handleSelectItem = (route: string) => {
    onClose();
    setQuery('');
    router.push(route as any);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable className="flex-1 bg-slate-900/65" onPress={onClose}>
        <Pressable
          onPress={(e) => e.stopPropagation()}
          className="px-4 pb-4"
          style={{ paddingTop: Math.max(insets.top + 8, 16) }}
        >
          <View className="flex-row items-center gap-2.5">
            <View className="flex-1 h-12 rounded-full bg-white dark:bg-brand-cardDark flex-row items-center shadow-lg elevation-6 px-3.5">
              <Icon
                name="solar:magnifer-linear"
                size={20}
                color="#25B46E"
                className="mr-2.5"
              />
              <TextInput
                autoFocus
                value={query}
                onChangeText={setQuery}
                placeholder={t('common.searchPlaceholder')}
                placeholderTextColor={themeColors.inputPlaceholder}
                className="flex-1 h-12 font-medium text-sm text-slate-900 dark:text-white py-0"
              />
              {query.length > 0 && (
                <TouchableOpacity onPress={() => setQuery('')} className="p-2">
                  <Icon name="solar:close-circle-bold" size={18} color={themeColors.inputPlaceholder} />
                </TouchableOpacity>
              )}
            </View>

            <TouchableOpacity onPress={onClose} className="px-2.5 py-2">
              <Text className="font-caption text-sm text-white">{t('common.cancel')}</Text>
            </TouchableOpacity>
          </View>

          <View className="bg-white dark:bg-brand-cardDark rounded-2xl mt-3 py-3 px-4 shadow-xl elevation-8">
            <View className="py-2 border-b border-slate-100 dark:border-slate-700/60 mb-1.5">
              <Text className="font-headline-bold text-2xs text-slate-400 dark:text-slate-400 uppercase tracking-widest">
                {query.trim()
                  ? `${t('common.searchResults')} (${filteredResults.length})`
                  : t('common.quickSuggestions')}
              </Text>
            </View>

            <ScrollView
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              className="max-h-90"
            >
              {filteredResults.length === 0 ? (
                <View className="py-8 items-center justify-center">
                  <Icon name="solar:magnifer-bug-linear" size={36} color="#CBD5E1" />
                  <Text className="font-medium text-xs text-slate-400 mt-2 text-center">
                    {t('common.noResultsFound')}
                  </Text>
                </View>
              ) : (
                filteredResults.map((item, index) => (
                  <TouchableOpacity
                    key={item.id}
                    activeOpacity={0.7}
                    onPress={() => handleSelectItem(item.route)}
                    className={`flex-row items-center py-3 ${
                      index < filteredResults.length - 1 ? 'border-b border-slate-100 dark:border-slate-700/40' : ''
                    }`}
                  >
                    <View className="w-9 h-9 rounded-full bg-brand-green/10 items-center justify-center mr-3">
                      <Icon name={item.icon} size={20} color="#25B46E" />
                    </View>
                    <View className="flex-1">
                      <Text className="font-headline-bold text-sm text-slate-900 dark:text-white font-bold">
                        {item.title}
                      </Text>
                      <Text className="font-regular text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {item.subtitle}
                      </Text>
                    </View>
                    <Icon name="solar:alt-arrow-right-linear" size={16} color={themeColors.inputPlaceholder} />
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default HeaderSearchModal;
