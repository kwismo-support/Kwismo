import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

export const SplashBackgroundDecorations: React.FC = () => {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {/* Top Right Light-Green Floral Curve */}
      <Svg style={styles.topRight} width="220" height="220" viewBox="0 0 200 200">
        <Path
          d="M 200 0 C 120 0 80 40 80 120 C 80 160 50 190 0 200 C 100 180 180 120 200 0 Z"
          fill="rgba(180, 225, 175, 0.45)"
        />
        <Path
          d="M 120 60 C 100 80 80 80 60 60 C 80 40 80 20 120 60 Z"
          fill="rgba(180, 225, 175, 0.35)"
        />
      </Svg>

      {/* Bottom Right Soft Blue Star Motif */}
      <Svg style={styles.bottomRight} width="260" height="260" viewBox="0 0 200 200">
        <Path
          d="M 200 200 C 140 180 100 120 80 40 C 120 100 180 140 200 200 Z"
          fill="rgba(215, 225, 250, 0.45)"
        />
        <Path
          d="M 140 120 Q 100 100 140 80 Q 180 100 140 120 Z"
          fill="rgba(225, 235, 255, 0.5)"
        />
      </Svg>

      {/* Middle Left Cream/Yellow Star Motif */}
      <Svg style={styles.middleLeft} width="160" height="160" viewBox="0 0 160 160">
        <Path
          d="M 80 20 Q 80 80 20 80 Q 80 80 80 140 Q 80 80 140 80 Q 80 80 80 20 Z"
          fill="rgba(255, 245, 225, 0.6)"
          stroke="rgba(240, 220, 190, 0.4)"
          strokeWidth="3"
        />
      </Svg>

      {/* Bottom Left Green Star Motif */}
      <Svg style={styles.bottomLeft} width="160" height="160" viewBox="0 0 160 160">
        <Path
          d="M 80 20 Q 80 80 20 80 Q 80 80 80 140 Q 80 80 140 80 Q 80 80 80 20 Z"
          fill="rgba(190, 230, 190, 0.5)"
          stroke="rgba(160, 215, 160, 0.6)"
          strokeWidth="4"
        />
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  topRight: {
    position: 'absolute',
    top: -20,
    right: -20,
  },
  bottomRight: {
    position: 'absolute',
    bottom: -30,
    right: -30,
  },
  middleLeft: {
    position: 'absolute',
    top: '40%',
    left: -40,
  },
  bottomLeft: {
    position: 'absolute',
    bottom: 20,
    left: -20,
  },
});
