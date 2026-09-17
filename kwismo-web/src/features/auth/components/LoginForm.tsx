import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { Icon } from '@iconify/react';
import { Input } from '@/shared/ui/input';
import { Button } from '@/shared/ui/button';
import { loginSchema, type LoginInput } from '../schemas/auth.schema';
import { useLogin } from '../hooks/useLogin';
import { useAuthStore } from '@/shared/store/authStore';
import DeviceVerifyForm from './DeviceVerifyForm';

interface LoginFormProps {
  onForgotPassword?: () => void;
  onRegisterPartner?: () => void;
}

export default function LoginForm({ onForgotPassword, onRegisterPartner: _onRegisterPartner }: LoginFormProps) {
  const { t } = useTranslation('auth');
  const [showPassword, setShowPassword] = useState(false);
  const { login, verifyDevice, loading, deviceVerifyData, clearDeviceVerify } = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    try {
      const result = await login(data);
      if (result && !result.requiresDeviceVerification) {
        const role = result.user?.role || useAuthStore.getState().user?.role || 'user';
        window.location.href = role === 'user' ? '/app/user' : '/app/dashboard';
      }
    } catch {}
  };

  if (deviceVerifyData) {
    return (
      <DeviceVerifyForm
        email={deviceVerifyData.email}
        onVerify={async (code) => {
          await verifyDevice(code);
        }}
        onCancel={clearDeviceVerify}
      />
    );
  }

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
              onClick={() => setShowPassword((prev) => !prev)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer p-1 focus:outline-none"
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


