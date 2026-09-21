import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Pressable,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useTranslation } from 'react-i18next';
import { Icon } from '@/shared/ui/Icon';
import { useAppTheme } from '@/shared/hooks/useAppTheme';
import { toast } from '@/shared/store/toastStore';

interface ProfilePhotoPickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectPhoto: (photoUri: string) => void;
}

export const ProfilePhotoPickerModal: React.FC<ProfilePhotoPickerModalProps> = ({
  visible,
  onClose,
  onSelectPhoto,
}) => {
  const { t } = useTranslation();
  const { colors: themeColors } = useAppTheme();

  const handlePickFromGallery = async () => {
    if (Platform.OS === 'web') {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = (e: any) => {
        const file = e.target.files?.[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (evt) => {
            if (evt.target?.result) {
              onSelectPhoto(evt.target.result as string);
              toast.success(t('common.photoSelectedSuccess'));
            }
          };
          reader.readAsDataURL(file);
        }
      };
      input.click();
      onClose();
      return;
    }

    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        toast.error(t('common.galleryPermissionDenied'));
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets?.[0]) {
        const asset = result.assets[0];
        const photoData = asset.base64 ? `data:image/jpeg;base64,${asset.base64}` : asset.uri;
        onSelectPhoto(photoData);
        toast.success(t('common.photoSelectedSuccess'));
        onClose();
      }
    } catch {
      toast.error(t('common.photoPickerError'));
    }
  };

  const handleTakePhoto = async () => {
    if (Platform.OS === 'web') {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.capture = 'user';
      input.onchange = (e: any) => {
        const file = e.target.files?.[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (evt) => {
            if (evt.target?.result) {
              onSelectPhoto(evt.target.result as string);
              toast.success(t('common.photoTakenSuccess'));
            }
          };
          reader.readAsDataURL(file);
        }
      };
      input.click();
      onClose();
      return;
    }

    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        toast.error(t('common.cameraPermissionDenied'));
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets?.[0]) {
        const asset = result.assets[0];
        const photoData = asset.base64 ? `data:image/jpeg;base64,${asset.base64}` : asset.uri;
        onSelectPhoto(photoData);
        toast.success(t('common.photoTakenSuccess'));
        onClose();
      }
    } catch {
      toast.error(t('common.photoTakeError'));
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable className="flex-1 bg-black/50 justify-end" onPress={onClose}>
        <Pressable
          onPress={(e) => e.stopPropagation()}
          className="rounded-t-3xl p-5 pb-8 bg-white dark:bg-brand-cardDark"
        >
          <View className="flex-row items-center justify-between mb-4">
            <Text className="font-headline-bold text-base font-extrabold text-slate-900 dark:text-white">
              {t('common.photoPickerTitle')}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Icon name="solar:close-circle-bold" color={themeColors.inputPlaceholder} size={22} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleTakePhoto}
            className="flex-row items-center p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800"
          >
            <View className="wx-10 hx-10 rounded-full bg-brand-green items-center justify-center">
              <Icon name="solar:camera-bold" color="#FFFFFF" size={20} />
            </View>
            <View className="flex-1 ml-3.5">
              <Text className="font-headline-bold text-sm font-bold text-slate-900 dark:text-white">
                {t('common.takePhoto')}
              </Text>
              <Text className="font-regular text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {t('common.takePhotoSub')}
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handlePickFromGallery}
            className="flex-row items-center p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 mt-2.5"
          >
            <View className="wx-10 hx-10 rounded-full bg-blue-500 items-center justify-center">
              <Icon name="solar:gallery-bold" color="#FFFFFF" size={20} />
            </View>
            <View className="flex-1 ml-3.5">
              <Text className="font-headline-bold text-sm font-bold text-slate-900 dark:text-white">
                {t('common.chooseGallery')}
              </Text>
              <Text className="font-regular text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {t('common.chooseGallerySub')}
              </Text>
            </View>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default ProfilePhotoPickerModal;
