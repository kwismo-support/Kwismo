import React from 'react';
import { View, Image, StyleSheet } from 'react-native';

interface KwismoLogoProps {
  size?: number;
  variant?: 'default' | 'white';
}

export const KwismoLogo: React.FC<KwismoLogoProps> = ({
  size = 140,
  variant = 'default',
}) => {
  const logoSource =
    variant === 'white'
      ? require('../../../assets/logo-white.png')
      : require('../../../assets/logo.png');

  return (
    <View style={[styles.container, { width: size * 1.6, height: size }]}>
      <Image
        source={logoSource}
        style={styles.logoImage}
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
});
