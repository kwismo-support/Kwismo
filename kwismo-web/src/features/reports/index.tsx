import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from '@iconify/react';
import { PageHeader } from '@/shared/components';
import { Button } from '@/shared/ui/button';
import { toast } from '@/shared/store/toastStore';
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

const weeklyData = [
  { w: 'S1', sig: 1240, fra: 310 },
  { w: 'S2', sig: 1380, fra: 345 },
  { w: 'S3', sig: 1520, fra: 380 },
  { w: 'S4', sig: 1650, fra: 412 },
  { w: 'S5', sig: 1480, fra: 370 },
  { w: 'S6', sig: 1720, fra: 430 },
  { w: 'S7', sig: 1890, fra: 472 },
  { w: 'S8', sig: 2010, fra: 502 },
];

const operatorReportData = [
  { op: 'MTN', n: 892, fraudes: 214 },
  { op: 'Orange', n: 654, fraudes: 168 },
  { op: 'Airtel', n: 423, fraudes: 97 },
  { op: 'M-Pesa', n: 312, fraudes: 61 },
  { op: 'Moov', n: 187, fraudes: 43 },
  { op: 'Wave', n: 156, fraudes: 38 },
];

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

const generatedHistory = [
  {
    id: 1,
    titre: 'Rapport Mensuel Anti-Fraude — Août 2026',
    dateCreation: '01/09/2026',
    taille: '2.4 Mo',
    type: 'PDF',
  },
  {
    id: 2,
    titre: 'Journal d’Audit & Accès Utilisateurs',
    dateCreation: '28/08/2026',
    taille: '1.1 Mo',
    type: 'CSV',
  },
  {
    id: 3,
    titre: 'Analyse d’Impact Opérateurs Telco',
    dateCreation: '15/08/2026',
    taille: '3.8 Mo',
    type: 'PDF',
  },
];

export default function ReportsPage() {
  const { t } = useTranslation('admin');
  const [period, setPeriod] = useState<'7 jours' | '30 jours' | '90 jours' | 'Cette année'>('30 jours');

  const handleExport = (reportTitle: string, format: 'PDF' | 'CSV') => {
    toast.success(`Export « ${reportTitle} » en cours (${format})...`);
  };

  return (
    <div className="flex flex-col gap-6 p-6 font-body max-w-7xl mx-auto">
      <PageHeader
        title={t('reports.title', 'Rapports stratégiques')}
        subtitle="Analyses approfondies, métriques avancées et historiques d'exportation."
        showBreadcrumb={true}
      />

      {/* Period Controls */}
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

      {/* Strategic Report Cards */}
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

      {/* Trend Line Chart */}
      <div className="p-6 rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#161E33] shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-4">
          <div>
            <h3 className="font-title text-base font-bold text-slate-900 dark:text-white">
              Tendances de Signalements & Fraudes — {period}
            </h3>
            <p className="text-xs text-slate-400">
              Évolution temporelle des requêtes d’analyse et des menaces avérées.
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
                  borderColor: '#242f48',
                  color: '#fff',
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

      {/* Operator Bar Chart */}
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
                  borderColor: '#242f48',
                  color: '#fff',
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

      {/* Export History Table */}
      <div className="p-6 rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#161E33] shadow-sm space-y-4">
        <h3 className="font-title text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Icon icon="solar:history-bold-duotone" className="text-brand-orange text-xl" />
          Historique des Rapports Générés
        </h3>

        <div className="divide-y divide-slate-100 dark:divide-white/5">
          {generatedHistory.map((h) => (
            <div key={h.id} className="py-3.5 flex items-center justify-between gap-4">
              <div>
                <span className="font-bold text-sm text-slate-900 dark:text-white block">{h.titre}</span>
                <span className="text-xs text-slate-400 font-mono">Généré le {h.dateCreation} · {h.taille}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => toast.success(`Téléchargement de ${h.titre}...`)}
              >
                <Icon icon="solar:download-minimalistic-bold" className="text-sm text-brand-green mr-1" />
                Télécharger ({h.type})
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
