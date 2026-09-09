import { useTranslation } from 'react-i18next';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface StatusDistributionChartProps {
  isLoading?: boolean;
}

const statusData = [
  { name: 'Sécurisé', value: 68420, color: '#56B039' },
  { name: 'À signaler', value: 12340, color: '#F6A020' },
  { name: 'Frauduleux', value: 3241, color: '#E4483B' },
];

export default function StatusDistributionChart({ isLoading = false }: StatusDistributionChartProps) {
  const { t } = useTranslation('admin');

  if (isLoading) {
    return (
      <div className="flex flex-col p-6 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#161E33] shadow-sm animate-pulse font-body">
        <div className="h-4 bg-slate-200 dark:bg-white/10 rounded w-48 mb-2" />
        <div className="h-3 bg-slate-200 dark:bg-white/10 rounded w-64 mb-6" />
        <div className="h-64 bg-slate-100 dark:bg-white/5 rounded-xl w-full" />
      </div>
    );
  }

  return (
    <div className="flex flex-col p-6 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#161E33] shadow-sm font-body h-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-title text-base font-bold text-slate-900 dark:text-white">
            {t('dashboard.statusChartTitle')}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {t('dashboard.statusChartSubtitle')}
          </p>
        </div>
      </div>

      <div className="h-64 w-full flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={statusData}
              dataKey="value"
              cx="50%"
              cy="45%"
              innerRadius={52}
              outerRadius={82}
              paddingAngle={3}
            >
              {statusData.map((s) => (
                <Cell key={s.name} fill={s.color} stroke="none" />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                borderRadius: '16px',
                fontSize: '12px',
                backgroundColor: '#161E33',
                borderColor: '#242f48',
                color: '#fff',
                fontFamily: 'Montserrat Alternates, sans-serif',
              }}
              formatter={(v: number) => v.toLocaleString('fr-FR')}
            />
            <Legend wrapperStyle={{ fontSize: 11 }} iconType="circle" />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
