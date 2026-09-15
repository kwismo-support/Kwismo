import React, { useEffect, useRef } from 'react';
import { View, Animated, ViewStyle, Platform } from 'react-native';
import { useAppTheme } from '@/shared/hooks/useAppTheme';

export interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  className?: string;
  style?: ViewStyle;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 20,
  borderRadius = 8,
  className = '',
  style,
}) => {
  const { isDark } = useAppTheme();
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.8,
          duration: 750,
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 750,
          useNativeDriver: Platform.OS !== 'web',
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [opacity]);

  return (
    <Animated.View
      className={`bg-slate-200 dark:bg-slate-800 ${className}`}
      style={[
        {
          width: width as any,
          height,
          borderRadius,
          opacity,
        },
        style,
      ]}
    />
  );
};

export const SkeletonCircle: React.FC<{ size?: number; className?: string; style?: ViewStyle }> = ({
  size = 48,
  className = '',
  style,
}) => {
  return (
    <Skeleton
      width={size}
      height={size}
      borderRadius={size / 2}
      className={className}
      style={style}
    />
  );
};

export const SkeletonLine: React.FC<{
  width?: number | string;
  height?: number;
  className?: string;
  style?: ViewStyle;
}> = ({ width = '100%', height = 14, className = '', style }) => {
  return (
    <Skeleton
      width={width}
      height={height}
      borderRadius={4}
      className={className}
      style={style}
    />
  );
};

export const SkeletonCard: React.FC<{
  height?: number;
  className?: string;
  style?: ViewStyle;
  children?: React.ReactNode;
}> = ({ height = 120, className = '', style, children }) => {
  return (
    <View
      style={[{ minHeight: height }, style]}
      className={`w-full p-4 rounded-2xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-brand-cardDark justify-center ${className}`}
    >
      {children || (
        <View className="gap-2.5 w-full">
          <Skeleton width="40%" height={16} />
          <Skeleton width="80%" height={24} />
          <Skeleton width="60%" height={14} />
        </View>
      )}
    </View>
  );
};

interface SkeletonLoaderProps {
  loading?: boolean;
  fallback?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  style?: ViewStyle;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  loading = true,
  fallback,
  children,
  className = '',
  style,
}) => {
  if (loading && fallback) {
    return <View style={style} className={className}>{fallback}</View>;
  }
  return <View style={style} className={className}>{children}</View>;
};

export default Skeleton;
