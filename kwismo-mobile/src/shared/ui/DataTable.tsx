import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Icon } from '@/shared/ui/Icon';
import { Skeleton } from '@/shared/ui/Skeleton';
import { useAppTheme } from '@/shared/hooks/useAppTheme';

export interface ColumnDef<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
  width?: number | string;
}

interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  pageSize?: number;
  loading?: boolean;
  error?: string;
  emptyText?: string;
  onRowPress?: (item: T) => void;
  className?: string;
}

export function DataTable<T extends { id: string | number }>({
  data,
  columns,
  pageSize = 5,
  loading = false,
  error,
  emptyText,
  onRowPress,
  className = '',
}: DataTableProps<T>) {
  const { t } = useTranslation();
  const { colors: themeColors } = useAppTheme();
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(data.length / pageSize) || 1;

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return data.slice(start, start + pageSize);
  }, [data, currentPage, pageSize]);

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  if (error) {
    return (
      <View className="p-4 rounded-2xl border border-red-500 bg-white dark:bg-brand-cardDark items-center">
        <Icon name="solar:danger-triangle-bold" size={24} color="#EF4444" className="mb-1.5" />
        <Text className="text-red-500 font-medium text-xs text-center">{error}</Text>
      </View>
    );
  }

  return (
    <View className={`rounded-2xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-brand-cardDark overflow-hidden ${className}`}>
      <View className="flex-row items-center px-3.5 py-3 border-b border-slate-200 dark:border-slate-700/60">
        {columns.map((col) => (
          <Text
            key={col.key}
            style={col.width ? { width: col.width as any } : undefined}
            className={`font-montserrat-bold text-2xs uppercase tracking-wider text-slate-500 dark:text-slate-400 ${
              col.width ? '' : 'flex-1'
            }`}
          >
            {col.header}
          </Text>
        ))}
      </View>

      {loading ? (
        <View className="p-3.5 gap-3">
          {[1, 2, 3].map((idx) => (
            <View key={idx} className="flex-row items-center justify-between">
              <Skeleton width="40%" height={16} borderRadius={4} />
              <Skeleton width="30%" height={16} borderRadius={4} />
              <Skeleton width="20%" height={16} borderRadius={4} />
            </View>
          ))}
        </View>
      ) : paginatedData.length === 0 ? (
        <View className="py-8 items-center justify-center">
          <Icon name="solar:inbox-line-bold" size={32} color="#94A3B8" />
          <Text className="font-regular text-xs text-slate-500 dark:text-slate-400 mt-1.5">
            {emptyText || t('common.noDataAvailable')}
          </Text>
        </View>
      ) : (
        paginatedData.map((item, rowIdx) => (
          <TouchableOpacity
            key={item.id}
            activeOpacity={onRowPress ? 0.7 : 1}
            onPress={() => onRowPress && onRowPress(item)}
            className={`flex-row items-center px-3.5 py-3 ${
              rowIdx < paginatedData.length - 1 ? 'border-b border-slate-200 dark:border-slate-700/40' : ''
            }`}
          >
            {columns.map((col) => (
              <View
                key={col.key}
                style={col.width ? { width: col.width as any } : undefined}
                className={col.width ? '' : 'flex-1'}
              >
                {col.render ? (
                  col.render(item)
                ) : (
                  <Text className="font-medium text-xs text-slate-900 dark:text-white">
                    {String((item as any)[col.key] ?? '')}
                  </Text>
                )}
              </View>
            ))}
          </TouchableOpacity>
        ))
      )}

      {data.length > 0 && !loading && (
        <View className="flex-row items-center justify-between px-3.5 py-2.5 border-t border-slate-200 dark:border-slate-700/60">
          <Text className="font-regular text-2xs text-slate-500 dark:text-slate-400">
            Page {currentPage} / {totalPages} ({data.length} {t('common.items')})
          </Text>

          <View className="flex-row items-center gap-2">
            <TouchableOpacity
              disabled={currentPage <= 1}
              onPress={handlePrev}
              className={`w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-700 items-center justify-center ${
                currentPage <= 1 ? 'opacity-40' : ''
              }`}
            >
              <Icon name="solar:alt-arrow-left-linear" size={16} color={themeColors.textPrimary} />
            </TouchableOpacity>

            <TouchableOpacity
              disabled={currentPage >= totalPages}
              onPress={handleNext}
              className={`w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-700 items-center justify-center ${
                currentPage >= totalPages ? 'opacity-40' : ''
              }`}
            >
              <Icon name="solar:alt-arrow-right-linear" size={16} color={themeColors.textPrimary} />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}
