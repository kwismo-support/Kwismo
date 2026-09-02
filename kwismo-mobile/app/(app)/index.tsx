import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
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

const RECENT_ACTIVITIES = [
  { id: '1', phone: '+237 6 98 44 43 88', type: 'Verification de numero', status: 'Faible', statusType: 'blue', time: 'hier, 21:47' },
  { id: '2', phone: '+237 6 98 44 43 88', type: 'Verification de numero', status: 'Détectée', statusType: 'red', time: 'hier, 21:47' },
  { id: '3', phone: '+237 6 98 44 43 88', type: 'Verification de numero', status: 'Protégé', statusType: 'green', time: 'hier, 21:47' },
  { id: '4', phone: '+237 6 98 44 43 88', type: 'Verification de numero', status: 'En cours', statusType: 'yellow', time: 'hier, 21:47' },
  { id: '5', phone: '+237 6 98 44 43 88', type: 'Verification de numero', status: 'Protégé', statusType: 'green', time: 'hier, 21:47' },
  { id: '6', phone: '+237 6 98 44 43 88', type: 'Verification de numero', status: 'Protégé', statusType: 'green', time: 'hier, 21:47' },
  { id: '7', phone: '+237 6 98 44 43 88', type: 'Verification de numero', status: 'Protégé', statusType: 'green', time: 'hier, 21:47' },
];

