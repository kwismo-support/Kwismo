import React from 'react';
import { StyleSheet, View, Image } from 'react-native';
import Svg, { Rect, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';
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
      {/* 1. Full Photo Background */}
      {activeImage ? (
        <Image
          source={{ uri: activeImage }}
          style={styles.backgroundImage}
          resizeMode="cover"
        />
      ) : (
        <View style={styles.fallbackContainer}>
          <FallbackSvgIllustration />
        </View>
      )}

      {/* 
        2. 3-Phase Half-Screen Gradient Overlay matching the mockups:
        - Phase 3 (Top half): Completely transparent (photo visible)
        - Phase 2 (Middle half behind text): Deep teal/blue dark gradient (#0E312F) for text readability
        - Phase 1 (Bottom half behind indicators & buttons): Lighter vibrant green (#22996E / #1C8561)
      */}
      <LinearGradient
        colors={[
          'rgba(0, 0, 0, 0)',          // 0%: Sans dégradé (Transparent)
          'rgba(14, 38, 38, 0.45)',    // 25%: Transitoire
          'rgba(14, 45, 42, 0.88)',    // 50%: Dégradé bleu/canard sombre derrière le texte
          '#145A47',                   // 75%: Transition vert
          '#1F9870',                   // 100%: Dégradé vert plus clair tout en bas
        ]}
        locations={[0, 0.25, 0.52, 0.78, 1.0]}
        style={styles.halfScreenGradientOverlay}
      />
    </View>
  );
};

const FallbackSvgIllustration = () => (
  <Svg width="100%" height="100%" viewBox="0 0 400 800" preserveAspectRatio="xMidYMid slice">
    <Defs>
      <SvgLinearGradient id="bgGrad" x1="0" y1="0" x2="0" y2="1">
        <Stop offset="0%" stopColor="#2A5C50" />
        <Stop offset="50%" stopColor="#1C4038" />
        <Stop offset="100%" stopColor="#0F2B24" />
      </SvgLinearGradient>
    </Defs>
    <Rect width="400" height="800" fill="url(#bgGrad)" />
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
  halfScreenGradientOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '58%', // Half-screen gradient overlay as shown in mockups
  },
});
