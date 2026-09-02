import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Icon } from '../../src/shared/ui/Icon';
import { useAppTheme } from '../../src/shared/hooks/useAppTheme';
import { colors, fonts } from '../../src/styles/tokens';
import { scaleFont } from '../../src/shared/lib/responsive';

export default function AlertWhatsappScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { colors: themeColors } = useAppTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => router.back()}
          style={styles.backBtn}
        >
          <Icon name="solar:arrow-left-linear" color={themeColors.textPrimary} size={22} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: themeColors.textPrimary }]}>
          {t('common.whatsappAlert')}
        </Text>
      </View>
      <View style={styles.content}>
        <Icon name="ic:baseline-whatsapp" color={colors.green} size={48} />
        <Text style={[styles.subtitle, { color: themeColors.textSecondary }]}>
          {t('common.whatsappAlert')}
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  backBtn: {
    padding: 4,
  },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 16 },
  title: { fontFamily: fonts.headlineBold, fontSize: scaleFont(20), fontWeight: '700' },
  subtitle: { fontFamily: fonts.medium, fontSize: scaleFont(15) },
});
