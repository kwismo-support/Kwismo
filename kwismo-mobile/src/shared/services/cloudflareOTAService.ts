import { Platform } from 'react-native';
import * as Updates from 'expo-updates';

const CLOUDFLARE_OTA_ENDPOINT = process.env.EXPO_PUBLIC_CLOUDFLARE_OTA_URL || 'https://kwismo-mobile-ota-worker.kwismo.workers.dev';
const APP_ENV = process.env.EXPO_PUBLIC_APP_ENV || 'preview';

export interface CloudflareOTAManifest {
  version: string;
  bundleUrl: string;
  assets: string[];
  publishedAt: number;
}

export const cloudflareOTAService = {
  async checkForCloudflareUpdate(): Promise<CloudflareOTAManifest | null> {
    if (__DEV__ || Platform.OS === 'web') return null;

    try {
      const response = await fetch(`${CLOUDFLARE_OTA_ENDPOINT}/api/check-update?branch=${APP_ENV}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) return null;

      const data: CloudflareOTAManifest = await response.json();
      return data;
    } catch {
      return null;
    }
  },

  async applyUpdateSilently(): Promise<boolean> {
    if (__DEV__ || Platform.OS === 'web') return false;

    try {
      const easCheck = await Updates.checkForUpdateAsync();
      if (easCheck.isAvailable) {
        await Updates.fetchUpdateAsync();
        await Updates.reloadAsync();
        return true;
      }
    } catch {}

    try {
      const cfManifest = await this.checkForCloudflareUpdate();
      if (cfManifest && cfManifest.publishedAt) {
        const lastApplied = Number((Updates as any).updateId || (Updates as any).currentlyRunning?.updateId || 0);
        if (cfManifest.publishedAt > lastApplied) {
          await Updates.fetchUpdateAsync();
          await Updates.reloadAsync();
          return true;
        }
      }
    } catch {}

    return false;
  },
};
