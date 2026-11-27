import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog } from '@/shared/ui/dialog';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Icon } from '@iconify/react';
import type { SubscriptionPlanItem, SubscriptionPlanInput } from '../services/plans.api';

interface PlanFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: SubscriptionPlanInput) => Promise<void>;
  initialData?: SubscriptionPlanItem | null;
  loading?: boolean;
}

export function PlanFormModal({ open, onClose, onSubmit, initialData, loading = false }: PlanFormModalProps) {
  const { t } = useTranslation(['admin', 'common']);

  const [code, setCode] = useState('');
  const [nomFr, setNomFr] = useState('');
  const [nomEn, setNomEn] = useState('');
  const [prixFcfa, setPrixFcfa] = useState<number>(1000);
  const [dureeJours, setDureeJours] = useState<number>(30);
  const [maxNumeros, setMaxNumeros] = useState<number>(1);
  const [maxMembres, setMaxMembres] = useState<number>(1);
  const [descriptionFr, setDescriptionFr] = useState('');
  const [descriptionEn, setDescriptionEn] = useState('');
  const [optionsFr, setOptionsFr] = useState('');
  const [optionsEn, setOptionsEn] = useState('');
  const [badgeFr, setBadgeFr] = useState('');
  const [badgeEn, setBadgeEn] = useState('');
  const [estActif, setEstActif] = useState(true);
  const [ordre, setOrdre] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setCode(initialData.code);
      setNomFr(initialData.nom_fr);
      setNomEn(initialData.nom_en);
      setPrixFcfa(initialData.prix_fcfa);
      setDureeJours(initialData.duree_jours);
      setMaxNumeros(initialData.max_numeros);
      setMaxMembres(initialData.max_membres);
      setDescriptionFr(initialData.description_fr || '');
      setDescriptionEn(initialData.description_en || '');
      setOptionsFr((initialData.options_fr || []).join('\n'));
      setOptionsEn((initialData.options_en || []).join('\n'));
      setBadgeFr(initialData.badge_fr || '');
      setBadgeEn(initialData.badge_en || '');
      setEstActif(initialData.est_actif);
      setOrdre(initialData.ordre || 0);
    } else {
      setCode('');
      setNomFr('');
      setNomEn('');
      setPrixFcfa(1000);
      setDureeJours(30);
      setMaxNumeros(1);
      setMaxMembres(1);
      setDescriptionFr('');
      setDescriptionEn('');
      setOptionsFr('');
      setOptionsEn('');
      setBadgeFr('');
      setBadgeEn('');
      setEstActif(true);
      setOrdre(0);
    }
    setError(null);
  }, [initialData, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !nomFr.trim() || !nomEn.trim()) {
      setError(t('admin:plans.requiredFields'));
      return;
    }

    const payload: SubscriptionPlanInput = {
      code: code.trim().toLowerCase().replace(/\s+/g, '_'),
      nom_fr: nomFr.trim(),
      nom_en: nomEn.trim(),
      prix_fcfa: Number(prixFcfa) || 0,
      duree_jours: Math.max(1, Number(dureeJours) || 1),
      max_numeros: Math.max(1, Number(maxNumeros) || 1),
      max_membres: Math.max(1, Number(maxMembres) || 1),
      description_fr: descriptionFr.trim() || null,
      description_en: descriptionEn.trim() || null,
      options_fr: optionsFr.split('\n').map((s) => s.trim()).filter(Boolean),
      options_en: optionsEn.split('\n').map((s) => s.trim()).filter(Boolean),
      badge_fr: badgeFr.trim() || null,
      badge_en: badgeEn.trim() || null,
      est_actif: estActif,
      ordre: Number(ordre) || 0,
    };

    try {
      await onSubmit(payload);
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.detail || err.message || t('admin:plans.genericError'));
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={initialData ? t('admin:plans.editTitle') : t('admin:plans.createTitle')}
      className="max-w-2xl max-h-[90vh] overflow-y-auto"
    >
      <form onSubmit={handleSubmit} className="space-y-4 py-2 font-body">
        {error && (
          <div className="p-3 text-xs bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 rounded-lg border border-rose-200 dark:border-rose-800 flex items-center gap-2">
            <Icon icon="solar:danger-triangle-bold" className="text-base shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              {t('admin:plans.code')} *
            </label>
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="solo_mensuel"
              required
              disabled={Boolean(initialData)}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              {t('admin:plans.ordre')}
            </label>
            <Input
              type="number"
              value={ordre}
              onChange={(e) => setOrdre(parseInt(e.target.value, 10) || 0)}
              min={0}
            />
          </div>
        </div>

        {/* Noms bilingues */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              {t('admin:plans.nomFr')} *
            </label>
            <Input
              value={nomFr}
              onChange={(e) => setNomFr(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              {t('admin:plans.nomEn')} *
            </label>
            <Input
              value={nomEn}
              onChange={(e) => setNomEn(e.target.value)}
              required
            />
          </div>
        </div>

        {/* Tarification et durées */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-lg border border-slate-200 dark:border-white/10">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              {t('admin:plans.prix')} *
            </label>
            <Input
              type="number"
              value={prixFcfa}
              onChange={(e) => setPrixFcfa(parseInt(e.target.value, 10) || 0)}
              min={0}
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              {t('admin:plans.duree')} *
            </label>
            <Input
              type="number"
              value={dureeJours}
              onChange={(e) => setDureeJours(parseInt(e.target.value, 10) || 1)}
              min={1}
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              {t('admin:plans.maxNumeros')} *
            </label>
            <Input
              type="number"
              value={maxNumeros}
              onChange={(e) => setMaxNumeros(parseInt(e.target.value, 10) || 1)}
              min={1}
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              {t('admin:plans.maxMembres')} *
            </label>
            <Input
              type="number"
              value={maxMembres}
              onChange={(e) => setMaxMembres(parseInt(e.target.value, 10) || 1)}
              min={1}
              required
            />
          </div>
        </div>

        {/* Badges marketing bilingues */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              {t('admin:plans.badgeFr')}
            </label>
            <Input
              value={badgeFr}
              onChange={(e) => setBadgeFr(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              {t('admin:plans.badgeEn')}
            </label>
            <Input
              value={badgeEn}
              onChange={(e) => setBadgeEn(e.target.value)}
            />
          </div>
        </div>

        {/* Descriptions bilingues */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              {t('admin:plans.descFr')}
            </label>
            <textarea
              value={descriptionFr}
              onChange={(e) => setDescriptionFr(e.target.value)}
              className="w-full rounded-md border border-slate-300 dark:border-white/15 bg-white dark:bg-brand-darkBg px-3 py-2 text-xs focus:ring-1 focus:ring-brand-blue outline-none"
              rows={2}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              {t('admin:plans.descEn')}
            </label>
            <textarea
              value={descriptionEn}
              onChange={(e) => setDescriptionEn(e.target.value)}
              className="w-full rounded-md border border-slate-300 dark:border-white/15 bg-white dark:bg-brand-darkBg px-3 py-2 text-xs focus:ring-1 focus:ring-brand-blue outline-none"
              rows={2}
            />
          </div>
        </div>

        {/* Avantages / Options (1 par ligne) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              {t('admin:plans.optionsFr')}
            </label>
            <textarea
              value={optionsFr}
              onChange={(e) => setOptionsFr(e.target.value)}
              className="w-full rounded-md border border-slate-300 dark:border-white/15 bg-white dark:bg-brand-darkBg px-3 py-2 text-xs focus:ring-1 focus:ring-brand-blue outline-none font-mono"
              rows={3}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              {t('admin:plans.optionsEn')}
            </label>
            <textarea
              value={optionsEn}
              onChange={(e) => setOptionsEn(e.target.value)}
              className="w-full rounded-md border border-slate-300 dark:border-white/15 bg-white dark:bg-brand-darkBg px-3 py-2 text-xs focus:ring-1 focus:ring-brand-blue outline-none font-mono"
              rows={3}
            />
          </div>
        </div>

        {/* Actif / Inactif Switch */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-200 dark:border-white/10">
          <input
            type="checkbox"
            id="estActif"
            checked={estActif}
            onChange={(e) => setEstActif(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-brand-blue focus:ring-brand-blue"
          />
          <label htmlFor="estActif" className="text-xs font-semibold text-slate-800 dark:text-slate-200 cursor-pointer">
            {t('admin:plans.activeStatus')}
          </label>
        </div>

        <div className="flex justify-end gap-3 pt-3">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            {t('common:actions.cancel')}
          </Button>
          <Button type="submit" disabled={loading} className="bg-brand-blue text-white">
            {loading ? <Icon icon="solar:refresh-circle-bold" className="animate-spin text-base mr-1" /> : null}
            {initialData ? t('admin:plans.submitSave') : t('admin:plans.submitCreate')}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
