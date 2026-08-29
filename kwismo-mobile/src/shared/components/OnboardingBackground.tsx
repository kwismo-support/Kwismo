import React from 'react';
import { StyleSheet, View, Image } from 'react-native';
import Svg, { Path, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';

interface OnboardingBackgroundProps {
  slideIndex: number; // 0, 1, or 2
  imageUri?: string;
}

// High quality background images matching the 3 onboarding mockups
const DEFAULT_SLIDE_IMAGES = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1000&q=80', // Woman with sunglasses outdoors
  'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1000&q=80', // Hands holding smartphone
  'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=1000&q=80', // Surprised person on phone call
];

export const OnboardingBackground: React.FC<OnboardingBackgroundProps> = ({
  slideIndex,
  imageUri,
}) => {
  const activeImage = imageUri || DEFAULT_SLIDE_IMAGES[slideIndex];

  return (
    <View style={styles.container}>
      {/* 1. Full Background Photo */}
      {activeImage && (
        <Image
          source={{ uri: activeImage }}
          style={styles.backgroundImage}
          resizeMode="cover"
        />
      )}

      {/* 
        2. Perfectly Rounded & Lowered Semi-Circle Dome Arc Gradient Overlay:
        - Positioned in the lower 52% of the screen
        - Elliptical Arc A 200,160 producing a smooth, rounded semi-circle
        - Top of dome: Transparent -> Teal/Blue dark backdrop for text -> Vibrant green at bottom
      */}
      <View style={styles.overlayWrapper} pointerEvents="none">
        <Svg
          width="100%"
          height="100%"
          viewBox="0 0 400 500"
          preserveAspectRatio="none"
        >
          <Defs>
            <SvgLinearGradient id="semiCircleDomeGrad" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor="#0B1C1A" stopOpacity="0" />
              <Stop offset="20%" stopColor="#0E2D2A" stopOpacity="0.65" />
              <Stop offset="55%" stopColor="#12473D" stopOpacity="0.92" />
              <Stop offset="82%" stopColor="#177457" stopOpacity="0.98" />
              <Stop offset="100%" stopColor="#229B6E" stopOpacity="1" />
            </SvgLinearGradient>
          </Defs>
          {/* Smooth, rounded semi-circle dome path lowered gracefully */}
          <Path
            d="M 0,220 A 200,160 0 0 1 400,220 L 400,500 L 0,500 Z"
            fill="url(#semiCircleDomeGrad)"
          />
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
  overlayWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '52%', // Lowered overlay height matching lower half of screen
  },
});
