import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from '@iconify/react';
import ImgEtape from '@/assets/illustrations/Img_Etape.png';

export default function HowItWorks() {
  const { t } = useTranslation('landing');
  const [activeStep, setActiveStep] = useState<number>(0);

  const steps = t('howItWorks.steps', { returnObjects: true }) as { num: string; title: string; desc: string }[];

  return (
    <section id="howItWorks" className="w-full bg-white dark:bg-brand-darkBg px-6 py-20 lg:py-24 transition-colors font-body">
      <div className="mx-auto max-w-[90%]">
        <div className="text-center max-w-3xl mx-auto">
          {/* Titre de section remis à la taille initiale */}
          <h2 className="font-title text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-extrabold text-slate-900 dark:text-white">
            {t('landing:howItWorks.title')}
          </h2>
        </div>

        <div className="mt-16 grid grid-cols-1 lg:grid-cols-2 items-stretch gap-12 lg:gap-16">
          {/* Séquence des 3 Étapes à gauche */}
          <div className="flex flex-col justify-between gap-4 h-full">
            {Array.isArray(steps) && steps.map((step, idx) => {
              const isActive = activeStep === idx;
              const isLast = idx === steps.length - 1;

              return (
                <div key={idx} className="flex flex-col w-full flex-1 justify-center">
                  <div
                    onMouseEnter={() => setActiveStep(idx)}
                    onClick={() => setActiveStep(idx)}
                    className={`cursor-pointer rounded-3xl p-6 sm:p-7 border transition-all duration-500 ease-out ${
                      isActive
                        ? 'bg-brand-green/10 dark:bg-brand-green/15 border-brand-green shadow-xl'
                        : 'bg-slate-50 dark:bg-brand-navy/60 border-slate-200 dark:border-white/10 hover:border-brand-green/40 shadow-sm'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      {/* Chiffre de l'étape : transition fluide de taille */}
                      <div
                        className={`flex shrink-0 items-center justify-center rounded-2xl font-title font-extrabold transition-all duration-500 ease-out ${
                          isActive
                            ? 'h-11 w-11 text-lg bg-brand-green text-white shadow-lg shadow-brand-green/30'
                            : 'h-14 w-14 text-2xl bg-slate-200 dark:bg-white/15 text-slate-700 dark:text-white'
                        }`}
                      >
                        {step.num || `0${idx + 1}`}
                      </div>

                      {/* Titre de l'étape */}
                      <h3
                        className={`font-title font-extrabold transition-colors duration-500 ease-out ${
                          isActive
                            ? 'text-xl sm:text-2xl text-brand-green dark:text-brand-green'
                            : 'text-lg sm:text-xl text-slate-900 dark:text-white'
                        }`}
                      >
                        {step.title}
                      </h3>
                    </div>

                    {/* Animation Ultra-Fluide via Grid-Rows transition */}
                    <div
                      className={`grid transition-[grid-template-rows,opacity] duration-500 ease-out ${
                        isActive ? 'grid-rows-[1fr] opacity-100 mt-3 pt-3 border-t border-brand-green/20' : 'grid-rows-[0fr] opacity-0 mt-0'
                      }`}
                    >
                      <div className="overflow-hidden">
                        <p className="font-body text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed pl-14 font-normal">
                          {step.desc}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Flèche / Ligne transversale verticale de connexion vers l'étape suivante */}
                  {!isLast && (
                    <div className="flex items-center justify-start pl-11 py-1.5 text-brand-green/60">
                      <Icon icon="solar:alt-arrow-down-bold" className="text-xl animate-bounce" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Image propre sans cadre ni fond à droite */}
          <div className="flex justify-center items-center h-full w-full">
            <img
              src={ImgEtape}
              alt="KWISMO Processus 3 étapes"
              className="w-full max-h-[560px] object-contain drop-shadow-xl hover:scale-[1.01] transition-transform duration-500"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
