import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from '@iconify/react';

export default function FaqSection() {
  const { t } = useTranslation('landing');
  const [selectedIndex, setSelectedIndex] = useState<number>(0);

  const faqItems = t('landing:faq.items', { returnObjects: true }) as Array<{ q: string; a: string }>;
  const selectedItem = Array.isArray(faqItems) && faqItems[selectedIndex] ? faqItems[selectedIndex] : null;

  return (
    <section id="faq" className="py-20 lg:py-24 bg-slate-50 dark:bg-brand-navy transition-colors duration-200 font-body">
      <div className="mx-auto max-w-[90%]">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="font-title text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {t('landing:faq.title')}
          </h2>
        </div>

        <div className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-brand-darkBg overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[440px]">
          <div className="lg:col-span-6 border-r border-slate-200 dark:border-white/10 flex flex-col divide-y divide-slate-200 dark:divide-white/10 bg-slate-50/50 dark:bg-brand-navy/20">
            {Array.isArray(faqItems) &&
              faqItems.map((item, idx) => {
                const isSelected = selectedIndex === idx;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedIndex(idx)}
                    className={`w-full p-5 text-left transition-all duration-200 flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-brand-green/15 dark:bg-brand-green/20 text-brand-green border-l-4 border-l-brand-green font-bold'
                        : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100/80 dark:hover:bg-white/5 font-medium'
                    }`}
                  >
                    <span className="text-sm sm:text-base leading-snug">{item.q}</span>
                    <Icon
                      icon="solar:alt-arrow-right-bold"
                      className={`text-lg shrink-0 transition-transform duration-200 ${
                        isSelected ? 'text-brand-green translate-x-1' : 'text-slate-400 opacity-60'
                      }`}
                    />
                  </button>
                );
              })}
          </div>

          <div className="lg:col-span-6 p-8 sm:p-10 lg:p-12 flex flex-col justify-center bg-white dark:bg-brand-darkBg relative">
            {selectedItem && (
              <div key={selectedIndex} className="flex flex-col justify-start h-full">
                <h3 className="font-title text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white leading-snug">
                  {selectedItem.q}
                </h3>

                <div className="my-6 h-px w-full bg-slate-200 dark:bg-white/10" />

                <p className="text-slate-600 dark:text-slate-300 text-base sm:text-lg leading-relaxed font-normal">
                  {selectedItem.a}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
