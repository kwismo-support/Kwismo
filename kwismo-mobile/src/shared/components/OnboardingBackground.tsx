import React from 'react';
import { StyleSheet, View, Image } from 'react-native';
import Svg, { Rect, Circle, Path, G, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';

interface OnboardingBackgroundProps {
  slideIndex: number; // 0, 1, or 2
  imageUri?: string;
}

export const OnboardingBackground: React.FC<OnboardingBackgroundProps> = ({
  slideIndex,
  imageUri,
}) => {
  return (
    <View style={styles.container}>
      {/* Background graphic rendering */}
      {imageUri ? (
        <Image
          source={{ uri: imageUri }}
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

      {/* Dark Overlay with Green-Navy Gradient at the bottom as shown in mockups */}
      <LinearGradient
        colors={[
          'rgba(15, 22, 38, 0.02)',
          'rgba(15, 30, 38, 0.35)',
          'rgba(14, 45, 42, 0.85)',
          '#0D2F27',
          '#0E332B',
        ]}
        locations={[0, 0.35, 0.65, 0.85, 1.0]}
        style={styles.gradientOverlay}
      />
    </View>
  );
};

// Slide 1 Vector Representation: Smiling person with sunglasses and phone
const Slide1Illustration = () => (
  <Svg
    width="100%"
    height="100%"
    viewBox="0 0 400 800"
    preserveAspectRatio="xMidYMid slice"
    style={styles.svgElement}
  >
    <Defs>
      <SvgLinearGradient id="bgGrad1" x1="0" y1="0" x2="0" y2="1">
        <Stop offset="0%" stopColor="#2A5C50" />
        <Stop offset="50%" stopColor="#1C4038" />
        <Stop offset="100%" stopColor="#0F2B24" />
      </SvgLinearGradient>
    </Defs>
    <Rect width="400" height="800" fill="url(#bgGrad1)" />
    
    {/* Architectural background lines */}
    <Path d="M0 100 L400 250 M0 200 L400 350 M100 0 L100 500 M250 0 L250 500" stroke="rgba(255,255,255,0.08)" strokeWidth="2" />
    
    {/* Person Head & Sunglasses motif */}
    <G transform="translate(100, 110)">
      {/* Afro Hair */}
      <Circle cx="100" cy="110" r="90" fill="#3D2817" />
      <Circle cx="50" cy="90" r="50" fill="#3D2817" />
      <Circle cx="150" cy="90" r="50" fill="#3D2817" />
      {/* Face */}
      <Path d="M 60 120 C 60 220, 140 220, 140 120 Z" fill="#9C6B48" />
      {/* Sunglasses */}
      <Rect x="55" y="110" width="40" height="28" rx="8" fill="#2E2D38" />
      <Rect x="105" y="110" width="40" height="28" rx="8" fill="#2E2D38" />
      <Path d="M 95 120 L 105 120" stroke="#2E2D38" strokeWidth="4" />
      {/* Smile */}
      <Path d="M 75 170 Q 100 195 125 170" stroke="#FFFFFF" strokeWidth="5" fill="none" strokeLinecap="round" />
    </G>
  </Svg>
);

// Slide 2 Vector Representation: Smartphone transfer in hand
const Slide2Illustration = () => (
  <Svg
    width="100%"
    height="100%"
    viewBox="0 0 400 800"
    preserveAspectRatio="xMidYMid slice"
    style={styles.svgElement}
  >
    <Defs>
      <SvgLinearGradient id="bgGrad2" x1="0" y1="0" x2="1" y2="1">
        <Stop offset="0%" stopColor="#1A2838" />
        <Stop offset="60%" stopColor="#162D2E" />
        <Stop offset="100%" stopColor="#0F2B24" />
      </SvgLinearGradient>
    </Defs>
    <Rect width="400" height="800" fill="url(#bgGrad2)" />
    
    {/* Phone mockup in hand */}
    <G transform="translate(60, 90) rotate(-12, 140, 250)">
      {/* Outer phone body */}
      <Rect x="30" y="30" width="220" height="420" rx="36" fill="#111827" stroke="#374151" strokeWidth="4" />
      {/* Screen */}
      <Rect x="42" y="42" width="196" height="396" rx="28" fill="#E5E7EB" />
      {/* Notch */}
      <Rect x="100" y="50" width="80" height="18" rx="9" fill="#111827" />
    </G>
  </Svg>
);

// Slide 3 Vector Representation: Surprised person reporting fraud on call
const Slide3Illustration = () => (
  <Svg
    width="100%"
    height="100%"
    viewBox="0 0 400 800"
    preserveAspectRatio="xMidYMid slice"
    style={styles.svgElement}
  >
    <Defs>
      <SvgLinearGradient id="bgGrad3" x1="0" y1="0" x2="0" y2="1">
        <Stop offset="0%" stopColor="#3B261D" />
        <Stop offset="50%" stopColor="#1F352E" />
        <Stop offset="100%" stopColor="#0F2B24" />
      </SvgLinearGradient>
    </Defs>
    <Rect width="400" height="800" fill="url(#bgGrad3)" />
    
    <G transform="translate(90, 120)">
      {/* Head */}
      <Circle cx="110" cy="110" r="70" fill="#2E1F18" />
      <Path d="M 65 110 C 65 210, 155 210, 155 110 Z" fill="#805335" />
      {/* Beard */}
      <Path d="M 65 130 Q 110 230 155 130 Q 110 200 65 130 Z" fill="#2E1F18" />
      {/* Surprised mouth */}
      <Circle cx="110" cy="165" r="14" fill="#3D1A10" />
      {/* Phone pressed to ear */}
      <Rect x="30" y="90" width="30" height="80" rx="8" fill="#111827" transform="rotate(15, 45, 130)" />
    </G>
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
    overflow: 'hidden',
  },
  svgElement: {
    width: '100%',
    height: '100%',
  },
  gradientOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '70%',
  },
});
