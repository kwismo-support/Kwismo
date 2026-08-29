import React from 'react';
import { StyleSheet, View, Image } from 'react-native';
import Svg, { Rect, Circle, Path, G, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';

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
      {/* Background Photo Image */}
      {activeImage ? (
        <Image
          source={{ uri: activeImage }}
          style={styles.backgroundImage}
          resizeMode="cover"
        />
      ) : (
        <View style={styles.fallbackContainer}>
          {slideIndex === 0 && <Slide1Illustration />}
          {slideIndex === 1 && <Slide2Illustration />}
          {slideIndex === 2 && <Slide3Illustration />}
        </View>
      )}

      {/* 
        Dark Teal-Green Gradient Overlay matching mockup images:
        Vibrant green at bottom, blending into deep teal blue upwards.
      */}
      <LinearGradient
        colors={[
          'rgba(0, 0, 0, 0)',
          'rgba(14, 45, 42, 0.25)',
          'rgba(18, 64, 54, 0.75)',
          '#155945',
          '#1C7E5F',
        ]}
        locations={[0, 0.4, 0.65, 0.85, 1.0]}
        style={styles.gradientOverlay}
      />
    </View>
  );
};

// Fallback SVG Illustrations if offline
const Slide1Illustration = () => (
  <Svg width="100%" height="100%" viewBox="0 0 400 800" preserveAspectRatio="xMidYMid slice">
    <Defs>
      <SvgLinearGradient id="bgGrad1" x1="0" y1="0" x2="0" y2="1">
        <Stop offset="0%" stopColor="#2A5C50" />
        <Stop offset="50%" stopColor="#1C4038" />
        <Stop offset="100%" stopColor="#0F2B24" />
      </SvgLinearGradient>
    </Defs>
    <Rect width="400" height="800" fill="url(#bgGrad1)" />
  </Svg>
);

const Slide2Illustration = () => (
  <Svg width="100%" height="100%" viewBox="0 0 400 800" preserveAspectRatio="xMidYMid slice">
    <Defs>
      <SvgLinearGradient id="bgGrad2" x1="0" y1="0" x2="1" y2="1">
        <Stop offset="0%" stopColor="#1A2838" />
        <Stop offset="60%" stopColor="#162D2E" />
        <Stop offset="100%" stopColor="#0F2B24" />
      </SvgLinearGradient>
    </Defs>
    <Rect width="400" height="800" fill="url(#bgGrad2)" />
  </Svg>
);

const Slide3Illustration = () => (
  <Svg width="100%" height="100%" viewBox="0 0 400 800" preserveAspectRatio="xMidYMid slice">
    <Defs>
      <SvgLinearGradient id="bgGrad3" x1="0" y1="0" x2="0" y2="1">
        <Stop offset="0%" stopColor="#3B261D" />
        <Stop offset="50%" stopColor="#1F352E" />
        <Stop offset="100%" stopColor="#0F2B24" />
      </SvgLinearGradient>
    </Defs>
    <Rect width="400" height="800" fill="url(#bgGrad3)" />
  </Svg>
);

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  backgroundImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  fallbackContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#0F2B24',
  },
  gradientOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '65%',
  },
});
