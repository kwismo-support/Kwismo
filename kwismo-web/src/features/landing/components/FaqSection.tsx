import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from '@iconify/react';

export default function FaqSection() {
  const { t } = useTranslation('landing');
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const faqItems = t('landing:faq.items', { returnObjects: true }) as Array<{ q: string; a: string }>;

  return (
    <section id="faq" className="py-20 bg-slate-50 dark:bg-[#0E1526] transition-colors duration-200">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-green/10 text-brand-green dark:bg-brand-green/20 dark:text-green-300 text-xs font-semibold uppercase tracking-wider mb-4">
            <Icon icon="solar:question-square-bold" className="text-base" />
            <span>FAQ</span>
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white sm:text-4xl">
            {t('landing:faq.title')}
          </h2>
          <p className="mt-4 text-base text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            {t('landing:faq.subtitle')}
          </p>
        </div>

        <div className="flex flex-col gap-4">
          {Array.isArray(faqItems) &&
            faqItems.map((item, idx) => {
              const isOpen = openIndex === idx;
              return (
                <div
                  key={idx}
                  className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                    isOpen
                      ? 'border-brand-green/40 bg-white dark:bg-[#161E33] shadow-md'
                      : 'border-slate-200 dark:border-white/10 bg-white/80 dark:bg-[#12192C] hover:border-slate-300 dark:hover:border-white/20'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(idx)}
                    className="flex w-full items-center justify-between p-5 text-left focus:outline-none"
                    aria-expanded={isOpen}
                  >
                    <span className="flex items-center gap-3 pr-4 font-semibold text-slate-900 dark:text-white text-base">
                      <Icon
                        icon="solar:help-bold-duotone"
                        className={`text-xl flex-shrink-0 transition-colors ${
                          isOpen ? 'text-brand-green' : 'text-slate-400 dark:text-slate-500'
                        }`}
                      />
                      <span>{item.q}</span>
                    </span>
                    <Icon
                      icon="solar:alt-arrow-down-bold"
                      className={`text-xl text-slate-400 transition-transform duration-300 flex-shrink-0 ${
                        isOpen ? 'rotate-180 text-brand-green' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-sm text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-white/5 font-normal">
                      {item.a}
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      </div>
    </section>
  );
}
