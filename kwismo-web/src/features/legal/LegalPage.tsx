import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from '@iconify/react';
import Footer from '@/features/landing/components/Footer';
import LogoWhite from '@/assets/logo/White_Logo.png';

interface LegalSection {
  id: string;
  title: string;
  content: string;
}

interface LegalPageProps {
  initialTab?: 'privacy' | 'terms';
}

export default function LegalPage({ initialTab = 'privacy' }: LegalPageProps) {
  const { t } = useTranslation(['legal', 'landing']);
  const [activeTab, setActiveTab] = useState<'privacy' | 'terms'>(initialTab);

  const keyPrefix = activeTab === 'privacy' ? 'privacy' : 'terms';

  const docTitle = t(`legal:${keyPrefix}.title`);
  const docLastUpdated = t(`legal:${keyPrefix}.lastUpdated`);
  const rawSections = t(`legal:${keyPrefix}.sections`, { returnObjects: true });
  const sections: LegalSection[] = Array.isArray(rawSections) ? (rawSections as LegalSection[]) : [];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-brand-darkBg text-slate-900 dark:text-white flex flex-col font-body transition-colors">
      <header className="w-full bg-brand-navy border-b border-white/10 py-4 px-6 sticky top-0 z-50 backdrop-blur-md bg-brand-navy/90">
        <div className="max-w-[90%] mx-auto flex items-center justify-between">
          <a href="/" className="flex items-center gap-3">
            <img src={LogoWhite} alt="KWISMO" className="h-10 w-auto object-contain" />
          </a>
          <a
            href="/"
            className="flex items-center gap-2 text-xs font-semibold text-white/80 hover:text-white transition bg-white/10 px-4 py-2 rounded-xl border border-white/15"
          >
            <Icon icon="solar:arrow-left-linear" className="text-base" />
            <span>{t('landing:nav.about') ? t('landing:nav.about') : 'Accueil'}</span>
          </a>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-10">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-brand-green/15 text-brand-green flex items-center justify-center mb-4 border border-brand-green/30">
            <Icon icon="solar:shield-keyhole-bold" className="text-3xl" />
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-title">
            {docTitle}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">
            {docLastUpdated}
          </p>

          <div className="mt-6 inline-flex p-1 rounded-2xl bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700">
            <button
              onClick={() => setActiveTab('privacy')}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'privacy'
                  ? 'bg-brand-green text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {t('legal:privacy.title')}
            </button>
            <button
              onClick={() => setActiveTab('terms')}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'terms'
                  ? 'bg-brand-green text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {t('legal:terms.title')}
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {sections.map((sec, idx) => (
            <div
              key={sec.id || idx}
              className="bg-white dark:bg-brand-cardDark p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:border-slate-300 dark:hover:border-slate-700"
            >
              <h2 className="text-sm sm:text-base font-bold font-title text-brand-navy dark:text-emerald-400 mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-brand-green inline-block" />
                {sec.title}
              </h2>
              <div className="text-xs sm:text-xs leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-line font-normal">
                {sec.content}
              </div>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
