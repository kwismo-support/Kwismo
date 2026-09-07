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

export default function LoginForm({ onForgotPassword, onRegisterPartner: _onRegisterPartner }: LoginFormProps) {
  const { t } = useTranslation('auth');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
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
      {/* Demo Credentials Helper Box */}
      <div className="p-3.5 bg-brand-green/10 dark:bg-white/5 rounded-2xl border border-brand-green/30 dark:border-white/10 text-xs flex flex-col gap-2 font-body">
        <div className="flex items-center justify-between font-bold text-slate-800 dark:text-white">
          <span className="flex items-center gap-1.5 text-brand-green dark:text-brand-green">
            <Icon icon="solar:key-minimalistic-bold-duotone" className="text-base" />
            <span>Identifiants de démonstration</span>
          </span>
          <span className="text-[10px] text-slate-400 font-mono">MDP: Password123!</span>
        </div>
        <div className="flex flex-col gap-1.5">
          <button
            type="button"
            onClick={() => {
              setValue('email', 'admin@kwismo.com');
              setValue('password', 'Password123!');
            }}
            className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-white dark:bg-brand-navy border border-slate-200 dark:border-white/10 text-[11px] font-medium text-slate-700 dark:text-slate-200 hover:border-brand-green hover:text-brand-green transition cursor-pointer"
          >
            <span className="flex items-center gap-1.5">
              <Icon icon="solar:shield-user-bold" className="text-brand-orange" />
              <strong>Super Admin:</strong> admin@kwismo.com
            </span>
            <span className="text-[10px] text-brand-green font-semibold">Remplir →</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setValue('email', 'claire.kamga@orange.cm');
              setValue('password', 'Password123!');
            }}
            className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-white dark:bg-brand-navy border border-slate-200 dark:border-white/10 text-[11px] font-medium text-slate-700 dark:text-slate-200 hover:border-brand-green hover:text-brand-green transition cursor-pointer"
          >
            <span className="flex items-center gap-1.5">
              <Icon icon="solar:buildings-bold" className="text-brand-green" />
              <strong>Partenaire Orange:</strong> claire.kamga@orange.cm
            </span>
            <span className="text-[10px] text-brand-green font-semibold">Remplir →</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setValue('email', 'alain.fosso@mtn.cm');
              setValue('password', 'Password123!');
            }}
            className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-white dark:bg-brand-navy border border-slate-200 dark:border-white/10 text-[11px] font-medium text-slate-700 dark:text-slate-200 hover:border-brand-green hover:text-brand-green transition cursor-pointer"
          >
            <span className="flex items-center gap-1.5">
              <Icon icon="solar:buildings-bold" className="text-brand-orange" />
              <strong>Partenaire MTN:</strong> alain.fosso@mtn.cm
            </span>
            <span className="text-[10px] text-brand-green font-semibold">Remplir →</span>
          </button>
        </div>
      </div>

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

