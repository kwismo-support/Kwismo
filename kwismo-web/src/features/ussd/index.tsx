import { useTranslation } from 'react-i18next';
import { PageHeader } from '@/shared/components';
import { usePermissions } from '@/shared/hooks/usePermissions';
import { useUssd } from './hooks/useUssd';
import CountriesPanel from './components/CountriesPanel';
import OperatorsPanel from './components/OperatorsPanel';
import UssdActionsPanel from './components/UssdActionsPanel';

export default function UssdPage() {
  const { t } = useTranslation(['admin', 'common']);
  const { hasPermission } = usePermissions();
  const canView = hasPermission('ussd:read');

  const {
    countries,
    selectedCountryId,
    setSelectedCountryId,
    operators,
    selectedOperatorId,
    setSelectedOperatorId,
    ussdActions,
    loadingCountries,
    loadingOperators,
    loadingActions,
    createCountry,
    updateCountry,
    deleteCountry,
    createOperator,
    updateOperator,
    deleteOperator,
    createAction,
    updateAction,
    deleteAction,
  } = useUssd();

  if (!canView) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center font-body min-h-[400px]">
        <h2 className="font-title text-xl font-bold text-slate-900 dark:text-white">
          {t('common:accessDeniedTitle')}
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
          {t('common:accessDeniedDesc')}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6 font-body">
      <PageHeader
        title={t('admin:ussd.title')}
        subtitle={t('admin:ussd.subtitle')}
        showBreadcrumb={true}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <CountriesPanel
          countries={countries}
          selectedCountryId={selectedCountryId}
          isLoading={loadingCountries}
          onSelectCountry={(id) => setSelectedCountryId(id)}
          onCreateCountry={createCountry}
          onUpdateCountry={updateCountry}
          onDeleteCountry={deleteCountry}
        />

        <OperatorsPanel
          countryId={selectedCountryId}
          operators={operators}
          selectedOperatorId={selectedOperatorId}
          isLoading={loadingOperators}
          onSelectOperator={(id) => setSelectedOperatorId(id)}
          onCreateOperator={createOperator}
          onUpdateOperator={updateOperator}
          onDeleteOperator={deleteOperator}
        />

        <UssdActionsPanel
          operatorId={selectedOperatorId}
          actions={ussdActions}
          isLoading={loadingActions}
          onCreateAction={createAction}
          onUpdateAction={updateAction}
          onDeleteAction={deleteAction}
        />
      </div>
    </div>
  );
}
