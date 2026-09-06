import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Icon } from './Icon';
import { Skeleton } from './Skeleton';
import { useAppTheme } from '../hooks/useAppTheme';
import { colors, fonts } from '../../styles/tokens';
import { scaleFont } from '../lib/responsive';

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
}

export function DataTable<T extends { id: string | number }>({
  data,
  columns,
  pageSize = 5,
  loading = false,
  error,
  emptyText,
  onRowPress,
}: DataTableProps<T>) {
  const { t } = useTranslation();
  const { isDark, colors: themeColors } = useAppTheme();
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
      <View style={[styles.errorCard, { backgroundColor: themeColors.cardBg, borderColor: '#EF4444' }]}>
        <Icon name="solar:danger-triangle-bold" size={24} color="#EF4444" style={{ marginBottom: 6 }} />
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: themeColors.cardBg, borderColor: themeColors.inputBorder }]}>
      {/* Table Header */}
      <View style={[styles.headerRow, { borderBottomColor: themeColors.divider }]}>
        {columns.map((col) => (
          <Text
            key={col.key}
            style={[
              styles.headerCellText,
              { color: themeColors.textSecondary },
              col.width ? { width: col.width as any } : { flex: 1 },
            ]}
          >
            {col.header}
          </Text>
        ))}
      </View>

      {/* Table Body */}
      {loading ? (
        <View style={styles.skeletonBody}>
          {[1, 2, 3].map((idx) => (
            <View key={idx} style={styles.skeletonRow}>
              <Skeleton width="40%" height={16} borderRadius={4} />
              <Skeleton width="30%" height={16} borderRadius={4} />
              <Skeleton width="20%" height={16} borderRadius={4} />
            </View>
          ))}
        </View>
      ) : paginatedData.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon name="solar:inbox-line-bold" size={32} color="#94A3B8" />
          <Text style={[styles.emptyText, { color: themeColors.textSecondary }]}>
            {emptyText || t('common.noDataAvailable', 'Aucune donnée disponible')}
          </Text>
        </View>
      ) : (
        paginatedData.map((item, rowIdx) => (
          <TouchableOpacity
            key={item.id}
            activeOpacity={onRowPress ? 0.7 : 1}
            onPress={() => onRowPress && onRowPress(item)}
            style={[
              styles.dataRow,
              rowIdx < paginatedData.length - 1 && { borderBottomColor: themeColors.divider, borderBottomWidth: 1 },
            ]}
          >
            {columns.map((col) => (
              <View
                key={col.key}
                style={col.width ? { width: col.width as any } : { flex: 1 }}
              >
                {col.render ? (
                  col.render(item)
                ) : (
                  <Text style={[styles.dataCellText, { color: themeColors.textPrimary }]}>
                    {String((item as any)[col.key] ?? '')}
                  </Text>
                )}
              </View>
            ))}
          </TouchableOpacity>
        ))
      )}

      {/* Table Pagination Bar */}
      {data.length > 0 && !loading && (
        <View style={[styles.paginationRow, { borderTopColor: themeColors.divider }]}>
          <Text style={[styles.pageIndicatorText, { color: themeColors.textSecondary }]}>
            Page {currentPage} / {totalPages} ({data.length} {t('common.items', 'éléments')})
          </Text>

          <View style={styles.paginationButtonsRow}>
            <TouchableOpacity
              disabled={currentPage <= 1}
              onPress={handlePrev}
              style={[
                styles.pageBtn,
                {
                  borderColor: themeColors.inputBorder,
                  opacity: currentPage <= 1 ? 0.4 : 1,
                },
              ]}
            >
              <Icon name="solar:alt-arrow-left-linear" size={16} color={themeColors.textPrimary} />
            </TouchableOpacity>

            <TouchableOpacity
              disabled={currentPage >= totalPages}
              onPress={handleNext}
              style={[
                styles.pageBtn,
                {
                  borderColor: themeColors.inputBorder,
                  opacity: currentPage >= totalPages ? 0.4 : 1,
                },
              ]}
            >
              <Icon name="solar:alt-arrow-right-linear" size={16} color={themeColors.textPrimary} />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerCellText: {
    fontFamily: fonts.headlineBold,
    fontSize: scaleFont(12),
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  dataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  dataCellText: {
    fontFamily: fonts.medium,
    fontSize: scaleFont(13),
  },
  skeletonBody: {
    padding: 14,
    gap: 12,
  },
  skeletonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  emptyContainer: {
    paddingVertical: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontFamily: fonts.regular,
    fontSize: scaleFont(13),
    marginTop: 6,
  },
  errorCard: {
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
  },
  errorText: {
    color: '#EF4444',
    fontFamily: fonts.medium,
    fontSize: scaleFont(13),
    textAlign: 'center',
  },
  paginationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderTopWidth: 1,
  },
  pageIndicatorText: {
    fontFamily: fonts.regular,
    fontSize: scaleFont(12),
  },
  paginationButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pageBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
