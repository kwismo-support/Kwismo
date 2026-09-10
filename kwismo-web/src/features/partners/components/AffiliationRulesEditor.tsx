import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { toast } from '@/shared/store/toastStore';

interface Rule {
  operator: string;
  prefixes: string[];
}

const initialRules: Rule[] = [
  { operator: 'Orange Cameroun', prefixes: ['69', '655', '656', '657', '658', '659'] },
  { operator: 'MTN Cameroun', prefixes: ['67', '650', '651', '652', '653', '654'] },
  { operator: 'Nexttel / Camtel', prefixes: ['66', '62'] },
];

export default function AffiliationRulesEditor() {
  const { t } = useTranslation(['partner', 'common']);
  const [rules, setRules] = useState<Rule[]>(initialRules);
  const [newPrefix, setNewPrefix] = useState('');

  const addPrefix = (operatorIndex: number) => {
    if (!newPrefix.trim()) return;
    const updated = [...rules];
    updated[operatorIndex].prefixes.push(newPrefix.trim());
    setRules(updated);
    setNewPrefix('');
    toast.success(t('partner:affiliation.saved'));
  };

  return (
    <div className="flex flex-col gap-4 p-6 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#161E33] shadow-sm font-body">
      <div>
        <h3 className="font-title text-base font-bold text-slate-900 dark:text-white">
          {t('partner:affiliation.title')}
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {t('partner:affiliation.subtitle')}
        </p>
      </div>

      <div className="mt-4 flex flex-col gap-4">
        {rules.map((rule, idx) => (
          <div key={idx} className="p-4 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0F1626] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h4 className="font-title text-xs font-bold text-slate-900 dark:text-white">{rule.operator}</h4>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {rule.prefixes.map((p, pIdx) => (
                  <span key={pIdx} className="px-2 py-0.5 rounded-md bg-white dark:bg-white/10 text-slate-800 dark:text-slate-200 font-mono text-[11px] font-semibold border border-slate-200 dark:border-white/5">
                    {p}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-28">
                <Input
                  sizeVariant="sm"
                  placeholder="Ex: 680"
                  value={newPrefix}
                  onChange={(e) => setNewPrefix(e.target.value)}
                />
              </div>
              <Button
                size="xs"
                variant="primary"
                leftIcon="solar:add-circle-bold"
                onClick={() => addPrefix(idx)}
              >
                {t('common:add')}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
