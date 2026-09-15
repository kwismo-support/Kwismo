import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Icon } from '../ui/Icon';
import { colors, fonts } from '../../styles/tokens';
import { HeaderSearchModal } from './HeaderSearchModal';

interface HeaderActionsProps {
  unreadNotificationsCount?: number;
  iconColor?: string;
  onPressNotifications?: () => void;
  showBell?: boolean;
}

export const HeaderActions: React.FC<HeaderActionsProps> = ({
  unreadNotificationsCount = 0,
  iconColor = colors.white,
  onPressNotifications,
  showBell = true,
}) => {
  const router = useRouter();
  const [searchModalVisible, setSearchModalVisible] = useState(false);

  const hasUnread = unreadNotificationsCount > 0;

  const handleNotificationsPress = () => {
    if (onPressNotifications) {
      onPressNotifications();
    } else {
      router.push('/(app)/notifications');
    }
  };

  return (
    <View style={styles.container}>
      {/* Cloche de notifications (positionnée à GAUCHE de la loupe de recherche) */}
      {showBell && (
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleNotificationsPress}
          style={styles.iconButton}
        >
          <Icon
            name={hasUnread ? 'solar:bell-bold' : 'f7:bell'}
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
      )}

      {/* Icône de Recherche (Loupe) positionnée à DROITE */}
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => setSearchModalVisible(true)}
        style={styles.iconButton}
      >
        <Icon name="bitcoin-icons:search-filled" size={24} color={iconColor} />
      </TouchableOpacity>

      {/* Modal de recherche animée */}
      <HeaderSearchModal
        visible={searchModalVisible}
        onClose={() => setSearchModalVisible(false)}
      />
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
});
