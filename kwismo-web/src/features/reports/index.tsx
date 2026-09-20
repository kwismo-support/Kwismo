import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from '@iconify/react';
import { PageHeader } from '@/shared/components';
import { Button } from '@/shared/ui/button';
import { toast } from '@/shared/store/toastStore';
import { useTheme } from '@/shared/hooks/useTheme';
import { reportsApi, ReportItem } from './services/reports.api';
import { numbersApi, NumberItem } from '@/features/numbers/services/numbers.api';
import { generateCSVReport, generatePDFReport } from './services/reportsExport';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

const strategicReports = [
  {
    id: 'tendances',
    titleKey: 'reports.strategic.trendsTitle',
    descKey: 'reports.strategic.trendsDesc',
    icon: 'solar:danger-triangle-bold-duotone',
    color: '#E4483B',
  },
  {
    id: 'campagnes',
    titleKey: 'reports.strategic.campaignsTitle',
    descKey: 'reports.strategic.campaignsDesc',
    icon: 'solar:network-bold-duotone',
    color: '#F6A020',
  },
  {
    id: 'cartographie',
    titleKey: 'reports.strategic.mappingTitle',
    descKey: 'reports.strategic.mappingDesc',
    icon: 'solar:radio-minimalistic-bold-duotone',
    color: '#4D6AB1',
  },
  {
    id: 'partenaires',
    titleKey: 'reports.strategic.partnerActivityTitle',
    descKey: 'reports.strategic.partnerActivityDesc',
    icon: 'solar:case-bold-duotone',
    color: '#7C3AED',
  },
];

const periodOptions: Array<{ key: '7d' | '30d' | '90d' | 'year'; labelKey: string }> = [
  { key: '7d', labelKey: 'reports.periods.7d' },
  { key: '30d', labelKey: 'reports.periods.30d' },
  { key: '90d', labelKey: 'reports.periods.90d' },
  { key: 'year', labelKey: 'reports.periods.year' },
];

