import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { Icon } from '@iconify/react';
import { Input } from '@/shared/ui/input';
import { Button } from '@/shared/ui/button';
import { loginSchema, type LoginInput } from '../schemas/auth.schema';
import { authApi } from '../services/auth.api';

interface LoginFormProps {
  onForgotPassword?: () => void;
  onRegisterPartner?: () => void;
}

export default function LoginForm({ onForgotPassword, onRegisterPartner }: LoginFormProps) {
  const { t } = useTranslation('auth');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    setLoading(true);
    try {
      await authApi.login(data);
      window.location.href = '/app/dashboard';
    } catch {
      // Toast notification is automatically dispatched by authApi
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 w-full font-body">
      <Input
        type="email"
        label={t('emailLabel')}
        placeholder={t('emailPlaceholder')}
        leftIcon="solar:letter-bold"
        errorKey={errors.email?.message}
        {...register('email')}
      />

      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <label className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">
            {t('password')}
          </label>
          {onForgotPassword && (
            <button
              type="button"
              onClick={onForgotPassword}
              className="text-[11px] font-medium text-brand-orange hover:underline focus:outline-none"
            >
              {t('forgotPassword')}
            </button>
          )}
        </div>

        <Input
          type={showPassword ? 'text' : 'password'}
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
          errorKey={errors.password?.message}
          {...register('password')}
        />
      </div>

      <Button
        type="submit"
        variant="primary"
        size="md"
        fullWidth
        isLoading={loading}
        leftIcon="solar:login-bold"
        className="mt-2"
      >
        {t('submitLogin')}
      </Button>

      <div className="mt-4 flex flex-col items-center gap-3 pt-4 border-t border-slate-200 dark:border-white/10 text-xs">
        <a
          href="/auth/register"
          onClick={(e) => {
            if (onRegisterPartner) {
              e.preventDefault();
              onRegisterPartner();
            }
          }}
          className="font-medium text-brand-green hover:underline flex items-center gap-1.5"
        >
          <Icon icon="solar:hand-stars-bold" className="text-sm" />
          <span>{t('partnerRegisterLink')}</span>
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

