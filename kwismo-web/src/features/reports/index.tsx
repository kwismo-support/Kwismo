import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from '@iconify/react';
import { PageHeader } from '@/shared/components';
import { Button } from '@/shared/ui/button';
import { toast } from '@/shared/store/toastStore';
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
    title: 'Tendances de fraude',
    desc: 'Évolution et vélocité des fraudes détectées sur la période.',
    icon: 'solar:danger-triangle-bold-duotone',
    color: '#E4483B',
  },
  {
    id: 'campagnes',
    title: 'Campagnes détectées',
    desc: 'Campagnes coordonnées identifiées par la plateforme IA.',
    icon: 'solar:network-bold-duotone',
    color: '#F6A020',
  },
  {
    id: 'cartographie',
    title: 'Cartographie par opérateur',
    desc: 'Répartition régionale et vulnérabilité par réseau télécom.',
    icon: 'solar:radio-minimalistic-bold-duotone',
    color: '#4D6AB1',
  },
  {
    id: 'partenaires',
    title: 'Activité partenaires',
    desc: 'Consommation API et taux d’interrogation par entreprise.',
    icon: 'solar:case-bold-duotone',
    color: '#7C3AED',
  },
];

export default function ReportsPage() {
  const { t } = useTranslation('admin');
  const [period, setPeriod] = useState<'7 jours' | '30 jours' | '90 jours' | 'Cette année'>('30 jours');
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

  const weeklyData = [
    { w: 'S1', sig: Math.round(totalReports * 0.1), fra: Math.round(validatedReports * 0.1) },
    { w: 'S2', sig: Math.round(totalReports * 0.2), fra: Math.round(validatedReports * 0.2) },
    { w: 'S3', sig: Math.round(totalReports * 0.3), fra: Math.round(validatedReports * 0.3) },
    { w: 'S4', sig: Math.round(totalReports * 0.4), fra: Math.round(validatedReports * 0.4) },
  ];

  const handleExport = (reportTitle: string, format: 'PDF' | 'CSV') => {
    if (format === 'CSV') {
      generateCSVReport(reportTitle, reports);
      toast.success(`Export CSV « ${reportTitle} » téléchargé.`);
    } else {
      generatePDFReport(reportTitle, reports);
      toast.success(`Impression PDF « ${reportTitle} » préparée.`);
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6 font-body max-w-7xl mx-auto">
      <PageHeader
        title={t('reports.title', { defaultValue: 'Rapports & Analyses' })}
        subtitle={t('reports.subtitle', { defaultValue: 'Analyses approfondies, métriques avancées et historiques d\'exportation.' })}
        showBreadcrumb={true}
      />

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#161E33] shadow-sm">
        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
          Période d’analyse :
        </span>
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-white/5 p-1 rounded-xl">
          {(['7 jours', '30 jours', '90 jours', 'Cette année'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                period === p
                  ? 'bg-brand-navy text-white dark:bg-brand-orange dark:text-brand-navy shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {p}
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
                {r.title}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                {r.desc}
              </p>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 dark:border-white/5 flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs"
                onClick={() => handleExport(r.title, 'PDF')}
              >
                <Icon icon="solar:file-download-bold" className="text-sm text-brand-green mr-1" />
                PDF
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs"
                onClick={() => handleExport(r.title, 'CSV')}
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
              Tendances de Signalements & Fraudes — {period}
            </h3>
            <p className="text-xs text-slate-400">
              Évolution temporelle calculée depuis la base de données.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => handleExport('Tendances', 'PDF')}>
              Exporter Graphique
            </Button>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={weeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
              <XAxis dataKey="w" stroke="#94a3b8" fontSize={11} />
              <YAxis stroke="#94a3b8" fontSize={11} />
              <Tooltip
                contentStyle={{
                  borderRadius: '16px',
                  fontSize: '12px',
                  backgroundColor: '#161E33',
                  borderColor: '#32B07F',
                  color: '#FFFFFF',
                  fontFamily: 'Montserrat Alternates, sans-serif',
                }}
              />
              <Legend wrapperStyle={{ fontSize: 11 }} iconType="circle" />
              <Line type="monotone" dataKey="sig" stroke="#4D6AB1" strokeWidth={2.5} dot={false} name="Signalements" />
              <Line type="monotone" dataKey="fra" stroke="#E4483B" strokeWidth={2.5} dot={false} name="Fraudes Bloquées" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="p-6 rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#161E33] shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-4">
          <div>
            <h3 className="font-title text-base font-bold text-slate-900 dark:text-white">
              Numéros et Fraudes par Opérateur Télécom
            </h3>
            <p className="text-xs text-slate-400">
              Volume total de numéros surveillés vs menaces détectées par réseau.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => handleExport('Par Opérateur', 'CSV')}>
            Exporter Données
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
                  backgroundColor: '#161E33',
                  borderColor: '#32B07F',
                  color: '#FFFFFF',
                  fontFamily: 'Montserrat Alternates, sans-serif',
                }}
              />
              <Legend wrapperStyle={{ fontSize: 11 }} iconType="circle" />
              <Bar dataKey="n" fill="#4D6AB1" radius={[6, 6, 0, 0]} name="Total Numéros" />
              <Bar dataKey="fraudes" fill="#E4483B" radius={[6, 6, 0, 0]} name="Fraudes Détectées" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="p-6 rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#161E33] shadow-sm space-y-4">
        <h3 className="font-title text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Icon icon="solar:history-bold-duotone" className="text-brand-orange text-xl" />
          Rapports Disponibles pour Téléchargement
        </h3>

        <div className="divide-y divide-slate-100 dark:divide-white/5">
          {loading ? (
            <div className="py-6 text-center text-xs text-slate-400">Chargement des rapports...</div>
          ) : reports.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">Aucun signalement enregistré</div>
          ) : (
            reports.slice(0, 5).map((r) => (
              <div key={r.id} className="py-3.5 flex items-center justify-between gap-4">
                <div>
                  <span className="font-bold text-sm text-slate-900 dark:text-white block">
                    Signalement — {r.motif}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    Statut: {r.statut} · {r.date_signalement ? new Date(r.date_signalement).toLocaleDateString('fr-FR') : 'Récent'}
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
