import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from '@iconify/react';
import { Input } from '@/shared/ui/input';
import { Button } from '@/shared/ui/button';
import type { UserProfileMe, ProfileUpdateIn } from '../services/profile.api';

interface ProfileFormProps {
  profile: UserProfileMe;
  isUpdating?: boolean;
  onUpdate: (payload: ProfileUpdateIn) => Promise<boolean>;
}

export default function ProfileForm({
  profile,
  isUpdating = false,
  onUpdate,
}: ProfileFormProps) {
  const { t } = useTranslation(['admin', 'common']);
  const [nom, setNom] = useState(profile.nom || '');
  const [prenom, setPrenom] = useState(profile.prenom || '');
  const [langue, setLangue] = useState(profile.langue || 'fr');

  useEffect(() => {
    setNom(profile.nom || '');
    setPrenom(profile.prenom || '');
    setLangue(profile.langue || 'fr');
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onUpdate({ nom, prenom, langue });
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#161E33] shadow-sm space-y-6 font-body">
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-4">
        <h3 className="font-title text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Icon icon="solar:user-bold-duotone" className="text-brand-green text-xl" />
          {t('admin:profile.formTitle')}
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Input
          label={t('admin:users.surname')}
          value={nom}
          onChange={(e) => setNom(e.target.value)}
          leftIcon="solar:user-linear"
          required
        />
        <Input
          label={t('admin:users.name')}
          value={prenom}
          onChange={(e) => setPrenom(e.target.value)}
          leftIcon="solar:user-linear"
          required
        />
        <Input
          label={t('admin:users.email')}
          value={profile.email}
          disabled
          leftIcon="solar:letter-linear"
        />
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
            {t('admin:profile.languagePreference')}
          </label>
          <select
            value={langue}
            onChange={(e) => setLangue(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-xs text-slate-800 dark:text-slate-200 font-semibold cursor-pointer"
          >
            <option value="fr">Français (FR)</option>
            <option value="en">English (EN)</option>
          </select>
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t border-slate-200 dark:border-white/10">
        <Button
          type="submit"
          variant="primary"
          leftIcon="solar:diskette-bold"
          isLoading={isUpdating}
        >
          {t('common:actions.save')}
        </Button>
      </div>
    </form>
  );
}
