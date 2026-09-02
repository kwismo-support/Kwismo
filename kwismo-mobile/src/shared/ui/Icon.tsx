import React from 'react';
import { Platform } from 'react-native';
import { Icon as IconifyWeb } from '@iconify/react';
import { Iconify } from 'react-native-iconify';

export interface IconProps {
  name: string;
  size?: number;
  color?: string;
  strokeWidth?: number;
  style?: any;
}

export const Icon: React.FC<IconProps> = ({
  name,
  size = 24,
  color = '#000000',
  strokeWidth,
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

  return (
    <Iconify
      icon={name}
      size={size}
      color={color}
      strokeWidth={strokeWidth}
      style={style}
    />
  );
};

export default Icon;

