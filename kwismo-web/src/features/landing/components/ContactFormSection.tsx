import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from '@iconify/react';

export default function ContactFormSection() {
  const { t } = useTranslation('landing');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <section id="contact" className="w-full bg-[#E6F7F2] dark:bg-[#0E231E] px-6 py-16 transition-colors">
      <div className="mx-auto max-w-[800px]">

        {/* Header */}
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="font-title text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white">
            {t('contactForm.title', 'Une question ? Une idée ?')}
          </h2>
          <p className="mt-2 font-body text-xs sm:text-sm text-slate-600 dark:text-slate-300">
            {t('contactForm.subtitle', 'Notre équipe est disponible pour répondre à toutes vos questions.')}
          </p>
        </div>

        {/* Form Container */}
        <div className="mt-10">
          {submitted ? (
            <div className="p-8 rounded-3xl bg-white dark:bg-[#161E33] shadow-lg text-center flex flex-col items-center">
              <Icon icon="lucide:check-circle" className="text-5xl text-[#32B07F] mb-3" />
              <h3 className="font-title text-xl font-bold text-slate-900 dark:text-white">
                {t('contactForm.successTitle', 'Message envoyé !')}
              </h3>
              <p className="mt-2 font-body text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                {t(
                  'contactForm.successDesc',
                  'Merci de nous avoir contactés. Nous vous répondrons dans un délai de 24 à 48 heures.'
                )}
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  type="text"
                  required
                  placeholder={t('contactForm.name', 'Votre nom')}
                  className="h-12 px-4 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#161E33] text-xs sm:text-sm font-body text-slate-900 dark:text-white focus:outline-none focus:border-[#32B07F] shadow-sm"
                />
                <input
                  type="email"
                  required
                  placeholder={t('contactForm.email', 'Votre adresse email')}
                  className="h-12 px-4 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#161E33] text-xs sm:text-sm font-body text-slate-900 dark:text-white focus:outline-none focus:border-[#32B07F] shadow-sm"
                />
              </div>

              <input
                type="text"
                required
                placeholder={t('contactForm.subject', 'Sujet')}
                className="h-12 px-4 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#161E33] text-xs sm:text-sm font-body text-slate-900 dark:text-white focus:outline-none focus:border-[#32B07F] shadow-sm"
              />

              <textarea
                required
                rows={4}
                placeholder={t('contactForm.message', 'Message')}
                className="p-4 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#161E33] text-xs sm:text-sm font-body text-slate-900 dark:text-white focus:outline-none focus:border-[#32B07F] shadow-sm resize-none"
              />

              <button
                type="submit"
                className="mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#32B07F] text-white font-body text-sm font-semibold shadow-md hover:bg-[#2aa072] transition"
              >
                <Icon icon="solar:plain-bold" className="text-lg" />
                <span>{t('contactForm.submit', 'Envoyer le message')}</span>
              </button>
            </form>
          )}
        </div>

      </div>
    </section>
  );
}
