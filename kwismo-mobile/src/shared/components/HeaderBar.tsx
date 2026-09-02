import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from '../ui/Icon';
import { HeaderActions } from './HeaderActions';
import { colors, fonts } from '../../styles/tokens';
import { scaleFont } from '../lib/responsive';

interface HeaderBarProps {
  title?: string;
  isHome?: boolean;
  showBack?: boolean;
  onBack?: () => void;
  unreadNotificationsCount?: number;
  onPressNotifications?: () => void;
  backgroundColor?: string;
  textColor?: string;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  title,
  isHome = false,
  showBack = false,
  onBack,
  unreadNotificationsCount = 0,
  onPressNotifications,
  backgroundColor = colors.green,
  textColor = colors.white,
}) => {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor,
          paddingTop: Math.max(insets.top + 8, 18),
        },
      ]}
    >
      <View style={styles.contentRow}>
        {/* Partie gauche : Bouton retour OU Titre / Marque KWISMO */}
        <View style={styles.leftSection}>
          {showBack && (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleBack}
              style={styles.backBtn}
            >
              <Icon name="solar:arrow-left-linear" color={textColor} size={24} />
            </TouchableOpacity>
          )}

          {isHome ? (
            <Text style={[styles.brandTitle, { color: textColor }]}>KWISMO</Text>
          ) : title ? (
            <Text
              numberOfLines={1}
              style={[
                styles.screenTitle,
                { color: textColor },
                showBack && { marginLeft: 8 },
              ]}
            >
              {title}
            </Text>
          ) : null}
        </View>

        {/* Partie droite : Notifications + Actions globales */}
        <View style={styles.rightSection}>
          <HeaderActions
            unreadNotificationsCount={unreadNotificationsCount}
            iconColor={textColor}
            onPressNotifications={onPressNotifications}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 44,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backBtn: {
    padding: 6,
    marginRight: 4,
  },
  brandTitle: {
    fontFamily: fonts.headlineBold,
    fontSize: scaleFont(22),
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  screenTitle: {
    fontFamily: fonts.h6,
    fontSize: scaleFont(18),
    fontWeight: '700',
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
