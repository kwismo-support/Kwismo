/// <reference types="nativewind/types" />
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  useWindowDimensions,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { StatusBar } from 'expo-status-bar';
import { KwismoLogo } from '@/shared/components/KwismoLogo';
import { BrandGradientBackground } from '@/shared/components/BrandGradientBackground';
import { Icon } from '@/shared/ui/Icon';
import { useAuthStore } from '@/shared/store/authStore';
import { storage } from '@/shared/services/storage';
import { CustomAnimatedSplash } from '@/shared/components/CustomAnimatedSplash';
import { colors } from '@/styles/tokens';

interface LanguageOption {
  code: string;
  label: string;
  nativeName: string;
  flag: string;
}

const LANGUAGES: LanguageOption[] = [
  { code: 'fr', label: 'Français', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'en', label: 'English', nativeName: 'English', flag: '🇺🇸' },
];

export default function LanguageSelectionScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t, i18n } = useTranslation();
  const { width: screenWidth } = useWindowDimensions();

  const { isAuthenticated, isInitialized } = useAuthStore();
  const [selectedLang, setSelectedLang] = useState<string>(i18n.language || 'fr');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(15)).current;

  useEffect(() => {
    if (!isInitialized) return;

    if (isAuthenticated) {
      router.replace('/(app)');
      return;
    }

    storage.getItem('kwismo_onboarding_done').then((done) => {
      if (done === 'true') {
        router.replace('/(auth)/login');
      } else {
        setCheckingStatus(false);
      }
    }).catch(() => {
      setCheckingStatus(false);
    });
  }, [isInitialized, isAuthenticated, router]);

  useEffect(() => {
    if (!checkingStatus) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [checkingStatus]);

  const handleSelectLanguage = (code: string) => {
    setSelectedLang(code);
    i18n.changeLanguage(code);
    setDropdownOpen(false);
  };

  const handleContinue = () => {
    router.replace('/onboarding');
  };

  if (!isInitialized || checkingStatus) {
    return <CustomAnimatedSplash />;
  }

  const currentOption = LANGUAGES.find((l) => l.code === selectedLang);
  const responsiveLogoSize = Math.min(Math.max(screenWidth * 0.46, 150), 220);

  return (
    <BrandGradientBackground>
      <StatusBar style="light" />

      <Animated.View
        className="flex-1 w-full h-full px-6 justify-between"
        style={{
          paddingTop: insets.top + 40,
          paddingBottom: Math.max(insets.bottom + 24, 36),
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }}
      >
        <View className="flex-1 w-full items-center justify-center">
          <KwismoLogo size={responsiveLogoSize} variant="white" />
        </View>

        <View className="w-full items-center">
          <View className="w-full relative z-50">
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => setDropdownOpen(!dropdownOpen)}
              className="w-full hx-13 bg-white dark:bg-brand-cardDark rounded-xl flex-row items-center justify-between px-5 border border-slate-200/60 dark:border-slate-700 shadow-md shadow-black/10 elevation-3"
            >
              <View className="flex-row items-center">
                {currentOption && (
                  <Text className="text-xl mr-3">
                    {currentOption.flag}
                  </Text>
                )}
                <Text
                  className={`font-semibold text-caption ${
                    currentOption ? 'text-slate-800 dark:text-slate-200' : 'text-slate-400 dark:text-slate-500'
                  }`}
                >
                  {currentOption ? currentOption.label : t('common.selectLanguage')}
                </Text>
              </View>

              <Icon
                name={dropdownOpen ? 'eva:arrow-down-fill' : 'eva:arrow-up-fill'}
                size={18}
                color="#B4C4DD"
              />
            </TouchableOpacity>

            {dropdownOpen && (
              <View className="absolute bottom-32 left-0 right-0 bg-white dark:bg-brand-cardDark rounded-xl p-1.5 border border-slate-200/60 dark:border-slate-700 shadow-xl shadow-black/15 elevation-5 z-50">
                {LANGUAGES.map((item) => {
                  const isSelected = item.code === selectedLang;
                  return (
                    <TouchableOpacity
                      key={item.code}
                      activeOpacity={0.7}
                      onPress={() => handleSelectLanguage(item.code)}
                      className={`flex-row items-center justify-between p-3 rounded-lg ${
                        isSelected ? 'bg-brand-green/10' : 'bg-transparent'
                      }`}
                    >
                      <View className="flex-row items-center">
                        <Text className="text-xl mr-3">
                          {item.flag}
                        </Text>
                        <Text
                          className={`text-body-md ${
                            isSelected ? 'font-semibold text-brand-green' : 'font-medium text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {item.nativeName}
                        </Text>
                      </View>

                      {isSelected && (
                        <Icon
                          name="solar:check-circle-bold"
                          size={20}
                          color={colors.green}
                        />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}

            {selectedLang && (
              <Animated.View className="w-full mt-4">
                <TouchableOpacity
                  activeOpacity={0.88}
                  onPress={handleContinue}
                  className="w-full hx-13 bg-brand-green rounded-xl flex-row items-center justify-center shadow-md shadow-brand-green/30 elevation-4"
                >
                  <Text className="font-semibold text-body-lg text-white">
                    {t('common.continue')}
                  </Text>
                  <Icon
                    name="solar:arrow-right-linear"
                    size={20}
                    color={colors.white}
                    style={{ marginLeft: 8 }}
                  />
                </TouchableOpacity>
              </Animated.View>
            )}
          </View>
        </View>
      </Animated.View>
    </BrandGradientBackground>
  );
}

