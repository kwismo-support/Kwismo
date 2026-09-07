import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import LoginForm from './components/LoginForm';
import ForgotPasswordForm from './components/ForgotPasswordForm';
import ResetPasswordForm from './components/ResetPasswordForm';
import PartnerRegisterForm from './components/PartnerRegisterForm';
import Icon from '@/assets/logo/icon.png';
import { LanguageSwitcher } from '@/shared/components/LanguageSwitcher';
import { ThemeToggle } from '@/shared/components/ThemeToggle';

type AuthMode = 'login' | 'forgot' | 'reset' | 'register';

export default function AuthPage() {
  const { t } = useTranslation('auth');
  const [mode, setMode] = useState<AuthMode>('login');

  useEffect(() => {
    const path = window.location.pathname;
    if (path.includes('register')) {
      setMode('register');
    } else if (path.includes('forgot')) {
      setMode('forgot');
    } else if (path.includes('reset')) {
      setMode('reset');
    }
  }, []);

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 sm:p-6 font-body overflow-hidden">
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat z-0"
        style={{
          backgroundImage: `radial-gradient(circle at 50% 50%, rgba(50, 176, 127, 0.15), transparent 70%), url('https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=1920&q=80')`,
        }}
      />
      <div className="absolute inset-0 bg-[#161E33]/60 backdrop-blur-lg z-10" />

      <div className="absolute top-6 right-6 z-30 flex items-center gap-3">
        <LanguageSwitcher />
        <ThemeToggle />
      </div>

      <div className={`relative z-20 w-full ${mode === 'register' ? 'max-w-xl' : 'max-w-md'} bg-white/95 dark:bg-[#161E33]/95 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-white/10 shadow-2xl p-6 sm:p-8 flex flex-col items-center transition-all`}>
        <a href="/" className="mb-4 flex justify-center hover:opacity-90 transition">
          <img src={Icon} alt="KWISMO" className="h-12 w-auto object-contain" />
        </a>

        <div className="text-center mb-6">
          <h2 className="font-title text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            {mode === 'login' && t('loginTitle')}
            {mode === 'forgot' && t('forgotTitle')}
            {mode === 'reset' && t('resetTitle')}
            {mode === 'register' && t('registerTitle')}
          </h2>
          <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-300 max-w-sm leading-relaxed">
            {mode === 'login' && t('loginSubtitle')}
            {mode === 'forgot' && t('forgotSubtitle')}
            {mode === 'reset' && t('resetSubtitle')}
            {mode === 'register' && t('registerSubtitle')}
          </p>
        </div>

        {mode === 'login' && (
          <LoginForm
            onForgotPassword={() => setMode('forgot')}
            onRegisterPartner={() => setMode('register')}
          />
        )}
        {mode === 'forgot' && <ForgotPasswordForm onBackToLogin={() => setMode('login')} />}
        {mode === 'reset' && <ResetPasswordForm onSuccess={() => setMode('login')} />}
        {mode === 'register' && <PartnerRegisterForm onBackToLogin={() => setMode('login')} />}
      </div>
    </div>
  );
}

