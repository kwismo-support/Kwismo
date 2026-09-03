import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useTranslation } from 'react-i18next';
import { Icon } from '../../src/shared/ui/Icon';
import { HeaderBar } from '../../src/shared/components/HeaderBar';
import { Skeleton, SkeletonCircle, SkeletonLoader } from '../../src/shared/ui/Skeleton';
import { TabBar } from '../../src/shared/components/TabBar';
import { useAppTheme } from '../../src/shared/hooks/useAppTheme';
import { colors, fonts } from '../../src/styles/tokens';
import { scaleFont } from '../../src/shared/lib/responsive';

// Données des KPI personnels selon la Section 9.1
const KPI_CARDS = [
  {
    id: 'kpi-verified',
    title: 'Numéros vérifiés',
    value: '3',
    variation: '+1 ce mois',
    icon: 'solar:shield-check-bold',
    accentColor: colors.green,
  },
  {
    id: 'kpi-threats',
    title: 'Menaces évitées',
    value: '12',
    variation: '+3 sem.',
    icon: 'solar:shield-warning-bold',
    accentColor: colors.green,
  },
  {
    id: 'kpi-reports',
    title: 'Signalements faits',
    value: '5',
    variation: 'Communauté',
    icon: 'heroicons:signal-16-solid',
    accentColor: colors.orange,
  },
  {
    id: 'kpi-transfers',
    title: 'Transferts protégés',
    value: '85 000 F',
    variation: '100% sécurisés',
    icon: 'solar:card-transfer-bold',
    accentColor: '#3B82F6',
  },
];

