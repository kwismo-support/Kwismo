import React from 'react';
import { View, StyleSheet, Dimensions, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Defs, LinearGradient as SvgGradient, Stop } from 'react-native-svg';
import { useAppTheme } from '../hooks/useAppTheme';

interface AuthDomeBackgroundProps {
  children?: React.ReactNode;
}

export const AuthDomeBackground: React.FC<AuthDomeBackgroundProps> = ({ children }) => {
  const { isDark } = useAppTheme();
  const screenWidth = Dimensions.get('window').width;

  const headerGradientColors: readonly [string, string, ...string[]] = isDark
    ? ['#0F766E', '#1E293B', '#0F172A']
    : ['#15A362', '#3D5A50', '#FFFFFF'];

  const locations: readonly [number, number, ...number[]] = isDark ? [0, 0.5, 0.85] : [0, 0.45, 0.75];

  return (
    <View style={styles.wrapper}>
      {/* Arrière-plan Gradient Global inspiré de CreateAccountScreen */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <LinearGradient
          colors={headerGradientColors}
          locations={locations}
          style={StyleSheet.absoluteFill}
        />

        {/* Dôme SVG incurvé vers le haut visible sur Web et Mobile */}
        <View style={styles.domeContainer}>
          <Svg
            width={screenWidth}
            height={260}
            viewBox={`0 0 ${screenWidth} 260`}
            style={styles.svgDome}
          >
            <Defs>
              <SvgGradient id="domeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <Stop offset="0%" stopColor={isDark ? '#0F766E' : '#15A362'} stopOpacity={0.9} />
                <Stop offset="45%" stopColor={isDark ? '#1E293B' : '#3D5A50'} stopOpacity={0.7} />
                <Stop offset="100%" stopColor={isDark ? '#0F172A' : '#FFFFFF'} stopOpacity={0} />
              </SvgGradient>
            </Defs>
            <Path
              d={`M 0,0 L ${screenWidth},0 L ${screenWidth},180 Q ${screenWidth / 2},260 0,180 Z`}
              fill="url(#domeGrad)"
            />
          </Svg>
        </View>
      </View>

      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  domeContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 260,
    overflow: 'hidden',
  },
  svgDome: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
});
