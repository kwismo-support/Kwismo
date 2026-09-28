import { Platform } from 'react-native';
import { getDeviceFingerprint } from '../services/device';

export const getDeviceInfo = async () => {
  const deviceId = await getDeviceFingerprint();
  const deviceName = `${Platform.OS.toUpperCase()} Mobile App`;
  return { deviceId, deviceName };
};
