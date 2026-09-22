import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Modal,
  Linking,
  Clipboard,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useTranslation } from 'react-i18next';
import { Icon } from '@/shared/ui/Icon';
import { HeaderBar } from '@/shared/components/HeaderBar';
import { TabBar } from '@/shared/components/TabBar';
import { Skeleton, SkeletonLoader } from '@/shared/ui/Skeleton';
import { Button } from '@/shared/ui/Button';
import { useAppTheme } from '@/shared/hooks/useAppTheme';
import { toast } from '@/shared/store/toastStore';
import { transferApi, TransactionOut } from '@/features/transfer/services/transfer.api';

type DateFilter = 'all' | '24h' | '7d' | '30d' | '90d';

export default function TransferScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t, i18n } = useTranslation();
  const { isDark } = useAppTheme();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [transactions, setTransactions] = useState<TransactionOut[]>([]);
  const [activeFilter, setActiveFilter] = useState<DateFilter>('all');
  const [selectedTx, setSelectedTx] = useState<TransactionOut | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);

  const fetchTransactions = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await transferApi.getTransactions(1, 100);
      if (res.success && res.data) {
        const list = Array.isArray(res.data)
          ? res.data
          : Array.isArray((res.data as any).items)
          ? (res.data as any).items
          : [];
        setTransactions(list);
      } else {
        setTransactions([]);
      }
    } catch {
      setTransactions([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const dateFilterOptions: { key: DateFilter; labelKey: string }[] = useMemo(
    () => [
      { key: 'all', labelKey: 'transfer.filterAll' },
      { key: '24h', labelKey: 'transfer.filter24h' },
      { key: '7d', labelKey: 'transfer.filter7d' },
      { key: '30d', labelKey: 'transfer.filter30d' },
      { key: '90d', labelKey: 'transfer.filter90d' },
    ],
    []
  );

  const filteredTransactions = useMemo(() => {
    if (activeFilter === 'all') return transactions;
    const now = Date.now();
    const limits: Record<Exclude<DateFilter, 'all'>, number> = {
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000,
      '90d': 90 * 24 * 60 * 60 * 1000,
    };
    const maxDiff = limits[activeFilter];
    return transactions.filter((tx) => {
      const txTime = new Date(tx.date_transaction).getTime();
      return !isNaN(txTime) && now - txTime <= maxDiff;
    });
  }, [transactions, activeFilter]);

  const formatAmount = (amount: number) => {
    if (typeof amount !== 'number') return '0';
    return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    try {
      const d = new Date(dateString);
      if (isNaN(d.getTime())) return dateString;
      return d.toLocaleDateString(i18n.language.startsWith('en') ? 'en-US' : 'fr-FR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  const getStatusInfo = (statut?: string, niveauRisque?: string) => {
    const isHighRisk =
      niveauRisque === 'eleve' ||
      statut === 'blocked' ||
      statut === 'frauduleux' ||
      statut === 'cancelled';
    const isPending = statut === 'prepared' || statut === 'pending_offline';

    if (isHighRisk) {
      return {
        labelKey: statut === 'cancelled' ? 'transfer.statusCancelled' : 'transfer.statusBlocked',
        badgeBg: 'bg-red-50 dark:bg-red-950/40',
        badgeBorder: 'border-red-200 dark:border-red-800',
        badgeText: 'text-red-600 dark:text-red-400',
        icon: 'solar:danger-triangle-bold',
        iconColor: '#DC2626',
        riskLabelKey: 'transfer.riskHigh',
        riskTextColor: 'text-red-600 dark:text-red-400',
      };
    }

    if (isPending) {
      return {
        labelKey: 'transfer.statusPrepared',
        badgeBg: 'bg-amber-50 dark:bg-amber-950/40',
        badgeBorder: 'border-amber-200 dark:border-amber-800',
        badgeText: 'text-amber-700 dark:text-amber-400',
        icon: 'solar:clock-circle-bold',
        iconColor: '#D97706',
        riskLabelKey:
          niveauRisque === 'moyen' ? 'transfer.riskMedium' : 'transfer.riskLow',
        riskTextColor: 'text-amber-600 dark:text-amber-400',
      };
    }

    return {
      labelKey: 'transfer.statusConfirmed',
      badgeBg: 'bg-emerald-50 dark:bg-emerald-950/40',
      badgeBorder: 'border-emerald-200 dark:border-emerald-800',
      badgeText: 'text-brand-green',
      icon: 'solar:verified-check-bold',
      iconColor: '#16A34A',
      riskLabelKey: 'transfer.riskSecure',
      riskTextColor: 'text-brand-green',
    };
  };

  const handleOpenDetail = (tx: TransactionOut) => {
    setSelectedTx(tx);
    setDetailModalVisible(true);
  };

  const handleCopyUssd = (code: string) => {
    Clipboard.setString(code);
    toast.success(t('transfer.ussdCopied'));
  };

  const handleDialUssd = async (code: string) => {
    const telUrl = `tel:${encodeURIComponent(code)}`;
    try {
      const supported = await Linking.canOpenURL(telUrl);
      if (supported) {
        await Linking.openURL(telUrl);
      } else {
        Clipboard.setString(code);
        toast.info(t('transfer.ussdCopied'));
      }
    } catch {
      Clipboard.setString(code);
      toast.info(t('transfer.ussdCopied'));
    }
  };

  return (
    <View className="flex-1 bg-white dark:bg-brand-darkBg">
      <StatusBar style="light" />

      <HeaderBar
        title={t('transfer.title')}
        subtitle={t('transfer.subtitle')}
        showBack={false}
      />

      <ScrollView
        contentContainerStyle={{
          paddingBottom: Math.max(insets.bottom + 110, 120),
          paddingHorizontal: 16,
          paddingTop: 12,
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchTransactions(true)}
            colors={['#25B46E', '#F97316']}
          />
        }
      >
        {loading ? (
          <SkeletonLoader>
            <View className="gap-y-3 pt-2">
              {[1, 2, 3, 4].map((key) => (
                <View
                  key={key}
                  className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-brand-cardDark p-4"
                >
                  <View className="flex-row items-center justify-between mb-2">
                    <Skeleton width={140} height={18} borderRadius={4} />
                    <Skeleton width={90} height={20} borderRadius={6} />
                  </View>
                  <Skeleton width={100} height={14} borderRadius={4} />
                  <View className="my-3 border-t border-slate-100 dark:border-slate-800" />
                  <View className="flex-row items-center justify-between">
                    <Skeleton width={80} height={24} borderRadius={12} />
                    <Skeleton width={20} height={20} borderRadius={10} />
                  </View>
                </View>
              ))}
            </View>
          </SkeletonLoader>
        ) : transactions.length === 0 ? (
          <View className="py-12 px-4 items-center justify-center">
            <View className="wx-20 hx-20 rounded-full bg-emerald-50 dark:bg-emerald-950/40 items-center justify-center mb-5 border border-emerald-200/60 dark:border-emerald-800/60">
              <Icon name="solar:card-transfer-linear" size={40} color="#25B46E" />
            </View>

            <Text className="font-font-bold text-lg font-bold text-slate-900 dark:text-white text-center mb-2">
              {t('transfer.emptyHistoryTitle')}
            </Text>

            <Text className="font-font-regular text-xs text-slate-500 dark:text-slate-400 text-center leading-5 mb-8 max-w-[280px]">
              {t('transfer.emptyHistoryDesc')}
            </Text>

            <Button
              title={t('transfer.initiateTransferBtn')}
              onPress={() => router.push('/(app)/new-transfer')}
              variant="primary"
              size="md"
              leftIcon={<Icon name="solar:add-linear" color="#FFFFFF" size={20} />}
            />
          </View>
        ) : (
          <View>
            <View className="mb-3">
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 8, paddingVertical: 4 }}
              >
                {dateFilterOptions.map((opt) => {
                  const isSelected = activeFilter === opt.key;
                  return (
                    <TouchableOpacity
                      key={opt.key}
                      activeOpacity={0.8}
                      onPress={() => setActiveFilter(opt.key)}
                      className={`px-3.5 py-1.5 rounded-full border ${
                        isSelected
                          ? 'bg-emerald-50 dark:bg-emerald-950/50 border-brand-green'
                          : 'bg-slate-50 dark:bg-brand-cardDark border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      <Text
                        className={`text-xs font-medium ${
                          isSelected
                            ? 'text-brand-green font-bold'
                            : 'text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {t(opt.labelKey)}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {filteredTransactions.length === 0 ? (
              <View className="py-12 items-center justify-center">
                <Icon name="solar:filter-bold" size={32} color="#94A3B8" />
                <Text className="font-medium text-xs text-slate-500 dark:text-slate-400 mt-2 text-center">
                  {t('transfer.noTransactionsForPeriod')}
                </Text>
                <TouchableOpacity
                  onPress={() => setActiveFilter('all')}
                  className="mt-3 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800"
                >
                  <Text className="text-xs font-medium text-brand-green">
                    {t('transfer.filterAll')}
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View className="gap-y-3">
                {filteredTransactions.map((tx) => {
                  const phoneDisplay = tx.numero_telephone || tx.numero_id || '';
                  const statusInfo = getStatusInfo(tx.statut, tx.niveau_risque);

                  return (
                    <TouchableOpacity
                      key={tx.id}
                      activeOpacity={0.75}
                      onPress={() => handleOpenDetail(tx)}
                      className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-brand-cardDark p-4 shadow-sm"
                    >
                      <View className="flex-row items-center justify-between mb-1.5">
                        <View className="flex-row items-center flex-1 mr-2">
                          <View className="wx-10 hx-10 rounded-full bg-slate-100 dark:bg-slate-800 items-center justify-center mr-3">
                            <Icon name={statusInfo.icon} size={20} color={statusInfo.iconColor} />
                          </View>
                          <View className="flex-1">
                            <Text
                              numberOfLines={1}
                              className="font-font-bold text-sm font-bold text-slate-900 dark:text-white"
                            >
                              {phoneDisplay}
                            </Text>
                            <Text className="font-font-regular text-2xs text-slate-400 dark:text-slate-500">
                              {formatDate(tx.date_transaction)}
                            </Text>
                          </View>
                        </View>

                        <Text className="font-font-bold text-base font-extrabold text-brand-green">
                          {formatAmount(tx.montant)} <Text className="text-xs font-semibold">FCFA</Text>
                        </Text>
                      </View>

                      <View className="h-px bg-slate-100 dark:bg-slate-800/80 my-2" />

                      <View className="flex-row items-center justify-between">
                        <View
                          className={`px-2.5 py-0.5 rounded-full border ${statusInfo.badgeBg} ${statusInfo.badgeBorder}`}
                        >
                          <Text className={`text-2xs font-bold ${statusInfo.badgeText}`}>
                            {t(statusInfo.labelKey)}
                          </Text>
                        </View>

                        <View className="flex-row items-center">
                          {tx.operator_name ? (
                            <Text className="text-2xs font-medium text-slate-400 dark:text-slate-500 mr-2">
                              {tx.operator_name}
                            </Text>
                          ) : null}
                          <Icon name="solar:alt-arrow-right-linear" color="#94A3B8" size={16} />
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>
        )}
      </ScrollView>

      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => router.push('/(app)/new-transfer')}
        style={{ bottom: Math.max(insets.bottom + 72, 84) }}
        className="absolute right-5 wx-14 hx-14 rounded-full items-center justify-center bg-orange-500 shadow-lg shadow-orange-500/40 z-50"
      >
        <Icon name="solar:add-linear" color="#FFFFFF" size={28} />
      </TouchableOpacity>

      <TabBar activeTab="transfer" />

      <Modal
        visible={detailModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setDetailModalVisible(false)}
      >
        <View className="flex-1 bg-black/60 justify-end">
          <View className="rounded-t-3xl p-6 pb-9 bg-white dark:bg-brand-darkBg max-h-[85%]">
            <View className="flex-row items-center justify-between mb-5">
              <Text className="font-font-bold text-lg font-bold text-slate-900 dark:text-white">
                {t('transfer.detailTitle')}
              </Text>
              <TouchableOpacity onPress={() => setDetailModalVisible(false)}>
                <Icon name="solar:close-circle-bold" color="#94A3B8" size={26} />
              </TouchableOpacity>
            </View>

            {selectedTx && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <View className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-brand-cardDark items-center justify-center mb-5">
                  <Text className="font-font-bold text-3xl font-extrabold text-brand-green mb-1">
                    {formatAmount(selectedTx.montant)} <Text className="text-lg">FCFA</Text>
                  </Text>
                  <View
                    className={`px-3 py-1 rounded-full border mt-1.5 ${
                      getStatusInfo(selectedTx.statut, selectedTx.niveau_risque).badgeBg
                    } ${
                      getStatusInfo(selectedTx.statut, selectedTx.niveau_risque).badgeBorder
                    }`}
                  >
                    <Text
                      className={`text-xs font-bold ${
                        getStatusInfo(selectedTx.statut, selectedTx.niveau_risque).badgeText
                      }`}
                    >
                      {t(getStatusInfo(selectedTx.statut, selectedTx.niveau_risque).labelKey)}
                    </Text>
                  </View>
                </View>

                <View className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-brand-cardDark p-4 mb-5">
                  <View className="flex-row items-center justify-between py-2">
                    <Text className="font-medium text-xs text-slate-500 dark:text-slate-400">
                      {t('transfer.detailRecipient')}
                    </Text>
                    <Text className="font-bold text-sm text-slate-900 dark:text-white">
                      {selectedTx.numero_telephone || selectedTx.numero_id}
                    </Text>
                  </View>

                  <View className="h-px w-full bg-slate-100 dark:bg-slate-800 my-1" />

                  <View className="flex-row items-center justify-between py-2">
                    <Text className="font-medium text-xs text-slate-500 dark:text-slate-400">
                      {t('transfer.detailDate')}
                    </Text>
                    <Text className="font-semibold text-xs text-slate-800 dark:text-slate-200">
                      {formatDate(selectedTx.date_transaction)}
                    </Text>
                  </View>

                  {selectedTx.operator_name && (
                    <>
                      <View className="h-px w-full bg-slate-100 dark:bg-slate-800 my-1" />
                      <View className="flex-row items-center justify-between py-2">
                        <Text className="font-medium text-xs text-slate-500 dark:text-slate-400">
                          {t('transfer.detailOperator')}
                        </Text>
                        <Text className="font-semibold text-xs text-slate-800 dark:text-slate-200">
                          {selectedTx.operator_name}
                        </Text>
                      </View>
                    </>
                  )}

                  <View className="h-px w-full bg-slate-100 dark:bg-slate-800 my-1" />

                  <View className="flex-row items-center justify-between py-2">
                    <Text className="font-medium text-xs text-slate-500 dark:text-slate-400">
                      {t('transfer.detailRiskLevel')}
                    </Text>
                    <Text
                      className={`font-bold text-xs ${
                        getStatusInfo(selectedTx.statut, selectedTx.niveau_risque).riskTextColor
                      }`}
                    >
                      {t(
                        getStatusInfo(selectedTx.statut, selectedTx.niveau_risque).riskLabelKey
                      )}
                    </Text>
                  </View>

                  <View className="h-px w-full bg-slate-100 dark:bg-slate-800 my-1" />

                  <View className="flex-row items-center justify-between py-2">
                    <Text className="font-medium text-xs text-slate-500 dark:text-slate-400">
                      {t('transfer.detailRef')}
                    </Text>
                    <Text
                      numberOfLines={1}
                      className="font-medium text-2xs text-slate-400 dark:text-slate-500 max-w-[180px]"
                    >
                      {selectedTx.id}
                    </Text>
                  </View>
                </View>

                {selectedTx.code_ussd_genere && (
                  <View className="p-4 rounded-2xl border border-brand-green/40 bg-emerald-500/5 dark:bg-emerald-950/20 mb-5">
                    <Text className="font-bold text-xs text-slate-500 dark:text-slate-400 mb-1.5">
                      {t('transfer.detailUssdCode')}
                    </Text>
                    <Text className="font-bold text-xl text-slate-900 dark:text-white tracking-wider mb-3">
                      {selectedTx.code_ussd_genere}
                    </Text>

                    <View className="flex-row gap-2">
                      <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => handleCopyUssd(selectedTx.code_ussd_genere!)}
                        className="flex-1 flex-row items-center justify-center py-2.5 px-3 rounded-xl bg-slate-200 dark:bg-slate-700"
                      >
                        <Icon name="solar:copy-bold" size={16} color={isDark ? '#FFF' : '#161E33'} />
                        <Text className="text-xs font-bold ml-1.5 text-slate-900 dark:text-white">
                          {t('transfer.copyUssd')}
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => handleDialUssd(selectedTx.code_ussd_genere!)}
                        className="flex-1 flex-row items-center justify-center py-2.5 px-3 rounded-xl bg-brand-green"
                      >
                        <Icon name="solar:phone-calling-bold" size={16} color="#FFFFFF" />
                        <Text className="text-xs font-bold ml-1.5 text-white">
                          {t('transfer.dialUssd')}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}

                <Button
                  title={t('common.close')}
                  onPress={() => setDetailModalVisible(false)}
                  variant="secondary"
                  size="md"
                />
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}
