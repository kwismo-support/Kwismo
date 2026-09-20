import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { Icon } from '@iconify/react';
import { Input } from '@/shared/ui/input';
import { Button } from '@/shared/ui/button';
import { useAuthStore } from '@/shared/store/authStore';
import { deviceVerifySchema, type DeviceVerifyInput } from '../schemas/auth.schema';

interface DeviceVerifyFormProps {
  email: string;
  onVerify: (code: string) => Promise<void>;
  onCancel: () => void;
}

export default function DeviceVerifyForm({ email, onVerify, onCancel }: DeviceVerifyFormProps) {
  const { t } = useTranslation('auth');
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DeviceVerifyInput>({
    resolver: zodResolver(deviceVerifySchema),
  });

  const onSubmit = async (data: DeviceVerifyInput) => {
    setLoading(true);
    try {
      await onVerify(data.code);
      const role = useAuthStore.getState().user?.role || 'user';
      window.location.href = role === 'user' ? '/app/user' : '/app/dashboard';
    } catch {
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 w-full font-body">
      <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-amber-600 dark:text-amber-400 text-xs flex flex-col gap-1">
        <div className="flex items-center gap-2 font-bold">
          <Icon icon="solar:shield-warning-bold" className="text-base" />
          <span>{t('deviceVerifyTitle')}</span>
        </div>
        <p className="text-[11px] leading-relaxed opacity-90">
          {t('deviceVerifyDesc', { email })}
        </p>
      </div>

      <Input
        type="text"
        label={t('otpLabel')}
        placeholder="123456"
        leftIcon="solar:key-bold"
        errorKey={errors.code?.message}
        {...register('code')}
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
        {t('submitDeviceVerify')}
      </Button>

      <div className="mt-4 flex flex-col items-center gap-3 pt-4 border-t border-slate-200 dark:border-white/10 text-xs">
        <button
          type="button"
          onClick={onCancel}
          className="font-medium text-slate-500 hover:text-slate-800 dark:hover:text-white transition flex items-center gap-1.5"
        >
          <Icon icon="solar:arrow-left-linear" className="text-sm" />
          <span>{t('cancelDeviceVerify')}</span>
        </button>
      </div>
    </form>
  );
}
