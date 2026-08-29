import React from 'react';
import { StyleSheet, View, Image } from 'react-native';
import Svg, { Rect, Defs, RadialGradient as SvgRadialGradient, Stop } from 'react-native-svg';

interface OnboardingBackgroundProps {
  slideIndex: number;
  imageUri?: string;
}

const DEFAULT_SLIDE_IMAGES = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=1000&q=80',
];

export const OnboardingBackground: React.FC<OnboardingBackgroundProps> = ({
  slideIndex,
  imageUri,
}) => {
  const activeImage = imageUri || DEFAULT_SLIDE_IMAGES[slideIndex];

  return (
    <View style={styles.container}>
      {activeImage && (
        <Image
          source={{ uri: activeImage }}
          style={styles.backgroundImage}
          resizeMode="cover"
        />
      )}

      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <Svg width="100%" height="100%">
          <Defs>
            <SvgRadialGradient
              id="bottomGreenDomeGlow"
              cx="50%"
              cy="100%"
              rx="95%"
              ry="65%"
              fx="50%"
              fy="100%"
              gradientUnits="userSpaceOnUse"
            >
              <Stop offset="0%" stopColor="#24A173" stopOpacity="0.98" />
              <Stop offset="35%" stopColor="#197D5B" stopOpacity="0.9" />
              <Stop offset="65%" stopColor="#12523E" stopOpacity="0.75" />
              <Stop offset="85%" stopColor="#0B3026" stopOpacity="0.4" />
              <Stop offset="100%" stopColor="#0B2B25" stopOpacity="0" />
            </SvgRadialGradient>
          </Defs>
          <Rect width="100%" height="100%" fill="url(#bottomGreenDomeGlow)" />
        </Svg>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
    backgroundColor: '#0F2B24',
  },
  backgroundImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
});
