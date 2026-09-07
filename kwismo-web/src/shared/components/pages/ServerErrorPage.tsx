import { useTranslation } from 'react-i18next';
import { Icon } from '@iconify/react';
import { Button } from '@/shared/ui/button';

export function ServerErrorPage() {
  const { t } = useTranslation('errors');

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center font-body">
      <div className="w-20 h-20 rounded-3xl bg-rose-500/10 text-rose-500 flex items-center justify-center mb-6">
        <Icon icon="solar:danger-triangle-bold-duotone" className="text-5xl" />
      </div>

      <h1 className="font-title text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
        {t('500.title')}
      </h1>

      <p className="mt-3 text-sm text-slate-500 dark:text-slate-400 max-w-md leading-relaxed">
        {t('500.subtitle')}
      </p>

      <Button
        variant="primary"
        size="md"
        className="mt-8"
        leftIcon="solar:restart-bold"
        onClick={() => { window.location.reload(); }}
      >
        {t('500.button')}
      </Button>
    </div>
  );
}

