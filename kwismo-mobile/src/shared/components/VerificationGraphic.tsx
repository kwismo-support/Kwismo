import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { Icon } from '../ui/Icon';
import { colors } from '../../styles/tokens';

interface VerificationGraphicProps {
  state: 'analyzing' | 'result';
  isDark?: boolean;
}

// Étoile à 4 branches (Sparkle)
const FourPointStar = ({ size, color }: { size: number; color: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 0 C12 8 16 12 24 12 C16 12 12 16 12 24 C12 16 8 12 0 12 C8 12 12 8 12 0 Z"
      fill={color}
    />
  </Svg>
);

export const VerificationGraphic: React.FC<VerificationGraphicProps> = ({
  state,
  isDark = false,
}) => {
  // Seules les étoiles / éléments gravitant autour sont animés
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const rotateLoop = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 9000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    rotateLoop.start();
    return () => rotateLoop.stop();
  }, []);

  const spinInterpolate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const reverseSpinInterpolate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['360deg', '0deg'],
  });

  const circleBgColor = isDark ? '#162338' : '#E8F7F0';
  const sparkleColor = colors.green;

  return (
    <View style={styles.wrapper}>
      {/* Grand cercle d'arrière-plan plus grand et statique */}
      <View style={[styles.outerCircle, { backgroundColor: circleBgColor }]}>
        {/* Anneau d'étoiles (sparkles) animées qui tournent autour du cercle */}
        <Animated.View
          style={[
            styles.sparkleOrbit,
            { transform: [{ rotate: spinInterpolate }] },
          ]}
        >
          {/* Étoile haut-gauche */}
          <View style={[styles.starPosition, { top: 18, left: 32 }]}>
            <FourPointStar size={26} color={sparkleColor} />
          </View>

          {/* Étoile bas-gauche */}
          <View style={[styles.starPosition, { bottom: 28, left: 38 }]}>
            <FourPointStar size={16} color={sparkleColor} />
          </View>

          {/* Étoile bas-droite */}
          <View style={[styles.starPosition, { bottom: 24, right: 36 }]}>
            <FourPointStar size={20} color={sparkleColor} />
          </View>

          {/* Étoile haut-droite */}
          <View style={[styles.starPosition, { top: 48, right: 24 }]}>
            <FourPointStar size={14} color={isDark ? '#64748B' : '#FFFFFF'} />
          </View>
        </Animated.View>

        {/* Petits checks / sparkles additionnels animés en mode résultat */}
        {state === 'result' && (
          <Animated.View
            style={[
              styles.sparkleOrbit,
              { transform: [{ rotate: reverseSpinInterpolate }] },
            ]}
          >
            <View style={[styles.starPosition, { top: 26, right: 48 }]}>
              <FourPointStar size={16} color={sparkleColor} />
            </View>
            <View style={[styles.starPosition, { bottom: 38, left: 24 }]}>
              <FourPointStar size={18} color={sparkleColor} />
            </View>
            <View style={[styles.starPosition, { top: 62, left: 20 }]}>
              <FourPointStar size={12} color={isDark ? '#64748B' : '#FFFFFF'} />
            </View>
          </Animated.View>
        )}

        {/* Bouclier central statique composé des 3 calques Figma :
            1. Bordures externes (fond vert)
            2. Bordures internes (contour vert translucide)
            3. Icône au centre (solar:user-bold-duotone ou solar:diploma-verified-bold-duotone) */}
        <View style={styles.shieldContainer}>
          <Svg width="124" height="138" viewBox="0 0 124 138" fill="none">
            {/* Bordure externe */}
            <Path
              d="M62 4 C96 4 116 18 116 42 C116 94 62 132 62 134 C62 132 8 94 8 42 C8 18 28 4 62 4 Z"
              fill={colors.green}
            />
            {/* Bordure interne */}
            <Path
              d="M62 8 C93 8 111 20 111 42 C111 90 62 126 62 128 C62 126 13 90 13 42 C13 20 31 8 62 8 Z"
              stroke="rgba(255, 255, 255, 0.3)"
              strokeWidth="2.5"
            />
          </Svg>

          {/* Icône au centre du bouclier */}
          <View style={styles.shieldIconCenter}>
            {state === 'analyzing' ? (
              <Icon
                name="solar:user-bold-duotone"
                size={58}
                color="#FFFFFF"
              />
            ) : (
              <Icon
                name="solar:diploma-verified-bold-duotone"
                size={58}
                color="#FFFFFF"
              />
            )}
          </View>
        </View>
      </View>
    </View>
  );
};

// Spinner rotatif pour l'étape en cours d'analyse avec l'icône gg:spinner
export const OperationStepSpinner = ({ size = 22 }: { size?: number }) => {
  const spinAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 900,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    loop.start();
    return () => loop.stop();
  }, []);

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View style={{ transform: [{ rotate: spin }] }}>
      <Icon name="gg:spinner" size={size} color={colors.green} />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 18,
  },
  outerCircle: {
    width: 220,
    height: 220,
    borderRadius: 110,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  sparkleOrbit: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
  },
  starPosition: {
    position: 'absolute',
  },
  shieldContainer: {
    width: 124,
    height: 138,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shieldIconCenter: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 8,
  },
});
