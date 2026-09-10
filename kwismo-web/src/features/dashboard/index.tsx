import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '@/shared/lib/api';
import type { KpiSummaryDTO } from '@/shared/mock';
import KpiCard from './components/KpiCard';
import TrendChart from './components/TrendChart';
import FraudByOperatorChart from './components/FraudByOperatorChart';

export default function DashboardPage() {
  const { t } = useTranslation('admin');
  const [kpis, setKpis] = useState<KpiSummaryDTO | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    api.getKpiSummary()
      .then((data) => {
        if (mounted) setKpis(data);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => { mounted = false; };
  }, []);

  return (
    <div className="flex flex-col gap-6 p-6 font-body">
      <div>
        <h1 className="font-title text-2xl font-bold text-slate-900 dark:text-white">
          {t('dashboard.title')}
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {t('dashboard.subtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title={t('dashboard.verifiedNumbers')}
          value={kpis ? kpis.verifiedNumbers.toLocaleString() : '0'}
          change={kpis?.verifiedChange}
          isPositive={true}
          icon="solar:shield-check-bold-duotone"
          color="text-brand-green bg-brand-green/10"
          isLoading={loading}
        />
        <KpiCard
          title={t('dashboard.blockedFrauds')}
          value={kpis ? kpis.blockedFrauds.toLocaleString() : '0'}
          change={kpis?.blockedChange}
          isPositive={true}
          icon="solar:danger-triangle-bold-duotone"
          color="text-brand-orange bg-brand-orange/10"
          isLoading={loading}
        />
        <KpiCard
          title={t('dashboard.apiCalls')}
          value={kpis ? kpis.apiCalls24h.toLocaleString() : '0'}
          change={kpis?.apiCallsChange}
          isPositive={true}
          icon="solar:code-square-bold-duotone"
          color="text-brand-blue bg-brand-blue/10"
          isLoading={loading}
        />
        <KpiCard
          title={t('dashboard.aiAccuracy')}
          value={kpis ? `${kpis.aiAccuracy} %` : '0 %'}
          change={kpis?.aiAccuracyChange}
          isPositive={true}
          icon="solar:cpu-bold-duotone"
          color="text-purple-500 bg-purple-500/10"
          isLoading={loading}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <TrendChart isLoading={loading} />
        </div>
        <div>
          <FraudByOperatorChart isLoading={loading} />
        </div>
      </div>
    </div>
  );
}
