import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';

interface ScreenStateProps {
  loading?: boolean;
  error?: string | null;
  children: React.ReactNode;
}

export const ScreenState: React.FC<ScreenStateProps> = ({ loading, error, children }) => {
  if (loading) {
    return (
      <View className="flex-1 justify-center items-center p-5">
        <ActivityIndicator size="large" color="#25B46E" />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center p-5">
        <Text className="text-red-600 text-sm text-center font-medium">{error}</Text>
      </View>
    );
  }

  return <>{children}</>;
};

export default ScreenState;
