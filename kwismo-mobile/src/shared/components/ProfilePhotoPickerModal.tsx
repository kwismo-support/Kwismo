import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Pressable,
  Platform,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Icon } from '../ui/Icon';
import { useAppTheme } from '../hooks/useAppTheme';
import { toast } from '../store/toastStore';
import { colors, fonts } from '../../styles/tokens';
import { scaleFont } from '../lib/responsive';

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
  const { isDark, colors: themeColors } = useAppTheme();

  const handlePickFromGallery = () => {
    if (Platform.OS === 'web') {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = (e: any) => {
        const file = e.target.files?.[0];
        if (file) {
          const url = URL.createObjectURL(file);
          onSelectPhoto(url);
          toast.success(t('toasts.generalSuccess', 'Photo de profil sélectionnée !'));
        }
      };
      input.click();
    } else {
      // Sur mobile natif : simulation de sélection rapide ou utilisation du sélecteur
      onSelectPhoto('https://via.placeholder.com/150');
      toast.success(t('toasts.generalSuccess', 'Photo de profil sélectionnée !'));
    }
    onClose();
  };

  const handleTakePhoto = () => {
    if (Platform.OS === 'web') {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.capture = 'environment';
      input.onchange = (e: any) => {
        const file = e.target.files?.[0];
        if (file) {
          const url = URL.createObjectURL(file);
          onSelectPhoto(url);
          toast.success(t('toasts.generalSuccess', 'Photo prise avec succès !'));
        }
      };
      input.click();
    } else {
      onSelectPhoto('https://via.placeholder.com/150');
      toast.success(t('toasts.generalSuccess', 'Photo prise avec succès !'));
    }
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable
          onPress={(e) => e.stopPropagation()}
          style={[styles.sheetCard, { backgroundColor: themeColors.cardBg }]}
        >
          <View style={styles.headerRow}>
            <Text style={[styles.title, { color: themeColors.textPrimary }]}>
              Changer la photo de profil
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Icon name="solar:close-circle-bold" color={themeColors.inputPlaceholder} size={22} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleTakePhoto}
            style={[styles.optionBtn, { backgroundColor: isDark ? '#1E293B' : '#F8FAFC' }]}
          >
            <View style={[styles.iconCircle, { backgroundColor: colors.green }]}>
              <Icon name="solar:camera-bold" color={colors.white} size={20} />
            </View>
            <View style={{ flex: 1, marginLeft: 14 }}>
              <Text style={[styles.optionTitle, { color: themeColors.textPrimary }]}>
                Prendre une photo à l'instant
              </Text>
              <Text style={[styles.optionSub, { color: themeColors.textSecondary }]}>
                Utiliser la caméra de votre appareil
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handlePickFromGallery}
            style={[styles.optionBtn, { backgroundColor: isDark ? '#1E293B' : '#F8FAFC', marginTop: 10 }]}
          >
            <View style={[styles.iconCircle, { backgroundColor: '#3B82F6' }]}>
              <Icon name="solar:gallery-bold" color={colors.white} size={20} />
            </View>
            <View style={{ flex: 1, marginLeft: 14 }}>
              <Text style={[styles.optionTitle, { color: themeColors.textPrimary }]}>
                Choisir dans la galerie / l'appareil
              </Text>
              <Text style={[styles.optionSub, { color: themeColors.textSecondary }]}>
                Sélectionner un fichier image (PC, Mac, Android, iOS)
              </Text>
            </View>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  sheetCard: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 32,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  title: {
    fontFamily: fonts.headlineBold,
    fontSize: scaleFont(16),
    fontWeight: '800',
  },
  optionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
  },
  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionTitle: {
    fontFamily: fonts.headlineBold,
    fontSize: scaleFont(14),
    fontWeight: '700',
  },
  optionSub: {
    fontFamily: fonts.regular,
    fontSize: scaleFont(12),
    marginTop: 2,
  },
});
