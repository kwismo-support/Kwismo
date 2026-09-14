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
  { code: 'fr', label: 'Français', nativeName: 'Français (FR)', flag: '🇫🇷' },
  { code: 'en', label: 'English', nativeName: 'English (US)', flag: '🇬🇧' },
];

export default function LanguageSelectionScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t, i18n } = useTranslation();

  const [selectedLang, setSelectedLang] = useState<string>(i18n.language || 'fr');
  const [modalVisible, setModalVisible] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 700,
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

  const currentOption = LANGUAGES.find((l) => l.code === selectedLang) || LANGUAGES[0];

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Full screen gradient background matching mockup */}
      <LinearGradient
        colors={[
          '#32B07F', // Emerald / Prairie Green at top
          '#1C4035', // Dark green transition
          '#162822', // Dark teal center under logo
          '#3B4E47', // Muted slate transition
          '#91A49E', // Light soft fading greyish green
          '#FFFFFF', // Pure white bottom
        ]}
        locations={[0, 0.28, 0.48, 0.68, 0.86, 1.0]}
        style={StyleSheet.absoluteFill}
      />

      <Animated.View
        style={[
          styles.contentContainer,
          {
            paddingTop: insets.top + 40,
            paddingBottom: Math.max(insets.bottom + 32, 48),
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        {/* Centered Kwismo Logo */}
        <View style={styles.logoSection}>
          <KwismoLogo size={180} variant="white" />
        </View>

        {/* Lower Selector & Continue Action Section */}
        <View style={styles.bottomSection}>
          <Text style={styles.selectorHintText}>
            {t('common.selectLanguage', 'Sélectionner la langue')}
          </Text>

          {/* White Card Selector Input */}
          <TouchableOpacity
            activeOpacity={0.88}
            onPress={() => setModalVisible(true)}
            style={styles.selectorCard}
          >
            <View style={styles.selectorLeft}>
              <Text style={styles.flagIcon}>{currentOption.flag}</Text>
              <Text style={styles.selectorText}>{currentOption.label}</Text>
            </View>
            <Icon
              name="solar:alt-arrow-down-linear"
              size={20}
              color="#94A3B8"
            />
          </TouchableOpacity>

          {/* Continuer / Continue Button */}
          {selectedLang && (
            <Animated.View style={styles.continueButtonWrapper}>
              <TouchableOpacity
                activeOpacity={0.88}
                onPress={handleContinue}
                style={styles.continueButton}
              >
                <Text style={styles.continueButtonText}>
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
      </Animated.View>

      {/* Language Picker Bottom Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
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
                  style={[
                    styles.languageItem,
                    isSelected && styles.languageItemSelected,
                  ]}
                >
                  <View style={styles.languageItemLeft}>
                    <Text style={styles.itemFlag}>{item.flag}</Text>
                    <Text
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
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 28,
  },
  logoSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomSection: {
    width: '100%',
    marginBottom: 20,
  },
  selectorHintText: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.85)',
    marginBottom: 8,
    marginLeft: 4,
  },
  selectorCard: {
    width: '100%',
    height: 56,
    backgroundColor: colors.white,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    shadowColor: 'rgba(0, 0, 0, 0.15)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
  },
  selectorLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  flagIcon: {
    fontSize: 22,
    marginRight: 12,
  },
  selectorText: {
    fontFamily: fonts.medium,
    fontSize: 16,
    color: colors.gray900,
  },
  continueButtonWrapper: {
    width: '100%',
    marginTop: 16,
  },
  continueButton: {
    width: '100%',
    height: 54,
    backgroundColor: colors.green,
    borderRadius: 27,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.green,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  continueButtonText: {
    fontFamily: fonts.headlineBold,
    fontSize: 17,
    fontWeight: '700',
    color: colors.white,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  modalTitle: {
    fontFamily: fonts.h3,
    fontSize: 18,
    fontWeight: '700',
    color: colors.gray900,
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    marginBottom: 8,
    backgroundColor: colors.gray100,
  },
  languageItemSelected: {
    backgroundColor: 'rgba(50, 176, 127, 0.12)',
    borderWidth: 1,
    borderColor: colors.green,
  },
  languageItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemFlag: {
    fontSize: 24,
    marginRight: 14,
  },
  itemLabel: {
    fontFamily: fonts.medium,
    fontSize: 16,
    color: colors.gray700,
  },
  itemLabelSelected: {
    fontFamily: fonts.headlineBold,
    fontWeight: '700',
    color: colors.green,
  },
});
