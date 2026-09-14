/// <reference types="nativewind/types" />
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Animated,
  Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { StatusBar } from 'expo-status-bar';
import { KwismoLogo } from '../src/shared/components/KwismoLogo';
import { Icon } from '../src/shared/ui/Icon';
import { colors, fonts } from '../src/styles/tokens';

interface LanguageOption {
  code: string;
  label: string;
  nativeName: string;
  flag: string;
}

const LANGUAGES: LanguageOption[] = [
  { code: 'fr', label: 'Français', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'en', label: 'English', nativeName: 'English', flag: '🇬🇧' },
];

export default function LanguageSelectionScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t, i18n } = useTranslation();

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

  return (
    <View className="flex-1 bg-[#32B07F] relative" style={styles.container}>
      <StatusBar style="light" />

      {/* Main Prairie Green to Cloud Dome to Solid White Gradient (Restored as requested) */}
      <LinearGradient
        colors={[
          '#32B07F', // Top: Primary Prairie Green (like onboarding)
          '#32B07F', // 0.22: Primary Green
          '#246E53', // 0.34: Green cloud dome top
          '#1A4638', // 0.44: Green cloud dome center under logo
          '#284F41', // 0.50: Cloud dome base
          '#4D6E62', // 0.56: Soft cloud fog fading (no hard edge)
          '#86A298', // 0.61: Dissolving cloud fog
          '#C6D7D1', // 0.66: Faint green mist
          '#F2F6F5', // 0.70: Soft transition to white
          '#FFFFFF', // 0.74: Pure solid white prolonging to the end
          '#FFFFFF',
        ]}
        locations={[0, 0.22, 0.34, 0.44, 0.50, 0.56, 0.61, 0.66, 0.70, 0.74, 1.0]}
        style={StyleSheet.absoluteFill}
      />

      <Animated.View
        className="flex-1 px-6 justify-between items-center"
        style={[
          styles.contentContainer,
          {
            paddingTop: insets.top + 60, // Lower logo position slightly as requested
            paddingBottom: Math.max(insets.bottom + 24, 36),
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        {/* Upper Logo Section (Lowered slightly down towards middle) */}
        <View className="w-full items-center justify-center mt-6" style={styles.logoUpperSection}>
          <KwismoLogo size={200} variant="white" />
        </View>

        {/* Lower Selector & Action Section (Raised higher up towards logo) */}
        <View className="w-full items-center mb-28" style={styles.lowerInputSection}>
          {/* White Card Selector Input (NO LABEL above) */}
          <View className="w-full px-1" style={styles.cardWrapper}>
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => setModalVisible(true)}
              className="w-full h-[52px] bg-white rounded-[14px] flex-row items-center justify-between px-4"
              style={styles.selectorCard}
            >
              <Text
                className="text-[15px]"
                style={[
                  styles.selectorText,
                  !currentOption && styles.selectorPlaceholder,
                ]}
              >
                {currentOption ? currentOption.label : t('common.selectLanguage', 'Sélectionner la langue')}
              </Text>

              <Icon
                name="eva:arrow-down-fill"
                size={18}
                color="#B4C4DD"
              />
            </TouchableOpacity>

            {/* Continuer / Continue Button directly under input */}
            {selectedLang && (
              <Animated.View className="w-full mt-4" style={styles.continueButtonWrapper}>
                <TouchableOpacity
                  activeOpacity={0.88}
                  onPress={handleContinue}
                  className="w-full h-[52px] bg-[#32B07F] rounded-[26px] flex-row items-center justify-center"
                  style={styles.continueButton}
                >
                  <Text className="font-bold text-[16px] text-white" style={styles.continueButtonText}>
                    {t('common.continue', 'Continuer')}
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

      {/* Language Picker Bottom Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable
          className="flex-1 bg-black/45 justify-end"
          style={styles.modalOverlay}
          onPress={() => setModalVisible(false)}
        >
          <View className="bg-white rounded-t-[24px] p-6 pb-10" style={styles.modalContent}>
            <View className="flex-row items-center justify-between mb-5" style={styles.modalHeader}>
              <Text className="text-[18px] font-bold text-gray-900" style={styles.modalTitle}>
                {t('common.selectLanguage', 'Sélectionner la langue')}
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
                  className={`flex-row items-center justify-between py-3.5 px-4 rounded-[14px] mb-2 ${
                    isSelected ? 'bg-[#32B07F]/10 border border-[#32B07F]' : 'bg-gray-100'
                  }`}
                  style={[
                    styles.languageItem,
                    isSelected && styles.languageItemSelected,
                  ]}
                >
                  <View className="flex-row items-center" style={styles.languageItemLeft}>
                    <Text className="text-[24px] mr-3.5" style={styles.itemFlag}>{item.flag}</Text>
                    <Text
                      className={`text-[16px] ${isSelected ? 'font-bold text-[#32B07F]' : 'text-gray-700'}`}
                      style={[
                        styles.itemLabel,
                        isSelected && styles.itemLabelSelected,
                      ]}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#32B07F',
    position: 'relative',
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
  },
  logoUpperSection: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lowerInputSection: {
    width: '100%',
    alignItems: 'center',
  },
  cardWrapper: {
    width: '100%',
  },
  selectorCard: {
    shadowColor: 'rgba(0, 0, 0, 0.15)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
  },
  selectorText: {
    fontFamily: fonts.medium,
    color: '#64748B',
  },
  selectorPlaceholder: {
    color: '#A3B1CC',
  },
  continueButtonWrapper: {
    width: '100%',
  },
  continueButton: {
    shadowColor: colors.green,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  continueButtonText: {
    fontFamily: fonts.headlineBold,
    color: colors.white,
  },
  modalOverlay: {
    flex: 1,
  },
  modalContent: {},
  modalHeader: {},
  modalTitle: {
    fontFamily: fonts.h3,
  },
  languageItem: {},
  languageItemSelected: {},
  languageItemLeft: {},
  itemFlag: {},
  itemLabel: {
    fontFamily: fonts.medium,
  },
  itemLabelSelected: {
    fontFamily: fonts.headlineBold,
  },
});
