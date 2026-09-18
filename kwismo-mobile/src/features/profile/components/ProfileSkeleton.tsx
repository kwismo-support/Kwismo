import React from 'react';
import { View } from 'react-native';
import { Skeleton, SkeletonCircle, SkeletonLoader } from '@/shared/ui/Skeleton';

export function ProfileSkeleton() {
  return (
    <SkeletonLoader>
      <View className="flex-row items-center p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-brand-cardDark mb-4">
        <SkeletonCircle size={56} />
        <View className="flex-1 ml-3.5 gap-y-2">
          <Skeleton width={100} height={14} borderRadius={4} />
          <Skeleton width={160} height={20} borderRadius={4} />
        </View>
      </View>
    </SkeletonLoader>
  );
}

export function SessionsSkeleton() {
  return (
    <SkeletonLoader>
      <View className="gap-y-3">
        {[1, 2, 3].map((item) => (
          <View key={item} className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-brand-cardDark gap-y-3">
            <View className="flex-row items-center gap-3">
              <Skeleton width={40} height={40} borderRadius={12} />
              <View className="flex-1 gap-y-1.5">
                <Skeleton width={140} height={16} borderRadius={4} />
                <Skeleton width={180} height={12} borderRadius={4} />
              </View>
            </View>
          </View>
        ))}
      </View>
    </SkeletonLoader>
  );
}
