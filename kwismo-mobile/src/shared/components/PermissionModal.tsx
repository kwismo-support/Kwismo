// Composant de popup personnalisé pour demander l'accord de l'utilisateur avant les permissions système
import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Icon } from '../ui/Icon';
import { useAppTheme } from '../hooks/useAppTheme';
import { colors, fonts } from '../../styles/tokens';
import { scaleFont } from '../lib/responsive';

interface PermissionModalProps {
  visible: boolean;
  title: string;
  description: string;
  iconName: string;
  iconColor?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const PermissionModal: React.FC<PermissionModalProps> = ({
  visible,
  title,
  description,
  iconName,
  iconColor = colors.green,
  confirmText,
  cancelText,
  onConfirm,
  onCancel,
}) => {
  const { t } = useTranslation();
  const { colors: themeColors } = useAppTheme();

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.backdrop}>
        <View style={[styles.card, { backgroundColor: themeColors.cardBg, borderColor: themeColors.inputBorder }]}>
          <View style={[styles.iconCircle, { backgroundColor: `${iconColor}15` }]}>
            <Icon name={iconName} size={36} color={iconColor} />
          </View>

          <Text style={[styles.title, { color: themeColors.textPrimary }]}>{title}</Text>
          <Text style={[styles.description, { color: themeColors.textSecondary }]}>{description}</Text>

          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={[styles.cancelBtn, { borderColor: themeColors.inputBorder }]}
              onPress={onCancel}
              activeOpacity={0.7}
            >
              <Text style={[styles.cancelText, { color: themeColors.textPrimary }]}>
                {cancelText || t('common.cancel', 'Refuser')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.confirmBtn, { backgroundColor: iconColor }]}
              onPress={onConfirm}
              activeOpacity={0.85}
            >
              <Text style={styles.confirmText}>{confirmText || t('common.allow', 'Autoriser')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  card: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 20,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
    elevation: 10,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: scaleFont(17),
    fontFamily: fonts.headlineBold,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 8,
  },
  description: {
    fontSize: scaleFont(13),
    fontFamily: fonts.regular,
    textAlign: 'center',
    lineHeight: scaleFont(18),
    marginBottom: 24,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  cancelBtn: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelText: {
    fontSize: scaleFont(14),
    fontFamily: fonts.headlineBold,
    fontWeight: '600',
  },
  confirmBtn: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmText: {
    fontSize: scaleFont(14),
    fontFamily: fonts.headlineBold,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
