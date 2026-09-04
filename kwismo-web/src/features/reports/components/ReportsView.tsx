import { Icon } from '@iconify/react';

const mockReports = [
  { id: 'rep-1', title: 'Rapport Mensuel sur les Tendances de Fraude (Août 2026)', type: 'PDF', date: '01/09/2026', size: '2.4 MB' },
  { id: 'rep-2', title: 'Journal d\'Audit d\'Utilisation des API Partenaires', type: 'CSV', date: '31/08/2026', size: '14.8 MB' },
  { id: 'rep-3', title: 'Analyse Prédictive IA - Menaces USSD & SIM Swap', type: 'PDF', date: '25/08/2026', size: '5.1 MB' },
];

export default function ReportsView() {
  return (
    <div className="flex flex-col gap-4 font-body">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {mockReports.map((rep) => (
          <div key={rep.id} className="p-5 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-brand-navy shadow-sm flex flex-col justify-between hover:shadow-md transition">
            <div>
              <div className="flex items-center justify-between">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  rep.type === 'PDF' ? 'bg-danger/10 text-danger' : 'bg-brand-green/10 text-brand-green'
                }`}>
                  {rep.type}
                </span>
                <span className="text-[11px] text-slate-400 font-mono">{rep.size}</span>
              </div>
              <h3 className="mt-3 font-title text-sm font-bold text-slate-900 dark:text-white leading-snug">{rep.title}</h3>
              <p className="mt-1 text-xs text-slate-500">Généré le {rep.date}</p>
            </div>

            <button className="mt-5 flex items-center justify-center gap-2 h-9 w-full rounded-xl border border-slate-300 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/10 text-xs font-semibold text-slate-800 dark:text-slate-200 transition">
              <Icon icon="solar:download-minimalistic-bold" className="text-base text-brand-green" />
              <span>Télécharger le rapport</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
