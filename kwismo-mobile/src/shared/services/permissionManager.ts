import { Platform, PermissionsAndroid } from 'react-native';
import Constants from 'expo-constants';
import * as Contacts from 'expo-contacts/legacy';

export interface PermissionStatusResult {
  hasAll: boolean;
  contacts: boolean;
  notifications: boolean;
  callLog: boolean;
  missingPermissions: string[];
}

let Notifications: any = null;
try {
  Notifications = require('expo-notifications');
} catch {}

const isExpoGo =
  Constants.appOwnership === 'expo' ||
  (Constants as any).executionEnvironment === 'storeClient';

export const permissionManager = {
  async checkPermissions(): Promise<PermissionStatusResult> {
    let contactsGranted = false;
    let notificationsGranted = false;
    let callLogGranted = false;
    const missingPermissions: string[] = [];

    try {
      const contactsRes = await Contacts.getPermissionsAsync();
      contactsGranted = contactsRes.status === 'granted';
      if (!contactsGranted) missingPermissions.push('contacts');
    } catch {
      contactsGranted = false;
      missingPermissions.push('contacts');
    }

    try {
      if (Notifications && typeof Notifications.getPermissionsAsync === 'function') {
        const notifRes = await Notifications.getPermissionsAsync();
        notificationsGranted = notifRes.status === 'granted' || notifRes.granted;
      } else {
        notificationsGranted = true;
      }
      if (!notificationsGranted) missingPermissions.push('notifications');
    } catch {
      notificationsGranted = true;
    }

    if (Platform.OS === 'android') {
      try {
        if (isExpoGo) {
          callLogGranted = true;
        } else {
          const hasReadCallLog = await PermissionsAndroid.check(
            PermissionsAndroid.PERMISSIONS.READ_CALL_LOG
          );
          const hasReadPhoneState = await PermissionsAndroid.check(
            PermissionsAndroid.PERMISSIONS.READ_PHONE_STATE
          );
          callLogGranted = hasReadCallLog || hasReadPhoneState;
          if (!callLogGranted) missingPermissions.push('callLog');
        }
      } catch {
        callLogGranted = true;
      }
    } else {
      callLogGranted = true;
    }

    const hasAll = contactsGranted && notificationsGranted && callLogGranted;

    return {
      hasAll,
      contacts: contactsGranted,
      notifications: notificationsGranted,
      callLog: callLogGranted,
      missingPermissions,
    };
  },

  async requestAllPermissions(): Promise<PermissionStatusResult> {
    try {
      await Contacts.requestPermissionsAsync();
    } catch {}

    try {
      if (Notifications && typeof Notifications.requestPermissionsAsync === 'function') {
        await Notifications.requestPermissionsAsync();
      }
    } catch {}

    if (Platform.OS === 'android' && !isExpoGo) {
      try {
        await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.READ_CALL_LOG,
          PermissionsAndroid.PERMISSIONS.READ_PHONE_STATE,
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
        ]);
      } catch {}
    }

    return this.checkPermissions();
  },
};
