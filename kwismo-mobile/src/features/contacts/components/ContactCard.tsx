import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Icon } from '@/shared/ui/Icon';
import { ContactItem } from '../types/contacts.types';

interface ContactCardProps {
  item: ContactItem;
  index: number;
  isSelected?: boolean;
  showSelection?: boolean;
  onToggleSelect?: (item: ContactItem) => void;
  onPressContact?: (item: ContactItem) => void;
}

export function ContactCard({
  item,
  index,
  isSelected = false,
  showSelection = false,
  onToggleSelect,
  onPressContact,
}: ContactCardProps) {
  const { t } = useTranslation();

  const renderSubtitle = () => {
    switch (item.kwismoStatus) {
      case 'compromised':
      case 'compromis':
      case 'whatsapp_alert':
      case 'alert':
        return (
          <Text className="text-xs text-red-500 font-bold">
            ⚠️ {t('common.contactSubtitleCompromised')}
          </Text>
        );
      case 'frauduleux':
      case 'a_signaler':
      case 'suspect':
      case 'signalement':
        return (
          <Text className="text-xs text-amber-500 font-medium">
            ⚡ {t('common.contactSubtitleSignalement')}
          </Text>
        );
      case 'pending':
        return (
          <Text className="text-xs text-orange-400 font-medium">
            {t('common.contactSubtitlePending')}
          </Text>
        );
      case 'securise':
      case 'secured':
        return (
          <Text className="text-xs text-emerald-500 font-medium">
            ✓ {t('common.contactSubtitleSecured')}
          </Text>
        );
      default:
        if (item.hasKwismo) {
          return (
            <Text className="text-xs text-emerald-500 font-medium">
              ✓ {t('common.contactSubtitleSecured')}
            </Text>
          );
        }
        return (
          <Text className="text-xs text-slate-400 font-medium">
            {t('common.contactSubtitleNotOnKwismo')}
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

  const handlePress = () => {
    if (showSelection && onToggleSelect) {
      onToggleSelect(item);
    } else if (onPressContact) {
      onPressContact(item);
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={handlePress}
      className="flex-row items-center justify-between py-2.5 border-b border-slate-100 dark:border-slate-800/60"
    >
      <View className="flex-row items-center flex-1 mr-2">
        <View
          className={`w-11 h-11 rounded-full items-center justify-center mr-3.5 ${getAvatarBg()}`}
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

        {showSelection && (
          <View
            className={`w-5 h-5 rounded-full border items-center justify-center ${
              isSelected
                ? 'border-brand-green bg-brand-green'
                : 'border-slate-300 dark:border-slate-600'
            }`}
          >
            {isSelected && <Icon name="gravity-ui:check" color="#FFFFFF" size={14} />}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}