export default function DashboardHomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { isDark, colors: themeColors } = useAppTheme();

  const [activeFilter, setActiveFilter] = useState(0);
  const [loading, setLoading] = useState(true);
  const unreadNotifications = 3;

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  const filterTabs = [
    t('common.verifiedNumber'),
    t('common.avoidedThreats'),
    t('common.reportsMade'),
    t('common.transfers'),
  ];

  const getStatusStyle = (type: string) => {
    switch (type) {
      case 'blue':
        return { bg: isDark ? '#1E3A8A' : '#EBF3FF', text: '#3B82F6' };
      case 'red':
        return { bg: isDark ? '#7F1D1D' : '#FEE2E2', text: '#EF4444' };
      case 'green':
        return { bg: isDark ? '#064E3B' : '#E6F7F0', text: colors.green };
      case 'yellow':
        return { bg: isDark ? '#78350F' : '#FEF3C7', text: '#D97706' };
      default:
        return { bg: isDark ? '#334155' : '#F3F4F6', text: '#6B7280' };
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <StatusBar style="light" />

      {/* Header global unifié KWISMO */}
      <HeaderBar isHome={true} unreadNotificationsCount={unreadNotifications} />

      <ScrollView
        contentContainerStyle={{ paddingBottom: 110 }}
        showsVerticalScrollIndicator={false}
      >

        <View style={styles.actionGrid}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push('/(app)/verify')}
            style={styles.actionItem}
          >
            <View style={[styles.actionIconCircle, { backgroundColor: isDark ? '#1E293B' : '#EBF7F2' }]}>
              <Icon name="ri:user-scan-fill" color={colors.green} size={28} />
            </View>
            <Text style={[styles.actionLabel, { color: themeColors.textSecondary }]}>
              {t('common.verifyNumber')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push('/(app)/transfer')}
            style={styles.actionItem}
          >
            <View style={[styles.actionIconCircle, { backgroundColor: isDark ? '#1E293B' : '#EBF7F2' }]}>
              <Icon name="solar:square-transfer-horizontal-linear" color={colors.green} size={26} />
            </View>
            <Text style={[styles.actionLabel, { color: themeColors.textSecondary }]}>
              {t('common.moneyTransfer')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push('/(app)/alert-whatsapp')}
            style={styles.actionItem}
          >
            <View style={[styles.actionIconCircle, { backgroundColor: isDark ? '#1E293B' : '#EBF7F2' }]}>
              <Icon name="ic:baseline-whatsapp" color={colors.green} size={26} />
            </View>
            <Text style={[styles.actionLabel, { color: themeColors.textSecondary }]}>
              {t('common.whatsappAlert')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push('/(app)/report')}
            style={styles.actionItem}
          >
            <View style={[styles.actionIconCircle, { backgroundColor: isDark ? '#1E293B' : '#EBF7F2' }]}>
              <Icon name="heroicons:signal-16-solid" color={colors.green} size={26} />
            </View>
            <Text style={[styles.actionLabel, { color: themeColors.textSecondary }]}>
              {t('common.report')}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          {filterTabs.map((tab, idx) => (
            <TouchableOpacity
              key={`filter-${idx}`}
              activeOpacity={0.7}
              onPress={() => setActiveFilter(idx)}
              style={[
                styles.filterPill,
                {
                  backgroundColor: activeFilter === idx ? colors.green : themeColors.cardBg,
                  borderColor: activeFilter === idx ? colors.green : themeColors.inputBorder,
                },
              ]}
            >
              <Text
                style={[
                  styles.filterText,
                  { color: activeFilter === idx ? colors.white : themeColors.textSecondary },
                ]}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: themeColors.textPrimary }]}>
            {t('common.recentActivity')}
          </Text>
          <TouchableOpacity activeOpacity={0.7}>
            <Text style={styles.seeAllText}>{t('common.seeAll')}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.activityList}>
          <SkeletonLoader
            loading={loading}
            fallback={
              <>
                {Array.from({ length: 5 }).map((_, idx) => (
                  <View
                    key={`skel-activity-${idx}`}
                    style={[
                      styles.activityRow,
                      {
                        backgroundColor: themeColors.cardBg,
                        borderColor: themeColors.inputBorder,
                        borderWidth: isDark ? 1 : 0,
                      },
                    ]}
                  >
                    <SkeletonCircle size={42} style={{ marginRight: 12 }} />
                    <View style={{ flex: 1, gap: 6 }}>
                      <Skeleton width="65%" height={16} borderRadius={4} />
                      <Skeleton width="45%" height={12} borderRadius={4} />
                    </View>
                    <View style={styles.statusCenterContainer}>
                      <Skeleton width={60} height={24} borderRadius={12} />
                    </View>
                    <Skeleton width={50} height={12} borderRadius={4} />
                  </View>
                ))}
              </>
            }
          >
            {RECENT_ACTIVITIES.map((item) => {
              const badgeStyle = getStatusStyle(item.statusType);
              return (
                <TouchableOpacity
                  key={item.id}
                  activeOpacity={0.7}
                  onPress={() => router.push('/(app)/verify')}
                  style={[
                    styles.activityRow,
                    {
                      backgroundColor: themeColors.cardBg,
                      borderColor: themeColors.inputBorder,
                      borderWidth: isDark ? 1 : 0,
                    },
                  ]}
                >
                  <View style={styles.itemAvatar} />

                  <View style={styles.itemDetails}>
                    <Text style={[styles.itemPhone, { color: themeColors.textPrimary }]}>
                      {item.phone}
                    </Text>
                    <Text style={[styles.itemType, { color: themeColors.textSecondary }]}>
                      {item.type}
                    </Text>
                  </View>

                  <View style={styles.statusCenterContainer}>
                    <View
                      style={[
                        styles.statusBadge,
                        { backgroundColor: badgeStyle.bg },
                      ]}
                    >
                      <Text style={[styles.statusText, { color: badgeStyle.text }]}>
                        {item.status}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.itemRight}>
                    <Text style={[styles.itemTime, { color: themeColors.textSecondary }]}>
                      {item.time}
                    </Text>
                    <Icon name="solar:alt-arrow-right-linear" color={themeColors.inputPlaceholder} size={18} />
                  </View>
                </TouchableOpacity>
              );
            })}
          </SkeletonLoader>
        </View>
      </ScrollView>

      <TabBar activeTab="home" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerCard: {
    backgroundColor: colors.green,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  userLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FF9900',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  avatarText: {
    fontFamily: fonts.bold,
    fontSize: 18,
    color: colors.white,
  },
  greetingText: {
    fontFamily: fonts.h6,
    fontSize: scaleFont(18),
    fontWeight: '700',
    color: colors.white,
  },
  userRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconBtn: {
    padding: 6,
    position: 'relative',
  },
  badgeCountContainer: {
    position: 'absolute',
    top: 2,
    right: 2,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#FF3B30',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: colors.green,
  },
  badgeCountText: {
    fontFamily: fonts.bold,
    fontSize: 9,
    color: colors.white,
    lineHeight: 11,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    height: 48,
    borderRadius: 24,
    paddingHorizontal: 16,
  },
  searchInput: {
    flex: 1,
    fontFamily: fonts.medium,
    fontSize: 15,
    color: colors.white,
    height: '100%',
  },
  actionGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  actionItem: {
    alignItems: 'center',
    width: '22%',
  },
  actionIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  actionLabel: {
    fontFamily: fonts.medium,
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 14,
  },
  filterScroll: {
    paddingHorizontal: 20,
    gap: 10,
    marginBottom: 20,
  },
  filterPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterText: {
    fontFamily: fonts.medium,
    fontSize: 13,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontFamily: fonts.headlineBold,
    fontSize: scaleFont(17),
    fontWeight: '700',
  },
  seeAllText: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.green,
  },
  activityList: {
    paddingHorizontal: 20,
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  itemAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#94A3B8',
    marginRight: 12,
  },
  itemDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  itemPhone: {
    fontFamily: fonts.semiBold,
    fontSize: scaleFont(14),
    fontWeight: '600',
  },
  itemType: {
    fontFamily: fonts.regular,
    fontSize: scaleFont(11),
    marginTop: 2,
  },
  statusCenterContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusText: {
    fontFamily: fonts.medium,
    fontSize: 11,
    textAlign: 'center',
  },
  itemRight: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  itemTime: {
    fontFamily: fonts.regular,
    fontSize: 11,
    marginRight: 6,
  },
});
