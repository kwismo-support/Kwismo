import { Platform } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { callDetectionApi, CallLogItem } from './callDetection.api';
import { storage } from '@/shared/services/storage';
import { getDeviceContacts } from '@/shared/lib/contactsService';
import { PushNotificationService } from '@/shared/services/pushNotificationService';
import { activityHistoryService } from '@/shared/services/activityHistoryService';

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
    console.log(`\x1b[36m[CALL LISTENER INIT]\x1b[0m Initializing Call Listener Service and Push Notifications...`);
    try {
      await PushNotificationService.requestPermissions();
      console.log(`\x1b[32m[CALL LISTENER INIT]\x1b[0m Listener initialized successfully.`);
    } catch (err) {
      console.warn(`\x1b[31m[CALL LISTENER INIT WARN]\x1b[0m Error:`, err);
    }
  },

  async recordCallEnded(phoneNumber: string, durationSeconds: number = 25): Promise<SavedCallLog> {
    console.log(`\x1b[33m[CALL DETECTION — INCOMING CALL ENDED]\x1b[0m Phone Number: "${phoneNumber}", Duration: ${durationSeconds}s`);
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
        console.log(`\x1b[36m[CALL DETECTION CONTACT MATCH]\x1b[0m Contact matched: "${match.name}"`);
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
      console.log(`\x1b[32m[CALL DETECTION SAVED]\x1b[0m Call record saved:`, callRecord);
    } catch {}

    try {
      await activityHistoryService.addActivity({
        phone: callRecord.phone,
        type: 'common.incomingCall',
        category: 'threats',
        status: evalResult.is_scam ? 'common.detected' : 'common.verified',
        badgeType: evalResult.is_scam ? 'red' : 'green',
      });
    } catch {}

    try {
      await PushNotificationService.sendLocalNotification(
        "Fin d'appel récent — Kwismo",
        `Appel avec ${callRecord.phone}. Ce numéro est-il suspect ? Touchez pour vérifier ou signaler.`,
        { route: '/(app)/report', phone: callRecord.phone }
      );
    } catch {}

    try {
      const { usePostCallStore } = await import('@/features/call-detection/store/postCallStore');
      usePostCallStore.getState().showPostCallPrompt(callRecord.phone);
    } catch {}

    return callRecord;
  },

  async checkClipboardForUnknownCall(): Promise<boolean> {
    try {
      if (!Clipboard || typeof Clipboard.getStringAsync !== 'function') return false;
      const text = await Clipboard.getStringAsync();
      if (!text || typeof text !== 'string') return false;

      const trimmed = text.trim();
      const clean = trimmed.replace(/[\s\-\.\(\)]/g, '');
      // Match phone numbers with optional + and 8 to 15 digits
      const phoneRegex = /^\+?[0-9]{8,15}$/;
      if (!phoneRegex.test(clean)) return false;

      // Do not re-prompt the same number if prompted in the last 10 minutes
      const lastPrompted = await storage.getItem(`kwismo_last_clip_prompt_${clean}`);
      if (lastPrompted && Date.now() - Number(lastPrompted) < 600000) {
        return false;
      }

      // Check against device contacts
      let isKnownContact = false;
      try {
        const { contacts } = await getDeviceContacts();
        isKnownContact = contacts.some((c) => {
          const contactClean = c.phone.replace(/[\s\-\.\(\)]/g, '');
          return contactClean.includes(clean) || clean.includes(contactClean);
        });
      } catch {}

      if (isKnownContact) return false;

      console.log(`\x1b[32m[CALL DETECTION CLIPBOARD DETECTED]\x1b[0m Unknown phone in clipboard: "${clean}"`);
      await storage.setItem(`kwismo_last_clip_prompt_${clean}`, String(Date.now()));

      // Automatically register this call and show post-call prompt modal
      await this.recordCallEnded(clean, 0);
      return true;
    } catch (err) {
      console.warn(`[CALL DETECTION CLIPBOARD] Error checking clipboard:`, err);
      return false;
    }
  },

  async checkAndPromptRecentCall(): Promise<void> {
    try {
      // 1. First check if user copied an unknown phone number from dialer / call log
      const handledFromClipboard = await this.checkClipboardForUnknownCall();
      if (handledFromClipboard) return;

      // 2. Otherwise check if there are recent stored unknown calls
      const recent = await this.getRecentUnknownCalls(10);
      if (recent && recent.length > 0) {
        const latest = recent[0];
        const lastPrompted = await storage.getItem(`kwismo_last_prompt_${latest.rawPhone}`);
        if (!lastPrompted || Date.now() - Number(lastPrompted) > 60000) {
          await storage.setItem(`kwismo_last_prompt_${latest.rawPhone}`, String(Date.now()));
          const { usePostCallStore } = await import('@/features/call-detection/store/postCallStore');
          usePostCallStore.getState().showPostCallPrompt(latest.phone);
        }
      }
    } catch {}
  },

  async getRecentUnknownCalls(maxAgeMinutes: number = 1440): Promise<SavedCallLog[]> {
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
