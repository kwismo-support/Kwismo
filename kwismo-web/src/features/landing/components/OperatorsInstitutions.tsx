// Partner section tailored for telecommunication operators and financial institutions.
import { useTranslation } from 'react-i18next';
import { Icon } from '@iconify/react';
import ImgOperateur from '@/assets/illustrations/Img_Operateur.jpeg';

export default function OperatorsInstitutions() {
  const { t } = useTranslation('landing');

  const points = t('operatorsInstitutions.points', { returnObjects: true }) as string[];

  return (
    <section className="w-full bg-slate-50 dark:bg-brand-navy px-6 py-16 transition-colors font-body">
      <div className="mx-auto max-w-[1200px] grid grid-cols-1 lg:grid-cols-2 items-stretch gap-12">
        <div className="relative flex justify-center h-full">
          <div className="relative overflow-hidden rounded-3xl border border-slate-200 dark:border-white/10 shadow-2xl w-full h-full min-h-[340px]">
            <img
              src={ImgOperateur}
              alt="KWISMO"
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-4 left-4 right-4 p-4 rounded-2xl bg-black/65 backdrop-blur-md border border-white/20 text-white">
              <h4 className="font-title text-sm font-bold">
                {t('landing:operatorsInstitutions.badgeTitle')}
              </h4>
              <p className="text-xs text-white/80">
                {t('landing:operatorsInstitutions.badgeDesc')}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-between items-start h-full py-2">
          <div>
            <h2 className="font-title text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white leading-tight">
              {t('landing:operatorsInstitutions.title')}
            </h2>

            <p className="mt-4 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {t('landing:operatorsInstitutions.subtitle')}
            </p>

            <ul className="mt-6 flex flex-col gap-3.5 text-xs sm:text-sm text-slate-700 dark:text-slate-200">
              {Array.isArray(points) && points.map((pt, idx) => (
                <li key={idx} className="flex items-center gap-2.5">
                  <Icon icon="solar:check-read-bold" className="text-brand-green text-base shrink-0" />
                  <span>{pt}</span>
                </li>
              ))}
            </ul>
          </div>

          <a
            href="/auth/register"
            className="mt-8 flex h-[44px] items-center gap-3 rounded-xl bg-brand-green pl-6 pr-2.5 text-xs sm:text-sm font-semibold text-white shadow-md hover:bg-brand-green/90 transition"
          >
            <span>{t('landing:operatorsInstitutions.cta')}</span>
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-brand-green shadow-sm">
              <Icon icon="solar:arrow-right-linear" className="text-sm stroke-[2.5]" />
            </div>
          </a>
        </div>
      </div>
    </section>
  );
}
