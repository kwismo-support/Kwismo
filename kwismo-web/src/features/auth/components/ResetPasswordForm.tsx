import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { Icon } from '@iconify/react';
import { Input } from '@/shared/ui/input';
import { Button } from '@/shared/ui/button';
import { resetPasswordSchema, type ResetPasswordInput } from '../schemas/auth.schema';
import { authApi } from '../services/auth.api';

interface ResetPasswordFormProps {
  onSuccess?: () => void;
}

export default function ResetPasswordForm({ onSuccess }: ResetPasswordFormProps) {
  const { t } = useTranslation('auth');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: ResetPasswordInput) => {
    setLoading(true);
    try {
      await authApi.resetPassword(data);
      if (onSuccess) onSuccess();
    } catch {
      // Toast notification is automatically dispatched by authApi
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 w-full font-body">
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
    </form>
  );
}
