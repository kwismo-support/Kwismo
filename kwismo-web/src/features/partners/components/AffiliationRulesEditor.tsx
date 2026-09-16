import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from '@iconify/react';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { CountrySelect } from '@/shared/ui/country-select';
import { usePermissions } from '@/shared/hooks/usePermissions';
import type { AffiliationRule } from '../services/partners.api';

interface AffiliationRulesEditorProps {
  rules: AffiliationRule[];
  onAddRule?: (countryId: string, prefixes: string[]) => void;
  disabled?: boolean;
}

export default function AffiliationRulesEditor({ rules, onAddRule, disabled = false }: AffiliationRulesEditorProps) {
  const { t } = useTranslation(['admin', 'common']);
  const { hasPermission } = usePermissions();
  const [selectedCountry, setSelectedCountry] = useState('CM');
  const [prefixesInput, setPrefixesInput] = useState('');

  const handleAdd = () => {
    if (!prefixesInput.trim() || !onAddRule) return;
    const prefixes = prefixesInput.split(',').map((p) => p.trim()).filter(Boolean);
    if (prefixes.length === 0) return;
    onAddRule(selectedCountry, prefixes);
    setPrefixesInput('');
  };

  return (
    <div className="flex flex-col gap-4 p-6 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#161E33] shadow-sm font-body">
      <div>
        <h3 className="font-title text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Icon icon="solar:shield-keyhole-bold-duotone" className="text-brand-orange text-xl" />
          {t('admin:partners.affiliationRulesTitle')}
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {t('admin:partners.affiliationRulesSubtitle')}
        </p>
      </div>

      <div className="mt-2 space-y-3">
        {rules.length === 0 ? (
          <p className="text-xs text-slate-400 py-4 text-center">{t('admin:partners.noAffiliationRules')}</p>
        ) : (
          rules.map((rule) => (
            <div key={rule.id} className="p-4 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0F1626] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="font-title text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Icon icon={`circle-flags:${rule.country_id.toLowerCase()}`} className="text-lg" />
                  <span>{rule.country_id}</span>
                </h4>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {rule.prefixes.map((p) => (
                    <span key={p.id} className="px-2 py-0.5 rounded-md bg-white dark:bg-white/10 text-slate-800 dark:text-slate-200 font-mono text-[11px] font-semibold border border-slate-200 dark:border-white/5">
                      {p.prefixe}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {hasPermission('affiliation:create') && !disabled && (
        <div className="mt-4 p-4 rounded-xl border border-brand-green/30 bg-brand-green/5 flex flex-col sm:flex-row items-end gap-3">
          <div className="w-full sm:w-44 flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">{t('admin:partners.country')}</label>
            <CountrySelect
              value={selectedCountry}
              onChange={setSelectedCountry}
            />
          </div>
          <div className="flex-1 w-full flex flex-col gap-1">
            <Input
              label={t('admin:partners.prefixesLabel')}
              placeholder="Ex: 69, 651-654, 68"
              value={prefixesInput}
              onChange={(e) => setPrefixesInput(e.target.value)}
            />
          </div>
          <Button
            size="sm"
            variant="primary"
            leftIcon="solar:add-circle-bold"
            onClick={handleAdd}
            disabled={!prefixesInput.trim()}
          >
            {t('common:add')}
          </Button>
        </div>
      )}
    </div>
  );
}
