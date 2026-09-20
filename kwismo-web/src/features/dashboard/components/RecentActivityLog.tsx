import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from '@iconify/react';
import { reportsApi, ReportItem } from '@/features/reports/services/reports.api';

interface RecentActivityLogProps {
  isLoading?: boolean;
}

export default function RecentActivityLog({ isLoading = false }: RecentActivityLogProps) {
  const { t } = useTranslation('admin');
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    reportsApi.getReports(1, 10)
      .then((res) => {
        setReports(res.items || []);
      })
      .catch(() => {
        setReports([]);
      })
      .finally(() => setFetching(false));
  }, []);

  if (isLoading || fetching) {
    return (
      <div className="flex flex-col p-6 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#161E33] shadow-sm animate-pulse font-body">
        <div className="h-4 bg-slate-200 dark:bg-white/10 rounded w-48 mb-2" />
        <div className="h-3 bg-slate-200 dark:bg-white/10 rounded w-64 mb-6" />
        <div className="space-y-3">
          <div className="h-10 bg-slate-100 dark:bg-white/5 rounded-xl w-full" />
          <div className="h-10 bg-slate-100 dark:bg-white/5 rounded-xl w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col p-6 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#161E33] shadow-sm font-body h-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-title text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Icon icon="solar:history-bold-duotone" className="text-brand-orange text-lg" />
            {t('dashboard.recentActivityTitle')}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {t('dashboard.recentActivitySubtitle')}
          </p>
        </div>
      </div>

      <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1">
        {reports.length > 0 ? (
          reports.map((r) => {
            const isDanger = r.statut === 'validated' || r.statut === 'frauduleux';
            const color = isDanger ? '#E4483B' : r.statut === 'pending' ? '#F6A020' : '#56B039';
            return (
              <div
                key={r.id}
                className="flex items-start gap-3 p-3 rounded-xl border border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02] hover:bg-slate-100/50 dark:hover:bg-white/5 transition"
              >
                <span
                  className="w-2.5 h-2.5 rounded-full mt-1.5 shrink-0"
                  style={{ backgroundColor: color }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-snug">
                    {t('dashboard.signalement')} : {r.motif}
                  </p>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                    {t('dashboard.status')} : <span className="font-mono font-medium text-slate-600 dark:text-slate-300">{r.statut}</span>
                  </p>
                </div>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 shrink-0 whitespace-nowrap font-mono">
                  {r.date_signalement ? new Date(r.date_signalement).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : t('dashboard.recent')}
                </span>
              </div>
            );
          })
        ) : (
          <div className="py-12 text-center text-xs text-slate-400">
            <Icon icon="solar:history-linear" className="text-3xl mx-auto mb-2 opacity-40" />
            <p>{t('dashboard.noRecentActivity')}</p>
          </div>
        )}
      </div>
    </div>
  );
}
