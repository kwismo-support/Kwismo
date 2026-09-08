import React, { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import '../src/locales/i18n'; // Initialize i18n support
import { ToastContainer } from '../src/shared/ui/Toast';

// Inject web Google Fonts link dynamically on Web
if (Platform.OS === 'web' && typeof document !== 'undefined') {
  const fontLinkId = 'kwismo-google-fonts-montserrat';
  if (!document.getElementById(fontLinkId)) {
    const link = document.createElement('link');
    link.id = fontLinkId;
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Montserrat+Alternates:ital,wght@0,400;0,500;0,600;0,700;1,400;1,700&display=swap';
    document.head.appendChild(link);
  }

  // Inject web global CSS for smooth touch-action and user-select disable on slides
  const styleId = 'kwismo-web-global-styles';
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style');
    style.id = styleId;
    style.innerHTML = `
      * {
        -webkit-tap-highlight-color: transparent;
        outline: none !important;
      }
      *:focus, input:focus, textarea:focus, select:focus, [contenteditable]:focus {
        outline: none !important;
        box-shadow: none !important;
      }
      input:-webkit-autofill,
      input:-webkit-autofill:hover,
      input:-webkit-autofill:focus,
      input:-webkit-autofill:active,
      textarea:-webkit-autofill,
      textarea:-webkit-autofill:hover,
      textarea:-webkit-autofill:focus,
      textarea:-webkit-autofill:active,
      select:-webkit-autofill {
        -webkit-box-shadow: 0 0 0 1000px transparent inset !important;
        box-shadow: 0 0 0 1000px transparent inset !important;
        -webkit-text-fill-color: currentColor !important;
        color: inherit !important;
        font-family: 'Ageo', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
        font-size: inherit !important;
        font-weight: inherit !important;
        letter-spacing: inherit !important;
        transition: background-color 5000s ease-in-out 0s !important;
        background-color: transparent !important;
      }
      input:autofill,
      input:autofill:hover,
      input:autofill:focus,
      textarea:autofill {
        -webkit-text-fill-color: currentColor !important;
        color: inherit !important;
        font-family: 'Ageo', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
        font-size: inherit !important;
        font-weight: inherit !important;
        background-color: transparent !important;
      }
      body, html {
        margin: 0;
        padding: 0;
        overflow-x: hidden;
        background-color: #0F2B24;
        font-family: 'Ageo', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }
      h1, h2, h3, h4, h5, h6, .headline {
        font-family: 'Montserrat Alternates', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }
    `;
    document.head.appendChild(style);
  }
}

// Keep native splash screen visible while loading resources
SplashScreen.preventAutoHideAsync().catch(() => {
  /* ignore */
});

export default function RootLayout() {
  const [fontsLoaded] = useState(true);

  useEffect(() => {
    SplashScreen.hideAsync().catch(() => {
      /* ignore */
    });
  }, []);


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
      <ToastContainer />
    </SafeAreaProvider>
  );
}

