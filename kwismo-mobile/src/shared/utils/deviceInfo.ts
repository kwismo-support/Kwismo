import { Platform } from 'react-native';
import Constants from 'expo-constants';

export const getDeviceInfo = () => {
  const deviceId =
    Constants.deviceId ||
    Constants.installationId ||
    `kwismo-device-${Platform.OS}`;
  const deviceName = `${Platform.OS.toUpperCase()} Mobile App`;
  return { deviceId, deviceName };
};
