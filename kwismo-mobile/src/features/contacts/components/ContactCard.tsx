import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Icon } from '@/shared/ui/Icon';
import { ContactItem } from '../types/contacts.types';

interface ContactCardProps {
  item: ContactItem;
  index: number;
  isSelected: boolean;
  onToggleSelect: (item: ContactItem) => void;
}

export function ContactCard({
  item,
  index,
  isSelected,
  onToggleSelect,
}: ContactCardProps) {
  const { t } = useTranslation();

  const renderSubtitle = () => {
    if (!item.hasKwismo) {
      return (
        <Text className="text-xs text-slate-400 font-medium">
          {t('common.contactSubtitleNotOnKwismo')}
        </Text>
      );
    }

    switch (item.kwismoStatus) {
      case 'compromised':
        return (
          <Text className="text-xs text-red-500 font-medium">
            {t('common.contactSubtitleCompromised')}
          </Text>
        );
      case 'pending':
        return (
          <Text className="text-xs text-orange-400 font-medium">
            {t('common.contactSubtitlePending')}
          </Text>
        );
      case 'signalement':
        return (
          <Text className="text-xs text-emerald-500 font-medium">
            {t('common.contactSubtitleSignalement')}
          </Text>
        );
      case 'transfert':
        return (
          <Text className="text-xs text-emerald-500 font-medium">
            {t('common.contactSubtitleTransfert')}
          </Text>
        );
      case 'secured':
      default:
        return (
          <Text className="text-xs text-emerald-500 font-medium">
            {t('common.contactSubtitleSecured')}
          </Text>
        );
    }
  };

  const getAvatarBg = () => {
    if (!item.hasKwismo) return 'bg-slate-200 dark:bg-slate-700';
    const bgColors = ['bg-emerald-500', 'bg-orange-400', 'bg-blue-500', 'bg-brand-green'];
    return bgColors[index % bgColors.length];
  };

  const getAvatarContent = () => {
    if (!item.name || item.name.startsWith('+') || item.name.startsWith('#')) {
      return <Icon name="solar:user-bold" color="#FFFFFF" size={22} />;
    }
    const parts = item.name.trim().split(' ');
    let initials = parts[0][0];
    if (parts.length > 1) initials += parts[1][0];
    return <Text className="font-bold text-sm text-white">{initials.toUpperCase()}</Text>;
  };

  return (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={() => onToggleSelect(item)}
      className="flex-row items-center justify-between py-2.5 border-b border-slate-100 dark:border-slate-800/60"
    >
      <View className="flex-row items-center flex-1 mr-2">
        <View
          className={`wx-11 hx-11 rounded-full items-center justify-center mr-3.5 ${getAvatarBg()}`}
        >
          {getAvatarContent()}
        </View>

        <View className="flex-1">
          <Text
            numberOfLines={1}
            className="font-bold text-sm text-slate-900 dark:text-white"
          >
            {item.name}
          </Text>
          {renderSubtitle()}
        </View>
      </View>

      <View className="flex-row items-center gap-2">
        {item.hasKwismo && (
          <Icon name="solar:verified-check-bold" color="#25B876" size={18} />
        )}

        <View
          className={`wx-5 hx-5 rounded-full border items-center justify-center ${
            isSelected
              ? 'border-brand-green bg-brand-green'
              : 'border-slate-300 dark:border-slate-600'
          }`}
        >
          {isSelected && <Icon name="gravity-ui:check" color="#FFFFFF" size={14} />}
        </View>
      </View>
    </TouchableOpacity>
  );
}
