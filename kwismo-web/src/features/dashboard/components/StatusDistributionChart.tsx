import { useTranslation } from 'react-i18next';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useTheme } from '@/shared/hooks/useTheme';

export interface StatusDataPoint {
  name: string;
  value: number;
  color: string;
}

interface StatusDistributionChartProps {
  isLoading?: boolean;
  data?: StatusDataPoint[];
}

const defaultStatusData: StatusDataPoint[] = [
  { name: 'Sécurisé', value: 0, color: '#56B039' },
  { name: 'À signaler', value: 0, color: '#F6A020' },
  { name: 'Frauduleux', value: 0, color: '#E4483B' },
];

export default function StatusDistributionChart({ isLoading = false, data }: StatusDistributionChartProps) {
  const { t } = useTranslation('admin');
  const { isDark } = useTheme();

  if (isLoading) {
    return (
      <div className="flex flex-col p-6 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#161E33] shadow-sm animate-pulse font-body">
        <div className="h-4 bg-slate-200 dark:bg-white/10 rounded w-48 mb-2" />
        <div className="h-3 bg-slate-200 dark:bg-white/10 rounded w-64 mb-6" />
        <div className="h-64 bg-slate-100 dark:bg-white/5 rounded-xl w-full" />
      </div>
    );
  }

  const chartData = data && data.length > 0 ? data : defaultStatusData;

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
              data={chartData}
              dataKey="value"
              cx="50%"
              cy="45%"
              innerRadius={52}
              outerRadius={82}
              paddingAngle={3}
            >
              {chartData.map((s) => (
                <Cell key={s.name} fill={s.color} stroke="none" />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                borderRadius: '16px',
                fontSize: '12px',
                backgroundColor: isDark ? '#1E293B' : '#94A3B8',
                borderColor: isDark ? '#334155' : '#64748B',
                color: isDark ? '#FFFFFF' : '#0F172A',
                fontFamily: 'Montserrat Alternates, sans-serif',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
              }}
              itemStyle={{
                color: isDark ? '#F8FAFC' : '#0F172A',
                fontSize: '12px',
                fontWeight: 600,
              }}
              labelStyle={{
                color: isDark ? '#FFFFFF' : '#0F172A',
                fontWeight: 700,
                marginBottom: '4px',
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
