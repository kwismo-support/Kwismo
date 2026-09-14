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
  useWindowDimensions,
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
    <View className="flex-1 w-full h-full bg-brand-green relative" style={styles.container}>
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
        className="flex-1 w-full h-full justify-between items-center"
        style={[
          styles.contentContainer,
          {
            paddingHorizontal: '6%',
            paddingTop: `${Math.round((insets.top / screenHeight) * 100 + 8)}%`,
            paddingBottom: `${Math.round((insets.bottom / screenHeight) * 100 + 4)}%`,
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <View className="w-full items-center justify-center" style={styles.logoUpperSection}>
          <KwismoLogo size={responsiveLogoSize} variant="white" />
        </View>

        <View className="w-full items-center" style={styles.lowerInputSection}>
          <View className="w-full" style={styles.cardWrapper}>
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => setModalVisible(true)}
              className="w-full bg-white rounded-[14px] flex-row items-center justify-between"
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

            {selectedLang && (
              <Animated.View className="w-full" style={styles.continueButtonWrapper}>
                <TouchableOpacity
                  activeOpacity={0.88}
                  onPress={handleContinue}
                  className="w-full bg-brand-green rounded-[26px] flex-row items-center justify-center"
                  style={styles.continueButton}
                >
                  <Text className="font-bold text-[16px] text-white" style={styles.continueButtonText}>
                    {t('common.continue', 'Continuer')}
                  </Text>
                  <Icon
                    name="solar:arrow-right-linear"
                    size={20}
                    color={colors.white}
                    style={{ marginLeft: '2%' }}
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
          className="flex-1 bg-black/45 justify-end"
          style={styles.modalOverlay}
          onPress={() => setModalVisible(false)}
        >
          <View className="bg-white rounded-t-[24px]" style={styles.modalContent}>
            <View className="flex-row items-center justify-between" style={styles.modalHeader}>
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
                  className={`flex-row items-center justify-between rounded-[14px] ${
                    isSelected ? 'bg-brand-green/10 border border-brand-green' : 'bg-gray-100'
                  }`}
                  style={[
                    styles.languageItem,
                    isSelected && styles.languageItemSelected,
                  ]}
                >
                  <View className="flex-row items-center" style={styles.languageItemLeft}>
                    <Text className="text-[24px]" style={styles.itemFlag}>{item.flag}</Text>
                    <Text
                      className={`text-[16px] ${isSelected ? 'font-bold text-brand-green' : 'text-gray-700'}`}
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
    width: '100%',
    height: '100%',
    backgroundColor: colors.green,
    position: 'relative',
  },
  contentContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'space-between',
  },
  logoUpperSection: {
    width: '100%',
    marginTop: '12%',
  },
  lowerInputSection: {
    width: '100%',
    marginBottom: '22%',
  },
  cardWrapper: {
    width: '100%',
  },
  selectorCard: {
    width: '100%',
    height: 52,
    paddingHorizontal: '5%',
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
    marginTop: '4%',
  },
  continueButton: {
    width: '100%',
    height: 52,
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
    width: '100%',
    height: '100%',
  },
  modalContent: {
    padding: '6%',
    paddingBottom: '10%',
  },
  modalHeader: {
    marginBottom: '5%',
  },
  modalTitle: {
    fontFamily: fonts.h3,
  },
  languageItem: {
    paddingVertical: '3.5%',
    paddingHorizontal: '4%',
    marginBottom: '2.5%',
  },
  languageItemSelected: {},
  languageItemLeft: {},
  itemFlag: {
    marginRight: '3.5%',
  },
  itemLabel: {
    fontFamily: fonts.medium,
  },
  itemLabelSelected: {
    fontFamily: fonts.headlineBold,
  },
});
