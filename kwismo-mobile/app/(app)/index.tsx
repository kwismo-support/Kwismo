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
import { HeaderActions } from '../../src/shared/components/HeaderActions';
import { HomeSkeleton } from '../../src/shared/components/HomeSkeleton';
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

  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState(0);
  const unreadNotifications = 3;

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <HomeSkeleton />;
  }

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

      <ScrollView
        contentContainerStyle={{ paddingBottom: 110 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.headerCard, { paddingTop: Math.max(insets.top + 10, 20) }]}>
          <View style={styles.userRow}>
            <View style={styles.userLeft}>
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarText}>L</Text>
              </View>
              <Text style={styles.greetingText}>Hello, Lorem</Text>
            </View>

            <View style={styles.userRight}>
              <HeaderActions
                unreadNotificationsCount={unreadNotifications}
                iconColor={colors.white}
              />
            </View>
          </View>

          <View style={styles.searchBar}>
            <Icon name="solar:magnifer-linear" color={colors.white} size={20} style={{ opacity: 0.9, marginRight: 10 }} />
            <TextInput
              style={[styles.searchInput, Platform.OS === 'web' ? ({ outline: 'none' } as any) : {}]}
              placeholder={t('common.search')}
              placeholderTextColor="rgba(255, 255, 255, 0.75)"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        <View style={styles.actionGrid}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push('/(app)/verify')}
            style={styles.actionItem}
          >
            <View style={[styles.actionIconCircle, { backgroundColor: isDark ? '#1E293B' : '#EBF7F2' }]}>
              <Icon name="solar:face-id-square-linear" color={colors.green} size={26} />
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
              <Icon name="solar:card-transfer-linear" color={colors.green} size={24} />
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
              <Icon name="ic:baseline-whatsapp" color={colors.green} size={24} />
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
              <Icon name="solar:radar-2-linear" color={colors.green} size={24} />
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
                  backgroundColor: themeColors.cardBg,
                  borderColor: activeFilter === idx ? colors.green : themeColors.inputBorder,
                },
                activeFilter === idx && {
                  backgroundColor: isDark ? '#064E3B' : '#E6F7F0',
                },
              ]}
            >
              <Text
                style={[
                  styles.filterText,
                  { color: themeColors.textSecondary },
                  activeFilter === idx && { color: colors.green, fontWeight: '700' },
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

                <Text style={[styles.itemTime, { color: themeColors.textSecondary }]}>
                  {item.time}
                </Text>
                <Icon name="solar:alt-arrow-right-linear" color={themeColors.inputPlaceholder} size={18} />
              </TouchableOpacity>
            );
          })}
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
    fontFamily: fonts.bold,
    fontSize: scaleFont(17),
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
  },
  itemPhone: {
    fontFamily: fonts.bold,
    fontSize: scaleFont(15),
  },
  itemType: {
    fontFamily: fonts.regular,
    fontSize: scaleFont(12),
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  statusText: {
    fontFamily: fonts.medium,
    fontSize: 11,
  },
  itemTime: {
    fontFamily: fonts.regular,
    fontSize: 11,
    marginRight: 6,
  },
});
