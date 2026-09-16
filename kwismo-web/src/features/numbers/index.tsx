import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { PageHeader, ConfirmDialog } from '@/shared/components';
import NumbersTable from './components/NumbersTable';
import { useNumbers } from './hooks/useNumbers';
import { usePermissions } from '@/shared/hooks/usePermissions';
import type { NumberItem } from './services/numbers.api';

export default function NumbersPage() {
  const { t } = useTranslation(['admin', 'common']);
  const navigate = useNavigate();
  const { hasPermission } = usePermissions();

  const {
    numbers,
    total,
    loading,
    page,
    setPage,
    pageSize,
    setPageSize,
    deleteNumber,
    updateStatus,
  } = useNumbers();

  const [numberToDelete, setNumberToDelete] = useState<NumberItem | null>(null);
  const [numberToToggle, setNumberToToggle] = useState<NumberItem | null>(null);

  const handleDeleteConfirm = async () => {
    if (!numberToDelete) return;
    await deleteNumber(numberToDelete.id);
    setNumberToDelete(null);
  };

  const handleToggleConfirm = async () => {
    if (!numberToToggle) return;
    const nextStatus = numberToToggle.statut === 'securise' ? 'frauduleux' : 'securise';
    await updateStatus(numberToToggle.id, nextStatus, true);
    setNumberToToggle(null);
  };

  return (
    <div className="flex flex-col gap-6 p-6 font-body">
      <PageHeader
        title={t('admin:numbers.title')}
        subtitle={t('admin:numbers.subtitle')}
        rolePerspective="ADMIN"
        showBreadcrumb={true}
        actions={
          hasPermission('numbers:create') || hasPermission('numbers:verify')
            ? [
                {
                  label: t('admin:numbers.newNumberButton'),
                  icon: 'solar:add-circle-bold',
                  variant: 'primary',
                  onClick: () => navigate('/app/numbers/new'),
                },
              ]
            : []
        }
      />

      <NumbersTable
        numbers={numbers}
        total={total}
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        isLoading={loading}
        onSelectNumber={(num) => navigate(`/app/numbers/${num.id}`)}
        onDeleteNumber={(num) => setNumberToDelete(num)}
        onToggleStatus={(num) => setNumberToToggle(num)}
      />

      <ConfirmDialog
        isOpen={!!numberToDelete}
        onClose={() => setNumberToDelete(null)}
        onConfirm={handleDeleteConfirm}
        title={t('admin:numbers.deleteConfirmTitle')}
        description={`${t('admin:numbers.deleteConfirmDesc')} ${numberToDelete?.valeur} ?`}
        confirmLabel={t('common:actions.delete')}
        variant="danger"
      />

      <ConfirmDialog
        isOpen={!!numberToToggle}
        onClose={() => setNumberToToggle(null)}
        onConfirm={handleToggleConfirm}
        title={t('admin:numbers.toggleConfirmTitle')}
        description={`${t('admin:numbers.toggleConfirmDesc')} ${numberToToggle?.valeur} ?`}
        confirmLabel={t('common:actions.confirm')}
        variant="warning"
      />
    </div>
  );
}
