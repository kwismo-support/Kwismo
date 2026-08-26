import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import '../src/locales/i18n'; // Initialize i18n support

// Keep native splash screen visible while loading resources
SplashScreen.preventAutoHideAsync().catch(() => {
  /* ignore */
});

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    'MontserratAlternates-Bold': require('../assets/fonts/Aptos-Bold.ttf'), // Fallback / bundled font
    'MontserratAlternates-Medium': require('../assets/fonts/Aptos-Medium.ttf'),
    'MontserratAlternates-Regular': require('../assets/fonts/Aptos-Regular.ttf'),
    'Ageo-Regular': require('../assets/fonts/Aptos-Regular.ttf'),
    'Ageo-Medium': require('../assets/fonts/Aptos-Medium.ttf'),
    'Ageo-SemiBold': require('../assets/fonts/Aptos-SemiBold.ttf'),
    'Ageo-Bold': require('../assets/fonts/Aptos-Bold.ttf'),
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync().catch(() => {
        /* ignore */
      });
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'fade',
          contentStyle: { backgroundColor: '#161E33' },
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(app)" options={{ headerShown: false }} />
      </Stack>
    </SafeAreaProvider>
  );
}
