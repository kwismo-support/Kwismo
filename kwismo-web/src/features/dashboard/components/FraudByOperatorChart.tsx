import { useTranslation } from 'react-i18next';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useTheme } from '@/shared/hooks/useTheme';

export interface OperatorDataPoint {
  name: string;
  fraudes: number;
  color?: string;
}

interface FraudByOperatorChartProps {
  isLoading?: boolean;
  data?: OperatorDataPoint[];
}

const defaultOperators: OperatorDataPoint[] = [
  { name: 'MTN', fraudes: 0, color: '#32B07F' },
  { name: 'Orange', fraudes: 0, color: '#FF9900' },
  { name: 'Airtel', fraudes: 0, color: '#6B98FF' },
  { name: 'Moov', fraudes: 0, color: '#161E33' },
  { name: 'Wave', fraudes: 0, color: '#e53e3e' },
];

export default function FraudByOperatorChart({ isLoading = false, data }: FraudByOperatorChartProps) {
  const { t } = useTranslation('admin');
  const { isDark } = useTheme();

  if (isLoading) {
    return (
      <div className="flex flex-col p-6 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-brand-navy shadow-sm animate-pulse font-body">
        <div className="h-4 bg-slate-200 dark:bg-white/10 rounded w-48 mb-2" />
        <div className="h-3 bg-slate-200 dark:bg-white/10 rounded w-64 mb-6" />
        <div className="h-64 bg-slate-100 dark:bg-white/5 rounded-xl w-full" />
      </div>
    );
  }

  const chartData = data && data.length > 0 ? data : defaultOperators;

  return (
    <div className="flex flex-col p-6 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-brand-navy shadow-sm font-body">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-title text-base font-bold text-slate-900 dark:text-white">
            {t('dashboard.operatorChartTitle')}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {t('dashboard.operatorChartSubtitle')}
          </p>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
            <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
            <YAxis stroke="#94a3b8" fontSize={11} />
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
            />
            <Bar dataKey="fraudes" radius={[8, 8, 0, 0]} name={t('dashboard.blockedFrauds')}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color || '#32B07F'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
