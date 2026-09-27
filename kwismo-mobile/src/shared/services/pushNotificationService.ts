import { Platform } from 'react-native';
import { toast } from '@/shared/store/toastStore';

let Notifications: any = null;
try {
  Notifications = require('expo-notifications');
  Notifications?.setNotificationHandler?.({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
} catch {}

export const PushNotificationService = {
  async requestPermissions() {
    if (!Notifications || typeof Notifications.getPermissionsAsync !== 'function') return true;
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        return false;
      }

      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'Kwismo Alerts',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#00A859',
        });
      }
      return true;
    } catch {
      return true;
    }
  },

  async sendLocalNotification(title: string, body: string, data?: Record<string, any>) {
    toast.info(body, title, 5000);

    if (Notifications && typeof Notifications.scheduleNotificationAsync === 'function') {
      try {
        await Notifications.scheduleNotificationAsync({
          content: {
            title,
            body,
            data: data || {},
            sound: 'default',
          },
          trigger: null,
        });
      } catch {}
    }
  },
};
