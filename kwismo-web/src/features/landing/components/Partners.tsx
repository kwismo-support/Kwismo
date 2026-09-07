import { useTranslation } from 'react-i18next';
import { Icon } from '@iconify/react';
import ImgOperateur from '@/assets/illustrations/Img_Operateur.jpeg';

export default function Partners() {
  const { t } = useTranslation('landing');

  const benefits = t('operatorsInstitutions.points', { returnObjects: true }) as string[];

  return (
    <section id="partner" className="w-full bg-white dark:bg-brand-darkBg px-6 py-12 font-body transition-colors">
      <div className="mx-auto grid max-w-[1060px] grid-cols-1 items-center gap-8 md:grid-cols-2">
        <div className="relative overflow-hidden rounded-2xl border border-slate-200 dark:border-white/10 shadow-lg">
          <img
            src={ImgOperateur}
            alt="KWISMO"
            className="h-auto w-full object-cover"
          />

          <div className="absolute bottom-3 left-3 p-3 rounded-xl bg-black/60 backdrop-blur-md border border-white/20 text-white">
            <p className="font-title text-xs font-semibold">
              {t('landing:operatorsInstitutions.badgeTitle')}
            </p>
            <p className="text-[10px] text-white/80">
              {t('landing:operatorsInstitutions.badgeDesc')}
            </p>
          </div>
        </div>

        <div className="flex flex-col items-start">
          <h2 className="font-title text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white leading-tight">
            {t('landing:operatorsInstitutions.title')}
          </h2>

          <p className="mt-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            {t('landing:operatorsInstitutions.subtitle')}
          </p>

          <div className="mt-4 flex flex-col gap-2.5">
            {Array.isArray(benefits) && benefits.map((benefit, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <Icon icon="solar:check-circle-bold" className="text-brand-green text-sm shrink-0" />
                <span className="text-xs text-slate-700 dark:text-slate-200">
                  {benefit}
                </span>
              </div>
            ))}
          </div>

          <a
            href="#contact"
            className="mt-6 flex h-10 items-center gap-2 rounded-xl bg-brand-green px-5 text-xs font-semibold text-white transition hover:bg-brand-green/90 shadow-md"
          >
            <span>{t('landing:operatorsInstitutions.cta')}</span>
            <Icon icon="solar:arrow-right-linear" className="text-sm" />
          </a>
        </div>
      </div>
    </section>
  );
}