import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { PageHeader } from '@/shared/components';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { FormSkeleton } from '@/shared/ui/skeleton';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog';
import { toast } from '@/shared/store/toastStore';
import { api } from '@/shared/lib/api';
import type { CountryDTO, OperatorDTO } from '@/shared/mock';

export default function UssdDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [operator, setOperator] = useState<OperatorDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);

  // Form State
  const [initialData, setInitialData] = useState({
    nom: '',
    prefixes: '',
  });

  const [formData, setFormData] = useState({ ...initialData });

  useEffect(() => {
    let mounted = true;
    if (id) {
      api.getCountries()
        .then((countries: CountryDTO[]) => {
          if (!mounted) return;
          const allOps = countries.flatMap((c) => c.operateurs);
          const found = allOps.find((op) => String(op.id) === id) || allOps[0];
          if (found) {
            setOperator(found);
            const state = {
              nom: found.nom || '',
              prefixes: found.prefixes?.join(', ') || '',
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

  if (!operator) {
    return (
      <div className="p-6 font-body text-center py-12">
        <Icon icon="solar:global-bold-duotone" className="text-5xl text-slate-400 mx-auto mb-3" />
        <h3 className="font-title text-lg font-bold text-slate-900 dark:text-white">Opérateur introuvable</h3>
        <Button className="mt-4" variant="outline" onClick={() => navigate('/app/ussd')}>
          Retour à la liste
        </Button>
      </div>
    );
  }

  const isDirty = JSON.stringify(formData) !== JSON.stringify(initialData);

  const handleSave = () => {
    setOperator((prev) => prev ? { ...prev, nom: formData.nom, prefixes: formData.prefixes.split(',').map((p) => p.trim()) } : null);
    setInitialData({ ...formData });
    setIsEditing(false);
    toast.success('Opérateur USSD mis à jour avec succès !');
  };

  const handleBack = () => {
    if (isDirty) {
      setShowUnsavedModal(true);
    } else {
      navigate('/app/ussd');
    }
  };

  const handleConfirmDiscard = () => {
    setShowUnsavedModal(false);
    navigate('/app/ussd');
  };

  const handleConfirmSaveAndLeave = () => {
    handleSave();
    setShowUnsavedModal(false);
    navigate('/app/ussd');
  };

  return (
    <div className="flex flex-col gap-6 p-6 font-body max-w-6xl mx-auto">
      {/* Page Header */}
      <PageHeader
        title={`Configuration Opérateur — ${operator.nom}`}
        subtitle="Gestion des préfixes réseau et de la bibliothèque des actions USSD."
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

      {/* Main Form */}
      <div className="p-6 rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#161E33] shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-4">
          <h3 className="font-title text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Icon icon="solar:phone-calling-bold-duotone" className="text-brand-green text-xl" />
            Paramètres Réseau
          </h3>
          {isEditing && (
            <span className="text-xs font-semibold text-brand-orange bg-brand-orange/10 px-3 py-1 rounded-full border border-brand-orange/20 animate-pulse">
              Mode Édition Actif
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Input
            label="Nom de l'opérateur"
            disabled={!isEditing}
            value={formData.nom}
            onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
            required
          />
          <Input
            label="Préfixes attribués (séparés par des virgules)"
            disabled={!isEditing}
            value={formData.prefixes}
            onChange={(e) => setFormData({ ...formData, prefixes: e.target.value })}
          />
        </div>
      </div>

      {/* USSD Actions List */}
      <div className="p-6 rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#161E33] shadow-sm space-y-4">
        <h3 className="font-title text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Icon icon="solar:code-square-bold-duotone" className="text-brand-blue text-xl" />
          Actions USSD Définies ({operator.ussd?.length || 0})
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {operator.ussd?.map((u) => (
            <div key={u.id} className="p-4 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0F1626] flex items-center justify-between">
              <div>
                <p className="font-title text-xs font-bold text-slate-900 dark:text-white">{u.label}</p>
                <p className="font-mono text-xs text-brand-green font-bold mt-1">{u.code}</p>
              </div>
              <Button size="xs" variant="outline" onClick={() => toast.info(`Exécution USSD : ${u.code}`)}>
                Tester
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Unsaved Changes Confirmation Modal */}
      <ConfirmDialog
        isOpen={showUnsavedModal}
        onClose={handleConfirmDiscard}
        onConfirm={handleConfirmSaveAndLeave}
        title="Modifications non enregistrées"
        description="Vous avez modifié cet opérateur. Voulez-vous enregistrer vos modifications avant de quitter ?"
        confirmLabel="Enregistrer et quitter"
        cancelLabel="Annuler les modifications"
        variant="warning"
      />
    </div>
  );
}
