import { Platform, PermissionsAndroid } from 'react-native';
import * as Contacts from 'expo-contacts/legacy';
import { verifyApi } from '@/features/verify/services/verify.api';
import { PushNotificationService } from '@/shared/services/pushNotificationService';
import { activityHistoryService } from '@/shared/services/activityHistoryService';
import { permissionManager } from '@/shared/services/permissionManager';

export interface CallStateEvent {
  state: 'RINGING' | 'OFFHOOK' | 'IDLE';
  phoneNumber: string;
}

class CallDetectionService {
  private activeCallPhone: string | null = null;
  private wasCallAnswered: boolean = false;
  private isInitialized: boolean = false;
  private knownContactsMap: Record<string, boolean> = {};

  async init(): Promise<void> {
    if (this.isInitialized) return;
    this.isInitialized = true;

    await this.refreshKnownContacts();
    this.startCallMonitoring();
  }

  private async refreshKnownContacts(): Promise<void> {
    try {
      const { status } = await Contacts.getPermissionsAsync();
      if (status === 'granted') {
        const { data } = await Contacts.getContactsAsync({
          fields: [Contacts.Fields.PhoneNumbers],
        });

        if (data && data.length > 0) {
          const map: Record<string, boolean> = {};
          data.forEach((c) => {
            if (c.phoneNumbers) {
              c.phoneNumbers.forEach((p) => {
                if (p.number) {
                  const clean = p.number.replace(/[^0-9]/g, '');
                  if (clean) {
                    map[clean] = true;
                    if (clean.length >= 8) {
                      map[clean.slice(-8)] = true;
                      map[clean.slice(-9)] = true;
                    }
                  }
                }
              });
            }
          });
          this.knownContactsMap = map;
        }
      }
    } catch {}
  }

  private isUnknownNumber(phoneNumber: string): boolean {
    const clean = phoneNumber.replace(/[^0-9]/g, '');
    if (!clean) return false;

    if (this.knownContactsMap[clean]) return false;
    if (clean.length >= 8 && (this.knownContactsMap[clean.slice(-8)] || this.knownContactsMap[clean.slice(-9)])) {
      return false;
    }
    return true;
  }

  public async handleCallEvent(event: CallStateEvent): Promise<void> {
    const { state, phoneNumber } = event;
    if (!phoneNumber) return;

    const cleanPhone = phoneNumber.trim();

    if (state === 'RINGING' || state === 'OFFHOOK') {
      this.activeCallPhone = cleanPhone;

      if (state === 'OFFHOOK') {
        this.wasCallAnswered = true;
      }

      await this.refreshKnownContacts();
      if (this.isUnknownNumber(cleanPhone)) {
        await this.checkAndNotifyUnknownCall(cleanPhone);
      }
    } else if (state === 'IDLE') {
      const targetPhone = this.activeCallPhone || cleanPhone;

      if (this.wasCallAnswered && targetPhone) {
        await this.triggerPostCallSurveyNotification(targetPhone);
      }

      this.activeCallPhone = null;
      this.wasCallAnswered = false;
    }
  }

  private async checkAndNotifyUnknownCall(phone: string): Promise<void> {
    try {
      const res = await verifyApi.checkNumber(phone);

      const isThreat =
        res.success &&
        res.data &&
        (res.data.statut === 'frauduleux' ||
          res.data.statut === 'suspect' ||
          Boolean(res.data.riskScore && res.data.riskScore > 50));

      if (isThreat) {
        const alertTitle = `Appel suspect détecté : ${phone}`;
        const alertBody = `Attention ! Le numéro inconnu ${phone} a fait l'objet de signalements de fraude. Soyez très vigilant.`;

        await PushNotificationService.sendLocalNotification(
          alertTitle,
          alertBody,
          { route: '/(app)/verify', phone },
          true
        );

        await activityHistoryService.addActivity({
          phone,
          type: 'common.suspectCallDetected',
          category: 'threats',
          status: 'common.detected',
          badgeType: 'red',
        });
      } else {
        await activityHistoryService.addActivity({
          phone,
          type: 'common.incomingCall',
          category: 'verified',
          status: 'common.verified',
          badgeType: 'green',
        });
      }
    } catch {
      await activityHistoryService.addActivity({
        phone,
        type: 'common.incomingCall',
        category: 'verified',
        status: 'common.verified',
        badgeType: 'green',
      });
    }
  }

  private async triggerPostCallSurveyNotification(phone: string): Promise<void> {
    try {
      const title = `Enquête suite à votre appel`;
      const body = `Avez-vous décelé une tentative d'arnaque lors de votre appel avec ${phone} ? Cliquez ici pour répondre ou faire un signalement.`;

      await PushNotificationService.sendLocalNotification(
        title,
        body,
        { route: '/(app)/survey', phone },
        false
      );
    } catch {}
  }

  private startCallMonitoring(): void {
    if (Platform.OS !== 'android') return;

    try {
      let CallDetector: any = null;
      try {
        CallDetector = require('react-native-call-detection');
      } catch {}

      if (CallDetector && typeof CallDetector === 'function') {
        const detector = new CallDetector(
          (event: string, phoneNumber: string) => {
            let state: 'RINGING' | 'OFFHOOK' | 'IDLE' = 'IDLE';
            if (event === 'Incoming' || event === 'Ringing') {
              state = 'RINGING';
            } else if (event === 'Offhook' || event === 'Connected') {
              state = 'OFFHOOK';
            } else if (event === 'Disconnected' || event === 'Idle') {
              state = 'IDLE';
            }
            this.handleCallEvent({ state, phoneNumber });
          },
          true,
          () => {},
          {
            title: 'Permission d\'accès aux appels',
            message: 'Kwismo nécessite l\'accès aux appels pour détecter les numéros suspects en temps réel.',
          }
        );
      }
    } catch {}
  }
}

export const callDetectionService = new CallDetectionService();
