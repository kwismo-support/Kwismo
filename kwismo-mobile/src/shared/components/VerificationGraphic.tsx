import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import Svg, { Path, Circle, Rect, G } from 'react-native-svg';
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

// Petit check flottant
const FloatingCheck = ({ size, color }: { size: number; color: string }) => (
  <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
    <Circle cx="10" cy="10" r="9" fill={color} />
    <Path
      d="M6 10 L8.8 13 L14 7"
      stroke="#FFFFFF"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const VerificationGraphic: React.FC<VerificationGraphicProps> = ({
  state,
  isDark = false,
}) => {
  // Animations
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;
  const lineSweepAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Rotation continue des étoiles autour du cercle
    const rotateLoop = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 8000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    // Pulsation douce du bouclier
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.98,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    // Flottement léger pour le mode résultat
    const floatLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -6,
          duration: 1400,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 4,
          duration: 1400,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    // Balayage de la ligne d'analyse en cours
    const lineLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(lineSweepAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(lineSweepAnim, {
          toValue: 0,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    rotateLoop.start();
    pulseLoop.start();
    floatLoop.start();
    lineLoop.start();

    return () => {
      rotateLoop.stop();
      pulseLoop.stop();
      floatLoop.stop();
      lineLoop.stop();
    };
  }, []);

  const spinInterpolate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const reverseSpinInterpolate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['360deg', '0deg'],
  });

  const lineOpacity = lineSweepAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.3, 1, 0.3],
  });

  const circleBgColor = isDark ? '#162338' : '#E8F7F0';
  const sparkleColor = colors.green;

  return (
    <View style={styles.wrapper}>
      {/* Grand cercle d'arrière-plan pastel */}
      <View style={[styles.outerCircle, { backgroundColor: circleBgColor }]}>
        {/* Anneau d'étoiles (sparkles) qui tourne autour du cercle */}
        <Animated.View
          style={[
            styles.sparkleOrbit,
            { transform: [{ rotate: spinInterpolate }] },
          ]}
        >
          {/* Étoile haut-gauche */}
          <View style={[styles.starPosition, { top: 12, left: 24 }]}>
            <FourPointStar size={24} color={sparkleColor} />
          </View>

          {/* Étoile bas-gauche */}
          <View style={[styles.starPosition, { bottom: 20, left: 32 }]}>
            <FourPointStar size={14} color={sparkleColor} />
          </View>

          {/* Étoile bas-droite */}
          <View style={[styles.starPosition, { bottom: 18, right: 28 }]}>
            <FourPointStar size={18} color={sparkleColor} />
          </View>

          {/* Étoile haut-droite */}
          <View style={[styles.starPosition, { top: 38, right: 18 }]}>
            <FourPointStar size={12} color={isDark ? '#64748B' : '#FFFFFF'} />
          </View>
        </Animated.View>

        {/* Petits checks flottants si en mode 'result' */}
        {state === 'result' && (
          <Animated.View
            style={[
              styles.sparkleOrbit,
              { transform: [{ rotate: reverseSpinInterpolate }] },
            ]}
          >
            <View style={[styles.starPosition, { top: 18, right: 34 }]}>
              <FloatingCheck size={18} color={colors.green} />
            </View>
            <View style={[styles.starPosition, { bottom: 30, left: 16 }]}>
              <FloatingCheck size={14} color={colors.green} />
            </View>
            <View style={[styles.starPosition, { top: 50, left: 12 }]}>
              <FloatingCheck size={16} color={colors.green} />
            </View>
          </Animated.View>
        )}

        {/* Bouclier central avec animation de pulsation / flottement */}
        <Animated.View
          style={[
            styles.shieldCenter,
            {
              transform: [
                { scale: pulseAnim },
                ...(state === 'result' ? [{ translateY: floatAnim }] : []),
              ],
            },
          ]}
        >
          {state === 'analyzing' ? (
            /* Bouclier d'analyse : avec la silhouette et la ligne d'analyse en cours */
            <Svg width="112" height="124" viewBox="0 0 112 124" fill="none">
              {/* Corps du bouclier */}
              <Path
                d="M56 4 C88 4 104 16 104 38 C104 84 56 118 56 120 C56 118 8 84 8 38 C8 16 24 4 56 4 Z"
                fill={colors.green}
              />
              {/* Ombre / bordure subtile */}
              <Path
                d="M56 7 C85 7 100 18 100 38 C100 81 56 114 56 116 C56 114 12 81 12 38 C12 18 27 7 56 7 Z"
                stroke="rgba(255, 255, 255, 0.25)"
                strokeWidth="2"
              />
              {/* Tête avatar (cercle blanc) */}
              <Circle cx="56" cy="40" r="10" fill="rgba(255, 255, 255, 0.95)" />
              {/* Forme du corps arrondie */}
              <Path
                d="M38 72 C38 60 46 56 56 56 C66 56 74 60 74 72 C74 76 70 78 56 78 C42 78 38 76 38 72 Z"
                fill="rgba(255, 255, 255, 0.65)"
              />
              {/* Trait sous forme de ligne montrant que l'analyse est en cours */}
              <Rect
                x="34"
                y="88"
                width="44"
                height="4"
                rx="2"
                fill="rgba(255, 255, 255, 0.85)"
              />
            </Svg>
          ) : (
            /* Bouclier validé : avec la carte, les deux lignes horizontales et le badge de check */
            <Svg width="112" height="124" viewBox="0 0 112 124" fill="none">
              {/* Corps du bouclier */}
              <Path
                d="M56 4 C88 4 104 16 104 38 C104 84 56 118 56 120 C56 118 8 84 8 38 C8 16 24 4 56 4 Z"
                fill={colors.green}
              />
              <Path
                d="M56 7 C85 7 100 18 100 38 C100 81 56 114 56 116 C56 114 12 81 12 38 C12 18 27 7 56 7 Z"
                stroke="rgba(255, 255, 255, 0.25)"
                strokeWidth="2"
              />

              {/* Carte aux coins arrondis à l'intérieur */}
              <Rect
                x="32"
                y="30"
                width="48"
                height="46"
                rx="10"
                fill="rgba(255, 255, 255, 0.55)"
              />

              {/* Deux lignes de texte blanches */}
              <Rect
                x="44"
                y="42"
                width="24"
                height="4"
                rx="2"
                fill="#FFFFFF"
              />
              <Rect
                x="40"
                y="52"
                width="32"
                height="4"
                rx="2"
                fill="#FFFFFF"
              />

              {/* Badge festonné circulaire blanc avec check vert superposé en bas */}
              <G transform="translate(56, 74)">
                <Circle cx="0" cy="0" r="14" fill="#FFFFFF" />
                <Path
                  d="M-5 -0.5 L-1.5 3.5 L5.5 -3.5"
                  stroke={colors.green}
                  strokeWidth="2.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </G>
            </Svg>
          )}

          {/* Ligne d'analyse lumineuse animée en cours */}
          {state === 'analyzing' && (
            <Animated.View
              style={[
                styles.analyzingLineSweep,
                { opacity: lineOpacity },
              ]}
            />
          )}
        </Animated.View>
      </View>
    </View>
  );
};

// Composant Spinner pour les étapes d'opération (arc vert rotatif comme sur la maquette)
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
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        {/* Anneau de fond très léger */}
        <Circle
          cx="12"
          cy="12"
          r="9"
          stroke="#E2E8F0"
          strokeWidth="2.5"
        />
        {/* Arc de cercle actif vert rotatif */}
        <Path
          d="M12 3 A 9 9 0 0 1 21 12"
          stroke={colors.green}
          strokeWidth="2.8"
          strokeLinecap="round"
        />
      </Svg>
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
    width: 172,
    height: 172,
    borderRadius: 86,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  sparkleOrbit: {
    position: 'absolute',
    width: 172,
    height: 172,
    borderRadius: 86,
  },
  starPosition: {
    position: 'absolute',
  },
  shieldCenter: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  analyzingLineSweep: {
    position: 'absolute',
    bottom: 22,
    width: 36,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#FFFFFF',
  },
});
