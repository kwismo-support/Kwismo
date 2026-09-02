import React from 'react';
import { ViewStyle } from 'react-native';
import { Skeleton } from '../ui/Skeleton';

interface SkeletonItemProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export const SkeletonItem: React.FC<SkeletonItemProps> = ({
  width = '100%',
  height = 20,
  borderRadius = 6,
  style,
}) => {
  return (
    <Skeleton
      width={width}
      height={height}
      borderRadius={borderRadius}
      style={style}
    />
  );
};

export default SkeletonItem;
