// Main navigation header bar with desktop links, partner/login CTAs, and mobile responsive drawer.
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from '@iconify/react';
import LogoNavBar from '@/assets/logo/Logo_NavBar.png';

export default function Navbar() {
  const { t } = useTranslation('landing');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { label: t('landing:nav.home'), href: '#accueil', active: true },
    { label: t('landing:nav.about'), href: '#about' },
    { label: t('landing:nav.security'), href: '#fraud' },
    { label: t('landing:nav.features'), href: '#services' },
    { label: t('landing:nav.contact'), href: '#contact' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-brand-green border-b border-white/10 shadow-md backdrop-blur-md transition-colors duration-200">
      <div className="mx-auto flex h-[72px] max-w-[90%] items-center justify-between px-4 sm:px-6 lg:px-8">
        <a href="#accueil" className="flex items-center gap-2 group">
          <img
            src={LogoNavBar}
            alt="KWISMO Logo"
            className="h-20 w-auto object-contain transition duration-200 group-hover:scale-105"
          />
        </a>

        <nav className="hidden items-center gap-6 lg:flex">
          {navItems.map((item, idx) => (
            <a
              key={idx}
              href={item.href}
              className={`font-body text-xs sm:text-sm font-medium transition-colors ${
                item.active
                  ? 'text-white font-bold underline underline-offset-4 decoration-brand-orange'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <a
            href="#pricing"
            className="flex h-[38px] items-center justify-center rounded-full border border-white/40 px-5 font-body text-xs font-semibold text-white no-underline transition hover:bg-white/10"
          >
            {t('landing:nav.partner')}
          </a>

          <a
            href="/auth/login"
            className="flex h-[38px] items-center justify-center rounded-full bg-brand-orange px-5 font-body text-xs font-semibold text-white no-underline transition hover:bg-brand-orange/90 shadow-md"
          >
            {t('landing:nav.login')}
          </a>
        </div>

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="flex p-2 text-white hover:text-brand-orange lg:hidden"
          aria-label="Toggle Menu"
        >
          <Icon
            icon={mobileMenuOpen ? 'solar:close-circle-bold' : 'solar:hamburger-menu-bold'}
            className="text-2xl"
          />
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="border-t border-white/10 bg-brand-darkGreen px-4 pt-4 pb-6 lg:hidden animate-in slide-in-from-top duration-200">
          <nav className="flex flex-col gap-4">
            {navItems.map((item, idx) => (
              <a
                key={idx}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="font-body text-sm font-medium text-white transition hover:text-brand-orange"
              >
                {item.label}
              </a>
            ))}

            <div className="mt-4 flex flex-col gap-3 pt-4 border-t border-white/10">
              <a
                href="#pricing"
                className="flex h-[40px] items-center justify-center rounded-full border border-white/40 font-body text-xs font-semibold text-white"
              >
                {t('landing:nav.partner')}
              </a>

              <a
                href="/auth/login"
                className="flex h-[40px] items-center justify-center rounded-full bg-brand-orange font-body text-xs font-semibold text-white shadow-md"
              >
                {t('landing:nav.login')}
              </a>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}