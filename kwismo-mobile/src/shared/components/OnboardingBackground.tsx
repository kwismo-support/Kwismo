import React from 'react';
import { StyleSheet, View, Image, ImageSourcePropType } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface OnboardingBackgroundProps {
  slideIndex: number;
  imageSource?: ImageSourcePropType | string;
}

const DEFAULT_SLIDE_IMAGES: (ImageSourcePropType | string)[] = [
  require('../../../assets/slide1.jpg'),
  require('../../../assets/slide2.jpg'),
  require('../../../assets/slide3.jpg'),
];

export const OnboardingBackground: React.FC<OnboardingBackgroundProps> = ({
  slideIndex,
  imageSource,
}) => {
  const activeImage = imageSource || DEFAULT_SLIDE_IMAGES[slideIndex];

  const resolvedImageSource: ImageSourcePropType =
    typeof activeImage === 'string' ? { uri: activeImage } : activeImage;

  return (
    <View style={styles.container}>
      {resolvedImageSource && (
        <Image
          source={resolvedImageSource}
          style={styles.backgroundImage}
          resizeMode="cover"
        />
      )}

      <LinearGradient
        colors={[
          'rgba(15, 43, 36, 0)',
          'rgba(15, 43, 36, 0.08)',
          'rgba(15, 43, 36, 0.35)',
          'rgba(15, 43, 36, 0.65)',
          'rgba(15, 43, 36, 0.85)',
          'rgba(10, 28, 23, 0.96)',
        ]}
        locations={[0, 0.35, 0.55, 0.75, 0.90, 1.0]}
        style={styles.gradientOverlay}
        pointerEvents="none"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#0F2B24',
  },
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  gradientOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
});
