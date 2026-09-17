import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from '@iconify/react';
import { PageHeader } from '@/shared/components';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { toast } from '@/shared/store/toastStore';
import { usePermissions } from '@/shared/hooks/usePermissions';
import { settingsApi, RiskThresholdRule } from './services/settings.api';

export default function SettingsPage() {
  const { t } = useTranslation(['admin', 'common']);
  const { isSuperAdmin } = usePermissions();

  const [settings, setSettings] = useState({
    ussdTimeoutSec: 15,
    apiRateLimitPerMin: 1200,
    enableAutoBlockFraud: true,
    enableSmsAlerts: true,
    requireAdminOtp: settingsApi.getRequireAdminOtp(),
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
    settingsApi.getRequireAdminOtpRemote().then((val) => {
      setSettings((prev) => ({ ...prev, requireAdminOtp: val }));
    });
    settingsApi.getThresholds()
      .then((data) => {
        if (data.rules && data.rules.length > 0) {
          setRules(data.rules);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  if (!isSuperAdmin) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center font-body min-h-[400px]">
        <Icon icon="solar:shield-cross-bold-duotone" className="text-5xl text-rose-500 mb-4 opacity-80" />
        <h2 className="font-title text-xl font-bold text-slate-900 dark:text-white">
          {t('common:accessDeniedTitle', { defaultValue: 'Accès Restreint' })}
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-md">
          Seul l'administrateur système principal (SuperAdmin) est autorisé à modifier la configuration globale et les seuils de risque IA de la plateforme.
        </p>
      </div>
    );
  }

  const validateCoverageClient = (ruleList: RiskThresholdRule[]): boolean => {
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
        toast.error(t('admin:settings.thresholdsGapError', { point }));
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
      toast.success(t('admin:settings.thresholdsSaveSuccess'));
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || t('admin:settings.thresholdsSaveError'));
    } finally {
      setSavingRules(false);
    }
  };

  const handleSaveGeneral = async (e: React.FormEvent) => {
    e.preventDefault();
    await settingsApi.setRequireAdminOtpRemote(settings.requireAdminOtp);
    toast.success(t('admin:settings.generalSaveSuccess'));
  };

  return (
    <div className="flex flex-col gap-6 p-6 font-body max-w-5xl mx-auto text-slate-900 dark:text-white">
      <PageHeader
        title={t('admin:settings.title')}
        subtitle={t('admin:settings.subtitle')}
        showBreadcrumb={true}
      />

      <div className="p-6 rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#161E33] shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-white/10 pb-4">
          <div>
            <h3 className="font-title text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Icon icon="solar:shield-warning-bold-duotone" className="text-amber-500 text-xl" />
              {t('admin:settings.thresholdsTitle')}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {t('admin:settings.thresholdsSubtitle')}
            </p>
          </div>
          <Button
            type="button"
            variant="primary"
            leftIcon="solar:diskette-bold"
            isLoading={savingRules}
            onClick={handleSaveThresholds}
          >
            {t('admin:settings.saveGrid')}
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-6 text-sm text-slate-500 dark:text-slate-400">
            {t('admin:settings.loadingRules')}
          </div>
        ) : (
          <div className="space-y-4">
            {rules.map((rule, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                    rule.zone === 'securise' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' :
                    rule.zone === 'suspect' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' : 'bg-red-500/10 text-red-600 dark:text-red-400'
                  }`}>
                    {t('admin:settings.zone')} : {rule.zone}
                  </span>
                  <div className="w-48">
                    <Input
                      label=""
                      value={rule.label_fr}
                      onChange={(e) => handleRuleChange(idx, 'label_fr', e.target.value)}
                      placeholder={t('admin:settings.labelFrPlaceholder')}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
                      {t('admin:settings.minScore')}
                    </label>
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
                    <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
                      {t('admin:settings.minOperator')}
                    </label>
                    <select
                      value={rule.min_operator}
                      onChange={(e) => handleRuleChange(idx, 'min_operator', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-white/10 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                    >
                      <option value=">=">{t('admin:settings.opGte')}</option>
                      <option value=">">{t('admin:settings.opGt')}</option>
                      <option value="=">{t('admin:settings.opEq')}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
                      {t('admin:settings.maxScore')}
                    </label>
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
                    <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
                      {t('admin:settings.maxOperator')}
                    </label>
                    <select
                      value={rule.max_operator}
                      onChange={(e) => handleRuleChange(idx, 'max_operator', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-white/10 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                    >
                      <option value="<=">{t('admin:settings.opLte')}</option>
                      <option value="<">{t('admin:settings.opLt')}</option>
                      <option value="=">{t('admin:settings.opEq')}</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <form onSubmit={handleSaveGeneral} className="p-6 rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#161E33] shadow-sm space-y-6">
        <h3 className="font-title text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-200 dark:border-white/10 pb-3">
          <Icon icon="solar:settings-bold-duotone" className="text-brand-blue text-xl" />
          {t('admin:settings.generalTitle')}
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Input
            label={t('admin:settings.platformName')}
            value={settings.platformName}
            onChange={(e) => setSettings({ ...settings, platformName: e.target.value })}
          />
          <Input
            label={t('admin:settings.supportEmail')}
            type="email"
            value={settings.supportEmail}
            onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
          />
          <Input
            label={t('admin:settings.ussdTimeout')}
            type="number"
            value={settings.ussdTimeoutSec}
            onChange={(e) => setSettings({ ...settings, ussdTimeoutSec: Number(e.target.value) })}
          />
          <Input
            label={t('admin:settings.apiQuota')}
            type="number"
            value={settings.apiRateLimitPerMin}
            onChange={(e) => setSettings({ ...settings, apiRateLimitPerMin: Number(e.target.value) })}
          />
        </div>

        <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-white/10">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.requireAdminOtp}
              onChange={(e) => setSettings({ ...settings, requireAdminOtp: e.target.checked })}
              className="h-5 w-5 rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-brand-orange focus:ring-brand-orange"
            />
            <div>
              <span className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 block">
                {t('admin:settings.requireAdminOtpLabel')}
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                {t('admin:settings.requireAdminOtpDesc')}
              </span>
            </div>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.enableAutoBlockFraud}
              onChange={(e) => setSettings({ ...settings, enableAutoBlockFraud: e.target.checked })}
              className="h-5 w-5 rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-brand-green focus:ring-brand-green"
            />
            <span className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200">
              {t('admin:settings.enableAutoBlock')}
            </span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.enableSmsAlerts}
              onChange={(e) => setSettings({ ...settings, enableSmsAlerts: e.target.checked })}
              className="h-5 w-5 rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-brand-green focus:ring-brand-green"
            />
            <span className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200">
              {t('admin:settings.enableSmsAlerts')}
            </span>
          </label>
        </div>

        <div className="flex justify-end pt-4 border-t border-slate-200 dark:border-white/10">
          <Button type="submit" variant="primary" leftIcon="solar:diskette-bold">
            {t('admin:settings.saveGeneral')}
          </Button>
        </div>
      </form>
    </div>
  );
}
