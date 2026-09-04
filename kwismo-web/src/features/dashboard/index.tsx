import KpiCard from './components/KpiCard';
import TrendChart from './components/TrendChart';
import FraudByOperatorChart from './components/FraudByOperatorChart';

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6 p-6 font-body">
      {/* Header Page */}
      <div>
        <h1 className="font-title text-2xl font-bold text-slate-900 dark:text-white">
          Tableau de Bord Supervision
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Vue d'ensemble de l'activité, des vérifications et des menaces détectées.
        </p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Numéros Vérifiés"
          value="2 458 910"
          change="+14.2%"
          isPositive={true}
          icon="solar:shield-check-bold-duotone"
          color="text-brand-green bg-brand-green/10"
        />
        <KpiCard
          title="Fraudes Bloquées"
          value="184 320"
          change="+8.5%"
          isPositive={true}
          icon="solar:danger-triangle-bold-duotone"
          color="text-brand-orange bg-brand-orange/10"
        />
        <KpiCard
          title="Appels API (24h)"
          value="1 245 000"
          change="+22.1%"
          isPositive={true}
          icon="solar:code-square-bold-duotone"
          color="text-brand-blue bg-brand-blue/10"
        />
        <KpiCard
          title="Taux de Précision AI"
          value="98.7 %"
          change="+0.4%"
          isPositive={true}
          icon="solar:cpu-bold-duotone"
          color="text-purple-500 bg-purple-500/10"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <TrendChart />
        </div>
        <div>
          <FraudByOperatorChart />
        </div>
      </div>
    </div>
  );
}
