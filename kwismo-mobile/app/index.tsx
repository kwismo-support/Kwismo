/// <reference types="nativewind/types" />
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Animated,
  Pressable,
  useWindowDimensions,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { StatusBar } from 'expo-status-bar';
import { KwismoLogo } from '../src/shared/components/KwismoLogo';
import { Icon } from '../src/shared/ui/Icon';
import { colors } from '../src/styles/tokens';

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
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();

  const [selectedLang, setSelectedLang] = useState<string>(i18n.language || 'fr');
  const [modalVisible, setModalVisible] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(15)).current;

  useEffect(() => {
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
  }, []);

  const handleSelectLanguage = (code: string) => {
    setSelectedLang(code);
    i18n.changeLanguage(code);
    setModalVisible(false);
  };

  const handleContinue = () => {
    router.replace('/onboarding');
  };

  const currentOption = LANGUAGES.find((l) => l.code === selectedLang);
  const responsiveLogoSize = Math.min(Math.max(screenWidth * 0.46, 150), 220);

  return (
    <View className="flex-1 w-full h-full bg-brand-green relative">
      <StatusBar style="light" />

      <LinearGradient
        colors={[
          colors.green,
          colors.green,
          '#246E53',
          '#1A4638',
          '#284F41',
          '#4D6E62',
          '#86A298',
          '#C6D7D1',
          '#F2F6F5',
          colors.white,
          colors.white,
        ]}
        locations={[0, 0.22, 0.34, 0.44, 0.50, 0.56, 0.61, 0.66, 0.70, 0.74, 1.0]}
        style={StyleSheet.absoluteFill}
      />

      <Animated.View
        className="flex-1 w-full h-full justify-between items-center px-6"
        style={{
          paddingTop: `${Math.round((insets.top / screenHeight) * 100 + 8)}%`,
          paddingBottom: `${Math.round((insets.bottom / screenHeight) * 100 + 4)}%`,
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }}
      >
        <View className="w-full items-center justify-center mt-12">
          <KwismoLogo size={responsiveLogoSize} variant="white" />
        </View>

        <View className="w-full items-center mb-20">
          <View className="w-full">
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => setModalVisible(true)}
              className="w-full h-13 bg-white rounded-md flex-row items-center justify-between px-5 shadow-md shadow-black/15 elevation-4"
              style={{ height: 52 }}
            >
              <Text
                className={`font-medium text-body-md ${
                  currentOption ? 'text-slate-600' : 'text-slate-400'
                }`}
              >
                {currentOption ? currentOption.label : t('common.selectLanguage')}
              </Text>

              <Icon
                name="eva:arrow-down-fill"
                size={18}
                color="#B4C4DD"
              />
            </TouchableOpacity>

            {selectedLang && (
              <Animated.View className="w-full mt-4">
                <TouchableOpacity
                  activeOpacity={0.88}
                  onPress={handleContinue}
                  className="w-full h-13 bg-brand-green rounded-full flex-row items-center justify-center shadow-md shadow-brand-green/30 elevation-4"
                  style={{ height: 52 }}
                >
                  <Text className="font-headline text-body-lg text-white">
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

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable
          className="flex-1 w-full h-full bg-black/45 justify-end"
          onPress={() => setModalVisible(false)}
        >
          <View className="bg-white rounded-t-lg p-6 pb-10">
            <View className="flex-row items-center justify-between mb-5">
              <Text className="font-h3 text-h6 text-gray-900">
                {t('common.selectLanguage')}
              </Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Icon name="solar:close-circle-bold" size={24} color="#94A3B8" />
              </TouchableOpacity>
            </View>

            {LANGUAGES.map((item) => {
              const isSelected = item.code === selectedLang;
              return (
                <TouchableOpacity
                  key={item.code}
                  activeOpacity={0.7}
                  onPress={() => handleSelectLanguage(item.code)}
                  className={`flex-row items-center justify-between py-3.5 px-4 rounded-md mb-3 ${
                    isSelected ? 'bg-brand-green/10 border border-brand-green' : 'bg-gray-100'
                  }`}
                >
                  <View className="flex-row items-center">
                    <Text className="text-2xl mr-3.5">{item.flag}</Text>
                    <Text
                      className={`text-body-lg ${
                        isSelected ? 'font-headline text-brand-green' : 'font-medium text-gray-700'
                      }`}
                    >
                      {item.nativeName}
                    </Text>
                  </View>

                  {isSelected && (
                    <Icon
                      name="solar:check-circle-bold"
                      size={22}
                      color={colors.green}
                    />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}
