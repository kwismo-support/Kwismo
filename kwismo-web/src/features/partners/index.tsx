import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api } from '@/shared/lib/api';
import type { PartnerDTO } from '@/shared/mock';
import { PageHeader, ConfirmDialog } from '@/shared/components';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/shared/ui/tabs';
import PartnersTable from './components/PartnersTable';
import PartnerForm from './components/PartnerForm';
import AffiliationRulesEditor from './components/AffiliationRulesEditor';
import PendingRequestsTable from './components/PendingRequestsTable';
import ValidatePartnerModal from './components/ValidatePartnerModal';
import { partnerRequestsStore, type PartnerRequestItem } from './services/partnerRequestsStore';
import { toast } from '@/shared/store/toastStore';

export default function PartnersPage() {
  const { t } = useTranslation('partner');
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'active' | 'pending'>('active');
  const [partners, setPartners] = useState<PartnerDTO[]>([]);
  const [requests, setRequests] = useState<PartnerRequestItem[]>(partnerRequestsStore.getRequests());
  const [selectedPartner, setSelectedPartner] = useState<PartnerDTO | null>(null);
  const [partnerToDelete, setPartnerToDelete] = useState<PartnerDTO | null>(null);
  const [selectedRequestToValidate, setSelectedRequestToValidate] = useState<PartnerRequestItem | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    api.getPartners()
      .then((data) => {
        if (mounted) setPartners(data);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    const unsubscribe = partnerRequestsStore.subscribe(() => {
      if (mounted) setRequests(partnerRequestsStore.getRequests());
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  const pendingCount = requests.filter((r) => r.statut === 'pending').length;

  const handleSavePartner = (partnerData: Partial<PartnerDTO>) => {
    if (selectedPartner) {
      setPartners((prev) =>
        prev.map((p) => (p.id === selectedPartner.id ? { ...p, ...partnerData } : p))
      );
    } else {
      const newPartner: PartnerDTO = {
        id: `part-${Date.now()}`,
        nomEntreprise: partnerData.nomEntreprise ?? '',
        typePartenariat: partnerData.typePartenariat ?? 'Opérateur',
        pays: partnerData.pays ?? 'Cameroun',
        statut: 'Actif',
        dateAdhesion: new Date().toISOString(),
        apiKeyCount: 1,
        webhookUrl: partnerData.webhookUrl,
        prefixes: [],
      };
      setPartners((prev) => [newPartner, ...prev]);
    }
  };

  const handleDeletePartner = () => {
    if (!partnerToDelete) return;
    setPartners((prev) => prev.filter((p) => p.id !== partnerToDelete.id));
    toast.success(`Le partenaire ${partnerToDelete.nomEntreprise} a été supprimé.`);
    setPartnerToDelete(null);
  };

  const handleConfirmValidateRequest = (
    requestId: string,
    emailConnexion: string,
    role: string,
  ) => {
    const updatedReq = partnerRequestsStore.validateRequest(requestId, emailConnexion, role);
    if (updatedReq) {
      const newPartner: PartnerDTO = {
        id: `part-${Date.now()}`,
        nomEntreprise: updatedReq.nomEntreprise,
        typePartenariat: updatedReq.typePartenariat.toLowerCase().includes('telco') || updatedReq.typePartenariat.toLowerCase() === 'mno'
          ? 'Opérateur'
          : updatedReq.typePartenariat.toLowerCase().includes('bank')
          ? 'Banque'
          : 'Fintech',
        pays: updatedReq.pays || 'Cameroun',
        statut: 'Actif',
        dateAdhesion: new Date().toISOString(),
        apiKeyCount: 2,
        webhookUrl: `https://api.${updatedReq.nomEntreprise.toLowerCase().replace(/[^a-z0-9]/g, '')}.cm/kwismo/webhook`,
        prefixes: [],
      };
      setPartners((prev) => [newPartner, ...prev]);
      toast.success(`Demande de ${updatedReq.nomEntreprise} validée avec succès ! Identifiants transmis à ${emailConnexion}`);
    }
  };

  const handleRejectRequest = (request: PartnerRequestItem) => {
    partnerRequestsStore.rejectRequest(request.id);
    toast.info(`La demande de ${request.nomEntreprise} a été rejetée.`);
  };

  return (
    <div className="flex flex-col gap-6 p-6 font-body">
      <PageHeader
        title={t('pageTitle', 'Gestion des Partenaires')}
        subtitle="Supervision des comptes entreprises, validation des demandes d'adhésion et configuration des règles d'affiliation."
        rolePerspective="PARTNER"
        showBreadcrumb={true}
        actions={[
          {
            label: 'Nouveau Partenaire',
            icon: 'solar:add-circle-bold',
            variant: 'primary',
            onClick: () => navigate('/app/partners/new'),
          },
        ]}
      />

      <Tabs defaultValue={activeTab} onValueChange={(val) => setActiveTab(val as 'active' | 'pending')} variant="segmented">
        <TabsList>
          <TabsTrigger value="active" icon="solar:buildings-bold" badge={partners.length}>
            Partenaires Actifs
          </TabsTrigger>
          <TabsTrigger value="pending" icon="solar:clock-circle-bold" badge={pendingCount}>
            Demandes en attente
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-6">
          <PartnersTable
            partners={partners}
            isLoading={loading}
            onEditPartner={(p) => navigate(`/app/partners/${p.id}`)}
            onAddPartner={() => {
              setSelectedPartner(null);
              setIsFormOpen(true);
            }}
            onDeletePartner={(p) => setPartnerToDelete(p)}
          />

          <AffiliationRulesEditor />
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
        title="Supprimer le partenaire ?"
        description={`Êtes-vous sûr de vouloir supprimer définitivement ${partnerToDelete?.nomEntreprise} ? Les clés API associées seront révoquées immédiatement.`}
        confirmLabel="Supprimer définitivement"
        variant="danger"
      />
    </div>
  );
}
