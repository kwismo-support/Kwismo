import React from 'react';
import { StyleSheet, View, Image, Platform, ImageSourcePropType } from 'react-native';
import Svg, { Path, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';
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

  // Gestion automatique : image require(...) local ou URL string
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

      {Platform.OS === 'web' ? (
        <LinearGradient
          colors={[
            'rgba(0, 0, 0, 0)',
            'rgba(14, 42, 36, 0.45)',
            'rgba(16, 68, 54, 0.88)',
            '#18785A',
            '#24A173',
          ]}
          locations={[0, 0.28, 0.58, 0.82, 1.0]}
          style={styles.webBandeauOverlay}
          pointerEvents="none"
        />
      ) : (
        <View style={styles.mobileDomeOverlay} pointerEvents="none">
          <Svg
            width="100%"
            height="100%"
            viewBox="0 0 400 500"
            preserveAspectRatio="none"
          >
            <Defs>
              <SvgLinearGradient id="mobileSemiCircleDome" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0%" stopColor="#0B1C1A" stopOpacity="0" />
                <Stop offset="18%" stopColor="#0E2D2A" stopOpacity="0.75" />
                <Stop offset="52%" stopColor="#12473D" stopOpacity="0.95" />
                <Stop offset="82%" stopColor="#177457" stopOpacity="0.99" />
                <Stop offset="100%" stopColor="#229B6E" stopOpacity="1" />
              </SvgLinearGradient>
            </Defs>
            <Path
              d="M 0,200 A 200,150 0 0 1 400,200 L 400,500 L 0,500 Z"
              fill="url(#mobileSemiCircleDome)"
            />
          </Svg>
        </View>
      )}
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
  webBandeauOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '62%',
  },
  mobileDomeOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '54%',
  },
});
