import React from 'react';
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SurveyScreen() {
  return (
    <SafeAreaView className="flex-1 bg-brand-navy dark:bg-brand-darkBg">
      <View className="flex-1 items-center justify-center p-6">
        <Text className="font-bold text-2xl text-white">Enquête</Text>
      </View>
    </SafeAreaView>
  );
}

