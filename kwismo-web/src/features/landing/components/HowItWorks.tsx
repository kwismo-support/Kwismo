import { useTranslation } from 'react-i18next';
import { Icon } from '@iconify/react';
import ImgEtape from '@/assets/illustrations/Img_Etape.png';

const stepIcons = [
  'solar:smartphone-rotate-2-bold-duotone',
  'solar:shield-warning-bold-duotone',
  'solar:bell-bing-bold-duotone',
];

const enrichedStepDescs = [
  "Téléchargez l'application Kwismo et enregistrez vos lignes SIM. Vos numéros sont instantanément reliés à notre réseau de protection anti-fraude.",
  "Notre moteur d'intelligence artificielle analyse le score de réputation de chaque appel ou code USSD entrant pour identifier les tentatives de harcèlement ou d'escroquerie.",
  "Recevez des alertes préventives en temps réel et bloquez les numéros suspects avant d'effectuer la moindre transaction Mobile Money."
];

export default function HowItWorks() {
  const { t } = useTranslation('landing');

  const steps = t('howItWorks.steps', { returnObjects: true }) as { num: string; title: string; desc: string }[];

  return (
    <section id="howItWorks" className="w-full bg-white dark:bg-brand-darkBg px-6 py-20 lg:py-24 transition-colors font-body">
      <div className="mx-auto max-w-[90%]">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="font-title text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-extrabold text-slate-900 dark:text-white">
            {t('landing:howItWorks.title')}
          </h2>
        </div>

        <div className="mt-14 grid grid-cols-1 lg:grid-cols-2 items-stretch gap-12 lg:gap-16">
          <div className="flex flex-col justify-between gap-6 h-full">
            {Array.isArray(steps) && steps.map((step, idx) => {
              const icon = stepIcons[idx] ?? 'solar:shield-check-bold-duotone';
              const description = enrichedStepDescs[idx] || step.desc;

              return (
                <div
                  key={idx}
                  className="group flex flex-col p-7 sm:p-8 rounded-3xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-brand-navy shadow-lg hover:shadow-2xl hover:border-brand-green/50 transition-all duration-300 flex-1 justify-center"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-green text-white font-title text-xl font-extrabold shadow-lg shadow-brand-green/20">
                        {step.num || `0${idx + 1}`}
                      </div>

                      <h3 className="font-title text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
                        {step.title}
                      </h3>
                    </div>

                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-green/10 text-brand-green border border-brand-green/20 group-hover:scale-110 transition-transform">
                      <Icon icon={icon} className="text-xl" />
                    </div>
                  </div>

                  <p className="mt-4 text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed pl-16">
                    {description}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="flex justify-center items-center h-full">
            <div className="relative w-full max-w-[540px] p-6 bg-gradient-to-b from-slate-100 to-slate-200 dark:from-white/10 dark:to-white/5 rounded-3xl border border-slate-200 dark:border-white/15 shadow-2xl flex items-center justify-center overflow-hidden group">
              <div className="absolute inset-0 bg-brand-green/10 blur-3xl rounded-full pointer-events-none" />
              <img
                src={ImgEtape}
                alt="KWISMO Processus 3 étapes"
                className="relative z-10 w-full max-w-[480px] h-auto object-contain drop-shadow-2xl rounded-2xl group-hover:scale-[1.02] transition-transform duration-500"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
