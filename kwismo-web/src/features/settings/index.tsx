import { useState } from 'react';
import { Icon } from '@iconify/react';
import { PageHeader } from '@/shared/components';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { toast } from '@/shared/store/toastStore';

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    ussdTimeoutSec: 15,
    apiRateLimitPerMin: 1200,
    enableAutoBlockFraud: true,
    enableSmsAlerts: true,
    platformName: 'Kwismo Web Platform',
    supportEmail: 'support@kwismo.com',
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Paramètres système enregistrés avec succès !');
  };

  return (
    <div className="flex flex-col gap-6 p-6 font-body max-w-5xl mx-auto">
      <PageHeader
        title="Paramètres Système & Plateforme"
        subtitle="Configuration globale des seuils de détection de fraude, timeouts USSD et quotas d'API."
        showBreadcrumb={true}
      />

      <form onSubmit={handleSave} className="p-6 rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#161E33] shadow-sm space-y-6">
        <h3 className="font-title text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-200 dark:border-white/10 pb-3">
          <Icon icon="solar:settings-bold-duotone" className="text-brand-blue text-xl" />
          Paramètres Généraux
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Input
            label="Nom de la plateforme"
            value={settings.platformName}
            onChange={(e) => setSettings({ ...settings, platformName: e.target.value })}
          />
          <Input
            label="Email du support technique"
            type="email"
            value={settings.supportEmail}
            onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
          />
          <Input
            label="Timeout requêtes USSD (secondes)"
            type="number"
            value={settings.ussdTimeoutSec}
            onChange={(e) => setSettings({ ...settings, ussdTimeoutSec: Number(e.target.value) })}
          />
          <Input
            label="Quota d'appels API par minute"
            type="number"
            value={settings.apiRateLimitPerMin}
            onChange={(e) => setSettings({ ...settings, apiRateLimitPerMin: Number(e.target.value) })}
          />
        </div>

        <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-white/10">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.enableAutoBlockFraud}
              onChange={(e) => setSettings({ ...settings, enableAutoBlockFraud: e.target.checked })}
              className="h-5 w-5 rounded border-slate-300 text-brand-green focus:ring-brand-green"
            />
            <span className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200">
              Blocage automatique des numéros ayant un score de risque IA &gt; 90%
            </span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.enableSmsAlerts}
              onChange={(e) => setSettings({ ...settings, enableSmsAlerts: e.target.checked })}
              className="h-5 w-5 rounded border-slate-300 text-brand-green focus:ring-brand-green"
            />
            <span className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200">
              Envoi d'alertes SMS automatiques en cas de suspicion de SIM Swap
            </span>
          </label>
        </div>

        <div className="flex justify-end pt-4 border-t border-slate-200 dark:border-white/10">
          <Button type="submit" variant="primary" leftIcon="solar:diskette-bold">
            Enregistrer les paramètres
          </Button>
        </div>
      </form>
    </div>
  );
}
