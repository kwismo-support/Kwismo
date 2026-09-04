import NumbersTable from './components/NumbersTable';

export default function NumbersPage() {
  return (
    <div className="flex flex-col gap-6 p-6 font-body">
      <div>
        <h1 className="font-title text-2xl font-bold text-slate-900 dark:text-white">
          Base de Données des Numéros
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Inspection et historique de réputation des numéros de téléphone contrôlés.
        </p>
      </div>

      <NumbersTable />
    </div>
  );
}
