import { useTranslation } from 'react-i18next';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface FraudByOperatorChartProps {
  isLoading?: boolean;
}

const operatorData = [
  { name: 'Orange', fraudes: 420, color: '#FF9900' },
  { name: 'MTN', fraudes: 380, color: '#32B07F' },
  { name: 'Moov', fraudes: 190, color: '#6B98FF' },
  { name: 'Wave', fraudes: 120, color: '#161E33' },
  { name: 'Free', fraudes: 85, color: '#e53e3e' },
];

export default function FraudByOperatorChart({ isLoading = false }: FraudByOperatorChartProps) {
  const { t } = useTranslation('admin');

  if (isLoading) {
    return (
      <div className="flex flex-col p-6 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-brand-navy shadow-sm animate-pulse font-body">
        <div className="h-4 bg-slate-200 dark:bg-white/10 rounded w-48 mb-2" />
        <div className="h-3 bg-slate-200 dark:bg-white/10 rounded w-64 mb-6" />
        <div className="h-64 bg-slate-100 dark:bg-white/5 rounded-xl w-full" />
      </div>
    );
  }

  return (
    <div className="flex flex-col p-6 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-brand-navy shadow-sm font-body">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-title text-base font-bold text-slate-900 dark:text-white">
            {t('dashboard.operatorChartTitle', 'Répartition des Fraudes par Opérateur')}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {t('dashboard.operatorChartSubtitle', 'Volume de tentatives bloquées par réseau télécom')}
          </p>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={operatorData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
            <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
            <YAxis stroke="#94a3b8" fontSize={11} />
            <Tooltip
              contentStyle={{
                borderRadius: '16px',
                fontSize: '12px',
                backgroundColor: '#161E33',
                borderColor: '#242f48',
                color: '#fff',
                fontFamily: 'Ageo, sans-serif',
              }}
            />
            <Bar dataKey="fraudes" radius={[8, 8, 0, 0]} name={t('dashboard.blockedFrauds', 'Fraudes Bloquées')}>
              {operatorData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
