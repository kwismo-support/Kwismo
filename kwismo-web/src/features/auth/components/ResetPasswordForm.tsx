import { useState } from 'react';
import { Icon } from '@iconify/react';

interface ResetPasswordFormProps {
  onSuccess: () => void;
}

export default function ResetPasswordForm({ onSuccess }: ResetPasswordFormProps) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }
    setError('');
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onSuccess();
    }, 800);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full">
      {error && (
        <div className="p-3 rounded-xl bg-danger/10 border border-danger/30 text-danger text-xs font-body flex items-center gap-2">
          <Icon icon="solar:danger-circle-bold" className="text-base shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <label className="font-body text-xs font-semibold text-slate-700 dark:text-slate-300">
          Nouveau mot de passe
        </label>
        <div className="relative flex items-center">
          <Icon icon="solar:lock-password-bold" className="absolute left-3.5 text-slate-400 text-lg" />
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-brand-darkBg text-slate-900 dark:text-white text-xs sm:text-sm font-body focus:outline-none focus:border-brand-green focus:ring-1 focus:ring-brand-green transition"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="font-body text-xs font-semibold text-slate-700 dark:text-slate-300">
          Confirmer le mot de passe
        </label>
        <div className="relative flex items-center">
          <Icon icon="solar:lock-password-bold" className="absolute left-3.5 text-slate-400 text-lg" />
          <input
            type="password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-brand-darkBg text-slate-900 dark:text-white text-xs sm:text-sm font-body focus:outline-none focus:border-brand-green focus:ring-1 focus:ring-brand-green transition"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="mt-2 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-brand-green text-white font-body text-sm font-semibold shadow-md hover:bg-[#2aa072] transition active:scale-[0.99] disabled:opacity-50"
      >
        {loading ? (
          <Icon icon="solar:spinner-bold-duotone" className="animate-spin text-xl" />
        ) : (
          <span>Réinitialiser le mot de passe</span>
        )}
      </button>
    </form>
  );
}
