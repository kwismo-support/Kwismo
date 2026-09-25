import { Platform, PermissionsAndroid } from 'react-native';
import * as Contacts from 'expo-contacts/legacy';
import * as Notifications from 'expo-notifications';

export interface PermissionStatusResult {
  hasAll: boolean;
  contacts: boolean;
  notifications: boolean;
  callLog: boolean;
  missingPermissions: string[];
}

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
      const notifRes = await Notifications.getPermissionsAsync();
      notificationsGranted = notifRes.status === 'granted' || notifRes.granted;
      if (!notificationsGranted) missingPermissions.push('notifications');
    } catch {
      notificationsGranted = false;
      missingPermissions.push('notifications');
    }

    if (Platform.OS === 'android') {
      try {
        const hasReadCallLog = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.READ_CALL_LOG
        );
        const hasReadPhoneState = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.READ_PHONE_STATE
        );
        callLogGranted = hasReadCallLog && hasReadPhoneState;
        if (!callLogGranted) missingPermissions.push('callLog');
      } catch {
        callLogGranted = false;
        missingPermissions.push('callLog');
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
      await Notifications.requestPermissionsAsync();
    } catch {}

    if (Platform.OS === 'android') {
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
