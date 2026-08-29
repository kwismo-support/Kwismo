import React, { useEffect, useRef } from 'react';
import { Animated, TouchableOpacity, StyleSheet, Easing } from 'react-native';
import { colors } from '../../styles/tokens';

interface AnimatedIndicatorDotProps {
  isActive: boolean;
  onPress: () => void;
}

export const AnimatedIndicatorDot: React.FC<AnimatedIndicatorDotProps> = ({
  isActive,
  onPress,
}) => {
  const animValue = useRef(new Animated.Value(isActive ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(animValue, {
      toValue: isActive ? 1 : 0,
      duration: 280,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [isActive, animValue]);

  // Interpolate width from 6px (dot) to 28px (pill)
  const width = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [6, 28],
  });

  // Interpolate background color from translucent white to active orange #FF9900
  const backgroundColor = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(255, 255, 255, 0.65)', colors.orange],
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
