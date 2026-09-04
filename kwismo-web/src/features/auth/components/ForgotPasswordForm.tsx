import { useState } from 'react';
import { Icon } from '@iconify/react';

interface ForgotPasswordFormProps {
  onBackToLogin: () => void;
}

export default function ForgotPasswordForm({ onBackToLogin }: ForgotPasswordFormProps) {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 800);
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      {submitted ? (
        <div className="flex flex-col items-center text-center p-4 rounded-xl bg-brand-green/10 border border-brand-green/30">
          <Icon icon="solar:check-circle-bold" className="text-4xl text-brand-green mb-2" />
          <h4 className="font-title text-base font-bold text-slate-900 dark:text-white">Email envoyé !</h4>
          <p className="mt-1 font-body text-xs text-slate-600 dark:text-slate-300">
            Un lien de réinitialisation a été envoyé à <strong>{email}</strong>.
          </p>
          <button
            type="button"
            onClick={onBackToLogin}
            className="mt-4 font-body text-xs font-semibold text-brand-green hover:underline"
          >
            Retour à la connexion
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <p className="font-body text-xs text-slate-600 dark:text-slate-300">
            Entrez votre adresse email ou votre numéro de téléphone pour recevoir des instructions.
          </p>

          <div className="flex flex-col gap-1.5">
            <label className="font-body text-xs font-semibold text-slate-700 dark:text-slate-300">
              Email / Téléphone
            </label>
            <div className="relative flex items-center">
              <Icon icon="solar:letter-bold" className="absolute left-3.5 text-slate-400 text-lg" />
              <input
                type="text"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="votre@email.com ou +237..."
                className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-brand-darkBg text-slate-900 dark:text-white text-xs sm:text-sm font-body focus:outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-brand-orange text-white font-body text-sm font-semibold shadow-md hover:bg-[#e08700] transition active:scale-[0.99] disabled:opacity-50"
          >
            {loading ? (
              <Icon icon="solar:spinner-bold-duotone" className="animate-spin text-xl" />
            ) : (
              <span>Envoyer le lien</span>
            )}
          </button>

          <button
            type="button"
            onClick={onBackToLogin}
            className="mt-2 flex items-center justify-center gap-1.5 font-body text-xs font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          >
            <Icon icon="solar:alt-arrow-left-bold" className="text-sm" />
            <span>Retour à la connexion</span>
          </button>
        </form>
      )}
    </div>
  );
}
