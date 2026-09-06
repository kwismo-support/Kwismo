import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
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
      // Toast notification is automatically dispatched by authApi
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
          label={t('identifierLabel')}
          placeholder={t('identifierPlaceholder')}
          leftIcon="solar:letter-bold"
          errorKey={errors.emailOrPhone?.message}
          {...register('emailOrPhone')}
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

      {onBackToLogin && (
        <Button
          type="button"
          variant="outline"
          size="md"
          fullWidth
          onClick={onBackToLogin}
          leftIcon="solar:alt-arrow-left-bold"
        >
          {t('backToLogin')}
        </Button>
      )}
    </form>
  );
}
