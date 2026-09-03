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
        {showBack ? (
          /* Page secondaire : Retour à gauche, Titre au milieu, Actions (sans cloche) à droite */
          <>
            <View style={[styles.sideColLeft, { width: 40 }]}>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={handleBack}
                style={styles.backBtn}
              >
                <Icon name="solar:arrow-left-linear" color={textColor} size={24} />
              </TouchableOpacity>
            </View>

            <View style={styles.centerCol}>
              <Text
                numberOfLines={1}
                ellipsizeMode="tail"
                style={[styles.screenTitleCenter, { color: textColor }]}
              >
                {title}
              </Text>
            </View>

            <View style={[styles.sideColRight, { width: 40 }]}>
              <HeaderActions
                unreadNotificationsCount={unreadNotificationsCount}
                iconColor={textColor}
                onPressNotifications={onPressNotifications}
                showBell={false}
              />
            </View>
          </>
        ) : (
          /* Page principale : Titre à gauche, Actions (avec cloche) à droite */
          <>
            <View style={styles.mainLeftCol}>
              {isHome ? (
                <Text style={[styles.brandTitle, { color: textColor }]}>KWISMO</Text>
              ) : (
                <Text numberOfLines={1} style={[styles.mainPageTitle, { color: textColor }]}>
                  {title}
                </Text>
              )}
            </View>

            <View style={styles.sideColRight}>
              <HeaderActions
                unreadNotificationsCount={unreadNotificationsCount}
                iconColor={textColor}
                onPressNotifications={onPressNotifications}
                showBell={true}
              />
            </View>
          </>
        )}
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
  sideColLeft: {
    width: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  sideColRight: {
    width: 72,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  centerCol: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainLeftCol: {
    flex: 1,
    justifyContent: 'center',
  },
  backBtn: {
    padding: 6,
    marginLeft: -4,
  },
  brandTitle: {
    fontFamily: fonts.headlineBold,
    fontSize: scaleFont(22),
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  mainPageTitle: {
    fontFamily: fonts.headlineBold,
    fontSize: scaleFont(20),
    fontWeight: '800',
  },
  screenTitleCenter: {
    fontFamily: fonts.headlineBold,
    fontSize: scaleFont(18),
    fontWeight: '700',
    textAlign: 'center',
  },
});
