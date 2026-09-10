import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Icon } from '../ui/Icon';
import { useAppTheme } from '../hooks/useAppTheme';
import { colors, fonts } from '../../styles/tokens';
import { scaleFont } from '../lib/responsive';

interface ErrorScreenProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export const ErrorScreen: React.FC<ErrorScreenProps> = ({
  title,
  message,
  onRetry,
}) => {
  const { t } = useTranslation();
  const { colors: themeColors } = useAppTheme();

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <View style={styles.card}>
        <View style={styles.iconCircle}>
          <Icon name="solar:danger-triangle-bold" size={42} color="#EF4444" />
        </View>

        <Text style={[styles.title, { color: themeColors.textPrimary }]}>
          {title || t('errors.generalTitle', 'Une erreur est survenue')}
        </Text>

        <Text style={[styles.message, { color: themeColors.textSecondary }]}>
          {message || t('errors.generalMessage', 'Impossible de charger la ressource. Veuillez réessayer.')}
        </Text>

        {onRetry && (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onRetry}
            style={[styles.retryBtn, { backgroundColor: colors.green }]}
          >
            <Icon name="solar:restart-bold" size={18} color={colors.white} style={{ marginRight: 6 }} />
            <Text style={styles.retryText}>{t('common.retry', 'Réessayer')}</Text>
          </TouchableOpacity>
        )}
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
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
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
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 46,
    paddingHorizontal: 24,
    borderRadius: 14,
    marginTop: 20,
  },
  retryText: {
    fontFamily: fonts.headlineBold,
    fontSize: scaleFont(14),
    color: colors.white,
    fontWeight: '700',
  },
});
