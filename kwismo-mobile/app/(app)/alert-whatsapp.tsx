import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useTranslation } from 'react-i18next';
import { Icon } from '../../src/shared/ui/Icon';
import { useAppTheme } from '../../src/shared/hooks/useAppTheme';
import { colors, fonts } from '../../src/styles/tokens';
import { scaleFont } from '../../src/shared/lib/responsive';

export default function AlertWhatsappScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { colors: themeColors } = useAppTheme();

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <View style={[styles.header, { paddingTop: Math.max(insets.top + 10, 20) }]}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => router.back()}
          style={styles.backBtn}
        >
          <Icon name="solar:arrow-left-linear" color={colors.white} size={22} />
        </TouchableOpacity>
        <Text style={styles.title}>{t('common.whatsappAlert')}</Text>
      </View>
      <View style={[styles.content, { backgroundColor: themeColors.background }]}>
        <Icon name="ic:baseline-whatsapp" color={colors.green} size={48} />
        <Text style={[styles.subtitle, { color: themeColors.textSecondary }]}>
          {t('common.whatsappAlert')}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.green },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 24,
    gap: 12,
  },
  backBtn: {
    padding: 4,
  },
  content: {
    flex: 1,
    borderTopLeftRadius: 36,
    borderTopRightRadius: 0,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 16,
  },
  title: { fontFamily: fonts.h6, fontSize: scaleFont(18), fontWeight: '700', color: colors.white },
  subtitle: { fontFamily: fonts.medium, fontSize: scaleFont(15) },
});
