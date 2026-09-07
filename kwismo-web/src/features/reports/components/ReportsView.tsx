import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from '@iconify/react';
import { api } from '@/shared/lib/api';
import { toast } from '@/shared/store/toastStore';
import type { ReportDTO } from '@/shared/mock';

export default function ReportsView() {
  const { t } = useTranslation(['admin']);
  const [reports, setReports] = useState<ReportDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadReports() {
      setIsLoading(true);
      try {
        const data = await api.getReports();
        setReports(data);
      } finally {
        setIsLoading(false);
      }
    }
    loadReports();
  }, []);

  const handleDownload = (titre: string) => {
    toast.success(`${t('admin:reports.download')}: ${titre}`);
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-body">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="p-5 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#161E33] shadow-sm animate-pulse flex flex-col justify-between h-40">
            <div className="h-4 bg-slate-200 dark:bg-white/10 rounded w-1/3" />
            <div className="h-6 bg-slate-200 dark:bg-white/10 rounded w-full my-3" />
            <div className="h-9 bg-slate-200 dark:bg-white/10 rounded w-full" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 font-body">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {reports.map((rep) => (
          <div key={rep.id} className="p-5 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#161E33] shadow-sm flex flex-col justify-between hover:shadow-md transition">
            <div>
              <div className="flex items-center justify-between">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                  rep.type === 'security' ? 'bg-rose-500/10 text-rose-500' : 'bg-brand-green/10 text-brand-green'
                }`}>
                  {rep.type}
                </span>
                <span className="text-[11px] text-slate-400 font-mono">{rep.taille}</span>
              </div>
              <h3 className="mt-3 font-title text-sm font-bold text-slate-900 dark:text-white leading-snug">{rep.titre}</h3>
              <p className="mt-1 text-xs text-slate-500">{t('admin:reports.generatedAt')} {new Date(rep.dateCreation).toLocaleDateString()}</p>
            </div>

            <button
              onClick={() => handleDownload(rep.titre)}
              className="mt-5 flex items-center justify-center gap-2 h-9 w-full rounded-xl border border-slate-300 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/10 text-xs font-semibold text-slate-800 dark:text-slate-200 transition"
            >
              <Icon icon="solar:download-minimalistic-bold" className="text-base text-brand-green" />
              <span>{t('admin:reports.download')}</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
