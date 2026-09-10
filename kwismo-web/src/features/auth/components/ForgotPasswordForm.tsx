import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { Icon } from '@iconify/react';
import { Input } from '@/shared/ui/input';
import { Button } from '@/shared/ui/button';
import { forgotPasswordSchema, type ForgotPasswordInput } from '../schemas/auth.schema';
import { authApi } from '../services/auth.api';

interface ForgotPasswordFormProps {
  onBackToLogin?: () => void;
}

export default function ForgotPasswordForm({ onBackToLogin }: ForgotPasswordFormProps) {
  const { t } = useTranslation('auth');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordInput) => {
    setLoading(true);
    try {
      await authApi.forgotPassword(data);
      setSent(true);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 w-full font-body">
      {sent ? (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold text-center">
          {t('emailSent')}
        </div>
      ) : (
        <Input
          type="email"
          label={t('emailLabel')}
          placeholder={t('emailPlaceholder')}
          leftIcon="solar:letter-bold"
          errorKey={errors.email?.message}
          {...register('email')}
        />
      )}

      {!sent && (
        <Button
          type="submit"
          variant="primary"
          size="md"
          fullWidth
          isLoading={loading}
          leftIcon="solar:plain-bold"
          className="mt-2"
        >
          {t('submitForgot')}
        </Button>
      )}

      <div className="mt-4 flex flex-col items-center gap-3 pt-4 border-t border-slate-200 dark:border-white/10 text-xs">
        <a
          href="/auth/login"
          onClick={(e) => {
            if (onBackToLogin) {
              e.preventDefault();
              onBackToLogin();
            }
          }}
          className="font-medium text-brand-green hover:underline flex items-center gap-1.5"
        >
          <Icon icon="solar:alt-arrow-left-bold" className="text-sm" />
          <span>{t('backToLogin')}</span>
        </a>

        <a
          href="/"
          className="text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition flex items-center gap-1"
        >
          <Icon icon="solar:arrow-left-linear" className="text-sm" />
          <span>{t('backToHomeLink')}</span>
        </a>
      </div>
    </form>
  );
}

