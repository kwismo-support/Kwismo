import { useState } from 'react';
import { Icon } from '@iconify/react';
import { PageHeader } from '@/shared/components';
import { UserAvatar } from '@/shared/ui/avatar';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { PhoneInput } from '@/shared/ui/phone-input';
import { toast } from '@/shared/store/toastStore';
import { useAuthStore } from '@/shared/store/authStore';

export default function ProfilePage() {
  const { user } = useAuthStore();
  const [formData, setFormData] = useState({
    prenom: user?.prenom || 'Alice',
    nom: user?.nom || 'Nguesso',
    email: user?.email || 'alice.nguesso@kwismo.com',
    telephone: '+237 690 123 456',
    currentPassword: '',
    newPassword: '',
  });

  const handleSaveInfo = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Informations du profil enregistrées avec succès !');
  };

  const handleSavePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.currentPassword) {
      toast.error('Veuillez saisir votre mot de passe actuel.');
      return;
    }
    toast.success('Votre mot de passe a été modifié avec succès !');
    setFormData((prev) => ({ ...prev, currentPassword: '', newPassword: '' }));
  };

  return (
    <div className="flex flex-col gap-6 p-6 font-body max-w-5xl mx-auto">
      <PageHeader
        title="Mon Profil & Paramètres de Compte"
        subtitle="Gestion de vos informations personnelles, sécurité de la session et préférences de notification."
        showBreadcrumb={false}
      />

      <div className="p-6 rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#161E33] shadow-sm flex flex-col sm:flex-row items-center gap-6">
        <UserAvatar
          name={`${formData.prenom} ${formData.nom}`}
          roleRing="admin"
          size="xl"
        />
        <div className="text-center sm:text-left flex-1">
          <h2 className="font-title text-xl font-bold text-slate-900 dark:text-white">
            {formData.prenom} {formData.nom}
          </h2>
          <p className="text-xs font-mono text-slate-500 mt-1">{formData.email}</p>
          <span className="inline-block mt-2 px-3 py-1 rounded-full text-xs font-bold bg-brand-navy dark:bg-brand-orange text-white dark:text-brand-navy">
            Compte Administrateur System
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal Information */}
        <form onSubmit={handleSaveInfo} className="p-6 rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#161E33] shadow-sm space-y-5">
          <h3 className="font-title text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-200 dark:border-white/10 pb-3">
            <Icon icon="solar:user-bold-duotone" className="text-brand-green text-xl" />
            Informations Personnelles
          </h3>

          <Input
            label="Prénom"
            value={formData.prenom}
            onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
            required
          />
          <Input
            label="Nom"
            value={formData.nom}
            onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
            required
          />
          <Input
            label="Adresse Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
          <PhoneInput
            label="Téléphone"
            value={formData.telephone}
            onChange={(val) => setFormData({ ...formData, telephone: val })}
          />

          <div className="pt-2 flex justify-end">
            <Button type="submit" variant="primary" leftIcon="solar:diskette-bold">
              Enregistrer
            </Button>
          </div>
        </form>

        {/* Security & Password Change */}
        <form onSubmit={handleSavePassword} className="p-6 rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#161E33] shadow-sm space-y-5">
          <h3 className="font-title text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-200 dark:border-white/10 pb-3">
            <Icon icon="solar:lock-keyhole-bold-duotone" className="text-brand-orange text-xl" />
            Sécurité & Mot de passe
          </h3>

          <Input
            label="Mot de passe actuel"
            type="password"
            value={formData.currentPassword}
            onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
          />
          <Input
            label="Nouveau mot de passe"
            type="password"
            value={formData.newPassword}
            onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
          />

          <div className="pt-2 flex justify-end">
            <Button type="submit" variant="primary" leftIcon="solar:shield-check-bold">
              Changer le mot de passe
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
