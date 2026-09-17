import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Icon } from '@/shared/ui/Icon';
import { HeaderSearchModal } from '@/shared/components/HeaderSearchModal';

interface HeaderActionsProps {
  unreadNotificationsCount?: number;
  iconColor?: string;
  onPressNotifications?: () => void;
  showBell?: boolean;
}

export const HeaderActions: React.FC<HeaderActionsProps> = ({
  unreadNotificationsCount = 0,
  iconColor = '#FFFFFF',
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
    <View className="flex-row items-center gap-2">
      {showBell && (
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleNotificationsPress}
          className="wx-9 hx-9 items-center justify-center relative"
        >
          <Icon
            name={hasUnread ? 'solar:bell-bold' : 'f7:bell'}
            size={24}
            color={iconColor}
          />
          {hasUnread && (
            <View className="absolute top-0.5 right-0.5 min-w-[16px] h-4 rounded-full bg-red-500 items-center justify-center px-1">
              <Text className="font-montserrat-bold text-[9px] text-white font-bold">
                {unreadNotificationsCount > 99 ? '99+' : unreadNotificationsCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      )}

      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => setSearchModalVisible(true)}
        className="wx-9 hx-9 items-center justify-center relative"
      >
        <Icon name="bitcoin-icons:search-filled" size={24} color={iconColor} />
      </TouchableOpacity>

      <HeaderSearchModal
        visible={searchModalVisible}
        onClose={() => setSearchModalVisible(false)}
      />
    </View>
  );
};

export default HeaderActions;
