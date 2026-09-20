import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { usePermissions } from '@/shared/hooks/usePermissions';
import { kpiApi, KpiItem } from './services/kpi.api';
import { numbersApi, NumberItem } from '@/features/numbers/services/numbers.api';
import { reportsApi, ReportItem } from '@/features/reports/services/reports.api';
import { PageHeader, KpiCard } from '@/shared/components';
import { CountrySelect } from '@/shared/ui/country-select';
import TrendChart, { TrendDataPoint } from './components/TrendChart';
import FraudByOperatorChart, { OperatorDataPoint } from './components/FraudByOperatorChart';
import StatusDistributionChart, { StatusDataPoint } from './components/StatusDistributionChart';
import RecentActivityLog from './components/RecentActivityLog';

export default function DashboardPage() {
  const { t } = useTranslation('admin');
  const { isPartner, isUser } = usePermissions();
  const [kpiItems, setKpiItems] = useState<KpiItem[]>([]);
  const [numbers, setNumbers] = useState<NumberItem[]>([]);
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'7 jours' | '30 jours' | '90 jours' | 'Cette année'>('30 jours');
  const [countryFilter, setCountryFilter] = useState('');
  const [operatorFilter, setOperatorFilter] = useState('');

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    const fetchKpis = isPartner ? kpiApi.getPartnerKpi() : kpiApi.getGlobalKpi();

    Promise.all([
      fetchKpis.catch(() => []),
      numbersApi.getNumbers(1, 100).catch(() => ({ items: [], total: 0 })),
      reportsApi.getReports(1, 100).catch(() => ({ items: [], total: 0 })),
    ]).then(([kpiRes, numbersRes, reportsRes]) => {
      if (!mounted) return;
      setKpiItems(kpiRes || []);
      setNumbers(numbersRes.items || []);
      setReports(reportsRes.items || []);
    }).finally(() => {
      if (mounted) setLoading(false);
    });

    return () => { mounted = false; };
  }, [isPartner]);

  const findKpi = (key: string) => kpiItems.find((k) => k.nom_indicateur === key)?.valeur;

  const filteredNumbers = numbers.filter((n) => {
    if (operatorFilter && n.operator_name !== operatorFilter && n.operator_id !== operatorFilter) return false;
    if (countryFilter && n.country_id && !n.country_id.toLowerCase().includes(countryFilter.toLowerCase())) return false;
    return true;
  });

  const filteredReports = reports;

  const totalNumbers = filteredNumbers.length;
  const totalReports = filteredReports.length;
  const secureCount = filteredNumbers.filter((n) => n.statut === 'securise' || n.statut === 'active').length;
  const warningCount = filteredNumbers.filter((n) => n.statut === 'a_signaler' || n.statut === 'suspect').length;
  const fraudCount = filteredNumbers.filter((n) => n.statut === 'frauduleux' || n.statut === 'blocked').length;

  const uniqueOperatorNames = Array.from(
    new Set(
      numbers
        .map((n) => n.operator_name || (n.operator_id && !n.operator_id.startsWith('op_') ? n.operator_id : null))
        .filter(Boolean)
    )
  ) as string[];

  const palette = ['#32B07F', '#FF9900', '#6B98FF', '#161E33', '#E4483B', '#7C3AED', '#0891B2'];

  const operatorData: OperatorDataPoint[] = uniqueOperatorNames.map((opName, idx) => {
    const opNumbers = filteredNumbers.filter((n) => n.operator_name === opName || n.operator_id === opName);
    const fraudes = opNumbers.filter((n) => n.statut === 'frauduleux' || n.statut === 'blocked' || (n.score_risque && n.score_risque >= 70)).length;
    return {
      name: opName,
      fraudes,
      color: palette[idx % palette.length],
    };
  });

  const statusData: StatusDataPoint[] = [
    { name: t('dashboard.statuses.secure'), value: secureCount, color: '#56B039' },
    { name: t('dashboard.statuses.warning'), value: warningCount, color: '#F6A020' },
    { name: t('dashboard.statuses.fraudulent'), value: fraudCount, color: '#E4483B' },
  ];

  const trendData: TrendDataPoint[] = (() => {
    if (period === '7 jours') {
      const days = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
      const verifRatios = [0.10, 0.15, 0.20, 0.15, 0.20, 0.10, 0.10];
      const fraudRatios = [0.08, 0.12, 0.18, 0.14, 0.22, 0.14, 0.12];
      return days.map((d, i) => ({
        day: d,
        verifications: Math.round(totalNumbers * verifRatios[i]),
        fraudes: Math.round(fraudCount * fraudRatios[i]),
      }));
    } else if (period === '30 jours') {
      const weeks = ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'];
      const verifRatios = [0.20, 0.30, 0.35, 0.15];
      const fraudRatios = [0.15, 0.35, 0.30, 0.20];
      return weeks.map((w, i) => ({
        day: w,
        verifications: Math.round(totalNumbers * verifRatios[i]),
        fraudes: Math.round(fraudCount * fraudRatios[i]),
      }));
    } else if (period === '90 jours') {
      const months = ['Mois 1', 'Mois 2', 'Mois 3'];
      const verifRatios = [0.25, 0.35, 0.40];
      const fraudRatios = [0.20, 0.40, 0.40];
      return months.map((m, i) => ({
        day: m,
        verifications: Math.round(totalNumbers * verifRatios[i]),
        fraudes: Math.round(fraudCount * fraudRatios[i]),
      }));
    } else {
      const quarters = ['T1', 'T2', 'T3', 'T4'];
      const verifRatios = [0.20, 0.25, 0.30, 0.25];
      const fraudRatios = [0.15, 0.25, 0.35, 0.25];
      return quarters.map((q, i) => ({
        day: q,
        verifications: Math.round(totalNumbers * verifRatios[i]),
        fraudes: Math.round(fraudCount * fraudRatios[i]),
      }));
    }
  })();

  const adminCards = [
    {
      title: t('dashboard.activeUsers'),
      value: (findKpi('total_utilisateurs') ?? 0).toLocaleString('fr-FR'),
      change: '+0 %',
      isPositive: true,
      icon: 'solar:users-group-two-rounded-bold-duotone',
      iconBgColor: 'text-brand-navy bg-brand-navy/10 dark:bg-brand-navy/30 dark:text-blue-300',
    },
    {
      title: t('dashboard.verifiedNumbers'),
      value: (findKpi('total_numeros_analyses') ?? totalNumbers).toLocaleString('fr-FR'),
      change: '+0 %',
      isPositive: true,
      icon: 'solar:database-bold-duotone',
      iconBgColor: 'text-brand-green bg-brand-green/10 dark:bg-brand-green/20',
    },
    {
      title: t('dashboard.reports'),
      value: (findKpi('total_signalements') ?? totalReports).toLocaleString('fr-FR'),
      change: '+0 %',
      isPositive: true,
      icon: 'solar:danger-triangle-bold-duotone',
      iconBgColor: 'text-brand-orange bg-brand-orange/10 dark:bg-brand-orange/20',
    },
    {
      title: t('dashboard.blockedFrauds'),
      value: `${((findKpi('taux_fraude_detectee') ?? 0) * 100).toFixed(1)}%`,
      change: '0 %',
      isPositive: true,
      icon: 'solar:shield-warning-bold-duotone',
      iconBgColor: 'text-rose-600 bg-rose-500/10 dark:text-rose-400 dark:bg-rose-500/20',
    },
    {
      title: t('dashboard.protectedTx'),
      value: (findKpi('total_transferts_proteges') ?? 0).toLocaleString('fr-FR'),
      change: '+0 %',
      isPositive: true,
      icon: 'solar:shield-check-bold-duotone',
      iconBgColor: 'text-brand-green bg-brand-green/10 dark:bg-brand-green/20',
    },
    {
      title: t('dashboard.apiCalls'),
      value: (findKpi('total_appels_api') ?? 0).toLocaleString('fr-FR'),
      change: '+0 %',
      isPositive: true,
      icon: 'solar:server-bold-duotone',
      iconBgColor: 'text-brand-navy bg-brand-navy/10 dark:bg-brand-navy/30 dark:text-blue-300',
    },
  ];

  const partnerCards = [
    {
      title: t('dashboard.partnerCards.monitoredNumbers'),
      value: totalNumbers.toLocaleString('fr-FR'),
      change: '0 %',
      isPositive: true,
      icon: 'solar:hashtags-bold-duotone',
      iconBgColor: 'text-brand-navy bg-brand-navy/10 dark:bg-brand-navy/30 dark:text-blue-300',
    },
    {
      title: t('dashboard.partnerCards.avoidedFrauds'),
      value: fraudCount.toLocaleString('fr-FR'),
      change: '0 %',
      isPositive: true,
      icon: 'solar:shield-check-bold-duotone',
      iconBgColor: 'text-brand-green bg-brand-green/10 dark:bg-brand-green/20',
    },
    {
      title: t('dashboard.partnerCards.affiliatedReports'),
      value: totalReports.toLocaleString('fr-FR'),
      change: '0 %',
      isPositive: true,
      icon: 'solar:danger-triangle-bold-duotone',
      iconBgColor: 'text-brand-orange bg-brand-orange/10 dark:bg-brand-orange/20',
    },
    {
      title: t('dashboard.partnerCards.apiCalls'),
      value: (findKpi('total_appels_api') ?? 0).toLocaleString('fr-FR'),
      change: '0 %',
      isPositive: true,
      icon: 'solar:server-bold-duotone',
      iconBgColor: 'text-brand-navy bg-brand-navy/10 dark:bg-brand-navy/30 dark:text-blue-300',
    },
    {
      title: t('dashboard.partnerCards.secureReputationNumbers'),
      value: secureCount.toLocaleString('fr-FR'),
      change: '0 %',
      isPositive: true,
      icon: 'solar:shield-bold-duotone',
      iconBgColor: 'text-brand-green bg-brand-green/10 dark:bg-brand-green/20',
    },
    {
      title: t('dashboard.partnerCards.avgReputationScore'),
      value: totalNumbers > 0 ? `${Math.round((secureCount / totalNumbers) * 100)} / 100` : '0 / 100',
      change: '0 %',
      isPositive: true,
      icon: 'solar:graph-up-bold-duotone',
      iconBgColor: 'text-brand-green bg-brand-green/10 dark:bg-brand-green/20',
    },
  ];

  const userCards = [
    {
      title: t('dashboard.userCards.verifiedSims'),
      value: secureCount.toString(),
      change: '0',
      isPositive: true,
      icon: 'solar:shield-check-bold-duotone',
      iconBgColor: 'text-brand-green bg-brand-green/10 dark:bg-brand-green/20',
    },
    {
      title: t('dashboard.userCards.avoidedScams'),
      value: fraudCount.toString(),
      change: '0',
      isPositive: true,
      icon: 'solar:shield-bold-duotone',
      iconBgColor: 'text-brand-navy bg-brand-navy/10 dark:bg-brand-navy/30 dark:text-blue-300',
    },
    {
      title: t('dashboard.userCards.myReports'),
      value: totalReports.toString(),
      change: '0',
      isPositive: true,
      icon: 'solar:danger-triangle-bold-duotone',
      iconBgColor: 'text-brand-orange bg-brand-orange/10 dark:bg-brand-orange/20',
    },
  ];

  const cardsToRender = isPartner ? partnerCards : isUser ? userCards : adminCards;

  const periodsList = [
    { key: '7 jours' as const, label: t('dashboard.periods.7d') },
    { key: '30 jours' as const, label: t('dashboard.periods.30d') },
    { key: '90 jours' as const, label: t('dashboard.periods.90d') },
    { key: 'Cette année' as const, label: t('dashboard.periods.year') },
  ];

  return (
    <div className="flex flex-col gap-6 p-6 font-body">
      <PageHeader
        title={t('dashboard.title')}
        subtitle={t('dashboard.subtitle')}
        showBreadcrumb={false}
      />

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-white dark:bg-[#161E33] p-4 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm">
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-white/5 p-1 rounded-xl">
          {periodsList.map((p) => (
            <button
              key={p.key}
              onClick={() => setPeriod(p.key)}
              className={`px-3 py-1.5 rounded text-xs font-semibold transition ${
                period === p.key
                  ? 'bg-brand-navy text-white dark:bg-brand-orange dark:text-brand-navy shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="w-56">
            <CountrySelect
              value={countryFilter}
              onChange={(val) => setCountryFilter(val)}
              placeholder={t('dashboard.allCountries')}
            />
          </div>

          <select
            value={operatorFilter}
            onChange={(e) => setOperatorFilter(e.target.value)}
            className="h-11 px-3 text-xs rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-blue"
          >
            <option value="">{t('dashboard.allOperators')}</option>
            {Array.from(
              new Set(
                numbers
                  .map((n) => n.operator_name || (n.operator_id && !n.operator_id.startsWith('op_') ? n.operator_id : null))
                  .filter(Boolean)
              )
            ).map((op) => (
              <option key={op as string} value={op as string}>
                {op as string}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className={`grid grid-cols-1 gap-4 sm:grid-cols-2 ${cardsToRender.length === 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-3 xl:grid-cols-6'}`}>
        {cardsToRender.map((card, idx) => (
          <KpiCard
            key={idx}
            title={card.title}
            value={card.value}
            change={card.change}
            isPositive={card.isPositive}
            icon={card.icon}
            iconBgColor={card.iconBgColor}
            isLoading={loading}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <TrendChart isLoading={loading} data={trendData} />
        </div>
        <div>
          <StatusDistributionChart isLoading={loading} data={statusData} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div>
          <FraudByOperatorChart isLoading={loading} data={operatorData} />
        </div>
        <div className="lg:col-span-2">
          <RecentActivityLog isLoading={loading} />
        </div>
      </div>
    </div>
  );
}
