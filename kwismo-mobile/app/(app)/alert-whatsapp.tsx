import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useTranslation } from 'react-i18next';
import { Icon } from '../../src/shared/ui/Icon';
import { HeaderBar } from '../../src/shared/components/HeaderBar';
import { Skeleton, SkeletonLoader } from '../../src/shared/ui/Skeleton';
import { useAppTheme } from '../../src/shared/hooks/useAppTheme';
import { toast } from '../../src/shared/store/toastStore';
import { colors, fonts } from '../../src/styles/tokens';
import { scaleFont } from '../../src/shared/lib/responsive';

// Liste simulée des numéros enregistrés par l'utilisateur
const USER_REGISTERED_NUMBERS = [
  { id: '1', phone: '+237 6 98 44 43 88', operator: 'Orange Cameroun', isProtected: true, countryCode: 'CM' },
  { id: '2', phone: '+237 6 70 12 34 56', operator: 'MTN Cameroun', isProtected: false, countryCode: 'CM' },
];

export default function AlertWhatsappScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { isDark, colors: themeColors } = useAppTheme();

  const [loading, setLoading] = useState(true);
  const [selectedNumberId, setSelectedNumberId] = useState('1');
  const [protectionEnabled, setProtectionEnabled] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const handleSelectNumber = (id: string, currentlyProtected: boolean) => {
    setSelectedNumberId(id);
    setProtectionEnabled(currentlyProtected);
  };

  const handleSaveSettings = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast.success(
        t('whatsapp.settingsSaved', 'Paramètres d’alerte WhatsApp enregistrés avec succès !')
      );
    }, 600);
  };

  const selectedNumberObj = USER_REGISTERED_NUMBERS.find((n) => n.id === selectedNumberId);

  return (
    <View style={[styles.container, { backgroundColor: colors.green }]}>
      <StatusBar style="light" />

      {/* Header global unifié de page secondaire */}
      <HeaderBar
        title={t('whatsapp.title', 'Alerte WhatsApp')}
        showBack={true}
      />

      <View style={[styles.mainSheet, { backgroundColor: themeColors.background }]}>
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + 40 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* Banner explicatif */}
          <View style={[styles.bannerCard, { backgroundColor: isDark ? '#143324' : '#E6F7F0', borderColor: colors.green }]}>
            <Icon name="ic:baseline-whatsapp" color="#25D366" size={28} style={{ marginRight: 12 }} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.bannerTitle, { color: isDark ? '#A7F3D0' : '#065F46' }]}>
                {t('whatsapp.subtitle', 'Protection anti-piratage WhatsApp')}
              </Text>
              <Text style={[styles.bannerText, { color: isDark ? '#D1FAE5' : '#047857' }]}>
                {t(
                  'whatsapp.noticeText',
                  'En activant cette protection, Kwismo surveillera automatiquement les tentatives d’usurpation de votre compte WhatsApp sur le numéro sélectionné.'
                )}
              </Text>
            </View>
          </View>

          {/* Sélecteur du numéro concerné */}
          <Text style={[styles.sectionTitle, { color: themeColors.textPrimary, marginTop: 20 }]}>
            {t('whatsapp.selectNumberLabel', 'Sélectionner le numéro à protéger')}
          </Text>

          {loading ? (
            <SkeletonLoader>
              <View style={{ gap: 10, marginTop: 10 }}>
                <Skeleton width="100%" height={70} borderRadius={16} />
                <Skeleton width="100%" height={70} borderRadius={16} />
              </View>
            </SkeletonLoader>
          ) : (
            <View style={styles.numbersList}>
              {USER_REGISTERED_NUMBERS.map((item) => {
                const isSelected = selectedNumberId === item.id;
                return (
                  <TouchableOpacity
                    key={item.id}
                    activeOpacity={0.8}
                    onPress={() => handleSelectNumber(item.id, item.isProtected)}
                    style={[
                      styles.numberCardItem,
                      {
                        backgroundColor: isSelected
                          ? isDark ? '#1E3A2F' : '#F0FDF4'
                          : themeColors.cardBg,
                        borderColor: isSelected ? colors.green : themeColors.inputBorder,
                      },
                    ]}
                  >
                    <View style={styles.numberLeftRow}>
                      <View style={[styles.radioDot, { borderColor: isSelected ? colors.green : themeColors.inputBorder }]}>
                        {isSelected && <View style={styles.radioDotInner} />}
                      </View>

                      <View style={{ marginLeft: 12 }}>
                        <Text style={[styles.numberPhoneText, { color: themeColors.textPrimary }]}>
                          {item.phone}
                        </Text>
                        <Text style={[styles.numberOperatorText, { color: themeColors.textSecondary }]}>
                          {item.operator}
                        </Text>
                      </View>
                    </View>

                    <View
                      style={[
                        styles.badgeStatus,
                        {
                          backgroundColor: item.isProtected
                            ? isDark ? '#143324' : '#DCFCE7'
                            : isDark ? '#334155' : '#F1F5F9',
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.badgeStatusText,
                          { color: item.isProtected ? colors.green : themeColors.textSecondary },
                        ]}
                      >
                        {item.isProtected
                          ? t('whatsapp.statusProtected', 'Protégé')
                          : t('whatsapp.statusNotProtected', 'Non protégé')}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {/* Switch de protection */}
          <View
            style={[
              styles.switchContainerCard,
              {
                backgroundColor: themeColors.cardBg,
                borderColor: themeColors.inputBorder,
                marginTop: 20,
              },
            ]}
          >
            <View style={{ flex: 1, paddingRight: 12 }}>
              <Text style={[styles.switchTitle, { color: themeColors.textPrimary }]}>
                {t('whatsapp.enableProtection', 'Activer la détection de piratage')}
              </Text>
              <Text style={[styles.switchSub, { color: themeColors.textSecondary }]}>
                {selectedNumberObj ? selectedNumberObj.phone : ''}
              </Text>
            </View>

            <Switch
              value={protectionEnabled}
              onValueChange={setProtectionEnabled}
              trackColor={{ false: '#CBD5E1', true: colors.green }}
              thumbColor={colors.white}
            />
          </View>

          {/* Card de résumé de sécurité */}
          <View
            style={[
              styles.securitySummaryCard,
              {
                backgroundColor: protectionEnabled
                  ? isDark ? '#143324' : '#F0FDF4'
                  : isDark ? '#3B181E' : '#FEF2F2',
                borderColor: protectionEnabled ? colors.green : '#EF4444',
                marginTop: 20,
              },
            ]}
          >
            <Icon
              name={protectionEnabled ? 'solar:shield-check-bold' : 'solar:shield-warning-bold'}
              color={protectionEnabled ? colors.green : '#EF4444'}
              size={24}
              style={{ marginRight: 12 }}
            />
            <View style={{ flex: 1 }}>
              <Text
                style={[
                  styles.summaryStatusTitle,
                  { color: protectionEnabled ? colors.green : '#EF4444' },
                ]}
              >
                {protectionEnabled
                  ? t('whatsapp.statusProtected', 'Protection WhatsApp Active')
                  : t('whatsapp.statusNotProtected', 'Protection Désactivée')}
              </Text>
              <Text style={[styles.summaryStatusSub, { color: themeColors.textSecondary }]}>
                {protectionEnabled
                  ? 'Alerte instantanée en cas de connexion suspecte sur un autre appareil.'
                  : 'Ce numéro ne recevra pas d’alertes préventives sur WhatsApp.'}
              </Text>
            </View>
          </View>

          {/* Bouton d'enregistrement */}
          <TouchableOpacity
            activeOpacity={0.85}
            disabled={isSaving}
            onPress={handleSaveSettings}
            style={[styles.saveBtn, { backgroundColor: colors.green, marginTop: 28 }]}
          >
            {isSaving ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <>
                <Icon name="solar:check-read-bold" color={colors.white} size={20} style={{ marginRight: 8 }} />
                <Text style={styles.saveBtnText}>{t('whatsapp.saveSettings', 'Enregistrer la configuration')}</Text>
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mainSheet: {
    flex: 1,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 0,
    marginTop: 0,
    overflow: 'hidden',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  bannerCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  bannerTitle: {
    fontFamily: fonts.headlineBold,
    fontSize: scaleFont(15),
    fontWeight: '700',
    marginBottom: 4,
  },
  bannerText: {
    fontFamily: fonts.regular,
    fontSize: scaleFont(12),
    lineHeight: scaleFont(17),
  },
  sectionTitle: {
    fontFamily: fonts.headlineBold,
    fontSize: scaleFont(16),
    fontWeight: '800',
  },
  numbersList: {
    gap: 10,
    marginTop: 10,
  },
  numberCardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1.5,
  },
  numberLeftRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioDotInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.green,
  },
  numberPhoneText: {
    fontFamily: fonts.headlineBold,
    fontSize: scaleFont(14),
    fontWeight: '700',
  },
  numberOperatorText: {
    fontFamily: fonts.regular,
    fontSize: scaleFont(12),
    marginTop: 2,
  },
  badgeStatus: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  badgeStatusText: {
    fontFamily: fonts.headlineBold,
    fontSize: scaleFont(11),
    fontWeight: '700',
  },
  switchContainerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  switchTitle: {
    fontFamily: fonts.headlineBold,
    fontSize: scaleFont(14),
    fontWeight: '700',
  },
  switchSub: {
    fontFamily: fonts.regular,
    fontSize: scaleFont(12),
    marginTop: 2,
  },
  securitySummaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  summaryStatusTitle: {
    fontFamily: fonts.headlineBold,
    fontSize: scaleFont(14),
    fontWeight: '700',
  },
  summaryStatusSub: {
    fontFamily: fonts.regular,
    fontSize: scaleFont(12),
    marginTop: 2,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    borderRadius: 16,
  },
  saveBtnText: {
    fontFamily: fonts.headlineBold,
    fontSize: scaleFont(15),
    fontWeight: '700',
    color: colors.white,
  },
});
