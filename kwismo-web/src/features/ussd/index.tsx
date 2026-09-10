import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '@/shared/lib/api';
import type { CountryDTO, OperatorDTO, UssdActionDTO } from '@/shared/mock';
import CountriesPanel from './components/CountriesPanel';
import OperatorsPanel from './components/OperatorsPanel';
import UssdActionsPanel from './components/UssdActionsPanel';

export default function UssdPage() {
  const { t } = useTranslation('admin');
  const [countries, setCountries] = useState<CountryDTO[]>([]);
  const [operators, setOperators] = useState<OperatorDTO[]>([]);
  const [ussdActions, setUssdActions] = useState<UssdActionDTO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    Promise.all([api.getCountries(), api.getOperators(), api.getUssdActions()])
      .then(([c, o, u]) => {
        if (mounted) {
          setCountries(c);
          setOperators(o);
          setUssdActions(u);
        }
      })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  return (
    <div className="flex flex-col gap-6 p-6 font-body">
      <div>
        <h1 className="font-title text-2xl font-bold text-slate-900 dark:text-white">
          {t('ussd.title')}
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CountriesPanel countries={countries} isLoading={loading} />
        <OperatorsPanel operators={operators} isLoading={loading} />
      </div>

      <UssdActionsPanel actions={ussdActions} isLoading={loading} />
    </div>
  );
}