export default function ReportsPage() {
  const { t } = useTranslation('admin');
  const { isDark } = useTheme();
  const [period, setPeriod] = useState<'7d' | '30d' | '90d' | 'year'>('30d');
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [numbers, setNumbers] = useState<NumberItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    Promise.all([
      reportsApi.getReports(1, 100).catch(() => ({ items: [], total: 0 })),
      numbersApi.getNumbers(1, 100).catch(() => ({ items: [], total: 0 })),
    ]).then(([repRes, numRes]) => {
      if (!mounted) return;
      setReports(repRes.items || []);
      setNumbers(numRes.items || []);
    }).finally(() => {
      if (mounted) setLoading(false);
    });

    return () => { mounted = false; };
  }, []);

  const totalReports = reports.length;
  const validatedReports = reports.filter((r) => r.statut === 'validated' || r.statut === 'frauduleux').length;

  const uniqueOperatorNames = Array.from(
    new Set(
      numbers
        .map((n) => n.operator_name || (n.operator_id && !n.operator_id.startsWith('op_') ? n.operator_id : null))
        .filter(Boolean)
    )
  ) as string[];

  const operatorReportData = uniqueOperatorNames.length > 0
    ? uniqueOperatorNames.map((opName) => {
        const opNumbers = numbers.filter((n) => n.operator_name === opName || n.operator_id === opName);
        const fraudes = opNumbers.filter((n) => n.statut === 'frauduleux' || (n.score_risque && n.score_risque >= 70)).length;
        return {
          op: opName,
          n: opNumbers.length,
          fraudes,
        };
      })
    : [];

  const trendData = (() => {
    if (period === '7d') {
      const labels = ['J-6', 'J-5', 'J-4', 'J-3', 'J-2', 'J-1', 'Aujourd\'hui'];
      const sigWeights = [0.08, 0.12, 0.15, 0.10, 0.18, 0.22, 0.15];
      const fraWeights = [0.05, 0.10, 0.12, 0.08, 0.20, 0.25, 0.20];
      return labels.map((lbl, idx) => ({
        w: lbl,
        sig: Math.round(totalReports * sigWeights[idx]),
        fra: Math.round(validatedReports * fraWeights[idx]),
      }));
    } else if (period === '30d') {
      const labels = ['Semaine 1', 'Semaine 2', 'Semaine 3', 'Semaine 4'];
      const sigWeights = [0.15, 0.25, 0.35, 0.25];
      const fraWeights = [0.10, 0.30, 0.40, 0.20];
      return labels.map((lbl, idx) => ({
        w: lbl,
        sig: Math.round(totalReports * sigWeights[idx]),
        fra: Math.round(validatedReports * fraWeights[idx]),
      }));
    } else if (period === '90d') {
      const labels = ['Mois 1', 'Mois 2', 'Mois 3'];
      const sigWeights = [0.25, 0.35, 0.40];
      const fraWeights = [0.20, 0.40, 0.40];
      return labels.map((lbl, idx) => ({
        w: lbl,
        sig: Math.round(totalReports * sigWeights[idx]),
        fra: Math.round(validatedReports * fraWeights[idx]),
      }));
    } else {
      const labels = ['Trim 1', 'Trim 2', 'Trim 3', 'Trim 4'];
      const sigWeights = [0.20, 0.25, 0.30, 0.25];
      const fraWeights = [0.15, 0.25, 0.35, 0.25];
      return labels.map((lbl, idx) => ({
        w: lbl,
        sig: Math.round(totalReports * sigWeights[idx]),
        fra: Math.round(validatedReports * fraWeights[idx]),
      }));
    }
  })();

  const handleExport = (reportTitle: string, format: 'PDF' | 'CSV') => {
    if (format === 'CSV') {
      generateCSVReport(reportTitle, reports);
      toast.success(t('reports.toasts.exportCsvSuccess', { title: reportTitle }));
    } else {
      generatePDFReport(reportTitle, reports);
      toast.success(t('reports.toasts.exportPdfSuccess', { title: reportTitle }));
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6 font-body max-w-7xl mx-auto">
      <PageHeader
        title={t('reports.title')}
        subtitle={t('reports.subtitle')}
        showBreadcrumb={true}
      />

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#161E33] shadow-sm">
        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
          {t('reports.analysisPeriod')}
        </span>
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-white/5 p-1 rounded-xl">
          {periodOptions.map((p) => (
            <button
              key={p.key}
              onClick={() => setPeriod(p.key)}
              className={`px-3.5 py-1.5 rounded text-xs font-semibold transition cursor-pointer ${
                period === p.key
                  ? 'bg-brand-navy text-white dark:bg-brand-orange dark:text-brand-navy shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {t(p.labelKey)}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {strategicReports.map((r) => (
          <div
            key={r.id}
            className="p-5 rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#161E33] shadow-sm flex flex-col justify-between hover:shadow-md transition"
          >
            <div>
              <div
                className="w-10 h-10 rounded-2xl flex items-center justify-center mb-3"
                style={{ backgroundColor: `${r.color}15` }}
              >
                <Icon icon={r.icon} className="text-xl" style={{ color: r.color }} />
              </div>
              <h3 className="font-title text-base font-bold text-slate-900 dark:text-white leading-snug">
                {t(r.titleKey)}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                {t(r.descKey)}
              </p>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 dark:border-white/5 flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs"
                onClick={() => handleExport(t(r.titleKey), 'PDF')}
              >
                <Icon icon="solar:file-download-bold" className="text-sm text-brand-green mr-1" />
                PDF
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs"
                onClick={() => handleExport(t(r.titleKey), 'CSV')}
              >
                <Icon icon="solar:export-bold" className="text-sm text-brand-blue mr-1" />
                CSV
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="p-6 rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#161E33] shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-4">
          <div>
            <h3 className="font-title text-base font-bold text-slate-900 dark:text-white">
              {t('reports.trendsTitle', { period: t(`reports.periods.${period}`) })}
            </h3>
            <p className="text-xs text-slate-400">
              {t('reports.trendsSubtitle')}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => handleExport('Tendances', 'PDF')}>
              {t('reports.exportChart')}
            </Button>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
              <XAxis dataKey="w" stroke="#94a3b8" fontSize={11} />
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
              <Legend wrapperStyle={{ fontSize: 11 }} iconType="circle" />
              <Line type="monotone" dataKey="sig" stroke="#4D6AB1" strokeWidth={2.5} dot={false} name={t('reports.charts.reports')} />
              <Line type="monotone" dataKey="fra" stroke="#E4483B" strokeWidth={2.5} dot={false} name={t('reports.charts.blockedFrauds')} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="p-6 rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#161E33] shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-4">
          <div>
            <h3 className="font-title text-base font-bold text-slate-900 dark:text-white">
              {t('reports.operatorChartTitle')}
            </h3>
            <p className="text-xs text-slate-400">
              {t('reports.operatorChartSubtitle')}
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => handleExport('Par Opérateur', 'CSV')}>
            {t('reports.exportData')}
          </Button>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={operatorReportData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
              <XAxis dataKey="op" stroke="#94a3b8" fontSize={11} />
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
              <Legend wrapperStyle={{ fontSize: 11 }} iconType="circle" />
              <Bar dataKey="n" fill="#4D6AB1" radius={[6, 6, 0, 0]} name={t('reports.charts.totalNumbers')} />
              <Bar dataKey="fraudes" fill="#E4483B" radius={[6, 6, 0, 0]} name={t('reports.charts.detectedFrauds')} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="p-6 rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#161E33] shadow-sm space-y-4">
        <h3 className="font-title text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Icon icon="solar:history-bold-duotone" className="text-brand-orange text-xl" />
          {t('reports.availableReportsTitle')}
        </h3>

        <div className="divide-y divide-slate-100 dark:divide-white/5">
          {loading ? (
            <div className="py-6 text-center text-xs text-slate-400">{t('reports.loading')}</div>
          ) : reports.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">{t('reports.noReports')}</div>
          ) : (
            reports.slice(0, 5).map((r) => (
              <div key={r.id} className="py-3.5 flex items-center justify-between gap-4">
                <div>
                  <span className="font-bold text-sm text-slate-900 dark:text-white block">
                    {t('reports.reportLabel')} — {r.motif}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    Statut: {r.statut} · {r.date_signalement ? new Date(r.date_signalement).toLocaleDateString('fr-FR') : t('reports.recent')}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleExport(`Signalement_${r.id}`, 'PDF')}
                  >
                    <Icon icon="solar:download-minimalistic-bold" className="text-sm text-brand-green mr-1" />
                    PDF
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleExport(`Signalement_${r.id}`, 'CSV')}
                  >
                    <Icon icon="solar:export-bold" className="text-sm text-brand-blue mr-1" />
                    CSV
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
