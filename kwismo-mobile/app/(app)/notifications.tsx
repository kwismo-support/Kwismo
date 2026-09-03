import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useTranslation } from 'react-i18next';
import { Icon } from '../../src/shared/ui/Icon';
import { HeaderBar } from '../../src/shared/components/HeaderBar';
import { useAppTheme } from '../../src/shared/hooks/useAppTheme';
import { toast } from '../../src/shared/store/toastStore';
import { colors, fonts } from '../../src/styles/tokens';
import { scaleFont } from '../../src/shared/lib/responsive';

export default function NotificationsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { isDark, colors: themeColors } = useAppTheme();

  const [pushEnabled, setPushEnabled] = useState(true);
  const [whatsappAlertsEnabled, setWhatsappAlertsEnabled] = useState(true);
  const [smsAlertsEnabled, setSmsAlertsEnabled] = useState(true);
  const [emailSummaryEnabled, setEmailSummaryEnabled] = useState(false);

  const handleSave = () => {
    toast.success(t('toasts.generalSuccess', 'Préférences de notifications enregistrées !'));
    router.back();
  };

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <StatusBar style="light" />

      {/* Header unifié de page secondaire */}
      <HeaderBar title={t('common.notifications', 'Notifications')} showBack={true} />

      <ScrollView
        contentContainerStyle={[
          styles.scrollBody,
          { paddingBottom: insets.bottom + 40 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.sectionTitle, { color: themeColors.textPrimary }]}>
          Canaux d'alerte et de notification
        </Text>
        <Text style={[styles.sectionSub, { color: themeColors.textSecondary }]}>
          Configurez la façon dont Kwismo vous alerte en cas de menace ou d'appel suspect.
        </Text>

        <View style={[styles.card, { backgroundColor: themeColors.cardBg, borderColor: themeColors.inputBorder, marginTop: 16 }]}>
          {/* Push */}
          <View style={styles.row}>
            <Icon name="solar:bell-bold" color={colors.green} size={22} style={{ marginRight: 12 }} />
            <View style={{ flex: 1, paddingRight: 10 }}>
              <Text style={[styles.rowTitle, { color: themeColors.textPrimary }]}>
                Notifications Push
              </Text>
              <Text style={[styles.rowSub, { color: themeColors.textSecondary }]}>
                Alertes instantanées sur votre écran de verrouillage
              </Text>
            </View>
            <Switch
              value={pushEnabled}
              onValueChange={setPushEnabled}
              trackColor={{ false: '#CBD5E1', true: colors.green }}
              thumbColor={colors.white}
            />
          </View>

          <View style={[styles.divider, { backgroundColor: themeColors.divider }]} />

          {/* WhatsApp */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push('/(app)/alert-whatsapp')}
            style={styles.row}
          >
            <Icon name="ic:baseline-whatsapp" color="#25D366" size={22} style={{ marginRight: 12 }} />
            <View style={{ flex: 1, paddingRight: 10 }}>
              <Text style={[styles.rowTitle, { color: themeColors.textPrimary }]}>
                Alerte WhatsApp
              </Text>
              <Text style={[styles.rowSub, { color: themeColors.textSecondary }]}>
                Alertes de tentative de piratage transmises sur WhatsApp
              </Text>
            </View>
            <Icon name="solar:alt-arrow-right-linear" color={themeColors.inputPlaceholder} size={18} />
          </TouchableOpacity>

          <View style={[styles.divider, { backgroundColor: themeColors.divider }]} />

          {/* SMS */}
          <View style={styles.row}>
            <Icon name="solar:phone-calling-rounded-bold" color={colors.green} size={22} style={{ marginRight: 12 }} />
            <View style={{ flex: 1, paddingRight: 10 }}>
              <Text style={[styles.rowTitle, { color: themeColors.textPrimary }]}>
                Alertes par SMS
              </Text>
              <Text style={[styles.rowSub, { color: themeColors.textSecondary }]}>
                Alertes prioritaires par SMS en cas de transfert suspect
              </Text>
            </View>
            <Switch
              value={smsAlertsEnabled}
              onValueChange={setSmsAlertsEnabled}
              trackColor={{ false: '#CBD5E1', true: colors.green }}
              thumbColor={colors.white}
            />
          </View>

          <View style={[styles.divider, { backgroundColor: themeColors.divider }]} />

          {/* Email */}
          <View style={styles.row}>
            <Icon name="solar:letter-bold" color={colors.green} size={22} style={{ marginRight: 12 }} />
            <View style={{ flex: 1, paddingRight: 10 }}>
              <Text style={[styles.rowTitle, { color: themeColors.textPrimary }]}>
                Rapports par Email
              </Text>
              <Text style={[styles.rowSub, { color: themeColors.textSecondary }]}>
                Synthèse mensuelle des menaces évitées
              </Text>
            </View>
            <Switch
              value={emailSummaryEnabled}
              onValueChange={setEmailSummaryEnabled}
              trackColor={{ false: '#CBD5E1', true: colors.green }}
              thumbColor={colors.white}
            />
          </View>
        </View>

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handleSave}
          style={[styles.saveBtn, { backgroundColor: colors.green, marginTop: 28 }]}
        >
          <Text style={styles.saveBtnText}>
            {t('common.saveChanges', 'Enregistrer les préférences')}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollBody: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  sectionTitle: {
    fontFamily: fonts.headlineBold,
    fontSize: scaleFont(16),
    fontWeight: '800',
  },
  sectionSub: {
    fontFamily: fonts.regular,
    fontSize: scaleFont(13),
    marginTop: 4,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  rowTitle: {
    fontFamily: fonts.headlineBold,
    fontSize: scaleFont(14),
    fontWeight: '700',
  },
  rowSub: {
    fontFamily: fonts.regular,
    fontSize: scaleFont(12),
    marginTop: 2,
  },
  divider: {
    height: 1,
  },
  saveBtn: {
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnText: {
    fontFamily: fonts.headlineBold,
    fontSize: scaleFont(15),
    fontWeight: '700',
    color: colors.white,
  },
});
