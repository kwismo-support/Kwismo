import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { cn } from '@/shared/lib/utils';
import { useTheme } from '@/shared/hooks/useTheme';

export interface TrendDataPoint {
  day: string;
  verifications: number;
  fraudes: number;
}

interface TrendChartProps {
  isLoading?: boolean;
  data?: TrendDataPoint[];
  data7d?: TrendDataPoint[];
  data30d?: TrendDataPoint[];
}

const empty7d: TrendDataPoint[] = [
  { day: 'Lun', verifications: 0, fraudes: 0 },
  { day: 'Mar', verifications: 0, fraudes: 0 },
  { day: 'Mer', verifications: 0, fraudes: 0 },
  { day: 'Jeu', verifications: 0, fraudes: 0 },
  { day: 'Ven', verifications: 0, fraudes: 0 },
  { day: 'Sam', verifications: 0, fraudes: 0 },
  { day: 'Dim', verifications: 0, fraudes: 0 },
];

const empty30d: TrendDataPoint[] = [
  { day: 'Sem 1', verifications: 0, fraudes: 0 },
  { day: 'Sem 2', verifications: 0, fraudes: 0 },
  { day: 'Sem 3', verifications: 0, fraudes: 0 },
  { day: 'Sem 4', verifications: 0, fraudes: 0 },
];

export default function TrendChart({ isLoading = false, data, data7d, data30d }: TrendChartProps) {
  const { t } = useTranslation('admin');
  const { isDark } = useTheme();
  const [internalPeriod, setInternalPeriod] = useState<'7d' | '30d'>('7d');

  if (isLoading) {
    return (
      <div className="flex flex-col p-6 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-brand-navy shadow-sm animate-pulse">
        <div className="h-4 bg-slate-200 dark:bg-white/10 rounded w-48 mb-2" />
        <div className="h-3 bg-slate-200 dark:bg-white/10 rounded w-64 mb-6" />
        <div className="h-64 bg-slate-100 dark:bg-white/5 rounded-xl w-full" />
      </div>
    );
  }

  const currentData = data && data.length > 0 
    ? data 
    : internalPeriod === '7d' 
      ? (data7d && data7d.length > 0 ? data7d : empty7d) 
      : (data30d && data30d.length > 0 ? data30d : empty30d);

  return (
    <div className="flex flex-col p-6 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-brand-navy shadow-sm font-body">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-title text-base font-bold text-slate-900 dark:text-white">
              {t('dashboard.trendChartTitle')}
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {t('dashboard.trendChartSubtitle')}
          </p>
        </div>

        {!data && (
          <div className="flex items-center gap-2">
            <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-brand-darkBg border border-slate-200 dark:border-white/10">
              <button
                onClick={() => setInternalPeriod('7d')}
                className={cn(
                  'px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer',
                  internalPeriod === '7d'
                    ? 'bg-white dark:bg-brand-navy text-brand-navy dark:text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                )}
              >
                7 jours
              </button>
              <button
                onClick={() => setInternalPeriod('30d')}
                className={cn(
                  'px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer',
                  internalPeriod === '30d'
                    ? 'bg-white dark:bg-brand-navy text-brand-navy dark:text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                )}
              >
                30 jours
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-6 mb-4 text-xs font-semibold">
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-brand-green" />
          <span className="text-slate-700 dark:text-slate-300">Vérifications Valides</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-brand-orange" />
          <span className="text-slate-700 dark:text-slate-300">Tentatives Bloquées</span>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={currentData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
            <Area
              type="monotone"
              dataKey="verifications"
              stroke="#32B07F"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorVerif)"
              name="Vérifications Valides"
            />
            <Area
              type="monotone"
              dataKey="fraudes"
              stroke="#FF9900"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorFraude)"
              name="Fraudes Bloquées"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
