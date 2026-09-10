import { useTranslation } from 'react-i18next';
import { Icon } from '@iconify/react';
import { Button } from '@/shared/ui/button';

export function ForbiddenPage() {
  const { t } = useTranslation('errors');

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center font-body">
      <div className="w-20 h-20 rounded-3xl bg-amber-500/10 text-amber-500 flex items-center justify-center mb-6">
        <Icon icon="solar:shield-keyhole-bold-duotone" className="text-5xl" />
      </div>

      <h1 className="font-title text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
        {t('403.title')}
      </h1>

      <p className="mt-3 text-sm text-slate-500 dark:text-slate-400 max-w-md leading-relaxed">
        {t('403.subtitle')}
      </p>

      <Button
        variant="primary"
        size="md"
        className="mt-8"
        leftIcon="solar:home-2-bold"
        onClick={() => { window.location.href = '/app/dashboard'; }}
      >
        {t('403.button')}
      </Button>
    </div>
  );
}

