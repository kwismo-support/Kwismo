import CountriesPanel from './components/CountriesPanel';
import OperatorsPanel from './components/OperatorsPanel';
import UssdActionsPanel from './components/UssdActionsPanel';

export default function UssdPage() {
  return (
    <div className="flex flex-col gap-6 p-6 font-body">
      <div>
        <h1 className="font-title text-2xl font-bold text-slate-900 dark:text-white">
          Gestion USSD, Pays & Opérateurs
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Configuration des intégrations USSD et paramètres réseau par pays.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CountriesPanel />
        <OperatorsPanel />
      </div>

      <UssdActionsPanel />
    </div>
  );
}
