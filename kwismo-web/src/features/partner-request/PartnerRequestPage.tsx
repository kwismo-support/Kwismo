import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Icon } from '@iconify/react';
import ContactBar from '@/features/landing/components/ContactBar';
import Navbar from '@/features/landing/components/Navbar';
import Footer from '@/features/landing/components/Footer';
import { Input } from '@/shared/ui/input';
import { PhoneInput } from '@/shared/ui/phone-input';
import { CountrySelect } from '@/shared/ui/country-select';
import { COUNTRY_LIST, detectUserCountryCode } from '@/shared/lib/phone';
import { partnerRequestsStore } from '@/features/partners/services/partnerRequestsStore';
import { authApi } from '@/features/auth/services/auth.api';

interface FormInputs {
  nomEntreprise: string;
  nomContact: string;
  email: string;
  telephone: string;
  typePartenariat: string;
  pays: string;
  message?: string;
}

export default function PartnerRequestPage() {
  const { t, i18n } = useTranslation(['partnerRequest', 'common']);
  const [loading, setLoading] = useState(false);
  const [submittedData, setSubmittedData] = useState<FormInputs | null>(null);

  const lang = i18n.language.startsWith('en') ? 'en' : 'fr';

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormInputs>({
    defaultValues: {
      typePartenariat: '',
      pays: detectUserCountryCode(),
    },
  });

  const onSubmit = async (data: FormInputs) => {
    setLoading(true);
    try {
      const nameParts = data.nomContact.trim().split(' ');
      const prenom = nameParts[0] || '';
      const nom = nameParts.slice(1).join(' ') || prenom;

      const selectedCountryObj = COUNTRY_LIST.find((c) => c.code === data.pays);
      const countryName = selectedCountryObj ? (lang === 'en' ? selectedCountryObj.nameEn : selectedCountryObj.nameFr) : data.pays;

      partnerRequestsStore.addRequest({
        nomEntreprise: data.nomEntreprise,
        typePartenariat: data.typePartenariat || 'mno',
        nomContact: nom,
        prenomContact: prenom,
        email: data.email,
        telephone: data.telephone,
        message: data.message ? `[Pays: ${countryName}] ${data.message}` : `[Pays: ${countryName}]`,
      });

      await authApi.registerPartner({
        nomEntreprise: data.nomEntreprise,
        typePartenariat: data.typePartenariat as any,
        nomContact: nom,
        prenomContact: prenom,
        email: data.email,
        telephone: data.telephone,
        message: data.message,
      });

      setSubmittedData(data);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-brand-darkBg font-body text-slate-900 dark:text-white transition-colors duration-200">
      <ContactBar />
      <Navbar />

      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl flex flex-col items-center">
          <span className="text-brand-orange text-xs sm:text-sm font-bold tracking-widest uppercase mb-2 text-center">
            {t('partnerRequest:badge')}
          </span>

          <h1 className="font-title text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight text-center">
            {t('partnerRequest:title')}
          </h1>

          <p className="mt-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-xl text-center leading-relaxed">
            {t('partnerRequest:subtitle')}
          </p>

          <div className="mt-10 w-full max-w-3xl bg-white dark:bg-brand-navy rounded-3xl border border-slate-200 dark:border-white/10 shadow-xl p-6 sm:p-10 transition-all">
            {submittedData ? (
              <div className="flex flex-col items-center text-center py-8 px-4 gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-green text-white shadow-lg">
                  <Icon icon="solar:check-circle-bold" className="text-4xl" />
                </div>
                <h3 className="font-title text-2xl font-bold text-slate-900 dark:text-white">
                  {t('partnerRequest:successTitle')}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-md leading-relaxed">
                  {t('partnerRequest:successDesc', { company: submittedData.nomEntreprise })}
                </p>
                <a
                  href="/"
                  className="mt-4 inline-flex items-center gap-2 px-6 h-11 rounded-xl bg-brand-green text-white text-xs font-semibold hover:bg-brand-green/90 shadow-md transition"
                >
                  <Icon icon="solar:arrow-left-linear" className="text-base" />
                  <span>{t('partnerRequest:backToHome')}</span>
                </a>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <Input
                    label={t('partnerRequest:companyNameLabel')}
                    placeholder={t('partnerRequest:companyNamePlaceholder')}
                    required
                    errorKey={errors.nomEntreprise?.message}
                    {...register('nomEntreprise', { required: true })}
                  />

                  <Input
                    label={t('partnerRequest:contactNameLabel')}
                    placeholder={t('partnerRequest:contactNamePlaceholder')}
                    required
                    errorKey={errors.nomContact?.message}
                    {...register('nomContact', { required: true })}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <Input
                    type="email"
                    label={t('partnerRequest:emailLabel')}
                    placeholder={t('partnerRequest:emailPlaceholder')}
                    required
                    errorKey={errors.email?.message}
                    {...register('email', { required: true })}
                  />

                  <Controller
                    name="telephone"
                    control={control}
                    render={({ field }) => (
                      <PhoneInput
                        label={t('partnerRequest:phoneLabel')}
                        required
                        value={field.value ?? ''}
                        onChange={(val) => field.onChange(val)}
                      />
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="flex flex-col gap-1.5 font-body">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {t('partnerRequest:partnershipTypeLabel')} <span className="text-rose-500">*</span>
                    </label>
                    <select
                      required
                      className="w-full h-11 px-4 rounded-xl border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-brand-navy text-xs sm:text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-brand-green transition cursor-pointer"
                      {...register('typePartenariat', { required: true })}
                    >
                      <option value="" disabled>{t('partnerRequest:partnershipTypeSelect')}</option>
                      <option value="mno">{t('partnerRequest:partnershipTypes.mno')}</option>
                      <option value="bank">{t('partnerRequest:partnershipTypes.bank')}</option>
                      <option value="fintech">{t('partnerRequest:partnershipTypes.fintech')}</option>
                      <option value="microfinance">{t('partnerRequest:partnershipTypes.microfinance')}</option>
                      <option value="merchant">{t('partnerRequest:partnershipTypes.merchant')}</option>
                    </select>
                  </div>

                  <Controller
                    name="pays"
                    control={control}
                    render={({ field }) => (
                      <CountrySelect
                        label={t('partnerRequest:countryLabel')}
                        required
                        value={field.value ?? 'CM'}
                        onChange={(val) => field.onChange(val)}
                      />
                    )}
                  />
                </div>

                {}
                <div className="flex flex-col gap-1.5 font-body">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {t('partnerRequest:messageLabel')}
                  </label>
                  <textarea
                    rows={4}
                    placeholder={t('partnerRequest:messagePlaceholder')}
                    className="p-4 rounded-xl border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-brand-navy text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-brand-green transition resize-none"
                    {...register('message')}
                  />
                </div>

                {}
                <div className="flex justify-end mt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex h-12 items-center gap-2.5 rounded-xl bg-brand-navy dark:bg-brand-green hover:bg-brand-navy/90 dark:hover:bg-brand-green/90 px-7 text-xs sm:text-sm font-semibold text-white shadow-md transition disabled:opacity-50 cursor-pointer"
                  >
                    <Icon icon="solar:plain-bold" className="text-lg" />
                    <span>{loading ? t('partnerRequest:submitting') : t('partnerRequest:submit')}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
