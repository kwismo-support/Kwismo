import { Icon } from '@iconify/react';

const mockCountries = [
  { code: 'CM', name: 'Cameroun', phoneCode: '+237', operatorsCount: 3, status: 'Actif' },
  { code: 'CI', name: 'Côte d\'Ivoire', phoneCode: '+225', operatorsCount: 3, status: 'Actif' },
  { code: 'SN', name: 'Sénégal', phoneCode: '+221', operatorsCount: 3, status: 'Actif' },
  { code: 'GA', name: 'Gabon', phoneCode: '+241', operatorsCount: 2, status: 'Actif' },
];

export default function CountriesPanel() {
  return (
    <div className="flex flex-col gap-4 p-6 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-brand-navy shadow-sm font-body">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-title text-base font-bold text-slate-900 dark:text-white">
            Pays & Périmètres d'Opération
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Gestion des zones géographiques couvertes par KWISMO.
          </p>
        </div>
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-green text-white text-xs font-semibold hover:bg-[#2aa072]">
          <Icon icon="solar:global-bold" className="text-sm" />
          <span>Ajouter Pays</span>
        </button>
      </div>

      <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
        {mockCountries.map((c, idx) => (
          <div key={idx} className="p-4 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-brand-darkBg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-green/10 text-brand-green font-title font-bold text-sm">
                {c.code}
              </div>
              <div>
                <h4 className="font-title text-sm font-bold text-slate-900 dark:text-white">{c.name}</h4>
                <p className="font-mono text-xs text-slate-500">{c.phoneCode} • {c.operatorsCount} Opérateurs</p>
              </div>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-brand-green/10 text-brand-green">
              {c.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
