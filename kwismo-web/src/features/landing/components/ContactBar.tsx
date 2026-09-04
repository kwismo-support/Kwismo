import { useTranslation } from 'react-i18next';
import { Icon } from '@iconify/react';
import { LanguageSwitcher } from '@/shared/components/LanguageSwitcher';
import { ThemeToggle } from '@/shared/components/ThemeToggle';

export default function ContactBar() {
  const { t } = useTranslation('landing');

  return (
    <div className="w-full bg-slate-100 dark:bg-[#0E1726] text-slate-800 dark:text-white text-xs py-2 px-4 sm:px-8 border-b border-slate-200 dark:border-white/10 transition-colors">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        
        {/* Email & Phone links in Main Green #32B07F */}
        <div className="flex flex-wrap items-center gap-5 font-semibold text-[#32B07F]">
          <a
            href={`mailto:${t('contactBar.email', 'kwismosupport@gmail.com')}`}
            className="flex items-center gap-1.5 transition hover:underline"
          >
            <Icon icon="solar:letter-bold" className="text-sm text-[#32B07F]" />
            <span>{t('contactBar.email', 'kwismosupport@gmail.com')}</span>
          </a>

          <a
            href={`tel:${t('contactBar.phone', '+237698444388').replace(/\s+/g, '')}`}
            className="flex items-center gap-1.5 transition hover:underline"
          >
            <Icon icon="solar:phone-calling-bold" className="text-sm text-[#32B07F]" />
            <span>{t('contactBar.phone', '+237 698 44 43 88')}</span>
          </a>
        </div>

        {/* Social Icons + Controls */}
        <div className="flex items-center justify-between sm:justify-end gap-4">
          <div className="flex items-center gap-3 text-slate-600 dark:text-white/80">
            <a href="#" aria-label="Facebook" className="hover:text-[#32B07F] transition">
              <Icon icon="bxl:facebook" className="text-base" />
            </a>
            <a href="#" aria-label="X" className="hover:text-[#32B07F] transition">
              <Icon icon="ri:twitter-x-fill" className="text-sm" />
            </a>
            <a href="#" aria-label="YouTube" className="hover:text-[#32B07F] transition">
              <Icon icon="bxl:youtube" className="text-base" />
            </a>
          </div>

          <div className="h-4 w-px bg-slate-300 dark:bg-white/20 hidden sm:block" />

          {/* i18n & Theme Toggle */}
          <div className="flex items-center gap-2">
            <LanguageSwitcher className="border-slate-300 dark:border-white/20 text-slate-800 dark:text-white bg-white dark:bg-white/10" />
            <ThemeToggle className="text-slate-700 dark:text-white/80 hover:bg-slate-200 dark:hover:bg-white/10" />
          </div>
        </div>

      </div>
    </div>
  );
}