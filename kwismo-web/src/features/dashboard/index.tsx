import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { usePermissions } from '@/shared/hooks/usePermissions';
import { kpiApi, KpiItem } from './services/kpi.api';
import { PageHeader, KpiCard } from '@/shared/components';
import { CountrySelect } from '@/shared/ui/country-select';
import TrendChart from './components/TrendChart';
import FraudByOperatorChart from './components/FraudByOperatorChart';
import StatusDistributionChart from './components/StatusDistributionChart';
import RecentActivityLog from './components/RecentActivityLog';

export default function DashboardPage() {
  const { t } = useTranslation('admin');
  const { isPartner, isUser } = usePermissions();
  const [kpiItems, setKpiItems] = useState<KpiItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'7 jours' | '30 jours' | '90 jours' | 'Cette année'>('30 jours');
  const [countryFilter, setCountryFilter] = useState('');
  const [operatorFilter, setOperatorFilter] = useState('');

  useEffect(() => {
    let mounted = true;
    const fetchKpis = isPartner ? kpiApi.getPartnerKpi() : kpiApi.getGlobalKpi();
    fetchKpis
      .then((data) => {
        if (mounted) setKpiItems(data || []);
      })
      .catch(() => {
        if (mounted) setKpiItems([]);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => { mounted = false; };
  }, [isPartner]);

  const findKpi = (key: string) => kpiItems.find((k) => k.nom_indicateur === key)?.valeur;

  const adminCards = [
    {
      title: t('dashboard.activeUsers', { defaultValue: 'Utilisateurs actifs' }),
      value: (findKpi('total_utilisateurs') ?? 0).toLocaleString('fr-FR'),
      change: '+12,4 %',
      isPositive: true,
      icon: 'solar:users-group-two-rounded-bold-duotone',
      iconBgColor: 'text-brand-navy bg-brand-navy/10 dark:bg-brand-navy/30 dark:text-blue-300',
    },
    {
      title: t('dashboard.verifiedNumbers', { defaultValue: 'Numéros vérifiés' }),
      value: (findKpi('total_numeros_analyses') ?? 0).toLocaleString('fr-FR'),
      change: '+8,7 %',
      isPositive: true,
      icon: 'solar:database-bold-duotone',
      iconBgColor: 'text-brand-green bg-brand-green/10 dark:bg-brand-green/20',
    },
    {
      title: t('dashboard.reports', { defaultValue: 'Signalements' }),
      value: (findKpi('total_signalements') ?? 0).toLocaleString('fr-FR'),
      change: '+23,1 %',
      isPositive: true,
      icon: 'solar:danger-triangle-bold-duotone',
      iconBgColor: 'text-brand-orange bg-brand-orange/10 dark:bg-brand-orange/20',
    },
    {
      title: t('dashboard.blockedFrauds', { defaultValue: 'Taux de fraude bloquée' }),
      value: `${((findKpi('taux_fraude_detectee') ?? 0) * 100).toFixed(1)}%`,
      change: '+5,6 %',
      isPositive: false,
      icon: 'solar:shield-warning-bold-duotone',
      iconBgColor: 'text-rose-600 bg-rose-500/10 dark:text-rose-400 dark:bg-rose-500/20',
    },
    {
      title: t('dashboard.protectedTx', { defaultValue: 'Transferts protégés' }),
      value: (findKpi('total_transferts_proteges') ?? 0).toLocaleString('fr-FR'),
      change: '+18,2 %',
      isPositive: true,
      icon: 'solar:shield-check-bold-duotone',
      iconBgColor: 'text-brand-green bg-brand-green/10 dark:bg-brand-green/20',
    },
    {
      title: t('dashboard.apiCalls', { defaultValue: 'Appels API' }),
      value: '4,1M',
      change: '+31,5 %',
      isPositive: true,
      icon: 'solar:server-bold-duotone',
      iconBgColor: 'text-brand-navy bg-brand-navy/10 dark:bg-brand-navy/30 dark:text-blue-300',
    },
  ];

  const partnerCards = [
    {
      title: 'Numéros du périmètre surveillés',
      value: '28 430',
      change: '+4,2 %',
      isPositive: true,
      icon: 'solar:hashtags-bold-duotone',
      iconBgColor: 'text-brand-navy bg-brand-navy/10 dark:bg-brand-navy/30 dark:text-blue-300',
    },
    {
      title: 'Fraudes évitées sur le périmètre',
      value: '1 204',
      change: '+18,7 %',
      isPositive: true,
      icon: 'solar:shield-check-bold-duotone',
      iconBgColor: 'text-brand-green bg-brand-green/10 dark:bg-brand-green/20',
    },
    {
      title: 'Signalements affiliés',
      value: '3 812',
      change: '+9,3 %',
      isPositive: true,
      icon: 'solar:danger-triangle-bold-duotone',
      iconBgColor: 'text-brand-orange bg-brand-orange/10 dark:bg-brand-orange/20',
    },
    {
      title: 'Appels API (mois)',
      value: '94 200',
      change: '+31,5 %',
      isPositive: true,
      icon: 'solar:server-bold-duotone',
      iconBgColor: 'text-brand-navy bg-brand-navy/10 dark:bg-brand-navy/30 dark:text-blue-300',
    },
    {
      title: 'Coût estimé (USD)',
      value: '94,20 $',
      change: '+31,5 %',
      isPositive: false,
      icon: 'solar:dollar-minimalistic-bold-duotone',
      iconBgColor: 'text-brand-orange bg-brand-orange/10 dark:bg-brand-orange/20',
    },
    {
      title: 'Score moyen de réputation',
      value: '87 / 100',
      change: '+2,1 %',
      isPositive: true,
      icon: 'solar:graph-up-bold-duotone',
      iconBgColor: 'text-brand-green bg-brand-green/10 dark:bg-brand-green/20',
    },
  ];

  const userCards = [
    {
      title: 'Mes cartes SIM vérifiées',
      value: '3',
      change: '+1',
      isPositive: true,
      icon: 'solar:shield-check-bold-duotone',
      iconBgColor: 'text-brand-green bg-brand-green/10 dark:bg-brand-green/20',
    },
    {
      title: 'Tentatives d\'arnaque évitées',
      value: '12',
      change: '+3',
      isPositive: true,
      icon: 'solar:shield-bold-duotone',
      iconBgColor: 'text-brand-navy bg-brand-navy/10 dark:bg-brand-navy/30 dark:text-blue-300',
    },
    {
      title: 'Mes signalements effectués',
      value: '5',
      change: '+2',
      isPositive: true,
      icon: 'solar:danger-triangle-bold-duotone',
      iconBgColor: 'text-brand-orange bg-brand-orange/10 dark:bg-brand-orange/20',
    },
  ];

  const cardsToRender = isPartner ? partnerCards : isUser ? userCards : adminCards;

  return (
    <div className="flex flex-col gap-6 p-6 font-body">
      <PageHeader
        title={t('dashboard.title', { defaultValue: 'Tableau de bord' })}
        subtitle={t('dashboard.subtitle', { defaultValue: 'Supervision des indicateurs et de la réputation récurrente' })}
        showBreadcrumb={false}
      />

      {/* Period & Filter Controls */}
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
            <option value="MTN">MTN</option>
            <option value="Orange">Orange</option>
            <option value="Airtel">Airtel</option>
            <option value="Moov">Moov</option>
            <option value="Wave">Wave</option>
          </select>
        </div>
      </div>

      {/* KPI Cards */}
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

      {/* Charts Grid Row 1 */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <TrendChart isLoading={loading} />
        </div>
        <div>
          <StatusDistributionChart isLoading={loading} />
        </div>
      </div>

      {/* Charts Grid Row 2 */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div>
          <FraudByOperatorChart isLoading={loading} />
        </div>
        <div className="lg:col-span-2">
          <RecentActivityLog isLoading={loading} />
        </div>
      </div>
    </div>
  );
}



