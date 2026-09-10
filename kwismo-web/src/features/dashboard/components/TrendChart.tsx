import { useTranslation } from 'react-i18next';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface TrendChartProps {
  isLoading?: boolean;
}

const mockData = [
  { day: 'Lun', verifications: 1200, fraudes: 45 },
  { day: 'Mar', verifications: 1900, fraudes: 62 },
  { day: 'Mer', verifications: 1600, fraudes: 38 },
  { day: 'Jeu', verifications: 2100, fraudes: 85 },
  { day: 'Ven', verifications: 2800, fraudes: 110 },
  { day: 'Sam', verifications: 3400, fraudes: 140 },
  { day: 'Dim', verifications: 2900, fraudes: 95 },
];

export default function TrendChart({ isLoading = false }: TrendChartProps) {
  const { t } = useTranslation('admin');

  if (isLoading) {
    return (
      <div className="flex flex-col p-6 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#161E33] shadow-sm animate-pulse">
        <div className="h-4 bg-slate-200 dark:bg-white/10 rounded w-48 mb-2" />
        <div className="h-3 bg-slate-200 dark:bg-white/10 rounded w-64 mb-6" />
        <div className="h-64 bg-slate-100 dark:bg-white/5 rounded-xl w-full" />
      </div>
    );
  }

  return (
    <div className="flex flex-col p-6 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#161E33] shadow-sm font-body">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-title text-base font-bold text-slate-900 dark:text-white">
            {t('dashboard.trendChartTitle')}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {t('dashboard.trendChartSubtitle')}
          </p>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={mockData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorVerif" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#32B07F" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#32B07F" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorFraude" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#FF9900" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#FF9900" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
            <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} />
            <YAxis stroke="#94a3b8" fontSize={11} />
            <Tooltip contentStyle={{ borderRadius: '12px', fontSize: '12px' }} />
            <Area
              type="monotone"
              dataKey="verifications"
              stroke="#32B07F"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorVerif)"
              name={t('dashboard.verifiedNumbers')}
            />
            <Area
              type="monotone"
              dataKey="fraudes"
              stroke="#FF9900"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorFraude)"
              name={t('dashboard.blockedFrauds')}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
