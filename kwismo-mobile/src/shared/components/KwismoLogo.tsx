import React from 'react';
import { View, Image, StyleSheet, ImageSourcePropType } from 'react-native';

interface KwismoLogoProps {
  size?: number;
  variant?: 'default' | 'white';
}

const logoWhite = require('../../../assets/logo-white.png');
const logoDefault = require('../../../assets/logo.png');

export const KwismoLogo: React.FC<KwismoLogoProps> = ({
  size = 140,
  variant = 'default',
}) => {
  const logoSource: ImageSourcePropType = variant === 'white' ? logoWhite : logoDefault;

  return (
    <View style={[styles.container, { width: size * 1.6, height: size }]}>
      <Image
        source={logoSource}
        style={{ width: size * 1.6, height: size }}
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
});

