import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/shared/store/authStore';
import { userApi } from '../services/user.api';
import { Input } from '@/shared/ui/input';
import { Button } from '@/shared/ui/button';

export function UserProfileTab() {
  const { t, i18n } = useTranslation(['user', 'common', 'admin']);
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);

  const [nom, setNom] = useState(user?.nom || '');
  const [prenom, setPrenom] = useState(user?.prenom || '');
  const [langue, setLangue] = useState(user?.langue || i18n.language || 'fr');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await userApi.updateMyProfile({ nom, prenom, langue });
      if (user) {
        const newUser = { ...user, nom, prenom, langue: (langue === 'en' ? 'en' : 'fr') as 'fr' | 'en' };
        setUser(newUser);
        localStorage.setItem('kwismo_user', JSON.stringify(newUser));
      }
      i18n.changeLanguage(langue);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white dark:bg-brand-navy p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-white/10 shadow-sm font-body flex flex-col gap-6">
      <div className="flex items-center gap-4 pb-6 border-b border-slate-100 dark:border-white/10">
        <div className="w-16 h-16 rounded-3xl bg-brand-green/10 text-brand-green flex items-center justify-center text-2xl font-bold font-title">
          {user?.prenom?.[0] || 'U'}
          {user?.nom?.[0] || ''}
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            {user?.prenom} {user?.nom}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
            {user?.email}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label={t('user:profile.lastNameLabel')}
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            leftIcon="solar:user-bold"
          />

          <Input
            label={t('user:profile.firstNameLabel')}
            value={prenom}
            onChange={(e) => setPrenom(e.target.value)}
            leftIcon="solar:user-bold"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            {t('user:profile.languageLabel')}
          </label>
          <select
            value={langue}
            onChange={(e) => setLangue(e.target.value)}
            className="w-full h-11 px-4 rounded-xl border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-brand-navy text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:border-brand-green transition"
          >
            <option value="fr">{t('user:profile.languages.fr')}</option>
            <option value="en">{t('user:profile.languages.en')}</option>
          </select>
        </div>

        <div className="pt-4 border-t border-slate-100 dark:border-white/10 flex justify-end">
          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={loading}
            leftIcon="solar:diskette-bold"
          >
            {t('common:actions.save')}
          </Button>
        </div>
      </form>
    </div>
  );
}
