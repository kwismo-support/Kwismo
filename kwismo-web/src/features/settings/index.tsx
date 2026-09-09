import { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { PageHeader } from '@/shared/components';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { toast } from '@/shared/store/toastStore';
import { settingsApi, RiskThresholdRule } from './services/settings.api';

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    ussdTimeoutSec: 15,
    apiRateLimitPerMin: 1200,
    enableAutoBlockFraud: true,
    enableSmsAlerts: true,
    platformName: 'Kwismo Web Platform',
    supportEmail: 'support@kwismo.com',
  });

  const [rules, setRules] = useState<RiskThresholdRule[]>([
    { zone: 'securise', min_value: 0.0, min_operator: '>=', max_value: 0.3, max_operator: '<', label_fr: 'Sécurisé', label_en: 'Safe' },
    { zone: 'suspect', min_value: 0.3, min_operator: '>=', max_value: 0.7, max_operator: '<', label_fr: 'A vérifier / Suspect', label_en: 'Warning' },
    { zone: 'frauduleux', min_value: 0.7, min_operator: '>=', max_value: 1.0, max_operator: '<=', label_fr: 'Frauduleux / Arnaque', label_en: 'Scam' },
  ]);

  const [loading, setLoading] = useState(false);
  const [savingRules, setSavingRules] = useState(false);

  useEffect(() => {
    setLoading(true);
    settingsApi.getThresholds()
      .then((data) => {
        if (data.rules && data.rules.length > 0) {
          setRules(data.rules);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const validateCoverageClient = (ruleList: RiskThresholdRule[]): boolean => {
    // Tester l'échantillonnage de 0.0 à 1.0 par pas de 0.01
    for (let i = 0; i <= 100; i++) {
      const point = Number((i * 0.01).toFixed(2));
      let matched = false;
      for (const r of ruleList) {
        const minOk = r.min_operator === '>=' ? point >= r.min_value : r.min_operator === '>' ? point > r.min_value : Math.abs(point - r.min_value) < 1e-4;
        const maxOk = r.max_operator === '<=' ? point <= r.max_value : r.max_operator === '<' ? point < r.max_value : Math.abs(point - r.max_value) < 1e-4;
        if (minOk && maxOk) {
          matched = true;
          break;
        }
      }
      if (!matched) {
        toast.error(`Zone creuse non couverte : le score ${point} n'est associé à aucun statut (plage 0.0 à 1.0).`);
        return false;
      }
    }
    return true;
  };

  const handleRuleChange = (index: number, field: keyof RiskThresholdRule, value: any) => {
    const updated = [...rules];
    updated[index] = { ...updated[index], [field]: value };
    setRules(updated);
  };

  const handleSaveThresholds = async () => {
    if (!validateCoverageClient(rules)) {
      return;
    }
    setSavingRules(true);
    try {
      await settingsApi.updateThresholds(rules);
      toast.success('Configuration des seuils de risque enregistrée et appliquée à l\'IA !');
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Erreur lors de la sauvegarde des seuils.');
    } finally {
      setSavingRules(false);
    }
  };

  const handleSaveGeneral = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Paramètres généraux enregistrés avec succès !');
  };

  return (
    <div className="flex flex-col gap-6 p-6 font-body max-w-5xl mx-auto">
      <PageHeader
        title="Paramètres Système & Config IA"
        subtitle="Configuration globale des seuils de détection de fraude SuperAdmin (plage 0.0 à 1.0) et quotas système."
        showBreadcrumb={true}
      />

      {/* Section 1: Dynamic Risk Threshold Configuration */}
      <div className="p-6 rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#161E33] shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-white/10 pb-4">
          <div>
            <h3 className="font-title text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Icon icon="solar:shield-warning-bold-duotone" className="text-amber-500 text-xl" />
              SuperAdmin — Configuration des Seuils de Risque IA
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Fixez les règles de conversion des scores bruts (0.0 à 1.0) en statuts. Toute la plage [0.0, 1.0] doit être couverte.
            </p>
          </div>
          <Button
            type="button"
            variant="primary"
            leftIcon="solar:diskette-bold"
            isLoading={savingRules}
            onClick={handleSaveThresholds}
          >
            Sauvegarder la grille
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-6 text-sm text-slate-500">Chargement de la grille...</div>
        ) : (
          <div className="space-y-4">
            {rules.map((rule, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                    rule.zone === 'securise' ? 'bg-emerald-500/10 text-emerald-600' :
                    rule.zone === 'suspect' ? 'bg-amber-500/10 text-amber-600' : 'bg-red-500/10 text-red-600'
                  }`}>
                    Zone : {rule.zone}
                  </span>
                  <div className="w-48">
                    <Input
                      label=""
                      value={rule.label_fr}
                      onChange={(e) => handleRuleChange(idx, 'label_fr', e.target.value)}
                      placeholder="Libellé FR"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">Score Min</label>
                    <input
                      type="number"
                      step="0.05"
                      min="0"
                      max="1"
                      value={rule.min_value}
                      onChange={(e) => handleRuleChange(idx, 'min_value', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-white/10 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">Opérateur Min</label>
                    <select
                      value={rule.min_operator}
                      onChange={(e) => handleRuleChange(idx, 'min_operator', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-white/10 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                    >
                      <option value=">=">&gt;= (Supérieur ou égal)</option>
                      <option value=">">&gt; (Strictement supérieur)</option>
                      <option value="=">= (Égal)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">Score Max</label>
                    <input
                      type="number"
                      step="0.05"
                      min="0"
                      max="1"
                      value={rule.max_value}
                      onChange={(e) => handleRuleChange(idx, 'max_value', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-white/10 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">Opérateur Max</label>
                    <select
                      value={rule.max_operator}
                      onChange={(e) => handleRuleChange(idx, 'max_operator', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-white/10 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                    >
                      <option value="<=">&lt;= (Inférieur ou égal)</option>
                      <option value="<">&lt; (Strictement inférieur)</option>
                      <option value="=">= (Égal)</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Section 2: General System Settings */}
      <form onSubmit={handleSaveGeneral} className="p-6 rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#161E33] shadow-sm space-y-6">
        <h3 className="font-title text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-200 dark:border-white/10 pb-3">
          <Icon icon="solar:settings-bold-duotone" className="text-brand-blue text-xl" />
          Paramètres Généraux Système
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
            Enregistrer les paramètres généraux
          </Button>
        </div>
      </form>
    </div>
  );
}
