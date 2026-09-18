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

  const totalNumbers = numbers.length;
  const totalReports = reports.length;
  const secureCount = numbers.filter((n) => n.statut === 'securise' || n.statut === 'active').length;
  const warningCount = numbers.filter((n) => n.statut === 'a_signaler' || n.statut === 'suspect').length;
  const fraudCount = numbers.filter((n) => n.statut === 'frauduleux' || n.statut === 'blocked').length;

  const uniqueOperatorNames = Array.from(
    new Set(
      numbers
        .map((n) => n.operator_name || (n.operator_id && !n.operator_id.startsWith('op_') ? n.operator_id : null))
        .filter(Boolean)
    )
  ) as string[];

  const palette = ['#32B07F', '#FF9900', '#6B98FF', '#161E33', '#E4483B', '#7C3AED', '#0891B2'];

  const operatorData: OperatorDataPoint[] = uniqueOperatorNames.map((opName, idx) => {
    const opNumbers = numbers.filter((n) => n.operator_name === opName || n.operator_id === opName);
    const fraudes = opNumbers.filter((n) => n.statut === 'frauduleux' || n.statut === 'blocked' || (n.score_risque && n.score_risque >= 70)).length;
    return {
      name: opName,
      fraudes,
      color: palette[idx % palette.length],
    };
  });

  const statusData: StatusDataPoint[] = [
    { name: 'Sécurisé', value: secureCount, color: '#56B039' },
    { name: 'À signaler', value: warningCount, color: '#F6A020' },
    { name: 'Frauduleux', value: fraudCount, color: '#E4483B' },
  ];

  const trend7d: TrendDataPoint[] = [
    { day: 'Lun', verifications: Math.round(totalNumbers * 0.1), fraudes: Math.round(fraudCount * 0.1) },
    { day: 'Mar', verifications: Math.round(totalNumbers * 0.15), fraudes: Math.round(fraudCount * 0.15) },
    { day: 'Mer', verifications: Math.round(totalNumbers * 0.2), fraudes: Math.round(fraudCount * 0.2) },
    { day: 'Jeu', verifications: Math.round(totalNumbers * 0.15), fraudes: Math.round(fraudCount * 0.15) },
    { day: 'Ven', verifications: Math.round(totalNumbers * 0.2), fraudes: Math.round(fraudCount * 0.2) },
    { day: 'Sam', verifications: Math.round(totalNumbers * 0.1), fraudes: Math.round(fraudCount * 0.1) },
    { day: 'Dim', verifications: Math.round(totalNumbers * 0.1), fraudes: Math.round(fraudCount * 0.1) },
  ];

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
      title: 'Numéros surveillés',
      value: totalNumbers.toLocaleString('fr-FR'),
      change: '0 %',
      isPositive: true,
      icon: 'solar:hashtags-bold-duotone',
      iconBgColor: 'text-brand-navy bg-brand-navy/10 dark:bg-brand-navy/30 dark:text-blue-300',
    },
    {
      title: 'Fraudes évitées',
      value: fraudCount.toLocaleString('fr-FR'),
      change: '0 %',
      isPositive: true,
      icon: 'solar:shield-check-bold-duotone',
      iconBgColor: 'text-brand-green bg-brand-green/10 dark:bg-brand-green/20',
    },
    {
      title: 'Signalements affiliés',
      value: totalReports.toLocaleString('fr-FR'),
      change: '0 %',
      isPositive: true,
      icon: 'solar:danger-triangle-bold-duotone',
      iconBgColor: 'text-brand-orange bg-brand-orange/10 dark:bg-brand-orange/20',
    },
    {
      title: 'Appels API',
      value: (findKpi('total_appels_api') ?? 0).toLocaleString('fr-FR'),
      change: '0 %',
      isPositive: true,
      icon: 'solar:server-bold-duotone',
      iconBgColor: 'text-brand-navy bg-brand-navy/10 dark:bg-brand-navy/30 dark:text-blue-300',
    },
    {
      title: 'Numéros de réputation sûre',
      value: secureCount.toLocaleString('fr-FR'),
      change: '0 %',
      isPositive: true,
      icon: 'solar:shield-bold-duotone',
      iconBgColor: 'text-brand-green bg-brand-green/10 dark:bg-brand-green/20',
    },
    {
      title: 'Score moyen de réputation',
      value: totalNumbers > 0 ? `${Math.round((secureCount / totalNumbers) * 100)} / 100` : '0 / 100',
      change: '0 %',
      isPositive: true,
      icon: 'solar:graph-up-bold-duotone',
      iconBgColor: 'text-brand-green bg-brand-green/10 dark:bg-brand-green/20',
    },
  ];

  const userCards = [
    {
      title: 'Mes cartes SIM vérifiées',
      value: secureCount.toString(),
      change: '0',
      isPositive: true,
      icon: 'solar:shield-check-bold-duotone',
      iconBgColor: 'text-brand-green bg-brand-green/10 dark:bg-brand-green/20',
    },
    {
      title: 'Tentatives d\'arnaque évitées',
      value: fraudCount.toString(),
      change: '0',
      isPositive: true,
      icon: 'solar:shield-bold-duotone',
      iconBgColor: 'text-brand-navy bg-brand-navy/10 dark:bg-brand-navy/30 dark:text-blue-300',
    },
    {
      title: 'Mes signalements effectués',
      value: totalReports.toString(),
      change: '0',
      isPositive: true,
      icon: 'solar:danger-triangle-bold-duotone',
      iconBgColor: 'text-brand-orange bg-brand-orange/10 dark:bg-brand-orange/20',
    },
  ];

  const cardsToRender = isPartner ? partnerCards : isUser ? userCards : adminCards;

  return (
    <div className="flex flex-col gap-6 p-6 font-body">
      <PageHeader
        title={t('dashboard.title')}
        subtitle={t('dashboard.subtitle')}
        showBreadcrumb={false}
      />

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-white dark:bg-[#161E33] p-4 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm">
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-white/5 p-1 rounded-xl">
          {(['7 jours', '30 jours', '90 jours', 'Cette année'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                period === p
                  ? 'bg-brand-navy text-white dark:bg-brand-orange dark:text-brand-navy shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="w-56">
            <CountrySelect
              value={countryFilter}
              onChange={(val) => setCountryFilter(val)}
              placeholder="Tous les pays..."
            />
          </div>

          <select
            value={operatorFilter}
            onChange={(e) => setOperatorFilter(e.target.value)}
            className="h-10 px-3 text-xs rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-blue"
          >
            <option value="">Tous les opérateurs</option>
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
          <TrendChart isLoading={loading} data7d={trend7d} />
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
