import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { callDetectionApi, CallLogItem } from './callDetection.api';
import { storage } from '@/shared/services/storage';
import { getDeviceContacts } from '@/shared/lib/contactsService';

const RECENT_CALLS_KEY = 'kwismo_recent_call_log_v1';

export interface SavedCallLog {
  phone: string;
  rawPhone: string;
  timestamp: number;
  duration: string;
  dateStr: string;
  type: 'incoming' | 'outgoing' | 'missed';
  isUnknown: boolean;
  statut: string;
  riskScore: number;
}

export const callListenerService = {
  async initListener(onIncomingCallAlert?: (call: CallLogItem) => void) {
    try {
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: true,
          shouldShowBanner: true,
          shouldShowList: true,
        }),
      });
    } catch {}
  },

  async recordCallEnded(phoneNumber: string, durationSeconds: number = 25): Promise<SavedCallLog> {
    const cleanNumber = phoneNumber.replace(/[\s\-()]/g, '');
    const now = Date.now();
    const durationStr = `${durationSeconds}s`;
    const dateStr = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

    let isUnknown = true;
    try {
      const { contacts } = await getDeviceContacts();
      const match = contacts.find((c) => c.phone.replace(/[\s\-()]/g, '').includes(cleanNumber));
      if (match) {
        isUnknown = false;
      }
    } catch {}

    const evalResult = await callDetectionApi.evaluateIncomingCall(cleanNumber);

    const callRecord: SavedCallLog = {
      phone: phoneNumber.startsWith('+') ? phoneNumber : `+237 ${phoneNumber}`,
      rawPhone: cleanNumber,
      timestamp: now,
      duration: durationStr,
      dateStr,
      type: 'incoming',
      isUnknown,
      statut: evalResult.statut,
      riskScore: evalResult.risk_score,
    };

    try {
      const existingStr = await storage.getItem(RECENT_CALLS_KEY);
      let list: SavedCallLog[] = existingStr ? JSON.parse(existingStr) : [];
      list = [callRecord, ...list.filter((c) => c.rawPhone !== cleanNumber)].slice(0, 50);
      await storage.setItem(RECENT_CALLS_KEY, JSON.stringify(list));
    } catch {}

    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Appel terminé — Kwismo Anti-Arnaque 🛡️",
          body: `Appel avec ${callRecord.phone}. Ce numéro est-il suspect ? Touchez pour vérifier ou signaler.`,
          data: { route: '/(app)/report', phone: callRecord.phone },
        },
        trigger: null,
      });
    } catch {}

    return callRecord;
  },

  async getRecentUnknownCalls(maxAgeMinutes: number = 10): Promise<SavedCallLog[]> {
    try {
      const existingStr = await storage.getItem(RECENT_CALLS_KEY);
      let list: SavedCallLog[] = existingStr ? JSON.parse(existingStr) : [];
      const cutoff = Date.now() - maxAgeMinutes * 60 * 1000;

      let contactsPhoneSet = new Set<string>();
      try {
        const { contacts } = await getDeviceContacts();
        contacts.forEach((c) => {
          contactsPhoneSet.add(c.phone.replace(/[\s\-()]/g, ''));
        });
      } catch {}

      return list.filter((item) => {
        const isRecent = item.timestamp >= cutoff;
        const clean = item.rawPhone.replace(/[\s\-()]/g, '');
        const isKnownContact = Array.from(contactsPhoneSet).some((p) => p.includes(clean) || clean.includes(p));
        return isRecent && !isKnownContact;
      });
    } catch {
      return [];
    }
  },
};
