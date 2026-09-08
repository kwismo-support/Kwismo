import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { cn } from '@/shared/lib/utils';

interface TrendChartProps {
  isLoading?: boolean;
}

const mockDataMap = {
  '7d': [
    { day: 'Lun', verifications: 1200, fraudes: 45 },
    { day: 'Mar', verifications: 1900, fraudes: 62 },
    { day: 'Mer', verifications: 1600, fraudes: 38 },
    { day: 'Jeu', verifications: 2100, fraudes: 85 },
    { day: 'Ven', verifications: 2800, fraudes: 110 },
    { day: 'Sam', verifications: 3400, fraudes: 140 },
    { day: 'Dim', verifications: 2900, fraudes: 95 },
  ],
  '30d': [
    { day: 'Sem 1', verifications: 8400, fraudes: 320 },
    { day: 'Sem 2', verifications: 11200, fraudes: 410 },
    { day: 'Sem 3', verifications: 14800, fraudes: 560 },
    { day: 'Sem 4', verifications: 18900, fraudes: 680 },
  ],
};

export default function TrendChart({ isLoading = false }: TrendChartProps) {
  const { t } = useTranslation('admin');
  const [period, setPeriod] = useState<'7d' | '30d'>('7d');

  if (isLoading) {
    return (
      <div className="flex flex-col p-6 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-brand-navy shadow-sm animate-pulse">
        <div className="h-4 bg-slate-200 dark:bg-white/10 rounded w-48 mb-2" />
        <div className="h-3 bg-slate-200 dark:bg-white/10 rounded w-64 mb-6" />
        <div className="h-64 bg-slate-100 dark:bg-white/5 rounded-xl w-full" />
      </div>
    );
  }

  const currentData = mockDataMap[period];

  return (
    <div className="flex flex-col p-6 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-brand-navy shadow-sm font-body">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-title text-base font-bold text-slate-900 dark:text-white">
              {t('dashboard.trendChartTitle', 'Tendance des Vérifications & Fraudes')}
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {t('dashboard.trendChartSubtitle', 'Évolution comparative du volume d\'OTPs et des attaques bloquées')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-brand-darkBg border border-slate-200 dark:border-white/10">
            <button
              onClick={() => setPeriod('7d')}
              className={cn(
                'px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer',
                period === '7d'
                  ? 'bg-white dark:bg-brand-navy text-brand-navy dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              )}
            >
              7 jours
            </button>
            <button
              onClick={() => setPeriod('30d')}
              className={cn(
                'px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer',
                period === '30d'
                  ? 'bg-white dark:bg-brand-navy text-brand-navy dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              )}
            >
              30 jours
            </button>
          </div>
        </div>
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
                backgroundColor: '#161E33',
                borderColor: '#242f48',
                color: '#fff',
                fontFamily: 'Ageo, sans-serif',
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
