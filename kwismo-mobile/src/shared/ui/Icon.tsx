import React from 'react';
import { Platform } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { addCollection, Icon as IconifyWeb } from '@iconify/react';
import { getIconData, iconToSVG } from '@iconify/utils';
import { Ionicons } from '@expo/vector-icons';

import bitcoinIconsCollection from '@iconify/json/json/bitcoin-icons.json';
import solarCollection from '@iconify/json/json/solar.json';
import evaCollection from '@iconify/json/json/eva.json';
import mdiCollection from '@iconify/json/json/mdi.json';
import lucideCollection from '@iconify/json/json/lucide.json';
import heroiconsCollection from '@iconify/json/json/heroicons.json';
import phCollection from '@iconify/json/json/ph.json';
import biCollection from '@iconify/json/json/bi.json';
import tablerCollection from '@iconify/json/json/tabler.json';
import icCollection from '@iconify/json/json/ic.json';
import ggCollection from '@iconify/json/json/gg.json';
import f7Collection from '@iconify/json/json/f7.json';
import hugeiconsCollection from '@iconify/json/json/hugeicons.json';
import mageCollection from '@iconify/json/json/mage.json';
import basilCollection from '@iconify/json/json/basil.json';
import reiconCollection from '@iconify/json/json/reicon.json';
import famiconsCollection from '@iconify/json/json/famicons.json';

const collectionsMap: Record<string, any> = {
  'bitcoin-icons': bitcoinIconsCollection,
  solar: solarCollection,
  eva: evaCollection,
  mdi: mdiCollection,
  lucide: lucideCollection,
  heroicons: heroiconsCollection,
  ph: phCollection,
  bi: biCollection,
  tabler: tablerCollection,
  ic: icCollection,
  gg: ggCollection,
  f7: f7Collection,
  hugeicons: hugeiconsCollection,
  mage: mageCollection,
  basil: basilCollection,
  reicon: reiconCollection,
  famicons: famiconsCollection,
};

function getCollectionData(prefix: string) {
  return collectionsMap[prefix] || null;
}

if (Platform.OS === 'web') {
  Object.values(collectionsMap).forEach((col) => {
    try {
      addCollection(col as any);
    } catch (e) {}
  });
}



export interface IconProps {
  name: string;
  size?: number;
  color?: string;
  strokeWidth?: number;
  style?: any;
  className?: string;
}

// Ionicons fallback dictionary
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

function renderSvgIcon(prefix: string, iconName: string, size: number, color: string, style?: any) {
  const collection = getCollectionData(prefix);
  if (!collection) return null;


  try {
    const iconData = getIconData(collection, iconName);
    if (!iconData) return null;

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

  if (name && name.includes(':')) {
    const parts = name.split(':');
    const prefix = parts[0];
    const iconName = parts.slice(1).join(':');

    const svgResult = renderSvgIcon(prefix, iconName, size, color, style);
    if (svgResult) {
      return svgResult;
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
