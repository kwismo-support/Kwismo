import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import LoginForm from './components/LoginForm';
import ForgotPasswordForm from './components/ForgotPasswordForm';
import ResetPasswordForm from './components/ResetPasswordForm';
import LogoNavBar from '@/assets/logo/Logo_NavBar.png';
import { LanguageSwitcher } from '@/shared/components/LanguageSwitcher';
import { ThemeToggle } from '@/shared/components/ThemeToggle';

type AuthMode = 'login' | 'forgot' | 'reset';

export default function AuthPage() {
  const { t } = useTranslation('auth');
  const [mode, setMode] = useState<AuthMode>('login');

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

      <div className="relative z-20 w-full max-w-md bg-white/95 dark:bg-[#161E33]/95 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-white/10 shadow-2xl p-6 sm:p-8 flex flex-col items-center transition-all">
        <a href="/" className="mb-6 flex justify-center hover:opacity-90 transition">
          <img src={LogoNavBar} alt="KWISMO" className="h-10 w-auto object-contain" />
        </a>

        <div className="text-center mb-6">
          <h2 className="font-title text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            {mode === 'login' && t('loginTitle')}
            {mode === 'forgot' && t('forgotTitle')}
            {mode === 'reset' && t('resetTitle')}
          </h2>
          <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-300 max-w-xs leading-relaxed">
            {mode === 'login' && t('loginSubtitle')}
            {mode === 'forgot' && t('forgotSubtitle')}
            {mode === 'reset' && t('resetSubtitle')}
          </p>
        </div>

        {mode === 'login' && <LoginForm onForgotPassword={() => setMode('forgot')} />}
        {mode === 'forgot' && <ForgotPasswordForm onBackToLogin={() => setMode('login')} />}
        {mode === 'reset' && <ResetPasswordForm onSuccess={() => setMode('login')} />}
      </div>
    </div>
  );
}
