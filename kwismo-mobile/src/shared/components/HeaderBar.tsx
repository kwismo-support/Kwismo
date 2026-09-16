import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from '@/shared/ui/Icon';
import { HeaderActions } from '@/shared/components/HeaderActions';
import { colors } from '@/styles/tokens';

interface HeaderBarProps {
  title?: string;
  subtitle?: string;
  isHome?: boolean;
  showBack?: boolean;
  onBack?: () => void;
  unreadNotificationsCount?: number;
  onPressNotifications?: () => void;
  backgroundColor?: string;
  textColor?: string;
  rightAction?: React.ReactNode;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  title,
  subtitle,
  isHome = false,
  showBack = false,
  onBack,
  unreadNotificationsCount = 0,
  onPressNotifications,
  backgroundColor = colors.green,
  textColor = colors.white,
  rightAction,
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
      style={{
        backgroundColor,
        paddingTop: Math.max(insets.top + 8, 18),
        paddingBottom: isHome ? 75 : 16,
      }}
      className="px-4 pb-3 relative overflow-hidden"
    >
      <View className="absolute inset-0 overflow-hidden opacity-20 pointer-events-none">
        <View className="absolute -top-10 -right-5 w-55 h-55 rounded-full border-[26px] border-white -rotate-25 scale-x-140" />
      </View>

      <View className="flex-row items-center justify-between min-h-7">
        {showBack ? (
          <>
            <View className="w-10 flex-row items-center justify-start">
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={handleBack}
                className="p-1.5 -ml-1"
              >
                <Icon name="solar:arrow-left-linear" color={textColor} size={24} />
              </TouchableOpacity>
            </View>

            <View className="flex-1" />

            <View className="w-10 flex-row items-center justify-end">
              {rightAction ? (
                rightAction
              ) : (
                <HeaderActions
                  unreadNotificationsCount={unreadNotificationsCount}
                  iconColor={textColor}
                  onPressNotifications={onPressNotifications}
                  showBell={false}
                />
              )}
            </View>
          </>
        ) : (
          <>
            <View className="flex-1 justify-center">
              {isHome ? (
                <Text style={{ color: textColor }} className="font-montserrat-bold text-2xl font-h1 tracking-wider">
                  KWISMO
                </Text>
              ) : (
                <Text numberOfLines={1} style={{ color: textColor }} className="font-montserrat-bold text-xl font-h1">
                  {title}
                </Text>
              )}
            </View>

            <View className="w-18 flex-row items-center justify-end">
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

      {showBack && title && (
        <View className="items-center justify-center pt-2 pb-1">
          <Text
            numberOfLines={1}
            ellipsizeMode="tail"
            style={{ color: textColor }}
            className="font-montserrat-bold text-xl font-bold text-center"
          >
            {title}
          </Text>
        </View>
      )}

      {!showBack && subtitle && (
        <View className="items-center justify-center pt-2 pb-1">
          <Text style={{ color: textColor }} className="font-semibold text-base text-center">
            {subtitle}
          </Text>
        </View>
      )}
    </View>
  );
};
