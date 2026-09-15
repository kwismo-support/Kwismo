import React from 'react';
import { ViewStyle } from 'react-native';
import { Skeleton } from '@/shared/ui/Skeleton';

interface SkeletonItemProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
  className?: string;
}

export const SkeletonItem: React.FC<SkeletonItemProps> = ({
  width = '100%',
  height = 20,
  borderRadius = 6,
  style,
  className = '',
}) => {
  return (
    <Skeleton
      width={width}
      height={height}
      borderRadius={borderRadius}
      style={style}
      className={className}
    />
  );
};

export default SkeletonItem;
