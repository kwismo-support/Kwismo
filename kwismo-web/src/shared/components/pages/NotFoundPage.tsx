// 404 Not Found page rendered when an invalid URL route is accessed.
import { useTranslation } from 'react-i18next';
import { Icon } from '@iconify/react';
import { Button } from '@/shared/ui/button';

export function NotFoundPage() {
  const { t } = useTranslation('errors');

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center font-body">
      <div className="w-20 h-20 rounded-3xl bg-brand-green/10 text-brand-green flex items-center justify-center mb-6">
        <Icon icon="solar:ghost-bold-duotone" className="text-5xl" />
      </div>

      <h1 className="font-title text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
        {t('404.title')}
      </h1>

      <p className="mt-3 text-sm text-slate-500 dark:text-slate-400 max-w-md leading-relaxed">
        {t('404.subtitle')}
      </p>

      <Button
        variant="primary"
        size="md"
        className="mt-8"
        leftIcon="solar:alt-arrow-left-bold"
        onClick={() => { window.location.href = '/app/dashboard'; }}
      >
        {t('404.button')}
      </Button>
    </div>
  );
}

