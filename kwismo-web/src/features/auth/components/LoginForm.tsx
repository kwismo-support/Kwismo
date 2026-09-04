import { useState } from 'react';
import { Icon } from '@iconify/react';

interface LoginFormProps {
  onForgotPassword?: () => void;
}

export default function LoginForm({ onForgotPassword }: LoginFormProps) {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      window.location.href = '/app/dashboard';
    }, 800);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full">
      {/* Champ Identifiant (Email ou Numéro) */}
      <div className="flex flex-col gap-1.5">
        <label className="font-body text-xs font-semibold text-slate-700 dark:text-slate-300">
          Email ou Numéro de téléphone
        </label>
        <div className="relative flex items-center">
          <Icon icon="solar:user-bold" className="absolute left-3.5 text-slate-400 text-lg" />
          <input
            type="text"
            required
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            placeholder="+237 6XX XX XX XX ou email"
            className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-brand-darkBg text-slate-900 dark:text-white text-xs sm:text-sm font-body focus:outline-none focus:border-brand-green focus:ring-1 focus:ring-brand-green transition"
          />
        </div>
      </div>

      {/* Champ Mot de Passe */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <label className="font-body text-xs font-semibold text-slate-700 dark:text-slate-300">
            Mot de passe
          </label>
          {onForgotPassword && (
            <button
              type="button"
              onClick={onForgotPassword}
              className="font-body text-[11px] font-medium text-brand-orange hover:underline"
            >
              Mot de passe oublié ?
            </button>
          )}
        </div>
        <div className="relative flex items-center">
          <Icon icon="solar:lock-password-bold" className="absolute left-3.5 text-slate-400 text-lg" />
          <input
            type={showPassword ? 'text' : 'password'}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full h-11 pl-10 pr-10 rounded-xl border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-brand-darkBg text-slate-900 dark:text-white text-xs sm:text-sm font-body focus:outline-none focus:border-brand-green focus:ring-1 focus:ring-brand-green transition"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <Icon icon={showPassword ? 'solar:eye-bold' : 'solar:eye-closed-bold'} className="text-lg" />
          </button>
        </div>
      </div>

      {/* Bouton de Soumission */}
      <button
        type="submit"
        disabled={loading}
        className="mt-2 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-brand-green text-white font-body text-sm font-semibold shadow-md hover:bg-[#2aa072] transition active:scale-[0.99] disabled:opacity-50"
      >
        {loading ? (
          <Icon icon="solar:spinner-bold-duotone" className="animate-spin text-xl" />
        ) : (
          <>
            <Icon icon="solar:login-bold" className="text-lg" />
            <span>Se connecter</span>
          </>
        )}
      </button>
    </form>
  );
}
