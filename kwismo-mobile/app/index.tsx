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
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Main Prairie Green to Cloud Dome to Solid White Gradient */}
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
        style={[
          styles.contentContainer,
          {
            paddingTop: insets.top + 36,
            paddingBottom: Math.max(insets.bottom + 24, 36),
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        {/* Upper Logo Section (Elevated higher up at the end of green dome) */}
        <View style={styles.logoUpperSection}>
          <KwismoLogo size={200} variant="white" />
        </View>

        {/* Lower Selector & Action Section (On the white prolonging background) */}
        <View style={styles.lowerInputSection}>
          {/* White Card Selector Input (NO LABEL above) */}
          <View style={styles.cardWrapper}>
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => setModalVisible(true)}
              style={styles.selectorCard}
            >
              <Text
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
    marginTop: 40,
  },
  lowerInputSection: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 40,
  },
  cardWrapper: {
    width: '100%',
    paddingHorizontal: 4,
  },
  selectorCard: {
    width: '100%',
    height: 52,
    backgroundColor: colors.white,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    shadowColor: 'rgba(0, 0, 0, 0.15)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
  },
  selectorText: {
    fontFamily: fonts.medium,
    fontSize: 15,
    color: '#64748B',
  },
  selectorPlaceholder: {
    color: '#A3B1CC',
  },
  continueButtonWrapper: {
    width: '100%',
    marginTop: 16,
  },
  continueButton: {
    width: '100%',
    height: 52,
    backgroundColor: colors.green,
    borderRadius: 26,
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
    fontSize: 16,
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
