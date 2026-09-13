import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { PageHeader, StatusBadge } from '@/shared/components';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { CountrySelect } from '@/shared/ui/country-select';
import { PhoneInput } from '@/shared/ui/phone-input';
import { FormSkeleton } from '@/shared/ui/skeleton';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog';
import { toast } from '@/shared/store/toastStore';
import { api } from '@/shared/lib/api';
import type { NumeroDTO, NumberRiskStatus } from '@/shared/mock';

export default function NumberDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [numberData, setNumberData] = useState<NumeroDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);

  // Form State
  const [initialData, setInitialData] = useState({
    valeur: '',
    countryCode: 'CM',
    operatorName: 'MTN',
    partenaire: '',
    statut: 'Sécurisé' as NumberRiskStatus,
    scoreRisque: 5,
    noteInvestigatrice: 'Dernière vérification USSD OK. Aucune anomalie détectée sur la carte SIM.',
  });

  const [formData, setFormData] = useState({ ...initialData });

  useEffect(() => {
    let mounted = true;
    if (id === 'new') {
      const newNum: NumeroDTO = {
        id: 'new',
        valeur: '',
        operatorName: 'MTN',
        countryCode: 'CM',
        partenaire: '',
        compte: '',
        statut: 'Sécurisé',
        scoreRisque: 100,
        reportsCount: 0,
        dateDerniereVerification: new Date().toLocaleDateString('fr-FR'),
      };
      setNumberData(newNum);
      setIsEditing(true);
      const emptyState = {
        valeur: '',
        countryCode: 'CM',
        operatorName: 'MTN',
        partenaire: '',
        statut: 'Sécurisé' as NumberRiskStatus,
        scoreRisque: 100,
        noteInvestigatrice: '',
      };
      setInitialData(emptyState);
      setFormData(emptyState);
      setLoading(false);
      return;
    }

    if (id) {
      api.getNumbers()
        .then((data) => {
          if (!mounted) return;
          const found = data.find((n: NumeroDTO) => String(n.id) === id);
          if (found) {
            setNumberData(found);
            const state = {
              valeur: found.valeur || '',
              countryCode: found.countryCode || 'CM',
              operatorName: found.operatorName || 'MTN',
              partenaire: found.partenaire || '',
              statut: found.statut || 'Sécurisé',
              scoreRisque: found.scoreRisque ?? 5,
              noteInvestigatrice: 'Dernière vérification USSD OK. Aucune anomalie détectée sur la carte SIM.',
            };
            setInitialData(state);
            setFormData(state);
          }
        })
        .finally(() => {
          if (mounted) setLoading(false);
        });
    } else {
      setLoading(false);
    }
    return () => { mounted = false; };
  }, [id]);

  if (loading) {
    return (
      <div className="p-6 font-body">
        <FormSkeleton />
      </div>
    );
  }

  if (!numberData) {
    return (
      <div className="p-6 font-body text-center py-12">
        <Icon icon="solar:hashtag-square-bold-duotone" className="text-5xl text-slate-400 mx-auto mb-3" />
        <h3 className="font-title text-lg font-bold text-slate-900 dark:text-white">Numéro introuvable</h3>
        <Button className="mt-4" variant="outline" onClick={() => navigate('/app/numbers')}>
          Retour à la liste
        </Button>
      </div>
    );
  }

  const isDirty = JSON.stringify(formData) !== JSON.stringify(initialData);

  const handleSave = () => {
    setNumberData((prev) => prev ? { ...prev, statut: formData.statut, scoreRisque: formData.scoreRisque } : null);
    setInitialData({ ...formData });
    setIsEditing(false);
    toast.success('Niveau de risque et dossier mis à jour !');
  };

  const handleBack = () => {
    if (isDirty) {
      setShowUnsavedModal(true);
    } else {
      navigate('/app/numbers');
    }
  };

  const handleConfirmDiscard = () => {
    setShowUnsavedModal(false);
    navigate('/app/numbers');
  };

  const handleConfirmSaveAndLeave = () => {
    handleSave();
    setShowUnsavedModal(false);
    navigate('/app/numbers');
  };

  const riskScore = formData.scoreRisque;
  const isHighRisk = riskScore > 70;
  const isMediumRisk = riskScore > 30 && riskScore <= 70;

  return (
    <div className="flex flex-col gap-6 p-6 font-body max-w-6xl mx-auto">
      {/* Page Header */}
      <PageHeader
        title={`Analyse Approfondie — ${numberData.valeur}`}
        subtitle="Évaluation du score de risque IA, détection de SIM Swap et historique des vérifications."
        showBreadcrumb={false}
        showBack={true}
        onBack={handleBack}
        actions={[
          !isEditing ? {
            label: 'Éditer l\'analyse',
            icon: 'solar:pen-bold',
            variant: 'primary',
            onClick: () => setIsEditing(true),
          } : {
            label: 'Enregistrer les modifications',
            icon: 'solar:diskette-bold',
            variant: 'primary',
            disabled: !isDirty,
            onClick: handleSave,
          },
        ]}
      />

      {/* Main Score Banner */}
      <div className="p-6 rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#161E33] shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-navy/10 text-brand-navy dark:text-white font-mono font-bold text-2xl border border-brand-navy/20">
            #
          </div>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="font-mono text-2xl font-bold text-slate-900 dark:text-white tracking-wider">
                {numberData.valeur}
              </h2>
              <StatusBadge status={numberData.statut} size="sm" />
            </div>
            <p className="text-xs text-slate-500 font-medium mt-1">Opérateur : <span className="font-bold text-slate-900 dark:text-white">{numberData.operatorName}</span></p>
            <p className="text-xs text-slate-400 mt-0.5">Partenaire affilié : {numberData.partenaire || 'MTN Cameroun'} | Compte : {numberData.compte || 'N/A'}</p>
          </div>
        </div>

        {/* Risk Score Gauge Display */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0F1626] border border-slate-200 dark:border-white/10 flex items-center gap-4 min-w-[240px]">
          <div className="relative flex items-center justify-center">
            <div className="h-14 w-14 rounded-full border-4 border-slate-200 dark:border-white/10 flex items-center justify-center">
              <span className={`font-title font-bold text-base ${isHighRisk ? 'text-red-500' : isMediumRisk ? 'text-amber-500' : 'text-emerald-500'}`}>
                {riskScore}%
              </span>
            </div>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-900 dark:text-white">Score de Risque IA</p>
            <p className="text-[10px] text-slate-500">
              {isHighRisk ? 'Niveau Critique' : isMediumRisk ? 'Suspicion élevée' : 'Risque Faible / Normal'}
            </p>
          </div>
        </div>
      </div>

      {/* Detail Form Card */}
      <div className="p-6 rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#161E33] shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-4">
          <h3 className="font-title text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Icon icon="solar:shield-warning-bold-duotone" className="text-brand-orange text-xl" />
            Qualification du Risque & Notes
          </h3>
          {isEditing && (
            <span className="text-xs font-semibold text-brand-orange bg-brand-orange/10 px-3 py-1 rounded-full border border-brand-orange/20 animate-pulse">
              Mode Édition Actif
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <PhoneInput
            label="Numéro de Téléphone Virtuel"
            disabled={!isEditing}
            value={formData.valeur}
            onChange={(val) => setFormData({ ...formData, valeur: val })}
            required
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Pays d'origine</label>
            <CountrySelect
              disabled={!isEditing}
              value={formData.countryCode}
              onChange={(val) => setFormData({ ...formData, countryCode: val })}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Opérateur Télécom</label>
            <select
              disabled={!isEditing}
              value={formData.operatorName}
              onChange={(e) => setFormData({ ...formData, operatorName: e.target.value })}
              className="h-11 px-4 rounded-xl border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-[#0F1626] text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:border-brand-green disabled:opacity-60 disabled:cursor-not-allowed font-body"
            >
              <option value="MTN">MTN</option>
              <option value="Orange">Orange</option>
              <option value="Airtel">Airtel</option>
              <option value="Moov">Moov</option>
              <option value="Wave">Wave</option>
            </select>
          </div>
          <Input
            label="Partenaire Affilié"
            disabled={!isEditing}
            value={formData.partenaire}
            onChange={(e) => setFormData({ ...formData, partenaire: e.target.value })}
            placeholder="Nom de l'entreprise..."
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Statut de Sécurité</label>
            <select
              disabled={!isEditing}
              value={formData.statut}
              onChange={(e) => setFormData({ ...formData, statut: e.target.value as NumberRiskStatus })}
              className="h-11 px-4 rounded-xl border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-[#0F1626] text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:border-brand-green disabled:opacity-60 disabled:cursor-not-allowed font-body"
            >
              <option value="Sécurisé">Sécurisé (Conforme)</option>
              <option value="À signaler">À signaler (Avertissement)</option>
              <option value="Frauduleux">Frauduleux (Bloqué)</option>
            </select>
          </div>

          <Input
            label="Score de risque (0 à 100)"
            type="number"
            min={0}
            max={100}
            disabled={!isEditing}
            value={formData.scoreRisque}
            onChange={(e) => setFormData({ ...formData, scoreRisque: Number(e.target.value) })}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Note d'analyse de l'expert</label>
          <textarea
            rows={3}
            disabled={!isEditing}
            value={formData.noteInvestigatrice}
            onChange={(e) => setFormData({ ...formData, noteInvestigatrice: e.target.value })}
            className="p-4 rounded-xl border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-[#0F1626] text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:border-brand-green disabled:opacity-60 disabled:cursor-not-allowed font-body resize-none"
          />
        </div>
      </div>

      {/* Unsaved Changes Confirmation Modal */}
      <ConfirmDialog
        isOpen={showUnsavedModal}
        onClose={handleConfirmDiscard}
        onConfirm={handleConfirmSaveAndLeave}
        title="Modifications non enregistrées"
        description="Vous avez modifié l'analyse de ce numéro. Voulez-vous enregistrer vos modifications avant de quitter ?"
        confirmLabel="Enregistrer et quitter"
        cancelLabel="Annuler les modifications"
        variant="warning"
      />
    </div>
  );
}
