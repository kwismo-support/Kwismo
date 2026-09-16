import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { PageHeader, ConfirmDialog } from '@/shared/components';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/shared/ui/tabs';
import PartnersTable from './components/PartnersTable';
import PartnerForm from './components/PartnerForm';
import PendingRequestsTable from './components/PendingRequestsTable';
import ValidatePartnerModal from './components/ValidatePartnerModal';
import { usePartners } from './hooks/usePartners';
import { usePermissions } from '@/shared/hooks/usePermissions';
import { partnerRequestsStore, type PartnerRequestItem } from './services/partnerRequestsStore';
import { toast } from '@/shared/store/toastStore';
import type { PartnerItem } from './services/partners.api';

export default function PartnersPage() {
  const { t } = useTranslation(['admin', 'common']);
  const navigate = useNavigate();
  const { hasPermission } = usePermissions();
  const [activeTab, setActiveTab] = useState<'active' | 'pending'>('active');

  const {
    partners,
    total,
    loading,
    page,
    setPage,
    pageSize,
    setPageSize,
    createPartner,
    deletePartner,
  } = usePartners();

  const [requests, setRequests] = useState<PartnerRequestItem[]>(partnerRequestsStore.getRequests());
  const [selectedPartner, setSelectedPartner] = useState<PartnerItem | null>(null);
  const [partnerToDelete, setPartnerToDelete] = useState<PartnerItem | null>(null);
  const [selectedRequestToValidate, setSelectedRequestToValidate] = useState<PartnerRequestItem | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  useEffect(() => {
    let mounted = true;
    const unsubscribe = partnerRequestsStore.subscribe(() => {
      if (mounted) setRequests(partnerRequestsStore.getRequests());
    });
    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  const pendingCount = requests.filter((r) => r.statut === 'pending').length;

  const handleSavePartner = async (partnerData: { nom_entreprise: string; type_partenariat: string }) => {
    await createPartner(partnerData);
    setIsFormOpen(false);
  };

  const handleDeletePartner = async () => {
    if (!partnerToDelete) return;
    await deletePartner(partnerToDelete.id);
    setPartnerToDelete(null);
  };

  const handleConfirmValidateRequest = (
    requestId: string,
    emailConnexion: string,
    role: string
  ) => {
    const updatedReq = partnerRequestsStore.validateRequest(requestId, emailConnexion, role);
    if (updatedReq) {
      createPartner({
        nom_entreprise: updatedReq.nomEntreprise,
        type_partenariat: updatedReq.typePartenariat.toLowerCase().includes('telco') ? 'operateur' : 'banque',
      });
      toast.success(t('partners.toasts.requestValidated'));
    }
  };

  const handleRejectRequest = (request: PartnerRequestItem) => {
    partnerRequestsStore.rejectRequest(request.id);
    toast.info(t('partners.toasts.requestRejected'));
  };

  return (
    <div className="flex flex-col gap-6 p-6 font-body">
      <PageHeader
        title={t('admin:partners.title')}
        subtitle={t('admin:partners.subtitle')}
        rolePerspective="ADMIN"
        showBreadcrumb={true}
        actions={
          hasPermission('partners:create')
            ? [
                {
                  label: t('admin:partners.newPartnerButton'),
                  icon: 'solar:add-circle-bold',
                  variant: 'primary',
                  onClick: () => navigate('/app/partners/new'),
                },
              ]
            : []
        }
      />

      <Tabs defaultValue={activeTab} onValueChange={(val) => setActiveTab(val as 'active' | 'pending')} variant="segmented">
        <TabsList>
          <TabsTrigger value="active" icon="solar:buildings-bold" badge={total}>
            {t('admin:partners.tabs.active')}
          </TabsTrigger>
          <TabsTrigger value="pending" icon="solar:clock-circle-bold" badge={pendingCount}>
            {t('admin:partners.tabs.pending')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-6">
          <PartnersTable
            partners={partners}
            total={total}
            page={page}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
            isLoading={loading}
            onEditPartner={(p) => navigate(`/app/partners/${p.id}`)}
            onAddPartner={() => {
              setSelectedPartner(null);
              setIsFormOpen(true);
            }}
            onDeletePartner={(p) => setPartnerToDelete(p)}
          />
        </TabsContent>

        <TabsContent value="pending">
          <PendingRequestsTable
            requests={requests}
            onValidate={(req) => setSelectedRequestToValidate(req)}
            onReject={handleRejectRequest}
          />
        </TabsContent>
      </Tabs>

      <PartnerForm
        partner={selectedPartner}
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleSavePartner}
      />

      <ValidatePartnerModal
        request={selectedRequestToValidate}
        isOpen={!!selectedRequestToValidate}
        onClose={() => setSelectedRequestToValidate(null)}
        onConfirmValidate={handleConfirmValidateRequest}
      />

      <ConfirmDialog
        isOpen={!!partnerToDelete}
        onClose={() => setPartnerToDelete(null)}
        onConfirm={handleDeletePartner}
        title={t('admin:partners.deleteConfirmTitle')}
        description={`${t('admin:partners.deleteConfirmDesc')} ${partnerToDelete?.nom_entreprise} ?`}
        confirmLabel={t('common:actions.delete')}
        variant="danger"
      />
    </div>
  );
}
