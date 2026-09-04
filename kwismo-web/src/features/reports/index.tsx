import ReportsView from './components/ReportsView';

export default function ReportsPage() {
  return (
    <div className="flex flex-col gap-6 p-6 font-body">
      <div>
        <h1 className="font-title text-2xl font-bold text-slate-900 dark:text-white">
          Rapports Stratégiques & Audits
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Téléchargement et analyse des rapports périodiques de sécurité et d'activité API.
        </p>
      </div>

      <ReportsView />
    </div>
  );
}
