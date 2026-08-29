import React, { useEffect, useRef } from 'react';
import { Animated, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../../styles/tokens';

interface AnimatedIndicatorDotProps {
  index: number;
  scrollX: Animated.Value;
  screenWidth: number;
  isActive: boolean;
  onPress: () => void;
}

export const AnimatedIndicatorDot: React.FC<AnimatedIndicatorDotProps> = ({
  index,
  scrollX,
  screenWidth,
  isActive,
  onPress,
}) => {
  // Fallback animated value for programmatic click scrolling
  const fallbackAnim = useRef(new Animated.Value(isActive ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(fallbackAnim, {
      toValue: isActive ? 1 : 0,
      duration: 250,
      useNativeDriver: false,
    }).start();
  }, [isActive, fallbackAnim]);

  // Continuous interpolation during touch drag & scroll
  const inputRange = [
    (index - 1) * screenWidth,
    index * screenWidth,
    (index + 1) * screenWidth,
  ];

  const width = scrollX.interpolate({
    inputRange,
    outputRange: [6, 28, 6],
    extrapolate: 'clamp',
  });

  const backgroundColor = scrollX.interpolate({
    inputRange,
    outputRange: ['rgba(255, 255, 255, 0.65)', colors.orange, 'rgba(255, 255, 255, 0.65)'],
    extrapolate: 'clamp',
  });

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      hitSlop={{ top: 16, bottom: 16, left: 10, right: 10 }}
      style={styles.touchArea}
    >
      <Animated.View
        style={[
          styles.indicatorBase,
          {
            width,
            backgroundColor,
          },
        ]}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  touchArea: {
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  indicatorBase: {
    height: 6,
    borderRadius: 3,
  },
});
