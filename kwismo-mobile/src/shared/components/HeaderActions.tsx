import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Pressable,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { Icon } from '../ui/Icon';
import { useAppTheme } from '../hooks/useAppTheme';
import { useThemeStore, ThemePreference } from '../store/themeStore';
import { colors, fonts } from '../../styles/tokens';
import { scaleFont } from '../lib/responsive';

interface HeaderActionsProps {
  unreadNotificationsCount?: number;
  iconColor?: string;
  onPressNotifications?: () => void;
}

export const HeaderActions: React.FC<HeaderActionsProps> = ({
  unreadNotificationsCount = 0,
  iconColor = colors.white,
  onPressNotifications,
}) => {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const { isDark, colors: themeColors } = useAppTheme();
  const { userThemePreference, setTheme } = useThemeStore();
  const [modalVisible, setModalVisible] = useState(false);

  const hasUnread = unreadNotificationsCount > 0;

  const handleLanguageChange = (lang: string) => {
    i18n.changeLanguage(lang);
  };

  const handleNotificationsPress = () => {
    if (onPressNotifications) {
      onPressNotifications();
    } else {
      router.push('/(app)/profile');
    }
  };

  return (
    <View style={styles.container}>
      {/* Cloche de notifications */}
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={handleNotificationsPress}
        style={styles.iconButton}
      >
        <Icon
          name={hasUnread ? 'solar:bell-bold' : 'solar:bell-linear'}
          size={24}
          color={iconColor}
        />
        {hasUnread && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {unreadNotificationsCount > 99 ? '99+' : unreadNotificationsCount}
            </Text>
          </View>
        )}
      </TouchableOpacity>

      {/* 3 points verticaux pour le menu d'options */}
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => setModalVisible(true)}
        style={styles.iconButton}
      >
        <Icon
          name="solar:menu-dots-bold"
          size={24}
          color={iconColor}
        />
      </TouchableOpacity>

      {/* Modal / Menu d'options (Langue & Thème) */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setModalVisible(false)}>
          <Pressable
            onPress={(e) => e.stopPropagation()}
            style={[
              styles.modalContent,
              {
                backgroundColor: themeColors.cardBg,
                borderColor: themeColors.inputBorder,
              },
            ]}
          >
            {/* Header de la modal */}
            <View style={styles.modalHeader}>
              <Text
                style={[
                  styles.modalTitle,
                  { color: themeColors.textPrimary },
                ]}
              >
                {t('profile.preferences')}
              </Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Icon
                  name="solar:close-circle-linear"
                  size={20}
                  color={themeColors.inputPlaceholder}
                />
              </TouchableOpacity>
            </View>

            {/* Section Langue */}
            <Text
              style={[
                styles.sectionLabel,
                { color: themeColors.inputPlaceholder },
              ]}
            >
              {t('profile.language')}
            </Text>
            <View style={styles.optionsRow}>
              <TouchableOpacity
                onPress={() => handleLanguageChange('fr')}
                style={[
                  styles.optionChip,
                  {
                    backgroundColor:
                      i18n.language.startsWith('fr')
                        ? colors.green
                        : isDark
                        ? 'rgba(255,255,255,0.08)'
                        : '#F3F4F6',
                  },
                ]}
              >
                <Text
                  style={[
                    styles.chipText,
                    {
                      color: i18n.language.startsWith('fr')
                        ? colors.white
                        : themeColors.textPrimary,
                    },
                  ]}
                >
                  {t('common.french')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handleLanguageChange('en')}
                style={[
                  styles.optionChip,
                  {
                    backgroundColor:
                      i18n.language.startsWith('en')
                        ? colors.green
                        : isDark
                        ? 'rgba(255,255,255,0.08)'
                        : '#F3F4F6',
                  },
                ]}
              >
                <Text
                  style={[
                    styles.chipText,
                    {
                      color: i18n.language.startsWith('en')
                        ? colors.white
                        : themeColors.textPrimary,
                    },
                  ]}
                >
                  {t('common.english')}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Section Thème : 3 icônes sur une seule ligne réparties équitablement */}
            <Text
              style={[
                styles.sectionLabel,
                { color: themeColors.inputPlaceholder, marginTop: 16 },
              ]}
            >
              {t('profile.darkMode')}
            </Text>
            <View style={styles.themeOptionsRow}>
              {(['light', 'dark', 'system'] as ThemePreference[]).map((mode) => {
                const isSelected = userThemePreference === mode;
                return (
                  <TouchableOpacity
                    key={mode}
                    activeOpacity={0.7}
                    onPress={() => setTheme(mode)}
                    style={[
                      styles.themeIconChip,
                      {
                        backgroundColor: isSelected
                          ? colors.green
                          : isDark
                          ? 'rgba(255,255,255,0.08)'
                          : '#F3F4F6',
                      },
                    ]}
                  >
                    <Icon
                      name={
                        mode === 'light'
                          ? 'solar:sun-2-linear'
                          : mode === 'dark'
                          ? 'solar:moon-linear'
                          : 'solar:laptop-minimalistic-linear'
                      }
                      size={22}
                      color={
                        isSelected ? colors.white : themeColors.textPrimary
                      }
                    />
                  </TouchableOpacity>
                );
              })}
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
};

export default HeaderActions;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 2,
    right: 2,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    fontFamily: fonts.semiBold,
    fontSize: 9,
    color: colors.white,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 70,
    paddingRight: 16,
  },
  modalContent: {
    width: 270,
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  modalTitle: {
    fontFamily: fonts.headlineBold,
    fontSize: scaleFont(15),
    fontWeight: '700',
  },
  sectionLabel: {
    fontFamily: fonts.medium,
    fontSize: scaleFont(12),
    marginBottom: 8,
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  themeOptionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    width: '100%',
  },
  themeIconChip: {
    flex: 1,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  optionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  chipText: {
    fontFamily: fonts.medium,
    fontSize: scaleFont(12),
  },
});
