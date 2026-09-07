import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from '@iconify/react';
import { toast } from '@/shared/store/toastStore';

export default function ContactFormSection() {
  const { t } = useTranslation('landing');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    toast.success(t('landing:contactForm.successTitle'));
  };

  return (
    <section id="contact" className="w-full bg-brand-mint dark:bg-brand-darkBg px-6 py-16 transition-colors font-body">
      <div className="mx-auto max-w-[800px]">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="font-title text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white">
            {t('landing:contactForm.title')}
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
            {t('landing:contactForm.subtitle')}
          </p>
        </div>

        <div className="mt-10">
          {submitted ? (
            <div className="p-8 rounded-3xl bg-white dark:bg-brand-navy shadow-lg text-center flex flex-col items-center">
              <Icon icon="solar:check-circle-bold" className="text-5xl text-brand-green mb-3" />
              <h3 className="font-title text-xl font-bold text-slate-900 dark:text-white">
                {t('landing:contactForm.successTitle')}
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                {t('landing:contactForm.successDesc')}
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  type="text"
                  required
                  placeholder={t('landing:contactForm.name')}
                  className="h-12 px-4 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-brand-navy text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-brand-green shadow-sm"
                />
                <input
                  type="email"
                  required
                  placeholder={t('landing:contactForm.email')}
                  className="h-12 px-4 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-brand-navy text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-brand-green shadow-sm"
                />
              </div>

              <input
                type="text"
                required
                placeholder={t('landing:contactForm.subject')}
                className="h-12 px-4 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-brand-navy text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-brand-green shadow-sm"
              />

              <textarea
                required
                rows={4}
                placeholder={t('landing:contactForm.message')}
                className="p-4 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-brand-navy text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-brand-green shadow-sm resize-none"
              />

              <button
                type="submit"
                className="mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-brand-green text-white text-sm font-semibold shadow-md hover:bg-brand-green/90 transition"
              >
                <Icon icon="solar:plain-bold" className="text-lg" />
                <span>{t('landing:contactForm.submit')}</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
