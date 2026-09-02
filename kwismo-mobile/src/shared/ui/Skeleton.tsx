import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, ViewStyle } from 'react-native';
import { useAppTheme } from '../hooks/useAppTheme';

export interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 20,
  borderRadius = 8,
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
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 750,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        {
          width: width as any,
          height,
          borderRadius,
          backgroundColor: isDark ? '#1E293B' : '#E2E8F0',
          opacity,
        },
        style,
      ]}
    />
  );
};

export const SkeletonCircle: React.FC<{ size?: number; style?: ViewStyle }> = ({
  size = 48,
  style,
}) => {
  return (
    <Skeleton
      width={size}
      height={size}
      borderRadius={size / 2}
      style={style}
    />
  );
};

export const SkeletonCard: React.FC<{
  height?: number;
  style?: ViewStyle;
  children?: React.ReactNode;
}> = ({ height = 120, style, children }) => {
  const { isDark, colors: themeColors } = useAppTheme();

  return (
    <View
      style={[
        styles.cardContainer,
        {
          backgroundColor: themeColors.cardBg,
          borderColor: themeColors.inputBorder,
          minHeight: height,
        },
        style,
      ]}
    >
      {children || (
        <View style={{ gap: 10, width: '100%' }}>
          <Skeleton width="40%" height={16} />
          <Skeleton width="80%" height={24} />
          <Skeleton width="60%" height={14} />
        </View>
      )}
    </View>
  );
};

export default Skeleton;

const styles = StyleSheet.create({
  cardContainer: {
    width: '100%',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    justifyContent: 'center',
  },
});
