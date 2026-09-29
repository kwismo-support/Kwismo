import React, { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { Icon as IconifyWeb } from '@iconify/react';
import { iconToSVG } from '@iconify/utils';
import { Ionicons } from '@expo/vector-icons';
import { extractedIconsData } from './extractedIcons';

export interface IconProps {
  name: string;
  size?: number;
  color?: string;
  strokeWidth?: number;
  style?: any;
  className?: string;
}

const dynamicIconCache: Record<string, any> = {};
const pendingFetches: Record<string, Promise<any>> = {};

function fetchIconData(name: string): Promise<any> {
  if (extractedIconsData[name]) {
    return Promise.resolve(extractedIconsData[name]);
  }
  if (dynamicIconCache[name]) {
    return Promise.resolve(dynamicIconCache[name]);
  }
  if (name in pendingFetches) {
    return pendingFetches[name];
  }

  const parts = name.split(':');
  if (parts.length !== 2) return Promise.resolve(null);
  const [prefix, iconName] = parts;

  const url = `https://api.iconify.design/${prefix}.json?icons=${iconName}`;
  const promise = fetch(url)
    .then((res) => res.json())
    .then((data) => {
      if (data && data.icons && data.icons[iconName]) {
        const rawIcon = data.icons[iconName];
        const iconData = {
          width: rawIcon.width || data.width || 24,
          height: rawIcon.height || data.height || 24,
          ...rawIcon,
        };
        dynamicIconCache[name] = iconData;
        return iconData;
      }
      return null;
    })
    .catch(() => null);

  pendingFetches[name] = promise;
  return promise;
}

const ionicNameMap: Record<string, keyof typeof Ionicons.glyphMap> = {
  'eva:arrow-down-fill': 'caret-down',
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
  const [asyncIconData, setAsyncIconData] = useState<any>(
    extractedIconsData[name] || dynamicIconCache[name] || null
  );

  useEffect(() => {
    if (Platform.OS !== 'web' && name && name.includes(':')) {
      if (!extractedIconsData[name] && !dynamicIconCache[name]) {
        let isMounted = true;
        fetchIconData(name).then((data) => {
          if (isMounted && data) {
            setAsyncIconData(data);
          }
        });
        return () => {
          isMounted = false;
        };
      }
    }
  }, [name]);

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

  const iconData = extractedIconsData[name] || dynamicIconCache[name] || asyncIconData;
  if (iconData) {
    try {
      const renderData = iconToSVG(iconData, { height: size, width: size });
      const viewBox = renderData.attributes.viewBox || '0 0 24 24';
      let body = renderData.body || '';
      if (color) {
        body = body.replace(/currentColor/g, color);
      }
      const xml = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="${viewBox}" fill="${color}">${body}</svg>`;
      return <SvgXml xml={xml} width={size} height={size} style={style} />;
    } catch (err) {
      return null;
    }
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
