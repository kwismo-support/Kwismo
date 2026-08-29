import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
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
import { ArrowRight } from 'lucide-react-native';
import { OnboardingBackground } from '../src/shared/components/OnboardingBackground';
import { AnimatedIndicatorDot } from '../src/shared/components/AnimatedIndicatorDot';
import { LanguageSwitcher } from '../src/shared/components/LanguageSwitcher';
import { colors, fonts } from '../src/styles/tokens';

export default function OnboardingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();

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

  const handleFinish = () => {
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

  return (
    <View
      style={styles.container}
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
      <View style={[styles.langOverlay, { top: Math.max(insets.top + 16, 20) }]}>
        <LanguageSwitcher darkTheme={true} />
      </View>

      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        bounces={false}
        style={StyleSheet.absoluteFill}
      >
        {onboardingSlides.map((slide, index) => (
          <View
            key={slide.id}
            style={[
              styles.slideFrame,
              { width: screenWidth, height: screenHeight },
            ]}
          >
            <OnboardingBackground slideIndex={index} />

            <View
              style={[
                styles.slideContentContainer,
                {
                  paddingBottom: Math.max(insets.bottom + 175, 205),
                },
              ]}
            >
              <Text style={styles.slideTitle}>{slide.title}</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      <View
        style={[
          styles.bottomOverlay,
          {
            paddingBottom: Math.max(insets.bottom, 24),
            paddingLeft: 24,
            paddingRight: 24,
          },
        ]}
        pointerEvents="box-none"
      >
        <View style={styles.indicatorRow}>
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

        {activeIndex < onboardingSlides.length - 1 ? (
          <View style={styles.navRow}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleSkip}
              style={styles.skipButton}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <Text style={styles.skipText}>{t('common.skip')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleNext}
              style={styles.nextButton}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <Text style={styles.nextText}>{t('common.next')}</Text>
              <ArrowRight color={colors.white} size={20} style={{ marginLeft: 6 }} />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.actionButtonWrapper}>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleFinish}
              style={styles.commencerButton}
            >
              <Text style={styles.commencerText}>{t('common.start')}</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F2B24',
    position: 'relative',
    overflow: 'hidden',
    ...(Platform.OS === 'web'
      ? ({
          userSelect: 'none',
          cursor: 'grab',
        } as any)
      : {}),
  },
  langOverlay: {
    position: 'absolute',
    right: 20,
    zIndex: 30,
  },
  slideFrame: {
    position: 'relative',
    overflow: 'hidden',
  },
  slideContentContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 28,
  },
  slideTitle: {
    fontFamily: fonts.h3,
    fontSize: 26,
    fontWeight: '700',
    lineHeight: 34,
    color: colors.white,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  bottomOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'flex-end',
    zIndex: 20,
  },
  indicatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  navRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    marginBottom: 12,
  },
  skipButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  skipText: {
    fontFamily: fonts.medium,
    fontSize: 16,
    color: colors.white,
    opacity: 0.9,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  nextText: {
    fontFamily: fonts.medium,
    fontSize: 16,
    color: colors.white,
  },
  actionButtonWrapper: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
  },
  commencerButton: {
    width: '100%',
    height: 52,
    borderRadius: 26,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  commencerText: {
    fontFamily: fonts.semiBold,
    fontSize: 17,
    color: colors.white,
  },
});
