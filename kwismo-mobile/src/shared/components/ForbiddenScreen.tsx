import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Icon } from '../ui/Icon';
import { useAppTheme } from '../hooks/useAppTheme';
import { colors, fonts } from '../../styles/tokens';
import { scaleFont } from '../lib/responsive';

interface ForbiddenScreenProps {
  title?: string;
  message?: string;
  onGoBack?: () => void;
}

export const ForbiddenScreen: React.FC<ForbiddenScreenProps> = ({
  title,
  message,
  onGoBack,
}) => {
  const router = useRouter();
  const { t } = useTranslation();
  const { colors: themeColors } = useAppTheme();

  const handleBack = () => {
    if (onGoBack) onGoBack();
    else router.back();
  };

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <View style={styles.card}>
        <View style={styles.iconCircle}>
          <Icon name="solar:lock-keyhole-minimalistic-bold" size={42} color={colors.orange} />
        </View>

        <Text style={[styles.title, { color: themeColors.textPrimary }]}>
          {title || t('errors.forbiddenTitle', 'Accès non autorisé')}
        </Text>

        <Text style={[styles.message, { color: themeColors.textSecondary }]}>
          {message || t('errors.forbiddenMessage', 'Vous n’avez pas les permissions nécessaires pour accéder à cette zone.')}
        </Text>

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handleBack}
          style={[styles.backBtn, { backgroundColor: colors.green }]}
        >
          <Icon name="solar:arrow-left-linear" size={18} color={colors.white} style={{ marginRight: 6 }} />
          <Text style={styles.backText}>{t('common.goBack', 'Retourner')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  card: {
    alignItems: 'center',
    padding: 28,
    borderRadius: 24,
    width: '100%',
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontFamily: fonts.headlineBold,
    fontSize: scaleFont(18),
    fontWeight: '800',
    textAlign: 'center',
  },
  message: {
    fontFamily: fonts.regular,
    fontSize: scaleFont(13),
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 46,
    paddingHorizontal: 24,
    borderRadius: 14,
    marginTop: 20,
  },
  backText: {
    fontFamily: fonts.headlineBold,
    fontSize: scaleFont(14),
    color: colors.white,
    fontWeight: '700',
  },
});
