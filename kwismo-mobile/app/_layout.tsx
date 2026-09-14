import React, { useEffect } from 'react';
import { Platform, View, Text } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  useFonts,
  MontserratAlternates_400Regular,
  MontserratAlternates_500Medium,
  MontserratAlternates_600SemiBold,
  MontserratAlternates_700Bold,
} from '@expo-google-fonts/montserrat-alternates';
import * as SplashScreen from 'expo-splash-screen';
import '../src/locales/i18n';
import { ToastContainer } from '../src/shared/ui/Toast';
import { useAuthStore } from '../src/shared/store/authStore';
import { useOTAUpdates } from '../src/shared/utils/useOTAUpdates';

if (typeof globalThis !== 'undefined' && (globalThis as any).ErrorUtils) {
  const previousHandler = (globalThis as any).ErrorUtils.getGlobalHandler();
  (globalThis as any).ErrorUtils.setGlobalHandler((error: any, isFatal?: boolean) => {
    console.error('[APP GLOBAL ERROR]:', error?.message || error);
    if (error?.stack) {
      console.error(error.stack);
    }
    if (previousHandler) {
      previousHandler(error, isFatal);
    }
  });
}

class AppErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean; error: any }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error('[REACT ERROR BOUNDARY]:', error?.message || error);
    if (errorInfo?.componentStack) {
      console.error(errorInfo.componentStack);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <SafeAreaProvider>
          <StatusBar style="light" />
          <View style={{ flex: 1, backgroundColor: '#161E33', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
            <Text style={{ color: '#FF9900', fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>Une erreur s'est produite</Text>
            <Text style={{ color: '#FFFFFF', fontSize: 14, textAlign: 'center' }}>{String(this.state.error?.message || this.state.error)}</Text>
          </View>
        </SafeAreaProvider>
      );
    }
    return this.props.children;
  }
}

if (Platform.OS === 'web' && typeof document !== 'undefined') {
  const fontLinkId = 'kwismo-google-fonts-montserrat';
  if (!document.getElementById(fontLinkId)) {
    const link = document.createElement('link');
    link.id = fontLinkId;
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Montserrat+Alternates:ital,wght@0,400;0,500;0,600;0,700;1,400;1,700&display=swap';
    document.head.appendChild(link);
  }

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

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    'MontserratAlternates-Regular': MontserratAlternates_400Regular,
    'MontserratAlternates-Medium': MontserratAlternates_500Medium,
    'MontserratAlternates-SemiBold': MontserratAlternates_600SemiBold,
    'MontserratAlternates-Bold': MontserratAlternates_700Bold,
    'Ageo-Regular': MontserratAlternates_400Regular,
    'Ageo-Medium': MontserratAlternates_500Medium,
    'Ageo-SemiBold': MontserratAlternates_600SemiBold,
    'Ageo-Bold': MontserratAlternates_700Bold,
  });

  const initializeAuth = useAuthStore((state) => state.initializeAuth);

  useOTAUpdates();

  useEffect(() => {
    if (fontsLoaded) {
      initializeAuth().finally(() => {
        SplashScreen.hideAsync().catch(() => {});
      });
    }
  }, [fontsLoaded, initializeAuth]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <AppErrorBoundary>
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
    </AppErrorBoundary>
  );
}


