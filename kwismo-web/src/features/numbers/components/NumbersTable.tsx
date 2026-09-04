import { useState } from 'react';
import { Icon } from '@iconify/react';
import NumberStatusBadge, { type NumberRiskStatus } from './NumberStatusBadge';

export interface NumberRecord {
  id: string;
  phone: string;
  carrier: string;
  reportsCount: number;
  score: number;
  status: NumberRiskStatus;
  lastChecked: string;
}

const mockNumbers: NumberRecord[] = [
  { id: '1', phone: '+237 698 44 43 88', carrier: 'Orange CM', reportsCount: 0, score: 98, status: 'safe', lastChecked: 'Aujourd\'hui 11:20' },
  { id: '2', phone: '+237 651 99 88 77', carrier: 'MTN CM', reportsCount: 42, score: 12, status: 'fraudulent', lastChecked: 'Il y a 10 min' },
  { id: '3', phone: '+237 680 00 11 22', carrier: 'Nexttel', reportsCount: 3, score: 55, status: 'suspicious', lastChecked: 'Il y a 2h' },
  { id: '4', phone: '+225 07 08 09 10 11', carrier: 'Orange CI', reportsCount: 0, score: 95, status: 'safe', lastChecked: 'Hier 18:45' },
  { id: '5', phone: '+221 77 123 45 67', carrier: 'Free SN', reportsCount: 15, score: 25, status: 'fraudulent', lastChecked: 'Il y a 1j' },
];

export default function NumbersTable() {
  const [search, setSearch] = useState('');

  const filtered = mockNumbers.filter((n) => n.phone.includes(search) || n.carrier.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="flex flex-col gap-4 w-full font-body">
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-xs">
          <Icon icon="solar:magnifer-linear" className="absolute left-3 top-3 text-slate-400 text-base" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Saisir numéro ou opérateur..."
            className="w-full h-10 pl-9 pr-4 rounded-xl border border-slate-300 dark:border-white/10 bg-white dark:bg-brand-navy text-xs font-mono"
          />
        </div>

        <button className="flex items-center gap-2 h-10 px-4 rounded-xl bg-brand-green text-white text-xs font-semibold shadow hover:bg-[#2aa072]">
          <Icon icon="solar:shield-warning-bold" className="text-base" />
          <span>Signaler un Numéro</span>
        </button>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-brand-navy shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0F1626] text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <th className="p-4">Numéro de Téléphone</th>
              <th className="p-4">Opérateur / Pays</th>
              <th className="p-4">Score de Confiance AI</th>
              <th className="p-4">Signalements</th>
              <th className="p-4">Évaluation de Risque</th>
              <th className="p-4">Dernière Vérification</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-white/10 text-xs text-slate-800 dark:text-slate-200">
            {filtered.map((n) => (
              <tr key={n.id} className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition">
                <td className="p-4 font-mono font-bold text-slate-900 dark:text-white">{n.phone}</td>
                <td className="p-4">{n.carrier}</td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-2 rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          n.score >= 80 ? 'bg-brand-green' : n.score >= 40 ? 'bg-brand-orange' : 'bg-danger'
                        }`}
                        style={{ width: `${n.score}%` }}
                      />
                    </div>
                    <span className="font-semibold text-xs">{n.score} / 100</span>
                  </div>
                </td>
                <td className="p-4 font-semibold">{n.reportsCount} signalements</td>
                <td className="p-4">
                  <NumberStatusBadge status={n.status} />
                </td>
                <td className="p-4 text-slate-500">{n.lastChecked}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
