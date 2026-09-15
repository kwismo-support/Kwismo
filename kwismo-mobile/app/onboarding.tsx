import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Animated,
  useWindowDimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Icon } from '@/shared/ui/Icon';
import { OnboardingBackground } from '@/shared/components/OnboardingBackground';
import { AnimatedIndicatorDot } from '@/shared/components/AnimatedIndicatorDot';
import { useAuthStore } from '@/shared/store/authStore';
import { storage } from '@/shared/services/storage';

export default function OnboardingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { width: screenWidth } = useWindowDimensions();

  const [activeIndex, setActiveIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const currentScrollXRef = useRef(0);

  const onboardingSlides = [
    { id: 'slide-1', title: t('onboarding.slide1') },
    { id: 'slide-2', title: t('onboarding.slide2') },
    { id: 'slide-3', title: t('onboarding.slide3') },
  ];

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    {
      useNativeDriver: false,
      listener: (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const contentOffset = event.nativeEvent.contentOffset.x;
        const currentIndex = Math.round(contentOffset / screenWidth);
        if (currentIndex !== activeIndex && currentIndex >= 0 && currentIndex < onboardingSlides.length) {
          setActiveIndex(currentIndex);
        }
      },
    }
  );

  const scrollToSlide = (index: number) => {
    if (index >= 0 && index < onboardingSlides.length) {
      scrollViewRef.current?.scrollTo({
        x: index * screenWidth,
        animated: true,
      });
      setActiveIndex(index);
    }
  };

  const handleNext = () => {
    if (activeIndex < onboardingSlides.length - 1) {
      scrollToSlide(activeIndex + 1);
    } else {
      handleFinish();
    }
  };

  const handleSkip = () => {
    handleFinish();
  };

  const { isAuthenticated, isInitialized } = useAuthStore();

  useEffect(() => {
    if (isInitialized && isAuthenticated) {
      router.replace('/(app)');
    }
  }, [isInitialized, isAuthenticated, router]);

  const handleFinish = async () => {
    try {
      await storage.setItem('kwismo_onboarding_done', 'true');
    } catch {
      // Storage save fallback
    }
    router.replace('/(auth)/welcome');
  };

  useEffect(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'ArrowRight') {
          handleNext();
        } else if (e.key === 'ArrowLeft' && activeIndex > 0) {
          scrollToSlide(activeIndex - 1);
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [activeIndex]);

  const onMouseDownWeb = (e: any) => {
    if (Platform.OS === 'web') {
      isDraggingRef.current = true;
      startXRef.current = e.clientX || (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
      currentScrollXRef.current = activeIndex * screenWidth;
    }
  };

  const onMouseMoveWeb = (e: any) => {
    if (isDraggingRef.current && Platform.OS === 'web') {
      const currentX = e.clientX || (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
      const deltaX = startXRef.current - currentX;
      const targetX = currentScrollXRef.current + deltaX;
      scrollX.setValue(targetX);
      scrollViewRef.current?.scrollTo({
        x: targetX,
        animated: false,
      });
    }
  };

  const onMouseUpWeb = (e: any) => {
    if (isDraggingRef.current && Platform.OS === 'web') {
      isDraggingRef.current = false;
      const endX = e.clientX || (e.changedTouches && e.changedTouches[0] ? e.changedTouches[0].clientX : 0);
      const deltaX = startXRef.current - endX;

      if (Math.abs(deltaX) > 40) {
        if (deltaX > 0 && activeIndex < onboardingSlides.length - 1) {
          scrollToSlide(activeIndex + 1);
        } else if (deltaX < 0 && activeIndex > 0) {
          scrollToSlide(activeIndex - 1);
        } else {
          scrollToSlide(activeIndex);
        }
      } else {
        scrollToSlide(activeIndex);
      }
    }
  };

  const navRowOpacity = scrollX.interpolate({
    inputRange: [0, screenWidth, screenWidth * 1.5, screenWidth * 2],
    outputRange: [1, 1, 0.2, 0],
    extrapolate: 'clamp',
  });

  const commencerOpacity = scrollX.interpolate({
    inputRange: [0, screenWidth, screenWidth * 1.5, screenWidth * 2],
    outputRange: [0, 0, 0.8, 1],
    extrapolate: 'clamp',
  });

  const isLastSlide = activeIndex === onboardingSlides.length - 1;

  return (
    <View
      className="flex-1 w-full h-full bg-black relative overflow-hidden"
      {...(Platform.OS === 'web'
        ? {
            onMouseDown: onMouseDownWeb,
            onMouseMove: onMouseMoveWeb,
            onMouseUp: onMouseUpWeb,
            onTouchStart: onMouseDownWeb,
            onTouchMove: onMouseMoveWeb,
            onTouchEnd: onMouseUpWeb,
          }
        : {})}
    >
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        bounces={false}
        className="absolute inset-0 w-full h-full"
      >
        {onboardingSlides.map((slide, index) => (
          <View
            key={slide.id}
            className="relative h-full overflow-hidden"
            style={{ width: screenWidth, height: '100%' }}
          >
            <OnboardingBackground slideIndex={index} />

            <View
              className="flex-1 w-full justify-end items-center px-7"
              style={{
                paddingBottom: Math.max(insets.bottom + 140, 150),
              }}
            >
              <Text className="font-headline text-h3 text-white text-center mb-8">
                {slide.title}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>

      <View
        className="absolute inset-x-0 bottom-0 w-full items-center justify-end z-20 px-6"
        style={{
          paddingBottom: Math.max(insets.bottom + 24, 40),
        }}
        pointerEvents="box-none"
      >
        <View className="flex-row items-center justify-center mb-12">
          {onboardingSlides.map((_, idx) => (
            <AnimatedIndicatorDot
              key={`indicator-${idx}`}
              index={idx}
              scrollX={scrollX}
              screenWidth={screenWidth}
              isActive={idx === activeIndex}
              onPress={() => scrollToSlide(idx)}
            />
          ))}
        </View>

        <View className="w-full h-14 relative">
          <Animated.View
            className="absolute inset-0 w-full justify-center"
            style={{ opacity: navRowOpacity }}
            pointerEvents={isLastSlide ? 'none' : 'auto'}
          >
            <View className="w-full h-14 flex-row items-center justify-between px-2">
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={handleSkip}
                className="py-3 px-4"
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              >
                <Text className="font-medium text-body-lg text-white/95">
                  {t('common.skip')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleNext}
                className="flex-row items-center py-3 px-4"
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              >
                <Text className="font-medium text-body-lg text-white mr-1.5">
                  {t('common.next')}
                </Text>
                <Icon name="solar:arrow-right-linear" color="#FFFFFF" size={20} />
              </TouchableOpacity>
            </View>
          </Animated.View>

          <Animated.View
            className="absolute inset-0 w-full justify-center"
            style={{ opacity: commencerOpacity }}
            pointerEvents={isLastSlide ? 'auto' : 'none'}
          >
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleFinish}
              className="w-full h-14 rounded-xl border-[1.5px] border-white/50 items-center justify-center bg-white/10"
            >
              <Text className="font-semibold text-body-lg text-white">
                {t('common.start')}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </View>
    </View>
  );
}


