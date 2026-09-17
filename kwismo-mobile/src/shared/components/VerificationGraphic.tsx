import React, { useEffect, useRef } from 'react';
import { View, Animated, Easing } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { Icon } from '@/shared/ui/Icon';

interface VerificationGraphicProps {
  state?: 'analyzing' | 'result';
  status?: 'analyzing' | 'secure' | 'warning' | 'danger';
  isDark?: boolean;
}

const FourPointStar = ({ size, color }: { size: number; color: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 0 C12 8 16 12 24 12 C16 12 12 16 12 24 C12 16 8 12 0 12 C8 12 12 8 12 0 Z"
      fill={color}
    />
  </Svg>
);

export const VerificationGraphic: React.FC<VerificationGraphicProps> = ({
  state = 'result',
  status,
  isDark = false,
}) => {
  const currentStatus = status || (state === 'analyzing' ? 'analyzing' : 'secure');
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

  let mainColor = '#25B46E'; // Green
  let bgCircleColorClass = 'bg-emerald-50 dark:bg-slate-800';

  if (currentStatus === 'warning') {
    mainColor = '#F59E0B'; // Orange / Yellow
    bgCircleColorClass = 'bg-amber-50 dark:bg-slate-800';
  } else if (currentStatus === 'danger') {
    mainColor = '#EF4444'; // Red
    bgCircleColorClass = 'bg-red-50 dark:bg-slate-800';
  }

  const sparkleColor = mainColor;

  return (
    <View className="items-center justify-center my-4.5">
      <View className={`wx-40 hx-40 rounded-full items-center justify-center relative ${bgCircleColorClass}`}>
        <Animated.View
          className="absolute wx-40 hx-40 rounded-full"
          style={{ transform: [{ rotate: spinInterpolate }] }}
        >
          <View className="absolute top-4.5 left-8">
            <FourPointStar size={26} color={sparkleColor} />
          </View>
          <View className="absolute bottom-7 left-9.5">
            <FourPointStar size={16} color={sparkleColor} />
          </View>
          <View className="absolute bottom-6 right-9">
            <FourPointStar size={20} color={sparkleColor} />
          </View>
          <View className="absolute top-12 right-6">
            <FourPointStar size={14} color={isDark ? '#64748B' : '#FFFFFF'} />
          </View>
        </Animated.View>

        {currentStatus !== 'analyzing' && (
          <Animated.View
            className="absolute wx-40 hx-40 rounded-full"
            style={{ transform: [{ rotate: reverseSpinInterpolate }] }}
          >
            <View className="absolute top-6.5 right-12">
              <FourPointStar size={16} color={sparkleColor} />
            </View>
            <View className="absolute bottom-9.5 left-6">
              <FourPointStar size={18} color={sparkleColor} />
            </View>
            <View className="absolute top-15.5 left-5">
              <FourPointStar size={12} color={isDark ? '#64748B' : '#FFFFFF'} />
            </View>
          </Animated.View>
        )}

        <View className="wx-34 hx-34 items-center justify-center relative">
          <Icon
            name="solar:shield-minimalistic-bold"
            size={138}
            color={mainColor}
          />

          <View className="absolute inset-0 items-center justify-center pb-1.5">
            {currentStatus === 'analyzing' && (
              <Icon
                name="solar:user-bold-duotone"
                size={62}
                color="#FFFFFF"
              />
            )}
            {currentStatus === 'secure' && (
              <Icon
                name="solar:diploma-verified-bold-duotone"
                size={62}
                color="#FFFFFF"
              />
            )}
            {currentStatus === 'warning' && (
              <Icon
                name="solar:danger-triangle-bold"
                size={58}
                color="#FFFFFF"
              />
            )}
            {currentStatus === 'danger' && (
              <Icon
                name="ph:skull-bold"
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
      <Icon name="gg:spinner" size={size} color="#25B46E" />
    </Animated.View>
  );
};

export default VerificationGraphic;
