import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api } from '@/shared/lib/api';
import type { NumeroDTO } from '@/shared/mock';
import { PageHeader, ConfirmDialog } from '@/shared/components';
import NumbersTable from './components/NumbersTable';

export default function NumbersPage() {
  const { t } = useTranslation('admin');
  const navigate = useNavigate();
  const [numbers, setNumbers] = useState<NumeroDTO[]>([]);
  const [numberToDelete, setNumberToDelete] = useState<NumeroDTO | null>(null);
  const [numberToToggle, setNumberToToggle] = useState<NumeroDTO | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    api.getNumbers()
      .then((data) => {
        if (mounted) setNumbers(data);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => { mounted = false; };
  }, []);

  const handleDeleteConfirm = () => {
    if (!numberToDelete) return;
    setNumbers((prev) => prev.filter((n) => n.id !== numberToDelete.id));
    setNumberToDelete(null);
  };

  const handleToggleConfirm = () => {
    if (!numberToToggle) return;
    setNumbers((prev) =>
      prev.map((n) =>
        n.id === numberToToggle.id
          ? {
              ...n,
              statut: (n.statut === 'Sécurisé' ? 'Frauduleux' : 'Sécurisé') as any,
            }
          : n
      )
    );
    setNumberToToggle(null);
  };

  return (
    <div className="flex flex-col gap-6 p-6 font-body">
      <PageHeader
        title={t('numbers.title', 'Numéraux Virtuels')}
        subtitle="Gestion du pool de numéraux éphémères, détection de fraude et suivi de l'historique d'attribution."
        rolePerspective="ADMIN"
        showBreadcrumb={true}
        actions={[
          {
            label: 'Nouveau numéro',
            icon: 'solar:add-circle-bold',
            variant: 'primary',
            onClick: () => navigate('/app/numbers/new'),
          },
        ]}
      />

      <NumbersTable
        numbers={numbers}
        isLoading={loading}
        onSelectNumber={(num) => navigate(`/app/numbers/${num.id}`)}
        onDeleteNumber={(num) => setNumberToDelete(num)}
        onToggleStatus={(num) => setNumberToToggle(num)}
      />

      <ConfirmDialog
        isOpen={!!numberToDelete}
        onClose={() => setNumberToDelete(null)}
        onConfirm={handleDeleteConfirm}
        title="Supprimer ce numéro virtuel ?"
        description={`Êtes-vous sûr de vouloir supprimer définitivement le numéro ${numberToDelete?.valeur} ? Cette action est irréversible et libèrera le numéro du stock.`}
        confirmLabel="Supprimer définitivement"
        variant="danger"
      />

      <ConfirmDialog
        isOpen={!!numberToToggle}
        onClose={() => setNumberToToggle(null)}
        onConfirm={handleToggleConfirm}
        title="Changer le statut du numéro"
        description={`Voulez-vous modifier le statut du numéro ${numberToToggle?.valeur} ?`}
        confirmLabel="Confirmer la modification"
        variant="warning"
      />
    </div>
  );
}
