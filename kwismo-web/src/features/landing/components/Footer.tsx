import { useTranslation } from 'react-i18next';
import { Icon } from '@iconify/react';
import { LanguageSwitcher } from '@/shared/components/LanguageSwitcher';
import { ThemeToggle } from '@/shared/components/ThemeToggle';
import LogoColor from '@/assets/logo/Color_Logo.png';
import LogoWhite from '@/assets/logo/White_Logo.png';

export default function Footer() {
  const { t } = useTranslation('landing');
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-slate-100 dark:bg-brand-darkBg text-slate-800 dark:text-white pt-16 pb-8 border-t border-slate-200 dark:border-white/10 transition-colors font-body">
      <div className="mx-auto max-w-[90%] px-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 pb-12 border-b border-slate-200 dark:border-white/10">
          <div className="md:col-span-2 flex flex-col items-start">
            <img src={LogoColor} alt="KWISMO Logo" className="h-12 w-auto object-contain dark:hidden" />
            <img src={LogoWhite} alt="KWISMO Logo" className="h-12 w-auto object-contain hidden dark:block" />

            <p className="mt-0 text-xs text-slate-600 dark:text-white/70 max-w-sm leading-relaxed">
              {t('landing:footer.desc')}
            </p>

            <div className="mt-6 flex items-center gap-3">
              <a
                href="#"
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white dark:bg-white/10 border border-slate-300 dark:border-white/15 hover:bg-slate-200 dark:hover:bg-white/20 transition text-xs font-semibold"
              >
                <Icon icon="bxl:apple" className="text-xl text-slate-800 dark:text-white" />
                <span className="font-mono text-[11px] dark:text-white">App Store</span>
              </a>

              <a
                href="#"
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white dark:bg-white/10 border border-slate-300 dark:border-white/15 hover:bg-slate-200 dark:hover:bg-white/20 transition text-xs font-semibold"
              >
                <Icon icon="bxl:play-store" className="text-xl text-brand-green" />
                <span className="font-mono text-[11px] dark:text-white">Google Play</span>
              </a>
            </div>
          </div>

          <div className="flex flex-col gap-3 text-xs">
            <h4 className="font-title text-sm font-bold text-slate-900 dark:text-white mb-1">
              {t('landing:footer.colDownload')}
            </h4>
            <a href="#services" className="text-slate-600 dark:text-white/70 hover:text-brand-green dark:hover:text-white transition">
              {t('landing:nav.features')}
            </a>
            <a href="#pricing" className="text-slate-600 dark:text-white/70 hover:text-brand-green dark:hover:text-white transition">
              {t('landing:footer.navTarifs')}
            </a>
            <a href="#pricing" className="text-slate-600 dark:text-white/70 hover:text-brand-green dark:hover:text-white transition">
              {t('landing:footer.navApi')}
            </a>
          </div>

          <div className="flex flex-col gap-3 text-xs">
            <h4 className="font-title text-sm font-bold text-slate-900 dark:text-white mb-1">
              {t('landing:footer.colAbout')}
            </h4>
            <a href="#about" className="text-slate-600 dark:text-white/70 hover:text-brand-green dark:hover:text-white transition">
              {t('landing:nav.about')}
            </a>
            <a href="/auth/register" className="text-slate-600 dark:text-white/70 hover:text-brand-green dark:hover:text-white transition">
              {t('landing:footer.navPartners')}
            </a>
            <a href="#contact" className="text-slate-600 dark:text-white/70 hover:text-brand-green dark:hover:text-white transition">
              {t('landing:footer.navNews')}
            </a>
            <a href="#contact" className="text-slate-600 dark:text-white/70 hover:text-brand-green dark:hover:text-white transition">
              {t('landing:nav.contact')}
            </a>
          </div>

          <div className="flex flex-col gap-3 text-xs">
            <h4 className="font-title text-sm font-bold text-slate-900 dark:text-white mb-1">
              {t('landing:footer.colLegal')}
            </h4>
            <a href="#" className="text-slate-600 dark:text-white/70 hover:text-brand-green dark:hover:text-white transition">
              {t('landing:footer.legalPrivacy')}
            </a>
            <a href="#" className="text-slate-600 dark:text-white/70 hover:text-brand-green dark:hover:text-white transition">
              {t('landing:footer.legalTerms')}
            </a>
            <a href="#" className="text-slate-600 dark:text-white/70 hover:text-brand-green dark:hover:text-white transition">
              {t('landing:footer.legalCookies')}
            </a>
            <a href="#" className="text-slate-600 dark:text-white/70 hover:text-brand-green dark:hover:text-white transition">
              {t('landing:footer.legalSecurity')}
            </a>
          </div>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600 dark:text-white/60">
          <p>© {currentYear} KWISMO. {t('landing:footer.rights')}</p>

          <div className="flex items-center gap-4">
            <ThemeToggle className="text-slate-700 dark:text-white/80 hover:bg-slate-200 dark:hover:bg-white/10" />
            <LanguageSwitcher className="border-slate-300 dark:border-white/20 text-slate-800 dark:text-white bg-white dark:bg-white/10" />

            <a
              href="/auth/login"
              className="flex h-8 items-center px-4 rounded-full bg-brand-green text-white font-semibold text-xs hover:bg-brand-green/90 transition"
            >
              {t('landing:footer.login')}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}