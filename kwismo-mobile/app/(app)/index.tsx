import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useTranslation } from 'react-i18next';
import { Icon } from '../../src/shared/ui/Icon';
import { HeaderBar } from '../../src/shared/components/HeaderBar';
import { TabBar } from '../../src/shared/components/TabBar';
import { useAppTheme } from '../../src/shared/hooks/useAppTheme';
import { useAuthStore } from '../../src/shared/store/authStore';
import { useDashboard } from '../../src/features/dashboard/hooks/useDashboard';
import { colors, fonts } from '../../src/styles/tokens';

type FilterCategory = 'all' | 'verified' | 'threats' | 'reports' | 'transfers';

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { isDark, colors: themeColors } = useAppTheme();
  const { user } = useAuthStore();
  const { summary } = useDashboard();

  const [showFilters, setShowFilters] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterCategory>('all');

  const userName = user?.firstName
    ? `${user.firstName} ${user.lastName || ''}`.trim()
    : user?.email
    ? user.email.split('@')[0]
    : 'Utilisateur KWISMO';

  const rawActivities = summary?.recentActivities && summary.recentActivities.length > 0
    ? summary.recentActivities
    : [
        {
          id: 'act-1',
          phone: '+237 6 98 00 40 12',
          type: 'Verification de numero',
          category: 'verified',
          status: 'Faible',
          badgeType: 'blue',
          date: "Aujourd'hui",
          initials: '',
        },
        {
          id: 'act-2',
          phone: 'Lysette Orleanne',
          type: 'Alerte menace',
          category: 'threats',
          status: 'Détecté',
          badgeType: 'red',
          date: 'hier, 07h30',
          initials: 'LO',
        },
        {
          id: 'act-3',
          phone: 'Superviseur NJS',
          type: '#150*1*695 12 34 36*1...',
          category: 'transfers',
          status: 'Protégé',
          badgeType: 'green',
          date: "il y'a deux j...",
          initials: 'S',
          initialBg: '#F97316',
        },
        {
          id: 'act-4',
          phone: '+221 233 16 71 88',
          type: 'Verification de numero',
          category: 'verified',
          status: 'Protégé',
          badgeType: 'green',
          date: "il y'a deux j...",
          initials: '',
        },
        {
          id: 'act-5',
          phone: '+237 6 40 43 01 00',
          type: 'Signalement',
          category: 'reports',
          status: 'En cours...',
          badgeType: 'yellow',
          date: "il y'a une s...",
          initials: '',
        },
        {
          id: 'act-6',
          phone: '+237 6 98 44 43 88',
          type: 'Verification de numero',
          category: 'verified',
          status: 'Protégé',
          badgeType: 'green',
          date: "il y'a un mois",
          initials: '',
        },
      ];

  const filteredActivities = rawActivities.filter((item: any) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'verified') return item.type.toLowerCase().includes('verif') || item.category === 'verified';
    if (activeFilter === 'threats') return item.type.toLowerCase().includes('menace') || item.category === 'threats';
    if (activeFilter === 'reports') return item.type.toLowerCase().includes('signal') || item.category === 'reports';
    if (activeFilter === 'transfers') return item.type.toLowerCase().includes('transfer') || item.category === 'transfers' || item.type.startsWith('#');
    return true;
  });

  const getBadgeStyle = (badgeType: string, statusText: string) => {
    if (statusText === 'Faible' || statusText.toLowerCase().includes('faible')) {
      return { bg: '#E8F0FE', text: '#1A73E8' };
    }
    if (statusText === 'Détecté' || statusText.toLowerCase().includes('détect') || badgeType === 'red') {
      return { bg: '#FCE8E6', text: '#D93025' };
    }
    if (statusText.toLowerCase().includes('cours') || badgeType === 'yellow') {
      return { bg: '#FEF7E0', text: '#B06000' };
    }
    return { bg: '#E6F4EA', text: '#1E8E3E' };
  };

  const filterOptions: { key: FilterCategory; labelKey: string }[] = [
    { key: 'all', labelKey: 'common.filterAll' },
    { key: 'verified', labelKey: 'common.filterVerified' },
    { key: 'threats', labelKey: 'common.filterThreats' },
    { key: 'reports', labelKey: 'common.filterReports' },
    { key: 'transfers', labelKey: 'common.filterTransfers' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <StatusBar style="light" />

      {/* Header Bar avec Logo KWISMO, Cloche (gauche) et Loupe (droite) */}
      <HeaderBar isHome={true} />

      <ScrollView
        style={{ marginTop: -55, zIndex: 10 }}
        contentContainerStyle={[
          styles.scrollBody,
          { paddingBottom: insets.bottom + 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* CARTE HERO PROFIL + 4 KPIS */}
        <View style={[styles.heroCard, { backgroundColor: isDark ? themeColors.cardBg : '#FFFFFF' }]}>
          <View style={styles.userRow}>
            <View style={styles.avatarContainer}>
              {user?.avatarUrl ? (
                <Image source={{ uri: user.avatarUrl }} style={styles.avatarImage} />
              ) : (
                <View style={styles.avatarFallback}>
                  <Text style={styles.avatarInitial}>
                    {userName.charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
            </View>
            <View style={styles.userInfo}>
              <View style={styles.welcomeRow}>
                <Text style={[styles.welcomeText, { color: isDark ? themeColors.textSecondary : '#64748B' }]}>
                  {t('common.welcome')}
                </Text>
                <Icon name="solar:verified-check-bold" color={colors.green} size={16} style={{ marginLeft: 4 }} />
              </View>
              <Text style={[styles.userNameText, { color: isDark ? themeColors.textPrimary : '#0F172A' }]}>
                {userName}
              </Text>
            </View>
          </View>

          {/* 4 KPIS Sans trait d'en-tête et alignés au début */}
          <View style={styles.kpiRowClean}>
            <View style={styles.kpiItemStart}>
              <Text style={[styles.kpiValueBold, { color: isDark ? themeColors.textPrimary : '#0F172A' }]}>
                {user?.kpi?.numeros_verifies ?? summary?.numeros_verifies ?? 127}
              </Text>
              <Text style={[styles.kpiLabelLeft, { color: isDark ? themeColors.textSecondary : '#64748B' }]}>
                {t('common.verifiedNumber')}{'\n'}
              </Text>
            </View>

            <View style={styles.kpiItemStart}>
              <Text style={[styles.kpiValueBold, { color: isDark ? themeColors.textPrimary : '#0F172A' }]}>
                25
              </Text>
              <Text style={[styles.kpiLabelLeft, { color: isDark ? themeColors.textSecondary : '#64748B' }]}>
                {t('common.avoidedThreats')}{'\n'}
              </Text>
            </View>

            <View style={styles.kpiItemStart}>
              <Text style={[styles.kpiValueBold, { color: isDark ? themeColors.textPrimary : '#0F172A' }]}>
                {user?.kpi?.signalements_effectues ?? summary?.signalements_effectues ?? 10}
              </Text>
              <Text style={[styles.kpiLabelLeft, { color: isDark ? themeColors.textSecondary : '#64748B' }]}>
                {t('common.reportsMade')}{'\n'}
              </Text>
            </View>

            <View style={styles.kpiItemStart}>
              <Text style={[styles.kpiValueBold, { color: isDark ? themeColors.textPrimary : '#0F172A' }]}>
                {user?.kpi?.transferts_proteges ?? summary?.transferts_proteges ?? 50}
              </Text>
              <Text style={[styles.kpiLabelLeft, { color: isDark ? themeColors.textSecondary : '#64748B' }]}>
                {t('common.transfers')}{'\n'}
              </Text>
            </View>
          </View>
        </View>

        {/* 4 BOUTONS D'ACTIONS RAPIDES */}
        <View style={styles.quickActionsRow}>
          {/* Vérifier un numéro */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push('/(app)/verify')}
            style={styles.actionBtnWrapper}
          >
            <View style={[styles.actionCircle, { backgroundColor: '#F1F5F9' }]}>
              <Icon name="solar:shield-user-bold" color="#161E33" size={26} />
            </View>
            <Text style={[styles.actionText, { color: isDark ? themeColors.textPrimary : '#161E33' }]}>
              {t('common.verifyNumber')}
            </Text>
          </TouchableOpacity>

          {/* Transfert d'argent */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push('/(app)/transfer')}
            style={styles.actionBtnWrapper}
          >
            <View style={[styles.actionCircle, { backgroundColor: '#F1F5F9' }]}>
              <Icon name="solar:transfer-horizontal-bold" color="#161E33" size={26} />
            </View>
            <Text style={[styles.actionText, { color: isDark ? themeColors.textPrimary : '#161E33' }]}>
              {t('common.moneyTransfer')}
            </Text>
          </TouchableOpacity>

          {/* Alerte Whatsapp */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push('/(app)/alert-whatsapp')}
            style={styles.actionBtnWrapper}
          >
            <View style={[styles.actionCircle, { backgroundColor: '#F1F5F9' }]}>
              <Icon name="ic:baseline-whatsapp" color="#161E33" size={26} />
            </View>
            <Text style={[styles.actionText, { color: isDark ? themeColors.textPrimary : '#161E33' }]}>
              {t('common.whatsappAlert')}
            </Text>
          </TouchableOpacity>

          {/* Signaler */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push('/(app)/report')}
            style={styles.actionBtnWrapper}
          >
            <View style={[styles.actionCircle, { backgroundColor: '#FCE8E6' }]}>
              <Icon name="heroicons:signal-16-solid" color="#D93025" size={26} />
            </View>
            <Text style={[styles.actionText, { color: '#D93025' }]}>
              {t('common.report')}
            </Text>
          </TouchableOpacity>
        </View>

        {/* EN-TÊTE ACTIVITÉ RÉCENTE AVEC BOUTON FILTRE (BLEU PRINCIPAL) */}
        <View style={styles.activityHeaderRow}>
          <Text style={[styles.sectionTitle, { color: themeColors.textPrimary }]}>
            {t('common.recentActivity')}
          </Text>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setShowFilters(!showFilters)}
            style={styles.filterIconButton}
          >
            <Icon name="solar:tuning-3-linear" color={isDark ? themeColors.textPrimary : '#161E33'} size={22} />
          </TouchableOpacity>
        </View>

        {/* LIGNE DE FILTRES DÉROULANTE QUAND ON CLIQUE SUR LE FILTRE */}
        {showFilters && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filterScrollRow}
            contentContainerStyle={styles.filterScrollContainer}
          >
            {filterOptions.map((opt) => {
              const isSelected = activeFilter === opt.key;
              return (
                <TouchableOpacity
                  key={opt.key}
                  activeOpacity={0.8}
                  onPress={() => setActiveFilter(opt.key)}
                  style={[
                    styles.filterPill,
                    {
                      backgroundColor: isSelected
                        ? '#E6F4EA'
                        : isDark
                        ? 'rgba(255, 255, 255, 0.06)'
                        : '#FFFFFF',
                      borderColor: isSelected ? colors.green : '#E2E8F0',
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.filterPillText,
                      { color: isSelected ? colors.green : isDark ? themeColors.textSecondary : '#64748B' },
                    ]}
                  >
                    {t(opt.labelKey)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}

        {/* LISTE DE L'ACTIVITÉ RÉCENTE EXACTE À LA MAQUETTE */}
        <View style={styles.activityList}>
          {filteredActivities.map((item: any) => {
            const badgeStyle = getBadgeStyle(item.badgeType, item.status);
            return (
              <TouchableOpacity
                key={item.id}
                activeOpacity={0.75}
                onPress={() => router.push({ pathname: '/(app)/verify', params: { phone: item.phone } })}
                style={[styles.activityCard, { backgroundColor: themeColors.cardBg, borderColor: themeColors.inputBorder }]}
              >
                {/* Avatar / Initiales */}
                <View
                  style={[
                    styles.activityAvatar,
                    item.initialBg ? { backgroundColor: item.initialBg } : item.initials ? { backgroundColor: colors.green } : {},
                  ]}
                >
                  {item.initials ? (
                    <Text style={styles.avatarInitialsText}>{item.initials}</Text>
                  ) : (
                    <Icon name="solar:user-bold" color="#94A3B8" size={20} />
                  )}
                </View>

                {/* Titre & Sous-titre à gauche */}
                <View style={styles.activityInfo}>
                  <Text numberOfLines={1} style={[styles.activityPhone, { color: themeColors.textPrimary }]}>
                    {item.phone}
                  </Text>
                  <Text numberOfLines={1} style={[styles.activityType, { color: themeColors.textSecondary }]}>
                    {item.type}
                  </Text>
                </View>

                {/* Badge de statut au milieu */}
                <View style={styles.activityBadgeCol}>
                  <View style={[styles.statusPill, { backgroundColor: badgeStyle.bg }]}>
                    <Text style={[styles.statusPillText, { color: badgeStyle.text }]}>
                      {item.status}
                    </Text>
                  </View>
                </View>

                {/* Date + Chevron à droite */}
                <View style={styles.activityRightCol}>
                  <Text numberOfLines={1} style={styles.activityDate}>{item.date}</Text>
                  <Icon name="solar:alt-arrow-right-linear" color="#CBD5E1" size={16} style={{ marginLeft: 4 }} />
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Navigation TabBar officielle */}
      <TabBar activeTab="home" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollBody: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  heroCard: {
    borderRadius: 20,
    padding: 20,
    marginTop: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
    marginBottom: 20,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarContainer: {
    marginRight: 14,
  },
  avatarImage: {
    width: 52,
    height: 52,
    borderRadius: 26,
  },
  avatarFallback: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.green,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: 'bold',
  },
  userInfo: {
    flex: 1,
  },
  welcomeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: fonts.bodyMedium,
  },
  userNameText: {
    fontSize: 20,
    lineHeight: 28,
    fontFamily: fonts.headlineBold,
    fontWeight: '800',
    marginTop: 2,
  },
  kpiRowClean: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 4,
  },
  kpiItemStart: {
    alignItems: 'flex-start',
    flex: 1,
  },
  kpiValueBold: {
    fontSize: 18,
    lineHeight: 24,
    fontFamily: fonts.headlineBold,
    fontWeight: '800',
  },
  kpiLabelLeft: {
    fontSize: 11,
    lineHeight: 14,
    fontFamily: fonts.bodySmall,
    textAlign: 'left',
    marginTop: 4,
  },
  quickActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  actionBtnWrapper: {
    alignItems: 'center',
    flex: 1,
  },
  actionCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionText: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: fonts.caption,
    textAlign: 'center',
    fontWeight: '600',
  },
  activityHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    lineHeight: 28,
    fontFamily: fonts.headlineBold,
    fontWeight: '800',
  },
  filterIconButton: {
    padding: 6,
  },
  filterScrollRow: {
    marginBottom: 14,
  },
  filterScrollContainer: {
    gap: 8,
  },
  filterPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterPillText: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: fonts.footnote,
    fontWeight: '600',
  },
  activityList: {
    gap: 10,
  },
  activityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
  },
  activityAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  avatarInitialsText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
    fontFamily: fonts.headlineBold,
  },
  activityInfo: {
    flex: 1.2,
  },
  activityPhone: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: fonts.headlineBold,
    fontWeight: '700',
  },
  activityType: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: fonts.bodySmall,
    color: '#94A3B8',
    marginTop: 2,
  },
  activityBadgeCol: {
    marginHorizontal: 4,
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusPillText: {
    fontSize: 11,
    lineHeight: 15,
    fontFamily: fonts.footnote,
    fontWeight: '600',
  },
  activityRightCol: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginLeft: 6,
  },
  activityDate: {
    fontSize: 11,
    lineHeight: 15,
    color: '#94A3B8',
    fontFamily: fonts.bodySmall,
  },
});
