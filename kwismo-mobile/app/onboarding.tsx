import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  useWindowDimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { ArrowRight } from 'lucide-react-native';
import { OnboardingBackground } from '../src/shared/components/OnboardingBackground';
import { LanguageSwitcher } from '../src/shared/components/LanguageSwitcher';
import { colors, typography, fonts } from '../src/styles/tokens';

export default function OnboardingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);

  const onboardingSlides = [
    {
      id: 'slide-1',
      title: t('onboarding.slide1'),
    },
    {
      id: 'slide-2',
      title: t('onboarding.slide2'),
    },
    {
      id: 'slide-3',
      title: t('onboarding.slide3'),
    },
  ];

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const contentOffset = event.nativeEvent.contentOffset.x;
    const currentIndex = Math.round(contentOffset / screenWidth);
    if (currentIndex !== activeIndex && currentIndex >= 0 && currentIndex < onboardingSlides.length) {
      setActiveIndex(currentIndex);
    }
  };

  const handleNext = () => {
    if (activeIndex < onboardingSlides.length - 1) {
      const nextIndex = activeIndex + 1;
      scrollViewRef.current?.scrollTo({
        x: nextIndex * screenWidth,
        animated: true,
      });
      setActiveIndex(nextIndex);
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

  return (
    <View style={styles.container}>
      {/* Top right language switcher overlay */}
      <View style={[styles.langOverlay, { top: insets.top + 16 }]}>
        <LanguageSwitcher darkTheme={true} />
      </View>

      {/* Horizontal Scrollable Onboarding Slides */}
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
          <View key={slide.id} style={{ width: screenWidth, height: screenHeight }}>
            {/* Background Image / Illustration with Gradient Overlay */}
            <OnboardingBackground slideIndex={index} />

            {/* Slide Text Content */}
            <View
              style={[
                styles.slideContentContainer,
                {
                  paddingBottom: insets.bottom + 120,
                },
              ]}
            >
              <Text style={styles.slideTitle}>{slide.title}</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Floating Bottom UI Controls Overlay */}
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
        {/* Pagination Indicators */}
        <View style={styles.indicatorRow}>
          {onboardingSlides.map((_, idx) => {
            const isActive = idx === activeIndex;
            return (
              <View
                key={`indicator-${idx}`}
                style={[
                  styles.indicatorBase,
                  isActive ? styles.indicatorActive : styles.indicatorInactive,
                ]}
              />
            );
          })}
        </View>

        {/* Bottom Actions Row */}
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
  },
  langOverlay: {
    position: 'absolute',
    right: 20,
    zIndex: 30,
  },
  slideContentContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  slideTitle: {
    ...typography.h3,
    color: colors.white,
    textAlign: 'center',
  },
  bottomOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  indicatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  indicatorBase: {
    height: 6,
    borderRadius: 3,
    marginHorizontal: 4,
  },
  indicatorActive: {
    width: 28,
    backgroundColor: colors.orange,
  },
  indicatorInactive: {
    width: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.65)',
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
