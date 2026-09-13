import React from 'react';
import { Platform } from 'react-native';
import { Icon as IconifyWeb } from '@iconify/react';
import { Ionicons } from '@expo/vector-icons';

export interface IconProps {
  name: string;
  size?: number;
  color?: string;
  strokeWidth?: number;
  style?: any;
}

const ionicNameMap: Record<string, keyof typeof Ionicons.glyphMap> = {
  'solar:arrow-right-linear': 'arrow-forward',
  'solar:arrow-left-linear': 'arrow-back',
  'solar:alt-arrow-right-linear': 'chevron-forward',
  'solar:alt-arrow-left-linear': 'chevron-back',
  'solar:check-circle-bold': 'checkmark-circle',
  'solar:danger-circle-bold': 'alert-circle',
  'solar:danger-triangle-bold': 'warning',
  'solar:info-circle-bold': 'information-circle',
  'solar:info-circle-linear': 'information-circle-outline',
  'solar:close-circle-bold': 'close-circle',
  'solar:close-circle-linear': 'close-circle-outline',
  'solar:letter-linear': 'mail-outline',
  'solar:eye-linear': 'eye-outline',
  'solar:eye-closed-linear': 'eye-off-outline',
  'solar:sun-bold': 'sunny',
  'solar:moon-bold': 'moon',
  'solar:camera-bold': 'camera',
  'solar:gallery-bold': 'image',
  'solar:lock-password-bold': 'lock-closed',
  'solar:lock-keyhole-minimalistic-bold': 'lock-closed',
  'solar:fingerprint-bold': 'finger-print',
  'solar:backspace-linear': 'backspace-outline',
  'solar:magnifer-linear': 'search-outline',
  'solar:magnifer-bug-linear': 'search',
  'solar:global-linear': 'globe-outline',
  'solar:bell-bing-bold': 'notifications',
  'solar:users-group-two-rounded-linear': 'people-outline',
  'solar:restart-bold': 'refresh',
  'solar:inbox-line-bold': 'archive-outline',
  'solar:shield-warning-bold': 'shield-checkmark',
  'solar:user-bold': 'person',
  'solar:user-linear': 'person-outline',
  'solar:home-bold': 'home',
  'solar:home-2-bold': 'home',
  'solar:history-bold': 'time-outline',
  'solar:settings-bold': 'settings-outline',
  'solar:share-bold': 'share-social',
  'solar:copy-bold': 'copy-outline',
  'solar:trash-bin-trash-bold': 'trash-outline',
  'solar:chat-round-dots-bold': 'chatbubbles-outline',
  'solar:phone-calling-bold': 'call-outline',
  'gg:spinner': 'sync',
};

export const Icon: React.FC<IconProps> = ({
  name,
  size = 24,
  color = '#000000',
  style,
}) => {
  if (Platform.OS === 'web') {
    return (
      <IconifyWeb
        icon={name}
        width={size}
        height={size}
        style={{ color, display: 'inline-block', verticalAlign: 'middle', ...style }}
      />
    );
  }

  const mappedName = ionicNameMap[name] || (name.includes(':') ? 'help-circle-outline' : (name as any));

  return (
    <Ionicons
      name={mappedName}
      size={size}
      color={color}
      style={style}
    />
  );
};

export default Icon;


