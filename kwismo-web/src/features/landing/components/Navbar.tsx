import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from '@iconify/react';
import { motion, AnimatePresence } from 'framer-motion';
import LogoNavBar from '@/assets/logo/White_Logo.png';

export default function Navbar() {
  const { t } = useTranslation('landing');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('accueil');

  useEffect(() => {
    if (window.location.pathname !== '/') {
      setActiveSection('');
      return;
    }

    const sections = ['accueil', 'fraud', 'about', 'pricing', 'services', 'faq', 'contact'];

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

  const isHome = window.location.pathname === '/';
  const prefix = isHome ? '' : '/';

  const navItems = [
    { id: 'accueil', label: t('landing:nav.home'), href: `${prefix}#accueil` },
    { id: 'fraud', label: t('landing:nav.security'), href: `${prefix}#fraud` },
    { id: 'about', label: t('landing:nav.about'), href: `${prefix}#about` },
    { id: 'pricing', label: t('landing:pricingTitleNav'), href: `${prefix}#pricing` },
    { id: 'services', label: t('landing:nav.features'), href: `${prefix}#services` },
    { id: 'faq', label: t('landing:nav.faq'), href: `${prefix}#faq` },
    { id: 'contact', label: t('landing:nav.contact'), href: `${prefix}#contact` },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-brand-green border-b border-white/10 shadow-md backdrop-blur-md transition-colors duration-200 font-body">
      <div className="mx-auto flex h-[72px] max-w-[90%] items-center justify-between px-4 sm:px-6 lg:px-8">
        <a href="/" className="flex items-center gap-2 group">
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
                  isActive ? 'text-white font-bold' : 'text-white/80 hover:text-white'
                }`}
              >
                <span>{item.label}</span>
                {isActive && (
                  <motion.span
                    layoutId="activeNavIndicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-orange rounded-full"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </a>
            );
          })}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <a
            href="/partner"
            className="btn-brand-navy h-[38px] px-5 text-xs font-semibold"
          >
            {t('landing:nav.partner')}
          </a>

          <a
            href="/auth/login"
            className="btn-brand-orange h-[38px] px-5 text-xs font-semibold"
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
            className="text-2xl transition-transform duration-200"
          />
        </button>
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="border-t border-white/10 bg-brand-green px-4 pt-4 pb-6 lg:hidden overflow-hidden"
          >
            <nav className="flex flex-col gap-4">
              {navItems.map((item, idx) => {
                const isActive = activeSection === item.id;
                return (
                  <motion.a
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex font-body text-sm font-medium transition justify-center items-center ${
                      isActive ? 'text-brand-orange font-bold underline' : 'text-white hover:text-brand-orange'
                    }`}
                  >
                    {item.label}
                  </motion.a>
                );
              })}

              <div className="mt-4 flex flex-col gap-3 pt-4 border-t border-white/10">
                <a
                  href="/partner"
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn-brand-navy h-[40px] text-xs font-semibold"
                >
                  {t('landing:nav.partner')}
                </a>

                <a
                  href="/auth/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn-brand-orange h-[40px] text-xs font-semibold"
                >
                  {t('landing:nav.login')}
                </a>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

