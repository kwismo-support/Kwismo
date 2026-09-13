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
import type { PartnerDTO, PartnerType, PartnerStatus } from '@/shared/mock';

export default function PartnerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [partner, setPartner] = useState<PartnerDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);

  // Form State
  const [initialData, setInitialData] = useState({
    nomEntreprise: '',
    typePartenariat: 'Opérateur' as PartnerType,
    pays: 'Cameroun',
    statut: 'Actif' as PartnerStatus,
    contact: '',
    email: '',
    phone: '',
    webhookUrl: '',
  });

  const [formData, setFormData] = useState({ ...initialData });

  useEffect(() => {
    let mounted = true;
    if (id === 'new') {
      const newPartnerObj: PartnerDTO = {
        id: 'new',
        nomEntreprise: 'Nouveau Partenaire',
        typePartenariat: 'Opérateur',
        pays: 'Cameroun',
        statut: 'Actif',
        contact: '',
        email: '',
        phone: '',
        prefixes: ['237'],
        dateAdhesion: new Date().toISOString(),
        numerosSurveilles: 0,
        apiKeyCount: 1,
      };
      setPartner(newPartnerObj);
      setIsEditing(true);
      const emptyState = {
        nomEntreprise: '',
        typePartenariat: 'Opérateur' as PartnerType,
        pays: 'Cameroun',
        statut: 'Actif' as PartnerStatus,
        contact: '',
        email: '',
        phone: '',
        webhookUrl: '',
      };
      setInitialData(emptyState);
      setFormData(emptyState);
      setLoading(false);
      return;
    }

    if (id) {
      api.getPartners()
        .then((data) => {
          if (!mounted) return;
          const found = data.find((p: PartnerDTO) => String(p.id) === id);
          if (found) {
            setPartner(found);
            const state = {
              nomEntreprise: found.nomEntreprise || '',
              typePartenariat: found.typePartenariat || 'Opérateur',
              pays: found.pays || 'Cameroun',
              statut: found.statut || 'Actif',
              contact: found.contact || '',
              email: found.email || '',
              phone: found.phone || '',
              webhookUrl: found.webhookUrl || '',
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

  if (!partner) {
    return (
      <div className="p-6 font-body text-center py-12">
        <Icon icon="solar:buildings-bold-duotone" className="text-5xl text-slate-400 mx-auto mb-3" />
        <h3 className="font-title text-lg font-bold text-slate-900 dark:text-white">Partenaire introuvable</h3>
        <Button className="mt-4" variant="outline" onClick={() => navigate('/app/partners')}>
          Retour aux partenaires
        </Button>
      </div>
    );
  }

  const isDirty = JSON.stringify(formData) !== JSON.stringify(initialData);

  const handleSave = () => {
    setPartner((prev) => prev ? { ...prev, ...formData } : null);
    setInitialData({ ...formData });
    setIsEditing(false);
    toast.success('Informations du partenaire mises à jour avec succès !');
  };

  const handleBack = () => {
    if (isDirty) {
      setShowUnsavedModal(true);
    } else {
      navigate('/app/partners');
    }
  };

  const handleConfirmDiscard = () => {
    setShowUnsavedModal(false);
    navigate('/app/partners');
  };

  const handleConfirmSaveAndLeave = () => {
    handleSave();
    setShowUnsavedModal(false);
    navigate('/app/partners');
  };

  return (
    <div className="flex flex-col gap-6 p-6 font-body max-w-6xl mx-auto">
      {/* Page Header */}
      <PageHeader
        title={`Fiche Partenaire — ${partner.nomEntreprise}`}
        subtitle="Gestion institutionnelle, clés d'API, webhooks et suivi des numéros surveillés."
        showBreadcrumb={false}
        showBack={true}
        onBack={handleBack}
        actions={[
          !isEditing ? {
            label: 'Éditer',
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

      {/* Main Banner */}
      <div className="p-6 rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#161E33] shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-orange/10 text-brand-orange font-title font-bold text-2xl border border-brand-orange/20">
            {partner.nomEntreprise.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="font-title text-xl font-bold text-slate-900 dark:text-white">
                {partner.nomEntreprise}
              </h2>
              <StatusBadge status={partner.typePartenariat} size="sm" />
              <StatusBadge status={partner.statut} size="sm" />
            </div>
            <p className="text-xs font-mono text-slate-500 mt-1">Pays : {partner.pays}</p>
            <p className="text-xs text-slate-400 mt-0.5">Membre depuis le {new Date(partner.dateAdhesion).toLocaleDateString('fr-FR')}</p>
          </div>
        </div>

        <div className="flex items-center gap-6 bg-slate-50 dark:bg-[#0F1626] p-4 rounded-2xl border border-slate-200 dark:border-white/10">
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400">Numéros surveillés</p>
            <p className="font-title text-lg font-bold text-slate-900 dark:text-white">
              {partner.numerosSurveilles?.toLocaleString('fr-FR') || '0'}
            </p>
          </div>
          <div className="h-8 w-px bg-slate-200 dark:bg-white/10" />
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400">Clés API actives</p>
            <p className="font-title text-lg font-bold text-slate-900 dark:text-white">
              {partner.apiKeyCount || 1}
            </p>
          </div>
        </div>
      </div>

      {/* Main Details Form */}
      <div className="p-6 rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#161E33] shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-4">
          <h3 className="font-title text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Icon icon="solar:buildings-bold-duotone" className="text-brand-orange text-xl" />
            Fiche Institutionnelle & Contact
          </h3>
          {isEditing && (
            <span className="text-xs font-semibold text-brand-orange bg-brand-orange/10 px-3 py-1 rounded-full border border-brand-orange/20 animate-pulse">
              Mode Édition Actif
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <Input
            label="Nom de l'entreprise"
            disabled={!isEditing}
            value={formData.nomEntreprise}
            onChange={(e) => setFormData({ ...formData, nomEntreprise: e.target.value })}
            required
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Pays d'origine</label>
            <CountrySelect
              disabled={!isEditing}
              value={formData.pays}
              onChange={(val) => setFormData({ ...formData, pays: val })}
            />
          </div>
          <Input
            label="Nom du contact principal"
            disabled={!isEditing}
            value={formData.contact}
            onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
          />
          <Input
            label="Email officiel"
            type="email"
            disabled={!isEditing}
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
          <PhoneInput
            label="Téléphone professionnel"
            disabled={!isEditing}
            value={formData.phone}
            onChange={(val) => setFormData({ ...formData, phone: val })}
          />
          <Input
            label="URL Webhook Alerte"
            disabled={!isEditing}
            value={formData.webhookUrl}
            onChange={(e) => setFormData({ ...formData, webhookUrl: e.target.value })}
            placeholder="https://api.partner.com/kwismo/webhook"
          />
        </div>
      </div>

      {/* API Key Management Section */}
      <div className="p-6 rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#161E33] shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-4">
          <h3 className="font-title text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Icon icon="solar:key-minimalistic-square-bold-duotone" className="text-brand-green text-xl" />
            Gestion des Clés API (Production)
          </h3>
          <Button size="xs" variant="primary" leftIcon="solar:add-circle-bold" onClick={() => toast.info('Nouvelle clé API générée')}>
            Générer une clé
          </Button>
        </div>

        <div className="space-y-3">
          <div className="p-4 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0F1626] flex items-center justify-between flex-wrap gap-3">
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white font-mono">kw_live_9f830a11bc0294e773a21</p>
              <p className="text-[10px] text-slate-500">Créée le 15/01/2023 — Accès complet en lecture/écriture</p>
            </div>
            <div className="flex items-center gap-2">
              <Button size="xs" variant="outline" leftIcon="solar:copy-bold" onClick={() => toast.success('Clé copiée')}>
                Copier
              </Button>
              <Button size="xs" variant="outline" className="text-red-500 border-red-200 hover:bg-red-50" onClick={() => toast.warning('Clé révoquée')}>
                Révoquer
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Unsaved Changes Confirmation Modal */}
      <ConfirmDialog
        isOpen={showUnsavedModal}
        onClose={handleConfirmDiscard}
        onConfirm={handleConfirmSaveAndLeave}
        title="Modifications non enregistrées"
        description="Vous avez modifié des informations sur cette fiche partenaire. Voulez-vous enregistrer vos modifications avant de quitter ?"
        confirmLabel="Enregistrer et quitter"
        cancelLabel="Annuler les modifications"
        variant="warning"
      />
    </div>
  );
}
