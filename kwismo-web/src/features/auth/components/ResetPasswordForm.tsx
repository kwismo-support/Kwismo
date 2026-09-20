import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { Icon } from '@iconify/react';
import { Input } from '@/shared/ui/input';
import { Button } from '@/shared/ui/button';
import { resetPasswordSchema, type ResetPasswordInput } from '../schemas/auth.schema';
import { useResetPassword } from '../hooks/useResetPassword';

interface ResetPasswordFormProps {
  onSuccess?: () => void;
}

export default function ResetPasswordForm({ onSuccess }: ResetPasswordFormProps) {
  const { t } = useTranslation('auth');
  const [showPassword, setShowPassword] = useState(false);
  const { resetPassword, loading, success } = useResetPassword();

  const searchParams = new URLSearchParams(window.location.search);
  const token = searchParams.get('token') || '';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: ResetPasswordInput) => {
    try {
      await resetPassword(data, token);
      if (onSuccess) onSuccess();
    } catch {}
  };

  if (success) {
    return (
      <div className="flex flex-col items-center gap-4 text-center p-6 bg-brand-green/10 border border-brand-green/30 rounded-3xl font-body">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-green text-white shadow-lg">
          <Icon icon="solar:check-circle-bold" className="text-3xl" />
        </div>
        <h3 className="font-title text-xl font-bold text-slate-900 dark:text-white">
          {t('resetSuccessTitle')}
        </h3>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-md">
          {t('resetSuccessDesc')}
        </p>
        <a
          href="/auth/login"
          className="mt-2 inline-flex items-center gap-2 text-xs font-semibold text-brand-green hover:underline"
        >
          <Icon icon="solar:login-bold" className="text-sm" />
          <span>{t('backToLogin')}</span>
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 w-full font-body">
      {!token && (
        <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-600 dark:text-amber-400 text-xs flex items-center gap-2">
          <Icon icon="solar:danger-circle-bold" className="text-base flex-shrink-0" />
          <span>{t('missingTokenWarning')}</span>
        </div>
      )}

      <Input
        type={showPassword ? 'text' : 'password'}
        label={t('password')}
        placeholder="••••••••"
        leftIcon="solar:lock-password-bold"
        rightIcon={
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <Icon icon={showPassword ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
          </button>
        }
        errorKey={errors.newPassword?.message}
        {...register('newPassword')}
      />

      <Input
        type={showPassword ? 'text' : 'password'}
        label={t('confirmPassword')}
        placeholder="••••••••"
        leftIcon="solar:lock-password-bold"
        errorKey={errors.confirmPassword?.message}
        {...register('confirmPassword')}
      />

      <Button
        type="submit"
        variant="primary"
        size="md"
        fullWidth
        isLoading={loading}
        leftIcon="solar:check-circle-bold"
        className="mt-2"
      >
        {t('submitReset')}
      </Button>

      <div className="mt-4 flex flex-col items-center gap-3 pt-4 border-t border-slate-200 dark:border-white/10 text-xs">
        <a
          href="/auth/login"
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


