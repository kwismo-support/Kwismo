import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from '@iconify/react';
import { motion, AnimatePresence } from 'framer-motion';
import ImgEtape from '@/assets/illustrations/Img_Etape.png';

export default function HowItWorks() {
  const { t } = useTranslation('landing');
  const [activeStep, setActiveStep] = useState<number>(0);

  const steps = t('landing:howItWorks.steps', { returnObjects: true }) as { num: string; title: string; desc: string }[];

  return (
    <section id="howItWorks" className="w-full bg-white dark:bg-brand-darkBg px-6 py-20 lg:py-24 transition-colors font-body overflow-hidden">
      <div className="mx-auto max-w-[90%]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto"
        >
          <h2 className="font-title text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-extrabold text-brand-navy dark:text-white">
            {t('landing:howItWorks.title')}
          </h2>
        </motion.div>

        <div className="mt-16 grid grid-cols-1 lg:grid-cols-2 items-stretch gap-12 lg:gap-16">
          <div className="flex flex-col justify-between gap-4 h-full">
            {Array.isArray(steps) &&
              steps.map((step, idx) => {
                const isActive = activeStep === idx;
                const isLast = idx === steps.length - 1;

                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -25 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: idx * 0.12 }}
                    className="flex flex-col w-full flex-1 justify-center"
                  >
                    <div
                      onMouseEnter={() => setActiveStep(idx)}
                      onClick={() => setActiveStep(idx)}
                      className={`cursor-pointer rounded-3xl p-6 sm:p-7 border transition-all duration-300 ${
                        isActive
                          ? 'bg-brand-green/10 dark:bg-brand-green/15 border-brand-green shadow-lg'
                          : 'bg-slate-50 dark:bg-brand-navy border-slate-200 dark:border-white/10 hover:border-brand-green/40 shadow-sm'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`flex shrink-0 items-center justify-center rounded-2xl font-title font-extrabold transition-all duration-300 ${
                            isActive
                              ? 'h-12 w-12 text-lg bg-brand-green text-white shadow-md'
                              : 'h-12 w-12 text-lg bg-slate-200 dark:bg-white/15 text-slate-700 dark:text-white'
                          }`}
                        >
                          {step.num}
                        </div>

                        <h3
                          className={`font-title font-extrabold transition-colors duration-300 ${
                            isActive
                              ? 'text-xl sm:text-2xl text-brand-green'
                              : 'text-lg sm:text-xl text-brand-navy dark:text-white'
                          }`}
                        >
                          {step.title}
                        </h3>
                      </div>

                      <AnimatePresence>
                        {isActive && (
                          <motion.div
                            initial={{ opacity: 0, height: 0, marginTop: 0 }}
                            animate={{ opacity: 1, height: 'auto', marginTop: 12 }}
                            exit={{ opacity: 0, height: 0, marginTop: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden border-t border-brand-green/20 pt-3"
                          >
                            <p className="font-body text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                              {step.desc}
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {!isLast && (
                      <div className="flex items-center justify-start pl-10 py-2 text-brand-green/60">
                        <Icon icon="solar:alt-arrow-down-bold" className="text-xl" />
                      </div>
                    )}
                  </motion.div>
                );
              })}
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex justify-center items-center h-full w-full"
          >
            <img
              src={ImgEtape}
              alt="KWISMO Processus 3 étapes"
              className="w-full max-h-[560px] object-contain drop-shadow-xl"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}