// Activité récente selon la Section 9.1
const RECENT_ACTIVITIES = [
  {
    id: '1',
    phone: '+237 6 98 44 43 88',
    title: 'Vérification numéro',
    status: 'Protégé',
    statusType: 'green',
    date: "Aujourd'hui à 11:42",
    icon: 'solar:shield-check-bold',
  },
  {
    id: '2',
    phone: '+237 6 55 98 76 54',
    title: 'Appel suspect détecté',
    status: 'Suspect',
    statusType: 'red',
    date: 'Hier à 16:15',
    icon: 'solar:danger-triangle-bold',
  },
  {
    id: '3',
    phone: 'Orange Money (5 000 F)',
    title: 'Transfert USSD sécurisé',
    status: 'Sécurisé',
    statusType: 'green',
    date: 'Il y a 2 jours',
    icon: 'solar:card-transfer-bold',
  },
  {
    id: '4',
    phone: '+237 6 70 12 34 56',
    title: 'Signalement arnaque',
    status: 'Transmis',
    statusType: 'orange',
    date: 'Il y a 3 jours',
    icon: 'heroicons:signal-16-solid',
  },
];

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { isDark, colors: themeColors } = useAppTheme();

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const getBadgeColors = (type: string) => {
    switch (type) {
      case 'green':
        return { bg: isDark ? '#064E3B' : '#E6F7F0', text: colors.green };
      case 'red':
        return { bg: isDark ? '#7F1D1D' : '#FEE2E2', text: '#EF4444' };
      case 'orange':
        return { bg: isDark ? '#78350F' : '#FEF3C7', text: colors.orange };
      default:
        return { bg: isDark ? '#1E293B' : '#F1F5F9', text: themeColors.textSecondary };
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <StatusBar style="light" />

      {/* Header global unifié : KWISMO à gauche, Cloche et options à droite */}
      <HeaderBar isHome={true} />

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 105 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Salutation personnalisée & Titre Dashboard (§9.1) */}
        <View style={styles.greetingHeader}>
          <Text style={[styles.welcomeGreeting, { color: themeColors.textPrimary }]}>
            Bonjour, Alain 👋
          </Text>
          <Text style={[styles.welcomeSub, { color: themeColors.textSecondary }]}>
            Votre tableau de bord anti-fraude Mobile Money
          </Text>
        </View>

        {/* 1. KPI PERSONNELS (§9.1) : Grille 2x2 compacte */}
        <View style={styles.kpiContainer}>
          {loading ? (
            <SkeletonLoader>
              <View style={styles.kpiGrid}>
                {[1, 2, 3, 4].map((i) => (
                  <View key={i} style={[styles.kpiCard, { backgroundColor: themeColors.cardBg, borderColor: themeColors.inputBorder }]}>
                    <Skeleton width={80} height={14} borderRadius={4} />
                    <Skeleton width={60} height={24} borderRadius={6} style={{ marginVertical: 8 }} />
                    <Skeleton width={90} height={12} borderRadius={4} />
                  </View>
                ))}
              </View>
            </SkeletonLoader>
          ) : (
            <View style={styles.kpiGrid}>
              {KPI_CARDS.map((kpi) => (
                <View
                  key={kpi.id}
                  style={[
                    styles.kpiCard,
                    {
                      backgroundColor: themeColors.cardBg,
                      borderColor: themeColors.inputBorder,
                    },
                  ]}
                >
                  <View style={styles.kpiCardTop}>
                    <Text style={[styles.kpiTitle, { color: themeColors.textSecondary }]}>
                      {kpi.title}
                    </Text>
                    <Icon name={kpi.icon} color={kpi.accentColor} size={18} />
                  </View>

                  <Text style={[styles.kpiValue, { color: themeColors.textPrimary }]}>
                    {kpi.value}
                  </Text>

                  <View style={styles.kpiBottomRow}>
                    <View style={[styles.kpiDot, { backgroundColor: kpi.accentColor }]} />
                    <Text style={[styles.kpiVariation, { color: themeColors.textSecondary }]}>
                      {kpi.variation}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* 2. ACTIONS RAPIDES (§9.1) : 4 Raccourcis directs en 1 clic */}
        <Text style={[styles.sectionTitle, { color: themeColors.textPrimary, marginTop: 24 }]}>
          Actions rapides
        </Text>

        <View style={styles.quickActionsGrid}>
          {/* Vérifier un numéro */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push('/(app)/verify')}
            style={[styles.quickActionBtn, { backgroundColor: colors.green }]}
          >
            <Icon name="solar:shield-check-bold" color={colors.white} size={22} style={{ marginBottom: 6 }} />
            <Text style={styles.quickActionBtnText}>Vérifier un numéro</Text>
          </TouchableOpacity>

          {/* Transfert USSD */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push('/(app)/transfer')}
            style={[styles.quickActionBtnSecondary, { backgroundColor: themeColors.cardBg, borderColor: themeColors.inputBorder }]}
          >
            <Icon name="solar:card-transfer-bold" color={colors.green} size={22} style={{ marginBottom: 6 }} />
            <Text style={[styles.quickActionBtnSecondaryText, { color: themeColors.textPrimary }]}>
              Transfert USSD
            </Text>
          </TouchableOpacity>

          {/* Alerte WhatsApp */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push('/(app)/alert-whatsapp')}
            style={[styles.quickActionBtnSecondary, { backgroundColor: themeColors.cardBg, borderColor: themeColors.inputBorder }]}
          >
            <Icon name="ic:baseline-whatsapp" color="#25D366" size={22} style={{ marginBottom: 6 }} />
            <Text style={[styles.quickActionBtnSecondaryText, { color: themeColors.textPrimary }]}>
              Alerte WhatsApp
            </Text>
          </TouchableOpacity>

          {/* Signaler */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push('/(app)/report')}
            style={[styles.quickActionBtnSecondary, { backgroundColor: themeColors.cardBg, borderColor: themeColors.inputBorder }]}
          >
            <Icon name="heroicons:signal-16-solid" color={colors.orange} size={22} style={{ marginBottom: 6 }} />
            <Text style={[styles.quickActionBtnSecondaryText, { color: themeColors.textPrimary }]}>
              Signaler
            </Text>
          </TouchableOpacity>
        </View>

        {/* 3. ACTIVITÉ RÉCENTE (§9.1) */}
        <View style={styles.recentSectionHeader}>
          <Text style={[styles.sectionTitle, { color: themeColors.textPrimary }]}>
            Activité récente
          </Text>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.push('/(app)/verify')}
          >
            <Text style={[styles.viewAllLink, { color: colors.green }]}>
              Voir tout
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.activitiesList}>
          {loading ? (
            <SkeletonLoader>
              {[1, 2, 3].map((i) => (
                <View
                  key={i}
                  style={[styles.activityItem, { backgroundColor: themeColors.cardBg, borderColor: themeColors.inputBorder }]}
                >
                  <SkeletonCircle size={36} />
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Skeleton width={140} height={14} borderRadius={4} />
                    <Skeleton width={90} height={12} borderRadius={4} style={{ marginTop: 6 }} />
                  </View>
                  <Skeleton width={60} height={20} borderRadius={10} />
                </View>
              ))}
            </SkeletonLoader>
          ) : (
            RECENT_ACTIVITIES.map((item) => {
              const badge = getBadgeColors(item.statusType);
              return (
                <View
                  key={item.id}
                  style={[
                    styles.activityItem,
                    {
                      backgroundColor: themeColors.cardBg,
                      borderColor: themeColors.inputBorder,
                    },
                  ]}
                >
                  {/* Icône pleine sans rond de fond */}
                  <Icon
                    name={item.icon}
                    size={22}
                    color={
                      item.statusType === 'green'
                        ? colors.green
                        : item.statusType === 'red'
                        ? '#EF4444'
                        : colors.orange
                    }
                    style={{ marginRight: 12 }}
                  />

                  <View style={{ flex: 1 }}>
                    <Text style={[styles.activityTitle, { color: themeColors.textPrimary }]}>
                      {item.title}
                    </Text>
                    <Text style={[styles.activityPhone, { color: themeColors.textSecondary }]}>
                      {item.phone} · {item.date}
                    </Text>
                  </View>

                  {/* Badge de statut centré */}
                  <View style={[styles.statusBadge, { backgroundColor: badge.bg }]}>
                    <Text style={[styles.statusBadgeText, { color: badge.text }]}>
                      {item.status}
                    </Text>
                  </View>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>

      {/* Barre d'onglets basse officielle */}
      <TabBar activeTab="home" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  greetingHeader: {
    marginBottom: 16,
  },
  welcomeGreeting: {
    fontFamily: fonts.headlineBold,
    fontSize: scaleFont(22),
    fontWeight: '800',
  },
  welcomeSub: {
    fontFamily: fonts.regular,
    fontSize: scaleFont(13),
    marginTop: 2,
  },
  kpiContainer: {
    marginBottom: 10,
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 10,
  },
  kpiCard: {
    width: '48.5%',
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  kpiCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  kpiTitle: {
    fontFamily: fonts.medium,
    fontSize: scaleFont(12),
  },
  kpiValue: {
    fontFamily: fonts.headlineBold,
    fontSize: scaleFont(18),
    fontWeight: '800',
    marginBottom: 6,
  },
  kpiBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  kpiDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  kpiVariation: {
    fontFamily: fonts.regular,
    fontSize: scaleFont(11),
  },
  sectionTitle: {
    fontFamily: fonts.headlineBold,
    fontSize: scaleFont(17),
    fontWeight: '800',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 10,
    marginTop: 12,
    marginBottom: 24,
  },
  quickActionBtn: {
    width: '48.5%',
    height: 80,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.green,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  quickActionBtnText: {
    fontFamily: fonts.headlineBold,
    fontSize: scaleFont(12),
    fontWeight: '700',
    color: colors.white,
    textAlign: 'center',
  },
  quickActionBtnSecondary: {
    width: '48.5%',
    height: 80,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionBtnSecondaryText: {
    fontFamily: fonts.headlineBold,
    fontSize: scaleFont(12),
    fontWeight: '700',
    textAlign: 'center',
  },
  recentSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  viewAllLink: {
    fontFamily: fonts.bold,
    fontSize: scaleFont(13),
    fontWeight: '700',
  },
  activitiesList: {
    gap: 10,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
  },
  activityTitle: {
    fontFamily: fonts.bold,
    fontSize: scaleFont(13),
    fontWeight: '700',
  },
  activityPhone: {
    fontFamily: fonts.regular,
    fontSize: scaleFont(11),
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    marginLeft: 8,
  },
  statusBadgeText: {
    fontFamily: fonts.bold,
    fontSize: scaleFont(11),
    fontWeight: '700',
  },
});
