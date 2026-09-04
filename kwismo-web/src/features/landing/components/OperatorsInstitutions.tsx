import { useTranslation } from 'react-i18next';
import { Icon } from '@iconify/react';
import ImgOperateur from '@/assets/illustrations/Img_Operateur.jpeg';

export default function OperatorsInstitutions() {
  const { t } = useTranslation('landing');

  const defaultPoints = [
    'Intelligence collective multi-opérateurs',
    'API REST documentée, intégration rapide',
    'Tableaux de bord et rapports dédiés',
  ];

  const points: string[] =
    (t('operatorsInstitutions.points', { returnObjects: true }) as unknown as string[]) || defaultPoints;

  return (
    <section className="w-full bg-slate-50 dark:bg-[#161E33] px-6 py-16 transition-colors">
      <div className="mx-auto max-w-[1200px] grid grid-cols-1 lg:grid-cols-2 items-stretch gap-12">

        {/* Left Column Image with Overlay Badge */}
        <div className="relative flex justify-center h-full">
          <div className="relative overflow-hidden rounded-3xl border border-slate-200 dark:border-white/10 shadow-2xl w-full h-full min-h-[340px]">
            <img
              src={ImgOperateur}
              alt="Opérateurs et institutions"
              className="w-full h-full object-cover"
            />
            {/* Overlay Card Badge */}
            <div className="absolute bottom-4 left-4 right-4 p-4 rounded-2xl bg-black/65 backdrop-blur-md border border-white/20 text-white">
              <h4 className="font-title text-sm font-bold">
                {t('operatorsInstitutions.badgeTitle', "Rejoignez l'écosystème")}
              </h4>
              <p className="font-body text-xs text-white/80">
                {t('operatorsInstitutions.badgeDesc', 'Contact sous 48h par notre équipe dédiée.')}
              </p>
            </div>
          </div>
        </div>

        {/* Right Column Content - Matching Full Height */}
        <div className="flex flex-col justify-between items-start h-full py-2">
          <div>
            <h2 className="font-title text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white leading-tight">
              {t('operatorsInstitutions.title', 'Pour les opérateurs et institutions')}
            </h2>

            <p className="mt-4 font-body text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {t(
                'operatorsInstitutions.subtitle',
                "Intégrez l'intelligence collective KWISMO et détectez la fraude à l'échelle de votre réseau."
              )}
            </p>

            <ul className="mt-6 flex flex-col gap-3.5 font-body text-xs sm:text-sm text-slate-700 dark:text-slate-200">
              {points.map((pt, idx) => (
                <li key={idx} className="flex items-center gap-2.5">
                  <Icon icon="lucide:check" className="text-[#32B07F] text-base stroke-[3] shrink-0" />
                  <span>{pt}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Button Devenir partenaire with arrow inside a white circle pill */}
          <a
            href="/auth/register"
            className="mt-8 flex h-[44px] items-center gap-3 rounded-xl bg-[#32B07F] pl-6 pr-2.5 font-body text-xs sm:text-sm font-semibold text-white shadow-md hover:bg-[#2aa072] transition"
          >
            <span>{t('operatorsInstitutions.cta', 'Devenir partenaire')}</span>
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-[#32B07F] shadow-sm">
              <Icon icon="solar:arrow-right-linear" className="text-sm stroke-[2.5]" />
            </div>
          </a>
        </div>

      </div>
    </section>
  );
}
