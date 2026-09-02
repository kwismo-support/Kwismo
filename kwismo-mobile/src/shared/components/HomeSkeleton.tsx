import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Skeleton, SkeletonCircle } from '../ui/Skeleton';
import { useAppTheme } from '../hooks/useAppTheme';
import { colors } from '../../styles/tokens';

export const HomeSkeleton: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { isDark, colors: themeColors } = useAppTheme();

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 110 }}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. Header Card Skeleton */}
        <View style={[styles.headerCard, { paddingTop: Math.max(insets.top + 12, 24) }]}>
          {/* User Row Skeleton */}
          <View style={styles.userRow}>
            <View style={styles.userLeft}>
              <SkeletonCircle size={40} style={{ marginRight: 10 }} />
              <Skeleton
                width={120}
                height={18}
                borderRadius={6}
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.4)' }}
              />
            </View>

            <View style={styles.userRight}>
              <SkeletonCircle
                size={32}
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.3)' }}
              />
              <SkeletonCircle
                size={32}
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.3)' }}
              />
            </View>
          </View>

          {/* Search Bar Skeleton */}
          <View style={styles.searchBar}>
            <Skeleton
              width="100%"
              height={48}
              borderRadius={24}
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.3)' }}
            />
          </View>
        </View>

        {/* 2. Quick Action Grid Skeleton (4 action circles with labels) */}
        <View style={styles.actionGrid}>
          {Array.from({ length: 4 }).map((_, idx) => (
            <View key={`home-skel-action-${idx}`} style={styles.actionItem}>
              <SkeletonCircle size={56} style={{ marginBottom: 8 }} />
              <Skeleton width={52} height={12} borderRadius={4} />
            </View>
          ))}
        </View>

        {/* 3. Horizontal Filter Pills Skeleton */}
        <View style={styles.filterRow}>
          {[90, 110, 120, 80].map((width, idx) => (
            <Skeleton
              key={`home-skel-pill-${idx}`}
              width={width}
              height={36}
              borderRadius={18}
            />
          ))}
        </View>

        {/* 4. Section Header Skeleton */}
        <View style={styles.sectionHeader}>
          <Skeleton width={140} height={20} borderRadius={6} />
          <Skeleton width={60} height={16} borderRadius={4} />
        </View>

        {/* 5. Activity List Skeleton */}
        <View style={styles.activityList}>
          {Array.from({ length: 6 }).map((_, idx) => (
            <View
              key={`home-skel-row-${idx}`}
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
              <Skeleton width={64} height={22} borderRadius={11} />
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

export default HomeSkeleton;

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  userRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  searchBar: {
    width: '100%',
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
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 10,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 16,
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
});
