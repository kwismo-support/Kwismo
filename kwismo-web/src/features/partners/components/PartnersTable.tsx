import { Icon } from '@iconify/react';

export interface PartnerItem {
  id: string;
  name: string;
  apiKey: string;
  monthlyQuota: string;
  callsThisMonth: string;
  status: 'active' | 'pending' | 'suspended';
}

const mockPartners: PartnerItem[] = [
  { id: 'p1', name: 'Orange Money West Africa', apiKey: 'kw_live_99a8b7c6...', monthlyQuota: '10 000 000', callsThisMonth: '4 250 100', status: 'active' },
  { id: 'p2', name: 'MTN Mobile Financial Services', apiKey: 'kw_live_11d2e3f4...', monthlyQuota: '8 000 000', callsThisMonth: '3 890 000', status: 'active' },
  { id: 'p3', name: 'Express Union Mobile', apiKey: 'kw_live_77x8y9z0...', monthlyQuota: '2 000 000', callsThisMonth: '950 000', status: 'active' },
  { id: 'p4', name: 'UBA Cameroon Fintech Hub', apiKey: 'kw_test_44m5n6p7...', monthlyQuota: '500 000', callsThisMonth: '12 400', status: 'pending' },
];

interface PartnersTableProps {
  onEditPartner: (partner: PartnerItem) => void;
}

export default function PartnersTable({ onEditPartner }: PartnersTableProps) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-brand-navy shadow-sm font-body">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0F1626] text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            <th className="p-4">Entreprise / Partenaire</th>
            <th className="p-4">Clé API (Live)</th>
            <th className="p-4">Quota Mensuel</th>
            <th className="p-4">Consommation</th>
            <th className="p-4">Statut</th>
            <th className="p-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 dark:divide-white/10 text-xs text-slate-800 dark:text-slate-200">
          {mockPartners.map((p) => (
            <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition">
              <td className="p-4 font-semibold text-slate-900 dark:text-white">{p.name}</td>
              <td className="p-4 font-mono text-[11px] text-slate-500">{p.apiKey}</td>
              <td className="p-4 font-semibold">{p.monthlyQuota} d'appels</td>
              <td className="p-4 text-brand-green font-semibold">{p.callsThisMonth}</td>
              <td className="p-4">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                  p.status === 'active'
                    ? 'bg-brand-green/10 text-brand-green'
                    : 'bg-yellow-500/10 text-yellow-600'
                }`}>
                  {p.status}
                </span>
              </td>
              <td className="p-4 text-right">
                <button
                  onClick={() => onEditPartner(p)}
                  className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 transition"
                >
                  <Icon icon="solar:pen-bold-duotone" className="text-base text-brand-orange" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
