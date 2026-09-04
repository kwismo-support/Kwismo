import { useState } from 'react';
import { Icon } from '@iconify/react';

interface Rule {
  operator: string;
  prefixes: string[];
}

const initialRules: Rule[] = [
  { operator: 'Orange Money (CM)', prefixes: ['69', '655', '656', '657', '658', '659'] },
  { operator: 'MTN MoMo (CM)', prefixes: ['67', '650', '651', '652', '653', '654'] },
  { operator: 'Nexttel / Camtel', prefixes: ['66', '62'] },
];

export default function AffiliationRulesEditor() {
  const [rules, setRules] = useState<Rule[]>(initialRules);
  const [newPrefix, setNewPrefix] = useState('');

  const addPrefix = (operatorIndex: number) => {
    if (!newPrefix.trim()) return;
    const updated = [...rules];
    updated[operatorIndex].prefixes.push(newPrefix.trim());
    setRules(updated);
    setNewPrefix('');
  };

  return (
    <div className="flex flex-col gap-4 p-6 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-brand-navy shadow-sm font-body">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-title text-base font-bold text-slate-900 dark:text-white">
            Règles d'Affiliation des Préfixes Opérateurs
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Routage automatique des requêtes selon le préfixe réseau.
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-4">
        {rules.map((rule, idx) => (
          <div key={idx} className="p-4 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-brand-darkBg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h4 className="font-title text-xs font-bold text-slate-900 dark:text-white">{rule.operator}</h4>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {rule.prefixes.map((p, pIdx) => (
                  <span key={pIdx} className="px-2 py-0.5 rounded-md bg-brand-navy/10 dark:bg-white/10 text-brand-navy dark:text-slate-200 font-mono text-[11px] font-semibold">
                    {p}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Ex: 680"
                value={newPrefix}
                onChange={(e) => setNewPrefix(e.target.value)}
                className="h-8 w-24 px-2 rounded-lg border border-slate-300 dark:border-white/10 text-xs font-mono"
              />
              <button
                onClick={() => addPrefix(idx)}
                className="flex items-center gap-1 h-8 px-3 rounded-lg bg-brand-green text-white text-xs font-semibold hover:bg-[#2aa072]"
              >
                <Icon icon="solar:add-circle-bold" className="text-sm" />
                <span>Ajouter</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
