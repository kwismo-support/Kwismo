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
        2. Semi-Circle Curved Arch / Dome Gradient Overlay matching the mockups:
        - Curved path Q 200,10 forming a smooth dome rising up in the middle
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
              <Stop offset="22%" stopColor="#0E2D2A" stopOpacity="0.65" />
              <Stop offset="55%" stopColor="#12473D" stopOpacity="0.92" />
              <Stop offset="82%" stopColor="#177457" stopOpacity="0.98" />
              <Stop offset="100%" stopColor="#229B6E" stopOpacity="1" />
            </SvgLinearGradient>
          </Defs>
          {/* Curved dome arch rising upwards in the center */}
          <Path
            d="M 0,140 Q 200,5 400,140 L 400,500 L 0,500 Z"
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
    height: '62%', // Half-screen curved dome overlay
  },
});
