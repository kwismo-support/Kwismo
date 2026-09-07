import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from '@iconify/react';
import LogoNavBar from '@/assets/logo/Logo_NavBar.png';

export default function Navbar() {
  const { t } = useTranslation('landing');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('accueil');

  useEffect(() => {
    const sections = ['accueil', 'about', 'fraud', 'pricing', 'contact'];

    const handleScroll = () => {
      const scrollPosition = window.scrollY + 200;
      for (const sectionId of sections) {
        const el = document.getElementById(sectionId);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { id: 'accueil', label: t('landing:nav.home'), href: '#accueil' },
    { id: 'about', label: t('landing:nav.about'), href: '#about' },
    { id: 'fraud', label: t('landing:nav.security'), href: '#fraud' },
    { id: 'pricing', label: t('landing:pricingTitleNav'), href: '#pricing' },
    { id: 'contact', label: t('landing:nav.contact'), href: '#contact' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-brand-green border-b border-white/10 shadow-md backdrop-blur-md transition-colors duration-200">
      <div className="mx-auto flex h-[72px] max-w-[90%] items-center justify-between px-4 sm:px-6 lg:px-8">
        <a href="#accueil" className="flex items-center gap-2 group">
          <img
            src={LogoNavBar}
            alt="KWISMO Logo"
            className="h-20 w-auto object-contain transition duration-200"
          />
        </a>

        <nav className="hidden items-center gap-6 lg:flex">
          {navItems.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <a
                key={item.id}
                href={item.href}
                className={`relative py-2 font-body text-xs sm:text-sm font-medium transition-all duration-300 ${
                  isActive
                    ? 'text-white font-bold scale-105'
                    : 'text-white/80 hover:text-white'
                }`}
              >
                <span>{item.label}</span>
                <span
                  className={`absolute bottom-0 left-0 h-0.5 bg-brand-orange rounded-full transition-all duration-300 ease-in-out ${
                    isActive ? 'w-full opacity-100 scale-x-100' : 'w-0 opacity-0 scale-x-0'
                  }`}
                />
              </a>
            );
          })}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <a
            href="/auth/register"
            className="flex h-[38px] items-center justify-center rounded-full bg-brand-navy px-5 font-body text-xs font-semibold text-white no-underline transition hover:bg-brand-navy/90"
          >
            {t('landing:nav.partner')}
          </a>

          <a
            href="/auth/login"
            className="flex h-[38px] items-center justify-center rounded-full bg-brand-orange px-5 font-body text-xs font-semibold text-white no-underline transition hover:bg-brand-orange/90"
          >
            {t('landing:nav.login')}
          </a>
        </div>

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="flex p-2 text-white hover:text-brand-navy lg:hidden"
          aria-label="Toggle Menu"
        >
          <Icon
            icon={mobileMenuOpen ? 'solar:close-circle-bold' : 'solar:hamburger-menu-bold'}
            className="text-2xl"
          />
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="border-t border-white/10 bg-brand-green px-4 pt-4 pb-6 lg:hidden animate-in slide-in-from-top duration-200">
          <nav className="flex flex-col gap-4">
            {navItems.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <a
                  key={item.id}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex font-body text-sm font-medium transition justify-center items-center ${
                    isActive ? 'text-brand-orange font-bold underline' : 'text-white hover:text-brand-orange'
                  }`}
                >
                  {item.label}
                </a>
              );
            })}

            <div className="mt-4 flex flex-col gap-3 pt-4 border-t border-white/10">
              <a
                href="/auth/register"
                className="flex h-[40px] items-center justify-center rounded-full bg-brand-navy font-body text-xs font-semibold text-white"
              >
                {t('landing:nav.partner')}
              </a>

              <a
                href="/auth/login"
                className="flex h-[40px] items-center justify-center rounded-full bg-brand-orange font-body text-xs font-semibold text-white"
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