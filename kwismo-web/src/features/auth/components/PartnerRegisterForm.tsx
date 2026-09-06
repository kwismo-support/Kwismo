import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { Icon } from '@iconify/react';
import { Input } from '@/shared/ui/input';
import { PhoneInput } from '@/shared/ui/phone-input';
import { Button } from '@/shared/ui/button';
import { partnerRegisterSchema, type PartnerRegisterInput } from '../schemas/auth.schema';
import { authApi } from '../services/auth.api';

interface PartnerRegisterFormProps {
  onSuccess?: () => void;
  onBackToLogin?: () => void;
}

export default function PartnerRegisterForm({ onSuccess, onBackToLogin }: PartnerRegisterFormProps) {
  const { t } = useTranslation('auth');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<PartnerRegisterInput>({
    resolver: zodResolver(partnerRegisterSchema),
    defaultValues: {
      typePartenariat: 'mno',
    },
  });

  const onSubmit = async (data: PartnerRegisterInput) => {
    setLoading(true);
    try {
      await authApi.registerPartner(data);
      setSubmitted(true);
      if (onSuccess) onSuccess();
    } catch {
      // Toast handles error
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center gap-4 text-center p-6 bg-brand-green/10 border border-brand-green/30 rounded-3xl font-body">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-green text-white">
          <Icon icon="solar:check-circle-bold" className="text-2xl" />
        </div>
        <h3 className="font-title text-lg font-bold text-slate-900 dark:text-white">
          {t('partnerRegisterSuccessTitle')}
        </h3>
        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed max-w-sm">
          {t('partnerRegisterSuccessDesc')}
        </p>
        <a
          href="/"
          className="mt-2 inline-flex items-center gap-2 text-xs font-semibold text-brand-green hover:underline"
        >
          <Icon icon="solar:arrow-left-linear" className="text-sm" />
          <span>{t('backToHomeLink')}</span>
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 w-full font-body">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label={t('companyNameLabel')}
          placeholder={t('companyNamePlaceholder')}
          leftIcon="solar:buildings-bold"
          errorKey={errors.nomEntreprise?.message}
          {...register('nomEntreprise')}
        />

        <div className="flex flex-col gap-1.5">
          <label className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">
            {t('partnershipTypeLabel')}
          </label>
          <div className="relative">
            <select
              {...register('typePartenariat')}
              className="w-full h-10 px-3 py-2 rounded-xl bg-slate-100 dark:bg-white/10 border border-slate-200 dark:border-white/15 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-green transition"
            >
              <option value="mno">{t('partnershipTypes.mno')}</option>
              <option value="bank">{t('partnershipTypes.bank')}</option>
              <option value="fintech">{t('partnershipTypes.fintech')}</option>
              <option value="microfinance">{t('partnershipTypes.microfinance')}</option>
              <option value="merchant">{t('partnershipTypes.merchant')}</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label={t('contactLastNameLabel')}
          placeholder={t('contactLastNamePlaceholder')}
          leftIcon="solar:user-bold"
          errorKey={errors.nomContact?.message}
          {...register('nomContact')}
        />

        <Input
          label={t('contactFirstNameLabel')}
          placeholder={t('contactFirstNamePlaceholder')}
          leftIcon="solar:user-bold"
          errorKey={errors.prenomContact?.message}
          {...register('prenomContact')}
        />
      </div>

      <Input
        type="email"
        label={t('emailLabel')}
        placeholder={t('emailPlaceholder')}
        leftIcon="solar:letter-bold"
        errorKey={errors.email?.message}
        {...register('email')}
      />

      <Controller
        name="telephone"
        control={control}
        render={({ field }) => (
          <PhoneInput
            label={t('phoneLabel')}
            value={field.value ?? ''}
            onChange={(val) => field.onChange(val)}
          />
        )}
      />

      <div className="flex flex-col gap-1.5">
        <label className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">
          {t('messageLabel')}
        </label>
        <textarea
          rows={3}
          placeholder={t('messagePlaceholder')}
          className="w-full p-3 rounded-xl bg-slate-100 dark:bg-white/10 border border-slate-200 dark:border-white/15 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-green transition"
          {...register('message')}
        />
      </div>

      <Button
        type="submit"
        variant="primary"
        size="md"
        fullWidth
        isLoading={loading}
        leftIcon="solar:hand-stars-bold"
        className="mt-2"
      >
        {t('submitPartnerRegister')}
      </Button>

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
          <Icon icon="solar:user-bold" className="text-sm" />
          <span>{t('alreadyPartnerLoginLink')}</span>
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
