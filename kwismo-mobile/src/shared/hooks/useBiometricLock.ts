// Hook personnalisé React pour l'authentification biométrique (Empreinte / FaceID)
import { useCallback, useEffect, useState } from 'react';
import { Platform } from 'react-native';

export type BiometricType = 'face' | 'fingerprint' | 'none';

interface UseBiometricLockReturn {
  isAvailable: boolean;
  isAuthenticated: boolean;
  biometricType: BiometricType;
  authenticate: (reason?: string) => Promise<boolean>;
  lock: () => void;
  checkAvailability: () => Promise<void>;
}

export function useBiometricLock(): UseBiometricLockReturn {
  const [isAvailable, setIsAvailable] = useState<boolean>(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [biometricType, setBiometricType] = useState<BiometricType>('none');

  const checkAvailability = useCallback(async (): Promise<void> => {
    if (Platform.OS === 'web') {
      setIsAvailable(false);
      setBiometricType('none');
      return;
    }

    try {
      const LocalAuth = require('expo-local-authentication');
      const hasHardware = await LocalAuth.hasHardwareAsync();
      if (!hasHardware) {
        setIsAvailable(false);
        setBiometricType('none');
        return;
      }

      const isEnrolled = await LocalAuth.isEnrolledAsync();
      if (!isEnrolled) {
        setIsAvailable(false);
        setBiometricType('none');
        return;
      }

      setIsAvailable(true);
      const supportedTypes = await LocalAuth.supportedAuthenticationTypesAsync();

      if (supportedTypes.includes(LocalAuth.AuthenticationType.FACIAL_RECOGNITION)) {
        setBiometricType('face');
      } else if (supportedTypes.includes(LocalAuth.AuthenticationType.FINGERPRINT)) {
        setBiometricType('fingerprint');
      } else {
        setBiometricType('none');
      }
    } catch {
      setIsAvailable(false);
      setBiometricType('none');
    }
  }, []);

  useEffect(() => {
    checkAvailability();
  }, [checkAvailability]);

  const authenticate = useCallback(
    async (reason?: string): Promise<boolean> => {
      if (Platform.OS === 'web' || !isAvailable) {
        return true;
      }

      try {
        const LocalAuth = require('expo-local-authentication');
        const promptMessage = reason ?? 'Déverrouillez KWISMO pour continuer';

        const result = await LocalAuth.authenticateAsync({
          promptMessage,
          fallbackLabel: 'Utiliser le code PIN',
          cancelLabel: 'Annuler',
          disableDeviceFallback: false,
        });

        if (result.success) {
          setIsAuthenticated(true);
        }
        return result.success;
      } catch {
        return false;
      }
    },
    [isAvailable]
  );

  const lock = useCallback((): void => {
    setIsAuthenticated(false);
  }, []);

  return { isAvailable, isAuthenticated, biometricType, authenticate, lock, checkAvailability };
}
