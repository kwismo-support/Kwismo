import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  FlatList,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import {
  Search,
  Bell,
  MoreVertical,
  QrCode,
  ArrowLeftRight,
  MessageSquare,
  Radio,
  ChevronRight,
  Home,
  Users,
  CreditCard,
  User,
} from 'lucide-react-native';
import { LanguageSwitcher } from '../../src/shared/components/LanguageSwitcher';
import { SkeletonItem } from '../../src/shared/components/SkeletonItem';
import { colors, fonts } from '../../src/styles/tokens';

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

  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 700);
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
        return { bg: '#EBF3FF', text: '#3B82F6' };
      case 'red':
        return { bg: '#FEE2E2', text: '#EF4444' };
      case 'green':
        return { bg: '#E6F7F0', text: colors.green };
      case 'yellow':
        return { bg: '#FEF3C7', text: '#D97706' };
      default:
        return { bg: '#F3F4F6', text: '#6B7280' };
    }
  };

  return (
    <View style={styles.container}>
      {/* Scrollable Dashboard Body */}
      <ScrollView
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Header Card matching Image 1 */}
        <View style={[styles.headerCard, { paddingTop: insets.top + 12 }]}>
          {/* User Row */}
          <View style={styles.userRow}>
            <View style={styles.userLeft}>
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarText}>L</Text>
              </View>
              <Text style={styles.greetingText}>Hello, Lorem</Text>
            </View>

            <View style={styles.userRight}>
              <LanguageSwitcher darkTheme={true} />
              <TouchableOpacity activeOpacity={0.7} style={styles.iconBtn}>
                <Bell color={colors.white} size={22} />
                <View style={styles.badgeDot} />
              </TouchableOpacity>
              <TouchableOpacity activeOpacity={0.7} style={styles.iconBtn}>
                <MoreVertical color={colors.white} size={22} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Search Input Bar */}
          <View style={styles.searchBar}>
            <Search color={colors.white} size={20} style={{ opacity: 0.9, marginRight: 10 }} />
            <TextInput
              style={styles.searchInput}
              placeholder={t('common.search')}
              placeholderTextColor="rgba(255, 255, 255, 0.75)"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        {/* Quick Action Grid matching Image 1 */}
        <View style={styles.actionGrid}>
          {/* Action 1: Verify Number */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push('/(app)/verify')}
            style={styles.actionItem}
          >
            <View style={styles.actionIconCircle}>
              <QrCode color={colors.green} size={24} />
            </View>
            <Text style={styles.actionLabel}>{t('common.verifyNumber')}</Text>
          </TouchableOpacity>

          {/* Action 2: Money Transfer */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push('/(app)/transfer')}
            style={styles.actionItem}
          >
            <View style={styles.actionIconCircle}>
              <ArrowLeftRight color={colors.green} size={24} />
            </View>
            <Text style={styles.actionLabel}>{t('common.moneyTransfer')}</Text>
          </TouchableOpacity>

          {/* Action 3: Whatsapp Alert */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push('/(app)/alert-whatsapp')}
            style={styles.actionItem}
          >
            <View style={styles.actionIconCircle}>
              <MessageSquare color={colors.green} size={24} />
            </View>
            <Text style={styles.actionLabel}>{t('common.whatsappAlert')}</Text>
          </TouchableOpacity>

          {/* Action 4: Report */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push('/(app)/report')}
            style={styles.actionItem}
          >
            <View style={styles.actionIconCircle}>
              <Radio color={colors.green} size={24} />
            </View>
            <Text style={styles.actionLabel}>{t('common.report')}</Text>
          </TouchableOpacity>
        </View>

        {/* Horizontal Filter Pills */}
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
                activeFilter === idx && styles.filterPillActive,
              ]}
            >
              <Text
                style={[
                  styles.filterText,
                  activeFilter === idx && styles.filterTextActive,
                ]}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Recent Activity Header */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t('common.recentActivity')}</Text>
          <TouchableOpacity activeOpacity={0.7}>
            <Text style={styles.seeAllText}>{t('common.seeAll')}</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Activity List / Skeleton Loading */}
        <View style={styles.activityList}>
          {loading
            ? Array.from({ length: 5 }).map((_, idx) => (
                <View key={`skeleton-${idx}`} style={styles.skeletonRow}>
                  <SkeletonItem width={44} height={44} borderRadius={22} />
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <SkeletonItem width="60%" height={16} borderRadius={4} />
                    <SkeletonItem width="40%" height={12} borderRadius={4} style={{ marginTop: 6 }} />
                  </View>
                  <SkeletonItem width={60} height={20} borderRadius={10} />
                </View>
              ))
            : RECENT_ACTIVITIES.map((item) => {
                const badgeStyle = getStatusStyle(item.statusType);
                return (
                  <TouchableOpacity
                    key={item.id}
                    activeOpacity={0.7}
                    onPress={() => router.push('/(app)/verify')}
                    style={styles.activityRow}
                  >
                    <View style={styles.itemAvatar} />

                    <View style={styles.itemDetails}>
                      <Text style={styles.itemPhone}>{item.phone}</Text>
                      <Text style={styles.itemType}>{item.type}</Text>
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

                    <Text style={styles.itemTime}>{item.time}</Text>
                    <ChevronRight color="#CBD5E0" size={18} />
                  </TouchableOpacity>
                );
              })}
        </View>
      </ScrollView>

      {/* Fixed Bottom TabBar matching Image 1 */}
      <View style={[styles.tabBar, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <TouchableOpacity activeOpacity={0.8} style={styles.tabItem}>
          <View style={styles.tabActiveIconBg}>
            <Home color={colors.white} size={22} />
          </View>
          <Text style={[styles.tabLabel, styles.tabLabelActive]}>
            {t('common.home')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => router.push('/(app)/contacts')}
          style={styles.tabItem}
        >
          <Users color="#A0AEC0" size={22} />
          <Text style={styles.tabLabel}>{t('common.management')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => router.push('/(app)/transfer')}
          style={styles.tabItem}
        >
          <CreditCard color="#A0AEC0" size={22} />
          <Text style={styles.tabLabel}>{t('common.transfer')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => router.push('/(app)/profile')}
          style={styles.tabItem}
        >
          <User color="#A0AEC0" size={22} />
          <Text style={styles.tabLabel}>{t('common.profile')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  headerCard: {
    backgroundColor: colors.green,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
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
    fontSize: 18,
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
  badgeDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF4D4D',
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
    backgroundColor: '#EBF7F2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  actionLabel: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: '#64748B',
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
    borderColor: '#E2E8F0',
    backgroundColor: colors.white,
  },
  filterPillActive: {
    borderColor: colors.green,
    backgroundColor: '#E6F7F0',
  },
  filterText: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: '#94A3B8',
  },
  filterTextActive: {
    color: colors.green,
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
    fontSize: 17,
    color: colors.navy,
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
    backgroundColor: colors.white,
    padding: 12,
    borderRadius: 14,
    marginBottom: 10,
  },
  itemAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#D1D5DB',
    marginRight: 12,
  },
  itemDetails: {
    flex: 1,
  },
  itemPhone: {
    fontFamily: fonts.bold,
    fontSize: 15,
    color: colors.navy,
  },
  itemType: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: '#94A3B8',
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
    color: '#94A3B8',
    marginRight: 6,
  },
  skeletonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginBottom: 10,
  },
  tabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: colors.white,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    elevation: 10,
  },
  tabItem: {
    alignItems: 'center',
  },
  tabActiveIconBg: {
    width: 44,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.green,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  tabLabel: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: '#A0AEC0',
  },
  tabLabelActive: {
    color: colors.green,
  },
});
