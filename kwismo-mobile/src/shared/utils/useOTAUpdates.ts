import { useEffect } from 'react';
import { Platform } from 'react-native';
import { cloudflareOTAService } from '@/shared/services/cloudflareOTAService';

export function useOTAUpdates() {
  useEffect(() => {
    async function checkAndApplyUpdatesSilently() {
      if (__DEV__ || Platform.OS === 'web') return;
      try {
        await cloudflareOTAService.applyUpdateSilently();
      } catch {}
    }

    checkAndApplyUpdatesSilently();
  }, []);
}
