import { useState } from 'react';
import LoginForm from './components/LoginForm';
import ForgotPasswordForm from './components/ForgotPasswordForm';
import ResetPasswordForm from './components/ResetPasswordForm';
import LogoNavBar from '@/assets/logo/Logo_NavBar.png';

type AuthMode = 'login' | 'forgot' | 'reset';

export default function AuthPage() {
  const [mode, setMode] = useState<AuthMode>('login');

  return (
    <div className="min-h-screen w-full bg-slate-50 dark:bg-brand-darkBg flex items-center justify-center p-4 sm:p-6 font-body transition-colors">
      <div className="w-full max-w-md bg-white dark:bg-brand-navy rounded-3xl border border-slate-200 dark:border-white/10 shadow-2xl p-6 sm:p-8 flex flex-col items-center">
        
        {/* Logo */}
        <a href="/" className="mb-6 flex justify-center">
          <img src={LogoNavBar} alt="KWISMO" className="h-10 w-auto object-contain" />
        </a>

        {/* Titre dynamique */}
        <div className="text-center mb-6">
          <h2 className="font-title text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            {mode === 'login' && 'Connexion à KWISMO'}
            {mode === 'forgot' && 'Mot de passe oublié'}
            {mode === 'reset' && 'Nouveau mot de passe'}
          </h2>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {mode === 'login' && 'Accédez à votre espace sécurisé Admin / Partenaire'}
            {mode === 'forgot' && 'Entrez vos identifiants pour réinitialiser'}
            {mode === 'reset' && 'Définissez votre nouveau mot de passe'}
          </p>
        </div>

        {/* Render Form */}
        {mode === 'login' && (
          <LoginForm onForgotPassword={() => setMode('forgot')} />
        )}

        {mode === 'forgot' && (
          <ForgotPasswordForm onBackToLogin={() => setMode('login')} />
        )}

        {mode === 'reset' && (
          <ResetPasswordForm onSuccess={() => setMode('login')} />
        )}

      </div>
    </div>
  );
}
