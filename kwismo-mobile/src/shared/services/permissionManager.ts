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
      if (Platform.OS === 'android') {
        const nativeContacts = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.READ_CONTACTS
        );
        if (nativeContacts) {
          contactsGranted = true;
        } else {
          const contactsRes = await Contacts.getPermissionsAsync();
          contactsGranted = contactsRes.status === 'granted';
        }
      } else {
        const contactsRes = await Contacts.getPermissionsAsync();
        contactsGranted = contactsRes.status === 'granted';
      }
    } catch {
      contactsGranted = false;
    }
    if (!contactsGranted) missingPermissions.push('contacts');

    try {
      if (Notifications && typeof Notifications.getPermissionsAsync === 'function') {
        const notifRes = await Notifications.getPermissionsAsync();
        notificationsGranted = notifRes.status === 'granted' || notifRes.granted === true;
      } else {
        notificationsGranted = true;
      }
      if (Platform.OS === 'android' && Platform.Version >= 33) {
        const nativeNotif = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
        );
        if (nativeNotif) notificationsGranted = true;
      }
    } catch {
      notificationsGranted = true;
    }
    if (!notificationsGranted) missingPermissions.push('notifications');

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
        }
      } catch {
        callLogGranted = true;
      }
    } else {
      callLogGranted = true;
    }
    if (!callLogGranted) missingPermissions.push('callLog');

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
      if (Platform.OS === 'android') {
        try {
          await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.READ_CONTACTS);
        } catch {}
      }
      await Contacts.requestPermissionsAsync();
    } catch {}

    try {
      if (Notifications && typeof Notifications.requestPermissionsAsync === 'function') {
        await Notifications.requestPermissionsAsync();
      }
    } catch {}

    if (Platform.OS === 'android' && !isExpoGo) {
      try {
        const perms: any[] = [
          PermissionsAndroid.PERMISSIONS.READ_CALL_LOG,
          PermissionsAndroid.PERMISSIONS.READ_PHONE_STATE,
        ];
        if (Platform.Version >= 33) {
          perms.push(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
          perms.push(PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES);
        } else {
          perms.push(PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE);
        }
        await PermissionsAndroid.requestMultiple(perms);
      } catch {}
    }

    return this.checkPermissions();
  },
};

