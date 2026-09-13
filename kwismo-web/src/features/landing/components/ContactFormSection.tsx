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

  const contactInfos = [
    {
      title: t('landing:contactForm.supportEmailTitle'),
      value: 'kwismosupport@gmail.com',
      icon: 'solar:letter-bold-duotone',
      color: 'text-brand-green bg-brand-green/10 border-brand-green/20',
      href: 'mailto:kwismosupport@gmail.com',
    },
    {
      title: t('landing:contactForm.supportPhoneTitle'),
      value: '+237 698 44 43 88',
      icon: 'solar:phone-calling-bold-duotone',
      color: 'text-brand-orange bg-brand-orange/10 border-brand-orange/20',
      href: 'tel:+237698444388',
    },
    {
      title: t('landing:contactForm.supportLocationTitle'),
      value: t('landing:contactForm.supportLocationDesc'),
      icon: 'solar:map-point-wave-bold-duotone',
      color: 'text-brand-green bg-brand-green/10 border-brand-green/20',
      href: '#',
    },
  ];

  return (
    <section id="contact" className="w-full bg-slate-50 dark:bg-brand-navy px-6 py-20 lg:py-24 transition-colors font-body">
      <div className="mx-auto max-w-[90%]">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <h2 className="font-title text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {t('landing:contactForm.title')}
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-300">
            {t('landing:contactForm.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-stretch">
          <div className="lg:col-span-6 flex flex-col justify-between gap-8 h-full">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {contactInfos.map((info, idx) => (
                <a
                  key={idx}
                  href={info.href}
                  className="flex flex-col items-center p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-brand-darkBg shadow-md hover:shadow-lg transition-all duration-200"
                >
                  <div className={`flex h-12 w-12 items-center justify-center ${info.color} mb-2`}>
                    <Icon icon={info.icon} className="text-5xl" />
                  </div>
                  <span className="mt-1 text-xs sm:text-sm font-semibold text-slate-900 dark:text-white break-words">
                    {info.value}
                  </span>
                </a>
              ))}
            </div>

            <div className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-brand-darkBg shadow-lg overflow-hidden flex-1 min-h-[260px] relative">
              <iframe
                title="KWISMO Location Map"
                src="https://maps.google.com/maps?q=Douala,%20Cameroon&t=&z=12&ie=UTF8&iwloc=&output=embed"
                className="w-full h-full border-0 opacity-100 transition-all duration-300"
                loading="lazy"
              />
            </div>
          </div>

          <div className="lg:col-span-6 bg-transparent h-full flex flex-col justify-between">
            {submitted ? (
              <div className="p-8 sm:p-10 rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-brand-darkBg shadow-xl text-center flex flex-col items-center justify-center h-full">
                <Icon icon="solar:check-circle-bold" className="text-6xl text-brand-green mb-4" />
                <h3 className="font-title text-2xl font-bold text-slate-900 dark:text-white">
                  {t('landing:contactForm.successTitle')}
                </h3>
                <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                  {t('landing:contactForm.successDesc')}
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col justify-between gap-5 h-full">
                <div className="flex flex-col gap-5 flex-1 justify-between">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <input
                      type="text"
                      required
                      placeholder={t('landing:contactForm.name')}
                      className="h-14 px-5 rounded-2xl border border-slate-300 dark:border-white/15 bg-white dark:bg-brand-darkBg text-sm sm:text-base text-slate-900 dark:text-white focus:outline-none focus:border-brand-green shadow-sm"
                    />
                    <input
                      type="email"
                      required
                      placeholder={t('landing:contactForm.email')}
                      className="h-14 px-5 rounded-2xl border border-slate-300 dark:border-white/15 bg-white dark:bg-brand-darkBg text-sm sm:text-base text-slate-900 dark:text-white focus:outline-none focus:border-brand-green shadow-sm"
                    />
                  </div>

                  <input
                    type="text"
                    required
                    placeholder={t('landing:contactForm.subject')}
                    className="h-14 px-5 rounded-2xl border border-slate-300 dark:border-white/15 bg-white dark:bg-brand-darkBg text-sm sm:text-base text-slate-900 dark:text-white focus:outline-none focus:border-brand-green shadow-sm"
                  />

                  <textarea
                    required
                    rows={6}
                    placeholder={t('landing:contactForm.message')}
                    className="p-5 rounded-2xl border border-slate-300 dark:border-white/15 bg-white dark:bg-brand-darkBg text-sm sm:text-base text-slate-900 dark:text-white focus:outline-none focus:border-brand-green shadow-sm resize-none flex-1 min-h-[140px]"
                  />
                </div>

                <button
                  type="submit"
                  className="btn-brand-green h-14 w-full text-base sm:text-lg gap-3 shrink-0"
                >
                  <Icon icon="solar:plain-bold" className="text-xl shrink-0" />
                  <span>{t('landing:contactForm.submit')}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
