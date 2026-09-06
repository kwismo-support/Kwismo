// Reports and audits page container for downloading periodic security and API activity reports.
import { useTranslation } from 'react-i18next';
import ReportsView from './components/ReportsView';

export default function ReportsPage() {
  const { t } = useTranslation(['admin']);

  return (
    <div className="flex flex-col gap-6 p-6 font-body">
      <div>
        <h1 className="font-title text-2xl font-bold text-slate-900 dark:text-white">
          {t('admin:reports.title')}
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {t('admin:reports.subtitle')}
        </p>
      </div>

      <ReportsView />
    </div>
  );
}
