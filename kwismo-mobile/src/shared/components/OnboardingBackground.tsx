import React from 'react';
import { View, Image, ImageSourcePropType } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface OnboardingBackgroundProps {
  slideIndex: number;
  imageSource?: ImageSourcePropType | string;
}

const DEFAULT_SLIDE_IMAGES: (ImageSourcePropType | string)[] = [
  require('@/../assets/slide1.jpg'),
  require('@/../assets/slide2.jpg'),
  require('@/../assets/slide3.jpg'),
];

export const OnboardingBackground: React.FC<OnboardingBackgroundProps> = ({
  slideIndex,
  imageSource,
}) => {
  const activeImage = imageSource || DEFAULT_SLIDE_IMAGES[slideIndex];
  const resolvedImageSource: ImageSourcePropType =
    typeof activeImage === 'string' ? { uri: activeImage } : activeImage;

  return (
    <View className="absolute inset-0 bg-black overflow-hidden">
      {resolvedImageSource && (
        <Image
          source={resolvedImageSource}
          className="absolute inset-0 w-full h-full"
          resizeMode="cover"
        />
      )}

      <View
        className="absolute left-0 right-0 bottom-0 pointer-events-none h-[30%]"
        pointerEvents="none"
      >
        <LinearGradient
          colors={[
            'transparent',
            'rgba(50, 176, 127, 0.40)',
            'rgba(50, 176, 127, 0.85)',
            '#32B07F',
          ]}
          locations={[0, 0.35, 0.75, 1.0]}
          className="w-full h-full"
          pointerEvents="none"
        />
      </View>
    </View>
  );
};

export default OnboardingBackground;
